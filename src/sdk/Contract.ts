import { BITBOX, TransactionBuilder } from 'bitbox-sdk';
import { PrimitiveType, Type } from '../ast/Type';
import { encodeInt, encodeBool, encodeString } from '../util';
import { AbiFunction, Abi, AbiParameter } from './ABI';
import { Script } from '../generation/Script';
import {
  bitbox,
  NETWORKS,
  AddressUtil,
  ScriptUtil,
  CryptoUtil,
} from './BITBOX';

type ContractParameter = number | boolean | string | Buffer;

export class Contract {
  name: string;
  new: (...params: ContractParameter[]) => ContractInstance;

  constructor(
    private abi: Abi,
    private network: string = NETWORKS.testnet,
  ) {
    this.name = abi.name;
    this.createConstructor(abi.constructorParameters);
  }

  private createConstructor(parameters: AbiParameter[]) {
    this.new = (...ps: ContractParameter[]) => {
      if (parameters.length !== ps.length) throw new Error();
      const encodedParameters = ps.map((p, i) => encodeParameter(p, parameters[i].type));
      const redeemScript = [...encodedParameters, ...this.abi.uninstantiatedScript];
      return new ContractInstance(this.abi, redeemScript, this.network);
    };
  }
}

class ContractInstance {
  name: string;
  address: string;
  functions: {
    [name: string]: (...parameters: ContractParameter[]) => ContractTransaction
  }

  private bitbox: BITBOX;

  constructor(
    abi: Abi,
    private redeemScript: Script,
    private network: string,
  ) {
    this.bitbox = bitbox[network];

    this.name = abi.name;
    this.address = scriptToAddress(redeemScript, network);

    // console.log(this.bitbox.Script.)

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

  private createFunction(f: AbiFunction, selector?: number) {
    return (...ps: ContractParameter[]) => {
      if (f.parameters.length !== ps.length) throw new Error();
      const unlockScript = ps.map((p, i) => encodeParameter(p, f.parameters[i].type));
      if (selector) {
        unlockScript.push(encodeInt(selector));
      }
      return new ContractTransaction(
        this.address, unlockScript, this.redeemScript, this.network,
      );
    };
  }
}

class ContractTransaction {
  private bitbox: BITBOX;
  private txBuilder: TransactionBuilder;

  constructor(
    private address: string,
    private unlockScript: Script,
    private redeemScript: Script,
    private network: string,
  ) {
    this.bitbox = bitbox[network];
    this.txBuilder = new TransactionBuilder();
  }

  send(to: string, amount: number) {

  }
}

function encodeParameter(parameter: ContractParameter, type: Type): Buffer {
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
