import { BITBOX } from 'bitbox-sdk';
import { Utxo, Network } from '../interfaces';
import NetworkProvider from './NetworkProvider';

export default class BitboxNetworkProvider implements NetworkProvider {
  constructor(
    public network: Network,
    private bitbox: BITBOX,
  ) {}

  async getUtxos(address: string): Promise<Utxo[]> {
    const { utxos } = await this.bitbox.Address.utxo(address) as any;
    return utxos;
  }

  async getBlockHeight(): Promise<number> {
    return this.bitbox.Blockchain.getBlockCount();
  }

  async getRawTransaction(txid: string): Promise<string> {
    return this.bitbox.RawTransactions.getRawTransaction(txid) as Promise<string>;
  }

  async sendRawTransaction(txHex: string): Promise<string> {
    return this.bitbox.RawTransactions.sendRawTransaction(txHex);
  }
}
