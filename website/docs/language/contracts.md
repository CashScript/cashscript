---
title: Contract Structure
---

Contracts in CashScript are somewhat similar to classes in object-oriented languages. A notable difference is that there is no mutable state. So once a contract is instantiated with certain parameters, these values cannot change. Instead, functions can be called on the contract that act on the contract's values to spend money from the contract. The extension of CashScript source code files is `.cash`, and the structure of these source files is explained below.

## Pragma
A contract file may start with a pragma directive to indicate the CashScript version the contract was written for. This ensures that a contract is not compiled with an unsupported compiler version. The pragma directive follows regular [semantic versioning (SemVer)](https://semver.npmjs.com/) rules.

:::caution
Contract authors should be careful when allowing a range of versions to check that no breaking changes to the compiler were introduced in these versions which would result in different bytecode and smart contract address.
:::

#### Example
```solidity
pragma cashscript ^0.13.0;
pragma cashscript >= 0.7.0 < 0.9.3;
```

## Constructor
A CashScript constructor works slightly differently than what you might be used to in regular object-oriented languages. It is not possible to define any statements inside the constructor, as the constructor is only used to store values in the contract. Because of this limited nature, there is no separate `constructor` function, but instead the parameters are specified directly on the class definition.

#### Example
```solidity
pragma cashscript ^0.13.0;

contract HTLC(pubkey sender, pubkey recipient, int expiration, bytes32 hash) {
    ...
}
```

### Constructor Arguments

The constructor arguments are provided when initializing a specific instance of a smart contract. The provided constructor arguments are added to the start of the contract's script before the opcode logic. Because the constructor arguments are part of the full smart contract script, they are conceptually similar to hard-coded values in your contract logic. Constructor arguments are a way to create 'global variables' accessible from different functions inside your contract. Note that constructor arguments are variables and can be reassigned inside the contract functions.

:::info
The typings for the constructor arguments are only semantic and used when initializing the contract with the SDK. This means when not using the SDK you could still pass a different byte length item to `bytes32 hash`.
:::

:::note
Upon initialization of the contract, constructor parameters are encoded and added to the contract's bytecode in the reversed order of their declaration. This can be important when manually constructing the contract locking script for debugging or optimization purposes.
:::

## Functions
The main construct in a CashScript contract is the function. A contract can contain one or multiple functions that can be executed to trigger transactions that spend money from the contract. At its core, the result of a function is just a yes or no answer to the question 'Can money be sent out of this contract?'. However, by using 'covenants it's possible to specify additional conditions — like restricting *where* money can be sent. To learn more about covenants, refer to the [CashScript Covenants Guide](/docs/guides/covenants).

#### Example
```solidity
pragma cashscript ^0.13.0;

contract TransferWithTimeout(pubkey sender, pubkey recipient, int timeout) {
    function transfer(sig recipientSig) {
        ...
    }

    function timeout(sig senderSig) {
        ...
    }
}
```

### Internal Functions (beta)

CashScript functions can also call other functions in the same contract.

:::caution
User-defined internal functions are currently in beta. The visibility syntax and some implementation details may still change in a future release.

This feature depends on BCH 2026 function semantics. Artifacts for contracts using internal functions record `compiler.target: 'BCH_2026_05'`. When testing or integrating these contracts in apps, make sure your environment is configured for `BCH_2026_05`.
:::

Visibility is declared explicitly on the function definition:

- it can still be called from other contract functions
- it is not included in the compiled ABI
- it is therefore not exposed as an SDK unlock method

For backward compatibility, omitted visibility currently still defaults to `public` and produces a compiler warning.

This is useful for shared logic that should not appear as a public entrypoint.

```solidity
contract Vault(pubkey owner) {
    function spend(sig ownerSig, int value) public {
        require(checkSig(ownerSig, owner));
        require(isPositiveEven(value));
    }

    function isPositiveEven(int value) internal {
        require(value > 0);
        require(value % 2 == 0);
    }
}
```

These are general internal functions, not a separate "predicate-only" feature.

For details on how these internal functions compile to BCH `OP_DEFINE` and `OP_INVOKE`, see [BCH Internal Functions (beta)](/docs/compiler/bch-functions).

:::caution
Internally-invoked functions currently cannot use `checkSig()`, `checkMultiSig()`, or `checkDataSig()`, and they also cannot reference constructor parameters. Keep signature validation and constructor-parameter-dependent logic in public entrypoint functions for now.
:::

:::note
When testing contracts that use internal functions locally, configure your `MockNetworkProvider` for `BCH_2026_05` so local evaluation matches the artifact's required VM target.
:::

### Function Arguments

Function arguments are provided by the user in the unlocking script of the transaction inputs when spending from the contract. Note that function arguments are variables and can be reassigned inside the function body. User-defined function calls return a boolean value, so they are usually used inside `require(...)` statements.

Because the arguments are provided by the user when spending from the contract, these are 'untrusted arguments'. This means that these arguments can be crafted in a specific way by anyone to see if they can exploit the contract logic.

:::note
Function parameters are passed in the reversed order of their declaration. This can be important when debugging, optimizing or when creating transactions manually.
:::

In CashScript the types for the function arguments are **not** enforced automatically at the contract level. This can be especially relevant for types like `bool`, `bytesX` and other semantic bytes types. Instead this type information is only used by the SDK to check whether these arguments match the expected type during transaction building.

:::info
The typings for function arguments are enforced by default for boolean values and bounded bytes types such as `bytes20` and `bytes32`.
:::

## Statements
CashScript functions are made up of a collection of statements that determine whether money may be spent from the contract.

### require()
The most important statement of CashScript contracts is the `require` statement. This statement takes a boolean expression and checks that it evaluates to `true`. If it evaluates to `false` instead, the transaction fails. This statement is used to ensure that the requirements are met to spend money from the contract.

The `require` statement can also take an optional error message as a second argument. This can be used to provide more information about why the transaction failed when running the transaction in debug mode. You can read more about debugging in the [debugging guide](/docs/guides/debugging).

:::note
The error message in a `require` statement is only available in debug evaluation of a transaction, so the error message has no impact on the compiled bytecode or regular (non-debug) execution.
:::

#### Example
```solidity
pragma cashscript ^0.13.0;

contract P2PKH(bytes20 pkh) {
    function spend(pubkey pk, sig s) {
        require(hash160(pk) == pkh, "Public Key does not match");
        require(checkSig(s, pk));
    }
}
```

### Variable declaration
Variables can be declared by specifying their type and name. All variables need to be initialised at the time of their declaration, but can be reassigned later on — unless specifying the `constant` keyword. Since CashScript is strongly typed and has no type inference, it is not possible to use keywords such as `var` or `let` to declare variables.

:::note
CashScript disallows variable shadowing and unused variables.
:::

#### Example
```solidity
int myNumber = 3000;
string constant myString = 'Bitcoin Cash';
```

### Variable assignment
After their initial declaration, any variable can be reassigned later on. However, CashScript lacks any compound assignment operators such as `+=` or `-=`.

#### Example
```solidity
i = i + 1;
hashedValue = sha256(hashedValue);
myString = 'Cash';
```

### If statements
If and if-else statements follow usual semantics known from languages like C or JavaScript. If the condition within the `if` statement evaluates to `true`, the block of code within the `if` statement is executed. If the condition evaluates to `false`, the block of code within the optional `else` statement is executed.

:::note
There is no implicit type conversion from non-boolean to boolean types. So `if (1) { ... }` is not valid CashScript and should instead be written as `if (bool(1)) { ... }`
:::

#### Example
```solidity
pragma cashscript ^0.13.0;

contract OneOfTwo(bytes20 pkh1, bytes32 hash1, bytes20 pkh2, bytes32 hash2) {
    function spend(pubkey pk, sig s, bytes message) {
        require(checkSig(s, pk));
        bytes20 pkh = hash160(pk);

        if (pkh == pkh1) {
            require(sha256(message) == hash1);
        } else if (pkh == pkh2) {
            require(sha256(message) == hash2);
        } else {
            require(false); // fail
        }
    }
}
```

### Loops (beta)

Currently, CashScript supports `for`, `while` and `do-while` loops in the `0.13.0-next` pre-release.

:::caution
Loops in CashScript are currently in beta and may not fully behave as expected with debugging and console.log statements. The syntax for loops may change in the future.
:::

#### for loop

For loops are the main loop construct in CashScript and has a similar syntax to languages like JavaScript or C. The loop header consists of three parts: the initialization, the condition and the update. The initialization is executed only once before the loop starts. The condition is checked before each iteration of the loop. The update is executed after each iteration of the loop.

#### Example
```solidity
pragma cashscript ^0.13.0;

contract NoTokensAllowed() {
    function spend() {
        int inputIndex = 0;

        // Loop over all inputs (variable length), and make sure that none of them contain tokens
        for (int inputIndex = 0; inputIndex < tx.inputs.length; inputIndex = inputIndex + 1) {
            require(tx.inputs[inputIndex].tokenCategory == 0x);
        }
    }
}
```

#### while loop

While loops are similar to for loops, but the initialization and update are not specified, so it it loops as long as the condition is true. The condition is checked *before* each iteration of the loop (unlike do-while loops).

#### Example
```solidity
pragma cashscript ^0.13.0;

contract NoTokensAllowed() {
    function spend() {
        int inputIndex = 0;

        // Loop over all inputs (variable length), and make sure that none of them contain tokens
        while (inputIndex < tx.inputs.length) {
            require(tx.inputs[inputIndex].tokenCategory == 0x);
            inputIndex = inputIndex + 1;
        }
    }
}
```

#### do-while loop

Do-while loops are similar to while loops, but the condition is checked *after* the block of code within the loop is executed. This means that the block of code within the loop will be executed at least once, even if the condition is initially `false`.

#### Example
```solidity
pragma cashscript ^0.13.0;

contract NoTokensAllowed() {
    function spend() {
        int inputIndex = 0;

        // Loop over all inputs (variable length), and make sure that none of them contain tokens
        do {
            require(tx.inputs[inputIndex].tokenCategory == 0x);
            inputIndex = inputIndex + 1;
        } while (inputIndex < tx.inputs.length);
    }
}
```

### console.log()
The `console.log` statement can be used to log values during debug evaluation of a transaction. Any variables or primitive values (such as ints, strings, bytes, etc) can be logged. You can read more about debugging in the [debugging guide](/docs/guides/debugging).

:::note
Logging is only available in debug evaluation of a transaction, but has no impact on the compiled bytecode or regular (non-debug) execution.
:::

#### Example
```solidity
pragma cashscript ^0.13.0;

contract P2PKH(bytes20 pkh) {
    function spend(pubkey pk, sig s) {
        bytes20 hashedPk = hash160(pk);

        // console.log can access any variable in the function scope
        console.log("passed public key: ", pk, ", hashed: ", hashedPk);
        console.log("expected pkh: ", pkh);

        require(hashedPk == pkh);
        require(checkSig(s, pk));
    }
}
```

## Scope

CashScript uses nested scopes for parameters, variables, user-defined functions and global functions. There cannot be two identical names within the same scope or within a nested scope.

There are the following scopes in the nesting order:

- **Global scope** - contains global functions and global variables (e.g. `sha256`, `hash160`, `checkSig`, etc.)
- **Contract scope** - contains contract parameters and user-defined function names
- **Function scope** - contains function parameters and local variables
- **Local scope** - contains local variables introduced by control flow blocks (e.g. `if`, `else`)

#### Example
```solidity
// Global scope (contains global functions and global variables like sha256, hash160, checkSig, etc.)

// Contract scope (contains contract parameters and function names)
contract TransferWithTimeout(
    pubkey sender,
    pubkey recipient,
    int timeout
) {
    // Function scope (contains function parameters - recipientSig)
    function transfer(sig recipientSig) {
        require(checkSig(recipientSig, recipient));
    }

    // Function scope (contains function parameters - senderSig)
    function timeout(sig senderSig) {
        require(checkSig(senderSig, sender));

        // Local scope (contains local variable - newTimeout)
        // This is just an example local scope, not a real contract
        if (timeout > 100_000) {
            int newTimeout = 100_000;
            require(tx.time >= newTimeout);
        } else {
            require(tx.time >= timeout);
        }

        // After the local scope, 'newTimeout' is no longer accessible
    }
}

```

## Comments
Comments can be added anywhere in the contract file. Comment semantics are similar to languages like JavaScript or C. This means that single-line comments can be added with `// ...`, while multiline comments can be added with `/* ... */`.

#### Example
```solidity
// This is a single-line comment.

/*
This is a
multi-line comment.
*/
```
