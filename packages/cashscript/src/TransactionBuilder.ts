import {
  binToHex,
  decodeTransaction,
  decodeTransactionUnsafe,
  encodeTransaction,
  hexToBin,
  Transaction as LibauthTransaction,
  WalletTemplate,
} from '@bitauth/libauth';
import {
  Unlocker,
  Output,
  TransactionDetails,
  UnlockableUtxo,
  Utxo,
  InputOptions,
  isUnlockableUtxo,
  isStandardUnlockableUtxo,
  StandardUnlockableUtxo,
  VmResourceUsage,
  isContractUnlocker,
  BchChangeOutputOptions,
  TokenChangeOutputOptions,
} from './interfaces.js';
import { NetworkProvider } from './network/index.js';
import {
  calculateDust,
  cashScriptOutputToLibauthOutput,
  createOpReturnOutput,
  delay,
  generateLibauthSourceOutputs,
  getOutputSize,
  validateInput,
  validateOutput,
} from './utils.js';
import {
  FailedTransactionError,
  TransactionFeeTooHighError,
  TransactionFeePerByteTooHighError,
  TransactionFeePerByteTooLowError,
  TransactionInputsRequiredError,
  TransactionOutputsRequiredError,
  UnlockingBytecodeTooLargeError,
  TransactionTooLargeError,
} from './Errors.js';
import { DebugResults } from './debugging.js';
import { debugLibauthTemplate, getLibauthTemplate, getBitauthUri } from './libauth-template/LibauthTemplate.js';
import { getWcContractInfo, WcSourceOutput, WcTransactionOptions } from './walletconnect-utils.js';
import semver from 'semver';
import { WcTransactionObject } from './walletconnect-utils.js';

/**
 * Options accepted by the `TransactionBuilder` constructor.
 */
export interface TransactionBuilderOptions {
  /** Network provider used to broadcast the transaction and fetch details after sending. */
  provider: NetworkProvider;
  /** Optional absolute cap on the transaction fee. Build/send throws if the fee exceeds this value. */
  maximumFeeSatoshis?: bigint;
  /** Optional cap on the transaction fee rate in sats/byte. Build/send throws if exceeded. */
  maximumFeeSatsPerByte?: number;
  /** Allow fungible token inputs to exceed token outputs (implicit burn). Defaults to `false`. */
  allowImplicitFungibleTokenBurn?: boolean;
}

const DEFAULT_SEQUENCE = 0xfffffffe;

/**
 * Fluent builder for constructing, debugging, and broadcasting CashScript transactions.
 *
 * Inputs are added via `addInput` / `addInputs` with an `Unlocker` produced by a `Contract` or
 * `SignatureTemplate`, outputs are added via `addOutput` / `addOutputs`, and the resulting
 * transaction can be built (`build`), debugged (`debug`), or broadcast (`send`).
 */
export class TransactionBuilder {
  public provider: NetworkProvider;
  public inputs: UnlockableUtxo[] = [];
  public outputs: Output[] = [];

  public locktime: number = 0;
  public options: TransactionBuilderOptions;

  private changeLocks: Record<string, boolean> = {};

  /**
   * Create a new TransactionBuilder.
   *
   * @param options - Builder options, including the network provider and optional fee/burn limits.
   */
  constructor(
    options: TransactionBuilderOptions,
  ) {
    this.provider = options.provider;
    this.options = {
      allowImplicitFungibleTokenBurn: options.allowImplicitFungibleTokenBurn ?? false,
      ...options,
    };
  }

  /**
   * Add a single UTXO as an input to the transaction.
   *
   * @param utxo - The UTXO to spend.
   * @param unlocker - The unlocker to generate the unlocking bytecode for this input. Typically
   *   obtained from `contract.unlock.<functionName>(...args)` or `signatureTemplate.unlockP2PKH()`.
   * @param options - Optional per-input options such as a custom sequence number.
   * @returns This builder for chaining.
   * @throws If the UTXO is invalid.
   */
  addInput(utxo: Utxo, unlocker: Unlocker, options?: InputOptions): this {
    return this.addInputs([utxo], unlocker, options);
  }

  /**
   * Add multiple UTXOs to the transaction that all share the same unlocker.
   *
   * @param utxos - The UTXOs to spend.
   * @param unlocker - The shared unlocker used to unlock all provided UTXOs.
   * @param options - Optional per-input options applied to every added input.
   * @returns This builder for chaining.
   * @throws If any UTXO is invalid.
   */
  addInputs(utxos: Utxo[], unlocker: Unlocker, options?: InputOptions): this;

  /**
   * Add multiple UTXOs that each carry their own unlocker.
   *
   * @param utxos - UTXOs that have already been paired with their individual unlockers.
   * @returns This builder for chaining.
   * @throws If any UTXO is missing its unlocker.
   */
  addInputs(utxos: UnlockableUtxo[]): this;

  addInputs(utxos: Utxo[] | UnlockableUtxo[], unlocker?: Unlocker, options?: InputOptions): this {
    utxos.forEach((utxo) => validateInput(utxo, this.changeLocks));
    if (
      (!unlocker && utxos.some((utxo) => !isUnlockableUtxo(utxo)))
      || (unlocker && utxos.some((utxo) => isUnlockableUtxo(utxo)))
    ) {
      throw new Error('Either all UTXOs must have an individual unlocker specified, or no UTXOs must have an individual unlocker specified and a shared unlocker must be provided');
    }

    if (!unlocker) {
      this.inputs = this.inputs.concat(utxos as UnlockableUtxo[]);
      return this;
    }

    this.inputs = this.inputs.concat(utxos.map(((utxo) => ({ ...utxo, unlocker, options }))));
    return this;
  }

  /**
   * Add a single output to the transaction.
   *
   * @param output - The output to add. Its address, amount and optional token are validated
   *   against the provider's network.
   * @returns This builder for chaining.
   * @throws If the output is invalid.
   */
  addOutput(output: Output): this {
    return this.addOutputs([output]);
  }

  /**
   * Add multiple outputs to the transaction.
   *
   * @param outputs - The outputs to add. Each output is validated against the provider's network.
   * @returns This builder for chaining.
   * @throws If any output is invalid.
   */
  addOutputs(outputs: Output[]): this {
    outputs.forEach((output) => validateOutput(output, this.provider.network, this.changeLocks));
    this.outputs = this.outputs.concat(outputs);
    return this;
  }

  // TODO: allow uint8array for chunks
  /**
   * Append an `OP_RETURN` output containing the provided data chunks. Hex strings prefixed with
   * `0x` are decoded as bytes; other strings are encoded as UTF-8.
   *
   * @param chunks - The data chunks to include after the `OP_RETURN` opcode.
   * @returns This builder for chaining.
   */
  addOpReturnOutput(chunks: string[]): this {
    this.addOutput(createOpReturnOutput(chunks));
    return this;
  }

  /**
   * Add a BCH change output for the remaining value after fees, if it exceeds the dust limit. The
   * fee is computed from the transaction size at the configured fee rate; dust-sized change is
   * simply absorbed into the fee.
   *
   * Should be called *after* all explicit inputs and outputs are added.
   *
   * @param changeOutputOptions - The destination address and the fee rate (in sats/byte) to use.
   * @returns This builder for chaining.
   * @throws If the available surplus is insufficient to cover the fee for the configured rate or
   * if a BCH change output was already added.
   */
  addBchChangeOutputIfNeeded(changeOutputOptions: BchChangeOutputOptions): this {
    const totalBchInputAmount = this.inputs.reduce((total, input) => total + input.satoshis, 0n);
    const totalBchOutputAmount = this.outputs.reduce((total, output) => total + output.amount, 0n);

    const tentativeSurplus = totalBchInputAmount - totalBchOutputAmount;
    const tentativeTransactionSize = this.getTransactionSize();
    const tentativeFee = BigInt(Math.ceil(changeOutputOptions.feeRate * Number(tentativeTransactionSize)));
    const tentativeChangeAmount = tentativeSurplus - tentativeFee;

    if (tentativeChangeAmount < 0n) {
      throw new Error(`Transaction does not have enough funds to cover the transaction fee rate of ${changeOutputOptions.feeRate} even without adding a change output. Current surplus: ${tentativeSurplus}, current fee: ${tentativeFee}, current change amount: ${tentativeChangeAmount}`);
    }

    const changeOutputSize = getOutputSize({
      to: changeOutputOptions.to,
      amount: tentativeSurplus,
    });

    const transactionSize = tentativeTransactionSize + BigInt(changeOutputSize);
    const calculatedFee = BigInt(Math.ceil(changeOutputOptions.feeRate * Number(transactionSize)));

    const changeAmount = tentativeSurplus - calculatedFee;
    const changeOutput = { to: changeOutputOptions.to, amount: changeAmount };

    const changeOutputDust = calculateDust(changeOutput);
    if (changeAmount < changeOutputDust) {
      this.changeLocks.BCH = true;
      return this;
    }

    this.addOutput(changeOutput);
    this.changeLocks.BCH = true;
    return this;
  }

  /**
   * Add a fungible token change output for the configured category if the transaction's inputs
   * contain more tokens of that category than its outputs. The change output is sent to the
   * provided token address and carries the dust-minimum BCH amount.
   *
   * Should be called *after* all explicit token outputs for the category are added and *before*
   * `addBchChangeOutputIfNeeded`.
   *
   * @param changeOutputOptions - The token category to handle and the destination token address.
   * @returns This builder for chaining.
   * @throws If the destination is not a token-supporting address, or if a corresponding change output
   * or BCH change output was already added.
   */
  addTokenChangeOutputIfNeeded(changeOutputOptions: TokenChangeOutputOptions): this {
    const { category, to } = changeOutputOptions;

    const inputAmount = this.inputs
      .filter((input) => input.token?.category === category)
      .reduce((total, input) => total + input.token!.amount, 0n);

    const outputAmount = this.outputs
      .filter((output) => output.token?.category === category)
      .reduce((total, output) => total + output.token!.amount, 0n);

    const changeAmount = inputAmount - outputAmount;
    if (changeAmount <= 0n) {
      this.changeLocks[category] = true;
      return this;
    }

    const changeOutput: Output = {
      to,
      amount: 0n,
      token: { amount: changeAmount, category },
    };
    changeOutput.amount = BigInt(calculateDust(changeOutput));

    this.addOutput(changeOutput);
    this.changeLocks[category] = true;
    return this;
  }

  /**
   * Build the transaction (skipping fee and burn checks) and return its encoded byte length.
   *
   * @returns The size of the transaction in bytes.
   */
  getTransactionSize(): bigint {
    const transaction = this.buildLibauthTransaction(true);
    return BigInt(encodeTransaction(transaction).byteLength);
  }

  /**
   * Calculate the transaction fee in satoshis and the fee per byte.
   *
   * @returns The transaction fee in satoshis and the fee per byte.
   */
  calculateTransactionFee(): { feeSats: bigint, feeSatsPerByte: number } {
    const transactionSize = this.getTransactionSize();
    const totalInputAmount = this.inputs.reduce((total, input) => total + input.satoshis, 0n);
    const totalOutputAmount = this.outputs.reduce((total, output) => total + output.amount, 0n);
    const feeSats = totalInputAmount - totalOutputAmount;
    const feeSatsPerByte = Number((Number(feeSats) / Number(transactionSize)).toFixed(2));
    return { feeSats, feeSatsPerByte };
  }

  /**
   * Set the `nLockTime` of the transaction.
   *
   * @param locktime - The absolute locktime to use (block height or UNIX timestamp).
   * @returns This builder for chaining.
   */
  setLocktime(locktime: number): this {
    this.locktime = locktime;
    return this;
  }

  /**
   * Build the transaction, applying fee and implicit-burn checks, and return the hex-encoded
   * transaction bytes.
   *
   * @returns The signed transaction as a hex string.
   * @throws If the transaction fee exceeds the configured maximum, or if fungible tokens are
   *   implicitly burned without `allowImplicitFungibleTokenBurn` enabled.
   */
  build(): string {
    const transaction = this.buildLibauthTransaction();
    return binToHex(encodeTransaction(transaction));
  }

  private buildLibauthTransaction(skipChecks: boolean = false): LibauthTransaction {
    if (!skipChecks) {
      this.checkFungibleTokenBurn();
      this.checkInputsAndOutputs();
    }

    const inputs: LibauthTransaction['inputs'] = this.inputs.map((utxo) => ({
      outpointIndex: utxo.vout,
      outpointTransactionHash: hexToBin(utxo.txid),
      sequenceNumber: utxo.options?.sequence ?? DEFAULT_SEQUENCE,
      unlockingBytecode: new Uint8Array(),
    }));

    const outputs = this.outputs.map(cashScriptOutputToLibauthOutput);

    const transaction = {
      inputs,
      locktime: this.locktime,
      outputs,
      version: 2,
    };

    // Generate source outputs from inputs (for signing with SIGHASH_UTXOS)
    const sourceOutputs = generateLibauthSourceOutputs(this.inputs);

    const inputScripts = this.inputs.map((input, inputIndex) => (
      input.unlocker.generateUnlockingBytecode({ transaction, sourceOutputs, inputIndex })
    ));

    inputScripts.forEach((script, i) => {
      if (!skipChecks) this.checkUnlockingBytecodeSize(script);
      transaction.inputs[i].unlockingBytecode = script;
    });

    if (!skipChecks) {
      this.checkFee(transaction);
      this.checkTransactionSize(transaction);
    }

    return transaction;
  }

  /**
   * Locally evaluate the transaction against the Bitcoin Cash VM using debug information from the
   * contract artifacts. Throws a descriptive error if any input fails evaluation.
   *
   * @returns The full debug execution trace for every scenario in the generated libauth template.
   * @throws If the transaction contains inputs with custom (non-standard) unlockers, or if the
   *   evaluation fails (e.g. a failing `require` statement).
   */
  debug(): DebugResults {
    if (this.inputs.some((input) => !isStandardUnlockableUtxo(input))) {
      throw new Error('Cannot debug a transaction with custom unlocker');
    }

    // We can typecast this because we check that all inputs are standard unlockable in the check above
    const contractVersions = (this.inputs as StandardUnlockableUtxo[])
      .map((input) => 'contract' in input.unlocker ? input.unlocker.contract.artifact.compiler.version : null)
      .filter((version) => version !== null);

    if (!contractVersions.every((version) => semver.satisfies(version, '>=0.11.0'))) {
      console.warn('For the best debugging experience, please recompile your contract with cashc version 0.11.0 or newer.');
    }

    return debugLibauthTemplate(this.getLibauthTemplate(), this);
  }

  /**
   * Compute VM resource usage (ops, op cost budget, sigchecks, hash iterations) for each input
   * by running the transaction through `debug`.
   *
   * @param verbose - When `true`, also prints a formatted table of the results via `console.table`.
   * @returns One entry per input with its VM resource usage metrics.
   * @throws If the transaction contains inputs with custom (non-standard) unlockers, or if the
   *   evaluation fails.
   */
  getVmResourceUsage(verbose: boolean = false): Array<VmResourceUsage> {
    // Note that only StandardUnlockableUtxo inputs are supported for debugging, so any transaction with custom unlockers
    // cannot be debugged (and therefore cannot return VM resource usage)
    const results = this.debug();
    const vmResourceUsage: Array<VmResourceUsage> = [];
    const tableData: Array<Record<string, any>> = [];

    const formatMetric = (value: number, total: number, withPercentage: boolean = false): string =>
      `${formatNumber(value)} / ${formatNumber(total)}${withPercentage ? ` (${(value / total * 100).toFixed(0)}%)` : ''}`;
    const formatNumber = (value: number): string => value.toLocaleString('en');

    const resultEntries = Object.entries(results);
    for (const [index, input] of this.inputs.entries()) {
      const [, result] = resultEntries.find(([entryKey]) => entryKey.includes(`input${index}`)) ?? [];
      const metrics = result?.at(-1)?.metrics;

      // Should not happen
      if (!metrics) throw new Error('VM resource could not be calculated');

      vmResourceUsage.push(metrics);
      tableData.push({
        'Contract - Function': isContractUnlocker(input.unlocker) ? `${input.unlocker.contract.name} - ${input.unlocker.abiFunction.name}` : 'P2PKH Input',
        Ops: metrics.evaluatedInstructionCount,
        'Op Cost Budget Usage': formatMetric(metrics.operationCost, metrics.maximumOperationCost, true),
        SigChecks: formatMetric(metrics.signatureCheckCount, metrics.maximumSignatureCheckCount),
        Hashes: formatMetric(metrics.hashDigestIterations, metrics.maximumHashDigestIterations),
      });
    }

    if (verbose) {
      console.log('VM Resource usage by inputs:');
      console.table(tableData);
    }

    return vmResourceUsage;
  }

  /**
   * Build a Bitauth IDE URI that loads the transaction (and all private keys required to sign it)
   * in the online Bitauth IDE debugger.
   *
   * WARNING: The URI embeds every private key used in the transaction. Do not share this URI if
   * the transaction is signed with real private keys.
   *
   * @returns A Bitauth IDE URL for debugging this transaction.
   * @throws If the transaction cannot be built (fee exceeds limit or fungible tokens burned).
   */
  getBitauthUri(): string {
    console.warn('WARNING: it is unsafe to use this Bitauth URI when using real private keys as they are included in the transaction template');
    return getBitauthUri(this.getLibauthTemplate());
  }

  /**
   * Build the transaction and return the corresponding libauth `WalletTemplate`. Useful for
   * exporting the transaction to external libauth-compatible tooling.
   *
   * @returns A libauth `WalletTemplate` describing this transaction.
   * @throws If the transaction cannot be built (fee exceeds limit or fungible tokens burned).
   */
  getLibauthTemplate(): WalletTemplate {
    const libauthTransaction = this.buildLibauthTransaction();
    return getLibauthTemplate(this, libauthTransaction);
  }

  /**
   * Build and broadcast the transaction via the configured network provider. Before broadcasting,
   * the transaction is evaluated locally (when all inputs use standard unlockers) so that failing
   * require statements or VM errors surface with descriptive messages.
   *
   * @returns The decoded transaction details (including txid and raw hex).
   * @throws A `FailedTransactionError` if the network rejects the transaction, or any of the
   *   build / local evaluation errors (e.g. fee cap, implicit burn, failing require statement).
   */
  async send(): Promise<TransactionDetails>;

  /**
   * Build and broadcast the transaction, returning only the raw transaction hex string as retrieved
   * from the network after broadcast.
   *
   * @param raw - Pass `true` to receive the raw transaction hex instead of decoded details.
   * @returns The raw transaction hex as retrieved from the network after broadcast.
   * @throws A `FailedTransactionError` if the network rejects the transaction, or any of the
   *   build / local evaluation errors (e.g. fee cap, implicit burn, failing require statement).
   */
  async send(raw: true): Promise<string>;
  async send(raw?: true): Promise<TransactionDetails | string> {
    const tx = this.build();

    // If all inputs are standard unlockable, we can debug the transaction locally
    // before sending so any errors are caught early
    if (this.inputs.every((input) => isStandardUnlockableUtxo(input))) {
      this.debug();
    }

    try {
      const txid = await this.provider.sendRawTransaction(tx);
      return raw ? await this.getTxDetails(txid, raw) : await this.getTxDetails(txid);
    } catch (e: any) {
      const reason = e.error ?? e.message;

      const getBitauthUriWithFallback = (): string => {
        try {
          return getBitauthUri(this.getLibauthTemplate());
        } catch {
          return 'Bitauth URI generation failed';
        }
      };

      throw new FailedTransactionError(reason, getBitauthUriWithFallback());
    }
  }

  private async getTxDetails(txid: string): Promise<TransactionDetails>;
  private async getTxDetails(txid: string, raw: true): Promise<string>;
  private async getTxDetails(txid: string, raw?: true): Promise<TransactionDetails | string> {
    for (let retries = 0; retries < 1200; retries += 1) {
      await delay(500);
      try {
        const hex = await this.provider.getRawTransaction(txid);

        if (raw) return hex;

        const libauthTransaction = decodeTransaction(hexToBin(hex)) as LibauthTransaction;
        return { ...libauthTransaction, txid, hex };
      } catch (ignored) {
        // ignored
      }
    }

    // Should not happen
    throw new Error('Could not retrieve transaction details for over 10 minutes');
  }

  /**
   * Build the transaction and format it as a BCH WalletConnect transaction object suitable for
   * signing and broadcasting via a BCH WalletConnect-compatible Bitcoin Cash wallet.
   *
   * See the [BCH WalletConnect spec](https://github.com/mainnet-pat/wc2-bch-bcr) for the object format.
   *
   * @param options - Optional WalletConnect options such as `broadcast` and `userPrompt`.
   * @returns A WalletConnect transaction object ready to be sent to a WalletConnect wallet.
   * @throws If the transaction cannot be built (fee exceeds limit or fungible tokens burned).
   */
  generateWcTransactionObject(options?: WcTransactionOptions): WcTransactionObject {
    const encodedTransaction = this.build();
    const transaction = decodeTransactionUnsafe(hexToBin(encodedTransaction));

    const libauthSourceOutputs = generateLibauthSourceOutputs(this.inputs);
    const sourceOutputs: WcSourceOutput[] = libauthSourceOutputs.map((sourceOutput, index) => {
      return {
        ...sourceOutput,
        ...transaction.inputs[index],
        ...getWcContractInfo(this.inputs[index]),
      };
    });
    return { ...options, transaction, sourceOutputs };
  }

  private checkFee(transaction: LibauthTransaction): void {
    const totalInputAmount = this.inputs.reduce((total, input) => total + input.satoshis, 0n);
    const totalOutputAmount = this.outputs.reduce((total, output) => total + output.amount, 0n);
    const transactionSize = encodeTransaction(transaction).byteLength;

    const fee = totalInputAmount - totalOutputAmount;
    const feePerByte = Number((Number(fee) / transactionSize).toFixed(2));

    if (this.options.maximumFeeSatoshis && fee > this.options.maximumFeeSatoshis) {
      throw new TransactionFeeTooHighError(fee, this.options.maximumFeeSatoshis);
    }

    if (this.options.maximumFeeSatsPerByte && feePerByte > this.options.maximumFeeSatsPerByte) {
      throw new TransactionFeePerByteTooHighError(feePerByte, this.options.maximumFeeSatsPerByte);
    }

    const STANDARD_MIN_FEE_PER_BYTE = 1.0;
    if (feePerByte < STANDARD_MIN_FEE_PER_BYTE) {
      throw new TransactionFeePerByteTooLowError(feePerByte, STANDARD_MIN_FEE_PER_BYTE);
    }
  }

  private checkFungibleTokenBurn(): void {
    if (this.options.allowImplicitFungibleTokenBurn) return;

    const tokenInputAmounts: Record<string, bigint> = {};
    const tokenOutputAmounts: Record<string, bigint> = {};

    for (const input of this.inputs) {
      if (input.token?.amount) {
        tokenInputAmounts[input.token.category] = (tokenInputAmounts[input.token.category] || 0n) + input.token.amount;
      }
    }
    for (const output of this.outputs) {
      if (output.token?.amount) {
        tokenOutputAmounts[output.token.category] = (tokenOutputAmounts[output.token.category] || 0n) + output.token.amount;
      }
    }

    for (const [category, inputAmount] of Object.entries(tokenInputAmounts)) {
      const outputAmount = tokenOutputAmounts[category] || 0n;
      if (outputAmount < inputAmount) {
        throw new Error(`Implicit burning of fungible tokens for category ${category} is not allowed (input amount: ${inputAmount}, output amount: ${outputAmount}). If this is intended, set allowImplicitFungibleTokenBurn to true.`);
      }
    }
  }

  private checkInputsAndOutputs(): void {
    if (this.inputs.length === 0) {
      throw new TransactionInputsRequiredError();
    }

    if (this.outputs.length === 0) {
      throw new TransactionOutputsRequiredError();
    }
  }

  private checkUnlockingBytecodeSize(script: Uint8Array): void {
    const MAX_UNLOCKING_BYTECODE_SIZE = 10_000;
    if (script.byteLength > MAX_UNLOCKING_BYTECODE_SIZE) {
      throw new UnlockingBytecodeTooLargeError(script.byteLength, MAX_UNLOCKING_BYTECODE_SIZE);
    }
  }

  private checkTransactionSize(transaction: LibauthTransaction): void {
    const transactionSize = encodeTransaction(transaction).byteLength;

    const TX_MAX_STANDARD_SIZE = 100_000;
    if (transactionSize > TX_MAX_STANDARD_SIZE) {
      throw new TransactionTooLargeError(transactionSize, TX_MAX_STANDARD_SIZE);
    }
  }
}
