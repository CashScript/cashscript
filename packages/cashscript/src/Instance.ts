import { BITBOX } from 'bitbox-sdk';
import { AddressDetailsResult } from 'bitcoin-com-rest';
import { Artifact, Script, AbiFunction } from 'cashc';
import {
  bitbox,
  AddressUtil,
  ScriptUtil,
  CryptoUtil,
} from './BITBOX';
import { Transaction } from './Transaction';
import { ContractFunction } from './Contract';
import { Parameter, typecheckParameter } from './Parameter';

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
  }

  private createFunction(f: AbiFunction, selector?: number): ContractFunction {
    return (...ps: Parameter[]) => {
      if (f.inputs.length !== ps.length) {
        throw new Error(`Incorrect number of arguments passed to function ${f.name}`);
      }
      ps.forEach((p, i) => typecheckParameter(p, f.inputs[i].type));
      return new Transaction(this.address, this.network, this.redeemScript, f, ps, selector);
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
