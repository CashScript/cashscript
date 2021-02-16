import RpcClientRetry from 'bitcoin-rpc-promise-retry';
import { Utxo, Network } from '../interfaces';
import NetworkProvider from './NetworkProvider';

export default class BitcoinRpcNetworkProvider implements NetworkProvider {
  private rpcClient: RpcClientRetry;

  constructor(
    public network: Network,
    url: string,
    opts?: object,
  ) {
    this.rpcClient = new RpcClientRetry(url, opts);
  }

  async getUtxos(address: string): Promise<Utxo[]> {
    const result = await this.rpcClient.listUnspent(0, 9999999, [address]);

    const utxos = result.map((utxo) => ({
      txid: utxo.txid,
      vout: utxo.vout,
      satoshis: utxo.amount * 1e8,
    }));

    return utxos;
  }

  async getBlockHeight(): Promise<number> {
    return this.rpcClient.getBlockCount();
  }

  async getRawTransaction(txid: string): Promise<string> {
    return this.rpcClient.getRawTransaction(txid);
  }

  async sendRawTransaction(txHex: string): Promise<string> {
    return this.rpcClient.sendRawTransaction(txHex);
  }

  getClient(): RpcClientRetry {
    return this.rpcClient;
  }
}
