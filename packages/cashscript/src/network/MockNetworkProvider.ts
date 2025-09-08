import { AuthenticationVirtualMachineIdentifier, binToHex, decodeTransactionUnsafe, hexToBin, isHex } from '@bitauth/libauth';
import { sha256 } from '@cashscript/utils';
import { Utxo, Network } from '../interfaces.js';
import NetworkProvider from './NetworkProvider.js';
import { addressToLockScript, libauthTokenDetailsToCashScriptTokenDetails } from '../utils.js';

export interface MockNetworkProviderOptions {
  updateUtxoSet: boolean;
  vmTarget?: VmTarget;
}

export type VmTarget = AuthenticationVirtualMachineIdentifier;

export default class MockNetworkProvider implements NetworkProvider {
  // we use lockingBytecode hex as the key for utxoMap to make cash addresses and token addresses interchangeable
  private utxoSet: Array<[string, Utxo]> = [];
  private transactionMap: Record<string, string> = {};
  public network: Network = Network.MOCKNET;
  public blockHeight: number = 133700;
  public options: MockNetworkProviderOptions;
  public vmTarget: VmTarget;

  constructor(options?: Partial<MockNetworkProviderOptions>) {
    this.options = { updateUtxoSet: true, ...options };
    this.vmTarget = this.options.vmTarget ?? "BCH_2025_05";
  }

  async getUtxos(address: string): Promise<Utxo[]> {
    const addressLockingBytecode = binToHex(addressToLockScript(address));
    return this.utxoSet.filter(([lockingBytecode]) => lockingBytecode === addressLockingBytecode).map(([, utxo]) => utxo);
  }

  setBlockHeight(newBlockHeight: number): void {
    this.blockHeight = newBlockHeight;
  }

  async getBlockHeight(): Promise<number> {
    return this.blockHeight;
  }

  async getRawTransaction(txid: string): Promise<string> {
    return this.transactionMap[txid];
  }

  async sendRawTransaction(txHex: string): Promise<string> {
    const transactionBin = hexToBin(txHex);

    const txid = binToHex(sha256(sha256(transactionBin)).reverse());

    if (this.options.updateUtxoSet && this.transactionMap[txid]) {
      throw new Error(`Transaction with txid ${txid} was already submitted`);
    }

    this.transactionMap[txid] = txHex;

    // If updateUtxoSet is false, we don't need to update the utxo set, and just return the txid
    if (!this.options.updateUtxoSet) return txid;

    const decodedTransaction = decodeTransactionUnsafe(transactionBin);

    decodedTransaction.inputs.forEach((input) => {
      const utxoIndex = this.utxoSet.findIndex(
        ([, utxo]) => utxo.txid === binToHex(input.outpointTransactionHash) && utxo.vout === input.outpointIndex,
      );

      // TODO: we should check what error a BCHN node throws, so we can throw the same error here
      if (utxoIndex === -1) {
        throw new Error(`UTXO not found for input ${input.outpointIndex} of transaction ${txid}`);
      }

      this.utxoSet.splice(utxoIndex, 1);
    });

    decodedTransaction.outputs.forEach((output, vout) => {
      this.addUtxo(binToHex(output.lockingBytecode), {
        txid,
        vout,
        satoshis: output.valueSatoshis,
        token: output.token && libauthTokenDetailsToCashScriptTokenDetails(output.token),
      });
    });

    return txid;
  }

  // Note: the user can technically add the same UTXO multiple times (txid + vout), to the same or different addresses
  // but we don't check for this in the sendRawTransaction method. We might want to prevent duplicates from being added
  // in the first place.
  addUtxo(addressOrLockingBytecode: string, utxo: Utxo): void {
    const lockingBytecode = isHex(addressOrLockingBytecode) ?
      addressOrLockingBytecode : binToHex(addressToLockScript(addressOrLockingBytecode));

    this.utxoSet.push([lockingBytecode, utxo]);
  }

  reset(): void {
    this.utxoSet = [];
    this.transactionMap = {};
  }
}
