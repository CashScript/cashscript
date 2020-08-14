import { ECPair } from 'bitcoincashjs-lib';
import { TransactionBuilder } from 'bitbox-sdk';
import { TxnDetailsResult } from 'bitcoin-com-rest';
import delay from 'delay';
import { Script, AbiFunction } from 'cashc';
import { SignatureTemplate } from './Parameter';
import {
  SignatureAlgorithm,
  Utxo,
  Output,
  Recipient,
  isUtxoWithKeyPair,
  HashType,
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
import NetworkProvider from './network/NetworkProvider';

const cramer = require('cramer-bch');
const bch = require('trout-bch');

export class Transaction {
  private builder: TransactionBuilder;

  private inputs: Utxo[] = [];
  private outputs: Output[] = [];

  private sequence = 0xfffffffe;
  private locktime: number;
  private hardcodedFee: number;
  private feePerByte = 1.0;
  private minChange = DUST_LIMIT;

  constructor(
    private address: string,
    private provider: NetworkProvider,
    private redeemScript: Script,
    private abiFunction: AbiFunction,
    private parameters: (Buffer | SignatureTemplate)[],
    private selector?: number,
  ) {
    this.builder = new TransactionBuilder(this.provider.network);
  }

  from(input: Utxo): this;
  from(inputs: Utxo[]): this;

  from(inputOrInputs: Utxo | Utxo[]): this {
    if (!Array.isArray(inputOrInputs)) {
      inputOrInputs = [inputOrInputs];
    }

    this.inputs = this.inputs.concat(inputOrInputs);

    return this;
  }

  experimentalFromP2PKH(input: Utxo, keypair: ECPair): this;
  experimentalFromP2PKH(inputs: Utxo[], keypair: ECPair): this;

  experimentalFromP2PKH(inputOrInputs: Utxo | Utxo[], keypair: ECPair): this {
    if (!Array.isArray(inputOrInputs)) {
      inputOrInputs = [inputOrInputs];
    }

    inputOrInputs = inputOrInputs.map(input => ({ ...input, keypair }));

    this.inputs = this.inputs.concat(inputOrInputs);

    return this;
  }

  to(to: string, amount: number): this;
  to(outputs: Recipient[]): this;

  to(toOrOutputs: string | Recipient[], amount?: number): this {
    if (typeof toOrOutputs === 'string' && typeof amount === 'number') {
      this.outputs.push({ to: toOrOutputs, amount });
    } else if (Array.isArray(toOrOutputs) && amount === undefined) {
      this.outputs = this.outputs.concat(toOrOutputs);
    } else {
      throw new Error('Incorrect arguments passed to function \'to\'');
    }
    return this;
  }

  withOpReturn(chunks: string[]): this {
    this.outputs.push(createOpReturnOutput(chunks));
    return this;
  }

  withAge(age: number): this {
    this.sequence = this.builder.bip68.encode({ blocks: age });
    return this;
  }

  withTime(time: number): this {
    this.locktime = time;
    return this;
  }

  withHardcodedFee(hardcodedFee: number): this {
    this.hardcodedFee = hardcodedFee;
    return this;
  }

  withFeePerByte(feePerByte: number): this {
    this.feePerByte = feePerByte;
    return this;
  }

  withMinChange(minChange: number): this {
    this.minChange = minChange;
    return this;
  }

  async build(): Promise<string> {
    this.locktime = this.locktime || await this.provider.getBlockHeight();
    this.builder.setLockTime(this.locktime);
    await this.setInputsAndOutputs();

    this.inputs.forEach((utxo) => {
      this.builder.addInput(utxo.txid, utxo.vout, this.sequence);
    });

    this.outputs.forEach((output) => {
      this.builder.addOutput(output.to, output.amount);
    });

    // Vout is a misnomer used in BITBOX, should be vin
    const inputScripts: { vout: number, script: Buffer }[] = [];

    // Convert all SignatureTemplate objects to valid tx signatures for current tx
    const tx = this.builder.transaction.buildIncomplete();
    this.inputs.forEach((utxo: Utxo, vin: number) => {
      // UTXO's with key pairs are signed with the key pair using P2PKH
      if (isUtxoWithKeyPair(utxo)) {
        const pubkey = utxo.keypair.getPublicKeyBuffer();
        const pubkeyHash = bch.crypto.hash160(pubkey);
        const prevOutScript = bch.script.pubKeyHash.output.encode(pubkeyHash);

        const hashtype = HashType.SIGHASH_ALL | tx.constructor.SIGHASH_BITCOINCASHBIP143;
        const sighash = tx.hashForCashSignature(
          vin, prevOutScript, utxo.satoshis, hashtype,
        );

        const signature = utxo.keypair
          .sign(sighash, SignatureAlgorithm.SCHNORR)
          .toScriptSignature(hashtype, SignatureAlgorithm.SCHNORR);

        const inputScript = bch.script.pubKeyHash.input.encode(signature, pubkey);
        inputScripts.push({ vout: vin, script: inputScript });

        return;
      }

      let covenantHashType = -1;
      const completePs = this.parameters.map((p) => {
        if (!(p instanceof SignatureTemplate)) return p;

        const hashtype = p.hashtype | tx.constructor.SIGHASH_BITCOINCASHBIP143;
        // First signature is used for sighash preimage (maybe not the best way)
        if (covenantHashType < 0) covenantHashType = hashtype;

        const sighash = tx.hashForCashSignature(
          vin, bch.script.compile(this.redeemScript), utxo.satoshis, hashtype,
        );

        return p.keypair
          .sign(sighash, SignatureAlgorithm.SCHNORR)
          .toScriptSignature(hashtype, SignatureAlgorithm.SCHNORR);
      });

      // This is shitty because sigHashPreimageBuf is only in James Cramer's fork
      // Will fix once it gets merged into main bitcoincashjs-lib
      const preimageTx = cramer.Transaction.fromHex(tx.toHex());
      const prevout = bch.script.compile(this.redeemScript);
      const preimage = this.abiFunction.covenant
        ? preimageTx.sigHashPreimageBuf(vin, prevout, utxo.satoshis, covenantHashType)
        : undefined;
      const inputScript = createInputScript(this.redeemScript, completePs, this.selector, preimage);
      inputScripts.push({ vout: vin, script: inputScript });
    });

    this.builder.addInputScripts(inputScripts);
    return this.builder.build().toHex();
  }

  // TODO: Update return type after updating to libauth
  async send(): Promise<TxnDetailsResult> {
    const tx = await this.build();
    try {
      const txid = await this.provider.sendRawTransaction(tx);
      return this.getTxDetails(txid);
    } catch (e) {
      const reason = e.error || e.message;
      throw buildError(reason, meep(tx, this.inputs, this.redeemScript));
    }
  }

  // TODO: Update return type after updating to libauth
  private async getTxDetails(txid: string): Promise<TxnDetailsResult> {
    while (true) {
      await delay(500);
      try {
        const txHex = await this.provider.getRawTransaction(txid);
        return bch.Transaction.fromHex(txHex);
      } catch (ignored) {
        // ignored
      }
    }
  }

  async meep(): Promise<string> {
    const tx = await this.build();
    return meep(tx, this.inputs, this.redeemScript);
  }

  private async setInputsAndOutputs(): Promise<void> {
    if (this.outputs.length === 0) {
      throw Error('Attempted to build a transaction without outputs');
    }

    // Use a placeholder script with 65-length Buffer in the place of signatures
    // and a correctly sized preimage Buffer if the function is a covenant
    // for correct size calculation of inputs
    const placeholderPreimage = this.abiFunction.covenant
      ? Buffer.alloc(getPreimageSize(bch.script.compile(this.redeemScript)), 0)
      : undefined;
    const placeholderScript = createInputScript(
      this.redeemScript,
      this.parameters.map(p => (p instanceof SignatureTemplate ? Buffer.alloc(65, 0) : p)),
      this.selector,
      placeholderPreimage,
    );

    // Add one extra byte per input to over-estimate tx-in count
    const inputSize = getInputSize(placeholderScript) + 1;

    // Calculate amount to send and base fee (excluding additional fees per UTXO)
    const amount = this.outputs.reduce((acc, output) => acc + output.amount, 0);
    let fee = this.hardcodedFee
      ? this.hardcodedFee
      : Math.ceil(getTxSizeWithoutInputs(this.outputs) * this.feePerByte);

    // Select and gather UTXOs and calculate fees and available funds
    let satsAvailable = 0;
    if (this.inputs.length > 0) {
      // If inputs are already defined, the user provided the UTXOs
      // and we perform no further UTXO selection
      if (!this.hardcodedFee) fee += this.inputs.length * inputSize;
      satsAvailable = this.inputs.reduce((acc, input) => acc + input.satoshis, 0);
    } else {
      // If inputs are not defined yet, we retrieve the contract's UTXOs and perform selection
      const utxos = await this.provider.getUtxos(this.address);

      // We sort the UTXOs mainly so there is consistent behaviour between network providers
      // even if they report UTXOs in a different order
      utxos.sort((a, b) => b.satoshis - a.satoshis);

      for (const utxo of utxos) {
        this.inputs.push(utxo);
        satsAvailable += utxo.satoshis;
        if (!this.hardcodedFee) fee += inputSize;
        if (satsAvailable > amount + fee) break;
      }
    }

    // Calculate change and check available funds
    let change = satsAvailable - amount - fee;

    if (change < 0) {
      throw new Error(`Insufficient funds: available (${satsAvailable}) < needed (${amount + fee}).`);
    }

    // Account for the fee of a change output
    if (!this.hardcodedFee) {
      change -= P2SH_OUTPUT_SIZE;
    }

    // Add a change output if applicable
    if (change >= DUST_LIMIT && change >= this.minChange) {
      this.outputs.push({ to: this.address, amount: change });
    }
  }
}
