# User-defined functions — roadmap to a stable mainline release

Status of the current branch (`v0.14.0-next.0`, compiler-only): top-level standalone
functions, single-value-or-void returns, grammar-native **relative** imports, always
`OP_DEFINE`/`OP_INVOKE` (no inlining), one flat global namespace. No SDK debugging, no
safety gates, no optimization passes for functions.

This document lists what to close before calling the feature stable, drawing on the two
prototype branches (`feat/library-support`, `review/bch-functions-next`) and on gaps that
**all three** prototypes missed.

Legend: _(port: branch)_ = adapt an existing prototype implementation · _(novel)_ = not
addressed by any prototype.

---

## Tier 1 — correctness & debuggability (blockers for "stable")

### 1. Frame-aware SDK debugging _(port: `review/bch-functions-next`)_ — **Done**
A `require` that fails inside a function, and `console.log` in a function body, now attribute to the
correct source line (and file, for imported functions). Implemented as self-contained frames rather
than the prototype's flat-and-stamped model:
- Artifact: `DebugInformation.functions?: DebugFrame[]` (`packages/utils/src/artifact.ts`), one
  self-contained `{ name, inputs, bytecode, sourceMap, logs, requires, source?, sourceFile? }` per
  function with frame-local ips. The top-level fields stay the implicit root frame, so function-less
  contracts are
  byte-identical and old artifacts keep working. The compiler just stops discarding the body's
  already-computed optimised debug info (`compileGlobalFunctionBody`).
- SDK: `resolveFrame`/`getActiveBytecode` (`debugging.ts`) identify the active frame per step by
  matching `state.instructions` bytecode (WeakMap-cached), then the existing ip attribution runs against
  that frame's arrays; `getLocationDataForFrame` + a `ResolvedFrame` (`Errors.ts`) apply the constructor
  offset only for the root. Phase detection now keys on `ip === 0 && controlStack.length === 0`.
- Imports get per-file source provenance via `FunctionDefinitionNode.sourceCode/sourceFile`, stamped in
  `dependency-resolution.ts` (no text-level line remapping needed, unlike the prototype).
- Deviation from the proposal: skipped `assertDistinctHelperFrameBytecode`. Two functions with
  byte-identical bodies are rare but valid, and a hard compile error for a debug-only concern is the
  wrong trade; attribution degrades gracefully to the first matching frame instead.
- Tested in `debugging.test.ts` (require-in-function, log-in-function, contract-level require still
  correct, imported-function require attributing to the imported file).

### 2. BitAuth IDE source mapping with functions — **Done**
The template previously fell back to plain unmapped asm when frames were present. `formatBitAuthScript`
(`packages/utils/src/bitauth-script.ts`) was rewritten to walk the script in **bytecode order** (instead of
grouping opcodes by source line), so opcode order preservation — required because the IDE *executes* the
formatted text — is now structural rather than dependent on monotonic source maps. Function definitions
render as nested `<...>` BTL push groups (byte-identical via `encodeDataPush` on both sides) annotated with
the function's own source, sliced to just that function via the new `DebugFrame.location`; imported
functions get a `>>> function f (imported from file.cash)` header row. `DebugFrame` also gained
`sourceTags` (previously computed and discarded) so loop/cleanup `>>>` annotations render inside bodies.
Old artifacts degrade gracefully (frames without `location` render as an opaque `<0x...>` push; artifacts
without `debug` keep the plain-asm fallback). Function-less output is byte-identical to before (pinned
fixtures unchanged). Tested in `packages/utils/test/bitauth-script.test.ts` (function fixtures + a BTL
round-trip byte-equality check on every fixture) and `debugging.test.ts` (template text assertions).

---

## Tier 2 — expressiveness (port/adapt from prototypes)

### 4. Multi-value / tuple returns _(port: `feat/library-support`)_
`returns (int, int)` + `return a, b`. Common need (return a value plus a derived check); we
intentionally cut it to a single value.

### 5. Global `constant` definitions _(port: `feat/library-support`)_
Compile-time-folded top-level constants, shareable via imports. A frequent request
independent of functions, and a natural companion to them.

### 6. `library {}` containers + namespaced / aliased imports _(port: both branches)_
`import "./math.cash" as Math;` + `Math.double(x)`. Solves the **single flat global
namespace** limitation we shipped (today a name may exist only once across the whole import
graph — collisions are unavoidable at ecosystem scale). Libraries also give a unit to
publish and audit.

### 8. Size-gated inlining for tiny bodies _(port: `feat/library-support`, ≤6 bytes)_
For trivial helpers the `OP_DEFINE`/`OP_INVOKE` overhead exceeds the body; inline those.
Pure size/cost optimization, safe to add later since it doesn't change semantics. (Note:
inlining reintroduces the recursion-expansion problem, so it must be gated to
non-recursive functions — keep the always-`OP_INVOKE` path for recursive ones.)

---

## Tier 3 — optimization & ecosystem

### 9. Pluggable import resolver _(novel for us; hook exists in `review/bch-functions-next`)_
Confirmed gap: `dependency-resolution.ts` calls `fs.readFileSync` directly and
`CompileOptions` exposes only `errorListener`/`basePath`. Let `compileString` resolve
imports via a caller-supplied `(path) => source` callback and/or a virtual file map.
Required for the **Playground / any browser compile** to use imports at all — today it's
Node-fs-only.

### 10. Registry / package / URL imports + remappings _(novel — all prototypes are relative-path only)_
No prototype has a notion of importing from a published package or a remapped alias
(cf. Solidity `node_modules` / remappings). For a real contract ecosystem this is how
shared, versioned, audited code circulates. Depends on #9.

---

## Code quality revisits

Non-blocking internal cleanups to revisit before a stable release. No behaviour change intended.

### `optimiseBytecode` signature
`optimiseBytecode` (`packages/utils/src/script.ts`) takes seven positional parameters
(`script`, `locationData`, `logs`, `requires`, `sourceTags`, `constructorParamLength`, `runs`), four
of which are parallel debug arrays passed positionally at both call sites (`compiler.ts` and
`GenerateTargetTraversal.compileGlobalFunctionBody`). Verbose and easy to get wrong. Collapse the
debug arguments into a single object (or an options arg).

### `ensureSingleTailReturn`
`ensureSingleTailReturn` in `packages/cashc/src/semantic/EnsureFinalRequireTraversal.ts` carries a
self described "a bit convoluted" TODO (final-statement check plus a recursive `findReturn` stray
scan). Tidy it up. Likely rewritten when early/conditional returns land (see the Extension section).

### Inject locktime guard analysis
`InjectLocktimeGuardTraversal` (`packages/cashc/src/semantic/InjectLocktimeGuardTraversal.ts`) uses a
second traversal class (`LocktimeGuardRequirementAnalyser`) constructed per function with a callback,
plus a memoised map with seed-false cycle breaking. Revisit whether the two-traversal plus callback
structure can be simplified.

---

## Extension (post-mainline) — early / conditional (nested & multiple) return statements

Distinct from #4 (multi-**value** returns): this is about multiple/nested return *statements*
— early returns, guard clauses, branch-specific returns — i.e. control flow, not the number
of returned values. **Not targeted for the mainline release** — neither the structured subset
nor the loop/general case. Captured here as a future extension. Today a value-returning
function must end with exactly one tail `return`
(`packages/cashc/src/semantic/EnsureFinalRequireTraversal.ts`, `ensureSingleTailReturn`, which
already carries a TODO anticipating this work).

**Core constraint.** The BCH VM has no return/jump opcode: a function returns only by running
off the end of its body (`opInvoke` pushes the caller frame onto the control stack; the
`continue` handler pops it when `ip >= instructions.length`). All control flow is structured
(`OP_IF`/`OP_ENDIF`, `OP_BEGIN`/`OP_UNTIL`) — there is no "jump to function end." So `return`
is not a primitive; every non-tail return must be compiled away by restructuring the body so
that all paths converge to leaving the value on top at the end.

Two sub-parts, very different cost:

- **Structured returns (tail + guard clauses)** — e.g. `if (a > 10) { return 10; } return a;`.
  Semantically `a > 10 ? 10 : a`; a guard clause hoists the remaining statements into the else
  branch, and nested tail returns recurse into nested if/else. Compiles to the same bytecode as
  the hand-written single-`result`-variable equivalent — ~zero extra cost. The "every path
  terminates correctly" analysis already exists in the analogous `ensureFinalStatementIsRequire`
  branch recursion for contract `require`s.
- **Loop / fully-general returns** — e.g. a `return` inside a `for` that must break the loop
  *and* the function. No structured transform expresses "break to function end"; needs a runtime
  `returned` flag OR'd into the loop condition plus guarding every subsequent statement with
  `if (!returned)`. Extra opcodes + a memory slot, pressing on the 100-slot control-stack /
  op-cost budget. Viable but expensive.

**Implementation approach.** Do it as an AST **normalization-to-single-exit** pass *before*
codegen (reduce a multi-return body to one tail return / convergent if/else), so
`GenerateTargetTraversal` and the existing single-exit `cleanStack` /
`removeFinalVerifyFromFunction` keep working unchanged. Emitting unstructured returns directly
would instead force fragile per-return-site stack cleanup. Add the supporting analysis:
definite-return on all paths, unreachable-code-after-return, and return-type consistency across
all return sites (scaffolding partly present: `MissingReturnError`, `MisplacedReturnError`).

**Suggested phasing if/when picked up:** structured returns first (normalization + path
analysis, disallow `return` inside loops with a clear error), then loop/general returns via
flag-guarding only if there is demand.


Also perhaps it makes sense to have a separate importedSources so that multiple functions from the same source don't have to repeat the full source code multiple times.
