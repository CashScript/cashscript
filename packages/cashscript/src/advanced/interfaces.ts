import type { Contract } from '../Contract.js';
import type SignatureTemplate from '../SignatureTemplate.js';
import { Unlocker, Utxo } from '../interfaces.js';

export interface UnlockableUtxo extends Utxo {
  unlocker: Unlocker | ((...args: any[]) => Unlocker);
  options?: InputOptions;
}

export interface InputOptions {
  sequence?: number;
  contract?: Contract;
  params?: any[];
  template?: SignatureTemplate;
}
