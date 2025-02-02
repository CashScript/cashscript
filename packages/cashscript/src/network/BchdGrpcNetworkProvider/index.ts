import { binToHex, hexToBin } from '@bitauth/libauth';
import { GrpcWebFetchTransport } from '@protobuf-ts/grpcweb-transport';
import { Utxo, Network } from '../../interfaces.js';
import NetworkProvider from '../NetworkProvider.js';
import { bchrpcClient } from './generated/bchrpc.client.js';

export default class BchdGrpcNetworkProvider implements NetworkProvider {
  client: bchrpcClient;

  constructor(public network: Network, baseUrl: string) {
    const transport = new GrpcWebFetchTransport({ baseUrl });
    this.client = new bchrpcClient(transport);
  }

  async getUtxos(address: string): Promise<Utxo[]> {
    const { response } = await this.client.getAddressUnspentOutputs({
      address,
      includeMempool: true,
      includeTokenMetadata: false,
    });

    const utxos = response.outputs.map(
      (utxo) =>
        ({
          // TODO: undefined?
          txid: binToHex(utxo.outpoint!.hash.reverse()),
          vout: utxo.outpoint!.index,
          satoshis: utxo.value,
          token: utxo.cashToken
            ? {
                category: binToHex(utxo.cashToken.categoryId.reverse()),
                amount: BigInt(utxo.cashToken.amount),
                nft: utxo.cashToken.commitment
                  ? {
                      // TODO: parse bitfield
                      capability: utxo.cashToken.bitfield as any,
                      commitment: binToHex(utxo.cashToken.commitment),
                    }
                  : undefined,
              }
            : undefined,
        } satisfies Utxo)
    );

    return utxos;
  }

  async getBlockHeight(): Promise<number> {
    const { response } = await this.client.getBlockchainInfo({});
    return response.bestHeight;
  }

  async getRawTransaction(txid: string): Promise<string> {
    const { response } = await this.client.getRawTransaction({
      hash: hexToBin(txid).reverse(),
    });

    return binToHex(response.transaction);
  }

  async sendRawTransaction(txHex: string): Promise<string> {
    const { response } = await this.client.submitTransaction({
      transaction: hexToBin(txHex),
      requiredSlpBurns: [],
      skipSlpValidityCheck: true,
    });

    return binToHex(response.hash);
  }
}
