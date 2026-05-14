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

// Non-generic base class holding the public API whose types do not depend on the Contract's
// generic parameters. Declaring these members here (rather than on `ContractInternal<...>`) keeps
// IDE hovers clean — tooltips show `ContractBase.name` instead of the fully resolved generic
// `ContractInternal<{ readonly contractName: ...; readonly abi: ...; ... }, ...>.name`.
class ContractBase {
  /** The contract name as defined in the source CashScript code. */
  name: string;

  /** The CashAddress of the contract. Not available for `p2s` contracts. */
  address: string;

  /** The token-aware CashAddress of the contract. Not available for `p2s` contracts. */
  tokenAddress: string;

  /** Hex-encoded locking bytecode of the contract. */
  lockingBytecode: string;

  /** Hex-encoded redeem bytecode of the contract (constructor args prepended to the compiled script). */
  bytecode: string;

  /** Size of the contract bytecode in bytes. */
  bytesize: number;

  /** Number of opcodes in the contract bytecode. */
  opcount: number;

  /** The network provider used to query UTXOs for this contract and get network information. */
  provider: NetworkProvider;

  /** The address type of this contract: `p2sh20`, `p2sh32`, or `p2s`. */
  contractType: ContractType;

  /** Encoded constructor arguments in the order expected by the contract's constructor. */
  encodedConstructorArgs: Uint8Array[];

  /**
   * Retrieve the total BCH balance of the contract by summing the satoshis of all UTXOs at the
   * contract's address.
   *
   * @returns The total balance in satoshis.
   */
  async getBalance(): Promise<bigint> {
    const utxos = await this.getUtxos();
    return utxos.reduce((acc, utxo) => acc + utxo.satoshis, 0n);
  }

  /**
   * Retrieve all UTXOs (confirmed and unconfirmed) locked at the contract's address.
   *
   * @returns A list of UTXOs spendable by this contract.
   */
  async getUtxos(): Promise<Utxo[]> {
    if (this.contractType === 'p2s') {
      return this.provider.getUtxosForLockingBytecode(this.bytecode);
    }

    return this.provider.getUtxos(this.address);
  }
}

class ContractInternal<
  TArtifact extends Artifact,
  TResolved extends ResolvedConstraint,
  TContractType extends ContractType,
> extends ContractBase {
  // Narrow the base class's `contractType` to the generic parameter. `declare` only refines the
  // type; no new field is emitted, so the runtime assignment in the constructor still applies.
  declare contractType: TContractType;

  /**
   * Call a contract function to spend a UTXO locked by this contract. Use as
   * `contract.unlock.<functionName>(...args)` — the returned value is passed as the `unlocker`
   * argument of `transactionBuilder.addInput(utxo, unlocker)`.
   */
  unlock: TResolved['unlock'];

  /**
   * Instantiate a contract from a compiled CashScript artifact.
   *
   * @param artifact - The compiled contract artifact produced by `cashc`.
   * @param constructorArgs - Constructor arguments in the order defined in the contract source.
   * @param options - Contract options including the network provider and (optional) address type.
   * @throws If the artifact is missing required properties, was compiled with an unsupported
   *   compiler version, or if the number or types of constructor arguments does not match the artifact.
   */
  constructor(
    public artifact: TArtifact,
    constructorArgs: TResolved['constructorInputs'],
    private options: ContractOptions<TContractType>,
  ) {
    super();
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

      const generateLockingBytecode = (): Uint8Array => hexToBin(this.lockingBytecode);

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
