---
title: Contract Infrastructure
---

When creating a smart contract application on Bitcoin Cash you'll need to investigate whether you need surrounding contract infrastructure.
Below we'll discuss the 2 types of contract infrastructure you might run into: the need to store contract details and the need for a transaction server.

## Storing Contract Details

Because of the `pay-to-scripthash` (`P2SH`) standard for smart contracts on BCH, the details of the script are hidden after creating a contract UTXO. This means you need to store the full contract script to ensure you can spend from your smart contract later.

:::caution
Smart contract developers need to consider whether their contracts require storing contract details unique to each user.
:::


For single instance contracts where there is only one smart contract address for a long-running contract, the full script information is available on-chain after the first contract interaction so doesn't require much extra thought.


When users are allowed to provide their own `constructor` arguments when creating a BCH smart contract, each contract creation will have a unique smart contract address. Because of this it becomes a requirement to store the unique contract details so this requires careful consideration!

Only the constructor arguments in the contract bytecode are variable, the rest of the bytecode for a contract is static. So the constructor arguments for user contracts are essential to store in a secure way.
Also the static part of the contract needs to be stored but this is the same across the different contract instances so is not unique for each user.

:::note
To construct the full contract script you need both the `constructor` arguments and static contract bytecode (either the contract source file or the `Artifact`) to be available.
:::

### Off-chain storage

To store the contract details off-chain, you will need to run a database server which stores the specific constructor arguments for each contract, this will translate into their respective smart contract addresses. This is crucial data for users to spend from BCH locked in such a smart contract. So this approach does introduce a single point of failure.

:::caution
When using off-chain storage, it is the crucial responsibility of smart contract service to keep track of the contract details making up the `P2SH` contract, as user-wallets currently aren't capable to keep track of contract details and are fully reliant on the app server to store this critical info.
:::

### On-chain storage

To avoid introducing a single point of failure, different applications like Tapswap and Cauldron have started posting the `constructor` arguments with a contract-identifier to an `OP_RETURN` output during the contract creation. This way the contract details are available on-chain in a decentralized and recoverable way.

:::tip
To store contract details on-chain, start the `OP_RETURN` data with an easily recognizable identifier, this way you can find all your smart contract UTXOs by checking the transactions including that identifier in the `OP_RETURN`.
:::

:::note
The `OP_RETURN` data has a maximum standardness size of 220 bytes which might be limiting for contracts with many large `constructor` arguments. You can read more about the [BCH transaction limits here](/docs/compiler/script-limits).
:::

## Transaction server

When your smart contracts depend on "automatic settlement" or any events where transactions are invoked without the user being involved, you will need a transaction server to create and broadcast those transactions. Smart contracts on BCH are never self-executing, someone is always needed to invoke functionality on a smart contract by creating a transaction.

There are 3 main types of events which might need a transaction server to trigger a smart contract transaction: time-related events, contract-related events and oracle-related events.

### Time-related events

Time-related events are when your smart contract uses absolute or relative locktimes, which require a waiting period before certain transactions can happen. However, if you want those transactions to 'automatically' happen when this locktime is reached, then you will need to create a transaction server to monitor the block height on an ongoing basis.

:::tip
Both the `Electrum` and `Chaingraph` indexers allow you to create websocket subscriptions to listen for block height updates.
:::

### Contract-related events

Contract-related events are when you want to update the server state to reflect changes on-chain, for example new contracts being created or existing contracts changing their state in an important way. So contract related events often don't trigger an on-chain transaction directly, but they update the information about the contracts tracked for time/oracle events by the server.

:::tip
With `Electrum` you can create subscriptions to transactions for a specific (contract) address, with `Chaingraph` you can create subscriptions to arbitrary on-chain events.
:::

### Oracle-related events

Oracle-related events are when your smart contract uses an oracle to listen for outside information, where some transactions can only happen if the oracle publishes certain information. However, if you want those transactions to 'automatically' happen when the oracle triggers this condition, then you will need to create a transaction server to monitor the oracle for triggers on an ongoing basis.
