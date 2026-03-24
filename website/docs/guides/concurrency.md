---
title: Contract Concurrency
sidebar_label: Contract Concurrency
---

In the UTXO model, a UTXO can only be spent once. When a public covenant has a single UTXO and two users try to interact with it at the same time, only one transaction propagates and the other is discarded as a conflict. This is called **UTXO contention** and it's the core scalability challenge for Bitcoin Cash smart contracts. This guide covers practical, permissionless design patterns to enable concurrent contract usage.

## The Problem: Single-UTXO Bottleneck

Consider a simple minting contract with one UTXO. User A and User B both want to mint an NFT at the same time. Both build a transaction spending the same contract UTXO. Due to the [first-seen rule](/docs/guides/lifecycle#first-seen-rule), only one transaction propagates through the network and the other is rejected.

```
User A ─── tx spending UTXO #1 ──→ ✓ Accepted (first-seen)
User B ─── tx spending UTXO #1 ──→ ✗ Rejected (conflict)
```

This means a single-UTXO contract can only process one interaction every few seconds without running into conflicts. For any contract with public usage, this can degrade the user experience.

:::tip
As covered in the [Transaction Lifecycle](/docs/guides/lifecycle) guide, Bitcoin Cash supports unlimited unconfirmed transaction chains. In theory, users could take turns chaining transactions on the same UTXO. In practice, coordinating this is fragile and doesn't scale.
:::

## Solution: Peer-to-Peer Contracts

The simplest way to avoid UTXO contention is to avoid shared UTXOs entirely. In a **peer-to-peer contract**, each contract instance is created between specific participants with predetermined terms. Only those participants can spend the UTXO, so there is no public competition for it and no concurrency problem.

Many common contract types are naturally peer-to-peer: escrows, vaults, multisig wallets, and derivatives contracts. These don't need threading — each instance is independent by design. For example, [AnyHedge][anyhedge] is a derivatives protocol where two parties agree on terms, lock BCH into a shared contract UTXO, and settle based on an oracle price at maturity — thousands of these contracts can exist simultaneously without any contention because each is a private UTXO between two specific parties.

Peer-to-peer contracts are the right choice when:

- The contract involves a **fixed set of participants** known at creation time.
- There is **no shared resource** (like a liquidity pool) that many users need to access concurrently.
- The contract's terms are **predetermined** — users agree on parameters before funding.

When a contract *does* need to serve arbitrary public users against shared state, peer-to-peer design won't work and you need the threading patterns described below.

## Solution: Multi-Threaded Contracts

The key insight is to create **multiple identical contract UTXOs**, each acting as an independent "thread". Users interact with different threads in parallel without conflicts.

```
Thread 0  ──→  User A mints here
Thread 1  ──→  User B mints here
Thread 2  ──→  User C mints here
Thread 3  ──→  (available)
Thread 4  ──→  (available)
```

Each thread is a separate UTXO locked to the same contract. Because they are independent UTXOs, spending one does not affect the others. This is the UTXO-model equivalent of concurrent processing.

### Stateless vs Stateful Threads

How you design threads depends on whether your contract carries state. As is common when working with concurrency, it is easier to leverage it when you have a stateless system. Most of the complexity in concurrent systems comes from the stateful parts.

**Stateless threads** are the simplest case. The contract enforces rules but doesn't track any evolving state. You create multiple identical UTXOs and any of them can service any request.

**Stateful threads** carry state in the NFT commitment field. Each thread tracks its own state independently. The state across threads may drift and the system must be designed to tolerate this — see [Managing State Drift](#managing-state-drift) below.

Thread UTXOs are created during the [genesis transaction](/docs/guides/deployment). Each thread gets its own UTXO (and optionally an NFT with distinct state in its commitment field), all created in one atomic transaction. See the [Contract Deployment](/docs/guides/deployment) guide for details on setting up genesis transactions with multiple outputs.

## Random UTXO Selection

When a client needs to pick a thread, deterministic selection (always picking the first UTXO) defeats the purpose of having multiple threads since all users would contend for the same one. Instead, **randomly select** from available contract UTXOs:

```ts
const contractUtxos = await contract.getUtxos();

// Filter for the relevant UTXOs (e.g. minting capability)
const availableThreads = contractUtxos.filter(
  utxo => utxo.token?.nft?.capability === 'minting'
);

// Randomly select a thread
const randomIndex = Math.floor(Math.random() * availableThreads.length);
const selectedThread = availableThreads[randomIndex];
```

This distributes concurrent transactions across threads, minimizing the chance of collisions. When collisions do happen, they result in [competing transactions](/docs/guides/lifecycle#competing-transactions) where only one can be included — the other silently disappears.

:::tip
Random selection is the simplest approach and works well for client-side applications. For applications with a backend, you can implement smarter strategies like round-robin or least-recently-used.
:::

### Handling Collisions

Even with random selection, collisions will occasionally happen. When they do, the network provider returns an error indicating the selected UTXO was already spent by another transaction. Your application needs to detect this specific error and distinguish it from other failures like insufficient fees or invalid transactions, in order to retry the transaction. The key detail is that the entire transaction must be rebuilt on retry — re-fetching UTXOs from the network gives you a fresh set where the conflicting UTXO is no longer available.

This retry pattern applies when the dapp or server broadcasts the transaction directly. In a [WalletConnect](/docs/guides/walletconnect) setup with `broadcast: true`, the user's wallet handles broadcasting and will encounter the mempool conflict error instead. The dapp cannot catch and retry automatically — the user would need to retry the action, at which point the dapp should re-fetch UTXOs and select a new thread.

## Modular Contract Functions

The [modular contract design](/docs/guides/optimization#modular-contract-design) pattern from the optimization guide also has significant concurrency benefits. By separating contract logic into independent function contracts (each identified by an NFT commitment), users only contend on the main covenant when they need to modify shared state. The function contract UTXOs can each be duplicated independently, so different operation types can run in parallel without blocking each other.

:::note
This pattern is most valuable for complex contracts with many functions. For simpler contracts like a minting contract, putting all logic in one contract is perfectly fine.
:::

## Choosing the Number of Threads

The number of threads depends on how many concurrent users you are realistically designing for. More threads means less contention, but more threads adds complexity to deployment and increases ongoing costs for stateful threads.

Consider these factors when deciding:

- **Stateless contracts** can have more threads freely, since there is no state drift concern and threads are interchangeable.
- **Stateful contracts** benefit from fewer threads, since each thread evolves its state independently and users or the application must keep them in sync.
- **Contracts with shared resources** like a liquidity pool present a trade-off: splitting into persistent threads fragments the resource across them.

For contracts with shared resources, this fragmentation can be significant. [Cauldron][cauldron], a BCH DEX, illustrates the tension well: each liquidity provider creates their own independent contract UTXO ("micro-pool"), which looks like natural threading. But to get good price execution, a swap transaction needs to aggregate many of these micro-pools as inputs in a single transaction — so two concurrent swaps will still conflict on shared inputs, and the separate UTXOs don't actually help with concurrency.

This is a fundamental trade-off for DEX designs: combining liquidity for better execution works against splitting UTXOs for concurrency. The [accumulate-and-merge](#accumulate-and-merge-threading) model is one approach that addresses this by periodically merging threads back together for batch settlement.

:::caution
Depending on your contract design, the number of threads may be fixed at deployment and cannot be changed later. Plan your thread count carefully based on realistic usage estimates before deploying.
:::

### Cost Considerations

The one-time cost of creating thread UTXOs (dust amount per output) is negligible. The real cost to consider is **ongoing transaction fees for stateful threads that require regular updates**. Each stateful thread UTXO needs its own transaction to update its state, and these fees multiply with the number of threads.

For example, a price oracle contract that updates every 10 minutes results in ~52,560 update transactions per year, per thread. With 5 price oracle threads, that's over 260,000 transactions annually. While individual Bitcoin Cash transaction fees are very low, this adds up and should factor into your thread count decision.

Stateless threads have no ongoing cost — they only incur fees when users interact with them, and those fees are typically paid by the user. The cost consideration primarily applies to stateful threads that a service must keep up to date.

## Managing State Drift

When stateful contracts have multiple threads, each thread's state evolves independently. Consider whether state drift is acceptable for your use case — if it isn't, threading may not be the right approach. When it is acceptable, there are strategies to minimize it:

- **User incentive to update**: If users benefit from having the latest state (e.g., they avoid paying extra fees by updating), they will naturally keep threads current.
- **Lazy updates**: Allow any user to update a thread's state as part of their transaction. The contract validates the update is correct but doesn't require it to happen on a specific schedule. This serves as a useful fallback, but you should not rely on external users to keep your system in sync — a dedicated transaction service is typically needed to ensure threads stay up to date.

:::caution
State drift is the most dangerous aspect of concurrent contract design. Analyze how likely drift is to occur, what happens when a thread's state lags behind, and ensure the contract logic remains safe in that scenario.
:::

## Accumulate-and-Merge Threading

The [Jedex][jedex] spec (Joint-Execution Decentralized Exchange) demonstrates a different concurrency model where threads are **ephemeral rather than persistent**. Instead of threads operating independently forever, multiple thread covenants collect user orders in parallel during an accumulation phase. At the end of a tick period, any user can trigger a lifecycle transaction that merges all threads back into a single covenant for batch settlement, and new threads are created for the next cycle.

```
         ┌─── Thread 0 ──── orders ───┐
Users ───┤─── Thread 1 ──── orders ───┤──→ Merge ──→ Settle ──→ Recreate threads
         ├─── Thread 2 ──── orders ───┤
         └─── Thread 3 ──── orders ───┘
```

This model introduces a few ideas that are useful beyond DEX design. **Offloading state to users**: rather than tracking per-user data in the covenant, users receive receipt NFTs with their order details in the commitment. The settlement covenant can compute what each user is owed from just the receipt and the settlement price. **Ephemeral child covenants**: instead of maintaining historical data, a new payout covenant is spawned per settlement period. Users redeem their receipts against it at any time, and the main covenant never accumulates unbounded state.

:::tip
Accumulate-and-merge suits systems that must reconcile against shared state (like a liquidity pool). For systems where threads stay independent, persistent threads are simpler.
:::

## Real-World Examples

The [CashNinjas minting contract][cashninjas-mint] is an open-source production example of the multi-threaded minting pattern. It uses interleaved numbering across configurable threads (5 by default), with each thread tracking its mint count in the NFT commitment field. The contract is only 163 bytes of bytecode, demonstrating that the threading pattern adds minimal overhead to the contract itself — the complexity lives in the setup and client-side thread selection rather than in the on-chain logic.

## Putting It Together

A well-designed concurrent contract system combines these patterns:

1. **Identify bottlenecks**: Which contracts will see concurrent usage? Which must be single-threaded?
2. **Split into threads**: Create multiple UTXOs for parallel contracts during deployment.
3. **Separate concerns**: Use modular function contracts to maximize the parallel surface area.
4. **Random selection**: Clients randomly pick from available threads to distribute load.
5. **Manage drift**: Analyze and mitigate the impact of state drift across stateful threads.

```
                      ┌─── Thread 0 ───┐
         random  ──→  ├─── Thread 1 ───┤──→ All produce valid,
Users ── select  ──→  ├─── Thread 2 ───┤    independent results
                      ├─── Thread 3 ───┤
                      └─── Thread 4 ───┘
```

These patterns have been proven in production systems handling concurrent interactions on Bitcoin Cash. The UTXO model's explicit state makes reasoning about concurrency straightforward: if two transactions don't share any inputs, they cannot conflict.

For adversarial considerations around multi-threaded systems — such as intentional double-spends or targeted contention attacks — see the [Adversarial Analysis](/docs/guides/adversarial) guide.

[anyhedge]: https://anyhedge.com
[cauldron]: https://www.cauldron.quest
[jedex]: https://github.com/bitjson/jedex
[cashninjas-mint]: https://github.com/cashninjas/minting-contract
