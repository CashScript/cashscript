---
title: Network Provider
---

The CashScript SDK needs to connect to the BCH network to perform certain operations, like retrieving the contract's balance, or sending transactions. The recommended network provider to use blockchain network functionality is the `ElectrumNetworkProvider`, however for local development it is recommended to use a `MockNetworkProvider`.

:::tip
CashScript NetworkProviders have a standardized interface, this allows different network providers to be used by the SDK and makes it easy to swap out dependencies.
:::

## Interface NetworkProvider

### Network
```ts
type Network = 'mainnet' | 'chipnet' | 'mocknet' | 'testnet3' | 'testnet4' | 'regtest';
```

The network parameter can be one of 6 different options.

#### Example
```ts
const connectedNetwork = provider.network;
```

### vmTarget
```ts
provider.vmTarget?: 'BCH_2023_05' | 'BCH_2025_05' | 'BCH_2026_05' | 'BCH_SPEC';
```

Providers can optionally expose the BCH VM target they are configured for. CashScript uses this metadata to validate artifact requirements during local testing, debugging, and transaction-template generation.

This is especially relevant for contracts using BCH internal-function opcodes like `OP_DEFINE` and `OP_INVOKE`, which currently require `BCH_2026_05`.

#### Example
```ts
const provider = new MockNetworkProvider({ vmTarget: VmTarget.BCH_2026_05 });
```

### getUtxos()
```ts
async provider.getUtxos(address: string): Promise<Utxo[]>;
```
Returns all UTXOs on specific address. Both confirmed and unconfirmed UTXOs are included.

```ts
interface Utxo {
  txid: string;
  vout: number;
  satoshis: bigint;
  token?: TokenDetails;
}

interface TokenDetails {
  amount: bigint;
  category: string;
  nft?: {
    capability: 'none' | 'mutable' | 'minting';
    commitment: string;
  };
}
```

#### Example
```ts
const userUtxos = await provider.getUtxos(userAddress)
```

### getUtxosForLockingBytecode()
```ts
async provider.getUtxosForLockingBytecode(lockingBytecode: Uint8Array | string): Promise<Utxo[]>;
```
Returns all UTXOs for a specific locking bytecode. Both confirmed and unconfirmed UTXOs are included.

#### Example
```ts
const utxos = await provider.getUtxosForLockingBytecode(lockingBytecode)
```

### getBlockHeight()
```ts
async provider.getBlockHeight(): Promise<number>;
```
Get the current blockHeight.

#### Example
```ts
const currentBlockHeight = await provider.getBlockHeight()
```

### getRawTransaction()
```ts
async provider.getRawTransaction(txid: string): Promise<string>;
```

Retrieve the Hex transaction details for a given transaction ID.

#### Example
```ts
const rawTransaction = await provider.getRawTransaction(txid)
```

### sendRawTransaction()
```ts
async provider.sendRawTransaction(txHex: string): Promise<string>;
```
Broadcast a raw hex transaction to the network.

#### Example
```ts
const txId = await provider.sendRawTransaction(txHex)
```

## Custom NetworkProviders

A big strength of the NetworkProvider setup is that it allows you to implement custom providers. So if you want to use a new or different BCH indexer for network information, it is simple to add support for it by creating your own `NetworkProvider` adapter by implementing the [NetworkProvider interface](https://github.com/CashScript/cashscript/blob/master/packages/cashscript/src/network/NetworkProvider.ts).

You can create a PR to add your custom `NetworkProvider` to the CashScript codebase to share this functionality with others. It is required to have basic automated tests for any new `NetworkProvider`.

### Error Handling

A custom `NetworkProvider` should throw the following error types when an error occurs while broadcasting a transaction:

| Error | Description |
|---|---|
| `NetworkProviderMissingInputsError` | Transaction inputs are missing or already spent |
| `NetworkProviderMempoolConflictError` | Transaction conflicts with an unconfirmed transaction in the mempool |
| `NetworkProviderTransactionAlreadySubmittedError` | Transaction has already been submitted |
| `NetworkProviderAbsoluteTimelockError` | Transaction is not yet final (nLockTime not satisfied) |
| `NetworkProviderRelativeTimelockError` | BIP68 sequence lock not satisfied |
| `NetworkProviderError` | Generic fallback network provider error |

## Provider-Specific functionality

Beyond the standardized `NetworkProvider` interface each provider can have its own provider-specific functionality. This can either be done by extending the `NetworkProvider` interface or by providing a more full-featured networking client to create the `NetworkProvider`.

## Limitations

If you look at the [Transaction Lifecycle](guides/lifecycle.md) guide then you'll see there are blockchain edge cases like chain re-organisations or double spends. Ideally the `NetworkProvider` interface would be able to provide more detailed `Utxo` chain information like whether the UTXO is unconfirmed or confirmed, the number of confirmations and the block-hash of the block which included the transaction creating the UTXO.

Currently however the `NetworkProvider` interface does not include the details needed to understand whether blockchain state is confirmed, pending or ended up getting reversed. This means that in the case something does end up being reversed your application might not correctly be in sync with the actual network state.
