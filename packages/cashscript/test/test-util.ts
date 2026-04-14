import {
  lockingBytecodeToCashAddress,
  hexToBin,
  Transaction,
  binToHex,
  encodeCashAddress,
} from '@bitauth/libauth';
import { hash160 } from '@cashscript/utils';
import PQueue from 'p-queue';
import pRetry from 'p-retry';
import { Output, Network, Utxo } from '../src/interfaces.js';
import { network as defaultNetwork, funderAddress, funderPriv } from './fixture/vars.js';
import { getNetworkPrefix, isNonTokenUtxo, libauthOutputToCashScriptOutput } from '../src/utils.js';
import { utxoComparator } from '../src/utils.js';
import MockNetworkProvider from '../src/network/MockNetworkProvider.js';
import NetworkProvider from '../src/network/NetworkProvider.js';
import SignatureTemplate from '../src/SignatureTemplate.js';
import { TransactionBuilder } from '../src/TransactionBuilder.js';

export function getTxOutputs(tx: Transaction, network: Network = defaultNetwork): Output[] {
  return tx.outputs.map((o) => {
    const OP_RETURN = '6a';
    const scriptHex = binToHex(o.lockingBytecode);

    if (scriptHex.startsWith(OP_RETURN)) {
      return { to: hexToBin(scriptHex), amount: 0n };
    }

    const prefix = getNetworkPrefix(network);
    const cashscriptOutput = libauthOutputToCashScriptOutput(o);
    const hasTokens = Boolean(cashscriptOutput.token);
    const result = lockingBytecodeToCashAddress({ bytecode: hexToBin(scriptHex), prefix, tokenSupport: hasTokens });
    if (typeof result === 'string') throw new Error(result);

    return {
      to: result.address,
      amount: o.valueSatoshis,
      token: cashscriptOutput.token,
    };
  });
}

export function getLargestUtxo(utxos: Utxo[]): Utxo {
  return [...utxos].sort(utxoComparator).reverse()[0];
}

// Adds a UTXO to the given address on any network provider:
// - On MockNetworkProvider, the UTXO is inserted directly into the mock UTXO set.
// - On live providers (e.g. ElectrumNetworkProvider for chipnet), a real transaction is
//   constructed and broadcast from the `funderWif` exported by `fixture/vars.ts`, creating
//   the UTXO on-chain. The returned UTXO contains the real txid/vout from the broadcast
//   transaction.
// Token UTXOs are only supported on MockNetworkProvider.
export async function addUtxo(
  provider: NetworkProvider,
  address: string,
  utxo: Utxo,
): Promise<Utxo> {
  if (provider instanceof MockNetworkProvider) {
    provider.addUtxo(address, utxo);
    return utxo;
  }

  if (utxo.token) {
    throw new Error('addUtxo: creating token UTXOs on a live network is not supported');
  }

  // Serialize all live addUtxo calls through a single-slot queue. Parallel calls would
  // otherwise race to fetch and spend the same funder UTXO, causing txn-mempool-conflict.
  // As a fallback, p-retry retries up to 3 times on mempool conflicts if one still slips
  // through (e.g. the electrum server hadn't yet indexed the previous change UTXO).
  const result = await liveAddUtxoQueue.add(() => pRetry(
    () => sendLiveAddUtxo(provider, address, utxo),
    { retries: 10, shouldRetry: ({ error }) => isMempoolConflictError(error) },
  ));
  if (!result) throw new Error('addUtxo: live queue returned no result');
  return result;
}

function isMempoolConflictError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  return message.includes('txn-mempool-conflict') || message.includes('mempool conflict');
}

// concurrency: 1 serializes calls so they don't race on funder UTXOs.
// intervalCap/interval rate-limits starts so the electrum server has time to index each
// transaction before the next one tries to spend the funder's change UTXO.
const liveAddUtxoQueue = new PQueue({ concurrency: 1, interval: 3000, intervalCap: 1, strict: true });

async function sendLiveAddUtxo(
  provider: NetworkProvider,
  address: string,
  utxo: Utxo,
): Promise<Utxo> {
  const funderUtxos = (await provider.getUtxos(funderAddress))
    .filter(isNonTokenUtxo)
    .sort(utxoComparator)
    .reverse();

  const { utxos: selected } = gatherUtxos(funderUtxos, { amount: utxo.satoshis, fee: 2000n });

  const tx = await new TransactionBuilder({ provider })
    .addInputs(selected, new SignatureTemplate(funderPriv).unlockP2PKH())
    .addOutput({ to: address, amount: utxo.satoshis })
    .addBchChangeOutputIfNeeded({ to: funderAddress, feeRate: 1.0 })
    .send();

  return {
    txid: tx.txid,
    vout: 0,
    satoshis: utxo.satoshis,
  };
}

export function gatherUtxos(
  utxos: Utxo[],
  options?: { amount?: bigint, fee?: bigint },
): { utxos: Utxo[], total: bigint, changeAmount: bigint } {
  const targetUtxos: Utxo[] = [];
  let total = 0n;

  // 1000 for fees
  const { amount = 0n, fee = 1000n } = options ?? {};

  const minChangeAmount = 1000n;

  for (const utxo of utxos) {
    if (total - fee - minChangeAmount > amount) break;
    total += utxo.satoshis;
    targetUtxos.push(utxo);
  }

  const changeAmount = total - amount - fee;

  if (changeAmount < minChangeAmount) {
    throw new Error('Not enough funds to cover transaction');
  }

  return {
    utxos: targetUtxos,
    total,
    changeAmount,
  };
}
