# Library Integration Plan

## Purpose

This document plans the next stage after `feature/functions-only`:

- keep BCH function opcodes as first-class compilation targets
- preserve backward compatibility for existing contracts as much as possible
- introduce a non-spendable helper container for reusable imported logic

The proposed helper container is `library`.

This plan is intentionally architecture-focused. It records:

- the design choices we are making
- what we are explicitly not doing
- where the compiler should enforce boundaries
- open questions and future gaps

## Design Goals

### Core goals

- preserve current contract semantics for older contracts where practical
- treat `OP_DEFINE` and `OP_INVOKE` as first-class compiler outputs rather than a side feature
- separate spendable entrypoints from helper-only function bodies
- make imported helper code reusable without letting it define its own spend surface
- keep imported code deterministic, auditable, and easy to reason about

### Non-goals for the first iteration

- building a package ecosystem
- supporting arbitrary multi-contract import graphs
- allowing imported files to act as standalone spendable contracts
- reproducing Solidity inheritance/module behavior broadly

## High-Level Model

### `contract`

A `contract` remains the normal spendable container.

It may contain:

- public entrypoint functions
- helper/internal functions

It remains the source of:

- constructor parameters
- ABI/public function surface
- top-level spend authorization paths

### `library`

A `library` is a non-spendable helper container.

It may contain:

- helper/internal functions only

It must not contain:

- public ABI entrypoints
- constructor parameters
- any independent spendable contract surface

The compiler should treat library functions as helper frames only, never as dispatcher-selectable entry frames.

## Why `library` Instead of Tightening Visibility Alone

We do not want to break older contracts too aggressively by requiring all existing contracts to adopt locally introduced `public` / `internal` labels immediately.

Using a first-class `library` container gives a stronger and cleaner boundary:

- old `contract` behavior can stay largely compatible
- imported helper files can still be strongly constrained
- the spendable vs non-spendable distinction is modeled at the container level, not only by function annotations

This fits the intended OpenZeppelin-like utility model better:

- shared helper modules
- no independent user spend surface
- explicit reuse from a main contract

## First-Class Opcode Strategy

The important architectural decision is:

- function opcodes are first-class execution primitives
- the compiler’s job is to map source-level function containers onto entry frames vs helper frames

Under this model:

- public contract functions become dispatcher-selectable entry frames
- helper/internal contract functions become helper frames
- library functions become helper frames only

This avoids treating helper imports as string flattening first and semantics second. The compiler should explicitly understand:

- which functions are entrypoints
- which functions are helper-only
- which containers are allowed to contribute entrypoints

## Proposed Semantic Rules

### Contract rules

Regular contracts:

- may define public entrypoints
- may define helper/internal functions
- may call their own helper functions
- may call imported library helper functions
- remain the only spendable top-level compilation units

Compatibility policy:

- existing omitted visibility behavior may remain for contracts if needed for backward compatibility
- helper/public distinction inside contracts can continue to evolve without forcing an immediate break on legacy code

### Library rules

Libraries:

- may define helper/internal functions only
- may not define public ABI functions
- may not define constructor parameters
- may not compile as standalone spendable artifacts
- may only be imported into a contract or another library if we choose to support transitive library imports

### Imported helper restrictions

Imported helper functions should satisfy the same safety constraints as local invoked functions, plus the container-level rules above.

That means imported helper functions must not:

- expose dispatcher-selectable/public entrypoints
- reference contract constructor parameters
- use signature-check built-ins
- create their own independent spend authorization paths

Important clarification:

Imported helper functions may still contain checks such as `require(...)`.

What is forbidden is not “having checks”.
What is forbidden is “being independently callable as a top-level spend surface”.

## Recommended Compiler Shape

### Phase 1: first-class `library` parsing

Add grammar support for a second top-level container:

- `contract`
- `library`

The AST should represent container kind explicitly rather than hiding library semantics in preprocessing.

Possible direction:

- `SourceFileNode` contains a top-level container node
- introduce `LibraryNode` alongside `ContractNode`
- or generalize into a shared container abstraction if that reads cleanly

### Phase 2: semantic container validation

Add a container-aware semantic pass that enforces:

- contracts may define entrypoints
- libraries may not define entrypoints
- libraries may not define constructor parameters
- libraries may only contain helper functions

This is where “imported helpers cannot make their own transaction” should be enforced semantically.

### Phase 3: entry-frame vs helper-frame lowering

Refactor code generation around two explicit categories:

- entry frames
- helper frames

Desired compiler behavior:

- contract public functions become entry frames
- contract helper functions become helper frames if reachable
- library functions become helper frames if reachable
- libraries never contribute dispatcher branches

This should keep opcode lowering consistent with the source model.

### Phase 4: import integration

Imports should become a mechanism for bringing library helper frames into a contract’s reachable helper graph.

For MVP:

- import only `library` files
- import resolution should remain deterministic and narrow
- imported library functions should merge into the reachable helper graph
- imported library functions should never alter ABI/public dispatch directly

## Import Strategy

### MVP import policy

Allowed:

- relative imports only
- imported `library` files only
- namespace-qualified library use if we want source clarity
- deterministic compile-time integration

Not allowed initially:

- package-manager style resolution
- remote imports
- importing `contract` files
- imported public entrypoints
- imported independent spend surfaces

### Syntax direction

The likely source-level direction is something like:

```cash
import "./math.cash" as Math;

contract Vault(pubkey owner) {
  function spend(sig s, int value) {
    require(Math.isPositiveEven(value));
  }
}
```

Imported file:

```cash
library Math {
  function isPositiveEven(int value) {
    require(isPositive(value));
    require(isEven(value));
  }

  function isPositive(int value) {
    require(value > 0);
  }

  function isEven(int value) {
    require(value % 2 == 0);
  }
}
```

The final choice on whether library functions need an explicit `internal` marker is still open. Since the container is already non-spendable, implicit helper-only semantics may be acceptable inside `library`.

## Backward Compatibility Choices

### What we want to preserve

- existing `contract` files should continue to compile where possible
- existing omission of `public` should not automatically break older sources if we can avoid it
- helper functions inside normal contracts should remain supported

### What we can tighten safely

- imported helper files should be subject to stricter rules than ordinary contracts
- `library` can be strict from day one because it is new surface area
- “no spendable entrypoints in libraries” should be a hard rule, not a warning

This gives us a compatibility-friendly path:

- legacy `contract` behavior remains mostly stable
- new `library` behavior is deliberately constrained

## Architectural Tradeoffs

### Preprocessing vs first-class AST support

The exploration branch used a preprocessing/flattening approach.

That is attractive for speed of implementation, but weaker architecturally because:

- spendable vs non-spendable semantics are implicit
- debugging and provenance become bolt-ons
- imports are resolved as source rewriting first rather than compiler semantics first

For this strategy, first-class container semantics are preferred.

### Visibility policy inside contracts

We do not currently want to require all old contracts to add explicit `public` / `internal`.

So the likely direction is:

- keep contract visibility behavior reasonably compatible
- rely on `library` to enforce strong imported-helper boundaries
- revisit stricter explicit visibility later if the safety tradeoff justifies it

### Public-to-public invocation

Current understanding:

- public-to-public behavior is not inherently wrong
- it matches the idea that one contract function may route into another function body

So this should not be treated as a semantic bug.

The remaining concern is implementation quality:

- avoid needless duplication of public bodies if a cleaner shared-body architecture is possible

## Security Boundaries To Enforce

### Spend-surface boundary

The most important rule:

- only contract entry frames may define top-level spend authorization paths

Libraries must not be able to create:

- ABI-visible entrypoints
- dispatcher branches
- standalone transaction authorization surfaces

### Context-capture boundary

Helper/library functions should remain reusable and context-closed.

They must not silently depend on:

- constructor parameters
- hidden contract-local authorization assumptions
- signature validation side effects

### Determinism boundary

Imports should remain deterministic.

We should avoid:

- flexible package resolution
- source drift across environments
- import systems that obscure what helper code was actually compiled

## Testing Plan

### Required tests for `library`

- library file with helper functions compiles only when imported into a contract
- library file cannot define a public spendable entrypoint
- library file cannot define constructor parameters
- imported library helper can be called from a contract
- imported library helper cannot capture contract constructor parameters
- imported library helper cannot use signature-check built-ins
- imported library helper graph rejects cycles

### Required tests for compiler architecture

- contract public functions become dispatcher entries
- contract helper functions do not become ABI entries
- library functions never become dispatcher entries
- imported library functions lower to helper frames only
- imported helper failures are reported with correct source attribution once debugging is extended

## Open Questions

### 1. Should library functions require explicit `internal`?

Options:

- yes, for symmetry with contracts
- no, because the container already guarantees helper-only semantics

Current leaning:

- do not require explicit `internal` inside `library` unless it materially simplifies the compiler

### 2. Should transitive library imports be allowed in v1?

Options:

- no, keep one-level imports only for simplicity
- yes, but only for relative local libraries with strict cycle rejection

Current leaning:

- start with one-level imports if implementation simplicity matters
- add transitive imports later if needed

### 3. How should source-level debugging work across libraries?

Current internal-function debugging already needs more frame-aware handling.
Library support increases that need further.

Open question:

- do we postpone full multi-file source fidelity until after semantic integration
- or do we require it before considering library support complete

Current leaning:

- semantic/container correctness first
- better multi-file/frame-aware debugging as a required follow-up before calling the feature mature

## Future Gaps

### 1. Nested-frame debugging

The current internal-function strategy still has known gaps around nested-frame failure attribution.

Library support should not ship as “complete” without improving:

- frame-aware root detection
- frame-aware evaluation error attribution
- file-aware source mapping if imports are supported

### 2. Shared-body codegen

If public-to-public calls remain supported, codegen should eventually avoid compiling the same public logic twice.

This is an optimization and architectural cleanliness task, not a semantic blocker.

### 3. Import provenance

If imports are introduced, artifact/debug metadata should eventually make it easy to answer:

- which library files were used
- which helper body a failure came from
- what exact source set produced the artifact

### 4. Formal container semantics

Right now the AST/grammar are contract-centric.

Library support likely deserves:

- explicit container kinds in the grammar
- explicit container nodes in the AST
- explicit semantic passes for entrypoint eligibility

## Recommended Implementation Order

1. Introduce first-class `library` grammar and AST support.
2. Add semantic validation that libraries are non-spendable helper containers.
3. Refactor codegen around entry frames vs helper frames.
4. Keep regular contract compatibility as intact as possible.
5. Add minimal deterministic library import support.
6. Improve debugging/provenance for nested frames and imported helpers.

## Summary

The recommended direction is:

- keep old `contract` behavior mostly compatible
- introduce `library` as a strict non-spendable helper container
- keep BCH function opcodes as first-class compiler targets
- model entry frames vs helper frames explicitly in the compiler
- ensure imported helper code can never define its own spend surface

This gives us a clean path from `functions-only` toward reusable helper modules without blurring the boundary between utility logic and spend authorization.
