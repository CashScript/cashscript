import { Utxo } from './interfaces.js';
import { isFungibleTokenUtxo, isNonTokenUtxo } from './utils.js';

/**
 * Result of `gatherBchUtxos` and `gatherFungibleTokenUtxos`: the selected UTXOs and the total
 * amount they cover (satoshis for BCH, token amount for fungible tokens).
 */
export interface GatherUtxosResult {
  utxos: Utxo[];
  totalAmount: bigint;
}

/**
 * Select non-token UTXOs from the provided list, largest-first, until the requested amount of
 * satoshis is covered.
 *
 * @param utxos - UTXOs to choose from. Token UTXOs are ignored.
 * @param amount - The minimum total satoshis that the selected UTXOs must cover.
 * @returns The selected UTXOs and their cumulative satoshi amount.
 * @throws If the available non-token UTXOs do not cover the requested amount.
 */
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

/**
 * Select fungible token UTXOs (for a specific token category) from the provided list,
 * largest-first, until the requested token amount is covered. NFT UTXOs are ignored.
 *
 * @param utxos - UTXOs to choose from.
 * @param tokenCategory - The hex-encoded token category to filter on.
 * @param amount - The minimum total token amount that the selected UTXOs must cover.
 * @returns The selected UTXOs and their cumulative token amount.
 * @throws If the available fungible token UTXOs do not cover the requested amount.
 */
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
