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


interface OptionsBase {
  manualConnectionManagement?: boolean;
}

interface CustomHostNameOptions extends OptionsBase {
  hostname: string;
}

interface CustomElectrumOptions extends OptionsBase {
  electrum: ElectrumClient<ElectrumClientEvents>;
}

type Options = OptionsBase | CustomHostNameOptions | CustomElectrumOptions;

export default class ElectrumNetworkProvider implements NetworkProvider {
  private electrum: ElectrumClient<ElectrumClientEvents>;
  private concurrentRequests: number = 0;
  private manualConnectionManagement: boolean;

  constructor(public network: Network = Network.MAINNET, options: Options = {}) {
    this.electrum = this.instantiateElectrumClient(network, options);
    this.manualConnectionManagement = options?.manualConnectionManagement ?? false;
  }

  private instantiateElectrumClient(network: Network, options: Options): ElectrumClient<ElectrumClientEvents> {
    if ('electrum' in options) return options.electrum;
    const server = 'hostname' in options ? options.hostname : this.getServerForNetwork(network);
    return new ElectrumClient('CashScript Application', '1.4.1', server);
  }

  // Get Electrum server based on network
  private getServerForNetwork(network: Network): string {
    switch (network) {
      case Network.MAINNET:
        return 'bch.imaginary.cash';
      case Network.TESTNET3:
        return 'testnet.imaginary.cash';
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

  async connect(): Promise<void> {
    if (!this.manualConnectionManagement) {
      throw new Error('Manual connection management is disabled');
    }

    return this.electrum.connect();
  }

  async disconnect(): Promise<boolean> {
    if (!this.manualConnectionManagement) {
      throw new Error('Manual connection management is disabled');
    }

    return this.electrum.disconnect();
  }

  async performRequest(
    name: string,
    ...parameters: (string | number | boolean)[]
  ): Promise<RequestResponse> {
    // Only connect the electrum client when no concurrent requests are running
    if (this.shouldConnect()) {
      await this.electrum.connect();
    }

    this.concurrentRequests += 1;

    let result;
    try {
      result = await this.electrum.request(name, ...parameters);
    } finally {
      // Always disconnect the electrum client, also if the request fails
      // as long as no other concurrent requests are running
      if (this.shouldDisconnect()) {
        await this.electrum.disconnect();
      }
    }

    this.concurrentRequests -= 1;

    if (result instanceof Error) throw result;

    return result;
  }

  private shouldConnect(): boolean {
    if (this.manualConnectionManagement) return false;
    if (this.concurrentRequests !== 0) return false;
    return true;
  }

  private shouldDisconnect(): boolean {
    if (this.manualConnectionManagement) return false;
    if (this.concurrentRequests !== 1) return false;
    return true;
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
