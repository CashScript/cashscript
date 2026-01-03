---
title: Old Transaction Builder
---

:::caution
This is the documentation for the old and now deprecated 'Simple Transaction Builder' which operated on a single contract.
It is strongly recommended to migrate over to the new default transaction builder [using the migration notes](/docs/releases/migration-notes).
:::

When calling a contract function of a Contract object's `functions`, an incomplete Transaction object is returned. This transaction can be completed by providing a number of outputs using the [`to()`][to()] or [`withOpReturn()`][withOpReturn()] functions. Other chained functions are included to set other transaction parameters.

Most of the available transaction options are only useful in very specific use cases, but the functions [`to()`][to()], [`withOpReturn()`][withOpReturn()] and [`send()`][send()] are commonly used. [`withHardcodedFee()`][withHardcodedFee()] is also commonly used with covenant contracts.

## Transaction options

### to()
```ts
transaction.to(to: string, amount: bigint, token?: TokenDetails): this
transaction.to(outputs: Array<Recipient>): this
```

The `to()` function allows you to add outputs to the transaction. Either a single pair `to/amount` pair can be provided, or a list of them. This function can be called any number of times, and the provided outputs will be added to the list of earlier added outputs. Tokens can be sent by providing a `TokenDetails` object as the third parameter, or including it in your array of outputs with the `.token` property.

```ts
interface Recipient {
  to: string;
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

:::note
The CashScript SDK supports automatic UTXO selection for BCH and fungible CashTokens. However, if you want to send Non-Fungible CashTokens, you will need to do manual UTXO selection using `from()`.
:::

#### Example
```ts
.to('bitcoincash:qrhea03074073ff3zv9whh0nggxc7k03ssh8jv9mkx', 500000n)
```

### withOpReturn()
```ts
transaction.withOpReturn(chunks: string[]): this
```

The `withOpReturn()` function allows you to add `OP_RETURN` outputs to the transaction. The `chunks` parameter can include regular UTF-8 encoded strings, or hex strings prefixed with `0x`. This function can be called any number of times, and the provided outputs will be added to the list of earlier added outputs.

#### Example
```ts
.withOpReturn(['0x6d02', 'Hello World!'])
```

### from()
```ts
transaction.from(inputs: Utxo[]): this
```

The `from()` function allows you to provide a hardcoded list of contract UTXOs to be used in the transaction. This overrides the regular UTXO selection performed by the CashScript SDK, so **no further selection will be performed** on the provided UTXOs. This function can be called any number of times, and the provided UTXOs will be added to the list of earlier added UTXOs.

:::tip
The built-in UTXO selection is generally sufficient. But there are specific use cases for which it makes sense to use a custom selection algorithm.
:::

#### Example
```ts
.from(await instance.getUtxos())
```

### fromP2PKH()
```ts
transaction.fromP2PKH(input: Utxo, template: SignatureTemplate): this;
transaction.fromP2PKH(inputs: Utxo[], template: SignatureTemplate): this;
```

The `fromP2PKH()` function allows you to provide a list of P2PKH UTXOs to be used in the transaction. The passed `SignatureTemplate` is used to sign these UTXOs. This function can be called any number of times, and the provided UTXOs will be added to the list of earlier added UTXOs.

#### Example
```ts
import { bobAddress, bobPrivateKey } from './somewhere';
import { ElectrumNetworkProvider, SignatureTemplate } from 'cashscript';

const provider = new ElectrumNetworkProvider();
const bobUtxos = await provider.getUtxos(bobAddress);

.fromP2PKH(bobUtxos, new SignatureTemplate(bobPrivateKey))
```


### withFeePerByte()
```ts
transaction.withFeePerByte(feePerByte: number): this
```

The `withFeePerByte()` function allows you to specify the fee per per bytes for the transaction. By default the fee per bytes is set to 1.0 satoshis, which is nearly always enough to be included in the next block. So it's generally not necessary to change this.

#### Example
```ts
.withFeePerByte(2.3)
```

### withHardcodedFee()
```ts
transaction.withHardcodedFee(hardcodedFee: bigint): this
```

The `withHardcodedFee()` function allows you to specify a hardcoded fee to the transaction. By default the transaction fee is automatically calculated by the CashScript SDK, but there are certain use cases where the smart contract relies on a hardcoded fee.

:::tip
If you're not building a covenant contract, you probably do not need a hardcoded transaction fee.
:::

#### Example
```ts
.withHardcodedFee(1000n)
```

### withMinChange()
```ts
transaction.withMinChange(minChange: bigint): this
```

The `withMinChange()` function allows you to set a threshold for including a change output. Any remaining amount under this threshold will be added to the transaction fee instead.

:::tip
This is generally only useful in specific covenant use cases.
:::

#### Example
```ts
.withMinChange(1000n)
```

### withoutChange()
```ts
transaction.withoutChange(): this
```

The `withoutChange()` function allows you to disable the change output. The remaining amount will be added to the transaction fee instead. This is equivalent to `withMinChange(Number.MAX_VALUE)`.

:::caution
Be sure to check that the remaining amount (sum of inputs - sum of outputs) is not too high. The difference will be added to the transaction fee and cannot be reclaimed.
:::

#### Example
```ts
.withoutChange()
```

### withoutTokenChange()
```ts
transaction.withoutTokenChange(): this
```

The `withoutTokenChange()` function allows you to disable the change output for tokens.

:::caution
Be sure to check that the remaining amount (sum of inputs - sum of outputs) is not too high. The difference will be burned and cannot be reclaimed.
:::

#### Example
```ts
.withoutTokenChange()
```

### withAge()
```ts
transaction.withAge(age: number): this
```

The `withAge()` function allows you to specify the minimum age of the transaction inputs. This is necessary if you want to use the `tx.age` CashScript functionality. The `age` parameter passed into this function will be the value of `tx.age` inside the smart contract. For more information, refer to [BIP68][bip68].

#### Example
```ts
.withAge(10)
```

### withTime()
```ts
transaction.withTime(time: number): this
```

The `withTime()` function allows you to specify the minimum block number that the transaction can be included in. The `time` parameter will be the value of `tx.time` inside the smart contract.

:::tip
By default, the transaction's `time` variable is set to the most recent block number, which is the most common use case. So you should only override this in specific use cases.
:::

#### Example
```ts
.withTime(700000)
```

## Transaction building
### send()
```ts
async transaction.send(): Promise<TransactionDetails>
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
import { alice } from './somewhere';

const txDetails = await instance.functions
  .transfer(new SignatureTemplate(alice))
  .withOpReturn(['0x6d02', 'Hello World!'])
  .to('bitcoincash:qrhea03074073ff3zv9whh0nggxc7k03ssh8jv9mkx', 200000n)
  .to('bitcoincash:qqeht8vnwag20yv8dvtcrd4ujx09fwxwsqqqw93w88', 100000n)
  .withHardcodedFee(1000n)
  .send()
```

### build()
```ts
async transaction.build(): Promise<string>
```

After completing a transaction, the `build()` function can be used to build the entire transaction and return the signed transaction hex string. This can then be imported into other libraries or applications as necessary.

#### Example
```ts
const txHex = await instance.functions
  .transfer(new SignatureTemplate(alice))
  .to('bitcoincash:qrhea03074073ff3zv9whh0nggxc7k03ssh8jv9mkx', 500000n)
  .withAge(10)
  .withFeePerByte(10)
  .build()
```

### debug() & getBitauthUri()

If you want to debug a transaction locally instead of sending it to the network, you can call the `debug()` function on the transaction. This will return intermediate values and the final result of the transaction. It will also show any logged values and `require` error messages.

If you prefer a lower-level debugging experience, you can call the `getBitauthUri()` function on the transaction. This will return a URI that can be opened in the BitAuth IDE. This URI is also displayed in the console whenever a transaction fails.

You can read more about debugging transactions on the [debugging page](/docs/guides/debugging).

:::caution
It is unsafe to debug transactions on mainnet using the BitAuth IDE as private keys will be exposed to BitAuth IDE and transmitted over the network.
:::

### getVmResourceUsage()
```ts
transaction.getVmResourceUsage(verbose: boolean = false): Array<VmResourceUsage>
```

The `getVmResourceUsage()` function allows you to get the VM resource usage for the transaction. This can be useful for debugging and optimization. The VM resource usage is calculated for each input individually so the result is an array of `VmResourceUsage` results corresponding to each of the transaction inputs.

```ts
interface VmResourceUsage {
  arithmeticCost: number;
  definedFunctions: number;
  hashDigestIterations: number;
  maximumOperationCost: number;
  maximumHashDigestIterations: number;
  maximumSignatureCheckCount: number;
  densityControlLength: number;
  operationCost: number;
  signatureCheckCount: number;
}
```

The verbose mode also logs the VM resource usage for each input as a table to the console.

```
VM Resource usage by inputs:
┌─────────┬─────────────────────────────────────────────────┬─────┬──────────────────────────┬───────────┬──────────┐
│ (index) │ Contract - Function                             │ Ops │ Op Cost Budget Usage     │ SigChecks │ Hashes   │
├─────────┼─────────────────────────────────────────────────┼─────┼──────────────────────────┼───────────┼──────────┤
│ 0       │ 'SingleFunction - test_require_single_function' │ 7   │ '1,155 / 36,000 (3%)'    │ '0 / 1'   │ '2 / 22' │
│ 1       │ 'ZeroHandling - test_zero_handling'             │ 13  │ '1,760 / 40,800 (4%)'    │ '0 / 1'   │ '2 / 25' │
│ 2       │ 'P2PKH Input'                                   │ 7   │ '28,217 / 112,800 (25%)' │ '1 / 3'   │ '7 / 70' │
└─────────┴─────────────────────────────────────────────────┴─────┴──────────────────────────┴───────────┴──────────┘
```

## Transaction errors

When sending a transaction, the CashScript SDK will throw an error if the transaction fails. If you are using an artifact compiled with `cashc@0.10.0` or later, the error will be of the type `FailedRequireError` or `FailedTransactionEvaluationError`. In case of a `FailedRequireError`, the error will refer to the corresponding `require` statement in the contract code so you know where your contract failed. If you want more information about the underlying error, you can check the `libauthErrorMessage` property of the error.

```ts
interface FailedRequireError {
  message: string;
  contractName: string;
  requireStatement: { ip: number, line: number, message: string };
  inputIndex: number,
  libauthErrorMessage?: string,
  bitauthUri?: string;
}
```

If you are using an artifact compiled with an older version of `cashc`, the error will always be of the type `FailedTransactionError`. In this case, you can use the `reason` property of the error to determine the reason for the failure.

[fetch-api]: https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API
[bip68]: https://github.com/bitcoin/bips/blob/master/bip-0068.mediawiki

[to()]: /docs/sdk/transactions#to
[withOpReturn()]: /docs/sdk/transactions#withopreturn
[from()]: /docs/sdk/transactions#from
[withFeePerByte()]: /docs/sdk/transactions#withfeeperbyte
[withHardcodedFee()]: /docs/sdk/transactions#withhardcodedfee
[withMinChange()]: /docs/sdk/transactions#withminchange
[withAge()]: /docs/sdk/transactions#withage
[withTime()]: /docs/sdk/transactions#withtime

[send()]: /docs/sdk/transactions#send
[build()]: /docs/sdk/transactions#build
