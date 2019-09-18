import { BITBOX, TransactionBuilder } from 'bitbox-sdk';
import { TxnDetailsResult, AddressUtxoResult } from 'bitcoin-com-rest';
import * as delay from 'delay';
import { Script, AbiFunction } from 'cashc';
import { Parameter, Sig } from './Parameter';
import { bitbox, ScriptUtil, BitcoinCashUtil } from './BITBOX';
import {
  TxOptions,
  Output,
  SignatureAlgorithm,
  Utxo,
} from './interfaces';
import { meep, createInputScript, inputSize } from './transaction-util';
import { DUST_LIMIT } from './constants';

export class Transaction {
  private bitbox: BITBOX;
  private builder: TransactionBuilder;

  constructor(
    private address: string,
    private network: string,
    private redeemScript: Script,
    private abiFunction: AbiFunction,
    private parameters: Parameter[],
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
  ) {
    if (typeof toOrOutputs === 'string' && typeof amountOrOptions === 'number') {
      return this.sendToMany([{ to: toOrOutputs, amount: amountOrOptions }], options);
    } else if (Array.isArray(toOrOutputs) && typeof amountOrOptions !== 'number') {
      return this.sendToMany(toOrOutputs, amountOrOptions);
    } else {
      throw new Error('Incorrect arguments passed to function send');
    }
  }

  private async sendToMany(outputs: Output[], options?: TxOptions) {
    const { tx } = await this.createTransaction(outputs, options);
    const txid = await this.bitbox.RawTransactions.sendRawTransaction(tx.toHex());
    await delay(2000);
    return await this.bitbox.Transaction.details(txid) as TxnDetailsResult;
  }

  async meep(outputs: Output[], options?: TxOptions): Promise<void>;
  async meep(to: string, amount: number, options?: TxOptions): Promise<void>;

  async meep(
    toOrOutputs: string | Output[],
    amountOrOptions?: number | TxOptions,
    options?: TxOptions,
  ) {
    if (typeof toOrOutputs === 'string' && typeof amountOrOptions === 'number') {
      await this.meepToMany([{ to: toOrOutputs, amount: amountOrOptions }], options);
    } else if (Array.isArray(toOrOutputs) && typeof amountOrOptions !== 'number') {
      await this.meepToMany(toOrOutputs, amountOrOptions);
    }
  }

  private async meepToMany(outputs: Output[], options?: TxOptions) {
    const { tx, inputs } = await this.createTransaction(outputs, options);
    await meep(tx, inputs, this.redeemScript);
  }

  private async createTransaction(outs: Output[], options?: TxOptions) {
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
      const cleanedPs = this.parameters.map((p) => {
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

      const inputScript = createInputScript(
        this.redeemScript, this.abiFunction, cleanedPs, this.selector,
      );
      inputScripts.push({ vout: vin, script: inputScript });
    });

    // Add all generated input scripts to the transaction
    this.builder.addInputScripts(inputScripts);

    return { tx: this.builder.build(), inputs };
  }

  private async getInputsAndOutputs(outputs: Output[]) {
    const { utxos } = await this.bitbox.Address.utxo(this.address) as AddressUtxoResult;

    // Utxo selection with placeholder script for script size calculation
    const placeholderScript = createInputScript(
      this.redeemScript,
      this.abiFunction,
      this.parameters.map(p => (p instanceof Sig ? Buffer.alloc(65, 0) : p)),
      this.selector,
    );

    const initialFee = BitcoinCashUtil.getByteCount({}, { P2PKH: outputs.length + 1 });
    let satsNeeded = outputs.reduce((acc, output) => acc + output.amount, initialFee);
    let satsAvailable = 0;

    const inputs: Utxo[] = [];
    for (const utxo of utxos) {
      inputs.push(utxo);
      satsAvailable += utxo.satoshis;
      satsNeeded += inputSize(placeholderScript);
      if (satsAvailable > satsNeeded) break;
    }

    const change = satsAvailable - satsNeeded;

    if (change < 0) {
      throw new Error(`Insufficient balance: available (${satsAvailable}) < needed (${satsNeeded}).`);
    } else if (change >= DUST_LIMIT) {
      outputs.push({ to: this.address, amount: change });
    }

    return { inputs, outputs };
  }
}
