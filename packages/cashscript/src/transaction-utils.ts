import { Utxo } from './interfaces.js';
import { isFungibleTokenUtxo, isNonTokenUtxo } from './utils.js';

export interface GatherUtxosResult {
  utxos: Utxo[];
  totalAmount: bigint;
}

export function gatherBchUtxos(utxos: Utxo[], amount: bigint): GatherUtxosResult {
  const sortedBchUtxos = utxos
    .filter(isNonTokenUtxo)
    .toSorted((a, b) => Number(b.satoshis - a.satoshis));

  const targetUtxos: Utxo[] = [];
  let total = 0n;

  for (const utxo of sortedBchUtxos) {
    if (total >= amount) break;
    total += utxo.satoshis;
    targetUtxos.push(utxo);
  }

  if (total < amount) {
    throw new Error('Not enough funds to cover the required amount');
  }

  return { utxos: targetUtxos, totalAmount: total };
}

export function gatherFungibleTokenUtxos(utxos: Utxo[], tokenCategory: string, amount: bigint): GatherUtxosResult {
  const sortedTokenUtxos = utxos
    .filter((utxo) => isFungibleTokenUtxo(utxo) && utxo.token!.category === tokenCategory)
    .toSorted((a, b) => Number(b.token!.amount - a.token!.amount));

  const targetUtxos: Utxo[] = [];
  let total = 0n;

  for (const utxo of sortedTokenUtxos) {
    if (total >= amount) break;
    total += utxo.token!.amount;
    targetUtxos.push(utxo);
  }

  if (total < amount) {
    throw new Error('Not enough fungible tokens to cover the required amount');
  }

  return { utxos: targetUtxos, totalAmount: total };
}
