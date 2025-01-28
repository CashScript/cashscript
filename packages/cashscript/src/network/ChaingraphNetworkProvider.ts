import { ChaingraphClient } from 'chaingraph-ts';
import { Utxo, Network } from '../interfaces.js';
import NetworkProvider from './NetworkProvider.js';

export default class ChaingraphNetworkProvider implements NetworkProvider {
  private client: ChaingraphClient;

  constructor(
    public network: Network,
    chaingraphOrUrl: ChaingraphClient | string
  ) {
    if (chaingraphOrUrl instanceof ChaingraphClient) {
      this.client = chaingraphOrUrl;
    } else if (typeof chaingraphOrUrl === 'string') {
      this.client = new ChaingraphClient(chaingraphOrUrl);
    } else {
      throw new Error(
        'Invalid parameter. Must be an instance of ChaingraphClient or a chaingraph url'
      );
    }
  }

  async getUtxos(address: string): Promise<Utxo[]> {
    const result = await this.client.getUtxosForAddress(address);

    const utxos: Utxo[] = result.map((utxo) => ({
      txid: utxo.transaction_hash,
      vout: Number(utxo.output_index),
      satoshis: BigInt(utxo.value_satoshis),
      token: utxo.token_category
        ? {
            category: utxo.token_category,
            amount: BigInt(utxo.fungible_token_amount!),
            nft: utxo.nonfungible_token_commitment
              ? {
                  capability: utxo.nonfungible_token_capability!,
                  commitment: utxo.nonfungible_token_commitment,
                }
              : undefined,
          }
        : undefined,
    }));

    return utxos;
  }

  async getBlockHeight(): Promise<number> {
    return this.client.getBlockHeight();
  }

  async getRawTransaction(txid: string): Promise<string> {
    const response = await this.client.getRawTransaction(txid);
    return response!;
  }

  async sendRawTransaction(txHex: string): Promise<string> {
    const response = await this.client.sendRawTransaction(txHex);
    return response.send_transaction.transaction_hash;
  }
}
