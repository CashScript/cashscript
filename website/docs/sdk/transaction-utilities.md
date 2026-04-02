---
title: Transaction Utilities
---

When building transactions using the CashScript SDK, there are certain actions that are not directly involved with transaction building, but are still useful to have available. This is the purpose of the Transaction Utilities.

## Gathering UTXOs

Often when building transactions, you need to gather UTXOs from a list of UTXOs until the required (token or BCH) amount is reached. This is the purpose of the `gatherBchUtxos()` and `gatherFungibleTokenUtxos()` functions.

### interface GatherUtxosResult
```ts
interface GatherUtxosResult {
  utxos: Utxo[];
  totalAmount: bigint;
}
```

### gatherBchUtxos()
```ts
gatherBchUtxos(utxos: Utxo[], amount: bigint): GatherUtxosResult
```

Gathers BCH UTXOs from a list of UTXOs until the required amount is reached.

#### Example
```ts
const { utxos, totalAmount } = gatherBchUtxos(utxos, 100000n);
```

### gatherFungibleTokenUtxos()
```ts
gatherFungibleTokenUtxos(utxos: Utxo[], tokenCategory: string, amount: bigint): GatherUtxosResult
```

Gathers fungible token UTXOs from a list of UTXOs until the required amount is reached.

#### Example
```ts
const { utxos, totalAmount } = gatherFungibleTokenUtxos(utxos, tokenCategory, 1000n);
```
