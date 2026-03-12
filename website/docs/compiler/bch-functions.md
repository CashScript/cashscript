---
title: BCH Functions (beta)
---

CashScript supports user-defined function calls within a contract by compiling them to BCH function opcodes.

:::caution
This feature is currently in beta. The helper-function naming convention and some compilation details may still change in a future release.

CashScript function calls rely on BCH 2026 function semantics. Teams should only use this feature in environments that support `BCH_2026_05` behavior, and should configure testing/debugging providers accordingly.
:::

At the Script level, this feature is implemented using:

- `OP_DEFINE` to register a function body in the function table
- `OP_INVOKE` to execute a previously-defined function

This page documents how CashScript maps contract functions to that execution model.

## Overview

CashScript contract functions now serve two roles:

- public entrypoints, which appear in the artifact ABI and can be called from the SDK
- internal helpers, which can be called by other CashScript functions but are hidden from the ABI

Public functions can also call other public functions. In that case, the called function remains in the ABI and is also compiled into the BCH function table if it is invoked internally.

Example:

```solidity
contract Example() {
    function spend(int x) {
        require(isTen_(x));
    }

    function isTen_(int value) {
        require(value == 10);
    }
}
```

In this example:

- `spend()` is a public function
- `isTen_()` is an internal helper because its name ends with `_`

## Internal Helpers

By default, CashScript treats functions whose names end with `_` as internal helpers.

Internal helpers:

- can be called by other functions in the same contract
- are excluded from the artifact ABI
- are not exposed as unlock methods in the TypeScript SDK

For example, `contract.unlock.isTen_` will be unavailable even though `spend()` can still invoke `isTen_()`.

CashScript also rejects user-defined function names that collide with built-in global function names like `sha256` or `checkSig`.

## Compilation Model

When a contract contains user-defined function calls:

1. CashScript computes the closure of all invoked functions.
2. Each reachable called function is compiled into its own bytecode fragment.
3. Those fragments are registered at the beginning of the script using `OP_DEFINE`.
4. When a function call appears in the contract body, CashScript emits `OP_INVOKE`.

Only reachable called functions are defined. Unused helper functions are not added to the function table.

Public entrypoint dispatch remains separate from BCH function invocation:

- public functions are still selected using CashScript's normal ABI function selector logic
- internal user-defined calls use `OP_DEFINE` and `OP_INVOKE`

## Return Value Semantics

CashScript functions conceptually return a boolean success value.

That means user-defined function calls are most naturally used in boolean positions, for example:

```solidity
require(validateState_(expectedHash));
```

Internally, CashScript compiles function bodies so that invoked functions leave a single boolean result on the stack.

## Constructor And Parameter Access

Invoked helper functions can safely access:

- their own parameters
- global built-in functions and transaction globals

They cannot reference constructor parameters. CashScript rejects this at compile time.

## ABI Behavior

Only public functions are written to the artifact ABI.

So for:

```solidity
contract Example() {
    function spend(int x) {
        require(isTen_(x));
    }

    function isTen_(int value) {
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

There is currently one important restriction:

- internally-invoked functions cannot use `checkSig()`, `checkMultiSig()`, or `checkDataSig()`
- internally-invoked functions cannot reference constructor parameters
- recursive or mutually-recursive user-defined function calls are rejected by the compiler

This restriction exists because signature coverage for invoked bytecode needs additional SDK/compiler metadata work.

For now, keep signature validation and constructor-parameter-dependent logic in public entrypoint functions, and use invoked helpers for shared logic that depends only on helper arguments and other globals.

Artifacts for helper-function contracts record `compiler.target: 'BCH_2026_05'`, and the SDK validates this against provider VM target metadata during local testing/debugging.

For local testing with the SDK, configure your provider explicitly:

```ts
import { Contract, MockNetworkProvider, VmTarget } from 'cashscript';

const provider = new MockNetworkProvider({ vmTarget: VmTarget.BCH_2026_05 });
const contract = new Contract(artifact, [], { provider });
```

:::note
Runtime execution of helper functions is covered by the SDK tests, but debug attribution for `console.log` and `require(...)` inside invoked helper frames is still less precise than for top-level public functions. Teams should currently treat nested-helper debugging output as best-effort.
:::

## Compiler Options

If needed, the internal helper naming convention can be customized with `internalFunctionPrefix`:

```ts
interface CompilerOptions {
  enforceFunctionParameterTypes?: boolean;
  internalFunctionPrefix?: string;
}
```

If `internalFunctionPrefix` is set, it overrides the default helper detection rule and marks functions as internal based on that prefix.

## When To Use This

This feature is most useful when:

- multiple public functions share the same validation logic
- you want cleaner contract structure without exposing every helper in the ABI
- you want the compiler to emit reusable BCH function bodies via `OP_DEFINE`/`OP_INVOKE`

It is less useful when:

- the helper performs signature checks
- the logic is only used once and inlining is simpler
