# BCH Functions Security And Release Review

## Purpose

This document records the security posture, review findings addressed in the branch, and the production-readiness checks that were used to harden the BCH functions implementation.

It is intended for maintainers doing scrutiny before merge or release.

## Threat Model

The implementation was reviewed against these failure classes:

- accidental creation of new spend paths
- imported helpers behaving like independent contracts
- helper-frame debugging ambiguity
- wrong source attribution for nested helper failures
- hidden bytecode growth from transitive imports
- helper-name collisions across import graphs
- dead helper code being emitted unnecessarily

## Main Guardrails

### Spend-surface guardrails

Implemented constraints:

- only `contract` is spendable
- `library` cannot compile as an artifact
- `library` cannot declare constructor parameters
- `library` cannot expose `public` functions
- imported `contract` files are rejected

These are the primary protections against imported helpers becoming independent authorization surfaces.

### Helper-safety guardrails

Implemented constraints:

- helper functions cannot recurse
- helper functions cannot mutually recurse
- helper functions cannot use signature-check builtins
- helper functions cannot capture contract constructor parameters

These are conservative restrictions intended to keep helper execution explicit and auditable.

### Debugging-integrity guardrails

Implemented protections:

- helper frames carry explicit frame ids and frame bytecode
- compiler rejects contracts whose helper frames would be bytecode-identical
- nested helper logs and helper requires resolve against helper-frame metadata
- nested non-require failures are not broadly guessed as require failures

This matters because ambiguous debugging in covenant tooling is not just a DX issue; it can hide real behavioral faults during review.

## Audit Findings Addressed

### 1. Ambiguous helper-frame identity

Original concern:

- helper-frame identity was too dependent on frame bytecode
- two different helpers with identical bytecode could cause incorrect log/error attribution

Resolution:

- helper debug metadata now includes explicit frame ids
- runtime matching uses helper-frame metadata
- compiler rejects helper-frame bytecode collisions across distinct helpers

Result:

- helper attribution is no longer allowed to proceed in an ambiguous bytecode-collision state

### 2. Shared transitive-library duplication

Original concern:

- the same imported shared leaf could be duplicated per import path
- that would inflate bytecode and opcount unexpectedly in diamond graphs

Resolution:

- transitive libraries are canonicalized by resolved file identity
- shared leaves are compiled once and reused

Result:

- reusable helper graphs do not silently grow script size just because they are reached through more than one alias path

### 3. Misattribution of nested non-require failures

Original concern:

- nested helper failures could be misreported as if an earlier helper `require(...)` failed

Resolution:

- speculative broad fallback was removed
- nested helper final-verify attribution now only maps to a helper require when that mapping can be made safely
- explicit regression coverage now checks that a later non-require helper failure is not blamed on an earlier helper require

Result:

- nested failure reporting is more honest and safer for auditing

## Adversarial Cases Covered

The branch now includes targeted coverage for failure-oriented cases, not only happy paths.

### Import graph adversarial cases

- duplicate top-level aliases rejected
- duplicate helper names across imported libraries supported safely
- circular transitive imports rejected
- shared-leaf transitive libraries canonicalized
- imported namespaced external helper references rejected
- imported references to non-library local functions rejected

### Helper execution adversarial cases

- unreachable helper chains not emitted
- ambiguous identical helper bytecode rejected at compile time
- internal helper logs attributed to helper source line
- internal helper require failures attributed to helper source line and statement
- nested non-require helper failures stay evaluation failures

### Container and visibility adversarial cases

- omitted library visibility is rejected
- public functions inside a library are rejected
- imported contracts are rejected

## Residual Tradeoffs

These are not open bugs in the branch, but they are still design choices worth explicit maintainer review.

### Explicit `internal` in `library`

Current behavior:

- `library` functions must explicitly declare `internal`

Tradeoff:

- stricter and clearer for review
- slightly more verbose than treating `library` as implicitly helper-only

### Helper restrictions

Current behavior:

- helper restrictions are intentionally conservative

Tradeoff:

- safer for release
- narrower than everything BCH opcodes could theoretically support

## Production-Readiness Verification

The branch was validated with:

- full root `yarn test`
- full root `yarn build`
- full root `yarn lint`

It was also hardened with focused suites around:

- compiler semantics
- generation
- AST/source round-tripping
- helper-aware debugging

## Recommended Maintainer Review Focus

If the main CashScript team wants to review this efficiently, the highest-value areas are:

1. `packages/cashc/src/compiler.ts`
2. `packages/cashc/src/imports.ts`
3. `packages/cashc/src/generation/GenerateTargetTraversal.ts`
4. `packages/cashscript/src/debugging.ts`
5. `packages/cashscript/src/Errors.ts`
6. `packages/utils/src/artifact.ts`
7. `packages/cashscript/test/fixture/debugging/debugging_contracts.ts`

And the highest-value tests to inspect are:

1. `packages/cashc/test/compiler/compiler.test.ts`
2. `packages/cashc/test/generation/generation.test.ts`
3. `packages/cashscript/test/debugging.test.ts`

## Bottom Line

This branch is not just a feature spike anymore.

It has:

- a defined spend-surface model
- explicit imported-helper constraints
- canonical transitive imports
- nested helper-aware debugging
- adversarial tests aimed at ways to break helper attribution and helper import safety

That is the implementation state maintainers should review.
