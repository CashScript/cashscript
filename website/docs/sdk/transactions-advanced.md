---
title: Advanced Transaction Builder
---

With the introduction of newer smart contract features to BCH, such as native introspection and CashTokens, we've seen use cases for combining UTXOs of multiple different smart contracts within a single transaction - such as [Fex][fex]. The [simplified transaction builder][transactions-simple] only operates on a single smart contract, so to support more advanced use cases, you can use the Advanced Transaction Builder.

The Advanced Transaction Builder supports adding UTXOs from any number of different smart contracts and P2PKH UTXOs. While the simplified transaction builder automatically selects UTXOs for you and adds change outputs, the advanced transaction builder requires you to provide the UTXOs yourself and manage change carefully.

## Instantiating a transaction builder
```ts
new TransactionBuilder(options: TransactionBuilderOptions)

interface TransactionBuilderOptions {
  provider: NetworkProvider;
}
```

To start, you need to instantiate a transaction builder and pass in a `NetworkProvider` instance.

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

### addInputs()
```ts
transactionBuilder.addInputs(utxos: Utxo[], unlocker: Unlocker, options?: InputOptions): this
transactionBuilder.addInputs(utxos: UnlockableUtxo[]): this
```

### addOutput()
```ts
transactionBuilder.addOutput(output: Output): this
```

### addOutputs()
```ts
transactionBuilder.addOutputs(outputs: Output[]): this
```

### addOpReturnOutput()
```ts
transactionBuilder.addOpReturnOutput(chunks: string[]): this
```

### setLocktime()
```ts
transactionBuilder.setLocktime(locktime: number): this
```

### setMaxFee()
```ts
transactionBuilder.setMaxFee(maxFee: bigint): this
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

:::tip
If the transaction fails, a meep command is automatically returned. This command can be used to debug the transaction using the [meep debugger][meep]
:::

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
async transactionBuilder.build(): Promise<string>
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

### meep()
```ts
async transaction.meep(): Promise<string>
```

After completing a transaction, the `meep()` function can be used to return the required debugging command for the [meep debugger][meep]. This command string can then be used to debug the transaction.

#### Example
```ts
const meepStr = await instance.functions
  .transfer(new SignatureTemplate(alice))
  .to('bitcoincash:qrhea03074073ff3zv9whh0nggxc7k03ssh8jv9mkx', 500000n)
  .withTime(700000)
  .meep()
```

:::note
Meep does not work very well with contracts that use modern CashScript / BCH features, like native introspection, P2SH32 or CashTokens.
:::


## Transaction errors
Transactions can fail for a number of reasons. Most of these are related to the execution of the smart contract (e.g. wrong parameters or a bug in the contract code). But errors can also occur because of other reasons (e.g. a fee that's too low or the same transaction already exists in the mempool). To facilitate error handling in your applications, the CashScript SDK provides an enum of different *reasons* for a failure.

This `Reason` enum only includes errors that are related to smart contract execution, so other reasons have to be caught separately. Besides the `Reason` enum, there are also several error classes that can be caught and acted on:

* **`FailedRequireError`**, signifies a failed require statement. This includes the following reasons:
  * `Reason.EVAL_FALSE`
  * `Reason.VERIFY`
  * `Reason.EQUALVERIFY`
  * `Reason.CHECKMULTISIGVERIFY`
  * `Reason.CHECKSIGVERIFY`
  * `Reason.CHECKDATASIGVERIFY`
  * `Reason.NUMEQUALVERIFY`
* **`FailedTimeCheckError`**, signifies a failed time check using `tx.time` or `tx.age`. This includes the following reasons:
  * `Reason.NEGATIVE_LOCKTIME`
  * `Reason.UNSATISFIED_LOCKTIME`
* **`FailedSigCHeckError`**, signifies a failed signature check. This includes the following reasons:
  * `Reason.SIG_COUNT`
  * `Reason.PUBKEY_COUNT`
  * `Reason.SIG_HASHTYPE`
  * `Reason.SIG_DER`
  * `Reason.SIG_HIGH_S`
  * `Reason.SIG_NULLFAIL`
  * `Reason.SIG_BADLENGTH`
  * `Reason.SIG_NONSCHNORR`
* **`FailedTransactionError`**, signifies a general fallback error. This includes all remaining reasons listed in the `Reason` enum as well as any other reasons unrelated to the smart contract execution.

```ts
enum Reason {
  EVAL_FALSE = 'Script evaluated without error but finished with a false/empty top stack element',
  VERIFY = 'Script failed an OP_VERIFY operation',
  EQUALVERIFY = 'Script failed an OP_EQUALVERIFY operation',
  CHECKMULTISIGVERIFY = 'Script failed an OP_CHECKMULTISIGVERIFY operation',
  CHECKSIGVERIFY = 'Script failed an OP_CHECKSIGVERIFY operation',
  CHECKDATASIGVERIFY = 'Script failed an OP_CHECKDATASIGVERIFY operation',
  NUMEQUALVERIFY = 'Script failed an OP_NUMEQUALVERIFY operation',
  SCRIPT_SIZE = 'Script is too big',
  PUSH_SIZE = 'Push value size limit exceeded',
  OP_COUNT = 'Operation limit exceeded',
  STACK_SIZE = 'Stack size limit exceeded',
  SIG_COUNT = 'Signature count negative or greater than pubkey count',
  PUBKEY_COUNT = 'Pubkey count negative or limit exceeded',
  INVALID_OPERAND_SIZE = 'Invalid operand size',
  INVALID_NUMBER_RANGE = 'Given operand is not a number within the valid range',
  IMPOSSIBLE_ENCODING = 'The requested encoding is impossible to satisfy',
  INVALID_SPLIT_RANGE = 'Invalid OP_SPLIT range',
  INVALID_BIT_COUNT = 'Invalid number of bit set in OP_CHECKMULTISIG',
  BAD_OPCODE = 'Opcode missing or not understood',
  DISABLED_OPCODE = 'Attempted to use a disabled opcode',
  INVALID_STACK_OPERATION = 'Operation not valid with the current stack size',
  INVALID_ALTSTACK_OPERATION = 'Operation not valid with the current altstack size',
  OP_RETURN = 'OP_RETURN was encountered',
  UNBALANCED_CONDITIONAL = 'Invalid OP_IF construction',
  DIV_BY_ZERO = 'Division by zero error',
  MOD_BY_ZERO = 'Modulo by zero error',
  INVALID_BITFIELD_SIZE = 'Bitfield of unexpected size error',
  INVALID_BIT_RANGE = 'Bitfield\'s bit out of the expected range',
  NEGATIVE_LOCKTIME = 'Negative locktime',
  UNSATISFIED_LOCKTIME = 'Locktime requirement not satisfied',
  SIG_HASHTYPE = 'Signature hash type missing or not understood',
  SIG_DER = 'Non-canonical DER signature',
  MINIMALDATA = 'Data push larger than necessary',
  SIG_PUSHONLY = 'Only push operators allowed in signature scripts',
  SIG_HIGH_S = 'Non-canonical signature: S value is unnecessarily high',
  MINIMALIF = 'OP_IF/NOTIF argument must be minimal',
  SIG_NULLFAIL = 'Signature must be zero for failed CHECK(MULTI)SIG operation',
  SIG_BADLENGTH = 'Signature cannot be 65 bytes in CHECKMULTISIG',
  SIG_NONSCHNORR = 'Only Schnorr signatures allowed in this operation',
  DISCOURAGE_UPGRADABLE_NOPS = 'NOPx reserved for soft-fork upgrades',
  PUBKEYTYPE = 'Public key is neither compressed or uncompressed',
  CLEANSTACK = 'Script did not clean its stack',
  NONCOMPRESSED_PUBKEY = 'Using non-compressed public key',
  ILLEGAL_FORKID = 'Illegal use of SIGHASH_FORKID',
  MUST_USE_FORKID = 'Signature must use SIGHASH_FORKID',
  UNKNOWN = 'unknown error',
}
```

[fetch-api]: https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API
[meep]: https://github.com/gcash/meep
[bip68]: https://github.com/bitcoin/bips/blob/master/bip-0068.mediawiki
[fex]: https://github.com/fex-cash/fex

[to()]: /docs/sdk/transactions#to
[withOpReturn()]: /docs/sdk/transactions#withopreturn
[from()]: /docs/sdk/transactions#from
[withFeePerByte()]: /docs/sdk/transactions#withfeeperbyte
[withHardcodedFee()]: /docs/sdk/transactions#withhardcodedfee
[withMinChange()]: /docs/sdk/transactions#withminchange
[withAge()]: /docs/sdk/transactions#withage
[withTime()]: /docs/sdk/transactions#withtime
[transactions-simple]: /docs/sdk/transactions

[send()]: /docs/sdk/transactions#send
[build()]: /docs/sdk/transactions#build
[meep()]: /docs/sdk/transactions#meep
