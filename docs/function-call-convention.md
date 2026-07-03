# The user-function calling convention and its op-cost

This note documents the argument-staging convention for user-defined function calls
(`OP_DEFINE`/`OP_INVOKE`), why the original upstream convention caused a measurable op-cost
regression on call-dense contracts, and the fix (`d0409c2`). It is written against the
`feat/multi-returns` branch.

## The regression

After porting the zk-verifier contracts from the old `feat/library-support` fork to this branch,
every byte-scored benchmark entry improved, but the BN254 op-bound multi-input families regressed
+1.3–2.3%. Per-stage decomposition localised the loss to *unrolled, call-dense* bodies (the lazy
tower's fused-miller and final-exp stages: thousands of small multi-return calls per chunk), while
*loop-shaped* stages improved. Constant hoisting and inlining were ruled out by direct measurement;
disassembly of the same Miller chunk under both compilers showed the new one emitting smaller
bytecode but executing ~5% more instructions.

## The cause

**The argument-staging convention at `OP_INVOKE` call sites.** The compiler expected the *last*
parameter on top of the stack at function entry ("like builtin functions"). Arguments are staged by
bringing each one to the top of the stack in turn — so staging them left-to-right leaves the last
argument on top, which sounds like a match. But the staging ops themselves are what cost: for the
overwhelmingly common call shape — variables passed in declaration order, e.g. `fp2Sub(a0, a1, b0,
b1)` over locals laid out `[a0, a1, b0, b1]` (first on top) — building the *reversed* layout costs
real reversal instructions at **every call site**:

```
convention: last param on top          convention: first param on top
--------------------------------      --------------------------------
        OP_SWAP OP_0 OP_INVOKE                OP_0 OP_INVOKE
OP_2DUP OP_SWAP OP_0 OP_INVOKE        OP_2DUP OP_0 OP_INVOKE
```

(2-argument call, measured; with 4–6 arguments the reversal grows into `OP_SWAP OP_2SWAP OP_SWAP`
chains.) The old fork compiled bodies against a **first-parameter-on-top** entry layout and staged
arguments **right-to-left**: each argument is still brought to the top in turn, but in reverse
order, so for declaration-order variable arguments the emitted `<n> OP_ROLL` pairs cancel to
nothing in the peephole optimiser. A typical call costs **zero staging instructions**.

The overhead was ~1–3 executed instructions per call depending on arity. On the BN254 lazy tower
(~12–14k executed calls per proof) that multiplied to ~+2.9M op-cost on the residue pipeline and
~+5M on groth16-chunked — and for op-bound contracts, whose unlocking scripts are zero-padded until
`(41 + length) × 800` covers the op budget, every 800 op-cost is one more mandatory padding byte.

## The fix

`GenerateTargetTraversal` now:

1. **Seeds function bodies with the first parameter on top** (`compileGlobalFunctionBody` visits
   parameters in declaration order; `visitParameter` pushes to the stack bottom).
2. **Stages user-function call arguments right-to-left** (`stageUserFunctionArguments`), so the
   first argument lands on top, matching the body layout. Built-in functions keep natural
   left-to-right evaluation.
3. **Guards ROLL under reversed emission**: evaluating arguments right-to-left breaks the textual
   final-use order that the `opRolls` analysis assumes, so within a call's argument tree a variable
   may only be ROLLed if it appears exactly once across the whole (possibly nested) tree
   (`ArgIdentifierCounter`; see the `isOpRoll` guard). Everything else stays a PICK; leftover
   originals are cleaned up once at the end of the spend path.

Output is byte-identical to the old fork on representative multi-return call patterns (2-arg and
4-arg, including argument reuse and nested calls).

## Static size vs executed cost

The two conventions sit at different points on a per-call vs per-spend spectrum, so **static
bytecode size can grow while executed op-cost drops**:

- reversal staging (removed) was paid in bytes *and* executed instructions at **every call site**;
- PICK-instead-of-ROLL residue and end-of-spend cleanup (`OP_NIP`/`OP_2DROP` chains) are paid in
  bytes but executed **once per spend**.

Measured on real contracts: loop-shaped `vkx.cash` improves on both axes (−8 bytes, −14 static
ops); unrolled `miller_00.cash` grows +111 static bytes while executed instructions drop (the old
fork's equivalent chunk was +425 bytes static and ~5% cheaper dynamically). Op-bound contracts
price executed cost, so this is the right default trade. If the small static give-back ever matters
for a byte-scored, call-dense contract, per-call staging could be resurrected behind
`optimizeFor: 'size'` — deliberately not done now to avoid conventions diverging without a
demonstrated need.

## Interaction with the rest of the pipeline

- **Inlining** is unaffected: an inlined body is compiled against the same staged-arguments layout
  and spliced where the arguments sit.
- **Multi-return values** still leave the last-declared value on top; destructuring is unchanged.
- **Debug frames** pin the body bytecode, which changed shape under the new layout — the pinned
  generation and BitAuth-script fixtures were updated accordingly.
- **Recursion** still falls back to `OP_DEFINE`/`OP_INVOKE` via the invoked-functions guard.
