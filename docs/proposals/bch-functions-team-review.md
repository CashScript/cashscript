# BCH Functions Proposal Review

This document summarizes the current working-tree patch on top of `next`. It is intended as a maintainer-facing review aid for the CashScript team.

The goal of this patch is to add safe user-defined internal functions to CashScript using BCH `OP_DEFINE` / `OP_INVOKE`, while keeping the language model understandable for developers and conservative enough for real integrations.

## Scope

This patch adds:

- explicit function visibility syntax: `public` and `internal`
- user-defined contract-function calls compiled to BCH function opcodes
- ABI filtering so only `public` functions are externally callable
- reachability-based function-table emission from public entrypoints
- compiler restrictions for patterns the current model does not safely support
- artifact/debug/runtime metadata updates needed for BCH 2026 function semantics
- expanded compiler, SDK, debugging, testing-suite, and documentation coverage

This patch intentionally does not add:

- signature checks inside internally invoked functions
- constructor-parameter capture inside internally invoked functions
- recursion or mutual recursion in invoked function graphs
- mandatory explicit visibility on all functions yet
- arbitrary typed internal return values beyond the current boolean-style model

## High-Level Model

CashScript functions now have two roles:

- `public`: appears in the artifact ABI and is exposed by the SDK
- `internal`: callable only from other contract functions and lowered to BCH function opcodes

If visibility is omitted, the compiler currently defaults to `public` and emits a warning. That keeps existing contracts source-compatible while nudging authors toward explicit visibility.

Public functions may also call other public functions. In that case, the called function remains in the ABI and is also emitted into the BCH function table if it is invoked internally.

## Why This Approach

The BCH functions CHIP makes internal code reuse possible at the script level, but CashScript and the SDK previously assumed:

- ABI functions are the externally visible boundary
- most execution/debug reasoning happens within a single active bytecode body
- visibility is not yet enforced as a mandatory source-level concept

So the patch takes a conservative path:

1. Make visibility explicit instead of relying on naming conventions.
2. Keep omitted visibility backward-compatible for now.
3. Compile only the subset we can model safely today.
4. Reject unsupported patterns at compile time rather than risk silent miscompilation.
5. Carry enough artifact/runtime/debug metadata to make BCH-function contracts inspectable and testable.

## Language And Compiler Model

### Visibility

Examples:

```solidity
contract Example() {
    function spend(int x) public {
        require(validate(x));
    }

    function validate(int value) internal {
        require(value == 7);
    }
}
```

Effects:

- `public` functions remain ABI entrypoints
- `internal` functions are hidden from the ABI
- internal/public classification no longer depends on prefixes or suffixes

### Reachability

The compiler computes the invoked-function closure starting from public entrypoints only.

That means:

- reachable internal/public invocations are compiled into the BCH function table
- dead internal-only call chains are ignored
- helper reachability is anchored to real external entrypoints, not arbitrary dead call edges

### Code generation

Lowering works like this:

1. Public ABI dispatch stays on the existing CashScript path.
2. Reachable invoked functions are compiled into separate bytecode fragments.
3. Those fragments are registered using `OP_DEFINE`.
4. User-defined calls emit the function index plus `OP_INVOKE`.

## Safety Boundaries

The implementation intentionally rejects patterns that are not sound under the current execution/signing/debug model.

### Disallowed in internally invoked functions

- `checkSig()`
- `checkMultiSig()`
- `checkDataSig()`
- references to constructor parameters
- direct recursion
- mutual recursion

### Why those restrictions exist

These are conservative safety/tooling restrictions, not BCH opcode impossibilities.

- Signature operations are blocked because nested invocation frames complicate signing/debug/template attribution, and the current SDK/compiler pipeline should not claim stronger guarantees than it can model.
- Constructor-parameter capture is blocked because it creates closure-like hidden dependencies on outer contract state, which is easy to misunderstand and harder to audit safely.
- Recursion is blocked because the current function-table model is intentionally acyclic and bounded.

The design principle is straightforward: if the compiler cannot prove the lowering is safe and predictable, it rejects the pattern.

## Artifact, Target, And SDK Integration

### Artifact behavior

Artifacts now:

- include only `public` functions in the ABI
- record BCH-function contracts with `compiler.target` at least `BCH_2026_05`
- reject explicit lower targets when function opcodes are required
- still allow explicit `BCH_SPEC`

This prevents artifacts from claiming an older VM target while containing BCH 2026 function opcodes.

### SDK/runtime behavior

The SDK validates target compatibility against provider VM-target metadata and continues to expose only public ABI methods.

This means:

- internal functions are not available as unlock methods
- BCH-function artifacts fail fast if paired with incompatible provider expectations
- mixed-target local testing is harder to misconfigure silently

## Debugging And Tooling

Nested invoked-function debugging is materially better than the initial branch state.

The current patch adds:

- frame-aware debug metadata on logs, stack items, and require statements
- frame-aware matching in SDK debug decoding
- better root-locking-script slicing when nested invoked frames are present
- fallback attribution for nested internal-function require failures
- explicit source locations for require statements

Practically, this means `console.log` and failing `require(...)` inside internally invoked functions can now be surfaced with the internal frame’s source line and statement, rather than collapsing everything onto the public wrapper.

## Return-Value Semantics

Internal functions are currently modeled as boolean-style reusable subroutines.

In practice:

- user-defined calls are used naturally in boolean positions like `require(validate(x));`
- invoked functions currently compile to leave a single success value on the stack

So this is “general internal functions” in visibility/reuse terms, but not yet a full arbitrary typed-return function system.

## Tests And Validation

Coverage was expanded in several layers.

### Compiler / parser / codegen

- explicit `public` / `internal` parsing
- comments/newlines around visibility
- no more underscore-based visibility inference
- omitted-visibility warning behavior
- ABI filtering for internal functions
- reachability-based `OP_DEFINE` emission
- rejection of pre-2026 explicit targets for BCH-function contracts
- debug metadata coverage for frame bytecode and require locations

### SDK / runtime / debugging

- internal-function contracts execute under `BCH_2026_05`
- nested internal call chains work across public entrypoints
- zero-argument invoked functions work
- public-to-public internal invocation preserves ABI visibility
- nested internal logs are attributed to the internal source line
- nested internal require failures are attributed to the internal failing statement

### Example project coverage

The testing-suite example now includes a dedicated internal-functions contract and test. Existing generic example contracts were intentionally left in their original form so this patch stays scoped to the new functions feature rather than rewriting the broader examples set before acceptance.

### Validation run status

The working tree has been validated with:

- `cd packages/utils && yarn run build`
- `cd packages/cashc && yarn run build`
- `cd packages/cashscript && yarn run build`
- `yarn vitest run packages/cashc/test/compiler/compiler.test.ts`
- `cd packages/cashc && yarn vitest run test/generation/generation.test.ts`
- `yarn vitest run packages/cashc/test/ast/AST.test.ts`
- `yarn vitest run packages/cashscript/test/debugging.test.ts`
- `yarn vitest run packages/cashscript/test/Contract.test.ts`
- `cd examples/testing-suite && yarn test`

## Documentation And DX Changes

Docs were updated to reflect the current branch rather than the earlier helper-naming model.

The user-facing story is now:

- explicit `public` / `internal`
- omitted visibility remains backward-compatible but warns
- BCH 2026 is required for function-opcode contracts
- internal-function restrictions are documented explicitly

Functions-specific examples and happy-path fixtures were updated to use explicit visibility where helpful, while older generic example contracts were intentionally left alone to keep branch scope tight.

## Remaining Tradeoffs And Caveats

This patch looks production-ready enough for maintainer review, but there are still some intentional transitional choices:

- omitted visibility still defaults to `public`
- omitted-visibility warnings are transitional rather than the final UX
- some older compiler error fixtures still trigger warnings because they intentionally preserve legacy-style source
- visibility parsing still uses compiler preprocessing rather than being grammar-native

These are mostly rollout and ergonomics concerns, not correctness/safety blockers.

## Review Focus

The highest-value maintainer questions are:

1. Is explicit visibility the right language direction versus naming conventions?
2. Are the current internal-function restrictions conservative enough for merge?
3. Is the BCH 2026 target enforcement strict enough and correctly placed?
4. Is the boolean-style internal return model acceptable for this iteration?
5. Is the preprocessing-based visibility parser acceptable for now, or should grammar-native syntax be required before merge?

## Bottom Line

The patch is now much stronger than the earlier helper-function branch state:

- visibility is explicit
- ABI boundaries are coherent
- reachability is correct
- target metadata cannot lie
- nested debug attribution is materially improved
- examples/tests/docs are aligned with the intended design

The remaining concerns are mostly about rollout polish and syntax implementation strategy, not about core semantic safety.
