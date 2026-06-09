import { binToHex, decodeTransactionUnsafe, hexToBin, isHex } from '@bitauth/libauth';
import { sha256 } from '@cashscript/utils';
import { Utxo, Network, VmTarget } from '../interfaces.js';
import NetworkProvider from './NetworkProvider.js';
import { addressToLockScript, libauthTokenDetailsToCashScriptTokenDetails } from '../utils.js';
import { DEFAULT_VM_TARGET } from '../libauth-template/utils.js';

/**
 * Options accepted by the `MockNetworkProvider` constructor.
 */
export interface MockNetworkProviderOptions {
  /**
   * When `true` (default), broadcasting a transaction via `sendRawTransaction` updates the
   * in-memory UTXO set: input UTXOs are removed and output UTXOs are added. Set to `false` to
   * keep the UTXO set static.
   */
  updateUtxoSet?: boolean;
  /** The BCH VM target used for local debugging. Defaults to the current stable VM. */
  vmTarget?: VmTarget;
}

/**
 * An in-memory `NetworkProvider` useful for tests and examples. It does not connect to any
 * external server; instead UTXOs are manually added via `addUtxo` and transactions are tracked
 * in memory.
 */
export default class MockNetworkProvider implements NetworkProvider {
  // we use lockingBytecode hex as the key for utxoMap to make cash addresses and token addresses interchangeable
  private utxoSet: Array<[string, Utxo]> = [];
  private transactionMap: Record<string, string> = {};
  private blockHeight: number = 133700;
  public network: Network = Network.MOCKNET;
  public options: MockNetworkProviderOptions;
  public vmTarget: VmTarget;

  /**
   * Create a new MockNetworkProvider.
   *
   * @param options - Optional settings controlling UTXO-set updating and the VM target used by
   *   `TransactionBuilder.debug`.
   */
  constructor(options?: Partial<MockNetworkProviderOptions>) {
    this.options = { updateUtxoSet: true, ...options };
    this.vmTarget = this.options.vmTarget ?? DEFAULT_VM_TARGET;
  }

  async getUtxos(address: string): Promise<Utxo[]> {
    const addressLockingBytecode = addressToLockScript(address);
    return this.getUtxosForLockingBytecode(addressLockingBytecode);
  }

  async getUtxosForLockingBytecode(lockingBytecode: Uint8Array | string): Promise<Utxo[]> {
    const lockingBytecodeHex = typeof lockingBytecode === 'string' ? lockingBytecode : binToHex(lockingBytecode);
    return this.utxoSet.filter(([key]) => key === lockingBytecodeHex).map(([, utxo]) => utxo);
  }

  /**
   * Override the current block height returned by `getBlockHeight`.
   *
   * @param newBlockHeight - The block height to report for subsequent queries.
   */
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
  /**
   * Add a UTXO to the in-memory set so that it becomes spendable by the specified address or
   * locking bytecode.
   *
   * @param addressOrLockingBytecode - Either a CashAddress or a hex-encoded locking bytecode.
   * @param utxo - The UTXO to make spendable.
   * @returns The added UTXO.
   */
  addUtxo(addressOrLockingBytecode: string, utxo: Utxo): Utxo {
    const lockingBytecode = isHex(addressOrLockingBytecode) ?
      addressOrLockingBytecode : binToHex(addressToLockScript(addressOrLockingBytecode));

    this.utxoSet.push([lockingBytecode, utxo]);
    return utxo;
  }

  /**
   * Clear the in-memory UTXO set and transaction history. Block height is preserved.
   */
  reset(): void {
    this.utxoSet = [];
    this.transactionMap = {};
  }
}

export class FailingMockNetworkProvider extends MockNetworkProvider {
  async sendRawTransaction(_txHex: string): Promise<string> {
    throw new Error('broadcast failed');
  }
}
