import { binToHex } from '@bitauth/libauth';
import {
  Artifact,
  Data,
  Script,
  AbiFunction,
} from 'cashc';
import { Transaction } from './Transaction';
import { Argument, encodeArgument } from './Argument';
import { Utxo } from './interfaces';
import NetworkProvider from './network/NetworkProvider';
import { scriptToAddress, calculateBytesize, countOpcodes } from './util';
import SignatureTemplate from './SignatureTemplate';
import { ElectrumNetworkProvider } from './network';

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
    constructorArgs: Argument[],
    private provider: NetworkProvider = new ElectrumNetworkProvider(),
  ) {
    const expectedProperties = ['abi', 'bytecode', 'constructorInputs', 'contractName'];
    if (!expectedProperties.every((property) => property in artifact)) {
      throw new Error('Invalid or incomplete artifact provided');
    }

    if (artifact.constructorInputs.length !== constructorArgs.length) {
      throw new Error(`Incorrect number of arguments passed to ${artifact.contractName} constructor`);
    }

    // Encode arguments (this also performs type checking)
    const encodedArgs = constructorArgs
      .map((arg, i) => encodeArgument(arg, artifact.constructorInputs[i].type))
      .reverse();

    // Check there's no signature templates in the constructor
    if (encodedArgs.some((arg) => arg instanceof SignatureTemplate)) {
      throw new Error('Cannot use signatures in constructor');
    }

    this.redeemScript = [
      ...encodedArgs as Uint8Array[],
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

  getRedeemScriptHex(): string {
    return binToHex(Data.scriptToBytecode(this.redeemScript));
  }

  private createFunction(abiFunction: AbiFunction, selector?: number): ContractFunction {
    return (...args: Argument[]) => {
      if (abiFunction.inputs.length !== args.length) {
        throw new Error(`Incorrect number of arguments passed to function ${abiFunction.name}`);
      }

      // Encode passed args (this also performs type checking)
      const encodedArgs = args
        .map((arg, i) => encodeArgument(arg, abiFunction.inputs[i].type));

      return new Transaction(
        this.address,
        this.provider,
        this.redeemScript,
        abiFunction,
        encodedArgs,
        selector,
      );
    };
  }
}

export type ContractFunction = (...args: Argument[]) => Transaction;
