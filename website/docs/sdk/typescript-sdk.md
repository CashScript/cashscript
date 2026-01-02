---
title: TypeScript SDK
---

CashScript offers a TypeScript SDK, which makes it easy to build smart contract transactions, both in browser or on the server.
The CashScript SDK enables advanced debugging tooling for CashScript contracts, standardized network providers to get BCH blockchain information and a simple API for transaction building when using smart contracts.

The TypeScript SDK has [full TypeScript integration](#full-typescript-integration) with the CashScript smart contract language.
The full type-safety enables clear APIs which communicates info about the expected argument to each function and method.
This in turn speeds up development time and allows for higher code quality with better safety guarantees.

:::info
The SDK can also be used easily in vanilla JavaScript codebases, although the benefits of the type-safety will be lost.
:::

## When to use the SDK

The CashScript TypeScript SDK is designed to make it as easy as possible to create smart contract transactions for contracts written in CashScript (the smart contract language). So we highly recommend using the SDK when using CashScript to write your smart contracts.

If you are not using the CashScript contract language, you can still use the CashScript SDK for transaction building and BCH networking functionality! This can be especially useful if you are familiar with the CashScript classes and want manual control over the input and outputs in a transaction. The SDK makes it easy to spend from P2PKH inputs and send to different types of outputs, including OP_RETURN data outputs.

It's also possible the use the CashScript SDK for hand-optimized contract **not** written with the CashScript contract language, but this is considered [advanced usage](#advanced-non-cashscript-contracts).

## The 4 SDK Classes

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

There's two ways to go about this, either you create a custom `Artifact` so you can still use the `Contract` class or you create a custom `Unlocker` to use in the transaction building directly. These two methods for using hand optimized contract bytecode are discussed in the [optimization guide](/docs/guides/optimization#advanced-hand-optimizing-bytecode).
