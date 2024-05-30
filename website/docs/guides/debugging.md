---
title: Debugging
---

Debugging is no walk in the park, this is especially true for debugging complex smart contracts. Luckily there is a handful of startegies that can make it easier for developers to discover bugs with their contracts.

Generally there are 2 broad categories of smart contract bugs

- A bug in your invocation making the transaction invalid
- A bug in the smart contract which prohibits valid spending

Whatever category your bug falls into, the first step is discovering what line in your CashScript contract is making your transaction get rejected. Afterwards, investigation needs to start whether it's a contract bug, or a invocation bug.

## Simple Transaction Builder

The [Simple Transaction Builder](/docs/sdk/transactions) has deep integration with libauth to enable local transaction evaluation without actual interaction with the Bitcoin Cash network. This allows for advanced debugging functionality.

:::note
Currently the CashScript debugging tools only work with the [Simple Transaction Builder](/docs/sdk/transactions). We plan to extend the debugging tools to work with the [Advanced Transaction Builder](/docs/sdk/transactions-advanced) in the future.
:::

### Error messages

If a CashScript transaction is sent using any network provider and is rejected by the network (or the `MockNetworkProvider`), the transaction will be evaluated locally using libauth to provide failure reasons and debug information in addition to the failure reason communicated by the network.

Read the error message to see which line in the CashScript contract causes the transcation validation to fail. Investigate whether the contract function invocation is the issue (on the javascript SDK side) or whether the issue is in the CashScript contract itself (so you'd need to update your contract and recompile the artifact). If it is not clear **why** the CashScript contract is failing on that line, then you can use the following two strategies: console logging & Bitauth IDE stack trace.

### Console Logging

To help with debugging you can add `console.log` statements to your CashScript contract file to log variables. This way you investigate whether the variable have the expected values when they get to the failing `require` statement in the CashScript file. After adding the `console.log` statements, recompile your contract so they are added to your contract's Arifact. 

### Bitauth IDE

Whenever a transaction fails there will be a link in the console to open your smart contract trnasaction in the BitAuth IDE. This will allow you to inspect the transaction in detail, and see exactly why the transaction failed. In the BitAuth IDE you will see the raw BCH Script mapping to each line in your CashScript contract. Find the failing line and investigate the failing OpCode. You can break up the failing line, one opcode at a time to see how the stack evolves and ends with your `require` failure.

It's also possible to export the transaction for step-by-step debugging in the BitAuth IDE without failure. To do so, you can call the `bitauthUri()` function on the transaction. This will return a URI that can be opened in the BitAuth IDE.

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

When a transaction gets rejected by a full node it will return a cryptic error message, read the message carefully to investigate whether the issue is a failing script (failing OpCode) or whether a standarness rule like minimum-relay-fee is violated. If the cause is a failing OpCode, you can check the contract's Artifact to see how many appearances this OpCode has. Sometimes the OpCode only appears once or twice, indicating where the failing `require` statement is. Other times you might see 15 appearances of the OpCode leaving you to try the next strategies.

### Removing Contract Checks

If your contract fails, you can remove (or comment out) the lines that are the likely cause of the error. After recompiling to a new Artifact you can test whether the remaining subcontract works or fails with a different error. If this is the case then you learned that there is an issue in the removed CashScript code block. In the worst case when you have no indication from the failing opcode (previous strategy) then you will have to try remove different parts of your contract and trying different sub-contracts repeatedly. 

To use this strategy effectively, the contract setup with funding should be automated as to avoid having to send testnet coins manually to each different subcontract. However inefficient, this strategy should always be able to get you to find the failing line in your CashScript contract. Then you can investigate whether the issue is the contract invocation or the `require` statement in the CashScript file.

### Single Check Contract

If it is unclear whether the issue is the contract invocation or the `require` statement in the CashScript file, it might prove handy to create a 'single-check Contract' which has only the previously failing require statement. The goal then is to discover if your transaction is the issue and you are violating a correct contract requirement or whether the contract is enforcing an incorrect/impossible condition to hold in the spending transaction.
