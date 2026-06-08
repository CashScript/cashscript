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
interface MockNetworkProviderOptions {
  updateUtxoSet?: boolean;
  vmTarget?: VmTarget;
}

interface MockNetworkProvider extends NetworkProvider {
  options: MockNetworkProviderOptions;
  vmTarget: VmTarget;

  constructor(options?: Partial<MockNetworkProviderOptions>) {}

  // Hardcode the block height
  setBlockHeight(newBlockHeight: number): void;

  // Add a UTXO to the UTXO set of the mock network
  addUtxo(addressOrLockingBytecode: string, utxo: Utxo): void;

  // Reset the UTXO set and transaction list of the mock network
  reset(): void;
}
```

The `updateUtxoSet` option is used to determine whether the UTXO set should be updated after a transaction is sent. If `updateUtxoSet` is `true` (default), the UTXO set will be updated to reflect the new state of the mock network. If `updateUtxoSet` is `false`, the UTXO set will not be updated.

The `vmTarget` option defaults to the current VM of `BCH_2026_05`, but this can be changed to test your contract against different BCH virtual machine targets.

#### Example
```ts
const provider = new MockNetworkProvider();
const newUtxo = randomUtxo({satoshis: 10_000n})
provider.addUtxo(contractAddress, newUtxo);
```

The network type of the `MockNetworkProvider` is `'mocknet'`.

## Other NetworkProviders

Third parties can implement their own alternative network providers by implementing the `NetworkProvider` interface and publishing them as a package.
