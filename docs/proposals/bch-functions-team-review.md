# BCH Functions Proposal Review

This document summarizes the working-tree patch on top of the current `next` branch. It is intended as a developer-facing review aid for the CashScript team.

The goal of this patch is to add user-defined function calls to CashScript by compiling them to BCH function opcodes while keeping the supported subset safe enough for real integrations to experiment with.

## Scope

This proposal adds:

- user-defined function calls inside a contract
- compilation of those calls to `OP_DEFINE` and `OP_INVOKE`
- an internal helper convention based on function names ending in `_`
- compiler restrictions for cases the current lowering cannot yet support safely
- artifact/runtime metadata so SDK integrations can validate VM-target expectations
- expanded compiler, codegen, SDK, runtime, and docs coverage

This proposal does not attempt to solve:

- signature-check support inside invoked helper functions
- constructor-parameter capture inside invoked helper functions
- recursive or mutually-recursive helper calls
- new syntax such as explicit `internal`/`public` modifiers

## Why This Approach

The BCH functions CHIP makes internal code reuse possible at the script level with `OP_DEFINE` and `OP_INVOKE`. CashScript can benefit from that, but the compiler and SDK currently assume a flatter execution model:

- a contract exposes public ABI functions
- signing/debugging generally reason about a single active bytecode body
- function visibility is not part of the language syntax

Given those constraints, the patch takes a conservative path:

1. Reuse the existing CashScript function model rather than inventing new syntax.
2. Treat helper functions as a convention, not a grammar change.
3. Only compile the subset we can model safely today.
4. Reject unsupported patterns explicitly at compile time.
5. Carry enough artifact/provider metadata that SDK users can detect VM-target mismatches early.

This keeps the patch small enough to review while avoiding silent miscompilation.

## Language And Compiler Model

### User-defined calls

CashScript `functionCall` grammar now allows calls to user-defined contract functions as well as built-ins.

The semantic pass now:

- registers contract functions in a function-definition map
- resolves user-defined calls distinctly from built-in function symbols
- tracks call edges on each `FunctionDefinitionNode`

That call graph is then used by code generation and safety analysis.

### Internal helper convention

Functions whose names end with `_` are treated as internal helpers.

Effects:

- they can still be called by other contract functions
- they are excluded from the artifact ABI
- they are not exposed as SDK unlock methods
- a contract with only helper functions is rejected as empty from the ABI perspective
- user-defined functions still cannot redefine built-in global function names

The main reason for choosing `foo_()` is that it works with the current grammar, keeps the change small, and avoids introducing visibility syntax without parser/tooling changes.

### Code generation

The compiler computes the transitive closure of invoked functions and emits only that reachable set into the BCH function table.

Lowering works like this:

1. Public entrypoints remain selected through the existing CashScript ABI dispatch path.
2. Reachable invoked functions are compiled into bytecode fragments.
3. Those fragments are registered with `OP_DEFINE`.
4. Calls to user-defined functions emit the function index followed by `OP_INVOKE`.

Important consequence: unused helper functions do not generate `OP_DEFINE` entries.

## Safety Boundaries

The proposal intentionally rejects cases that are not sound under the current frame/signing model.

### Disallowed in invoked helper functions

- `checkSig()`
- `checkMultiSig()`
- `checkDataSig()`
- references to constructor parameters
- direct recursion
- mutual recursion

### Why these are rejected

Signature operations are the most important remaining semantic gap. Invoked bytecode changes the covered-bytecode story, and the current SDK/compiler pipeline does not yet model per-invocation signing semantics precisely enough to safely support those operations.

Constructor-parameter capture is also unsafe in the current lowering. Invoked bytecode runs with a stack frame that is not equivalent to a lexical closure, so referencing constructor parameters from helper bodies would risk reading the wrong stack slot.

Recursion is rejected because the current implementation uses a predeclared function table and does not try to model recursive helper execution or the associated safety/debug complexity.

The design principle here is simple: if the compiler cannot prove the current lowering is safe, it should reject the pattern.

## Artifact And SDK Integration

### Artifact changes

Artifacts now record an optional `compiler.target` field.

For contracts using BCH function opcodes, the compiler records:

- `compiler.target: 'BCH_2026_05'`

The `CompilerOptions.target` option and CLI `--target` flag also allow explicit overrides when needed.

Compiler options stored in artifacts are normalized so `target` is kept as artifact metadata rather than mixed into the generic `compiler.options` bag.

### Provider/runtime validation

The SDK now uses provider VM-target metadata where available.

Changes include:

- `NetworkProvider` exposes optional `vmTarget`
- `ElectrumNetworkProvider`, `FullStackNetworkProvider`, and `BitcoinRpcNetworkProvider` carry `vmTarget`
- `Contract` fails fast when an artifact target and provider target conflict
- libauth-template generation rejects transactions that mix contracts requiring different VM targets

This is primarily a safety and developer-experience improvement. It reduces the chance that teams compile a BCH-functions contract and then accidentally test it under a provider/debug configuration targeting older rules.

## Debugging And Tooling Adjustments

Two debug-related adjustments were needed to keep the existing experience coherent:

- locking-script debug slicing now handles nested invoked frames more carefully rather than assuming the last `ip === 0` is the start of the root locking script
- pretty formatting for debug bytecode falls back to execution-order ASM when the contract uses control-flow/function opcodes whose reformatting can destabilize source mapping

This does not fully redesign debug metadata for nested frames, but it avoids known misleading output in the current tooling.

One remaining limitation is that debug attribution for `console.log` and `require(...)` inside invoked helper frames is still less precise than for top-level public functions. Runtime behavior is covered by tests, but nested-frame debugging should still be treated as best-effort.

## Optimizations Included In The Patch

The implementation also includes a few targeted codegen cleanups:

- only reachable helper functions are emitted into the BCH function table
- unused helpers produce no `OP_DEFINE`/`OP_INVOKE` overhead
- scoped variable cleanup emits `OP_2DROP` where possible
- shallow replacement patterns use `OP_SWAP`/`OP_ROT` instead of always using integer-push plus `OP_ROLL`
- `require` debug metadata no longer writes `message: undefined`

These changes are small but worthwhile because helper-function support should not add avoidable bytecode bloat or unnecessary debug noise.

## Files Touched

The patch spans four main areas.

### Compiler and semantic analysis

- `packages/cashc/src/grammar/CashScript.g4`
- `packages/cashc/src/semantic/SymbolTableTraversal.ts`
- `packages/cashc/src/semantic/EnsureFinalRequireTraversal.ts`
- `packages/cashc/src/semantic/EnsureInvokedFunctionsSafeTraversal.ts`
- `packages/cashc/src/generation/GenerateTargetTraversal.ts`
- `packages/cashc/src/artifact/Artifact.ts`
- `packages/cashc/src/Errors.ts`
- `packages/cashc/src/utils.ts`
- `packages/cashc/src/cashc-cli.ts`

### SDK and runtime integration

- `packages/cashscript/src/Contract.ts`
- `packages/cashscript/src/libauth-template/LibauthTemplate.ts`
- `packages/cashscript/src/libauth-template/utils.ts`
- `packages/cashscript/src/debugging.ts`
- `packages/cashscript/src/network/NetworkProvider.ts`
- `packages/cashscript/src/network/ElectrumNetworkProvider.ts`
- `packages/cashscript/src/network/FullStackNetworkProvider.ts`
- `packages/cashscript/src/network/BitcoinRpcNetworkProvider.ts`

### Shared artifact types

- `packages/utils/src/artifact.ts`

### Tests and docs

- `packages/cashc/test/...`
- `packages/cashscript/test/Contract.test.ts`
- `website/docs/compiler/bch-functions.md`
- `website/docs/compiler/compiler.md`
- `website/docs/compiler/artifacts.md`
- `website/docs/compiler/grammar.md`
- `website/docs/language/contracts.md`
- `website/docs/language/functions.md`

## Test Coverage Added

The patch adds or updates tests in several layers.

### Compiler/codegen tests

- user-defined function calls are accepted instead of rejected as undefined references
- helper functions are hidden from the ABI
- reachable helper closure emits only reachable `OP_DEFINE`s
- unused helpers emit no BCH function opcodes
- helper-only contracts are rejected
- transitive signature-op usage in helpers is rejected
- transitive constructor-parameter usage in helpers is rejected
- direct recursion is rejected
- mutual recursion is rejected

### SDK/runtime tests

- helper-function contracts instantiate cleanly under `BCH_2026_05`
- helper functions do not appear on generated unlocker surfaces
- nested helper chains execute correctly
- shared helper chains across multiple public entrypoints work
- zero-argument helpers execute correctly
- public-to-public internal invocation works while preserving ABI visibility
- failing helper validation fails transaction execution
- older artifacts lacking `compiler.target` remain accepted
- artifact/provider VM-target mismatches fail fast
- mixed-target transaction templates fail fast
- Electrum-provider VM-target mismatch is also validated

### Validation run status

The patch has been validated with:

- `npm run build`
- `cd packages/utils && yarn test`
- `cd packages/cashc && yarn test`
- `cd packages/cashscript && yarn test`
- `cd examples/testing-suite && yarn test`

Those package-level runs are the most reliable signal in this workspace because root-level parallel test execution can race against sibling-package build outputs.

## Documentation Updates

The external docs now cover:

- the BCH functions compilation model
- the `foo_()` helper convention
- the beta status of the feature
- the current safety limitations
- artifact `compiler.target` metadata
- compiler `--target` / `CompilerOptions.target`
- provider `vmTarget` behavior for local validation
- the BCH 2026 requirement for testing and integration environments

That should make it much easier for downstream teams to understand what is supported today and what is intentionally out of scope.

## Tradeoffs And Known Limitations

The main tradeoff in this proposal is that it prefers a safe restricted subset over a more powerful but underspecified feature.

Benefits:

- small and reviewable patch
- no silent unsafe behavior in the unsupported cases we identified
- clear ABI boundary between public functions and helpers
- early VM-target validation in local integrations

Limitations:

- no signature ops in invoked helpers
- no constructor-parameter capture in invoked helpers
- no recursion
- visibility remains convention-based instead of syntax-based
- nested-frame debug metadata is improved but not fully redesigned, especially for helper `console.log` / `require(...)` attribution

## Suggested Review Questions

The most useful questions for the CashScript team to evaluate are:

1. Is `foo_()` an acceptable temporary/internal-helper convention until explicit visibility syntax exists?
2. Is the current restricted subset the right release boundary for an experimental BCH-functions integration?
3. Is `compiler.target` the right artifact-level representation for VM-target requirements?
4. Should explicit target selection remain optional/inferred, or should the compiler require it whenever 2026-only opcodes are emitted?
5. Does the team want to preserve the helper convention long-term, or eventually replace it with grammar-level visibility modifiers?

## Bottom Line

This patch is intentionally not a full language-level function system. It is a careful integration of BCH `OP_DEFINE`/`OP_INVOKE` into CashScript that:

- enables internal code reuse today
- avoids the unsafe cases we identified
- gives SDK users better target-awareness and earlier failures
- comes with enough tests and docs to make team review practical

If the team agrees with the restricted safety model, this should be a solid base for discussing whether BCH functions belong in CashScript and what the next iteration should solve.
