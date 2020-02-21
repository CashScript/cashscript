export interface Utxo {
  txid: string;
  vout: number;
  amount: number;
  satoshis: number;
  height: number;
  confirmations: number;
}

export interface UnconfirmedUtxo {
  txid: string;
  vout: number;
  scriptPubKey: string;
  amount: number;
  satoshis: number;
  confirmations: number;
  ts: number;
  legacyAddress: string;
  cashAddress: string;
}

export type Output = Recipient | OpReturn;

export interface OutputForBuilder {
  to: string | Buffer;
  amount: number;
}

export const isRecipient = (o: Output): o is Recipient => 'to' in o;
export const isOpReturn = (o: Output): o is OpReturn => 'opReturn' in o;

export interface Recipient {
  to: string;
  amount: number;
}

export interface OpReturn {
  opReturn: string[];
}

export interface ScriptSigDetails {
  asm: string;
  hex: string;
}

export interface TxnDetailValueIn {
  cashAddress: string;
  legacyAddress: string;
  n: number;
  scriptSig: ScriptSigDetails;
  sequence: number;
  txid: string;
  value: number;
  vout: number;
}

export interface ScriptPubKeyDetails {
  addresses: string[];
  cashAddrs: string[];
  asm: string;
  hex: string;
  type: string;
}

export interface TxnDetailValueOut {
  n: number;
  scriptPubKey: ScriptPubKeyDetails;
  spendHeight: null | number;
  spendIndex: null | number;
  spendTxId: null | number;
  value: string;
}

export interface TxOptions {
  time?: number;
  age?: number;
  fee?: number;
  minChange?: number;
  inputs?: Utxo[];
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
