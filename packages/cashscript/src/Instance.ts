import { Artifact, Script, AbiFunction } from 'cashc';
import { Transaction } from './Transaction';
import { ContractFunction } from './Contract';
import { Parameter, encodeParameter } from './Parameter';
import { countOpcodes, calculateBytesize, scriptToAddress } from './util';
import { Utxo } from './interfaces';
import NetworkProvider from './network/NetworkProvider';
import BitboxNetworkProvider from './network/BitboxNetworkProvider';

export class Instance {
  name: string;
  address: string;
  bytesize: number;
  opcount: number;

  functions: {
    [name: string]: ContractFunction,
  };

  private provider: NetworkProvider;

  async getBalance(): Promise<number> {
    const utxos = await this.getUtxos();
    return utxos.reduce((acc, utxo) => acc + utxo.satoshis, 0);
  }

  async getUtxos(): Promise<Utxo[]> {
    return this.provider.getUtxos(this.address);
  }

  constructor(
    artifact: Artifact,
    private redeemScript: Script,
    private network: string,
  ) {
    this.provider = new BitboxNetworkProvider();

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
