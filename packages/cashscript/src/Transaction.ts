import { BITBOX } from 'bitbox-sdk';
import { TxnDetailsResult, AddressUtxoResult } from 'bitcoin-com-rest';
import * as delay from 'delay';
import { Script, AbiFunction } from 'cashc';
import { Parameter, Sig } from './Parameter';
import { bitbox, ScriptUtil } from './BITBOX';
import { TxOptions, Output, SignatureAlgorithm } from './interfaces';
import { meep, createInputScript, selectUtxos } from './transaction-util';
import { DUST_LIMIT } from './constants';

export class Transaction {
  private bitbox: BITBOX;

  constructor(
    private address: string,
    private network: string,
    private redeemScript: Script,
    private abiFunction: AbiFunction,
    private parameters: Parameter[],
    private selector?: number,
  ) {
    this.bitbox = bitbox[network];
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
    const { tx, utxos } = await this.createTransaction(outputs, options);
    await meep(tx, utxos, this.redeemScript);
  }

  private async createTransaction(outputs: Output[], options?: TxOptions) {
    const txBuilder = new this.bitbox.TransactionBuilder(this.network);
    const { utxos: allUtxos } = await this.bitbox.Address.utxo(this.address) as AddressUtxoResult;

    const sequence = options && options.age
      ? txBuilder.bip68.encode({ blocks: options.age })
      : 0xfffffffe;
    const locktime = options && options.time
      ? options.time
      : await this.bitbox.Blockchain.getBlockCount();

    txBuilder.setLockTime(locktime);

    // Utxo selection with placeholder script for script size calculation
    const placeholderScript = createInputScript(
      this.redeemScript,
      this.abiFunction,
      this.parameters.map(p => (p instanceof Sig ? Buffer.alloc(65, 0) : p)),
      this.selector,
    );
    const { utxos, change } = selectUtxos(allUtxos, outputs, placeholderScript);

    utxos.forEach((utxo) => {
      txBuilder.addInput(utxo.txid, utxo.vout, sequence);
    });
    outputs.forEach((output) => {
      txBuilder.addOutput(output.to, output.amount);
    });

    if (change >= DUST_LIMIT) {
      txBuilder.addOutput(this.address, change);
    }

    // Vout is a misnomer used in BITBOX, should be vin
    const inputScripts: { vout: number, script: Buffer }[] = [];

    // Convert all Sig objects to valid tx signatures for current tx
    const tx = txBuilder.transaction.buildIncomplete();
    utxos.forEach((utxo, vin) => {
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
    txBuilder.addInputScripts(inputScripts);

    return { tx: txBuilder.build(), utxos };
  }
}
