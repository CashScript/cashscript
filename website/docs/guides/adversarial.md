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

## The Adversarial Case

The adversarial case is where 3rd parties intentionally double spend unconfirmed transactions in the contract system with the goal to extract value or to disrupt the experience for normal users.

:::caution
In an adversarial environment where double spends occur, user-created transactions interacting with public are not certain to be confirmed. This means waiting for block confirmations is required to be sure the transaction isn't cancelled.
:::

There is 2 categories to consider for adversarial double spends:

1) Race-condition double spends (no miner help required)

2) Late double spends (miner help required)

### Race-condition Double Spends

The first scenario of race-condition double spends do not benefit the adversarial 3rd party, instead the goal would just be griefing: to disrupt the flow for normal users. The double spend can cause the user-transaction to be cancelled even though from the user point-of-view it already looked like the transaction went through and achieved its goal.

:::note
For an adversarial attack to pull off this time-sensitive attack, he would require extensive monitoring on the p2p network and quickly be able to generate and broadcast competing double spend transactions.
:::

### Late Double Spends

In the case of a late double spend (which does not try to exploit a race condition) the adversarial actor need help from a miner.
Either the adversarial actor needs to convince the miners to abandon their first seen rule or he needs to be mining himself to be able to construct his own block.

:::caution
Both race-condition and late double spends can be used to grief the experience for normal users, however only late double spends can be used to extract economic value.
:::

To convince existing miners to include the double spend transaction instead of the original, the malicious attacker will include a significantly higher mining fee than the original transaction. This can be seen as a 'miner bribe' being paid to discard the first-seen rule and to accept the double spend instead of the original.

:::note
Attempting a double spend in this way does not incur risk to the adversarial party, either their transaction is not included and they don't pay any fee, or they successfully perform the double spend and they pay the high fee "miner bribe".
:::

## Economic Value Extraction

We will now consider what motive the adversarial actor might have to perform these bribes. The two classes of motives are either the profit motive for an economically motivated actor or causing on-chain disruption for a maliciously motivated actor.

### Stale-state arbitrage

If DEXes don't cleverly aggregate their prices across blocks, then it can be economical for adversarial actors to instead of building on the latest transaction in the unconfirmed transaction chain of a smart contract, to instead create a competing transaction chain building on an older state. By strategically creating a competing transaction chain they might be able to take advantage of an older price state/ratio which has not yet been confirmed in the blockchain.

Because having a more advantageous (older) price state or ratio might be very profitable, it is worth it for the adversarial actor to pay the high fee "miner bribe" to attempt this double spend transaction.

:::tip
We list some possible mitigations which smart contract systems can implement in the section on ['Avoiding MEV'](#mev-avoidance-strategies)
:::


## Miner-Extractable-Value (MEV)

Miner-Extractable-Value (MEV) refers to the value (either in dollars or in BCH) which miners can "extract" by having the ability to decide transaction inclusion and the ability to prioritize or insert their own transactions in their new block.

:::note
On Ethereum the acronym was changed to mean "Maximum-Extractable-Value" because ETH is now a proof-of-stake system and does not have miners. The modified concept still applies to the ETH block proposers (validators).
:::

### MEV Differences from ETH

MEV works quite differently on a UTXO-model blockchain than on an account-based chain. So even if you are very familiar with the MEV mechanisms on Ethereum it will still be helpful to consider how they do - or do not - apply to Bitcoin Cash.

What is not possible to do on UTXO chains is a "sandwich" strategy where a miner would insert a transaction in the middle of a valid transaction chain. In UTXO each transaction explicitly consumes inputs of a previous transaction and creates outputs. Because of this it is not possible to "insert" a transaction in the middle of an unconfirmed chain and thus sandwich strategies are not possible.

### Controlling Block-Construction

The reason why block producers are better positioned than other economic actors such as on-chain traders or arbitrageurs is that they can prioritize their own transactions even if conflicting transactions exist in the mempool.

Other actors who construct double spend transactions will face great difficulty in getting their transaction to propagate and in having to pay high mining fees to bribe miners to accept their double spend over the original transaction.

## Expected Evolution of MEV

Below we will extend the adversarial analysis by extrapolating the evolution of MEV on Bitcoin cash based on the example of more mature DeFi ecosystems like Ethereum. As mentioned at the start, the "happy case" scenario is currently the standard lifecycle for transactions on BCH. The analysis below is speculatively extrapolating how this could evolve in a mature DeFi ecosystem.

### Abandoning First-Seen

If over time "bribe" double spends start happening on BCH then we can expect over time that some miners will deflect from the convention and use custom transaction selection software to extract MEV from bribe transactions. Over time we can expect miners not just to prefer bribes when available but to actively build transactions to extract from or create value for DeFi protocols.

:::tip
Adversarial analysis should take into account that "first-seen rule" is just a convention and a way to play nice, however it is not economically maximizing when double spends include miner bribes.
:::

### Specialized Block-Builders


As described in the section on "stale-state arbitrage" economic actors may be incentivized to strategically create a competing transaction chain which takes advantage of an older price state/ratio which has not yet been confirmed in the blockchain. Although miners are not specialized in the optimal construction of DeFi transactions in a block, miner would over time be likely to team up with teams/companies creating this type of software for them.

:::note
Ethereum with its large amount of MEV has already seen the emergence of specialized 'block builder' as a new class of relevant economic actors separate from the block proposer (who signs the block).
:::

## MEV Avoidance Strategies

There's a few strategies which dapps can employ to avoid introducing unwanted MEV:

### Batching Same-Block Trades

For DEXes the solution to the 'stale-state arbitrage' problem is introducing a batching mechanism for same-block trades so they all execute at the same price. The drawback is that this mechanism requires extra contract complexity and careful design. The benefit of including such a MEV avoidance mechanism is that even at scale with many adversarial actors, economic extraction with double spends is not possible.

:::tip
This strategy of batching same-block trades (or "joint-execution") is the key concept demonstrated by the [Jedex contract prototype](https://github.com/bitjson/jedex#demonstrated-concepts).
:::

### Centralized Co-signing

For contract systems relying on a continuously update on-chain oracle price feed, the problem of 'stale-state arbitrage' reappears.
However in this context the only known solution to adversarial actors exploiting stale state with a late double spend is to require centralized co-signing in the contract system.

The drawback of this approach is that it introduces a central party to enforce honest, sequential actions to prevent late double spends. The approach introduces the need for interactivity and assumes that the central signing service does not collude or cannot be bribed, additionally it also introduces new possible security concerns.

### Avoid Bounty Transactions

Having anyone-can-claim bounty transactions in a smart contract system directly encourages the development of double spending technology, whether it is race-condition double spends, miner bribe double spends or miner-involved double spends.

:::tip
To not incentivize the development of double-spending technologies, it is best to avoid anyone-can-claim bounty transactions in your smart contract system.
:::
