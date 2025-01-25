---
title: Bitcoin Cash VM Limits
sidebar_label: VM Limits
---

Bitcoin Cash enforces VM limits to ensure secure and efficient contract execution. When developing with CashScript, keep these limits in mind to ensure your contracts run smoothly without encountering transaction errors due to size or computational constraints.

## Maximum Contract Size

The Bitcoin Cash VM has a **maximum size for smart contracts** which limits the length of input bytecode to **1,650 bytes**. While typical contracts stay well below this, complex contracts with extensive logic might require adjustments to fit within this constraint.

### Modular Contract Design

If your contract includes multiple functions, consider a modular design. Separating contract logic into independent components allows each function to be deployed as a smaller contract, reducing the overall transaction size. This approach can naturally divide complex contracts without impacting functionality. For more on this, see the guide on [Contract Optimization](/docs/guides/optimization).

## Operation Cost Limit

Bitcoin Cash also enforces an **operation cost limit** (op-cost) on each transaction input. The op-cost limit controls the computational budget available for operations in a contract and is calculated based on the input length, with each byte allowing for a higher maximum operation cost.

```ts
function maxOperationCost(unlockingBytecodeLength) {
  return (41n + unlockingBytecodeLength) * 800n;
}
```

With this formula, increasing your input length allows for a larger compute budget. You can view specific op-costs for each operation in the [op-cost-table][op-cost-table], which outlines the compute cost of operation.

### Buying Compute Budget

To increase your contract's compute budget for resource-intensive operations (e.g., cryptographic hashing or large number calculations), you can use zero-padding to extend the input length. By adding non-essential, zero-value bytes, you effectively buy more computation power for your contract without adding functional complexity. This technique could be useful for contracts requiring a higher operation budget, allowing them to meet the contract's computational demands without exceeding the op-cost limit.

## NFT Commitment Length Limit

Currently NFT commitments can keep no more than 40 bytes of data as local state. To work around this limit it is possible to hash state longer than 40 bytes so it fits within the length limit. Then in a later transaction the full state has to be provided and has to match the state-hash.  

## Other Limits

For completeness, here are additional Bitcoin Cash VM limits relevant to CashScript development:

- **Signature Operation Count** (SigChecks) Limits the number of signature verifications (e.g. `OP_CHECKSIG`, `OP_CHECKDATASIG`) per transaction to ensure efficient validation.

- **Hashing Limit**: Limits the number of hashing operations (e.g. `OP_SHA256`, `OP_HASH160`) allowed per transaction to prevent excessive resource usage.

- **Stack Element Byte Length**: Each stack element has a maximum length of 10,000 bytes. This limit also affects the size of Pay-to-Script-Hash (P2SH) contracts which are pushed as an element to the stack on spending.

[op-cost-table]: https://github.com/bitjson/bch-vm-limits/blob/master/operation-costs.md
