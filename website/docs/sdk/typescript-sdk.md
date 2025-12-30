---
title: TypeScript SDK
---

CashScript offers a TypeScript SDK, which makes it easy to build smart contract transactions, both in browser or on the server. By offering full type-safety, developers can be confident in the quality and reliability of their applications. The SDK can also be used easily in vanilla JavaScript codebases, although the benefits of the type-safety will be lost.

:::info
Because of the separation of the compiler and the SDK, CashScript contracts can be integrated into other programming languages in the future.
:::

## SDK Classes

The CashScript SDK consists of 4 classes, together they form one cohesive structure to build BCH smart contract applications.
The documentation also follows the structure of these 4 classes:

- the `Contract` class
- the `TransactionBuilder` class
- the `NetworkProvider` class
- the `SignatureTemplate` class

## SDK usage

The usage of the 4 classes in your code is as follows: before using the SDK you create one or multiple contract artifacts compiled by `cashc`. Then to start using the SDK, you instantiate a `NetworkProvider`, which you then provide to instantiate a `Contract` from an `Artifact`. Once you have a `Contract` instance, you can use it in the `TransactionBuilder`. During transaction building you might need to generate a signature, in which case you would instantiate a `SignatureTemplate`.

For an more complete example of the SDK flow, refer to the [SDK Example](./examples.md).

#### example

```ts
import { Contract, ElectrumNetworkProvider, TransactionBuilder, SignatureTemplate } from 'cashscript';
import { P2pkhArtifact } from './artifact';
import { contractArguments, aliceWif } from './somewhere';

const provider = new ElectrumNetworkProvider('chipnet');

const contract = new Contract(P2pkhArtifact, contractArguments, { provider });

const aliceSignatureTemplate = new SignatureTemplate(aliceWif);
const unlocker = contract.unlock.transfer(aliceSignatureTemplate)

const transactionBuilder = new TransactionBuilder({ provider });

// then use the transactionBuilder to actually spend a UTXO with the contract unlocker
```

## Full TypeScript Integration

The constructor of the `Contract` class takes in an `Artifact`, this is the output of the `cashc` compiler and can be configured to either output a JSON or TS file. To have the best TypeScript integration, we recommend generating the artifact in the `.ts` format and importing it into your TypeScript project from that `.ts` file. The type benefits are explained in more details in the documentation for the [Contract](./instantiation#constructor) class.

## Advanced: non-CashScript Contracts

You can also use the CashScript SDK without relying on the CashScript contract language and compiler. This way you can still leverage the a lot of the tooling while having full control over the raw BCH script so this can be hand-written or hand-optimized. 

There's two ways to go about this, either you create a custom `Artifact` so you can still use the `Contract` class or you create a custom `Unlocker` to use in the transaction building directly.

### Custom Artifacts

You can create an Artifact for a fully hand-written contract so it becomes possible to use the contract with the nice features of the CashScript SDK! An example of this is [Cauldron_Swap_Test](https://github.com/mr-zwets/Cauldron_Swap_Test) which uses `Artifact bytecode` not produced by `cashc` at all but still uses the CashScript SDK.

### Custom Unlockers

In the [addInput() method](./transaction-builder#addInput()) on the TransactionBuilder you can provide a custom `Unlocker`

```ts
transactionBuilder.addInput(utxo: Utxo, unlocker: Unlocker, options?: InputOptions): this
```

the `Unlocker` interface is the following:

```ts
interface Unlocker {
  generateLockingBytecode: () => Uint8Array;
  generateUnlockingBytecode: (options: GenerateUnlockingBytecodeOptions) => Uint8Array;
}

interface GenerateUnlockingBytecodeOptions {
  transaction: Transaction;
  sourceOutputs: LibauthOutput[];
  inputIndex: number;
}
```
