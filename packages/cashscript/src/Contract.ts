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
import { Argument, encodeArgument } from './Argument.js';
import {
  Unlocker, ContractOptions, GenerateUnlockingBytecodeOptions, Utxo,
} from './interfaces.js';
import NetworkProvider from './network/NetworkProvider.js';
import {
  addressToLockScript, createInputScript, createSighashPreimage, scriptToAddress,
} from './utils.js';
import SignatureTemplate from './SignatureTemplate.js';
import { ElectrumNetworkProvider } from './network/index.js';

/**
 * Merge intersection type
 * {foo: "foo"} & {bar: "bar"} will become {foo: "foo", bar: "bar"}
 */
type Prettify<T> = { [K in keyof T]: T[K] } & {};

type TypeMap = {
  bool: boolean;
  int: bigint;
  string: string;
  bytes: Uint8Array;
  bytes4: Uint8Array;
  bytes32: Uint8Array;
  bytes64: Uint8Array;
  bytes1: Uint8Array;
  // TODO: use proper value for types below
  pubkey: Uint8Array;
  sig: Uint8Array;
  datasig: Uint8Array;
};

/**
 * Artifact format to tuple
 * T = {name: string, type: keyof TypeMap}[]
 * output = [ValueOfTypeMap, ...]
 */
type GetTypeAsTuple<T> = T extends readonly [infer A, ...infer O]
  ? A extends { type: infer Type }
    ? Type extends keyof TypeMap
      ? [TypeMap[Type], ...GetTypeAsTuple<O>]
      : [any, ...GetTypeAsTuple<O>]
    : [any, ...GetTypeAsTuple<O>]
  : T extends []
  ? []
  : any[];

/**
 * Iterate to each function in artifact.abi
 * then use GetTypeAsTuple passing the artifact.abi[number].inputs
 * 
 * T = {name: string, inputs: {name: string, type: keyof TypeMap}[] }[]
 * Output = {[NameOfTheFunction]: GetTypeAsTuple}
 * 
 */
type _InferContractFunction<T> = T extends { length: infer L }
  ? L extends number
    ? T extends readonly [infer A, ...infer O]
      ? A extends { name: string; inputs: readonly any[] }
        ? {
            [k in A['name']]: GetTypeAsTuple<A['inputs']>;
          } & _InferContractFunction<O>
        : {} & _InferContractFunction<O>
      : T extends []
      ? {}
      : { [k: string]: any[] }
    : { [k: string]: any[] }
  : never;
type InferContractFunction<T> = Prettify<_InferContractFunction<T>>;

type KeyArgsToFunction<T extends Record<string, any[]>, ReturnVal> = {
  [K in keyof T]: (...p: T[K]) => ReturnVal
}

export class Contract<
  const TArtifact extends Artifact = Artifact,
  TContractType extends { constructorArgs: (TypeMap[keyof TypeMap])[], functions: Record<string, any> }
    = { constructorArgs: GetTypeAsTuple<TArtifact["constructorInputs"]>, functions: InferContractFunction<TArtifact["abi"]> },
  TFunctions extends Record<string, () => Transaction> = KeyArgsToFunction<TContractType["functions"], Transaction>,
  TUnlock extends Record<string, () => Unlocker> = KeyArgsToFunction<TContractType["functions"], Unlocker>,
  > {
  name: string;
  address: string;
  tokenAddress: string;
  bytecode: string;
  bytesize: number;
  opcount: number;

  functions: TFunctions;
  unlock: TUnlock;

  redeemScript: Script;
  provider: NetworkProvider;
  private addressType: 'p2sh20' | 'p2sh32';

  constructor(
    private artifact: TArtifact,
    constructorArgs: TContractType["constructorArgs"],
    private options?: ContractOptions,
  ) {
    this.provider = this.options?.provider ?? new ElectrumNetworkProvider();
    this.addressType = this.options?.addressType ?? 'p2sh32';

    const expectedProperties = ['abi', 'bytecode', 'constructorInputs', 'contractName'];
    if (!expectedProperties.every((property) => property in artifact)) {
      throw new Error('Invalid or incomplete artifact provided');
    }

    if (artifact.constructorInputs.length !== constructorArgs.length) {
      throw new Error(`Incorrect number of arguments passed to ${artifact.contractName} constructor`);
    }

    // Encode arguments (this also performs type checking)
    const encodedArgs = constructorArgs
      .map((arg, i) => encodeArgument(arg, artifact.constructorInputs[i].type))
      .reverse();

    // Check there's no signature templates in the constructor
    if (encodedArgs.some((arg) => arg instanceof SignatureTemplate)) {
      throw new Error('Cannot use signatures in constructor');
    }

    this.redeemScript = generateRedeemScript(
      asmToScript(this.artifact.bytecode),
      encodedArgs as Uint8Array[],
    );

    // Populate the functions object with the contract's functions
    // (with a special case for single function, which has no "function selector")
    this.functions = {} as TFunctions;
    if (artifact.abi.length === 1) {
      const f = artifact.abi[0];
      // @ts-ignore generic and can only be indexed for reading
      this.functions[f.name] = this.createFunction(f);
    } else {
      artifact.abi.forEach((f, i) => {
        // @ts-ignore generic and can only be indexed for reading
        this.functions[f.name] = this.createFunction(f, i);
      });
    }

    // Populate the functions object with the contract's functions
    // (with a special case for single function, which has no "function selector")
    this.unlock = {} as TUnlock;
    if (artifact.abi.length === 1) {
      const f = artifact.abi[0];
      // @ts-ignore generic and can only be indexed for reading
      this.unlock[f.name] = this.createUnlocker(f);
    } else {
      artifact.abi.forEach((f, i) => {
      // @ts-ignore generic and can only be indexed for reading
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
    return (...args: Argument[]) => {
      if (abiFunction.inputs.length !== args.length) {
        throw new Error(`Incorrect number of arguments passed to function ${abiFunction.name}`);
      }

      // Encode passed args (this also performs type checking)
      const encodedArgs = args
        .map((arg, i) => encodeArgument(arg, abiFunction.inputs[i].type));

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
    return (...args: Argument[]) => {
      const bytecode = scriptToBytecode(this.redeemScript);

      const encodedArgs = args
        .map((arg, i) => encodeArgument(arg, abiFunction.inputs[i].type));

      const generateUnlockingBytecode = (
        { transaction, sourceOutputs, inputIndex }: GenerateUnlockingBytecodeOptions,
      ): Uint8Array => {
        // TODO: Remove old-style covenant code for v1.0 release
        let covenantHashType = -1;
        const completeArgs = encodedArgs.map((arg) => {
          if (!(arg instanceof SignatureTemplate)) return arg;

          // First signature is used for sighash preimage (maybe not the best way)
          if (covenantHashType < 0) covenantHashType = arg.getHashType();

          const preimage = createSighashPreimage(transaction, sourceOutputs, inputIndex, bytecode, arg.getHashType());
          const sighash = hash256(preimage);

          return arg.generateSignature(sighash);
        });

        const preimage = abiFunction.covenant
          ? createSighashPreimage(transaction, sourceOutputs, inputIndex, bytecode, covenantHashType)
          : undefined;

        const unlockingBytecode = createInputScript(
          this.redeemScript, completeArgs, selector, preimage,
        );

        return unlockingBytecode;
      };

      const generateLockingBytecode = (): Uint8Array => addressToLockScript(this.address);

      return { generateUnlockingBytecode, generateLockingBytecode };
    };
  }
}

export type ContractFunction = (...args: Argument[]) => Transaction;
export type ContractUnlocker = (...args: Argument[]) => Unlocker;
