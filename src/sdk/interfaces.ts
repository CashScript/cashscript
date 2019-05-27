interface Utxo {
  txid: string
  vout: number
  amount: number
  satoshis: number
  height: number
  confirmations: number
}

interface Output {
  to: string,
  amount: number,
}
