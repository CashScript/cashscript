import {
  Artifacts,
  Artifact,
  CashCompiler,
  Data,
} from 'cashc';
import { Transaction } from './Transaction';
import { Instance } from './Instance';
import { Parameter, encodeParameter } from './Parameter';

export class Contract {
  name: string;
  new: (...params: Parameter[]) => Instance;
  deployed: (at?: string) => Instance;

  static fromCashFile(fn: string, network?: string): Contract {
    const artifact = CashCompiler.compileFile(fn);
    return new Contract(artifact, network);
  }

  static fromArtifact(fn: string, network?: string): Contract {
    const artifact = Artifacts.require(fn);
    return new Contract(artifact, network);
  }

  export(fn: string): void {
    Artifacts.export(this.artifact, fn);
  }

  constructor(
    public artifact: Artifact,
    private network: string = 'testnet',
  ) {
    if (!artifact.abi || !artifact.bytecode
     || !artifact.constructorInputs || !artifact.contractName
    ) {
      throw new Error('Invalid or incomplete artifact provided');
    }

    this.name = artifact.contractName;

    this.new = (...ps: Parameter[]) => {
      if (artifact.constructorInputs.length !== ps.length) {
        throw new Error(`Incorrect number of arguments passed to ${artifact.contractName} constructor`);
      }
      const encodedParameters = ps
        .map((p, i) => encodeParameter(p, artifact.constructorInputs[i].type))
        .reverse();

      const redeemScript = [...encodedParameters, ...Data.asmToScript(this.artifact.bytecode)];
      const instance = new Instance(this.artifact, redeemScript, this.network);

      const deployedContracts = this.artifact.networks[this.network] || {};
      deployedContracts[instance.address] = Data.scriptToAsm(redeemScript);
      this.artifact.networks[this.network] = deployedContracts;
      this.artifact.updatedAt = new Date().toISOString();

      return instance;
    };

    this.deployed = (at?: string) => {
      if (!this.artifact.networks[this.network]) throw new Error('No registered deployed contracts');
      const redeemScript = at
        ? this.artifact.networks[this.network][at]
        : Object.values(this.artifact.networks[this.network])[0];

      if (!redeemScript) throw new Error(`No registered contract deployed at ${at}`);

      return new Instance(this.artifact, Data.asmToScript(redeemScript), this.network);
    };
  }
}

export type ContractFunction = (...parameters: Parameter[]) => Transaction
