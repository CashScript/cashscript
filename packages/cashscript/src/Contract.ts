import { binToHex } from '@bitauth/libauth';
import {
  AbiFunction,
  Artifact,
  asmToScript,
  calculateBytesize,
  countOpcodes,
  generateRedeemScript,
  hash256,
  Script,
  scriptToBytecode,
} from '@cashscript/utils';
import { Transaction } from './Transaction.js';
import {
  ConstructorArgument, encodeFunctionArgument, encodeConstructorArguments, encodeFunctionArguments, FunctionArgument,
} from './Argument.js';
import {
  Unlocker, ContractOptions, GenerateUnlockingBytecodeOptions, Utxo,
  AddressType,
} from './interfaces.js';
import NetworkProvider from './network/NetworkProvider.js';
import {
  addressToLockScript, createInputScript, createSighashPreimage, scriptToAddress,
} from './utils.js';
import SignatureTemplate from './SignatureTemplate.js';
import { ElectrumNetworkProvider } from './network/index.js';
import { ParamsToTuple, AbiToFunctionMap } from './types/type-inference.js';
import semver from 'semver';

export class Contract<
  TArtifact extends Artifact = Artifact,
  TResolved extends {
    constructorInputs: ConstructorArgument[];
    functions: Record<string, any>;
    unlock: Record<string, any>;
  }
  = {
    constructorInputs: ParamsToTuple<TArtifact['constructorInputs']>;
    functions: AbiToFunctionMap<TArtifact['abi'], Transaction>;
    unlock: AbiToFunctionMap<TArtifact['abi'], Unlocker>;
  },
> {
  name: string;
  address: string;
  tokenAddress: string;
  bytecode: string;
  bytesize: number;
  opcount: number;

  functions: TResolved['functions'];
  unlock: TResolved['unlock'];

  redeemScript: Script;
  public provider: NetworkProvider;
  public addressType: AddressType;
  public encodedConstructorArgs: Uint8Array[];

  constructor(
    public artifact: TArtifact,
    constructorArgs: TResolved['constructorInputs'],
    private options?: ContractOptions,
  ) {
    this.provider = this.options?.provider ?? new ElectrumNetworkProvider();
    this.addressType = this.options?.addressType ?? 'p2sh32';

    const expectedProperties = ['abi', 'bytecode', 'constructorInputs', 'contractName', 'compiler'];
    if (!expectedProperties.every((property) => property in artifact)) {
      throw new Error('Invalid or incomplete artifact provided');
    }

    if (!semver.satisfies(artifact.compiler.version, '>=0.7.0', { includePrerelease: true })) {
      throw new Error(`Artifact compiled with unsupported compiler version: ${artifact.compiler.version}, required >=0.7.0`);
    }

    if (artifact.constructorInputs.length !== constructorArgs.length) {
      throw new Error(`Incorrect number of arguments passed to ${artifact.contractName} constructor. Expected ${artifact.constructorInputs.length} arguments (${artifact.constructorInputs.map((input) => input.type)}) but got ${constructorArgs.length}`);
    }

    // Encode arguments (this also performs type checking)
    this.encodedConstructorArgs = encodeConstructorArguments(artifact, constructorArgs);

    this.redeemScript = generateRedeemScript(asmToScript(this.artifact.bytecode), this.encodedConstructorArgs);

    // Populate the functions object with the contract's functions
    // (with a special case for single function, which has no "function selector")
    this.functions = {};
    if (artifact.abi.length === 1) {
      const f = artifact.abi[0];
      // @ts-ignore TODO: see if we can use generics to make TypeScript happy
      this.functions[f.name] = this.createFunction(f);
    } else {
      artifact.abi.forEach((f, i) => {
        // @ts-ignore TODO: see if we can use generics to make TypeScript happy
        this.functions[f.name] = this.createFunction(f, i);
      });
    }

    // Populate the functions object with the contract's functions
    // (with a special case for single function, which has no "function selector")
    this.unlock = {};
    if (artifact.abi.length === 1) {
      const f = artifact.abi[0];
      // @ts-ignore TODO: see if we can use generics to make TypeScript happy
      this.unlock[f.name] = this.createUnlocker(f);
    } else {
      artifact.abi.forEach((f, i) => {
        // @ts-ignore TODO: see if we can use generics to make TypeScript happy
        this.unlock[f.name] = this.createUnlocker(f, i);
      });
    }

    this.name = artifact.contractName;
    this.address = scriptToAddress(this.redeemScript, this.provider.network, this.addressType, false);
    this.tokenAddress = scriptToAddress(this.redeemScript, this.provider.network, this.addressType, true);
    this.bytecode = binToHex(scriptToBytecode(this.redeemScript));
    this.bytesize = calculateBytesize(this.redeemScript);
    this.opcount = countOpcodes(this.redeemScript);
  }

  async getBalance(): Promise<bigint> {
    const utxos = await this.getUtxos();
    return utxos.reduce((acc, utxo) => acc + utxo.satoshis, 0n);
  }

  async getUtxos(): Promise<Utxo[]> {
    return this.provider.getUtxos(this.address);
  }

  private createFunction(abiFunction: AbiFunction, selector?: number): ContractFunction {
    return (...args: FunctionArgument[]) => {
      if (abiFunction.inputs.length !== args.length) {
        throw new Error(`Incorrect number of arguments passed to function ${abiFunction.name}. Expected ${abiFunction.inputs.length} arguments (${abiFunction.inputs.map((input) => input.type)}) but got ${args.length}`);
      }

      // Encode passed args (this also performs type checking)
      const encodedArgs = encodeFunctionArguments(abiFunction, args);

      const unlocker = this.createUnlocker(abiFunction, selector)(...args);

      return new Transaction(
        this,
        unlocker,
        abiFunction,
        encodedArgs,
        selector,
      );
    };
  }

  private createUnlocker(abiFunction: AbiFunction, selector?: number): ContractUnlocker {
    return (...args: FunctionArgument[]) => {
      if (abiFunction.inputs.length !== args.length) {
        throw new Error(`Incorrect number of arguments passed to function ${abiFunction.name}. Expected ${abiFunction.inputs.length} arguments (${abiFunction.inputs.map((input) => input.type)}) but got ${args.length}`);
      }

      const bytecode = scriptToBytecode(this.redeemScript);

      const encodedArgs = args
        .map((arg, i) => encodeFunctionArgument(arg, abiFunction.inputs[i].type));

      const generateUnlockingBytecode = (
        { transaction, sourceOutputs, inputIndex }: GenerateUnlockingBytecodeOptions,
      ): Uint8Array => {
        const completeArgs = encodedArgs.map((arg) => {
          if (!(arg instanceof SignatureTemplate)) return arg;

          // Generate transaction signature from SignatureTemplate
          const preimage = createSighashPreimage(transaction, sourceOutputs, inputIndex, bytecode, arg.getHashType());
          const sighash = hash256(preimage);
          return arg.generateSignature(sighash);
        });

        const unlockingBytecode = createInputScript(this.redeemScript, completeArgs, selector);
        return unlockingBytecode;
      };

      const generateLockingBytecode = (): Uint8Array => addressToLockScript(this.address);

      return { generateUnlockingBytecode, generateLockingBytecode, contract: this, params: args, abiFunction };
    };
  }
}

export type ContractFunction = (...args: FunctionArgument[]) => Transaction;
export type ContractUnlocker = (...args: FunctionArgument[]) => Unlocker;
