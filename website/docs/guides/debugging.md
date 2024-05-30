---
title: Debugging
---

Debugging is no walk in the park, this is especially true for debugging complex smart contracts. Luckily there is a handful of startegies that can make it easier for developers to discover bugs with their contracts.

Generally there are 2 broad categories of smart contract bugs

- A bug in the smart contract which doesn't allow for valid spending
- A bug in your invokation making the transaction invalid.

## Simple Transaction Builder

The [Simple Transaction Builder](/docs/sdk/transactions) has deep integration with libauth to enable local transaction evaluation without actual interaction with the Bitcoin Cash network. This allows for advanced debugging functionality.

:::note
Currently the CashScript debugging tools only work with the [Simple Transaction Builder](/docs/sdk/transactions). We plan to extend the debugging tools to work with the [Advanced Transaction Builder](/docs/sdk/transactions-advanced) in the future.
:::


### Error messages

If a CashScript transaction is sent using any network provider and is rejected by the network (or the `MockNetworkProvider`), the transaction will be evaluated locally using libauth to provide failure reasons and debug information in addition to the failure reason communicated by the network.

### Console Logging

### Bitauth IDE

It is possible to export the transaction for step-by-step debugging in the BitAuth IDE. This will allow you to inspect the transaction in detail, and see exactly why the transaction failed. To do so, you can call the `bitauthUri()` function on the transaction. This will return a URI that can be opened in the BitAuth IDE. This URI is also displayed in the console whenever a transaction fails.

```ts
const transaction = contract.functions.exampleFunction(0n).to(contract.address, 10000n);
const uri = await transaction.bitauthUri();
```

:::caution
It is unsafe to debug transactions on mainnet as private keys will be exposed to BitAuth IDE and transmitted over the network.
:::

## Advanced Transaction Builder

Because the advanced transaction builder does not yet support the advanced debugging tooling, you are left with just a few strategies.

### Failing Opcode

### Removing Contract Checks

### Single Check Contract

