import {
  lockingBytecodeToCashAddress,
  hexToBin,
  Transaction,
  binToHex,
} from '@bitauth/libauth';
import { Output, Network, Utxo } from '../src/interfaces.js';
import { network as defaultNetwork } from './fixture/vars.js';
import { getNetworkPrefix, libauthOutputToCashScriptOutput } from '../src/utils.js';
import { utxoComparator } from '../src/utils.js';

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
