---
title: Transaction Builder
---

The CashScript Transaction Builder generalizes transaction building to allow for complex transactions combining multiple different smart contracts within a single transaction or to create basic P2PKH transactions. The Transaction Builder works by adding inputs and outputs to fully specify the transaction shape.

:::info
Defining the inputs and outputs requires careful consideration because the difference in Bitcoin Cash value between in- and outputs is what's paid in transaction fees to the miners.
:::

## Instantiating a transaction builder
```ts
new TransactionBuilder(options: TransactionBuilderOptions)
```

To start, you need to instantiate a transaction builder and pass in a `NetworkProvider` instance and other options.

```ts
interface TransactionBuilderOptions {
  provider: NetworkProvider;
  maximumFeeSatoshis?: bigint;
  maximumFeeSatsPerByte?: number;
  allowImplicitFungibleTokenBurn?: boolean;
}
```

#### Example
```ts
import { ElectrumNetworkProvider, TransactionBuilder, Network } from 'cashscript';

const provider = new ElectrumNetworkProvider(Network.MAINNET);
const transactionBuilder = new TransactionBuilder({ provider });
```

### Constructor Options

#### provider

The `provider` option is used to specify the network provider to use when sending the transaction.

#### maximumFeeSatoshis

The `maximumFeeSatoshis` option is used to specify the maximum fee for the transaction in satoshis. If this fee is exceeded, an error will be thrown when building the transaction.

#### maximumFeeSatsPerByte

The `maximumFeeSatsPerByte` option is used to specify the maximum fee per byte for the transaction. If this fee is exceeded, an error will be thrown when building the transaction.

#### allowImplicitFungibleTokenBurn

The `allowImplicitFungibleTokenBurn` option is used to specify whether implicit burning of fungible tokens is allowed (default: `false`). If this is set to `true`, the transaction builder will not throw an error when burning fungible tokens.

## Transaction Building

### addInput()
```ts
transactionBuilder.addInput(utxo: Utxo, unlocker: Unlocker, options?: InputOptions): this
```

Adds a single input UTXO to the transaction that can be unlocked using the provided unlocker. The unlocker can be derived from a `SignatureTemplate` or a `Contract` instance's spending functions. The `InputOptions` object can be used to specify the sequence number of the input. The default sequence number is `0xfffffffe` (non-final sequence number).

:::note
It is possible to create custom unlockers by implementing the `Unlocker` interface. Most use cases however are covered by the `SignatureTemplate` and `Contract` classes.
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

Adds a list of input UTXOs, either with a single shared unlocker or with individual unlockers for each UTXO. The `InputOptions` object can be used to specify the sequence number of the inputs. The default sequence number is `0xfffffffe` (non-final sequence number).

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

Adds a single output or a list of outputs to the transaction. The `to` field in an output can be a string representing a cash address, or a `Uint8Array` representing a locking bytecode. For `P2PKH`, `P2SH20` and `P2SH32` outputs, it is easiest to use the cash address string. For `P2S` outputs, you need to use the locking bytecode.

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

### addBchChangeOutputIfNeeded()
```ts
transactionBuilder.addBchChangeOutputIfNeeded(changeOutputOptions: BchChangeOutputOptions): this
```

Adds a change output to the transaction if the transaction has enough funds to cover the transaction fee rate. The `changeOutputOptions` object can be used to specify the fee rate for the change output. Note that this is only for BCH change. Use `addTokenChangeOutputIfNeeded()` to add a fungible token change output.

After a BCH change output has been added, no more inputs or outputs can be added to the transaction. This is enforced by the SDK to prevent accidentally invalidating the change calculation.

```ts
interface BchChangeOutputOptions {
  to: string | Uint8Array;
  feeRate: number;
}
```

### addTokenChangeOutputIfNeeded()
```ts
transactionBuilder.addTokenChangeOutputIfNeeded(changeOutputOptions: TokenChangeOutputOptions): this
```

For the configured fungible token category, adds a single change output to the configured token address. The change output is given the dust-minimum BCH amount, so this method should be called before `addBchChangeOutputIfNeeded()`. NFT inputs are not handled by this method; if you need to keep an NFT, add an explicit output for it.

After a token change output for a category has been added, no more inputs or outputs with that token category can be added to the transaction. This is enforced by the SDK to prevent accidentally invalidating the change calculation.

```ts
interface TokenChangeOutputOptions {
  category: string;
  to: string | Uint8Array;
}
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

### getTransactionSize()
```ts
transactionBuilder.getTransactionSize(): bigint
```

Returns the size of the transaction in bytes.

#### Example
```ts
const transactionSize = transactionBuilder.getTransactionSize();
console.log(`Transaction size: ${transactionSize} bytes`);
```

## Completing the Transaction
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
const maximumFeeSatoshis = 1000n;

const txDetails = await new TransactionBuilder({ provider, maximumFeeSatoshis })
  .addInput(contractUtxos[0], contract.unlock.spend(aliceTemplate, 1000n))
  .addInput(aliceUtxos[0], aliceTemplate.unlockP2PKH())
  .addOutput({ to: bobAddress, amount: 100_000n })
  .addOpReturnOutput(['0x6d02', 'Hello World!'])
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
const maximumFeeSatoshis = 1000n;

const txHex = new TransactionBuilder({ provider, maximumFeeSatoshis })
  .addInput(contractUtxos[0], contract.unlock.spend(aliceTemplate, 1000n))
  .addInput(aliceUtxos[0], aliceTemplate.unlockP2PKH())
  .addOutput({ to: bobAddress, amount: 100_000n })
  .addOpReturnOutput(['0x6d02', 'Hello World!'])
  .build()
```

### debug()
```ts
transactionBuilder.debug(): DebugResult
```

If you want to debug a transaction locally instead of sending it to the network, you can call the `debug()` function on the transaction. This will return intermediate values and the final result of the transaction. It will also show any logged values and `require` error messages.

### getBitauthUri()
```ts
transactionBuilder.getBitauthUri(): string
```

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

### generateWcTransactionObject()
```ts
transactionBuilder.generateWcTransactionObject(options?: WcTransactionOptions): WcTransactionObject
```

Generates a `WcTransactionObject` that can be used to sign a transaction with a WalletConnect client. It accepts an optional `WcTransactionOptions` object to customize the transaction object with custom `broadcast` and `userPrompt` properties.

```ts
import type { TransactionCommon, Input, Output } from '@bitauth/libauth';
import type { AbiFunction, Artifact } from 'cashscript';

interface WcTransactionOptions {
  broadcast?: boolean;
  userPrompt?: string;
}

interface WcTransactionObject {
  transaction: TransactionCommon | string;
  sourceOutputs: WcSourceOutput[];
  broadcast?: boolean;
  userPrompt?: string;
}

type WcSourceOutput = Input & Output & WcContractInfo;

interface WcContractInfo {
  contract?: {
    abiFunction: AbiFunction;
    redeemScript: Uint8Array;
    artifact: Partial<Artifact>;
  }
}
```

:::tip
See the [WalletConnect guide](/docs/guides/walletconnect) for more information on how to use the `WcTransactionObject` with a WalletConnect client.
:::

#### Example
```ts
import { aliceAddress, contract, provider, signWcTransaction } from './somewhere.js';
import { TransactionBuilder, placeholderP2PKHUnlocker, placeholderPublicKey, placeholderSignature } from 'cashscript';

const contractUtxos = await contract.getUtxos();
const aliceUtxos = await provider.getUtxos(aliceAddress);

// Use placeholder variables which will be replaced by the user's wallet when signing the transaction with WalletConnect
const placeholderUnlocker = placeholderP2PKHUnlocker(aliceAddress);
const placeholderPubKey = placeholderPublicKey();
const placeholderSig = placeholderSignature();

// use the CashScript SDK to construct a transaction
const transactionBuilder = new TransactionBuilder({ provider })
  .addInput(contractUtxos[0], contract.unlock.spend(placeholderPubKey, placeholderSig))
  .addInput(aliceUtxos[0], placeholderUnlocker)
  .addOutput({ to: aliceAddress, amount: 100_000n });

// Generate WalletConnect transaction object with custom 'broadcast' and 'userPrompt' options
const wcTransactionObj = transactionBuilder.generateWcTransactionObject({
  broadcast: true,
  userPrompt: "Example Contract transaction",
});

// Pass wcTransactionObj to WalletConnect client (see WalletConnect guide for more details)
const signResult = await signWcTransaction(wcTransactionObj);
```

### generateWizardConnectTransactionObject()
```ts
transactionBuilder.generateWizardConnectTransactionObject(options?: WcTransactionOptions): WizardConnectTransactionObject
```

Generates a `WizardConnectTransactionObject` that can be used to sign a transaction with a WizardConnect client. It accepts the same optional `WcTransactionOptions` object as `generateWcTransactionObject()`.

WizardConnect uses the normal BCH WalletConnect transaction object plus HD path metadata for each placeholder P2PKH input.

```ts
interface WizardConnectTransactionObject {
  transaction: WcTransactionObject;
  inputPaths: WizardConnectInputPath[];
}

type WizardConnectInputPath = [inputIndex: number, pathName: string, addressIndex: number];
```

To generate `inputPaths`, pass HD metadata to `placeholderP2PKHUnlocker()` when adding user inputs.

#### Example
```ts
import { provider, signWizardTransaction } from './somewhere.js';
import { TransactionBuilder, placeholderP2PKHUnlocker } from 'cashscript';

const transactionBuilder = new TransactionBuilder({ provider })
  .addInput(userUtxo, placeholderP2PKHUnlocker(userAddress, {
    hdPath: { name: 'receive', addressIndex: 5 },
  }))
  .addOutput({ to: recipientAddress, amount: 100_000n });

const wizardTransactionObj = transactionBuilder.generateWizardConnectTransactionObject({
  broadcast: false,
  userPrompt: 'Example WizardConnect transaction',
});

const signResult = await signWizardTransaction(wizardTransactionObj);
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

[bitcoin-wiki-timelocks]: https://en.bitcoin.it/wiki/Timelock
