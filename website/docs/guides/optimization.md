---
title: Optimizing Contracts
sidebar_label: Optimization
---

CashScript contracts are transpiled from a solidity syntax to [BCH Script](https://reference.cash/protocol/blockchain/script) by the `cashc` compiler. BCH Script is a lower level language (a list of stack-based operations) where each available operation is mapped to a single byte.

Depending on the complexity of the contract or system design, it may be useful to optimize the Bitcoin Script by tweaking the contract in CashScript before it is compiled because the minimum fees on the Bitcoin Cash network are based on the bytesize of a transaction (including your contract).

## Example Workflow

When optimizing your contract, you will need to compare the contract size to see if the changes have a positive impact.
With the compiler CLI, you can easily check the opcode count and bytesize directly from the generated contract artifact.

```bash
cashc ./contract.cash --opcount --size
```

The size outputs of the `cashc` compiler are based on the bytecode without constructor arguments. This means they will always be an underestimate, as the contract hasn't been initialized with contract arguments.

:::note
The compiler opcount and bytesize outputs are still helpful to compare the effect of changes to the smart contract code on the compiled output, given that the contract constructor arguments stay the same.
:::

:::tip
To get the exact contract opcount and bytesize including constructor parameters, initialise the contract with the TypScript SDK and check the values of `contract.opcount` and `contract.bytesize`.
:::

## Optimization Tips & Tricks

The `cashc` compiler does some optimisations automatically. By writing your CashScript code in a specific way, the compiler is better able to optimise it. Trial & error is definitely part of it, but here are some tricks that may help:

### 1. Consume stack items

It's best to "consume" values (i.e. their final use in the contract) as soon as possible. This frees up space on the stack.
Use/consume values as close to their declaration as possible, both for variables and for parameters. This avoids having to do deep stack operations. This [example](https://gitlab.com/GeneralProtocols/anyhedge/contracts/-/blob/development/contracts/v0.11/contract.cash#L61-72) from AnyHedge illustrates consuming values immediately.

### 2. Declare variables

Declare variables when re-using certain common introspection items to avoid duplicate expressions.

```solidity title="Example CashScript code"
    // do this
    bytes tokenIdContract = tx.inputs[0].tokenCategory.split(32)[0];
    require(tx.inputs[1].tokenCategory == tokenIdContract);
    require(tx.outputs[1].tokenCategory == tokenIdContract);

    // not this
    require(tx.inputs[1].tokenCategory == tx.inputs[0].tokenCategory.split(32)[0]);
    ...
    require(tx.inputs[1].tokenCategory == tx.inputs[0].tokenCategory.split(32)[0]);
```

### 3. Parse efficiently
When using `.split()` to use both sides of a `bytes` element, declare both parts immediately to save on opcodes parsing the byte array.

```solidity title="Example CashScript code"
    // do this
    bytes firstPart, bytes secondPart = tx.inputs[0].nftCommitment.split(10);

    // not this
    bytes firstPart = tx.inputs[0].nftCommitment.split(10)[0];
    ...
    bytes secondPart = tx.inputs[0].nftCommitment.split(10)[1];
```
### 4. Avoid if-else

Avoid if-statements when possible. Instead, try to "inline" them. This is because the compiler cannot know which branches will be taken, and therefore cannot optimise those branches as well. This [example](https://gitlab.com/GeneralProtocols/anyhedge/contracts/-/blob/development/contracts/v0.11/contract.cash#L128-130) from AnyHedge illustrates inlining flow control:

```solidity title="AnyHedge CashScript code"
    // do this
    bool onOrAfterMaturity = settlementTimestamp >= maturityTimestamp;
    bool priceOutOfBounds = !within(clampedPrice, lowLiquidationPrice + 1, highLiquidationPrice);
    require(onOrAfterMaturity || priceOutOfBounds);

    // not this
    if(!(settlementTimestamp >= maturityTimestamp)){
        bool priceOutOfBounds = !within(clampedPrice, lowLiquidationPrice + 1, highLiquidationPrice);
        require(priceOutOfBounds);
    }
```

## Modular Contract Design

An alternative to optimizing your contract to shrink in size is to redesign your contract to use a composable architecture. The contract logic is separated out in to multiple components of which only some can be used in a transaction, and hence shrink your contract size.

### NFT contract functions

The concept of having NFT functions was first introduced by the [Jedex demo](https://github.com/bitjson/jedex#demonstrated-concepts) and was first implemented in a CashScript contract by the [FexCash DEX](https://github.com/fex-cash/fex/blob/main/whitepaper/fex_whitepaper.md). The concept is that by authenticating NFTs, you can make each function a separate contract with the same tokenId. This way, you can offload logic from the main contract. One function NFT contract is attached to the main contract during spending, while the other contract functions exist as unused UTXOs, separate from the transaction.

:::tip
By using function NFTs you can use a modular contract design where the contract functions are offloaded to different UTXOs, each identifiable by the main contract by using the same tokenId.
:::

## Hand-optimizing Bytecode

It's worth considering whether hand-optimizing the contract is necessary at all. If the contract works and there is no glaring inefficiency in the bytecode, perhaps the best optimization is to not to obsess prematurely about things like transaction size.

>We should forget about small efficiencies, say about 97% of the time: premature optimization is the root of all evil. Yet we should not pass up our opportunities in that critical 3%.

### Overwriting the Artifact

To manually change the contract bytecode, you need to overwrite the `bytecode` key of your contract artifact.

```typescript
interface Artifact {
  bytecode: string // Compiled Script without constructor parameters added (in ASM format)
}
```

This way you can still use the CashScript TypeScript SDK while using a hand-optimized contract.

:::caution
If you manually overwite the `bytecode` in the artifact, this will make the auto generated 2-way-mapping to become obsolete.
This result of this is that the dubugging functionality will no longer work for the contract.
:::
