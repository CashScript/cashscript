import { binToHex, hexToBin } from '@bitauth/libauth';
import {
  AbiFunction,
  Artifact,
  asmToScript,
  calculateBytesize,
  countOpcodes,
  generateContractBytecodeScript,
  hash256,
  scriptToBytecode,
} from '@cashscript/utils';
import {
  ConstructorArgument, encodeFunctionArgument, encodeConstructorArguments, FunctionArgument,
} from './Argument.js';
import {
  Unlocker, ContractOptions, GenerateUnlockingBytecodeOptions, Utxo, ContractType, ContractFunctionUnlocker,
} from './interfaces.js';
import NetworkProvider from './network/NetworkProvider.js';
import {
  addressToLockScript, createUnlockingBytecode, createSighashPreimage, scriptToAddress,
} from './utils.js';
import SignatureTemplate from './SignatureTemplate.js';
import { ParamsToTuple, AbiToFunctionMap } from './types/type-inference.js';
import semver from 'semver';

type ResolvedConstraint = {
  constructorInputs: ConstructorArgument[];
  unlock: Record<string, any>;
};

type DefaultResolved<TArtifact extends Artifact> = {
  constructorInputs: ParamsToTuple<TArtifact['constructorInputs']>;
  unlock: AbiToFunctionMap<TArtifact['abi'], Unlocker>;
};

class ContractInternal<
  TArtifact extends Artifact,
  TResolved extends ResolvedConstraint,
  TContractType extends ContractType,
> {
  name: string;
  address: string;
  tokenAddress: string;
  lockingBytecode: string;
  bytecode: string;
  bytesize: number;
  opcount: number;
  unlock: TResolved['unlock'];
  provider: NetworkProvider;
  contractType: TContractType;

  encodedConstructorArgs: Uint8Array[];

  constructor(
    public artifact: TArtifact,
    constructorArgs: TResolved['constructorInputs'],
    private options: ContractOptions<TContractType>,
  ) {
    this.provider = this.options.provider;

    // Note: technically, it is possible to instantiate a Contract like this, which breaks the type safety,
    // but it seems unreasonable for anyone to do this
    // new Contract<any, any, 'p2s'>(artifact), [], { provider })
    this.contractType = this.options.contractType ?? 'p2sh32' as TContractType;

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

    // Populate the 'unlock' object with the contract's functions
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

    const contractBytecodeScript = generateContractBytecodeScript(
      asmToScript(this.artifact.bytecode), this.encodedConstructorArgs,
    );

    if (this.contractType !== 'p2s') {
      this.address = scriptToAddress(contractBytecodeScript, this.provider.network, this.contractType, false);
      this.tokenAddress = scriptToAddress(contractBytecodeScript, this.provider.network, this.contractType, true);
    }

    this.name = artifact.contractName;
    this.bytecode = binToHex(scriptToBytecode(contractBytecodeScript));
    this.lockingBytecode = this.contractType === 'p2s' ? this.bytecode : binToHex(addressToLockScript(this.address));
    this.bytesize = calculateBytesize(contractBytecodeScript);
    this.opcount = countOpcodes(contractBytecodeScript);
  }

  async getBalance(): Promise<bigint> {
    const utxos = await this.getUtxos();
    return utxos.reduce((acc, utxo) => acc + utxo.satoshis, 0n);
  }

  async getUtxos(): Promise<Utxo[]> {
    if (this.contractType === 'p2s') {
      return this.provider.getUtxosForLockingBytecode(this.bytecode);
    }

    return this.provider.getUtxos(this.address);
  }

  private createUnlocker(abiFunction: AbiFunction, selector?: number): ContractFunctionUnlocker {
    return (...args: FunctionArgument[]) => {
      if (abiFunction.inputs.length !== args.length) {
        throw new Error(`Incorrect number of arguments passed to function ${abiFunction.name}. Expected ${abiFunction.inputs.length} arguments (${abiFunction.inputs.map((input) => input.type)}) but got ${args.length}`);
      }

      const bytecode = hexToBin(this.bytecode);

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

        const unlockingBytecode = createUnlockingBytecode(
          this.contractType, hexToBin(this.bytecode), completeArgs, selector,
        );
        return unlockingBytecode;
      };

      const generateLockingBytecode = (): Uint8Array => addressToLockScript(this.address);

      return { generateUnlockingBytecode, generateLockingBytecode, contract: this, params: args, abiFunction };
    };
  }
}

// The public Contract type conditionally removes address/tokenAddress for p2s contracts.
// For 'p2sh20' and 'p2sh32', the full ContractInternal type (with address & tokenAddress) is exposed.
// For 'p2s', these properties are Omit'd so they are truly inaccessible at the type level.
export type Contract<
  TArtifact extends Artifact = Artifact,
  TResolved extends ResolvedConstraint = DefaultResolved<TArtifact>,
  // The default of the Contract type is unspecified
  TContractType extends ContractType = ContractType,
// We opt out of the distributive conditional type behavior so users of generic 'Contract' types can access
// 'address' and 'tokenAddress' (even if they are not 'p2s')
> = [TContractType] extends ['p2s']
  ? Omit<ContractInternal<TArtifact, TResolved, TContractType>, 'address' | 'tokenAddress'>
  : ContractInternal<TArtifact, TResolved, TContractType>;

// In order to export the Contract type as a value (constructor), we need to define a type for the
// constructor that returns a Contract type, rather than a ContractInternal type.
interface ContractConstructor {
  new <
    TArtifact extends Artifact = Artifact,
    TResolved extends ResolvedConstraint = DefaultResolved<TArtifact>,
    // The default of an instantiated Contract without passing a contractType is 'p2sh32'
    TContractType extends ContractType = 'p2sh32',
  >(
    artifact: TArtifact,
    constructorArgs: TResolved['constructorInputs'],
    options: ContractOptions<TContractType>,
  ): Contract<TArtifact, TResolved, TContractType>;
}

export const Contract = ContractInternal as ContractConstructor;
