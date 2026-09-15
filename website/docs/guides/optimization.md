---
title: Optimizing Contracts
sidebar_label: Optimization
---

CashScript contracts are transpiled from the high-level CashScript code to [BCH Script](https://reference.cash/protocol/blockchain/script) by the `cashc` compiler. BCH Script is the low-level language used for the Bitcoin Cash Virtual Machine (BCH VM) to evaluate contracts.

There are two separate budgets worth optimizing for:

- **Bytesize**: transaction fees are based on the bytesize of a transaction, and contract bytecode has a hard [size limit](/docs/compiler/script-limits#maximum-contract-size-p2sh) of 10,000 bytes for P2SH contracts.
- **Operation cost**: the BCH VM gives each input a compute budget based on the length of its unlocking bytecode. Contracts that do a lot of hashing or arithmetic can run out of [op-cost budget](/docs/compiler/script-limits#operation-cost-limit) before they run out of bytes.

These two budgets pull in opposite directions. Shrinking a contract also shrinks its op-cost budget, because the budget is derived from the script length. Most contracts only need to care about bytesize, but it's worth knowing which limit you are actually up against before you start tweaking code.

## Measuring Contract Size

When optimizing your contract, you will need to continuously compare the contract size to see if the changes have a positive impact.
With the compiler CLI, you can easily check the bytesize and opcode count directly from the generated contract artifact.

```bash
cashc ./contract.cash --size --opcount
```

The compiler calculates the size from the contract's bytecode without constructor arguments. For the `opcount` this is not a problem but the `bytesize` output will be an underestimate, as the contract hasn't been initialized with contract arguments.
The compiler `bytesize` output is still helpful to compare the effect of changes, given that the contract constructor arguments stay the same.

:::tip
To get the exact contract bytesize including constructor parameters, initialise the contract with the TypeScript SDK and check the value of [`contract.bytesize`](/docs/sdk/instantiation#bytesize).
:::

## Measuring Operation Cost

Op-cost can only be measured for a concrete transaction, because the budget depends on the unlocking bytecode of the specific input. The [`getVmResourceUsage()`](/docs/sdk/transaction-builder#getvmresourceusage) method on the `TransactionBuilder` reports the usage per input against each of the VM limits.

```ts
transactionBuilder.getVmResourceUsage(true);
```

```
VM Resource usage by inputs:
┌─────────┬─────────────────────┬─────┬───────────────────────┬───────────┬──────────┐
│ (index) │ Contract - Function │ Ops │ Op Cost Budget Usage  │ SigChecks │ Hashes   │
├─────────┼─────────────────────┼─────┼───────────────────────┼───────────┼──────────┤
│ 0       │ 'Vault - withdraw'  │ 13  │ '2,180 / 41,600 (5%)' │ '0 / 1'   │ '4 / 26' │
└─────────┴─────────────────────┴─────┴───────────────────────┴───────────┴──────────┘
```

If an input is close to its op-cost budget, see [buying compute budget](/docs/compiler/script-limits#buying-compute-budget) for how to use `unused` parameters to raise the budget.

## What the Compiler Optimizes for You

Before hand-tuning your code, it helps to know what `cashc` already does:

- **Peephole optimizations**: the compiler rewrites common opcode sequences into shorter equivalents, for example `OP_SHA256 OP_SHA256` into `OP_HASH256`, or `OP_1 OP_ADD` into `OP_1ADD`.
- **Inlining of functions and global constants**: the compiler decides per function and per constant whether to inline it or to share it with the VM's `OP_DEFINE` and `OP_INVOKE` opcodes, picking whichever produces fewer bytes. See [Sharing code](#sharing-code-with-functions-and-constants) below.

What the compiler does *not* do is reorder your declarations. The order of constructor arguments, of contract functions and of local variable declarations is preserved as you wrote it, so this ordering remains something you control by hand.

:::note
Function parameters are the one exception: they may be reordered by the compiler when enforcing [function parameter types](/docs/language/contracts#function-arguments).
:::

## Sharing Code with Functions and Constants

The largest wins in most contracts come from removing duplication, and since v0.14 the compiler gives you two tools for that: [global constants](/docs/language/contracts#global-constants) and [user-defined functions](/docs/language/contracts#user-defined-functions). Both are declared at the top level of a `.cash` file and both can be shared across every function in the contract.

### Global constants

A local variable can only deduplicate a value within a single contract function. A global constant deduplicates it across the whole contract, which matters most for large values like token categories or public keys.

```solidity title="Example CashScript code"
    // do this
    bytes constant TOKEN_ID = 0x8473d94f604de351cdee3030f6c354d36b257861ad8e95bbc0a06fbab2a2f9cf;

    contract Example() {
        function first() {
            require(tx.outputs[0].tokenCategory == TOKEN_ID);
            require(tx.outputs[1].tokenCategory == TOKEN_ID);
        }
        function second() {
            require(tx.inputs[0].tokenCategory == TOKEN_ID);
            require(tx.inputs[1].tokenCategory == TOKEN_ID);
        }
    }

    // not this
    contract Example() {
        function first() {
            bytes tokenId = 0x8473d94f604de351cdee3030f6c354d36b257861ad8e95bbc0a06fbab2a2f9cf;
            require(tx.outputs[0].tokenCategory == tokenId);
            require(tx.outputs[1].tokenCategory == tokenId);
        }
        function second() {
            bytes tokenId = 0x8473d94f604de351cdee3030f6c354d36b257861ad8e95bbc0a06fbab2a2f9cf;
            require(tx.inputs[0].tokenCategory == tokenId);
            require(tx.inputs[1].tokenCategory == tokenId);
        }
    }
```

The version using the global constant compiles to 65 bytes, against 89 bytes for the version repeating the value in each function, because the 32-byte category is stored once and invoked from both functions.

:::note
Global constants are not automatically cheaper than a local variable. The compiler compares the cost of a shared definition against the cost of inlining the value at each use, and picks the smaller one. Small values such as `int constant MIN_VALUE = 1000;` are simply inlined everywhere, and a constant used only once is inlined too. There is no overhead for writing a constant that turns out not to be worth sharing.
:::

### User-defined functions

Logic that is repeated across contract functions can be extracted into a user-defined function. As with constants, the compiler inlines the body when that is smaller, and shares it with `OP_DEFINE` and `OP_INVOKE` when sharing is smaller.

```solidity title="Example CashScript code"
    // do this
    function continuesVault(int index, bytes32 category) returns (bool) {
        require(tx.outputs[index].tokenCategory == category);
        require(tx.outputs[index].lockingBytecode == tx.inputs[0].lockingBytecode);
        bool result = tx.outputs[index].value >= tx.inputs[0].value;
        return result;
    }

    contract Vault(bytes32 category) {
        function deposit() { require(continuesVault(0, category)); }
        function withdraw() { require(continuesVault(1, category)); }
        function rollover() { require(continuesVault(2, category)); }
    }

    // not this
    contract Vault(bytes32 category) {
        function deposit() {
            require(tx.outputs[0].tokenCategory == category);
            require(tx.outputs[0].lockingBytecode == tx.inputs[0].lockingBytecode);
            require(tx.outputs[0].value >= tx.inputs[0].value);
        }
        function withdraw() {
            require(tx.outputs[1].tokenCategory == category);
            require(tx.outputs[1].lockingBytecode == tx.inputs[0].lockingBytecode);
            require(tx.outputs[1].value >= tx.inputs[0].value);
        }
        function rollover() {
            require(tx.outputs[2].tokenCategory == category);
            require(tx.outputs[2].lockingBytecode == tx.inputs[0].lockingBytecode);
            require(tx.outputs[2].value >= tx.inputs[0].value);
        }
    }
```

The shared version compiles to 44 bytes against 56 bytes for the spelled-out version, and the gap widens as the shared body grows or gains more call sites.

:::tip
Extracting a helper function is free when it turns out not to be worth sharing. A small function that is used once compiles to exactly the same bytecode as writing its body inline, so you can structure your contract for readability first and let the compiler decide.
:::

:::caution
A contract function must still end in a `require` statement, so a call to a void user-defined function cannot be the final statement of a contract function. Either have the helper return a `bool` and wrap the call in a `require`, as in the example above, or follow the call with another `require`.
:::

### Importing shared code

Functions and constants can be moved into separate files and pulled in with an [`import` directive](/docs/language/contracts#importing-functions-and-constants-from-other-files), including from npm packages. Imports do not change the compiled output compared to declaring the same functions locally, so this is purely a way to reuse and organise code across contracts.

## Optimization Tips

By writing your CashScript code in a specific way, the compiler is better able to optimise it.

### 1. Declare variables

Declare variables instead of hardcoding the same values in multiple places:

```solidity title="Example CashScript code"
    // do this
    bytes tokenId = 0x8473d94f604de351cdee3030f6c354d36b257861ad8e95bbc0a06fbab2a2f9cf;
    require(tx.outputs[0].tokenCategory == tokenId);
    require(tx.outputs[1].tokenCategory == tokenId);

    // not this
    require(tx.outputs[0].tokenCategory == 0x8473d94f604de351cdee3030f6c354d36b257861ad8e95bbc0a06fbab2a2f9cf);
    require(tx.outputs[1].tokenCategory == 0x8473d94f604de351cdee3030f6c354d36b257861ad8e95bbc0a06fbab2a2f9cf);
```

Also declare variables when re-using certain common introspection items to avoid duplicate expressions:

```solidity title="Example CashScript code"
    // do this
    bytes tokenIdContract = tx.inputs[0].tokenCategory.split(32)[0];
    require(tx.inputs[1].tokenCategory == tokenIdContract);
    require(tx.outputs[1].tokenCategory == tokenIdContract);

    // not this
    require(tx.inputs[1].tokenCategory == tx.inputs[0].tokenCategory.split(32)[0]);
    require(tx.outputs[1].tokenCategory == tx.inputs[0].tokenCategory.split(32)[0]);
```

If the same value is needed in more than one contract function, use a [global constant](#global-constants) instead of repeating the declaration in each function.

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
    bytes secondPart = tx.inputs[0].nftCommitment.split(10)[1];
```

The same idea applies to user-defined functions. When two values are derived from the same intermediate work, return both from a single function with [multiple return values](/docs/language/contracts#user-defined-functions) rather than writing two functions that each redo that work.

```solidity title="Example CashScript code"
    // do this
    function parse(bytes commitment) returns (int, int) {
        bytes payload = commitment.split(4)[1];
        bytes amountBytes, bytes nonceBytes = payload.split(8);
        return int(amountBytes), int(nonceBytes);
    }

    // not this
    function amountOf(bytes commitment) returns (int) {
        bytes payload = commitment.split(4)[1];
        return int(payload.split(8)[0]);
    }

    function nonceOf(bytes commitment) returns (int) {
        bytes payload = commitment.split(4)[1];
        return int(payload.split(8)[1]);
    }
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

### 5. Reassign before you declare

When destructuring into a mix of new and existing variables inside a loop or a branch, listing the reassignments before the declarations compiles to smaller bytecode.

```solidity title="Example CashScript code"
    // do this
    (current, next, int fresh) = step(current, next);

    // not this
    (int fresh, current, next) = step(current, next);
```

Reassigning an existing variable inside a loop or branch means rolling the new value back down to the variable's slot, which gets more expensive the deeper that slot is. Fresh declarations are parked on the altstack as soon as they are handled, so putting them last keeps the stack shallower for the reassignments that follow.

### 6. Trial & Error

When the contract logic is finished, that is a great time to revisit the order of the contract's constructor arguments, the different contract functions and even the contract parameters. The compiler does not change the user-defined order, so in addition to the guidelines above, it can still be helpful to trial and error different ordering for the items.

## Structural Optimizations

When a contract has many different functions, or a lot of duplicate code shared across functions, this can be a natural indication that contract optimization is possible.

### Extract shared logic first

Before reaching for the more advanced strategies below, check whether the duplication can simply be removed with [user-defined functions and global constants](#sharing-code-with-functions-and-constants). This is by far the cheapest option, both in bytes and in complexity, and it does not require stepping away from the CashScript abstraction for contract structure.

### Modular contract design

Modular contract design avoids the added size of having many functions, instead the contract logic is separated out in to different components which we will call 'function contracts'.
By only adding the function contract you are actually using in the transaction, and not all the other unused functions, you can drastically shrink the size of your contracts used in a transaction.

The concept of having NFT functions was first introduced by the [Jedex demo](https://github.com/bitjson/jedex#demonstrated-concepts) and was first implemented in a CashScript contract by the [FexCash DEX](https://github.com/fex-cash/fex/blob/main/whitepaper/fex_whitepaper.md). The concept is that by authenticating NFTs, you can make each function a separate contract with the same tokenId. This way, you can offload logic from the main contract. One function NFT contract is attached to the main contract during spending, while the other contract functions exist as unused UTXOs, separate from the transaction.

:::tip
By using function NFTs you can use a modular contract design where the contract functions are offloaded to different UTXOs, each identifiable by the main contract by using the same tokenId.
:::

### Combining functions

If duplicate code remains after extracting it into user-defined functions, you could consider combining several contract functions into one, where the logic of the different functions is conditionally executed based on the function arguments.

In CashScript, when defining multiple functions, a `selectorIndex` parameter is added under-the-hood to select which of the contract's functions you want to use, this wraps your functions in big `if-else` cases. When combining multiple functions into one you will have to think about the function conditions and `if-else` branching yourself.

The difficulty with this approach is that CashScript functions expect a fixed number of arguments for each function. So when trying to combine two functions into one it might prove very difficult due to the different arguments they each expect. There is no notion of optional arguments or function overloading in CashScript currently.

:::caution
This optimization is considered advanced, as it steps away from the CashScript abstraction for contract structure and often requires workarounds. Since the introduction of user-defined functions, extracting the shared logic is usually the better first step.
:::

```solidity title="Example CashScript code"
contract Example(){
  function Main(){
    // logic applying to all if/else branches
    if(conditionFunction1){
       // logic function1
    } else if(conditionFunction2){
       // logic function2
    } else {
      // logic applying to function 3 & 4
      if(conditionFunction3){
        // logic function3
      } else {
        // logic function4
      }
    }
  }
}
```

## Advanced: Hand-optimizing Bytecode

You can still use the CashScript TypeScript SDK while using a hand-optimized or hand-written contract, although this is considered advanced functionality.

There's two ways to go about this, either you create a custom `Artifact` so you can still use the `Contract` class or you create a custom `Unlocker` to use in the transaction building directly.

### Note on Premature Optimizations

It's worth considering whether hand-optimizing the contract is necessary at all. If the contract works and there is no glaring inefficiency in the bytecode, perhaps the best optimization is to not to obsess prematurely about the transaction size with Bitcoin Cash's negligible fees.

>We should forget about small efficiencies, say about 97% of the time: premature optimization is the root of all evil. Yet we should not pass up our opportunities in that critical 3%.

### Optimizing with the BitauthIDE

When optimizing the bytecode of your contract to ensure it is the smallest possible bytesize you'll likely want to use the [BitauthIDE][BitauthIDE] so you can see the stack changes for each executed OpCode. Low-level understanding can also give good intuition about the [optimization tips](#optimization-tips) for the CashScript code.

### Method 1) Custom Artifact

To manually optimize a CashScript contract's bytecode, you need to overwrite the `bytecode` key of your contract artifact.

If you manually overwrite the `bytecode` in the artifact, the auto generated 2-way-mapping generated by the compiler becomes obsolete. You are no longer compiling high-level CashScript code into BCH script, instead you are writing BCH script by hand.
This causes the link of the BCH opcodes to your original CashScript code will be entirely lost for debugging.


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
You can create an `Artifact` for a fully hand-written contract so it becomes possible to use the contract with the nice features of the CashScript SDK! An example of this is the [unofficial Cauldron Swap SDK][Cauldron-Swap-SDK], which uses `Artifact bytecode` not produced by `cashc` at all but still uses the CashScript SDK.
:::

### Method 2) Custom Unlockers

In the [addInput() method][addInput()] on the TransactionBuilder you can provide a custom `Unlocker`

```ts
transactionBuilder.addInput(utxo: Utxo, unlocker: Unlocker, options?: InputOptions): this
```

the `Unlocker` interface is the following:

```ts
interface Unlocker {
  generateLockingBytecode: () => Uint8Array;
  generateUnlockingBytecode: (options: GenerateUnlockingBytecodeOptions) => Uint8Array;
}

interface GenerateUnlockingBytecodeOptions {
  transaction: Transaction;
  sourceOutputs: LibauthOutput[];
  inputIndex: number;
}
```


[BitauthIDE]: https://ide.bitauth.com
[Cauldron-Swap-SDK]: https://github.com/mr-zwets/Cauldron-Swap-SDK
[addInput()]: /docs/sdk/transaction-builder#addinput
