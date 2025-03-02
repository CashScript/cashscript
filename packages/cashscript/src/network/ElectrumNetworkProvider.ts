import { binToHex } from '@bitauth/libauth';
import { sha256 } from '@cashscript/utils';
import {
  ElectrumClient,
  type RequestResponse,
  type ElectrumClientEvents,
} from '@electrum-cash/network';
import { Utxo, Network } from '../interfaces.js';
import NetworkProvider from './NetworkProvider.js';
import { addressToLockScript } from '../utils.js';

export default class ElectrumNetworkProvider implements NetworkProvider {
  private electrum: ElectrumClient<ElectrumClientEvents>;

  constructor(public network: Network = Network.MAINNET) {
    const server = this.getServerForNetwork(network);
    this.electrum = new ElectrumClient('CashScript Application', '1.4.1', server);
  }

  // Get Electrum server based on network
  private getServerForNetwork(network: Network): string {
    switch (network) {
      case Network.MAINNET:
        return 'bch.imaginary.cash';
      case Network.TESTNET3:
        return 'blackie.c3-soft.com';
      case Network.TESTNET4:
        return 'testnet4.imaginary.cash';
      case Network.CHIPNET:
        return 'chipnet.bch.ninja';
      default:
        throw new Error(`Unsupported network: ${network}`);
    }
  }

  async getUtxos(address: string): Promise<Utxo[]> {
    const scripthash = addressToElectrumScriptHash(address);

    const filteringOption = 'include_tokens';
    const result = await this.performRequest('blockchain.scripthash.listunspent', scripthash, filteringOption) as ElectrumUtxo[];

    const utxos = result.map((utxo) => ({
      txid: utxo.tx_hash,
      vout: utxo.tx_pos,
      satoshis: BigInt(utxo.value),
      token: utxo.token_data ? {
        ...utxo.token_data,
        amount: BigInt(utxo.token_data.amount),
      } : undefined,
    }));

    return utxos;
  }

  async getBlockHeight(): Promise<number> {
    const { height } = await this.performRequest('blockchain.headers.subscribe') as BlockHeader;
    return height;
  }

  async getRawTransaction(txid: string): Promise<string> {
    return await this.performRequest('blockchain.transaction.get', txid) as string;
  }

  async sendRawTransaction(txHex: string): Promise<string> {
    return await this.performRequest('blockchain.transaction.broadcast', txHex) as string;
  }

  // Perform request with auto-disconnect
  async performRequest(
    name: string,
    ...parameters: (string | number | boolean)[]
  ): Promise<RequestResponse> {
    try {
      await this.electrum.connect();
      const result = await this.electrum.request(name, ...parameters);
      if (result instanceof Error) throw result;
      return result;
    } finally {
      await this.electrum.disconnect();
    }
  }
}

interface ElectrumUtxo {
  tx_pos: number;
  value: number;
  tx_hash: string;
  height: number;
  token_data?: {
    amount: string;
    category: string;
    nft?: {
      capability: 'none' | 'mutable' | 'minting';
      commitment: string;
    };
  };
}

interface BlockHeader {
  height: number;
  hex: string;
}

/**
 * Helper function to convert an address to an electrum-cash compatible scripthash.
 * This is necessary to support electrum versions lower than 1.4.3, which do not
 * support addresses, only script hashes.
 *
 * @param address Address to convert to an electrum scripthash
 *
 * @returns The corresponding script hash in an electrum-cash compatible format
 */
function addressToElectrumScriptHash(address: string): string {
  // Retrieve locking script
  const lockScript = addressToLockScript(address);

  // Hash locking script
  const scriptHash = sha256(lockScript);

  // Reverse scripthash
  scriptHash.reverse();

  // Return scripthash as a hex string
  return binToHex(scriptHash);
}
