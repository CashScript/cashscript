import { type Transaction } from '@bitauth/libauth';
import type { NetworkProvider } from './network/index.js';
import type SignatureTemplate from './SignatureTemplate.js';
import { Contract } from './Contract.js';
import { AbiFunction } from '@cashscript/utils';
import { FunctionArgument } from './Argument.js';

export interface Utxo {
  txid: string;
  vout: number;
  satoshis: bigint;
  token?: TokenDetails;
}

export interface UnlockableUtxo extends Utxo {
  unlocker: Unlocker;
  options?: InputOptions;
}

export interface StandardUnlockableUtxo extends UnlockableUtxo {
  unlocker: StandardUnlocker;
}

export function isUnlockableUtxo(utxo: Utxo): utxo is UnlockableUtxo {
  return 'unlocker' in utxo;
}

export function isStandardUnlockableUtxo(utxo: UnlockableUtxo): utxo is StandardUnlockableUtxo {
  return isStandardUnlocker(utxo.unlocker);
}

export interface InputOptions {
  sequence?: number;
}

export interface GenerateUnlockingBytecodeOptions {
  transaction: Transaction;
  sourceOutputs: LibauthOutput[];
  inputIndex: number;
}

export interface Unlocker {
  generateLockingBytecode: () => Uint8Array;
  generateUnlockingBytecode: (options: GenerateUnlockingBytecodeOptions) => Uint8Array;
}

export interface ContractUnlocker extends Unlocker {
  contract: Contract;
  params: FunctionArgument[];
  abiFunction: AbiFunction;
}

export interface P2PKHUnlocker extends Unlocker {
  template: SignatureTemplate;
}

export type StandardUnlocker = ContractUnlocker | P2PKHUnlocker;

export type PlaceholderP2PKHUnlocker = Unlocker & { placeholder: true };


export function isContractUnlocker(unlocker: Unlocker): unlocker is ContractUnlocker {
  return 'contract' in unlocker;
}

export function isP2PKHUnlocker(unlocker: Unlocker): unlocker is P2PKHUnlocker {
  return 'template' in unlocker;
}

export function isStandardUnlocker(unlocker: Unlocker): unlocker is StandardUnlocker {
  return isContractUnlocker(unlocker) || isP2PKHUnlocker(unlocker);
}

export function isPlaceholderUnlocker(unlocker: Unlocker): unlocker is PlaceholderP2PKHUnlocker {
  return 'placeholder' in unlocker;
}

export interface UtxoP2PKH extends Utxo {
  template: SignatureTemplate;
}

export function isUtxoP2PKH(utxo: Utxo): utxo is UtxoP2PKH {
  return 'template' in utxo;
}

export interface Recipient {
  to: string;
  amount: bigint;
  token?: TokenDetails;
}

export interface Output {
  to: string | Uint8Array;
  amount: bigint;
  token?: TokenDetails;
}

export interface TokenDetails {
  amount: bigint;
  category: string;
  nft?: {
    capability: 'none' | 'mutable' | 'minting';
    commitment: string;
  };
}

export interface NftObject {
  category: string;
  capability: 'none' | 'mutable' | 'minting';
  commitment: string;
}

export interface LibauthOutput {
  lockingBytecode: Uint8Array;
  valueSatoshis: bigint;
  token?: LibauthTokenDetails;
}

export interface LibauthTokenDetails {
  amount: bigint; // the amount cannot be a JSON numeric and is instead written as a decimal string in the JSON output
  category: Uint8Array;
  nft?: {
    capability: 'none' | 'mutable' | 'minting';
    commitment: Uint8Array;
  };
}

export enum SignatureAlgorithm {
  ECDSA = 0x00,
  SCHNORR = 0x01,
}

export enum HashType {
  SIGHASH_ALL = 0x01,
  SIGHASH_NONE = 0x02,
  SIGHASH_SINGLE = 0x03,
  SIGHASH_UTXOS = 0x20,
  SIGHASH_ANYONECANPAY = 0x80,
}

// Weird setup to allow both Enum parameters, as well as literal strings
// https://stackoverflow.com/questions/51433319/typescript-constructor-accept-string-for-enum
const literal = <L extends string>(l: L): L => l;
export const Network = {
  MAINNET: literal('mainnet'),
  TESTNET3: literal('testnet3'),
  TESTNET4: literal('testnet4'),
  CHIPNET: literal('chipnet'),
  MOCKNET: literal('mocknet'),
  REGTEST: literal('regtest'),
};

export type Network = (typeof Network)[keyof typeof Network];

export interface TransactionDetails extends Transaction {
  txid: string;
  hex: string;
}

export interface ContractOptions {
  provider?: NetworkProvider,
  addressType?: AddressType,
}

export type AddressType = 'p2sh20' | 'p2sh32';
