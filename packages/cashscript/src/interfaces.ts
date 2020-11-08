import { Transaction } from '@bitauth/libauth';
import SignatureTemplate from './SignatureTemplate';

export interface Utxo {
  txid: string;
  vout: number;
  satoshis: number;
}

export interface SignableUtxo extends Utxo {
  template: SignatureTemplate;
}

export function isSignableUtxo(utxo: Utxo): utxo is SignableUtxo {
  return 'template' in utxo;
}

export interface Recipient {
  to: string;
  amount: number;
}

export interface Output {
  to: string | Uint8Array;
  amount: number;
}

export enum SignatureAlgorithm {
  ECDSA = 0x00,
  SCHNORR = 0x01,
}

export enum HashType {
  SIGHASH_ALL = 0x01,
  SIGHASH_NONE = 0x02,
  SIGHASH_SINGLE = 0x03,
  SIGHASH_ANYONECANPAY = 0x80,
}

// Weird setup to allow both Enum parameters, as well as literal strings
// https://stackoverflow.com/questions/51433319/typescript-constructor-accept-string-for-enum
const literal = <L extends string>(l: L): L => l;
export const Network = {
  MAINNET: literal('mainnet'),
  TESTNET: literal('testnet'),
  REGTEST: literal('regtest'),
};

export type Network = (typeof Network)[keyof typeof Network];

export interface TransactionDetails extends Transaction {
  txid: string;
  hex: string;
}
