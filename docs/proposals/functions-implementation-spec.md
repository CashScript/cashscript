# BCH Functions Implementation Spec

## Purpose

This document describes the current implementation of BCH function support on top of the current `next` branch.

It is written as an implementation/spec handoff for maintainers who want to review:

- source-level language semantics
- compiler lowering strategy
- helper import behavior
- debug/runtime metadata behavior
- safety boundaries and explicit non-goals

This document describes the implementation as it exists in the branch, not just an aspirational plan.

## Scope

Relative to current `next`, the implementation adds:

- explicit function visibility inside `contract`: `public` and `internal`
- first-class lowering of helper functions to BCH `OP_DEFINE` / `OP_INVOKE`
- `library` as a first-class non-spendable top-level container
- support for local helper functions and imported helper functions
- transitive `contract -> library -> library` imports
- helper-aware debug metadata and nested-frame attribution in the SDK

The implementation intentionally does not add:

- standalone spendable imported modules
- imports of `contract` files
- recursive helper call graphs
- signature-check builtins inside internally invoked helpers
- contract-constructor capture inside helper functions

## Source-Level Model

### `contract`

A `contract` is the spendable top-level unit.

A contract may contain:

- `public` functions
- `internal` functions

`public` functions:

- appear in the ABI
- are exposed through the SDK as unlock methods
- act as external spend entrypoints

`internal` functions:

- do not appear in the ABI
- are not directly exposed as unlock methods
- are compiled as helper frames and may be invoked from other functions

Inside a `contract`, omitted visibility is still accepted and treated as `public`.

### `library`

A `library` is a non-spendable top-level unit.

A library:

- cannot declare constructor parameters
- cannot compile to a spendable artifact
- cannot define public entrypoints
- may only define `internal` helper functions

This is the main container-level guardrail that prevents imported helper files from becoming independent spend surfaces.

## Import Model

### Allowed forms

Supported forms are:

- `contract -> library`
- `library -> library`

Imports are:

- compile-time only
- relative-path only
- namespace-qualified at source level

Example:

```cash
import "./math.cash" as Math;

contract Vault() {
  function spend(int value) public {
    require(Math.isEven(value));
  }
}
```

Imported library:

```cash
library MathHelpers {
  function isEven(int value) internal {
    require(value % 2 == 0);
  }
}
```

### Forbidden forms

The compiler rejects:

- importing a `contract`
- importing a library with `public` functions
- duplicate aliases at the same scope
- circular transitive library imports
- namespaced external helper references from inside a library
- library references to non-library local functions

### Canonicalization strategy

Transitive libraries are canonicalized by resolved file identity rather than duplicated per alias path.

This matters for diamond graphs and shared leaves:

- the same resolved library file is compiled once
- helper names are mangled from canonical library identity, not alias-path repetition
- shared leaves are not duplicated just because they are reachable from multiple branches

That decision was made to avoid hidden bytecode/opcount inflation in reusable helper graphs.

## Compiler Model

### Entrypoints vs helper frames

The compiler distinguishes between:

- public dispatcher entrypoints
- helper frames

Helper frames may come from:

- local `internal` functions
- local `public` functions that are also invoked internally
- imported library `internal` functions

### Reachability

Reachability is computed from public entrypoints.

This means:

- unreachable internal-only call chains are not emitted
- unreachable imported helper chains are not emitted
- the BCH function table is driven by actual entrypoint reachability rather than by all syntactically declared helpers

### Lowering

Reachable helper functions are compiled to separate bytecode fragments and emitted with:

- `OP_DEFINE`
- `OP_INVOKE`

Public dispatcher flow remains on the normal ABI dispatch path.

Invoked public functions reuse the same helper-frame body rather than duplicating a second compiled body just for internal invocation.

### VM target enforcement

If helper opcodes are required, the compiler:

- upgrades inferred target requirements to at least `BCH_2026_05`
- rejects explicitly lower targets
- still permits `BCH_SPEC`

This prevents artifacts from claiming an older VM target while containing BCH function opcodes. That enforcement is part of the functions delta, not baseline `next` behavior.

## Safety Restrictions

### Helper-function restrictions

The implementation intentionally rejects:

- direct recursion
- mutual recursion
- signature-check builtins inside internally invoked functions
- direct constructor-parameter capture inside helper functions

These are conservative restrictions introduced by the functions implementation because the current compiler/runtime/debugging model can defend these boundaries cleanly.

### Why these restrictions exist

The guiding rule is:

- if the compiler/runtime cannot model a helper pattern safely and inspectably, it should reject it rather than guess

Specific reasons:

- recursion complicates bounded codegen and debug semantics
- signature-check builtins in nested helper frames complicate signing and runtime attribution
- constructor capture makes helper behavior less explicit and less auditable

## Debugging And Artifact Model

### Frame-aware metadata

Artifacts now carry richer debug metadata for helper-aware execution.

The implementation includes:

- root-frame debug metadata
- helper frame metadata in `debug.frames`
- per-log frame metadata
- per-stack-item frame metadata
- per-require frame metadata
- source provenance for imported helper frames

Developer-facing debug output prefers readable source basenames, while internal metadata keeps full path provenance where available.

### Frame identity

Helper frames are identified by explicit frame ids plus frame bytecode.

The implementation also includes a compiler safeguard:

- if two distinct helper functions would compile to identical helper bytecode, compilation fails

That guard exists because runtime frame attribution is unsafe if two helper frames are bytecode-identical.

### Nested failure attribution

The SDK now resolves helper logs and helper failures against the active frame.

Implemented behavior:

- internal helper logs resolve to the helper source line
- helper `require(...)` failures resolve to the helper source line and statement
- nested non-`require` helper failures resolve as evaluation failures, not as guessed require failures
- final verify failures caused by a nested helper final `require(...)` are attributed back to that helper require when this can be proven safely

The important audit constraint is:

- the SDK should not speculate broadly about require attribution
- it should only attribute a nested require when there is a safe frame-local match

## Important Edge Cases Covered

The branch includes coverage for:

- local internal helpers reachable from public functions
- unreachable helper chains not being emitted
- public-to-public invocation while preserving ABI exposure
- shared helper-frame reuse for invoked public functions
- imported library helpers lowering to BCH function opcodes
- transitive imports
- shared-leaf canonicalization in diamond-style graphs
- overlapping helper names across imported libraries
- internal helper logs
- internal helper require failures
- nested non-require helper failures not being misattributed to earlier require statements
- ambiguous identical helper bytecode rejection

## Behavior That Is Intentionally Transitional

For `library`, the implementation is strict:

- explicit `internal` is required
- `public` is rejected

## Reviewer Checklist

The highest-value review questions for the main CashScript team are:

1. Is `contract` + `library` the right long-term source model?
2. Are the current helper restrictions conservative enough for merge?
3. Is explicit `internal` in `library` the right strictness level?
4. Is canonicalization by resolved library identity the right import strategy?
5. Is the helper debug model sufficiently explicit and stable for external users?
6. Is the current `contract` visibility behavior acceptable for the first functions release line?

## Bottom Line

The current implementation treats BCH function opcodes as first-class compiler/runtime behavior rather than an afterthought.

The central semantics are:

- spend surface belongs to `contract`
- reusable helper surface belongs to `internal` functions
- imported helper code belongs to `library`
- helper execution is unified whether the helper is local or imported
- imported libraries cannot become independent spend paths

That is the design this branch implements and the basis on which it should be reviewed.
