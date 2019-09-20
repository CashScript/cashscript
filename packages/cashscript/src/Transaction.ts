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
  Recipient,
  isRecipient,
  isOpReturn,
  OpReturn,
  OutputForBuilder,
} from './interfaces';
import {
  meep,
  createInputScript,
  inputSize,
  createOpReturnScript,
} from './transaction-util';
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
    const { tx } = await this.createTransaction(outputs, options);
    const txid = await this.bitbox.RawTransactions.sendRawTransaction(tx.toHex());
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
    await meep(tx, inputs, this.redeemScript);
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

  private async getInputsAndOutputs(
    outs: Output[],
    satsPerByte: number = 1.0,
  ): Promise<{ inputs: Utxo[], outputs: OutputForBuilder[] }> {
    const { utxos } = await this.bitbox.Address.utxo(this.address) as AddressUtxoResult;

    // Use a placeholder script with 65-length Buffer in the place of signatures
    // for correct size calculation of inputs
    const placeholderScript = createInputScript(
      this.redeemScript,
      this.abiFunction,
      this.parameters.map(p => (p instanceof Sig ? Buffer.alloc(65, 0) : p)),
      this.selector,
    );
    const inputScriptSize = inputSize(placeholderScript);

    // Split outputs into regular recipients and op return outputs
    const recipients = outs
      .filter(output => isRecipient(output)) as Recipient[];
    const opReturnScripts = outs
      .filter(output => isOpReturn(output))
      .map(output => createOpReturnScript(output as OpReturn));

    // Calculate byte size of recipient outputs
    let initialFee = BitcoinCashUtil.getByteCount({}, { P2PKH: recipients.length + 1 });
    // Calculate byte size of OP_RETURNs (+ 10 to account for ammount of 0000000000000000)
    initialFee = opReturnScripts.reduce((acc, script) => acc + script.byteLength + 10, initialFee);
    // Calculate fee = byte size * sats/byte
    initialFee = Math.ceil(initialFee * satsPerByte);

    let satsNeeded = recipients.reduce((acc, output) => acc + output.amount, initialFee);
    let satsAvailable = 0;

    const inputs: Utxo[] = [];
    for (const utxo of utxos) {
      inputs.push(utxo);
      satsAvailable += utxo.satoshis;
      satsNeeded += inputScriptSize;
      if (satsAvailable > satsNeeded) break;
    }

    const change = satsAvailable - satsNeeded;

    if (change < 0) {
      throw new Error(`Insufficient balance: available (${satsAvailable}) < needed (${satsNeeded}).`);
    } else if (change >= DUST_LIMIT) {
      recipients.push({ to: this.address, amount: change });
    }

    const outputs = (opReturnScripts.map(o => ({ to: o, amount: 0 })) as OutputForBuilder[])
      .concat(recipients);

    return { inputs, outputs };
  }
}
