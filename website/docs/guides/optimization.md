---
title: Optimizing Contracts
sidebar_label: Optimization
---

CashScript contracts are transpiled from the high-level CashScript code to [BCH Script](https://reference.cash/protocol/blockchain/script) by the `cashc` compiler. BCH Script is the low-level language used for the Bitcoin Cash Virtual Machine (BCH VM) to evaluate contracts.

Because transaction fees are based on the bytesize of a transaction, it may be useful to optimize the compiled size of your smart contract by tweaking your CashScript code.

## Example Workflow

When optimizing your contract, you will need to continuously compare the contract size to see if the changes have a positive impact.
With the compiler CLI, you can easily check the bytesize and opcode count directly from the generated contract artifact.

```bash
cashc ./contract.cash --size --opcount
```

The compiler calculates the size from the contract's bytecode without constructor arguments. For the `opcount` this is not a problem but the `bytesize` output will be an underestimate, as the contract hasn't been initialized with contract arguments.
The compiler `bytesize` output is still helpful to compare the effect of changes, given that the contract constructor arguments stay the same.

:::tip
To get the exact contract bytesize including constructor parameters, initialise the contract with the TypScript SDK and check the value of `contract.bytesize`.
:::

## Optimization Tips

The `cashc` compiler does some optimisations automatically. By writing your CashScript code in a specific way, the compiler is better able to optimise it.

### 1. Declare variables

Declare variables instead of hardcoding the same values in multiple places:

```solidity title="Example CashScript code"
    // do this
    bytes tokenId = 0x8473d94f604de351cdee3030f6c354d36b257861ad8e95bbc0a06fbab2a2f9cf;
    require(tx.outputs[0].tokenCategory == tokenId);
    require(tx.outputs[1].tokenCategory == tokenId);

    // not this
    require(tx.outputs[0].tokenCategory == 0x8473d94f604de351cdee3030f6c354d36b257861ad8e95bbc0a06fbab2a2f9cf);
    require(tx.inputs[1].tokenCategory == 0x8473d94f604de351cdee3030f6c354d36b257861ad8e95bbc0a06fbab2a2f9cf);
```

Also declare variables when re-using certain common introspection items to avoid duplicate expressions:

```solidity title="Example CashScript code"
    // do this
    bytes tokenIdContract = tx.inputs[0].tokenCategory.split(32)[0];
    require(tx.inputs[1].tokenCategory == tokenIdContract);
    require(tx.outputs[1].tokenCategory == tokenIdContract);

    // not this
    require(tx.inputs[1].tokenCategory == tx.inputs[0].tokenCategory.split(32)[0]);
    require(tx.inputs[1].tokenCategory == tx.inputs[0].tokenCategory.split(32)[0]);
```

### 2. Consume stack items

It's best to "consume" values (i.e. their final use in the contract) as soon as possible. This frees up space on the stack.
Use/consume values as close to their declaration as possible, both for variables and for parameters. This avoids having to do deep stack operations. This [example](https://gitlab.com/GeneralProtocols/anyhedge/contracts/-/blob/development/contracts/v0.11/contract.cash#L61-72) from AnyHedge illustrates consuming values immediately.

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

### 5. Trial & Error

When the contract logic is finished, that is a great time to revisit the order of the contract's constructor argument, the different contract functions and even the contract parameters. Currently the compiler does not change/optimize the user-defined order, so in addition to the guidelines above, it can still be helpful to trial and error different ordering for the items.

## Avoid Many Functions

When a contract has many different functions or has a lot duplicate code shared across two functions, this can be a natural indication that contract optimization is possible. There's a different optimization strategy for each: 

### Modular Contract Design

Modular contract design avoids the added size of having many functions, instead the contract logic is separated out in to different components which we will call 'function contracts'.
By only adding the function contract you are actually using in the transaction, and not all the other unused functions, you can drastically shrink the size of your contracts used in a transaction.

The concept of having NFT functions was first introduced by the [Jedex demo](https://github.com/bitjson/jedex#demonstrated-concepts) and was first implemented in a CashScript contract by the [FexCash DEX](https://github.com/fex-cash/fex/blob/main/whitepaper/fex_whitepaper.md). The concept is that by authenticating NFTs, you can make each function a separate contract with the same tokenId. This way, you can offload logic from the main contract. One function NFT contract is attached to the main contract during spending, while the other contract functions exist as unused UTXOs, separate from the transaction.

:::tip
By using function NFTs you can use a modular contract design where the contract functions are offloaded to different UTXOs, each identifiable by the main contract by using the same tokenId.
:::

### Combining Functions

Combining functions reduces the duplicate code in the compiled output and improves the overall contract bytesize so might be worth exploring. This optimization is already considered advanced, as it steps away from the CashScript abstraction for contract structure and often requires some workarounds.

The difficulty with this approach is the CashScript functions expect a fixed number of arguments for each function. So when trying to two functions into one to share code logic it might prove very difficult due to the different arguments they each expect. There is no notion of option arguments or function overloading in CashScript currently.

```solidity title="Example CashScript code"
contract Example(){
  function Main(){
    // logic applying to all if/else branches
    if(conditionFunction1){
       // logic function1
    } else if(conditionFunction2){
       // logic function2
    } else {
     // function3
      // logic function3
    }
  }
}
```

In Cashscript, when defining multiple functions, a `selectorIndex` parameter is added under-the-hood to select which of the contract's functions you want to use, this wraps your functions in big `if-else` cases. However when combining multiple functions in one cases you will have to think about the function conditions yourself and `if-else` branching yourself.

:::note
When a CashScript contract only has one function, the function selecting overhead (`selectorIndex` with `if-else` cases) is not present which means a smaller contracts.
:::

## Hand-optimizing Bytecode

It's worth considering whether hand-optimizing the contract is necessary at all. If the contract works and there is no glaring inefficiency in the bytecode, perhaps the best optimization is to not to obsess prematurely about the transaction size with Bitcoin Cash's negligible fees.

>We should forget about small efficiencies, say about 97% of the time: premature optimization is the root of all evil. Yet we should not pass up our opportunities in that critical 3%.

### Optimizing with the BitauthIDE

When optimizing the bytecode of your contract you'll like want to use the [BitauthIDE] so you can see the stack changes of each OpCode. It's important to realize the `transactionBuilder.bitauthUri()` will show the two-wap mapping to the **un-optimized** bytecode, so this is not the final resulting bytecode produced by the compiler. The compiler will perform a bunch of optimizations already, so you should look at the `Artifact bytecode` if you want to further optimize the compiled contract bytecode.

### Overwriting the Artifact

To manually optimize a CashScript contract's bytecode, you need to overwrite the `bytecode` key of your contract artifact.

If you manually overwrite the `bytecode` in the artifact, the auto generated 2-way-mapping generated by the compiler becomes obsolete. You are no longer compiling high-level CashScript code into BCH script, instead you are writing BCH script by hand.
This causes the link of the BCH opcodes to your original CashScript code will be entirely lost for debugging.

You can still use the CashScript TypeScript SDK while using a hand-optimized or hand-written contract.


```typescript
interface Artifact {
  bytecode: string // Compiled Script without constructor parameters added (in ASM format)
  // remove the 'debug' property as the info becomes obsoleted
}
```


:::caution
If you use hand-optimized `bytecode` in your Contract's artifact, the `debug` info on your artifact will become obsolete and should be removed.
:::

:::tip
You can create an `Artifact` for a fully hand-written contract so it becomes possible to use the contract with the nice features of the CashScript SDK! An example of this is [Cauldron_Swap_Test](https://github.com/mr-zwets/Cauldron_Swap_Test) which uses `Artifact bytecode` not produced by `cashc` at all but still uses the CashScript SDK.
:::

[BitauthIDE]: https://ide.bitauth.com