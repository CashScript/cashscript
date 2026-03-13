---
title: BCH Internal Functions (beta)
---

CashScript supports user-defined internal function calls within a contract by compiling them to BCH function opcodes.

:::caution
This feature is currently in beta. The visibility syntax and some compilation details may still change in a future release.

CashScript function calls rely on BCH 2026 function semantics. Teams should only use this feature in environments that support `BCH_2026_05` behavior, and should configure testing/debugging providers accordingly.
:::

At the Script level, this feature is implemented using:

- `OP_DEFINE` to register a function body in the function table
- `OP_INVOKE` to execute a previously-defined function

This page documents how CashScript maps contract functions to that execution model.

## Overview

CashScript contract functions now serve two roles:

- public entrypoints, which appear in the artifact ABI and can be called from the SDK
- internal functions, which can be called by other CashScript functions but are hidden from the ABI

Public functions can also call other public functions. In that case, the called function remains in the ABI and is also compiled into the BCH function table if it is invoked internally.

Example:

```solidity
contract Example() {
    function spend(int x) public {
        require(isTen(x));
    }

    function isTen(int value) internal {
        require(value == 10);
    }
}
```

In this example:

- `spend()` is a public function
- `isTen()` is an internal function because it is declared `internal`

## Internal Functions

CashScript's execution model supports general internal functions. Visibility is expressed explicitly in function declarations.

For backward compatibility, omitted visibility currently still defaults to `public` and produces a compiler warning.

Internal functions:

- can be called by other functions in the same contract
- are excluded from the artifact ABI
- are not exposed as unlock methods in the TypeScript SDK

For example, `contract.unlock.isTen` will be unavailable even though `spend()` can still invoke `isTen()`.

CashScript also rejects user-defined function names that collide with built-in global function names like `sha256` or `checkSig`.

## Compilation Model

When a contract contains user-defined function calls:

1. CashScript computes the closure of all invoked functions.
2. Each function reachable from a public entrypoint through internal calls is compiled into its own bytecode fragment.
3. Those fragments are registered at the beginning of the script using `OP_DEFINE`.
4. When a function call appears in the contract body, CashScript emits `OP_INVOKE`.

Only functions reachable from public entrypoints are defined. Dead internal-only call chains are not added to the function table.

Public entrypoint dispatch remains separate from BCH function invocation:

- public functions are still selected using CashScript's normal ABI function selector logic
- internal user-defined calls use `OP_DEFINE` and `OP_INVOKE`

## Return Value Semantics

CashScript internal functions currently return a boolean success value.

That means user-defined function calls are most naturally used in boolean positions, for example:

```solidity
require(validateState(expectedHash));
```

Internally, CashScript compiles invoked function bodies so they leave a single boolean result on the stack.

## Constructor And Parameter Access

Invoked internal functions can safely access:

- their own parameters
- global built-in functions and transaction globals

They cannot reference constructor parameters. CashScript rejects this at compile time.

## ABI Behavior

Only public functions are written to the artifact ABI.

So for:

```solidity
contract Example() {
    function spend(int x) public {
        require(isTen(x));
    }

    function isTen(int value) internal {
        require(value == 10);
    }
}
```

the artifact ABI only contains:

```ts
[
  { name: 'spend', inputs: [{ name: 'x', type: 'int' }] }
]
```

## Current Limitations

There are currently several important restrictions:

- internally-invoked functions cannot use `checkSig()`, `checkMultiSig()`, or `checkDataSig()`
- internally-invoked functions cannot reference constructor parameters
- recursive or mutually-recursive user-defined function calls are rejected by the compiler

This restriction exists because signature coverage for invoked bytecode needs additional SDK/compiler metadata work.

For now, keep signature validation and constructor-parameter-dependent logic in public entrypoint functions, and use internal functions for shared logic that depends only on function arguments and other globals.

Artifacts using BCH function opcodes record at least `compiler.target: 'BCH_2026_05'`, and the compiler rejects lower explicit targets. The SDK validates this against provider VM target metadata during local testing/debugging.

For local testing with the SDK, configure your provider explicitly:

```ts
import { Contract, MockNetworkProvider, VmTarget } from 'cashscript';

const provider = new MockNetworkProvider({ vmTarget: VmTarget.BCH_2026_05 });
const contract = new Contract(artifact, [], { provider });
```

Nested `console.log` and `require(...)` statements inside invoked internal functions are included in CashScript's debug output, including the internal frame's source line and failing `require(...)` statement when available.

## Compiler Options

Function visibility is part of the source syntax, so no compiler option is required to decide whether a function is public or internal.

## When To Use This

This feature is most useful when:

- multiple public functions share the same logic
- you want cleaner contract structure without exposing every internal function in the ABI
- you want the compiler to emit reusable BCH function bodies via `OP_DEFINE`/`OP_INVOKE`

It is less useful when:

- the internal function performs signature checks
- the logic is only used once and inlining is simpler
