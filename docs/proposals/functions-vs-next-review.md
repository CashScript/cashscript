# BCH Functions Vs Current `next`

## Purpose

This document summarizes what this branch adds relative to the current team-maintained `next` branch, and how those additions relate to the team’s current direction.

It is intentionally scoped to the delta that matters for review.

## Current Base

Current reviewed base:

- `next` at `84d858f`

This branch is built on top of that base through the existing merge into `feature/functions-only`, then the later `library` and hardening work.

## What `next` Already Has

Current `next` already includes:

- the newer loop implementation work
- the current SDK/network changes from the team
- the baseline parser/compiler/runtime behavior without BCH helper functions

That means this branch should be reviewed as:

- functions work layered on top of current `next`
- not as an alternative to the team’s loop work

## What This Branch Adds Beyond `next`

### 1. Contract-local helper functions

This branch adds explicit function classification inside contracts:

- `public`
- `internal`

And lowers reachable helper calls through:

- `OP_DEFINE`
- `OP_INVOKE`

This is the core language/compiler change.

### 2. Non-spendable `library` containers

This branch adds a second top-level container:

- `library`

`library` exists to make imported helper code non-spendable by construction.

That is a deliberate design choice from our local work:

- imported helper files should complement a contract
- imported helper files should not define their own spend surface

### 3. Transitive helper imports

This branch adds:

- `contract -> library`
- `library -> library`

with:

- cycle rejection
- alias checks
- canonicalization by resolved file identity

### 4. Helper-aware debugging and artifact metadata

This branch adds helper-frame metadata and SDK-side helper-aware attribution for:

- logs
- require failures
- nested helper evaluation failures

This matters because helper functions without usable debugging are not reviewable or production-ready enough for other teams.

### 5. Conservative helper restrictions

This branch explicitly rejects helper patterns that are currently too risky or too underspecified:

- recursion
- mutual recursion
- signature-check builtins in helpers
- contract-constructor capture in helpers

## How This Fits The Team’s Current Direction

### Loops

The main team is already carrying the loop work on `next`.

Our branch does not try to compete with that work. It assumes those loop changes are the baseline and focuses on the other major BCH 2026 opcode area:

- user-defined function frames

### Compiler direction

The branch follows the same broader philosophy we discussed locally:

- BCH opcodes should be first-class compiler targets
- source constructs should map cleanly onto those opcodes
- the compiler should make spend surfaces and helper surfaces explicit

In that sense, this work is aligned with the team’s broader compiler direction rather than being an unrelated experiment.

### Safety posture

The strongest local design decision was:

- helper reuse should be enabled
- hidden new spend surfaces should not be enabled

That is why `library` is non-spendable and why helper restrictions are deliberately conservative.

## Main Things The Team Should Scrutinize

1. Whether `library` is the right source-level container for imported helper code.
2. Whether explicit `public` / `internal` is the right contract-level function model.
3. Whether canonicalizing shared transitive libraries by resolved file identity is the right import strategy.
4. Whether the current helper restrictions are conservative in the right places.
5. Whether the helper debug metadata is stable enough for downstream tooling and users.

## Bottom Line

Relative to current `next`, this branch is primarily:

- BCH helper-function support
- non-spendable imported helper libraries
- helper-aware debugging and hardening

It is not a competing loops branch. It is the local functions track, updated to fit the team’s current `next` baseline.
