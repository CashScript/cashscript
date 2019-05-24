import { BITBOX } from 'bitbox-sdk';
import { ECPair } from 'bitcoincashjs-lib';
import { AddressUtxoResult, AddressDetailsResult, TxnDetailsResult } from 'bitcoin-com-rest';
import delay from 'delay';
import { PrimitiveType, Type } from '../ast/Type';
import {
  encodeInt,
  encodeBool,
  encodeString,
} from '../util';
import { AbiFunction, Abi, AbiParameter } from './ABI';
import { Script } from '../generation/Script';
import {
  bitbox,
  AddressUtil,
  ScriptUtil,
  CryptoUtil,
} from './BITBOX';

type Parameter = number | boolean | string | Buffer | Sig;
export class Sig {
  constructor(public keypair: ECPair, public hashtype: number) {}
}

export class Contract {
  name: string;
  new: (...params: Parameter[]) => Instance;

  constructor(
    private abi: Abi,
    private network: string = 'mainnet',
  ) {
    this.name = abi.name;
    this.createConstructor(abi.constructorParameters);
  }

  private createConstructor(parameters: AbiParameter[]) {
    this.new = (...ps: Parameter[]) => {
      if (parameters.length !== ps.length) throw new Error();
      const encodedParameters = ps
        .map((p, i) => encodeParameter(p, parameters[i].type))
        .reverse();
      const redeemScript = [...encodedParameters, ...this.abi.uninstantiatedScript];
      return new Instance(this.abi, redeemScript, this.network);
    };
  }
}

interface Output {
  to: string;
  amount: number;
}
type ContractFunction = (parameters: Parameter[], output: Output) => Promise<TxnDetailsResult>

class Instance {
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
    return async (ps: Parameter[], output: Output) => {
      if (f.parameters.length !== ps.length) throw new Error();
      ps.forEach((p, i) => typecheckParameter(p, f.parameters[i].type));

      const txBuilder = new this.bitbox.TransactionBuilder(this.network);
      const { utxos } = await this.bitbox.Address.utxo(this.address) as AddressUtxoResult;

      // Add inputs and outputs
      utxos.forEach((utxo) => {
        txBuilder.addInput(utxo.txid, utxo.vout);
      });
      txBuilder.addOutput(output.to, output.amount);

      // Vout is a misnomer used in BITBOX, should be vin
      const inputScripts: { vout: number, script: Buffer }[] = [];

      // Convert all Sig objects to valid tx signatures for current tx
      const tx = txBuilder.transaction.buildIncomplete();
      utxos.forEach((utxo, vin) => {
        const cleanedPs = ps.map((p) => {
          if (!(p instanceof Sig)) return p;

          // Bitcoin cash replay protection
          const hashtype = p.hashtype | tx.constructor.SIGHASH_BITCOINCASHBIP143;

          const sighash = tx.hashForCashSignature(
            vin, ScriptUtil.encode(this.redeemScript), utxo.satoshis, hashtype,
          );
          const sig = p.keypair.sign(sighash).toScriptSignature(hashtype);

          return sig;
        });

        // Create unlock script / redeemScriptSig
        const unlockScript = cleanedPs
          .map((p, i) => encodeParameter(p, f.parameters[i]))
          .reverse();
        if (selector) unlockScript.unshift(encodeInt(selector));

        // Create total input script / scriptSig
        const inputScript = ScriptUtil.encodeP2SHInput(
          ScriptUtil.encode(unlockScript),
          ScriptUtil.encode(this.redeemScript),
        );
        inputScripts.push({ vout: vin, script: inputScript });
      });

      // Add all generated input scripts to the transaction
      txBuilder.addInputScripts(inputScripts);

      const finalTx = txBuilder.build();

      const txid = await this.bitbox.RawTransactions.sendRawTransaction(finalTx.toHex());
      await delay(2000);

      return await this.bitbox.Transaction.details(txid) as TxnDetailsResult;

      // TODO: Fee calculation, change, proper utxo selection etc etc.
    };
  }
}

function typecheckParameter(parameter: Parameter, type: Type): void {
  switch (type) {
    case PrimitiveType.BOOL:
      if (typeof parameter === 'boolean') return;
      throw new Error();
    case PrimitiveType.INT:
      if (typeof parameter === 'number') return;
      throw new Error();
    case PrimitiveType.STRING:
      if (typeof parameter !== 'string') return;
      throw new Error();
    case PrimitiveType.SIG:
      if (typeof parameter === 'string') return;
      if (parameter instanceof Buffer) return;
      if (parameter instanceof Sig) return;
      throw new Error();
    default:
      if (typeof parameter === 'string') return;
      if (parameter instanceof Buffer) return;
      throw new Error();
  }
}

function encodeParameter(parameter: Parameter, type: Type): Buffer {
  switch (type) {
    case PrimitiveType.BOOL:
      if (typeof parameter !== 'boolean') throw new Error();
      return encodeBool(parameter);
    case PrimitiveType.INT:
      if (typeof parameter !== 'number') throw new Error();
      return encodeInt(parameter);
    case PrimitiveType.STRING:
      if (typeof parameter !== 'string') throw new Error();
      return encodeString(parameter);
    default:
      if (typeof parameter === 'string') {
        if (parameter.startsWith('0x')) {
          parameter = parameter.slice(2);
        }

        return Buffer.from(parameter, 'hex');
      }
      if (!(parameter instanceof Buffer)) throw Error();
      return parameter;
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
