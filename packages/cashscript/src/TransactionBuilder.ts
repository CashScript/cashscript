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
  isP2PKHUnlocker,
} from './interfaces.js';
import { NetworkProvider } from './network/index.js';
import {
  cashScriptOutputToLibauthOutput,
  createOpReturnOutput,
  delay,
  generateLibauthSourceOutputs,
  validateInput,
  validateOutput,
} from './utils.js';
import { FailedTransactionError } from './Errors.js';
import { DebugResults } from './debugging.js';
import { debugLibauthTemplate, getLibauthTemplates, getBitauthUri } from './LibauthTemplate.js';
import { getWcContractInfo, WcSourceOutput, WcTransactionOptions } from './walletconnect-utils.js';
import semver from 'semver';
import { WcTransactionObject } from './walletconnect-utils.js';

export interface TransactionBuilderOptions {
  provider: NetworkProvider;
}

const DEFAULT_SEQUENCE = 0xfffffffe;

export class TransactionBuilder {
  public provider: NetworkProvider;
  public inputs: UnlockableUtxo[] = [];
  public outputs: Output[] = [];

  public locktime: number = 0;
  public maxFee?: bigint;

  constructor(
    options: TransactionBuilderOptions,
  ) {
    this.provider = options.provider;
  }

  addInput(utxo: Utxo, unlocker: Unlocker, options?: InputOptions): this {
    return this.addInputs([utxo], unlocker, options);
  }

  addInputs(utxos: Utxo[], unlocker: Unlocker, options?: InputOptions): this;
  addInputs(utxos: UnlockableUtxo[]): this;

  addInputs(utxos: Utxo[] | UnlockableUtxo[], unlocker?: Unlocker, options?: InputOptions): this {
    utxos.forEach(validateInput);
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

  addOutput(output: Output): this {
    return this.addOutputs([output]);
  }

  addOutputs(outputs: Output[]): this {
    outputs.forEach(validateOutput);
    this.outputs = this.outputs.concat(outputs);
    return this;
  }

  // TODO: allow uint8array for chunks
  addOpReturnOutput(chunks: string[]): this {
    this.outputs.push(createOpReturnOutput(chunks));
    return this;
  }

  setLocktime(locktime: number): this {
    this.locktime = locktime;
    return this;
  }

  setMaxFee(maxFee: bigint): this {
    this.maxFee = maxFee;
    return this;
  }

  private checkMaxFee(): void {
    if (!this.maxFee) return;

    const totalInputAmount = this.inputs.reduce((total, input) => total + input.satoshis, 0n);
    const totalOutputAmount = this.outputs.reduce((total, output) => total + output.amount, 0n);
    const fee = totalInputAmount - totalOutputAmount;

    if (fee > this.maxFee) {
      throw new Error(`Transaction fee of ${fee} is higher than max fee of ${this.maxFee}`);
    }
  }

  buildLibauthTransaction(): LibauthTransaction {
    this.checkMaxFee();

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
      transaction.inputs[i].unlockingBytecode = script;
    });

    return transaction;
  }

  build(): string {
    const transaction = this.buildLibauthTransaction();
    return binToHex(encodeTransaction(transaction));
  }

  debug(): DebugResults {
    // do not debug a pure P2PKH-spend transaction
    if (this.inputs.every((input) => isP2PKHUnlocker(input.unlocker))) {
      return {};
    }

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

  bitauthUri(): string {
    console.warn('WARNING: it is unsafe to use this Bitauth URI when using real private keys as they are included in the transaction template');
    return getBitauthUri(this.getLibauthTemplate());
  }

  getLibauthTemplate(): WalletTemplate {
    return getLibauthTemplates(this);
  }

  async send(): Promise<TransactionDetails>;
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
      throw new FailedTransactionError(reason);
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
}
