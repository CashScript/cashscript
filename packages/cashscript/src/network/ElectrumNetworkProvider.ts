import { binToHex } from '@bitauth/libauth';
import { sha256 } from '@cashscript/utils';
import {
  ElectrumCluster,
  ElectrumTransport,
  ClusterOrder,
  RequestResponse,
} from 'electrum-cash';
import { Utxo, Network } from '../interfaces.js';
import NetworkProvider from './NetworkProvider.js';
import { addressToLockScript } from '../utils.js';

export default class ElectrumNetworkProvider implements NetworkProvider {
  private electrum: ElectrumCluster;
  private concurrentRequests: number = 0;

  constructor(
    public network: Network = Network.MAINNET,
    electrum?: ElectrumCluster,
    private manualConnectionManagement?: boolean,
  ) {
    // If a custom Electrum Cluster is passed, we use it instead of the default.
    if (electrum) {
      this.electrum = electrum;
      return;
    }

    if (network === Network.MAINNET) {
      // Initialise a 2-of-3 Electrum Cluster with 6 reliable hardcoded servers
      // using the first three servers as "priority" servers
      this.electrum = new ElectrumCluster('CashScript Application', '1.4.1', 2, 3, ClusterOrder.PRIORITY);
      this.electrum.addServer('bch.imaginary.cash', 50004, ElectrumTransport.WSS.Scheme, false);
      this.electrum.addServer('blackie.c3-soft.com', 50004, ElectrumTransport.WSS.Scheme, false);
      this.electrum.addServer('electroncash.de', 60002, ElectrumTransport.WSS.Scheme, false);
      this.electrum.addServer('electroncash.dk', 50004, ElectrumTransport.WSS.Scheme, false);
      this.electrum.addServer('bch.loping.net', 50004, ElectrumTransport.WSS.Scheme, false);
      this.electrum.addServer('electrum.imaginary.cash', 50004, ElectrumTransport.WSS.Scheme, false);
    } else if (network === Network.TESTNET3) {
      // Initialise a 1-of-2 Electrum Cluster with 2 hardcoded servers
      this.electrum = new ElectrumCluster('CashScript Application', '1.4.1', 1, 2, ClusterOrder.PRIORITY);
      this.electrum.addServer('blackie.c3-soft.com', 60004, ElectrumTransport.WSS.Scheme, false);
      this.electrum.addServer('electroncash.de', 60004, ElectrumTransport.WSS.Scheme, false);
      // this.electrum.addServer('bch.loping.net', 60004, ElectrumTransport.WSS.Scheme, false);
      // this.electrum.addServer('testnet.imaginary.cash', 50004, ElectrumTransport.WSS.Scheme);
    } else if (network === Network.TESTNET4) {
      this.electrum = new ElectrumCluster('CashScript Application', '1.4.1', 1, 1, ClusterOrder.PRIORITY);
      this.electrum.addServer('testnet4.imaginary.cash', 50004, ElectrumTransport.WSS.Scheme, false);
    } else if (network === Network.CHIPNET) {
      this.electrum = new ElectrumCluster('CashScript Application', '1.4.1', 1, 1, ClusterOrder.PRIORITY);
      this.electrum.addServer('chipnet.imaginary.cash', 50004, ElectrumTransport.WSS.Scheme, false);
    } else {
      throw new Error(`Tried to instantiate an ElectrumNetworkProvider for unsupported network ${network}`);
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

  async connectCluster(): Promise<void[]> {
    try {
      return await this.electrum.startup();
    } catch (e) {
      return [];
    }
  }

  async disconnectCluster(): Promise<boolean[]> {
    return this.electrum.shutdown();
  }

  private async performRequest(
    name: string,
    ...parameters: (string | number | boolean)[]
  ): Promise<RequestResponse> {
    // Only connect the cluster when no concurrent requests are running
    if (this.shouldConnect()) {
      this.connectCluster();
    }

    this.concurrentRequests += 1;

    await this.electrum.ready();

    let result;
    try {
      result = await this.electrum.request(name, ...parameters);
    } finally {
      // Always disconnect the cluster, also if the request fails
      // as long as no other concurrent requests are running
      if (this.shouldDisconnect()) {
        await this.disconnectCluster();
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
