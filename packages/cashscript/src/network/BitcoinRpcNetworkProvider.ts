import { Utxo, Network } from '../interfaces.js';
import NetworkProvider from './NetworkProvider.js';
import {
  BchnRpcClient,
  type GetBlockCount,
  type GetRawTransactionVerbosity0,
  type ListUnspent,
  type SendRawTransaction,
} from '@mr-zwets/bchn-api-wrapper';

export default class BitcoinRpcNetworkProvider implements NetworkProvider {
  private rpcClient: BchnRpcClient;

  constructor(
    public network: Network,
    url: string,
    opts: {
      rpcUser: string;
      rpcPassword: string;
    },
  ) {
    this.rpcClient = new BchnRpcClient({ url, ...opts });
  }

  async getUtxos(address: string): Promise<Utxo[]> {
    const result = await this.rpcClient.request<ListUnspent>('listunspent', 0, 9999999, [address]);

    const utxos = result.map((utxo) => ({
      txid: utxo.txid,
      vout: utxo.vout,
      satoshis: BigInt(utxo.amount * 1e8),
    }));

    return utxos;
  }

  async getBlockHeight(): Promise<number> {
    return this.rpcClient.request<GetBlockCount>('getblockcount');
  }

  async getRawTransaction(txid: string): Promise<string> {
    return this.rpcClient.request<GetRawTransactionVerbosity0>('getrawtransaction', txid, 0);
  }

  async sendRawTransaction(txHex: string): Promise<string> {
    return this.rpcClient.request<SendRawTransaction>('sendrawtransaction', txHex);
  }

  getClient(): BchnRpcClient {
    return this.rpcClient;
  }
}
