export interface Utxo {
  txid: string
  vout: number
  amount: number
  satoshis: number
  height: number
  confirmations: number
}

export interface Output {
  to: string,
  amount: number,
}

export interface TxOptions {
  time?: number,
  age?: number,
}

export enum SignatureAlgorithm {
  ECDSA = 0x00,
  SCHNORR = 0x01,
}
