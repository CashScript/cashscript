import { binToHex, decodeTransactionUnsafe, hexToBin, isHex, Transaction as LibauthTransaction } from '@bitauth/libauth';
import { sha256 } from '@cashscript/utils';
import { SpendableUtxo, Utxo, Network, VmTarget } from '../interfaces.js';
import NetworkProvider from './NetworkProvider.js';
import { addressToLockScript, cashScriptOutputToLibauthOutput, libauthTokenDetailsToCashScriptTokenDetails } from '../utils.js';
import { createVirtualMachine, DEFAULT_VM_TARGET } from '../libauth-template/utils.js';

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
  /**
   * When `true` (default), broadcasting a transaction via `sendRawTransaction` evaluates it
   * against the BCH VM using the *actual* locking bytecode of the spent UTXOs (like a real node
   * would), rejecting invalid transactions. Requires `updateUtxoSet` to be enabled, since spent
   * UTXOs are only looked up when the UTXO set is tracked.
   */
  validateTransactions?: boolean;
  /** The BCH VM target used for local debugging and transaction validation. Defaults to the current stable VM. */
  vmTarget?: VmTarget;
}

/**
 * An in-memory `NetworkProvider` useful for tests and examples. It does not connect to any
 * external server; instead UTXOs are manually added via `addUtxo` and transactions are tracked
 * in memory.
 */
export default class MockNetworkProvider implements NetworkProvider {
  // we use lockingBytecode hex as the key for utxoMap to make cash addresses and token addresses interchangeable
  private utxoSet: Array<[string, SpendableUtxo]> = [];
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
    this.options = { updateUtxoSet: true, validateTransactions: true, ...options };
    this.vmTarget = this.options.vmTarget ?? DEFAULT_VM_TARGET;
  }

  async getUtxos(address: string): Promise<SpendableUtxo[]> {
    const addressLockingBytecode = addressToLockScript(address);
    return this.getUtxosForLockingBytecode(addressLockingBytecode);
  }

  async getUtxosForLockingBytecode(lockingBytecode: Uint8Array | string): Promise<SpendableUtxo[]> {
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
      console.warn(`Transaction with txid ${txid} was already submitted`);
      return txid;
    }

    // If updateUtxoSet is false, we don't track spent UTXOs, so we cannot validate the transaction either
    if (!this.options.updateUtxoSet) {
      this.transactionMap[txid] = txHex;
      return txid;
    }

    const decodedTransaction = decodeTransactionUnsafe(transactionBin);
    const spentUtxoEntries = this.findSpentUtxoEntries(decodedTransaction, txid);

    if (this.options.validateTransactions) {
      this.validateTransaction(decodedTransaction, spentUtxoEntries);
    }

    this.transactionMap[txid] = txHex;
    this.utxoSet = this.utxoSet.filter((entry) => !spentUtxoEntries.includes(entry));

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

  private findSpentUtxoEntries(transaction: LibauthTransaction, txid: string): Array<[string, SpendableUtxo]> {
    const remainingUtxoEntries = [...this.utxoSet];

    return transaction.inputs.map((input) => {
      const utxoIndex = remainingUtxoEntries.findIndex(
        ([, utxo]) => utxo.txid === binToHex(input.outpointTransactionHash) && utxo.vout === input.outpointIndex,
      );

      // TODO: we should check what error a BCHN node throws, so we can throw the same error here
      if (utxoIndex === -1) {
        throw new Error(`UTXO not found for input ${input.outpointIndex} of transaction ${txid}`);
      }

      return remainingUtxoEntries.splice(utxoIndex, 1)[0];
    });
  }

  // Evaluates the transaction against the BCH VM using the spent UTXOs (like a real node would)
  private validateTransaction(transaction: LibauthTransaction, spentUtxoEntries: Array<[string, SpendableUtxo]>): void {
    const sourceOutputs = spentUtxoEntries.map(([lockingBytecode, utxo]) => cashScriptOutputToLibauthOutput({
      to: hexToBin(lockingBytecode),
      amount: utxo.satoshis,
      token: utxo.token,
    }));

    const vm = createVirtualMachine(this.vmTarget);
    const verificationResult = vm.verify({ transaction, sourceOutputs });

    if (verificationResult !== true) {
      throw new Error(verificationResult);
    }
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
   * @returns The added UTXO, annotated with the locking bytecode it was added under.
   */
  addUtxo(addressOrLockingBytecode: string, utxo: Utxo): SpendableUtxo {
    const lockingBytecode = isHex(addressOrLockingBytecode) ?
      addressOrLockingBytecode : binToHex(addressToLockScript(addressOrLockingBytecode));

    const annotatedUtxo = { ...utxo, lockingBytecode };
    this.utxoSet.push([lockingBytecode, annotatedUtxo]);
    return annotatedUtxo;
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
