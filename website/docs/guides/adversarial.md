---
title: Adversarial Analysis
sidebar_label: Adversarial Analysis
---

In this guide we'll focus on "adversarial analysis" of your smart contract system. Adversarial analysis means to analyze your system from the point of a potential malicious 3rd party which might want to hamper or attack your system.

## Mempool and Block-Inclusion

Bitcoin Cash has a blocktime of 10 minutes, meaning that on average every 10 minutes a new block is found which adds a collection of transactions to the ledger. Before transactions are included in a block they are waiting for inclusing in the mempool of the full nodes.

Miners can choose which transactions to include in their block. Some miners might set a higher minimum fee or mine empty blocks so transactions can remain pending in the mempool even though a new block was mined.

:::note
In Bitcoin Cash it is standard for transactions to be included in very next mined block. Because there is no network congestion, 
the mempool can get cleared with the arrivial of a new block.
:::

Because transactions in the mempool are "seen" but not included in the blockchain yet, the latest state of the blockchain of who owns what is somewhat fuzzy. In some sense only the transaction with 6 confirmations are truly finalized but on the other hand in the normal scenario it's only a matter of time before transactions in the mempool get included in blocks and are 6 blocks deep in the blockchain.

Where things get more complex however is if there are **competing unconfirmed transactions**. In this scenario it is **not** necessarily the case that a transaction is destined to be included in the blockchain. In other words, the latest state of the blockchain is still undecided.

:::tip
This is why many BCH indexers will allow you to query UTXOs with the option to include or exclude unconfirmed transactions. By default indexers will include unconfirmed UTXOs/unconfirmed transactions in the query result.
:::

## Unconfirmed Transaction Chains

Unconfirmed transactions can be chained after one another meaning that even an output of an unconfirmed transaction can already be spent in a new transaction. This means you can have competing unconfirmed transaction **chains** where child transactions are chained to an unconfirmed parent. Any competing transaction for one of the parent tranactions then presents a cancellation of the whole chain of dependent child transactions.

There is no maximum to the length of an unconfirmed transaction chain on BCH, software of full nodes has been upgraded to allow for arbitrary length unconfirmed tx chains. This is very important for public covenants which might have many users interacting and transacting with the same smart contract UTXO.

:::tip
On Bitcoin Cash it is possible to design smart contract systems which utilize long unconfirmed transaction chain, avoiding the need for blockchain confirmations. However contract developers should be mindful of the possibility of competing transaction chains.
:::

## Competing Transactions

When there are competing transactions (double spends) being propagated on the network, only one of the conflicting transactions can be included, the other transactions will in effect be cancelled. In the case of an unconfirmed transaction chain, any competing transaction for one of the tranactions in this newly formed chain then presents a cancellation of all child transactions dependent on this parent transaction with a conflict.

:::note
Unlike on Ethereum, on Bitcoin Cash you can never have a transaction which has to pay fees but does not get included in the blockchain. Either it gets included and the fee is paid, or it's like it never happened.
:::

In open contract systems competing transactions can happen organically and by accident, when 2 different users who might be on different sides of the world, interact with your on-chain system at roughly the same time. This situation can be called "UTXO contention" because 2 users simultaneously try to spend the same anyone-can-spend covenant.

However, it is also possible double-spends are created intentioanlly. For example in the case of a DEX naively updating its price state, a rational economic actors might be incentivized to ignore the latest unconfirmed transaction chain and to **intentially** create a competing unconfirmed transaction chain. This way they can interact with the smart contract at an earlier (more advantageous) price.

:::caution
Smart contract developers developing applications at scale should consider the game-theorethic interaction of advanced, rational economic actors who might benefit from competing against intead of cooparating on building a transaction chain.
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

## Miner-Extractable-Value (MEV)

Miner-Extractable-Value (MEV) refers to the value (either in dollars or in BCH) which miners can "extract" by having the ability to decide transaction inclusion and the ability to prioritize or insert their own transactions in their new block.

MEV works quite differently on a UTXO-model blockchain than on an account-based chain. So even if you are very familiar with the MEV meechanisms on Ethereum it will still be helpful to consider how they do - or do not - apply to Bitcoin Cash.

:::note
On Ethereum they changed the acronym to mean "Maximum-Extractable-Value" because ETH is now a proof-of-stake system and does not have miners. The modified concept still applies to the ETH block producers.
:::

The reason why block producers are better positioned than other economic actors such as on-chain traders or arbitrageurs is that they can priorize their own transactions even if conflicting transactions exist in the mempool.

### Abandoning First-Seen

As should be clear from the explenation higher up, the "first-seen rule" is just a convention and a way to play nice, however it is not per se economically maximizing. If we see more "bribe" double spends then we can expect over times that some miners will deflect from the covention and use custom transaction selection software to extract MEV from bribe transactions.

### Bounty for Transaction Building

A 1st source of potential MEV on Bitcoin Cash comes from smart contract systems which have a "bounty for transaction building" mechanism. Miners can automate the transaction building or possibly even modify an existing tansaction to claim the bounties for such a system.

### Profitable DEX trades

If DEXes don't cleverly aggregate their prices, then miners may be incentived to strategically create a competing transaction chain which takes advange of an older price state/ratio which has not yet been confirmed in the blockchain.

### Not possible on UTXO

What is not possible to do on UTXO chains is a "sandwich" strategy where a miner would insert a transaction in the middle of a valid transaction chain. In UTXO each transaction explicitly consumes inputs of a previous transaction and creates outputs. Because of this it is not possible to "insert" a transaction in the middle of an unconfirmed chain and thus sandwich strategies are not possible. 
