---
title: Other Network Providers
---

The CashScript SDK needs to connect to the BCH network to perform certain operations, like retrieving the contract's balance, or sending transactions.

## MockNetworkProvider
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

The network type of the `MockNetworkProvider`.

## Other NetworkProviders

There are two alternative network providers implemented. Currently neither supports CashTokens, so it is recommended to use the `ElectrumNetworkProvider`.

### FullStackNetworkProvider

```ts
new FullStackNetworkProvider(network: Network, bchjs: BCHJS)
```

The `FullStackNetworkProvider` uses [FullStack.cash][fullstack]' infrastructure to connect to the BCH network. FullStack.cash' offers dedicated infrastructure and support plans for larger projects. Both `network` and `bchjs` parameters are mandatory, where `bchjs` is an instance of FullStack.cash' [BCHJS][bchjs].

:::caution
The `FullStackNetworkProvider` does not currently support CashTokens. If you want to use CashTokens, please use the `ElectrumNetworkProvider` instead.
:::

#### Example

```js
import BCHJS from '@psf/bch-js';
import { FullStackNetworkProvider } from 'cashscript';

const restURL = 'https://api.fullstack.cash/v3/';
const apiToken = 'eyJhbGciO...'; // Your JWT token here.
const bchjs = new BCHJS({ restURL, apiToken });

const provider = new FullStackNetworkProvider('mainnet', bchjs);
```

### BitcoinRpcNetworkProvider

```ts
new BitcoinRpcNetworkProvider(network: Network, url: string, options?: any)
```

The `BitcoinRpcNetworkProvider` uses a direct connection to a BCH node. Note that a regular node does not have indexing, so any address of interest (e.g. the contract address) need to be registered by the node *before* sending any funds to those addresses. Because of this it is recommended to use a different network provider unless you have a specific reason to use the RPC provider.

:::caution
The `BitcoinRpcNetworkProvider` does not currently support CashTokens. If you want to use CashTokens, please use the `ElectrumNetworkProvider` instead.
:::

#### Example
```js
import { BitcoinRpcNetworkProvider } from 'cashscript';

const provider = new BitcoinRpcNetworkProvider('mainnet', 'http://localhost:8332');
```

[fullstack]: https://fullstack.cash/
[bchjs]: https://bchjs.fullstack.cash/
