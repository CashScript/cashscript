import {
  Artifacts,
  Artifact,
  CashCompiler,
  Data,
} from 'cashc';
import * as fs from 'fs';
import { Transaction } from './Transaction';
import { Instance } from './Instance';
import { Parameter, encodeParameter, Sig } from './Parameter';

export class Contract {
  name: string;
  new: (...params: Parameter[]) => Instance;
  deployed: (at?: string) => Instance;

  static compile(fnOrString: string, network?: string): Contract {
    const artifact = fs && fs.existsSync && fs.existsSync(fnOrString)
      ? CashCompiler.compileFile(fnOrString)
      : CashCompiler.compileString(fnOrString);

    return new Contract(artifact, network);
  }

  static import(fnOrArtifact: string | Artifact, network?: string): Contract {
    const artifact = typeof fnOrArtifact === 'string'
      ? Artifacts.require(fnOrArtifact)
      : fnOrArtifact;

    return new Contract(artifact, network);
  }

  // @deprecated
  static fromCashFile(fnOrString: string, network?: string): Contract {
    return this.compile(fnOrString, network);
  }

  // @deprecated
  static fromArtifact(fnOrArtifact: string | Artifact, network?: string): Contract {
    return this.import(fnOrArtifact, network);
  }

  export(fn?: string): Artifact {
    if (typeof fn !== 'undefined') Artifacts.export(this.artifact, fn);
    return this.artifact;
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

      // Check there's no sigs in the constructor
      if (encodedParameters.some(p => p instanceof Sig)) {
        throw new Error('Cannot use signatures in constructor');
      }

      const redeemScript = [
        ...encodedParameters as Buffer[],
        ...Data.asmToScript(this.artifact.bytecode),
      ];
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

export type ContractFunction = (...parameters: Parameter[]) => Transaction;
