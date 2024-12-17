---
title: Contract Infrastructure
---

When creating a smart contract application on Bitcoin Cash you'll need to investigate whether you need surrounding contract infrastructure.
Below we'll discuss the 2 main types of contract infrastructure you might run into: the need to store contract details and the need for a transaction server.

## Storing Contract Details

Because of the `pay-to-scripthash` (`P2SH`) standard for smart contracts on BCH, the details of the script are hidden after creating a contract UTXO. This means you need to store the full contract script to ensure you can spend from your smart contract later.

:::caution
It is the responsibility of smart contract services/apps to keep track of the contract details making up the `P2SH` contract, as user-wallets are currently not smart enough to do this automatically.
:::

When users are allowed to provide their own `constructor` arguments when creating a BCH smart contract, each contract creation will have a unique smart contract address. Only the constructor arguments in the contract bytecode are variable, the rest of the bytecode for a contract is static. This static part is derived from the CashScript source file, so storing the contract source file or artifact both has the same effect.

:::note
To construct the full contract script you need both the `constructor` arguments and static contract bytecode (either the contract source file or the `Artifact`) to be available.
:::


### Off-chain storage

To store the contract details off-chain, you will need to run a database server which stores the specific constructor arguments for each contract, this will translate into their respective smart contract addresses. Additionally, you should ensure that the CashScript source file or the contract artifact (which contains the static bytecode) is also stored for future reference.

### On-chain storage

Different applications like Tapswap and Cauldron have also started posting the `constructor` arguments with a contract-identifier to an `OP_RETURN` output during the contract creation. This way the contract details are available on-chain in a decentralized and recoverable way.

:::tip
To store contract details on-chain, start the `OP_RETURN` data with an easily recognizable identifier, this way you can find all your smart contract UTXOs by checking the transactions including that identifier in the `OP_RETURN`.
:::

## Transaction server

When your smart contracts depend on "automatic settlement" or any events where transactions are invoked without the user being involved, you will need a transaction server to create and broadcast those transactions. Smart contracts on BCH are never self-executing, someone is always needed to invoke functionality on a smart contract by creating a transaction.

There are 2 main types of events which might need a transaction server to trigger a smart contract transaction, namely time-related events and oracle-related events.

### Time-related events

Time-related events are when your smart contract uses absolute or relative locktimes, which require a waiting period before certain transactions can happen. However, if you want those transactions to 'automatically' happen when this locktime is reached, then you will need to create a transaction server to monitor the block height on an ongoing basis.

:::tip
Both the `Electrum` and `Chaingraph` indexers allow you to create websocket subscriptions to listen for block height updates.
:::

### Oracle-related events

Oracle-related events are when your smart contract uses an oracle to listen for outside information, where some transactions can only happen if the oracle publishes certain information. However, if you want those transactions to 'automatically' happen when the oracle triggers this condition, then you will need to create a transaction server to monitor the oracle for triggers on an ongoing basis.
