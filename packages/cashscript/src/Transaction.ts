import { BITBOX, TransactionBuilder } from 'bitbox-sdk';
import { TxnDetailsResult, AddressUtxoResult } from 'bitcoin-com-rest';
import * as delay from 'delay';
import { Script, AbiFunction } from 'cashc';
import { Sig } from './Parameter';
import { bitbox, ScriptUtil } from './BITBOX';
import {
  TxOptions,
  Output,
  SignatureAlgorithm,
  Utxo,
  isRecipient,
  OutputForBuilder,
} from './interfaces';
import {
  meep,
  createInputScript,
  getInputSize,
  createOpReturnOutput,
  getTxSizeWithoutInputs,
} from './transaction-util';
import { DUST_LIMIT, P2PKH_OUTPUT_SIZE } from './constants';
import { FailedTransactionError } from './Errors';

export class Transaction {
  private bitbox: BITBOX;
  private builder: TransactionBuilder;

  constructor(
    private address: string,
    private network: string,
    private redeemScript: Script,
    private abiFunction: AbiFunction,
    private parameters: (Buffer | Sig)[],
    private selector?: number,
  ) {
    this.bitbox = bitbox[network];
    this.builder = new this.bitbox.TransactionBuilder(this.network);
  }

  async send(outputs: Output[], options?: TxOptions): Promise<TxnDetailsResult>;
  async send(to: string, amount: number, options?: TxOptions): Promise<TxnDetailsResult>;

  async send(
    toOrOutputs: string | Output[],
    amountOrOptions?: number | TxOptions,
    options?: TxOptions,
  ): Promise<TxnDetailsResult> {
    if (typeof toOrOutputs === 'string' && typeof amountOrOptions === 'number') {
      return this.sendToMany([{ to: toOrOutputs, amount: amountOrOptions }], options);
    } else if (Array.isArray(toOrOutputs) && typeof amountOrOptions !== 'number') {
      return this.sendToMany(toOrOutputs, amountOrOptions);
    } else {
      throw new Error('Incorrect arguments passed to function send');
    }
  }

  private async sendToMany(
    outputs: Output[],
    options?: TxOptions,
  ): Promise<TxnDetailsResult> {
    const { tx, inputs } = await this.createTransaction(outputs, options);
    try {
      const txid = await this.bitbox.RawTransactions.sendRawTransaction(tx.toHex());
      return this.getTxDetails(txid);
    } catch (e) {
      throw new FailedTransactionError(e.error, meep(tx, inputs, this.redeemScript));
    }
  }

  private async getTxDetails(txid: string): Promise<TxnDetailsResult> {
    while (true) {
      await delay(500);
      try {
        return await this.bitbox.Transaction.details(txid) as TxnDetailsResult;
      } catch (e) {
        // ignored
      }
    }
  }

  async meep(outputs: Output[], options?: TxOptions): Promise<void>;
  async meep(to: string, amount: number, options?: TxOptions): Promise<void>;

  async meep(
    toOrOutputs: string | Output[],
    amountOrOptions?: number | TxOptions,
    options?: TxOptions,
  ): Promise<void> {
    if (typeof toOrOutputs === 'string' && typeof amountOrOptions === 'number') {
      await this.meepToMany([{ to: toOrOutputs, amount: amountOrOptions }], options);
    } else if (Array.isArray(toOrOutputs) && typeof amountOrOptions !== 'number') {
      await this.meepToMany(toOrOutputs, amountOrOptions);
    }
  }

  private async meepToMany(outputs: Output[], options?: TxOptions): Promise<void> {
    const { tx, inputs } = await this.createTransaction(outputs, options);
    console.log(meep(tx, inputs, this.redeemScript));
  }

  private async createTransaction(
    outs: Output[],
    options?: TxOptions,
  ): Promise<{ tx: any, inputs: Utxo[]}> {
    const sequence = options && options.age
      ? this.builder.bip68.encode({ blocks: options.age })
      : 0xfffffffe;
    const locktime = options && options.time
      ? options.time
      : await this.bitbox.Blockchain.getBlockCount();

    this.builder.setLockTime(locktime);

    const { inputs, outputs } = await this.getInputsAndOutputs(outs);

    inputs.forEach((utxo) => {
      this.builder.addInput(utxo.txid, utxo.vout, sequence);
    });

    outputs.forEach((output) => {
      this.builder.addOutput(output.to, output.amount);
    });

    // Vout is a misnomer used in BITBOX, should be vin
    const inputScripts: { vout: number, script: Buffer }[] = [];

    // Convert all Sig objects to valid tx signatures for current tx
    const tx = this.builder.transaction.buildIncomplete();
    inputs.forEach((utxo: Utxo, vin: number) => {
      const completePs = this.parameters.map((p) => {
        if (!(p instanceof Sig)) return p;

        // Bitcoin cash replay protection
        const hashtype = p.hashtype | tx.constructor.SIGHASH_BITCOINCASHBIP143;
        const sighash = tx.hashForCashSignature(
          vin, ScriptUtil.encode(this.redeemScript), utxo.satoshis, hashtype,
        );
        return p.keypair
          .sign(sighash, SignatureAlgorithm.SCHNORR)
          .toScriptSignature(hashtype, SignatureAlgorithm.SCHNORR);
      });

      const inputScript = createInputScript(this.redeemScript, completePs, this.selector);
      inputScripts.push({ vout: vin, script: inputScript });
    });

    // Add all generated input scripts to the transaction
    this.builder.addInputScripts(inputScripts);

    return { tx: this.builder.build(), inputs };
  }

  private async getInputsAndOutputs(
    outs: Output[],
    satsPerByte: number = 1.0,
  ): Promise<{ inputs: Utxo[], outputs: OutputForBuilder[] }> {
    const { utxos } = await this.bitbox.Address.utxo(this.address) as AddressUtxoResult;

    // Use a placeholder script with 65-length Buffer in the place of signatures
    // for correct size calculation of inputs
    const placeholderScript = createInputScript(
      this.redeemScript,
      this.parameters.map(p => (p instanceof Sig ? Buffer.alloc(65, 0) : p)),
      this.selector,
    );

    // Add one extra byte per input to over-estimate txin count
    const inputSize = getInputSize(placeholderScript) + 1;

    const outputs = outs.map(output => (
      isRecipient(output) ? output : createOpReturnOutput(output)
    ));

    const initialFee = Math.ceil(getTxSizeWithoutInputs(outputs) * satsPerByte);

    let satsNeeded = outputs.reduce((acc, output) => acc + output.amount, initialFee);
    let satsAvailable = 0;

    const inputs: Utxo[] = [];
    for (const utxo of utxos) {
      inputs.push(utxo);
      satsAvailable += utxo.satoshis;
      satsNeeded += inputSize;
      if (satsAvailable > satsNeeded) break;
    }

    const change = satsAvailable - satsNeeded;

    if (change < 0) {
      throw new Error(`Insufficient balance: available (${satsAvailable}) < needed (${satsNeeded}).`);
    } else if (change >= DUST_LIMIT + P2PKH_OUTPUT_SIZE) {
      outputs.push({ to: this.address, amount: change - P2PKH_OUTPUT_SIZE });
    }

    return { inputs, outputs };
  }
}
