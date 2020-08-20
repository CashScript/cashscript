import {
  bigIntToBinUint64LE,
  hexToBin,
  binToHex,
  encodeTransaction,
  addressContentsToLockingBytecode,
  AddressType,
  decodeTransaction,
  Transaction as LibauthTransaction,
  instantiateSecp256k1,
} from '@bitauth/libauth';
import delay from 'delay';
import { Script, AbiFunction, Data } from 'cashc';
import {
  Utxo,
  Output,
  Recipient,
  isSignableUtxo,
} from './interfaces';
import {
  meep,
  createInputScript,
  getInputSize,
  createOpReturnOutput,
  getTxSizeWithoutInputs,
  getPreimageSize,
  buildError,
  hash160,
  sha256,
  addressToLockScript,
  createSighashPreimage,
  placeholder,
} from './util';
import { P2SH_OUTPUT_SIZE, DUST_LIMIT } from './constants';
import NetworkProvider from './network/NetworkProvider';
import SignatureTemplate from './SignatureTemplate';

const bip68 = require('bip68');

export class Transaction {
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
    private parameters: (Uint8Array | SignatureTemplate)[],
    private selector?: number,
  ) {}

  from(input: Utxo): this;
  from(inputs: Utxo[]): this;

  from(inputOrInputs: Utxo | Utxo[]): this {
    if (!Array.isArray(inputOrInputs)) {
      inputOrInputs = [inputOrInputs];
    }

    this.inputs = this.inputs.concat(inputOrInputs);

    return this;
  }

  experimentalFromP2PKH(input: Utxo, template: SignatureTemplate): this;
  experimentalFromP2PKH(inputs: Utxo[], template: SignatureTemplate): this;

  experimentalFromP2PKH(inputOrInputs: Utxo | Utxo[], template: SignatureTemplate): this {
    if (!Array.isArray(inputOrInputs)) {
      inputOrInputs = [inputOrInputs];
    }

    inputOrInputs = inputOrInputs.map(input => ({ ...input, template }));

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
    this.sequence = bip68.encode({ blocks: age });
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
    await this.setInputsAndOutputs();

    const secp256k1 = await instantiateSecp256k1();
    const bytecode = Data.scriptToBytecode(this.redeemScript);

    const inputs = this.inputs.map(utxo => ({
      outpointIndex: utxo.vout,
      outpointTransactionHash: hexToBin(utxo.txid),
      sequenceNumber: this.sequence,
      unlockingBytecode: new Uint8Array(),
    }));

    const outputs = this.outputs.map((output) => {
      const lockingBytecode = typeof output.to === 'string'
        ? addressToLockScript(output.to)
        : output.to;

      const satoshis = bigIntToBinUint64LE(BigInt(output.amount));

      return { lockingBytecode, satoshis };
    });

    const transaction = {
      inputs,
      locktime: this.locktime,
      outputs,
      version: 2,
    };

    const inputScripts: Uint8Array[] = [];

    this.inputs.forEach((utxo, i) => {
      // UTXO's with signature templates are signed using P2PKH
      if (isSignableUtxo(utxo)) {
        const pubkey = utxo.template.getPublicKey(secp256k1);
        const pubkeyHash = hash160(pubkey);

        const addressContents = { payload: pubkeyHash, type: AddressType.p2pkh };
        const prevOutScript = addressContentsToLockingBytecode(addressContents);

        const hashtype = utxo.template.getHashType();
        const preimage = createSighashPreimage(transaction, utxo, i, prevOutScript, hashtype);
        const sighash = sha256(sha256(preimage));

        const signature = utxo.template.generateSignature(sighash, secp256k1);

        const inputScript = Data.scriptToBytecode([signature, pubkey]);
        inputScripts.push(inputScript);

        return;
      }

      let covenantHashType = -1;
      const completePs = this.parameters.map((p) => {
        if (!(p instanceof SignatureTemplate)) return p;

        // First signature is used for sighash preimage (maybe not the best way)
        if (covenantHashType < 0) covenantHashType = p.getHashType();

        const preimage = createSighashPreimage(transaction, utxo, i, bytecode, p.getHashType());
        const sighash = sha256(sha256(preimage));

        return p.generateSignature(sighash, secp256k1);
      });

      const preimage = this.abiFunction.covenant
        ? createSighashPreimage(transaction, utxo, i, bytecode, covenantHashType)
        : undefined;
      const inputScript = createInputScript(this.redeemScript, completePs, this.selector, preimage);
      inputScripts.push(inputScript);
    });

    inputScripts.forEach((script, i) => {
      transaction.inputs[i].unlockingBytecode = script;
    });

    return binToHex(encodeTransaction(transaction));
  }

  async send(): Promise<LibauthTransaction>;
  async send(): Promise<string>;

  async send(raw?: true): Promise<LibauthTransaction | string> {
    const tx = await this.build();
    try {
      const txid = await this.provider.sendRawTransaction(tx);
      return raw ? this.getTxDetails(txid, raw) : this.getTxDetails(txid);
    } catch (e) {
      const reason = e.error || e.message;
      throw buildError(reason, meep(tx, this.inputs, this.redeemScript));
    }
  }

  private async getTxDetails(txid: string): Promise<LibauthTransaction>
  private async getTxDetails(txid: string, raw: true): Promise<string>;

  private async getTxDetails(txid: string, raw?: true): Promise<LibauthTransaction | string> {
    while (true) {
      await delay(500);
      try {
        const txHex = await this.provider.getRawTransaction(txid);
        return raw ? txHex : decodeTransaction(hexToBin(txHex));
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

    // Replace all SignatureTemplate with 65-length placeholder Uint8Arrays
    const placeholderParameters = this.parameters.map(p => (
      p instanceof SignatureTemplate ? placeholder(65) : p
    ));

    // Create a placeholder preimage of the correct size
    const placeholderPreimage = this.abiFunction.covenant
      ? placeholder(getPreimageSize(Data.scriptToBytecode(this.redeemScript)))
      : undefined;

    // Create a placeholder input script for size calculation using the placeholder
    // parameters and correctly sized placeholder preimage
    const placeholderScript = createInputScript(
      this.redeemScript,
      placeholderParameters,
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
