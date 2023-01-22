import { Utxo, Network } from '../interfaces.js';
import NetworkProvider from './NetworkProvider.js';

export default class FullStackNetworkProvider implements NetworkProvider {
  /**
   * @example
   * const BCHJS = require("@psf/bch-js")
   * let bchjs = new BCHJS({
   *   restURL: 'https://api.fullstack.cash/v3/',
   *   apiToken: 'eyJhbGciO...' // Your JWT token here.
   * })
   */
  constructor(
    public network: Network,
    private bchjs: BCHJS,
  ) {}

  async getUtxos(address: string): Promise<Utxo[]> {
    const result = await this.bchjs.Electrumx.utxo(address);

    const utxos = (result.utxos ?? []).map((utxo: ElectrumUtxo) => ({
      txid: utxo.tx_hash,
      vout: utxo.tx_pos,
      satoshis: BigInt(utxo.value),
    }));

    return utxos;
  }

  async getBlockHeight(): Promise<number> {
    return this.bchjs.Blockchain.getBlockCount();
  }

  async getRawTransaction(txid: string): Promise<string> {
    return this.bchjs.RawTransactions.getRawTransaction(txid);
  }

  async sendRawTransaction(txHex: string): Promise<string> {
    return this.bchjs.RawTransactions.sendRawTransaction(txHex);
  }
}

interface ElectrumUtxo {
  tx_pos: number;
  value: number;
  tx_hash: string;
  height: number;
}

interface BCHJS {
  Electrumx: {
    utxo(address: string): Promise<{ utxos: ElectrumUtxo[] }>;
  };
  Blockchain: {
    getBlockCount(): Promise<number>;
  };
  RawTransactions: {
    getRawTransaction(txid: string): Promise<string>;
    sendRawTransaction(txHex: string): Promise<string>;
  };
}
