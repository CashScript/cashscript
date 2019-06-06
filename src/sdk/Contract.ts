import { BITBOX } from 'bitbox-sdk';
import { ECPair } from 'bitcoincashjs-lib';
import { AddressUtxoResult, AddressDetailsResult, TxnDetailsResult } from 'bitcoin-com-rest';
import delay from 'delay';
import { AbiFunction, Abi } from './ABI';
import { Script } from '../compiler/generation/Script';
import {
  bitbox,
  AddressUtil,
  ScriptUtil,
  CryptoUtil,
} from './BITBOX';
import { DUST_LIMIT } from './constants';
import {
  createInputScript,
  selectUtxos,
  typecheckParameter,
  encodeParameter,
} from './transaction-util';
import { SignatureAlgorithm, TxOptions, Output } from './interfaces';
import { meep } from '../util';
import { compileFile, importAbi, exportAbi } from './cashscript-sdk';

export type Parameter = number | boolean | string | Buffer | Sig;
export class Sig {
  constructor(public keypair: ECPair, public hashtype: number) {}
}

export class Contract {
  name: string;
  new: (...params: Parameter[]) => Instance;
  deployed: (at?: string) => Instance;

  static fromCashFile(fn: string, network?: string): Contract {
    const abi = compileFile(fn);
    return new Contract(abi, network);
  }

  static fromAbiFile(fn: string, network?: string): Contract {
    const abi = importAbi(fn);
    return new Contract(abi, network);
  }

  export(fn: string): void {
    exportAbi(this.abi, fn);
  }

  constructor(
    public abi: Abi,
    private network: string = 'testnet',
  ) {
    this.name = abi.name;

    this.new = (...ps: Parameter[]) => {
      if (abi.constructorParameters.length !== ps.length) throw new Error();
      const encodedParameters = ps
        .map((p, i) => encodeParameter(p, abi.constructorParameters[i].type))
        .reverse();

      const redeemScript = [...encodedParameters, ...this.abi.uninstantiatedScript];
      const instance = new Instance(this.abi, redeemScript, this.network);

      const deployedContracts = this.abi.networks[this.network] || {};
      deployedContracts[instance.address] = redeemScript;
      this.abi.networks[this.network] = deployedContracts;

      return instance;
    };

    this.deployed = (at?: string) => {
      if (!this.abi.networks[this.network]) throw new Error('No registered deployed contracts');
      const redeemScript = at
        ? this.abi.networks[this.network][at]
        : Object.values(this.abi.networks[this.network])[0];

      if (!redeemScript) throw new Error(`No registered contract deployed at ${at}`);

      return new Instance(this.abi, redeemScript, this.network);
    };
  }
}

type ContractFunction = (...parameters: Parameter[]) => Transaction

export class Instance {
  name: string;
  address: string;
  functions: {
    [name: string]: ContractFunction,
  };

  private bitbox: BITBOX;

  async getBalance() {
    const details = await this.bitbox.Address.details(this.address) as AddressDetailsResult;
    return details.balanceSat + details.unconfirmedBalanceSat;
  }

  constructor(
    abi: Abi,
    private redeemScript: Script,
    private network: string,
  ) {
    this.bitbox = bitbox[network];

    this.name = abi.name;
    this.address = scriptToAddress(redeemScript, network);

    this.functions = {};
    if (abi.functions.length === 1) {
      const f = abi.functions[0];
      this.functions[f.name] = this.createFunction(f);
    } else {
      abi.functions.forEach((f, i) => {
        this.functions[f.name] = this.createFunction(f, i);
      });
    }
  }

  private createFunction(f: AbiFunction, selector?: number): ContractFunction {
    return (...ps: Parameter[]) => {
      if (f.parameters.length !== ps.length) throw new Error();
      ps.forEach((p, i) => typecheckParameter(p, f.parameters[i].type));
      return new Transaction(this.address, this.network, this.redeemScript, f, ps, selector);
    };
  }
}

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
      console.log(toOrOutputs, amountOrOptions);
      throw new Error();
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

function scriptToAddress(script: Script, network: string): string {
  return AddressUtil.fromOutputScript(
    ScriptUtil.encodeP2SHOutput(
      CryptoUtil.hash160(
        ScriptUtil.encode(script),
      ),
    ),
    network,
  );
}
