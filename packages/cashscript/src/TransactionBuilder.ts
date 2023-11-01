import {
  binToHex, decodeTransaction, encodeTransaction, hexToBin, Transaction as LibauthTransaction,
} from '@bitauth/libauth';
import delay from 'delay';
import {
  Unlocker,
  Output,
  TransactionDetails,
  UnlockableUtxo,
  Utxo,
  InputOptions,
  isUnlockableUtxo,
} from './interfaces.js';
import { NetworkProvider } from './network/index.js';
import {
  buildError,
  cashScriptOutputToLibauthOutput,
  createOpReturnOutput,
  validateOutput,
} from './utils.js';

export interface TransactionBuilderOptions {
  provider: NetworkProvider;
}

const DEFAULT_SEQUENCE = 0xfffffffe;

export class TransactionBuilder {
  private provider: NetworkProvider;
  private inputs: UnlockableUtxo[] = [];
  private outputs: Output[] = [];

  private locktime: number;
  private maxFee?: bigint;

  constructor(
    options: TransactionBuilderOptions,
  ) {
    this.provider = options.provider;
  }

  addInput(utxo: Utxo, unlocker: Unlocker, options?: InputOptions): this {
    this.inputs.push({ ...utxo, unlocker, options });
    return this;
  }

  addInputs(utxos: Utxo[], unlocker: Unlocker, options?: InputOptions): this;
  addInputs(utxos: UnlockableUtxo[]): this;

  addInputs(utxos: Utxo[] | UnlockableUtxo[], unlocker?: Unlocker, options?: InputOptions): this {
    if (
      (!unlocker && utxos.some((utxo) => !isUnlockableUtxo(utxo)))
      || (unlocker && utxos.some((utxo) => isUnlockableUtxo(utxo)))
    ) {
      throw new Error('Either all UTXOs must have an individual unlocker speciifed, or no UTXOs must have an individual unlocker specified and a shared unlocker must be provided');
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

  build(): string {
    this.checkMaxFee();

    const inputs = this.inputs.map((utxo) => ({
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
    const sourceOutputs = this.inputs.map((input) => {
      const sourceOutput = {
        amount: input.satoshis,
        to: input.unlocker.generateLockingBytecode(),
        token: input.token,
      };

      return cashScriptOutputToLibauthOutput(sourceOutput);
    });

    const inputScripts = this.inputs.map((input, inputIndex) => (
      input.unlocker.generateUnlockingBytecode({ transaction, sourceOutputs, inputIndex })
    ));

    inputScripts.forEach((script, i) => {
      transaction.inputs[i].unlockingBytecode = script;
    });

    return binToHex(encodeTransaction(transaction));
  }

  // TODO: see if we can merge with Transaction.ts
  async send(): Promise<TransactionDetails>;
  async send(raw: true): Promise<string>;
  async send(raw?: true): Promise<TransactionDetails | string> {
    const tx = this.build();
    try {
      const txid = await this.provider.sendRawTransaction(tx);
      return raw ? await this.getTxDetails(txid, raw) : await this.getTxDetails(txid);
    } catch (e: any) {
      const reason = e.error ?? e.message;
      throw buildError(reason);
    }
  }

  // TODO: see if we can merge with Transaction.ts
  private async getTxDetails(txid: string): Promise<TransactionDetails>
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
}
