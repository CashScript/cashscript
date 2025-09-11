---
title: BCH Script & Transaction Limits
sidebar_label: Script & Transaction Limits
---

Bitcoin Cash imposes various constraints on scripts and transactions to ensure efficient contract execution and network stability. We'll categorize these limits into 2 types: 'Contract-related limits' and 'General transaction limits'.

:::note
Some of the limits below are hard BCH consensus rules, others are standardness relay rules which are still present significant practical barriers. These relay rules however are only enforced on network propagation. You can read more about the [BCH standardness rules here][standardness-docs].
:::

## Contract-related limits

### Maximum contract size

The Bitcoin Cash limits contract bytecode to **1,650 bytes** in the standardness rules. Transactions with contract bytecode won't be relayed by most nodes.

While typical contracts stay well below this, complex contracts with extensive logic might need adjustments to fit within this constraint.

#### Modular contract design

To keep contracts within size limits, consider modular design. Splitting contract logic into smaller, independent components allows each function to be deployed separately, reducing transaction size. See [Contract Optimization](/docs/guides/optimization) for more details.

### NFT commitment length limit

NFT commitments can store up to 40 bytes of data as local state. If more data is needed, you can hash the full state and store only the hash in the commitment data. Later, when required, the full state must be provided and validated against the stored hash.

:::caution
The 40-bytes limit on commitment length is of great practical importance for contract authors. Workarounds are needed to keep more bytes of local state in smart contracts.
:::

### Operation cost limit

Bitcoin Cash enforces an operation cost limit (op-cost) per transaction input. This determines the computational budget available for operations in a contract. The op-cost is based on script length: longer input scripts allow for a higher compute budget.

#### Buying compute budget

Since longer input scripts allow for a larger compute budget, some contracts use zero-padding (adding non-functional bytes) to "buy" more computation power without changing logic. You can find the exact op-cost per operation in the [op-cost-table][op-cost-table].

```ts
function maxOperationCost(unlockingBytecodeLength) {
  return (41n + unlockingBytecodeLength) * 800n;
}
```

### Other contract-related limits

- Signature operation count (SigChecks): Limits the number of signature verifications (`OP_CHECKSIG`, `OP_CHECKDATASIG`) per transaction to ensure efficient validation.
- Hashing limit: Limits the number of hashing operations (`OP_SHA256`, `OP_HASH160`) allowed per transaction to prevent excessive resource usage.
- Stack element byte length: Each stack element has a maximum length of 10,000 bytes, affecting Pay-to-Script-Hash (P2SH) contracts.

## General transaction limits

In addition to contract-related limits, Bitcoin Cash also enforces general transaction limits.

### Maximum transaction size

Bitcoin Cash transactions must not exceed 100,000 bytes (100KB) to be considered standard. Transactions above this size won't be relayed by most nodes. The consensus limit for the maximum transaction size is 1MB.

### Data output size limit

Bitcoin Cash allows multiple OP_RETURN outputs, but the total size of all data outputs in a transaction must not exceed 220 bytes of data payload (223 bytes total). Transactions with larger data outputs won't be relayed by most nodes. You can read more about the [BCH standardness rules here][standard-outputs-docs].

### Dust threshold

Bitcoin Cash defines a "dust" threshold for output value. Outputs below this threshold are considered dust and will not be relayed by standard nodes. Provably unspendable outputs (OP_RETURN outputs) are exempt from this rule.

The dust threshold for output value is calculated as:

```ts
function calculateDust(outputSize: number): number {
  const dustThreshold = 444 + outputSize * 3;
  return dustThreshold;
}
```

Before CashTokens `546` bytes was often used as good default value, however with tokenData outputs have become larger in size.
For ease of development, it is standard practice to use 1,000 satoshis as dust to outputs.

:::note
The standard practice of 1,000 satoshis as dust amount for outputs is only considering `P2PH`, `P2SH` and `P2PK` output types.
For `P2MS` (raw multisig) a higher dust limits may be required, you can [find more info here][info-dust-limit]
:::

### Output Standardness

Bitcoin Cash only allows a few types of `lockingBytecode` scripts for outputs in the normal network relay rules. These are called 'standard outputs', contrasted to 'non-standard outputs' which cause the transaction not to relay on the network.

There's 4 types of standard output types: `P2PKH`, `P2SH` (which includes `P2SH20` & `P2SH32`), `P2MS` and `OP_RETURN` data-outputs. For more details see the [standard outputs documentation][standard-outputs-docs].

:::caution
The `lockingBytecode` standardness rules can be important for smart contract developers, and is why CashScript has helpers like `LockingBytecodeP2PKH`, `LockingBytecodeP2SH32` and `LockingBytecodeNullData`.
:::

### Minimum Relay Fee

The Bitcoin Cash protocol does not strictly enforce minimum fees for transactions, minimum transaction fees are enforced as a standardness rule on the relay level. The minimum relay fee for BCH transactions is 1sat/byte (1000sats/kb). This is also the standard minimum fee set by most miners on the network.

## Summary table

| Limit type | Constraint |
|------------|-------------|
| Max contract size | 1,650 bytes (standardness) |
| NFT commitment length | 40 bytes (consensus) |
| Operation cost limit | Based on script length (consensus) |
| Max stack element size | 10,000 bytes (consensus) |
| Max transaction size | 100,000 bytes for standardness (1MB for consensus) |
| Max OP_RETURN data size | 220 bytes data payload  (standardness) |
| Dust threshold | based on output size (standardness) - commonly 1,000 sats is used as dust |
| Minimum relay fee | 1sat/byte (standardness) |
| Output Standardness | `P2PKH`, `P2SH` (incl. `P2SH20` & `P2SH32`), `P2MS` and `OP_RETURN` data-outputs|

For further details on transaction validation and standardness rules, see the [documentation on BCH transaction validation][standardness-docs].

[op-cost-table]: https://github.com/bitjson/bch-vm-limits/blob/master/operation-costs.md
[standardness-docs]: https://documentation.cash/protocol/blockchain/transaction-validation/network-level-validation-rules#standard-transactions.html
[standard-outputs-docs]: https://documentation.cash/protocol/blockchain/transaction/locking-script.html
[info-dust-limit]: https://bitcoincashresearch.org/t/friday-night-challenge-worst-case-dust/1181/2
