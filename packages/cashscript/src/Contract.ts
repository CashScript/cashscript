import {
  Artifact,
  Data,
  Script,
  AbiFunction,
} from 'cashc';
import { Transaction } from './Transaction';
import { Parameter, encodeParameter, SignatureTemplate } from './Parameter';
import { Utxo } from './interfaces';
import NetworkProvider from './network/NetworkProvider';
import { scriptToAddress, calculateBytesize, countOpcodes } from './util';

export class Contract {
  name: string;
  address: string;
  bytesize: number;
  opcount: number;

  functions: {
    [name: string]: ContractFunction,
  };

  private redeemScript: Script;

  constructor(
    private artifact: Artifact,
    private provider: NetworkProvider,
    constructorParameters: Parameter[],
  ) {
    if (!artifact.abi || !artifact.bytecode
     || !artifact.constructorInputs || !artifact.contractName
    ) {
      throw new Error('Invalid or incomplete artifact provided');
    }

    if (artifact.constructorInputs.length !== constructorParameters.length) {
      throw new Error(`Incorrect number of arguments passed to ${artifact.contractName} constructor`);
    }

    // Encode parameters (this also performs type checking)
    const encodedParameters = constructorParameters
      .map((p, i) => encodeParameter(p, artifact.constructorInputs[i].type))
      .reverse();

    // Check there's no signature templates in the constructor
    if (encodedParameters.some(p => p instanceof SignatureTemplate)) {
      throw new Error('Cannot use signatures in constructor');
    }

    this.redeemScript = [
      ...encodedParameters as Buffer[],
      ...Data.asmToScript(this.artifact.bytecode),
    ];

    // Populate the functions object with the contract's functions
    // (with a special case for single function, which has no "function selector")
    this.functions = {};
    if (artifact.abi.length === 1) {
      const f = artifact.abi[0];
      this.functions[f.name] = this.createFunction(f);
    } else {
      artifact.abi.forEach((f, i) => {
        this.functions[f.name] = this.createFunction(f, i);
      });
    }

    this.name = artifact.contractName;
    this.address = scriptToAddress(this.redeemScript, this.provider.network);
    this.bytesize = calculateBytesize(this.redeemScript);
    this.opcount = countOpcodes(this.redeemScript);
  }

  async getBalance(): Promise<number> {
    const utxos = await this.getUtxos();
    return utxos.reduce((acc, utxo) => acc + utxo.satoshis, 0);
  }

  async getUtxos(): Promise<Utxo[]> {
    return this.provider.getUtxos(this.address);
  }

  private createFunction(abiFunction: AbiFunction, selector?: number): ContractFunction {
    return (...parameters: Parameter[]) => {
      if (abiFunction.inputs.length !== parameters.length) {
        throw new Error(`Incorrect number of arguments passed to function ${abiFunction.name}`);
      }

      // Encode passed parameters (this also performs type checking)
      const encodedParameters = parameters
        .map((p, i) => encodeParameter(p, abiFunction.inputs[i].type));

      return new Transaction(
        this.address,
        this.provider,
        this.redeemScript,
        abiFunction,
        encodedParameters,
        selector,
      );
    };
  }
}

export type ContractFunction = (...parameters: Parameter[]) => Transaction;
