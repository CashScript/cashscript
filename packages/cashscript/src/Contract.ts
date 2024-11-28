/* eslint-disable */
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

type TypeMap = {
  [k: `bytes${number}`]: Uint8Array | string; // Matches any "bytes<number>" pattern
} & {
  byte: Uint8Array | string;
  bytes: Uint8Array | string;
  bool: boolean;
  int: bigint;
  string: string;
  pubkey: Uint8Array | string;
  sig: SignatureTemplate | Uint8Array | string;
  datasig: Uint8Array | string;
};

// Helper type to process a single parameter by mapping its `type` to a value in `TypeMap`.
// Example: { type: "pubkey" } -> Uint8Array
// Branches:
// - If `Param` is a known type, it maps the `type` to `TypeMap[Type]`.
// - If `Param` has an unknown `type`, it defaults to `any`.
// - If `Param` is not an object with `type`, it defaults to `any`.
type ProcessParam<Param> = Param extends { type: infer Type }
  ? Type extends keyof TypeMap
    ? TypeMap[Type]
    : any
  : any;

// Main type to recursively convert an array of parameter definitions into a tuple.
// Example: [{ type: "pubkey" }, { type: "int" }] -> [Uint8Array, bigint]
// Branches:
// - If `Params` is a tuple with a `Head` that matches `ProcessParam`, it processes the head and recurses on the `Tail`.
// - If `Params` is an empty tuple, it returns [].
// - If `Params` is not an array or tuple, it defaults to any[].
type ParamsToTuple<Params> = Params extends readonly [infer Head, ...infer Tail]
  ? [ProcessParam<Head>, ...ParamsToTuple<Tail>]
  : Params extends readonly []
    ? []
    : any[];

// Processes a single function definition into a function mapping with parameters and return type.
// Example: { name: "transfer", inputs: [{ type: "int" }] } -> { transfer: (arg0: bigint) => ReturnType }
// Branches:
// - Branch 1: If `Function` is an object with `name` and `inputs`, it creates a function mapping.
// - Branch 2: If `Function` does not match the expected shape, it returns an empty object.
type ProcessFunction<Function, ReturnType> = Function extends { name: string; inputs: readonly any[] }
  ? {
    [functionName in Function["name"]]: (...functionParameters: ParamsToTuple<Function["inputs"]>) => ReturnType;
  }
  : {};

// Recursively converts an ABI into a function map with parameter typings and return type.
// Example:
// [
//   { name: "transfer", inputs: [{ type: "int" }] },
//   { name: "approve", inputs: [{ type: "address" }, { type: "int" }] }
// ] ->
// { transfer: (arg0: bigint) => ReturnType; approve: (arg0: string, arg1: bigint) => ReturnType }
// Branches:
// - Branch 1: If `Abi` is `unknown` or `any`, return a default function map with generic parameters and return type.
// - Branch 2: If `Abi` is a tuple with a `Head`, process `Head` using `ProcessFunction` and recurse on the `Tail`.
// - Branch 3: If `Abi` is an empty tuple, return an empty object.
// - Branch 4: If `Abi` is not an array or tuple, return a generic function map.
type _AbiToFunctionMap<Abi, ReturnType> =
  // Check if Abi is typed as `any`, in which case we return a default function map
  unknown extends Abi
    ? GenericFunctionMap<ReturnType>
    : Abi extends readonly [infer Head, ...infer Tail]
      ? ProcessFunction<Head, ReturnType> & _AbiToFunctionMap<Tail, ReturnType>
      : Abi extends readonly []
        ? {}
        : GenericFunctionMap<ReturnType>;

type GenericFunctionMap<ReturnType> = { [functionName: string]: (...functionParameters: any[]) => ReturnType };

// Merge intersection type
// Example: {foo: "foo"} & {bar: "bar"} -> {foo: "foo", bar: "bar"}
type Prettify<T> = { [K in keyof T]: T[K] } & {};

type AbiToFunctionMap<T, ReturnType> = Prettify<_AbiToFunctionMap<T, ReturnType>>;

// TODO: Update type inference for function calls

export class Contract<
  TArtifact extends Artifact = Artifact,
  TResolved extends {
    constructorInputs: any[];
    functions: Record<string, any>;
    unlock: Record<string, any>;
  }
  = {
    constructorInputs: ParamsToTuple<TArtifact["constructorInputs"]>;
    functions: AbiToFunctionMap<TArtifact["abi"], Transaction>;
    unlock: AbiToFunctionMap<TArtifact["abi"], Unlocker>;
  }
  > {
  name: string;
  address: string;
  tokenAddress: string;
  bytecode: string;
  bytesize: number;
  opcount: number;

  functions: TResolved["functions"];
  unlock: TResolved["unlock"];

  redeemScript: Script;
  provider: NetworkProvider;
  private addressType: 'p2sh20' | 'p2sh32';

  constructor(
    private artifact: TArtifact,
    constructorArgs: TResolved["constructorInputs"],
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
    this.functions = {} as any;
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
    this.unlock = {} as any;
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
