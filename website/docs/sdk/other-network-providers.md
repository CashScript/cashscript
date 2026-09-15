---
title: Other Network Providers
---

The CashScript SDK needs to connect to the BCH network to perform certain operations, like retrieving the contract's balance, or sending transactions.

## MockNetworkProvider
```ts
new MockNetworkProvider(options?: MockNetworkProviderOptions)
```

The `MockNetworkProvider` is a special network provider that allows you to evaluate transactions locally without interacting with the Bitcoin Cash network. This is useful when writing automated tests for your contracts, or when debugging your contract locally.

The `MockNetworkProvider` has extra methods to enable this local emulation such as `.addUtxo()` and `.setBlockHeight()`.
You can read more about the `MockNetworkProvider` and automated tests on the [testing setup](/docs/sdk/testing-setup) page.

```ts
interface MockNetworkProvider extends NetworkProvider {
  options: MockNetworkProviderOptions;
  vmTarget: VmTarget;

  constructor(options?: Partial<MockNetworkProviderOptions>) {}

  // Hardcode the block height
  setBlockHeight(newBlockHeight: number): void;

  // Add a UTXO to the UTXO set of the mock network, returns the UTXO including its locking bytecode
  addUtxo(addressOrLockingBytecode: string, utxo: Utxo): SpendableUtxo;

  // Reset the UTXO set and transaction list of the mock network
  reset(): void;
}
```

### Options

```ts
interface MockNetworkProviderOptions {
  updateUtxoSet?: boolean;
  validateTransactions?: boolean;
  vmTarget?: VmTarget;
}
```

- `updateUtxoSet` (default `true`) — update the in-memory UTXO set after a transaction is sent, consuming the spent UTXOs and adding the transaction's outputs.
- `validateTransactions` (default `true`) — evaluate sent transactions against the BCH VM using the actual locking bytecode of the spent UTXOs, rejecting transactions that a real node would reject. Requires `updateUtxoSet`.
- `vmTarget` (default `BCH_2026_05`) — the BCH virtual machine version used for local debugging and transaction validation.

#### Example
```ts
const provider = new MockNetworkProvider();
const newUtxo = provider.addUtxo(contractAddress, randomUtxo({ satoshis: 10_000n }));
```

The network type of the `MockNetworkProvider` is `'mocknet'`.

## Other NetworkProviders

Third parties can implement their own alternative network providers by implementing the `NetworkProvider` interface and publishing them as a package.
