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

export function isUnlockableUtxo(utxo: Utxo): utxo is UnlockableUtxo {
  return 'unlocker' in utxo;
}

export interface InputOptions {
  sequence?: number;
}

export interface GenerateUnlockingBytecodeOptions {
  transaction: Transaction;
  sourceOutputs: LibauthOutput[];
  inputIndex: number;
}

// TODO: Change this type when we understand the requirements better
export interface Unlocker {
  generateLockingBytecode: () => Uint8Array;
  generateUnlockingBytecode: (options: GenerateUnlockingBytecodeOptions) => Uint8Array;
  contract?: Contract;
  params?: FunctionArgument[];
  abiFunction?: AbiFunction;
  template?: SignatureTemplate;
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
