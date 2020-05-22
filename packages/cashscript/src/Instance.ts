import {
  BITBOX,
} from 'bitbox-sdk';
import {
  AddressDetailsResult,
  AddressUtxoResult,
  AddressUnconfirmedResult,
} from 'bitcoin-com-rest';
import { Artifact, Script, AbiFunction } from 'cashc';
import {
  Utxo,
} from './interfaces';
import {
  bitbox,
  AddressUtil,
  ScriptUtil,
  CryptoUtil,
} from './BITBOX';
import { Transaction } from './Transaction';
import { ContractFunction } from './Contract';
import { Parameter, encodeParameter } from './Parameter';
import {
  countOpcodes,
  calculateBytesize,
} from './util';

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

  private async getUnconfirmed(): Promise<Utxo[]> {
    const { utxos } = await this.bitbox.Address
      .unconfirmed(this.address) as AddressUnconfirmedResult;
    return utxos;
  }

  private async getUtxo(): Promise<Utxo[]> {
    const { utxos } = await this.bitbox.Address.utxo(this.address) as AddressUtxoResult;
    return utxos;
  }

  async getUtxos(excludeUnconfirmed?: boolean): Promise<Utxo[]> {
    const promises = [this.getUtxo()];
    if (!excludeUnconfirmed) {
      promises.push(this.getUnconfirmed());
    }
    const results = await Promise.all(promises);
    return results.reduce((memo, utxos) => memo.concat(utxos), []);
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
  return AddressUtil.fromOutputScript(
    ScriptUtil.encodeP2SHOutput(
      CryptoUtil.hash160(
        ScriptUtil.encode(script),
      ),
    ),
    network,
  );
}
