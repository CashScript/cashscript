---
title: Advanced Transaction Builder
---

With the introduction of newer smart contract features to BCH, such as native introspection and CashTokens, we've seen use cases for combining UTXOs of multiple different smart contracts within a single transaction — such as [Fex][fex]. The [simple transaction builder][transactions-simple] only operates on a single smart contract. To support more advanced use cases, you can use the Advanced Transaction Builder.

The Advanced Transaction Builder supports adding UTXOs from any number of different smart contracts and P2PKH UTXOs. While the simplified transaction builder automatically selects UTXOs for you and adds change outputs, the advanced transaction builder requires you to provide the UTXOs yourself and manage change carefully.

## Instantiating a transaction builder
```ts
new TransactionBuilder(options: TransactionBuilderOptions)
```

To start, you need to instantiate a transaction builder and pass in a `NetworkProvider` instance.

```ts
interface TransactionBuilderOptions {
  provider: NetworkProvider;
}
```


#### Example
```ts
import { ElectrumNetworkProvider, TransactionBuilder, Network } from 'cashscript';

const provider = new ElectrumNetworkProvider(Network.MAINNET);
const transactionBuilder = new TransactionBuilder({ provider });
```

## Transaction options

### addInput()
```ts
transactionBuilder.addInput(utxo: Utxo, unlocker: Unlocker, options?: InputOptions): this
```

Adds a single input UTXO to the transaction that can be unlocked using the provided unlocker. The unlocker can be derived from a `SignatureTemplate` or a `Contract` instance's spending functions. The `InputOptions` object can be used to specify the sequence number of the input.

:::note
It is possible to create custom unlockers by implementing the `Unlocker` interface. Most use cases are covered by the `SignatureTemplate` and `Contract` classes.
:::

#### Example
```ts
import { contract, aliceTemplate, aliceAddress, transactionBuilder } from './somewhere.js';

const contractUtxos = await contract.getUtxos();
const aliceUtxos = await provider.getUtxos(aliceAddress);

transactionBuilder.addInput(contractUtxos[0], contract.unlock.spend());
transactionBuilder.addInput(aliceUtxos[0], aliceTemplate.unlockP2PKH());
```

### addInputs()
```ts
transactionBuilder.addInputs(utxos: Utxo[], unlocker: Unlocker, options?: InputOptions): this
transactionBuilder.addInputs(utxos: UnlockableUtxo[]): this
```

```ts
interface UnlockableUtxo extends Utxo {
  unlocker: Unlocker;
  options?: InputOptions;
}
```

Adds a list of input UTXOs, either with a single shared unlocker or with individual unlockers for each UTXO. The `InputOptions` object can be used to specify the sequence number of the inputs.

#### Example
```ts
import { contract, aliceTemplate, aliceAddress, transactionBuilder } from './somewhere.js';

const contractUtxos = await contract.getUtxos();
const aliceUtxos = await provider.getUtxos(aliceAddress);

// Use a single unlocker for all inputs you're adding at a time
transactionBuilder.addInputs(contractUtxos, contract.unlock.spend());
transactionBuilder.addInputs(aliceUtxos, aliceTemplate.unlockP2PKH());

// Or combine the UTXOs with their unlockers in an array
const unlockableUtxos = [
  { ...contractUtxos[0], unlocker: contract.unlock.spend() },
  { ...aliceUtxos[0], unlocker: aliceTemplate.unlockP2PKH() },
];
transactionBuilder.addInputs(unlockableUtxos);
```

### addOutput() & addOutputs()
```ts
transactionBuilder.addOutput(output: Output): this
transactionBuilder.addOutputs(outputs: Output[]): this
```

Adds a single output or a list of outputs to the transaction.

```ts
interface Output {
  to: string | Uint8Array;
  amount: bigint;
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
import { aliceAddress, bobAddress, transactionBuilder, tokenCategory } from './somewhere.js';

transactionBuilder.addOutput({
  to: aliceAddress,
  amount: 100_000n,
  token: {
    amount: 1000n,
    category: tokenCategory,
  }
});

transactionBuilder.addOutputs([
  { to: aliceAddress, amount: 50_000n },
  { to: bobAddress, amount: 50_000n },
]);
```

### addOpReturnOutput()
```ts
transactionBuilder.addOpReturnOutput(chunks: string[]): this
```

Adds an OP_RETURN output to the transaction with the provided data chunks in string format. If the string is `0x`-prefixed, it is treated as a hex string. Otherwise it is treated as a UTF-8 string.

#### Example
```ts
// Post "Hello World!" to memo.cash
transactionBuilder.addOpReturnOutput(['0x6d02', 'Hello World!']);
```


### setLocktime()
```ts
transactionBuilder.setLocktime(locktime: number): this
```

Sets the locktime for the transaction to set a transaction-level absolute timelock (see [Timelock documentation][bitcoin-wiki-timelocks] for more information). The locktime can be set to a specific block height or a unix timestamp.

#### Example
```ts
// Set locktime one day from now
transactionBuilder.setLocktime(((Date.now() / 1000) + 24 * 60 * 60) * 1000);
```

### setMaxFee()
```ts
transactionBuilder.setMaxFee(maxFee: bigint): this
```

Sets a max fee for the transaction. Because the advanced transaction builder does not automatically add a change output, you can set a max fee as a safety measure to make sure you don't accidentally pay too much in fees. If the transaction fee exceeds the max fee, an error will be thrown when building the transaction.

#### Example
```ts
transactionBuilder.setMaxFee(1000n);
```

## Transaction building
### send()
```ts
async transactionBuilder.send(): Promise<TransactionDetails>
```

After completing a transaction, the `send()` function can be used to send the transaction to the BCH network. An incomplete transaction cannot be sent.

```ts
interface TransactionDetails {
  inputs: Uint8Array[];
  locktime: number;
  outputs: Uint8Array[];
  version: number;
  txid: string;
  hex: string;
}
```

#### Example
```ts
import { aliceTemplate, aliceAddress, bobAddress, contract, provider } from './somewhere.js';

const contractUtxos = await contract.getUtxos();
const aliceUtxos = await provider.getUtxos(aliceAddress);

const txDetails = await new TransactionBuilder({ provider })
  .addInput(contractUtxos[0], contract.unlock.spend(aliceTemplate, 1000n))
  .addInput(aliceUtxos[0], aliceTemplate.unlockP2PKH())
  .addOutput({ to: bobAddress, amount: 100_000n })
  .addOpReturnOutput(['0x6d02', 'Hello World!'])
  .setMaxFee(2000n)
  .send()
```

### build()
```ts
transactionBuilder.build(): string
```

After completing a transaction, the `build()` function can be used to build the entire transaction and return the signed transaction hex string. This can then be imported into other libraries or applications as necessary.

#### Example
```ts
import { aliceTemplate, aliceAddress, bobAddress, contract, provider } from './somewhere.js';

const contractUtxos = await contract.getUtxos();
const aliceUtxos = await provider.getUtxos(aliceAddress);

const txHex = new TransactionBuilder({ provider })
  .addInput(contractUtxos[0], contract.unlock.spend(aliceTemplate, 1000n))
  .addInput(aliceUtxos[0], aliceTemplate.unlockP2PKH())
  .addOutput({ to: bobAddress, amount: 100_000n })
  .addOpReturnOutput(['0x6d02', 'Hello World!'])
  .setMaxFee(2000n)
  .build()
```

## Transaction errors

Transactions can fail for a number of reasons. Refer to the [Transaction Errors][transactions-simple-errors] section of the simplified transaction builder documentation for more information. Note that the advanced transaction builder does not yet support the `FailedRequireError` mentioned in the simplified transaction builder documentation so any error will be of type `FailedTransactionError` and include any of the mentioned error reasons in its message.

[fex]: https://github.com/fex-cash/fex
[bitcoin-wiki-timelocks]: https://en.bitcoin.it/wiki/Timelock

[transactions-simple]: /docs/sdk/transactions
[transactions-simple-errors]: /docs/sdk/transactions#transaction-errors
