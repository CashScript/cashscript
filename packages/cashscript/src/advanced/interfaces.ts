import type SignatureTemplate from '../SignatureTemplate.js';
import type { Contract, ContractUnlocker } from '../Contract.js';
import { Utxo, Unlocker } from '../interfaces.js';
import { NetworkProvider } from '../network/index.js';

export interface UnlockableUtxo extends Utxo {
  unlocker: ContractUnlocker | Unlocker;
  options?: InputOptions;
}

export interface InputOptions {
  sequence?: number;
  contract?: Contract;
  params?: any[];
  selector?: number;
  template?: SignatureTemplate;
}

export interface BuilderOptions {
  provider: NetworkProvider;
}