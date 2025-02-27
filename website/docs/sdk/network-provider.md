---
title: Network Provider
---

The CashScript SDK needs to connect to the BCH network to perform certain operations, like retrieving the contract's balance, or sending transactions. By default the network provider is an `ElectrumNetworkProvider`.

## ElectrumNetworkProvider

The ElectrumNetworkProvider uses [electrum-cash][electrum-cash] to connect to the BCH network. Both `network` and `electrum` parameters are optional, and they default to mainnet and a 2-of-3 ElectrumCluster with a number of reliable electrum servers.

```ts
new ElectrumNetworkProvider(network?: Network, electrum?: ElectrumCluster)
```

:::note
In some cases it might be desirable to overwrite the 2-of-3 ElectrumCluster default to use only a 1-of-1 cluster because of network latency.
:::


### Network
```ts
type Network = 'mainnet' | 'chipnet' | 'testnet3' | 'testnet4' | 'regtest';
```

The network parameter can be one of 5 different options.

#### Example
```ts
const provider = new ElectrumProvider('chipnet');
```

### getUtxos
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
```

#### Example
```ts
const userUtxos = await provider.getUtxos(userAddress)
```

### getBlockHeight
```ts
async provider.getBlockHeight(): Promise<number>;
```
Get the current blockHeight.

#### Example
```ts
const currentBlockHeight = await provider.getBlockHeight()
```

### getRawTransaction
```ts
async provider.getRawTransaction(txid: string): Promise<string>;
```

Retrieve the Hex transaction details for a given transaction ID.

#### Example
```ts
const rawTransaction = await provider.getRawTransaction(txid)
```

### sendRawTransaction
```ts
async provider.sendRawTransaction(txHex: string): Promise<string>;
```
Broadcast a raw hex transaction to the network.

#### Example
```ts
const txId = await provider.sendRawTransaction(txHex)
```

### performRequest

Perform an arbitrary electrum request, refer to the docs at [electrum-cash-protocol](https://electrum-cash-protocol.readthedocs.io/en/latest/).

#### Example
```ts
const verbose = true // get parsed transaction as json result
const txId = await provider.performRequest('blockchain.transaction.get', txid, verbose)
```

## Advanced Options

All network functionality that the CashScript SDK needs is encapsulated in a network provider. This allows different network providers to be used and makes it easy to swap out dependencies.

### MockNetworkProvider
```ts
new MockNetworkProvider()
```

The `MockNetworkProvider` is a special network provider that allows you to evaluate transactions locally without interacting with the Bitcoin Cash network. This is useful when writing automated tests for your contracts, or when debugging your contract locally. You can read more about the `MockNetworkProvider` and automated tests on the [testing setup](/docs/sdk/testing-setup) page.

#### Example
```ts
const provider = new MockNetworkProvider();
const newUtxo = randomUtxo({satoshis: 10_000n})
provider.addUtxo(contractAddress, newUtxo);
```

### Other NetworkProviders

There are two alternative network providers implemented:
- `FullStackNetworkProvider`: uses [FullStack.cash][fullstack]' infrastructure to connect to the BCH network.
- `BitcoinRpcNetworkProvider`: uses a direct connection to a Bitcoin Cash node.

Currently neither supports CashTokens, so it is recommended to use the `ElectrumNetworkProvider`.

### Custom NetworkProviders
A big strength of the NetworkProvider setup is that it allows you to implement custom providers. So if you want to use a new or different BCH indexers for network information, it is simple to use it with CashScript.

:::info
To implement a Custom NetworkProvider, refer to the [NetworkProvider interface](https://github.com/CashScript/cashscript/blob/master/packages/cashscript/src/network/NetworkProvider.ts).
:::


[electrum-cash]: https://www.npmjs.com/package/electrum-cash
[fullstack]: https://fullstack.cash/
[bchjs]: https://bchjs.fullstack.cash/
