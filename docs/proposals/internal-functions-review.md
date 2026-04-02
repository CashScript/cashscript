# Internal Functions Review

## Scope

This note records review findings, design constraints, and follow-up ideas for the local `feature/functions-only` strategy.

It is intended as a future reference for:

- continuing the internal-function work
- evaluating import-based helper files on top of internal functions
- reviewing attack surfaces and spend-path risks introduced by BCH function support

The current strategy is:

- internal functions are compiled to BCH 2026 function frames using `OP_DEFINE` and `OP_INVOKE`
- public functions remain the contract ABI surface
- internal functions are meant to behave like reusable helper logic, not user-facing entrypoints

## Current Design Direction

### Internal functions

The current branch treats internal functions as helper bodies that can be invoked from public entrypoints or from other invoked functions.

Current safety checks already block several dangerous cases:

- recursive call graphs
- signature-check built-ins inside invoked functions
- direct contract-parameter capture inside invoked functions

This is a sound base.

### Future imported helper files

The intended direction for imported function files should stay narrow:

- imported files should act like utility/helper files
- imported files should not define spendable/user-facing contract entrypoints
- imported code should complement a main contract rather than behave like a second contract

This is conceptually similar to OpenZeppelin utility modules:

- shared helper logic
- no independent public spend surface
- explicit reuse from a main contract

The practical implication is:

- imported files should contribute only helper/internal functions
- imported files should not expose ABI/public functions
- imported files should not define independent contract spend paths
- imported files should eventually be modeled as `library`, not as ordinary spendable contracts

## Findings

### 1. Omitted visibility defaults to `public`

Severity: High

Relevant code:

- `packages/cashc/src/compiler.ts`
- `packages/cashc/test/compiler/compiler.test.ts`

The current preprocessing logic treats omitted visibility as `public` and only emits a warning.

That is much riskier now that helper functions exist. A developer who forgets to mark a helper as `internal` accidentally creates a new externally callable entrypoint.

Why this matters:

- the helper may bypass assumptions enforced only in the intended top-level function
- the helper may become a user-spend path even though it was written as support logic
- warnings are too weak for consensus-critical contract code

Current design decision:

- do not force an immediate explicit-visibility migration for all older contracts
- instead, use first-class `library` containers as the stronger boundary for imported helper files

Recommendation:

- keep this as a known hardening issue for normal contracts
- do not rely on omitted-visibility behavior for imported helper code
- consider a stricter compiler mode later for contracts that want explicit visibility guarantees

### 2. Nested-frame debugging is still incomplete for non-`require` failures

Severity: Medium

Relevant code:

- `packages/cashscript/src/debugging.ts`
- `packages/cashscript/src/Errors.ts`

The branch adds frame bytecode metadata and improves nested `require(...)` attribution, but unmatched evaluation failures still fall back to root-frame sourcemap lookup.

This means failures inside invoked frames that are not cleanly matched to a `require(...)` can still be reported against the wrong source location.

Examples to care about:

- introspection/indexing errors inside an invoked helper
- malformed split/slice behavior inside an invoked helper
- any VM failure path not tied back to a recorded `RequireStatement`

Recommendation:

- treat nested-frame evaluation errors as first-class debug cases
- add frame-aware source resolution rather than only frame-aware `require`/log matching
- add tests for internal helper failures that are not ordinary `require(...)` failures

### 3. Locking-script start detection in debugging is brittle

Severity: Medium

Relevant code:

- `packages/cashscript/src/debugging.ts`

The comments describe bytecode-based root-frame detection as the safe approach once nested function frames exist, but the current implementation still prefers the last `ip === 0 && controlStack.length === 0` match.

That is a brittle heuristic if nested frames can also satisfy that shape.

Why this matters:

- log slicing can start from the wrong frame
- error attribution can be anchored incorrectly
- correctness depends on current VM debug behavior rather than a stable discriminator

Recommendation:

- prefer bytecode/frame identity first
- keep the heuristic fallback only as a last resort
- add tests where nested invoked frames also begin at `ip === 0`

### 4. Public-to-public invocation duplicates function bodies

Severity: Medium

Relevant code:

- `packages/cashc/src/generation/GenerateTargetTraversal.ts`
- `packages/cashc/test/generation/generation.test.ts`

The current implementation emits invoked functions as `OP_DEFINE` frames while still inlining public ABI functions in the top-level dispatcher.

If a public function is called by another public function, its logic is effectively represented twice:

- once as a dispatch branch
- once as a function frame

Why this matters:

- larger bytecode
- higher risk of hitting policy/size/resource limits
- more surface for future debugging drift

Current design decision:

- public-to-public behavior is acceptable semantically
- the concern is implementation quality and efficiency, not the feature itself

Recommendation:

- preserve public-to-public semantics
- later compile public ABI wrappers that invoke a shared body if we want to remove duplication cleanly

## General Security Posture

### What already looks good

- `EnsureInvokedFunctionsSafeTraversal` blocks recursive helper graphs
- it blocks signature-check built-ins inside invoked functions
- it blocks contract-parameter capture inside invoked functions
- unreachable internal-only helpers are not emitted
- compiler target inference correctly detects `OP_DEFINE` / `OP_INVOKE` and requires BCH 2026 semantics

### What still needs hardening

- visibility mistakes should be made harder to miss in normal contracts
- nested-frame debugging should become frame-correct for all failure classes
- codegen should avoid duplicating public bodies where possible
- tests should cover more pathological/internal-frame error cases

## Suggested Rules For Imported Helper Files

If import-based helper files are built on top of this strategy, they should follow these restrictions:

- imported files may only contribute helper/internal functions
- imported files may not define public ABI entrypoints
- imported files may not define independent spend paths
- imported helper functions must satisfy the same safety checks as local invoked functions
- imported helper functions should be parameter-driven and context-closed
- imported helper functions should not capture contract constructor parameters
- imported helper functions should not contain signature-check built-ins
- imported helper files should eventually be represented by a non-spendable `library` container

This keeps imported files in the role of utility modules, not secondary contracts.

## Recommended Next Steps

1. Introduce first-class `library` semantics for imported helper code.
2. Add nested-frame failure tests for non-`require` VM errors.
3. Rework root-frame detection in debugging to prefer bytecode/frame identity.
4. Preserve public-to-public behavior, but reduce duplicated codegen later.
5. Keep imported files utility-only and non-spendable.
