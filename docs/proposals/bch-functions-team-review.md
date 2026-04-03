# BCH Functions Team Review

This directory now contains the maintainer review packet for the BCH functions work.

Recommended reading order:

1. [functions-vs-next-review.md](./functions-vs-next-review.md)
2. [functions-implementation-spec.md](./functions-implementation-spec.md)
3. [functions-security-and-release-review.md](./functions-security-and-release-review.md)

Historical/internal notes remain available if needed:

- [library-integration-plan.md](./library-integration-plan.md)
- [internal-functions-review.md](./internal-functions-review.md)

## What This Packet Covers

The current branch implements:

- `public` and `internal` functions inside `contract`
- `library` as a non-spendable helper container
- BCH `OP_DEFINE` / `OP_INVOKE` lowering for local and imported helpers
- transitive `contract -> library -> library` imports
- helper-aware debug metadata and nested-frame debugging behavior

## Review Focus

The highest-value review questions for the CashScript team are:

1. Is the `contract` / `library` split the right long-term source model?
2. Are the helper restrictions conservative enough for a release branch?
3. Is canonicalization by resolved library identity the right import behavior?
4. Is the helper-frame debug model sufficiently explicit and trustworthy?
5. Is the branch scoped and shaped correctly relative to the current `next` baseline?

## Code Areas To Review

The most important implementation files are:

- `packages/cashc/src/compiler.ts`
- `packages/cashc/src/imports.ts`
- `packages/cashc/src/generation/GenerateTargetTraversal.ts`
- `packages/cashscript/src/debugging.ts`
- `packages/cashscript/src/Errors.ts`
- `packages/utils/src/artifact.ts`

The most important tests are:

- `packages/cashc/test/compiler/compiler.test.ts`
- `packages/cashc/test/generation/generation.test.ts`
- `packages/cashscript/test/debugging.test.ts`

## Validation Summary

This branch was brought to a clean state with:

- root `yarn test`
- root `yarn build`
- root `yarn lint`

It also includes adversarial regressions around:

- nested helper failure attribution
- ambiguous helper-frame identity
- shared transitive import graphs
- duplicate helper names across imported libraries

## Showcase Examples

For maintainers reviewing the feature with concrete source examples:

- local internal helpers:
  - `examples/helper-functions.cash`
  - `examples/helper-functions.ts`
- imported helper libraries:
  - `examples/imported-helper-functions.cash`
  - `examples/math-helpers.cash`
  - `examples/parity-helpers.cash`
  - `examples/imported-helper-functions.ts`
