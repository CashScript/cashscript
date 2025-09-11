---
title: Adversarial Analysis
sidebar_label: Adversarial Analysis
---

In this guide we'll dive into "adversarial analysis" for smart contract systems. Adversarial analysis means to analyze your system from the point of a potential malicious 3rd party which might want to hamper or attack your system. This guide will build further on knowledge from the [the transaction lifecycle guide](/docs/guides/lifecycle).

## The Happy Case

As long as all Bitcoin Cash miners follow the first-seen rule then you can count on the idea that competing transaction chains can only occur due to accidental race conditions caused by simultaneous users. In the case of an attempted double spend, full nodes on the BCH network won't relay the transaction, and even if the transaction reaches the mempool of a miner, they would discard the transaction because of the first seen rule.

:::tip
The "happy case" scenario is currently the standard lifecycle for transactions on the Bitcoin Cash network, also for DeFi transactions interacting with on-chain DEXes.
:::

## Miner Bribes

Besides accidental race condition caused by simultaneous users, there can also be intentional double spends by adversarial actors.
In this case the adversarial attacker needs to convince the miners to abandon their first seen rule and to instead include the intentional double spend in their block.

To convince the miners to include the double spend transaction instead of the original, the malicious attacker will include a significantly higher mining fee than the original transaction. This can be seen as a 'miner bribe' being paid to discard the first-seen rule and to accept the double spend instead of the original.

:::note
Intentional double spends don't require a race condition, instead they only require that the original transaction is still in the mempool and that the double spend transaction reaches the mempool of miners/mining pools.
:::

We will now consider what motive the adversarial actor might have to perform these bribes. The two classes of motives are either the profit motive for an economically motivated actor or causing on-chain disruption for a maliciously motivated actor.

### Extracting value from old state

If DEXes don't cleverly aggregate their prices across blocks, then it can be economical for adversarial actors to instead of building on the latest transaction in the unconfirmed transaction chain of a smart contract, to instead create a competing transaction chain building on an older state. By strategically creating a competing transaction chain they might be able to take advantage of an older price state/ratio which has not yet been confirmed in the blockchain.

Because having a more advantageous (older) price state or ratio might be very profitable, it is worth it for the adversarial actor to pay the high fee "miner bribe" to attempt this double spend transaction.

:::note
Attempting a double spend in this way does not incur risk to the adversarial party, either their transaction is not included and they don't pay any fee, or they successfully perform the double spend and they pay the high fee "miner bribe".
:::

### Griefing users

When a late double-spend does make it into a block instead of the first seen relayed transaction, the original transactions will in effect be cancelled. In the case of an unconfirmed transaction chain, any competing transaction for one of the the chained unconfirmed transactions then presents a cancellation of the whole chain of dependent child transactions.

:::caution
This means that in adversarial environments user created transactions on public covenants are not certain to be confirmed so waiting for block confirmations is required to be sure the transaction isn't cancelled in this way.
:::

## Miner-Extractable-Value (MEV)

Miner-Extractable-Value (MEV) refers to the value (either in dollars or in BCH) which miners can "extract" by having the ability to decide transaction inclusion and the ability to prioritize or insert their own transactions in their new block.

:::note
On Ethereum the acronym was changed to mean "Maximum-Extractable-Value" because ETH is now a proof-of-stake system and does not have miners. The modified concept still applies to the ETH block producers.
:::

### MEV Differences from ETH

MEV works quite differently on a UTXO-model blockchain than on an account-based chain. So even if you are very familiar with the MEV mechanisms on Ethereum it will still be helpful to consider how they do - or do not - apply to Bitcoin Cash.

What is not possible to do on UTXO chains is a "sandwich" strategy where a miner would insert a transaction in the middle of a valid transaction chain. In UTXO each transaction explicitly consumes inputs of a previous transaction and creates outputs. Because of this it is not possible to "insert" a transaction in the middle of an unconfirmed chain and thus sandwich strategies are not possible.

### The Power of Block Construction

The reason why block producers are better positioned than other economic actors such as on-chain traders or arbitrageurs is that they can prioritize their own transactions even if conflicting transactions exist in the mempool.

Other actors can construct double spend transactions will face great difficulty in getting their transaction to propagate and they have to pay high mining fees to bribe miners to accept the double spend over the original transaction.

## Expected Evolution of MEV

Below we will extend the adversarial analysis by extrapolating the evolution of MEV on Bitcoin cash based on the example of more mature DeFi ecosystems like Ethereum.

:::tip
As mentioned at the start, the "happy case" scenario is currently the standard lifecycle for transactions on BCH. The analysis below is speculatively extrapolating how this could evolve in a mature DeFi ecosystem.
:::

### Abandoning First-Seen

As should be clear from the explanation higher up, the "first-seen rule" is just a convention and a way to play nice, however it is not per se economically maximizing. If we see more "bribe" double spends then we can expect over times that some miners will deflect from the convention and use custom transaction selection software to extract MEV from bribe transactions.

Over time we can expect miners not just to prefer bribes when available but to actively build transactions to extract from or create value for DeFi protocols.

### Miners Extracting Value

As we mentioned before, if DEXes don't cleverly aggregate their prices, then miners may be incentivized to strategically create a competing transaction chain which takes advantage of an older price state/ratio which has not yet been confirmed in the blockchain.

Although miners are not specialists in the optimal construction of DeFi transactions in a block, miner would over time be likely to team up with teams/companies creating this type of software for them. We've already seen the emergence of a specialized 'block constructor' class for Ethereum.

### Miners Providing Value

A potential way in which miner transaction building can be seen as providing value is in the case of covenants using a 'Bounty for Transaction Building'. Here the value comes not from "extraction" but from smart contract with a mechanism paying a bounty for creating the transactions necessary for the operation of the contract system.
