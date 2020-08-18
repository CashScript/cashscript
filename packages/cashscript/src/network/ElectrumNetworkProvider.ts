import { binToHex } from '@bitauth/libauth';
import {
  ElectrumCluster,
  ElectrumTransport,
  ClusterOrder,
  RequestResponse,
} from 'electrum-cash';
import { Utxo, Network } from '../interfaces';
import NetworkProvider from './NetworkProvider';
import { addressToLockScript, sha256 } from '../util';

export default class ElectrumNetworkProvider implements NetworkProvider {
  private electrum: ElectrumCluster;

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
    } else if (network === Network.TESTNET) {
      // Initialise a 2-of-3 Electrum Cluster with 4 hardcoded servers
      this.electrum = new ElectrumCluster('CashScript Application', '1.4.1', 2, 3);
      this.electrum.addServer('blackie.c3-soft.com', 60004, ElectrumTransport.WSS.Scheme);
      this.electrum.addServer('bch.loping.net', 60004, ElectrumTransport.WSS.Scheme);
      this.electrum.addServer('electroncash.de', 60004, ElectrumTransport.WSS.Scheme);
      // this.electrum.addServer('testnet.imaginary.cash', 50004, ElectrumTransport.WSS.Scheme);
    } else {
      throw new Error(`Tried to instantiate an ElectrumNetworkProvider for unknown network ${network}`);
    }
  }

  async getUtxos(address: string): Promise<Utxo[]> {
    const scripthash = addressToElectrumScriptHash(address);

    const result = await this.performRequest('blockchain.scripthash.listunspent', scripthash) as ElectrumUtxo[];

    const utxos = result.map(utxo => ({
      txid: utxo.tx_hash,
      vout: utxo.tx_pos,
      satoshis: utxo.value,
      height: utxo.height,
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

  async connectCluster(): Promise<boolean[]> {
    try {
      return this.electrum.startup();
    } catch (e) {
      return [];
    }
  }

  disconnectCluster(): boolean[] {
    return this.electrum.shutdown();
  }

  private async performRequest(
    name: string,
    ...parameters: (string | number | boolean)[]
  ): Promise<RequestResponse> {
    if (!this.manualConnectionManagement) {
      this.connectCluster();
    }

    await this.electrum.ready();

    let result;
    try {
      result = await this.electrum.request(name, ...parameters);
    } finally {
      // Always disconnect the cluster, also if the request fails
      if (!this.manualConnectionManagement) {
        this.disconnectCluster();
      }
    }

    if (result instanceof Error) throw result;

    return result;
  }
}

interface ElectrumUtxo {
  tx_pos: number;
  value: number;
  tx_hash: string;
  height: number;
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
