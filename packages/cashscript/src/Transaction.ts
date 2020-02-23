import { BITBOX, TransactionBuilder } from 'bitbox-sdk';
import { TxnDetailsResult, AddressUtxoResult } from 'bitcoin-com-rest';
import delay from 'delay';
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
  getPreimageSize,
  buildError,
} from './util';
import { P2SH_OUTPUT_SIZE, DUST_LIMIT } from './constants';

const cramer = require('cramer-bch');

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
      throw buildError(e.error, meep(tx, inputs, this.redeemScript));
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
  ): Promise<{ tx: any, inputs: Utxo[] }> {
    const sequence = options?.age
      ? this.builder.bip68.encode({ blocks: options.age })
      : 0xfffffffe;
    const locktime = options?.time
      ? options.time
      : await this.bitbox.Blockchain.getBlockCount();

    this.builder.setLockTime(locktime);

    const { inputs, outputs } = await this.getInputsAndOutputs(
      outs,
      options?.fee,
      options?.minChange,
      options?.inputs,
    );

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
      let covenantHashType = -1;
      const completePs = this.parameters.map((p) => {
        if (!(p instanceof Sig)) return p;

        const hashtype = p.hashtype | tx.constructor.SIGHASH_BITCOINCASHBIP143;
        // First signature is used for sighash (maybe not the best way)
        if (covenantHashType < 0) covenantHashType = hashtype;

        const sighash = tx.hashForCashSignature(
          vin, ScriptUtil.encode(this.redeemScript), utxo.satoshis, hashtype,
        );
        return p.keypair
          .sign(sighash, SignatureAlgorithm.SCHNORR)
          .toScriptSignature(hashtype, SignatureAlgorithm.SCHNORR);
      });

      // This is shitty because sigHashPreimageBuf is only in James Cramer's fork
      // Will fix once it gets merged into main bitcoincashjs-lib
      const preimageTx = cramer.Transaction.fromHex(tx.toHex());
      const prevout = ScriptUtil.encode(this.redeemScript);
      const preimage = this.abiFunction.covenant
        ? preimageTx.sigHashPreimageBuf(vin, prevout, utxo.satoshis, covenantHashType)
        : undefined;
      const inputScript = createInputScript(this.redeemScript, completePs, this.selector, preimage);
      inputScripts.push({ vout: vin, script: inputScript });
    });

    // Add all generated input scripts to the transaction
    this.builder.addInputScripts(inputScripts);

    return { tx: this.builder.build(), inputs };
  }

  private async getInputsAndOutputs(
    outs: Output[],
    hardcodedFee?: number,
    minChange: number = DUST_LIMIT,
    hardcodedUtxos?: Utxo[],
    satsPerByte: number = 1.0,
  ): Promise<{ inputs: Utxo[], outputs: OutputForBuilder[] }> {
    let utxos = hardcodedUtxos;
    if (!utxos) {
      ({ utxos } = await this.bitbox.Address.utxo(this.address) as AddressUtxoResult);
    }

    // Use a placeholder script with 65-length Buffer in the place of signatures
    // and a correctly sized preimage Buffer if the function is a covenant
    // for correct size calculation of inputs
    const placeholderPreimage = this.abiFunction.covenant
      ? Buffer.alloc(getPreimageSize(ScriptUtil.encode(this.redeemScript)), 0)
      : undefined;
    const placeholderScript = createInputScript(
      this.redeemScript,
      this.parameters.map(p => (p instanceof Sig ? Buffer.alloc(65, 0) : p)),
      this.selector,
      placeholderPreimage,
    );

    // Add one extra byte per input to over-estimate txin count
    const inputSize = getInputSize(placeholderScript) + 1;

    const outputs = outs.map(output => (
      isRecipient(output) ? output : createOpReturnOutput(output)
    ));

    const amount = outputs.reduce((acc, output) => acc + output.amount, 0);
    let fee = Math.ceil(getTxSizeWithoutInputs(outputs) * satsPerByte);
    if (hardcodedFee) fee = hardcodedFee;
    let satsAvailable = 0;

    const inputs: Utxo[] = [];
    for (const utxo of utxos) {
      inputs.push(utxo);
      satsAvailable += utxo.satoshis;
      if (!hardcodedFee) fee += inputSize;
      if (satsAvailable > amount + fee) break;
    }
    let change = satsAvailable - amount - fee;

    if (change < 0) {
      throw new Error(`Insufficient balance: available (${satsAvailable}) < needed (${amount + fee}).`);
    }

    if (!hardcodedFee) {
      change -= P2SH_OUTPUT_SIZE;
    }

    if (change >= DUST_LIMIT && change >= minChange) {
      outputs.push({ to: this.address, amount: change });
    }

    return { inputs, outputs };
  }
}
