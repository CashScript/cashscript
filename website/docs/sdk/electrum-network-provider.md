---
title: Electrum Network Provider
---

The CashScript SDK needs to connect to the BCH network to perform certain operations, like retrieving the contract's balance, or sending transactions. By default the network provider is an `ElectrumNetworkProvider`.

## ElectrumNetworkProvider

The ElectrumNetworkProvider uses [@electrum-cash/network][electrum-cash] to connect to the BCH network. Both `network` and `options` parameters are optional, and they default to mainnet with the `bch.imaginary.cash` electrum server.

```ts
new ElectrumNetworkProvider(network?: Network, options?: Options)
```

Using the `network` parameter, you can specify the network to connect to. There's 4 networks supported by the `ElectrumNetworkProvider`:

```ts
type Network = 'mainnet' | 'chipnet' | 'testnet3' | 'testnet4';
```

Using the `options` parameter, you can specify a custom electrum client or hostname, and enable manual connection management.

```ts
type Options = OptionsBase | CustomHostNameOptions | CustomElectrumOptions;

interface OptionsBase {
  manualConnectionManagement?: boolean;
}

interface CustomHostNameOptions extends OptionsBase {
  hostname: string;
}

interface CustomElectrumOptions extends OptionsBase {
  electrum: ElectrumClient<ElectrumClientEvents>;
}
```

#### Example
```ts
import { ElectrumNetworkProvider } from 'cashscript';

const hostname = 'chipnet.bch.ninja';
const provider = new ElectrumNetworkProvider('chipnet', { hostname });
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
```

#### Example
```ts
const userUtxos = await provider.getUtxos(userAddress)
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

### performRequest()

Perform an arbitrary electrum request, refer to the docs at [electrum-cash-protocol](https://electrum-cash-protocol.readthedocs.io/en/latest/).

#### Example
```ts
const verbose = true // get parsed transaction as json result
const txId = await provider.performRequest('blockchain.transaction.get', txid, verbose)
```

### Manual Connection Management

By default, the ElectrumNetworkProvider will automatically connect and disconnect to the electrum client as needed. However, you can enable manual connection management by setting the `manualConnectionManagement` option to `true`. This can be useful if you are passing a custom electrum client and are using that client for other purposes, such as subscribing to events.

```ts
const provider = new ElectrumNetworkProvider('chipnet', { manualConnectionManagement: true });
```

:::tip
If you're providing an `ElectrumClient` and using it to subscribe to address or blockheader events, you need to enable `manualConnectionManagement` to overwrite the default of connecting and disconnecting for each separate request.
:::

#### connect()
```ts
provider.connect(): Promise<void>;
```

Connects to the electrum client.

#### disconnect()
```ts
provider.disconnect(): Promise<boolean>;
```

Disconnects from the electrum client, returns `true` if the client was connected, `false` if it was already disconnected.


[electrum-cash]: https://www.npmjs.com/package/@electrum-cash/network
