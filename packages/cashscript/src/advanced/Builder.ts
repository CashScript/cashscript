import {
  binToHex, decodeTransaction, encodeTransaction, hexToBin, Transaction as LibauthTransaction, WalletTemplate,
} from '@bitauth/libauth';
import delay from 'delay';
import {
  Unlocker,
  Output,
  TransactionDetails,
  UnlockableUtxo,
  Utxo,
  InputOptions,
  isUnlockableUtxo,
} from './interfaces.js';
import { NetworkProvider } from '../network/index.js';
import {
  cashScriptOutputToLibauthOutput,
  createOpReturnOutput,
  validateOutput,
} from '../utils.js';
import { FailedTransactionError } from '../Errors.js';
import { DebugResult, debugTemplate } from '../debugging.js';
import { generateTemplateEntities,
  generateTemplateEntitiesP2PKH,
  generateTemplateScripts,
  generateTemplateScriptsP2PKH,
  getBitauthUri,
  generateTemplateScenarios } from './templateBuilder.js';
import { encodeFunctionArguments } from '../Argument.js';
import { ContractUnlocker } from '../Contract.js';
import { encodeBip68 } from '@cashscript/utils';

export interface BuilderOptions {
  provider: NetworkProvider;
}

const DEFAULT_SEQUENCE = 0xfffffffe;

export class Builder {
  public provider: NetworkProvider;

  public inputs: UnlockableUtxo[] = [];
  public outputs: Output[] = [];

  private locktime: number;
  private maxFee?: bigint;
  private sequence = 0xfffffffe;
  private feePerByte: number = 1.0;
  private hardcodedFee: bigint;
  private minChange: bigint = 0n;
  private tokenChange: boolean = true;

  constructor(
    options: BuilderOptions,
  ) {
    this.provider = options.provider;
  }

  addInput(utxo: Utxo, unlocker: ContractUnlocker | Unlocker, options?: InputOptions): this {
    this.inputs.push({ ...utxo, unlocker, options: { ...options, sequence: options?.sequence ?? this.sequence } });
    return this;
  }

  addInputs( utxos: Utxo[], unlocker: ContractUnlocker | Unlocker, options?: InputOptions): this;
  addInputs(utxos: UnlockableUtxo[] ): this;
  addInputs(
    utxos: Utxo[] | UnlockableUtxo[],
    unlocker?: ContractUnlocker | Unlocker,
    options?: InputOptions,
  ): this {
    if (
      (!unlocker && utxos.some((utxo) => !isUnlockableUtxo(utxo)))
      || (unlocker && utxos.some((utxo) => isUnlockableUtxo(utxo)))
    ) {
      throw new Error('Either all UTXOs must have an individual unlocker specified, or no UTXOs must have an individual unlocker specified and a shared unlocker must be provided');
    }

    if (!unlocker) {
      this.inputs = this.inputs.concat(utxos as UnlockableUtxo[]);
      return this;
    }

    this.inputs = this.inputs.concat(utxos.map((utxo) => ({
      ...utxo,
      unlocker,
      options: { ...options, sequence: options?.sequence ?? this.sequence },
    })));
    return this;
  }

  addOutput(output: Output): this {
    return this.addOutputs([output]);
  }

  addOutputs(outputs: Output[]): this {
    outputs.forEach(validateOutput);
    this.outputs = this.outputs.concat(outputs);
    return this;
  }

  // TODO: allow uint8array for chunks
  addOpReturnOutput(chunks: string[]): this {
    this.outputs.push(createOpReturnOutput(chunks));
    return this;
  }

  withOpReturn(chunks: string[]): this {
    this.outputs.push(createOpReturnOutput(chunks));
    return this;
  }

  withAge(age: number): this {
    this.sequence = encodeBip68({ blocks: age });
    return this;
  }

  withTime(time: number): this {
    this.locktime = time;
    return this;
  }

  withHardcodedFee(hardcodedFee: bigint): this {
    this.hardcodedFee = hardcodedFee;
    return this;
  }

  withFeePerByte(feePerByte: number): this {
    this.feePerByte = feePerByte;
    return this;
  }

  withMinChange(minChange: bigint): this {
    this.minChange = minChange;
    return this;
  }

  withoutChange(): this {
    return this.withMinChange(BigInt(Number.MAX_VALUE));
  }

  withoutTokenChange(): this {
    this.tokenChange = false;
    return this;
  }

  setLocktime(locktime: number): this {
    this.locktime = locktime;
    return this;
  }

  setMaxFee(maxFee: bigint): this {
    this.maxFee = maxFee;
    return this;
  }

  private checkMaxFee(): void {
    if (!this.maxFee) return;

    const totalInputAmount = this.inputs.reduce((total, input) => total + input.satoshis, 0n);
    const totalOutputAmount = this.outputs.reduce((total, output) => total + output.amount, 0n);
    const fee = totalInputAmount - totalOutputAmount;

    if (fee > this.maxFee) {
      throw new Error(`Transaction fee of ${fee} is higher than max fee of ${this.maxFee}`);
    }
  }

  async buildTransaction(): Promise<LibauthTransaction> {
    this.locktime = this.locktime ?? await this.provider.getBlockHeight();
    this.checkMaxFee();

    const inputs = this.inputs.map((utxo) => ({
      outpointIndex: utxo.vout,
      outpointTransactionHash: hexToBin(utxo.txid),
      sequenceNumber: utxo.options?.sequence ?? DEFAULT_SEQUENCE,
      unlockingBytecode: new Uint8Array(),
    }));

    const outputs = this.outputs.map(cashScriptOutputToLibauthOutput);

    const transaction = {
      inputs,
      locktime: this.locktime,
      outputs,
      version: 2,
    };

    // Generate source outputs from inputs (for signing with SIGHASH_UTXOS)
    const sourceOutputs = this.inputs.map((input) => {
      const unlocker = typeof input.unlocker === 'function' ? input.unlocker(...(input.options?.params ?? [])) : input.unlocker;
      const sourceOutput = {
        amount: input.satoshis,
        to: unlocker.generateLockingBytecode(),
        token: input.token,
      };

      return cashScriptOutputToLibauthOutput(sourceOutput);
    });

    const inputScripts = this.inputs.map((input, inputIndex) => {
      const unlocker = typeof input.unlocker === 'function' ? input.unlocker(...(input.options?.params ?? [])) : input.unlocker;
      return unlocker.generateUnlockingBytecode({ transaction, sourceOutputs, inputIndex });
    });

    inputScripts.forEach((script, i) => {
      transaction.inputs[i].unlockingBytecode = script;
    });

    return transaction;
  }

  async build(): Promise<string> {
    const transaction = await this.buildTransaction();
    return binToHex(encodeTransaction(transaction));
  }

  // method to debug the transaction with libauth VM, throws upon evaluation error
  async debug(): Promise<DebugResult[]> {
    const { debugResult } = await this.getLibauthTemplates();
    return debugResult;
  }

  async bitauthUri(): Promise<string> {
    const { template } = await this.getLibauthTemplates();
    return getBitauthUri(template);
  }

  createCSTransaction(): any {
    const csTransaction = {
      inputs: this.inputs,
      locktime: this.locktime,
      outputs: this.outputs,
      version: 2,
    };

    return csTransaction;
  }

  async getLibauthTemplates(): Promise<{ template: WalletTemplate, debugResult: DebugResult[] }> {
    const libauthTransaction = await this.buildTransaction();
    const csTransaction = this.createCSTransaction();

    let finalTemplate: WalletTemplate = {
      $schema: 'https://ide.bitauth.com/authentication-template-v0.schema.json',
      description: 'Imported from cashscript',
      name: 'Advanced Debugging',
      supported: ['BCH_2023_05'],
      version: 0,
      entities: {},
      scripts: {},
      scenarios: {},
    };

    const finalDebugResult: DebugResult[] = [];

    const entities: any = {};
    const scripts: any = {};
    const scenarios: any = {};

    const p2pkhEntities: any = {};
    const p2pkhScripts: any = {};

    for (const [idx, input] of this.inputs.entries()) {
      if (input.options?.template) {
        // @ts-ignore
        input.template = input.options?.template;
        const index = Object.keys(p2pkhEntities).length;
        Object.assign(p2pkhEntities, generateTemplateEntitiesP2PKH(index));
        Object.assign(p2pkhScripts, generateTemplateScriptsP2PKH(input.options.template, index));
        continue;
      }

      const contract = input.options?.contract;
      if (!contract) throw new Error('Contract is required');
      // Find matching function and index from contract.unlock array
      const matchingUnlockerIndex = Object.values(contract.unlock).findIndex(fn => fn === input.unlocker);
      if (matchingUnlockerIndex === -1) {
        throw new Error('Could not find matching unlock function');
      }

      console.log('matchingUnlockerIndex', matchingUnlockerIndex);

      Object.assign(scenarios,
        generateTemplateScenarios(
          contract,
          libauthTransaction,
          csTransaction,
          contract?.artifact.abi[matchingUnlockerIndex],
          input.options?.params ?? [],
          idx,
        ),
      );

      const encodedArgs = encodeFunctionArguments(
        contract.artifact.abi[matchingUnlockerIndex],
        input.options?.params ?? [],
      );

      const entity = generateTemplateEntities(contract.artifact, contract.artifact.abi[matchingUnlockerIndex], encodedArgs);
      const script = generateTemplateScripts(
        contract.artifact,
        contract.addressType,
        contract.artifact.abi[matchingUnlockerIndex],
        encodedArgs,
        contract.encodedConstructorArgs,
      );
      Object.assign(entities, entity);
      Object.assign(scripts, script);
    }

    for (const entity of Object.values(p2pkhEntities) as { scripts?: string[] }[]) {
      if (entity.scripts) {entity.scripts = [...Object.keys(scripts), ...entity.scripts]; }
    }

    Object.assign(entities, p2pkhEntities);
    Object.assign(scripts, p2pkhScripts);

    finalTemplate = { ...finalTemplate, entities, scripts, scenarios };

    console.log(entities);
    console.log(scripts);

    // for (const input of this.inputs) {
    //   const contract = input.options?.contract;
    //   if (!contract) continue;
    //   const debugResult = debugTemplate(finalTemplate, contract.artifact);
    //   finalDebugResult.push(debugResult);
    // }

    // @ts-ignore
    return { template: finalTemplate, debugResult: finalDebugResult };
  }

  // TODO: see if we can merge with Transaction.ts
  async send(): Promise<TransactionDetails>;
  async send(raw: true): Promise<string>;
  async send(raw?: true): Promise<TransactionDetails | string> {
    const tx = await this.build();
    try {
      const txid = await this.provider.sendRawTransaction(tx);
      return raw ? await this.getTxDetails(txid, raw) : await this.getTxDetails(txid);
    } catch (e: any) {
      const reason = e.error ?? e.message;
      throw new FailedTransactionError(reason);
    }
  }

  // TODO: see if we can merge with Transaction.ts
  private async getTxDetails(txid: string): Promise<TransactionDetails>;
  private async getTxDetails(txid: string, raw: true): Promise<string>;
  private async getTxDetails(txid: string, raw?: true): Promise<TransactionDetails | string> {
    for (let retries = 0; retries < 1200; retries += 1) {
      await delay(500);
      try {
        const hex = await this.provider.getRawTransaction(txid);

        if (raw) return hex;

        const libauthTransaction = decodeTransaction(hexToBin(hex)) as LibauthTransaction;
        return { ...libauthTransaction, txid, hex };
      } catch (ignored) {
        // ignored
      }
    }

    // Should not happen
    throw new Error('Could not retrieve transaction details for over 10 minutes');
  }
}
