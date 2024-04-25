import { binToHex, hexToBin } from '@bitauth/libauth';
import { sha256 } from '@cashscript/utils';
import { Utxo, Network } from '../interfaces.js';
import NetworkProvider from './NetworkProvider.js';
import { addressToLockScript, randomUtxo } from '../utils.js';

// redeclare the addresses from vars.ts instead of importing them
const aliceAddress = 'bchtest:qpgjmwev3spwlwkgmyjrr2s2cvlkkzlewq62mzgjnp';
const bobAddress = 'bchtest:qz6q5gqnxdldkr07xpls5474mmzmlesd6qnux4skuc';
const carolAddress = 'bchtest:qqsr7nqwe6rq5crj63gy5gdqchpnwmguusmr7tfmsj';

export default class MockNetworkProvider implements NetworkProvider {
  private utxoMap: Record<string, Utxo[]> = {};
  private transactionMap: Record<string, string> = {};
  public network: Network = Network.CHIPNET;

  constructor() {
    for (let i = 0; i < 3; i += 1) {
      this.addUtxo(aliceAddress, randomUtxo());
      this.addUtxo(bobAddress, randomUtxo());
      this.addUtxo(carolAddress, randomUtxo());
    }
  }

  async getUtxos(address: string): Promise<Utxo[]> {
    const lockingBytecode = binToHex(addressToLockScript(address));
    return this.utxoMap[lockingBytecode] ?? [];
  }

  async getBlockHeight(): Promise<number> {
    return 133700;
  }

  async getRawTransaction(txid: string): Promise<string> {
    return this.transactionMap[txid];
  }

  async sendRawTransaction(txHex: string): Promise<string> {
    const transactionBin = hexToBin(txHex);

    const txid = binToHex(sha256(sha256(transactionBin)).reverse());
    this.transactionMap[txid] = txHex;
    return txid;
  }

  addUtxo(address: string, utxo: Utxo): void {
    const lockingBytecode = binToHex(addressToLockScript(address));
    if (!this.utxoMap[lockingBytecode]) {
      this.utxoMap[lockingBytecode] = [];
    }

    this.utxoMap[lockingBytecode].push(utxo);
  }

  reset(): void {
    this.utxoMap = {};
    this.transactionMap = {};
  }
}
