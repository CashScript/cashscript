import { BITBOX } from 'bitbox-sdk';
import { AddressDetailsResult, AddressUtxoResult } from 'bitcoin-com-rest';
import { Artifact, Script, AbiFunction } from 'cashc';
import { bitbox, AddressUtil } from './BITBOX';
import { Transaction } from './Transaction';
import { ContractFunction } from './Contract';
import { Parameter, encodeParameter } from './Parameter';
import { countOpcodes, calculateBytesize } from './util';
import { Utxo } from './interfaces';

const bch = require('trout-bch');

export class Instance {
  name: string;
  address: string;
  bytesize: number;
  opcount: number;

  functions: {
    [name: string]: ContractFunction,
  };

  private bitbox: BITBOX;

  async getBalance(): Promise<number> {
    const details = await this.bitbox.Address.details(this.address) as AddressDetailsResult;
    return details.balanceSat + details.unconfirmedBalanceSat;
  }

  async getUtxos(excludeUnconfirmed?: boolean): Promise<Utxo[]> {
    let { utxos } = await this.bitbox.Address.utxo(this.address) as AddressUtxoResult;
    if (excludeUnconfirmed) {
      utxos = utxos.filter(utxo => utxo.confirmations > 0);
    }

    return utxos;
  }

  constructor(
    artifact: Artifact,
    private redeemScript: Script,
    private network: string,
  ) {
    this.bitbox = bitbox[network];

    this.name = artifact.contractName;
    this.address = scriptToAddress(redeemScript, network);

    this.functions = {};
    if (artifact.abi.length === 1) {
      const f = artifact.abi[0];
      this.functions[f.name] = this.createFunction(f);
    } else {
      artifact.abi.forEach((f, i) => {
        this.functions[f.name] = this.createFunction(f, i);
      });
    }

    this.bytesize = calculateBytesize(redeemScript);
    this.opcount = countOpcodes(redeemScript);
  }

  private createFunction(f: AbiFunction, selector?: number): ContractFunction {
    return (...ps: Parameter[]) => {
      if (f.inputs.length !== ps.length) {
        throw new Error(`Incorrect number of arguments passed to function ${f.name}`);
      }
      const encodedPs = ps.map((p, i) => encodeParameter(p, f.inputs[i].type));
      return new Transaction(this.address, this.network, this.redeemScript, f, encodedPs, selector);
    };
  }
}

function scriptToAddress(script: Script, network: string): string {
  const scriptHash = bch.crypto.hash160(bch.script.compile(script));
  const outputScript = bch.script.scriptHash.output.encode(scriptHash);
  const address = AddressUtil.fromOutputScript(outputScript, network);
  return address;
}
