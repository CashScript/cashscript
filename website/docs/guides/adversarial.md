---
title: Adversarial Analysis
sidebar_label: Adversarial Analysis
---

In this guide we'll focus on "adversarial analysis" of your smart contract system. Adversarial analysis means to analyze your system from the point of a potential malicious 3rd party which might want to hamper or attack your system.

## Mempool and Block-Inclusion

Bitcoin Cash has a blocktime of 10 minutes, meaning that on average every 10 minutes a new block is found which adds a collection of transactions to the ledger. Before transactions are included in a block they are waiting for inclusing in the mempool of the full nodes.

Miners can choose which transactions to include in their block. Some miners might set a higher minimum fee or mine empty blocks so transactions can remain pending in the mempool even though a new block was mined.

:::tip
In Bitcoin Cash it is standard for transactions to be included in very next mined block. Because there is no network congestion, 
the mempool can get cleared with the arrivial of a new block.
:::

Because transactions in the mempool are "seen" but not included in the blockchain yet, the latest state of the blockchain of who owns what is somewhat fuzzy. In some sense only the transaction with 6 confirmations are truly finalized but on the other hand in the normal scenario it's only a matter of time before transactions in the mempool get included in blocks and are 6 blocks deep in the blockchain.

Where things get more complex however is if there are **competing unconfirmed transactions**. In this scenario it is **not** necessarily the case that a transaction is destined to be included in the blockchain. In other words, the latest state of the blockchain is still undecided.

:::note
This is why many BCH indexers will allow you to query UTXOs with the option to include or exclude unconfirmed transactions.
:::

## Unconfirmed Transaction Chains

Unconfirmed transactions can be chained after one another meaning that even an output of an unconfirmed transaction can already be spent in a new transaction. This means you can have competing unconfirmed transaction **chains** where child transactions are chained to an unconfirmed parent. Any competing transaction for one of the parent tranactions then presents a cancellation of the whole chain of dependent child transactions.

There is no maximum to the length of an unconfirmed transaction chain on BCH, software of full nodes has been upgraded to allow for arbitrary length unconfirmed tx chains. This is very important for public covenants which might have many users interacting and transacting with the same smart contract UTXO.

:::tip
On Bitcoin Cash it is possible to design smart contract systems which utilize long unconfirmed transaction chain, avoiding the need for blockchain confirmations. However contract developers should keep in front of mind that a competing transaction chain can in effect "cancel" pending unconfirmed transactions.
:::

## First-Seen Rule

The "first-seen rule" is a a default mempool inclusion and relay rule for full nodes which says that for any UTXO the first seen spending transaction is the one that gets included in the node's mempool and relayed. Because the first-seen rule is subjective based on time, different part of the network might enforce this rule for conflicting transactions in case of a race condition.

:::note
In case of normal a P2PKH trasnaction this time window for race conditions is the risk window where it's beneficial to listen for double spends with [double-spend-proofs (DSPs)](https://docs.bitcoincashnode.org/doc/dsproof-implementation-notes/).
:::

Importantly, the "first-seen rule" is just a default and a network relay rule, advanced actors might send double-spend transactions with a sigificantly higher fee (bribe) to miners directly. Custom configured miners who actively maximize transaction fee revenue would accept the bribe transaction and switch off the "first-seen rule" altogether. However the majority of the Bitcoin Cash network will not relay such late double spend attempts in accordance with the first-seen rule.

:::caution
On BTC the node default got changed to replace-by-fee, and tooling to submit your non-standard transaction directly to mining pools has become common place with oridinals.
:::

