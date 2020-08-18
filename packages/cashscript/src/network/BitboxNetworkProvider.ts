import { Utxo, Network } from '../interfaces';
import NetworkProvider from './NetworkProvider';

export default class BitboxNetworkProvider implements NetworkProvider {
  constructor(
    public network: Network,
    private bitbox: BITBOX,
  ) {}

  async getUtxos(address: string): Promise<Utxo[]> {
    const { utxos } = await this.bitbox.Address.utxo(address);
    return utxos;
  }

  async getBlockHeight(): Promise<number> {
    return this.bitbox.Blockchain.getBlockCount();
  }

  async getRawTransaction(txid: string): Promise<string> {
    return this.bitbox.RawTransactions.getRawTransaction(txid);
  }

  async sendRawTransaction(txHex: string): Promise<string> {
    return this.bitbox.RawTransactions.sendRawTransaction(txHex);
  }
}

interface BITBOX {
  Address: {
    utxo(address: string): Promise<{ utxos: Utxo[] }>;
  };
  Blockchain: {
    getBlockCount(): Promise<number>;
  };
  RawTransactions: {
    getRawTransaction(txid: string): Promise<string>;
    sendRawTransaction(txHex: string): Promise<string>;
  };
}
