// Stack rescheduling: re-derive the evaluation schedule of straight-line code from its
// dataflow DAG so operands are on top of the stack when needed, instead of fetching every
// read from a variable slot with `<depth> OP_PICK/OP_ROLL` pairs.
//
// The compiled script is split into basic blocks at control opcodes (IF/ELSE/ENDIF,
// BEGIN/UNTIL) and side-effecting checks (VERIFY-family, CLTV/CSV). Each block is lifted
// to a value DAG over its (opaque) entry stack slots, then re-emitted by a scheduler that
// walks the DAG in dependency order, choosing per operand between consuming moves
// (SWAP/ROT/ROLL), copies (DUP/OVER/PICK) and re-pushing constants. Because every block
// reproduces its exact entry->exit stack layout and the control opcodes are kept verbatim
// and in order, blocks compose and the transform is semantics-preserving by construction.
// Per block the compiler keeps min(original, rescheduled), so no block ever gets worse.
//
// The exit-layout guarantee alone does not cover DEAD COMPUTATION: a value computed but
// never reaching the block's exit. Script failure aborts the whole evaluation, so
// rejecting a spend is the only observable effect a dead node has — and the realistic
// instance is a VOID FUNCTION CALL, whose require() lives inside the OP_DEFINE'd body:
// the call site is an invoke node with zero outputs, dead by construction. The scheduler
// only emits nodes reachable from the exit, so a re-emitted block would silently delete
// the guard (and the well-formedness checks it performs on witness data), accepting
// spends the original rejects. Blocks containing dead computation are therefore never
// re-emitted: they keep their original ops verbatim (see hasDeadComputation), and any
// variant that cannot keep them (permuted entry layout or callee conventions) is
// discarded wholesale.
//
// Objectives (follows `optimizeFor`):
//   'size'   — candidate schedules ranked by serialized bytes.
//   'opcost' — ranked by the BCH2026 op-cost meter (100 per evaluated instruction + the
//              bytes it pushes; SWAP/ROT push 0, copies push the item, ROLL pushes
//              item+depth, so e.g. re-pushing a 32-byte constant (~132) beats PICKing a
//              stashed copy (~234)). Right for op-bound contracts whose unlocking scripts
//              are zero-padded to buy op budget.
//
// OP_DEFINE'd function bodies are additionally validated by a differential test on a
// loosened VM (random input vectors; the rescheduled body must reproduce the original's
// output stack) and, under 'opcost', selected by MEASURED op-cost rather than the static
// estimate. The main routine cannot be executed standalone (it reads transaction context),
// so it relies on the per-block structural guarantee and static ranking.
//
// ENTRY-LAYOUT SEARCH: the pass also chooses, per OP_DEFINE'd function, the stack ORDER
// in which its arguments arrive — jointly with the schedule (the optimal order depends
// on the schedule and vice versa), including a small beam search over node orders. Call
// sites already stage arguments explicitly, so a permuted convention costs nothing extra
// there; every caller (and the main routine, when it invokes a permuted callee directly)
// is re-emitted to stage arguments in the callee's chosen order, and the plain-cashc
// variant of any block that invokes a permuted callee is invalid and excluded from the
// per-block min. If any validation fails, the pass falls back to identity layouts
// wholesale.
//
// This pass is opt-in (`rescheduleStacks`), runs after bytecode optimisation, and is
// restricted to single-function contracts (with a function selector, the entry stack
// depth differs per spend path, which this block model does not represent). Scripts and
// bodies containing console.log statements are left untouched (wholesale reordering
// cannot preserve per-instruction log data). Rescheduled regions keep coarse debug info:
// every emitted opcode of a rewritten block maps to the block's merged source span, and
// require() messages re-anchor to their (preserved) verify boundary.
import {
  ConsensusBch2025,
  binToHex,
  createInstructionSetBch2026,
  createTestAuthenticationProgramBch,
  createVirtualMachine,
  ripemd160,
  secp256k1,
  sha1,
  sha256,
  vmNumberToBigInt,
} from '@bitauth/libauth';
import {
  DebugFrame,
  FullLocationData,
  Op,
  OpOrData,
  OptimiseBytecodeResult,
  PositionHint,
  RequireStatement,
  Script,
  SingleLocationData,
  SourceTagEntry,
  bytecodeToScript,
  calculateBytesize,
  decodeInt,
  encodeInt,
  generateSourceMap,
  scriptToBytecode,
  sourceMapToLocationData,
} from '@cashscript/utils';

export interface FunctionArity { in: number; out: number }

export interface RescheduleOptions {
  arities: Map<number, FunctionArity>; // per OP_DEFINE'd functionId
  mainInArity: number; // spend parameters + constructor parameters
  objective: 'size' | 'opcost';
  constructorParamLength: number;
}

export interface RescheduleOutcome {
  result: OptimiseBytecodeResult;
  frames: DebugFrame[];
}

// ---------- script-element helpers ----------

const elOpcode = (el: OpOrData): number => (typeof el === 'number' ? el : -1);

// The constant a script element pushes, if it is a push. Small integers may be stored
// either as data (encodeInt) or as OP_0/OP_1..16/OP_1NEGATE opcode numbers (inserted by
// optimisation replacements) — normalise both to their byte content.
function constDataOf(el: OpOrData): Uint8Array | undefined {
  if (el instanceof Uint8Array) return el;
  if (el === Op.OP_0) return Uint8Array.of();
  if (el === Op.OP_1NEGATE) return Uint8Array.of(0x81);
  if (el >= Op.OP_1 && el <= Op.OP_16) return Uint8Array.of(el - (Op.OP_1 - 1));
  return undefined;
}

const constNumOf = (el: OpOrData): number | undefined => {
  const data = constDataOf(el);
  return data === undefined ? undefined : Number(decodeInt(data));
};

// ---------- DAG model ----------

type Ref =
  | { k: 'const'; data: Uint8Array }
  | { k: 'in'; i: number }
  | { k: 'ain'; i: number }
  | { k: 'out'; node: DagNode; j: number };

interface DagNode {
  id: number;
  kind: 'prim' | 'invoke';
  code: number; // opcode for prim, functionId for invoke
  ins: Ref[];
  nout: number;
}

interface BasicBlock {
  entryDepth: number;
  entryAlt: number;
  exit: Ref[];
  exitAlt: Ref[];
  nodes: DagNode[]; // every node created in this block, reachable from the exit or not
  rawOps: Script;
  rawStart: number; // element index range in the source script
  rawEnd: number; // exclusive
}

type Item = { block: BasicBlock } | { ctrl: number; index: number };

// value-producing ops that are pure within one transaction evaluation: opcode -> [in, out]
const VALOP = new Map<number, [number, number]>([
  [Op.OP_1ADD, [1, 1]], [Op.OP_1SUB, [1, 1]], [Op.OP_NEGATE, [1, 1]], [Op.OP_ABS, [1, 1]],
  [Op.OP_NOT, [1, 1]], [Op.OP_0NOTEQUAL, [1, 1]],
  [Op.OP_ADD, [2, 1]], [Op.OP_SUB, [2, 1]], [Op.OP_MUL, [2, 1]], [Op.OP_DIV, [2, 1]], [Op.OP_MOD, [2, 1]],
  [Op.OP_LSHIFTNUM, [2, 1]], [Op.OP_RSHIFTNUM, [2, 1]],
  [Op.OP_BOOLAND, [2, 1]], [Op.OP_BOOLOR, [2, 1]],
  [Op.OP_NUMEQUAL, [2, 1]], [Op.OP_NUMNOTEQUAL, [2, 1]],
  [Op.OP_LESSTHAN, [2, 1]], [Op.OP_GREATERTHAN, [2, 1]],
  [Op.OP_LESSTHANOREQUAL, [2, 1]], [Op.OP_GREATERTHANOREQUAL, [2, 1]],
  [Op.OP_MIN, [2, 1]], [Op.OP_MAX, [2, 1]], [Op.OP_WITHIN, [3, 1]],
  [Op.OP_CAT, [2, 1]], [Op.OP_SPLIT, [2, 2]],
  [Op.OP_NUM2BIN, [2, 1]], [Op.OP_BIN2NUM, [1, 1]], [Op.OP_SIZE, [1, 2]],
  [Op.OP_AND, [2, 1]], [Op.OP_OR, [2, 1]], [Op.OP_XOR, [2, 1]], [Op.OP_EQUAL, [2, 1]],
  [Op.OP_REVERSEBYTES, [1, 1]],
  [Op.OP_RIPEMD160, [1, 1]], [Op.OP_SHA1, [1, 1]], [Op.OP_SHA256, [1, 1]],
  [Op.OP_HASH160, [1, 1]], [Op.OP_HASH256, [1, 1]],
  [Op.OP_CHECKSIG, [2, 1]], [Op.OP_CHECKDATASIG, [3, 1]],
  // introspection (constant within the evaluated transaction context)
  [Op.OP_INPUTINDEX, [0, 1]], [Op.OP_ACTIVEBYTECODE, [0, 1]],
  [Op.OP_TXVERSION, [0, 1]], [Op.OP_TXINPUTCOUNT, [0, 1]], [Op.OP_TXOUTPUTCOUNT, [0, 1]], [Op.OP_TXLOCKTIME, [0, 1]],
  [Op.OP_UTXOVALUE, [1, 1]], [Op.OP_UTXOBYTECODE, [1, 1]],
  [Op.OP_OUTPOINTTXHASH, [1, 1]], [Op.OP_OUTPOINTINDEX, [1, 1]],
  [Op.OP_INPUTBYTECODE, [1, 1]], [Op.OP_INPUTSEQUENCENUMBER, [1, 1]],
  [Op.OP_OUTPUTVALUE, [1, 1]], [Op.OP_OUTPUTBYTECODE, [1, 1]],
  [Op.OP_UTXOTOKENCATEGORY, [1, 1]], [Op.OP_UTXOTOKENCOMMITMENT, [1, 1]], [Op.OP_UTXOTOKENAMOUNT, [1, 1]],
  [Op.OP_OUTPUTTOKENCATEGORY, [1, 1]], [Op.OP_OUTPUTTOKENCOMMITMENT, [1, 1]], [Op.OP_OUTPUTTOKENAMOUNT, [1, 1]],
]);

// control/side-effecting opcodes that bound basic blocks: opcode -> main-stack pops.
// (IF/NOTIF/UNTIL pop their condition; the VERIFY family consumes its operands; CLTV/CSV
// only peek. Emitted verbatim between blocks, so their relative order — and therefore
// which check fails first — is preserved.)
const CTRL = new Map<number, number>([
  [Op.OP_IF, 1], [Op.OP_NOTIF, 1], [Op.OP_ELSE, 0], [Op.OP_ENDIF, 0],
  [Op.OP_BEGIN, 0], [Op.OP_UNTIL, 1],
  [Op.OP_VERIFY, 1], [Op.OP_EQUALVERIFY, 2], [Op.OP_NUMEQUALVERIFY, 2],
  [Op.OP_CHECKSIGVERIFY, 2], [Op.OP_CHECKDATASIGVERIFY, 3],
  [Op.OP_CHECKLOCKTIMEVERIFY, 0], [Op.OP_CHECKSEQUENCEVERIFY, 0],
]);

let nodeCounter = 0;

// Lift a script into [block | ctrl] items over a symbolic stack of `inArity` opaque
// entry slots. Throws on anything it cannot model (dynamic PICK depths, unknown opcodes,
// OP_DEPTH, ...) — callers treat a throw as "keep the original".
function decompile(script: Script, arities: Map<number, FunctionArity>, inArity: number): Item[] {
  const items: Item[] = [];
  let main: Ref[] = Array.from({ length: inArity }, (_, i) => ({ k: 'in', i } as Ref));
  let alt: Ref[] = [];
  let entryDepth = inArity;
  let entryAlt = 0;
  let rawStart = 0;
  let blockNodes: DagNode[] = [];
  const ctrlDepth: { m: number; a: number }[] = [];

  const beginBlock = (): void => {
    entryDepth = main.length;
    entryAlt = alt.length;
    main = main.map((_, i) => ({ k: 'in', i } as Ref));
    alt = alt.map((_, i) => ({ k: 'ain', i } as Ref));
  };
  const closeBlock = (end: number): void => {
    items.push({
      block: {
        entryDepth,
        entryAlt,
        exit: [...main],
        exitAlt: [...alt],
        nodes: blockNodes,
        rawOps: script.slice(rawStart, end),
        rawStart,
        rawEnd: end,
      },
    });
    blockNodes = [];
  };
  const pop = (): Ref => {
    const ref = main.pop();
    if (ref === undefined) throw new Error('stack underflow while decompiling');
    return ref;
  };
  const popConstNum = (): number => {
    const ref = pop();
    if (ref.k !== 'const') throw new Error('dynamic operand for PICK/ROLL/INVOKE');
    return Number(decodeInt(ref.data));
  };

  for (let i = 0; i < script.length; i += 1) {
    const el = script[i];
    const op = elOpcode(el);

    if (CTRL.has(op)) {
      closeBlock(i);
      if (op === Op.OP_IF || op === Op.OP_NOTIF) {
        pop();
        ctrlDepth.push({ m: main.length, a: alt.length });
      } else if (op === Op.OP_ELSE) {
        const s = ctrlDepth[ctrlDepth.length - 1];
        main.length = s.m;
        alt.length = s.a;
      } else if (op === Op.OP_ENDIF) {
        ctrlDepth.pop();
      } else {
        for (let k = 0; k < CTRL.get(op)!; k += 1) pop();
      }
      items.push({ ctrl: op, index: i });
      rawStart = i + 1;
      beginBlock();
      continue;
    }

    const data = constDataOf(el);
    if (data !== undefined) {
      main.push({ k: 'const', data });
      continue;
    }

    switch (op) {
      case Op.OP_DUP: main.push(main[main.length - 1]); break;
      case Op.OP_DROP: pop(); break;
      case Op.OP_2DROP: pop(); pop(); break;
      case Op.OP_2DUP: { const b = main[main.length - 1]; const a = main[main.length - 2]; main.push(a, b); break; }
      case Op.OP_3DUP: {
        const c = main[main.length - 1]; const b = main[main.length - 2]; const a = main[main.length - 3];
        main.push(a, b, c); break;
      }
      case Op.OP_OVER: main.push(main[main.length - 2]); break;
      case Op.OP_2OVER: { const b = main[main.length - 3]; const a = main[main.length - 4]; main.push(a, b); break; }
      case Op.OP_SWAP: { const n = main.length; [main[n - 1], main[n - 2]] = [main[n - 2], main[n - 1]]; break; }
      case Op.OP_2SWAP: {
        const n = main.length; const a = main[n - 4]; const b = main[n - 3];
        main[n - 4] = main[n - 2]; main[n - 3] = main[n - 1]; main[n - 2] = a; main[n - 1] = b; break;
      }
      case Op.OP_ROT: {
        const n = main.length; const a = main[n - 3];
        main[n - 3] = main[n - 2]; main[n - 2] = main[n - 1]; main[n - 1] = a; break;
      }
      case Op.OP_2ROT: {
        const n = main.length; const a = main[n - 6]; const b = main[n - 5];
        for (let k = n - 6; k < n - 2; k += 1) main[k] = main[k + 2];
        main[n - 2] = a; main[n - 1] = b; break;
      }
      case Op.OP_TUCK: {
        const n = main.length; const b = main[n - 1]; const a = main[n - 2];
        main[n - 2] = b; main[n - 1] = a; main.push(b); break;
      }
      case Op.OP_NIP: main.splice(main.length - 2, 1); break;
      case Op.OP_TOALTSTACK: alt.push(pop()); break;
      case Op.OP_FROMALTSTACK: { const ref = alt.pop(); if (ref === undefined) throw new Error('alt underflow'); main.push(ref); break; }
      case Op.OP_PICK: {
        const n = popConstNum();
        const picked = main[main.length - 1 - n];
        if (picked === undefined) throw new Error('PICK past stack bottom');
        main.push(picked); break;
      }
      case Op.OP_ROLL: {
        const n = popConstNum();
        const idx = main.length - 1 - n;
        if (idx < 0) throw new Error('ROLL past stack bottom');
        const [v] = main.splice(idx, 1);
        main.push(v); break;
      }
      case Op.OP_INVOKE: {
        const id = popConstNum();
        const arity = arities.get(id);
        if (arity === undefined) throw new Error(`unknown function id ${id}`);
        const ins: Ref[] = [];
        for (let k = 0; k < arity.in; k += 1) ins.unshift(pop());
        nodeCounter += 1;
        const node: DagNode = { id: nodeCounter, kind: 'invoke', code: id, ins, nout: arity.out };
        blockNodes.push(node);
        for (let j = 0; j < arity.out; j += 1) main.push({ k: 'out', node, j });
        break;
      }
      default: {
        const valop = VALOP.get(op);
        if (valop === undefined) throw new Error(`unsupported opcode 0x${op.toString(16)}`);
        const [nin, nout] = valop;
        const ins: Ref[] = [];
        for (let k = 0; k < nin; k += 1) ins.unshift(pop());
        nodeCounter += 1;
        const node: DagNode = { id: nodeCounter, kind: 'prim', code: op, ins, nout };
        blockNodes.push(node);
        for (let j = 0; j < nout; j += 1) main.push({ k: 'out', node, j });
        break;
      }
    }
  }
  closeBlock(script.length);
  return items;
}

// ---------- scheduler ----------

type Strategy = 'topo' | 'greedy' | 'opcost' | 'beam';

const keyOf = (ref: Ref): string | undefined => {
  if (ref.k === 'in') return `m${ref.i}`;
  if (ref.k === 'ain') return `a${ref.i}`;
  if (ref.k === 'out') return `n${ref.node.id}_${ref.j}`;
  return undefined;
};

// nominal stack-item length for op-cost estimates (item sizes are unknown statically)
const NOMINAL_LEN = 33;

// incremental per-element op-cost, mirroring opCostEstimate below
function costOfAppend(prev: OpOrData | undefined, el: OpOrData): number {
  const data = constDataOf(el);
  if (data !== undefined) return 100 + data.length;
  switch (elOpcode(el)) {
    case Op.OP_DUP: case Op.OP_OVER: case Op.OP_TUCK: case Op.OP_FROMALTSTACK: case Op.OP_PICK:
      return 100 + NOMINAL_LEN;
    case Op.OP_ROLL: return 100 + NOMINAL_LEN + (prev !== undefined ? (constNumOf(prev) ?? 0) : 0);
    case Op.OP_2DUP: case Op.OP_2OVER: case Op.OP_2ROT: return 100 + 2 * NOMINAL_LEN;
    case Op.OP_3DUP: return 100 + 3 * NOMINAL_LEN;
    default: return 100;
  }
}

// mutable emission state; cloneable for the beam search
interface EmitState {
  out: Script;
  stk: string[];
  useCount: Map<string, number>;
  remaining: Set<number>;
  cost: number; // accumulated static op-cost of `out`
}

const cloneState = (s: EmitState): EmitState => ({
  out: [...s.out], stk: [...s.stk], useCount: new Map(s.useCount), remaining: new Set(s.remaining), cost: s.cost,
});

const appendOp = (s: EmitState, el: OpOrData): void => {
  s.cost += costOfAppend(s.out[s.out.length - 1], el);
  s.out.push(el);
};

const topmostIndex = (stk: string[], key: string): number => stk.lastIndexOf(key);
const deepestIndex = (stk: string[], key: string): number => stk.indexOf(key);
const pushNum = (s: EmitState, value: number): void => { appendOp(s, encodeInt(BigInt(value))); };

// bring `key` to the top of the stack: a copy targets the shallowest occurrence
// (cheapest); a consuming move targets the deepest (original) so freshly staged copies
// above it are preserved
function bring(s: EmitState, key: string, move: boolean): void {
  const idx = move ? deepestIndex(s.stk, key) : topmostIndex(s.stk, key);
  if (idx < 0) throw new Error(`value not on stack: ${key}`);
  const depth = s.stk.length - 1 - idx;
  if (move) {
    if (depth === 1) appendOp(s, Op.OP_SWAP);
    else if (depth === 2) appendOp(s, Op.OP_ROT);
    else if (depth > 2) { pushNum(s, depth); appendOp(s, Op.OP_ROLL); }
    s.stk.splice(idx, 1);
    s.stk.push(key);
  } else {
    if (depth === 0) appendOp(s, Op.OP_DUP);
    else if (depth === 1) appendOp(s, Op.OP_OVER);
    else { pushNum(s, depth); appendOp(s, Op.OP_PICK); }
    s.stk.push(key);
  }
}

function bringRef(s: EmitState, ref: Ref, consumeContext: boolean, exitNeed: Map<string, number>): void {
  if (ref.k === 'const') { appendOp(s, ref.data); s.stk.push('#k'); return; }
  const key = keyOf(ref)!;
  if (consumeContext) {
    const remNode = s.useCount.get(key) ?? 0; // node-input uses remaining (incl. this one)
    const survives = remNode > 1 || (exitNeed.get(key) ?? 0) > 0;
    bring(s, key, !survives);
    s.useCount.set(key, remNode - 1);
  } else {
    const remExit = exitNeed.get(key) ?? 0;
    bring(s, key, !(remExit > 1));
    exitNeed.set(key, remExit - 1);
  }
}

// compute one DAG node on top of the stack, staging arguments in the callee's chosen
// entry order for permuted OP_INVOKE targets
function computeNode(s: EmitState, node: DagNode, exitNeed: Map<string, number>, calleePerms: Map<number, number[]>): void {
  s.remaining.delete(node.id);
  const perm = node.kind === 'invoke' ? calleePerms.get(node.code) : undefined;
  const staged = perm !== undefined ? perm.map((i) => node.ins[i]) : node.ins;
  staged.forEach((r) => bringRef(s, r, true, exitNeed));
  if (node.kind === 'invoke') { pushNum(s, node.code); appendOp(s, Op.OP_INVOKE); } else appendOp(s, node.code);
  s.stk.length -= node.ins.length;
  for (let j = 0; j < node.nout; j += 1) s.stk.push(`n${node.id}_${j}`);
}

interface EmitOptions {
  entrySeed?: string[]; // stack labels at block entry, bottom -> top (defaults to m0..mN-1)
  calleePerms?: Map<number, number[]>;
}

const NO_PERMS: Map<number, number[]> = new Map();
const BEAM_WIDTH = 4;
const BEAM_EXPAND = 3;

// Re-emit one block: seed the entry slots, compute the DAG nodes in a strategy-chosen
// dependency order (fetching each operand with the cheapest available move/copy), then
// assemble the exact exit layout and clean leftover slots.
function emitBlock(block: BasicBlock, strategy: Strategy, options: EmitOptions = {}): Script {
  const { entryDepth: n, entryAlt: p, exit, exitAlt } = block;
  const calleePerms = options.calleePerms ?? NO_PERMS;

  // topo order of needed nodes (memoised — the DAGs share subtrees heavily)
  const visited = new Set<number>();
  const order: DagNode[] = [];
  const visitNode = (node: DagNode): void => {
    if (visited.has(node.id)) return;
    visited.add(node.id);
    node.ins.forEach((ref) => { if (ref.k === 'out') visitNode(ref.node); });
    order.push(node);
  };
  [...exit, ...exitAlt].forEach((ref) => { if (ref.k === 'out') visitNode(ref.node); });

  // altstack passthrough: if the entry altstack is returned untouched and never read,
  // leave it there (emit zero alt ops)
  const altReferenced = exit.some((r) => r.k === 'ain') || order.some((nd) => nd.ins.some((r) => r.k === 'ain'));
  const exitAltPass = exitAlt.length === p && exitAlt.every((r, i) => r.k === 'ain' && r.i === i);
  const altPass = exitAltPass && !altReferenced;

  const useCount = new Map<string, number>();
  const exitNeed = new Map<string, number>();
  const bump = (map: Map<string, number>, key: string | undefined): void => {
    if (key !== undefined) map.set(key, (map.get(key) ?? 0) + 1);
  };
  order.forEach((nd) => nd.ins.forEach((r) => bump(useCount, keyOf(r))));
  [...exit, ...exitAlt].forEach((r) => bump(exitNeed, keyOf(r)));

  const initial: EmitState = {
    out: [], stk: [], useCount, remaining: new Set(order.map((nd) => nd.id)), cost: 0,
  };
  for (let i = 0; i < n; i += 1) initial.stk.push(options.entrySeed?.[i] ?? `m${i}`);
  if (!altPass) for (let i = 0; i < p; i += 1) { appendOp(initial, Op.OP_FROMALTSTACK); initial.stk.push(`a${p - 1 - i}`); }

  // fetch-cost heuristics for choosing the next ready node
  const pushBytesForDepth = (depth: number): number => (depth <= 16 ? 1 : 2);
  const fetchCostBytes = (s: EmitState, nd: DagNode): number => nd.ins.reduce((sum, r) => {
    if (r.k === 'const') return sum + Math.max(1, r.data.length);
    const key = keyOf(r)!;
    const idx = topmostIndex(s.stk, key);
    if (idx < 0) return sum;
    const depth = s.stk.length - 1 - idx;
    const lastUse = (s.useCount.get(key) ?? 0) <= 1 && (exitNeed.get(key) ?? 0) === 0;
    if (lastUse) return sum + (depth === 0 ? 0 : depth <= 2 ? 1 : pushBytesForDepth(depth) + 1);
    return sum + (depth <= 1 ? 1 : pushBytesForDepth(depth) + 1);
  }, 0);
  const fetchCostOp = (s: EmitState, nd: DagNode): number => nd.ins.reduce((sum, r) => {
    if (r.k === 'const') return sum + 100 + r.data.length;
    const key = keyOf(r)!;
    const idx = topmostIndex(s.stk, key);
    if (idx < 0) return sum;
    const depth = s.stk.length - 1 - idx;
    const lastUse = (s.useCount.get(key) ?? 0) <= 1 && (exitNeed.get(key) ?? 0) === 0;
    if (lastUse) return sum + (depth === 0 ? 0 : depth <= 2 ? 100 : 201 + NOMINAL_LEN + depth);
    return sum + (depth <= 1 ? 100 + NOMINAL_LEN : 201 + NOMINAL_LEN);
  }, 0);

  const inputNodeIds = (nd: DagNode): number[] => nd.ins.flatMap((r) => (r.k === 'out' ? [r.node.id] : []));
  const readyNodes = (s: EmitState): DagNode[] => order.filter(
    (nd) => s.remaining.has(nd.id) && inputNodeIds(nd).every((id) => !s.remaining.has(id)),
  );

  // assemble the exit layout on top (exit-main ++ reverse(exit-alt) unless alt passes
  // through), clean buried junk, and restore the altstack
  const finish = (s: EmitState): void => {
    const need = new Map(exitNeed);
    const desired = altPass ? [...exit] : [...exit, ...[...exitAlt].reverse()];
    const desiredKeys = desired.map((r) => (r.k === 'const' ? undefined : keyOf(r)));
    const inPlace = s.stk.length >= desired.length
      && desiredKeys.every((dk, i) => dk !== undefined && s.stk[s.stk.length - desired.length + i] === dk);
    if (!inPlace) desired.forEach((r) => bringRef(s, r, false, need));

    const K = desired.length;
    const junk = s.stk.length - K;
    if (junk > 0) {
      if (2 * K + junk <= 4 * junk) {
        for (let i = 0; i < K; i += 1) appendOp(s, Op.OP_TOALTSTACK);
        for (let i = 0; i < junk; i += 1) appendOp(s, Op.OP_DROP);
        for (let i = 0; i < K; i += 1) appendOp(s, Op.OP_FROMALTSTACK);
        s.stk = s.stk.slice(s.stk.length - K);
      } else {
        for (let i = 0; i < junk; i += 1) {
          pushNum(s, s.stk.length - 1); appendOp(s, Op.OP_ROLL); appendOp(s, Op.OP_DROP); s.stk.splice(0, 1);
        }
      }
    }
    if (!altPass) for (let i = 0; i < exitAlt.length; i += 1) appendOp(s, Op.OP_TOALTSTACK);
  };

  if (strategy !== 'beam') {
    const state = initial;
    while (state.remaining.size > 0) {
      const candidates = readyNodes(state);
      let node = candidates[0];
      if (strategy !== 'topo') {
        const cost = strategy === 'opcost' ? fetchCostOp : fetchCostBytes;
        let best = cost(state, candidates[0]);
        candidates.forEach((candidate) => {
          const c = cost(state, candidate);
          if (c < best) { best = c; node = candidate; }
        });
      }
      computeNode(state, node, exitNeed, calleePerms);
    }
    finish(state);
    return state.out;
  }

  // beam search: expand each surviving state by its BEAM_EXPAND cheapest ready nodes,
  // keep the BEAM_WIDTH cheapest accumulated schedules (all states have computed the
  // same number of nodes, so accumulated cost is comparable)
  let beam: EmitState[] = [initial];
  for (let step = 0; step < order.length; step += 1) {
    const next: EmitState[] = [];
    beam.forEach((state) => {
      const candidates = readyNodes(state)
        .map((nd) => ({ nd, c: fetchCostOp(state, nd) }))
        .sort((a, b) => a.c - b.c)
        .slice(0, BEAM_EXPAND);
      candidates.forEach(({ nd }) => {
        const branch = cloneState(state);
        computeNode(branch, nd, exitNeed, calleePerms);
        next.push(branch);
      });
    });
    next.sort((a, b) => a.cost - b.cost);
    beam = next.slice(0, BEAM_WIDTH);
  }
  let best: Script | undefined;
  let bestCost = Infinity;
  beam.forEach((state) => {
    finish(state);
    if (state.cost < bestCost) { bestCost = state.cost; best = state.out; }
  });
  // A dead-ended beam means no complete schedule was found; initial.out would be a script that
  // computed nothing, so fail closed — every caller catches and keeps the original body.
  if (best === undefined) throw new Error('beam search dead-ended without a complete schedule');
  return best;
}

// collapse adjacent single-item stack ops into their multi-item forms (all provably
// stack-equivalent; the main optimiser applies the same families of rewrites)
function peephole(script: Script): Script {
  const isN = (el: OpOrData | undefined, value: number): boolean => (
    el !== undefined && constNumOf(el) === value && constDataOf(el)!.length === 1
  );
  const isOp = (el: OpOrData | undefined, op: number): boolean => el !== undefined && typeof el === 'number' && el === op;
  let ops = script;
  let changed = true;
  while (changed) {
    changed = false;
    const out: Script = [];
    for (let i = 0; i < ops.length; i += 1) {
      const [a, b, c, d, e, f] = [ops[i], ops[i + 1], ops[i + 2], ops[i + 3], ops[i + 4], ops[i + 5]];
      if (isN(a, 2) && isOp(b, Op.OP_PICK) && isN(c, 2) && isOp(d, Op.OP_PICK) && isN(e, 2) && isOp(f, Op.OP_PICK)) {
        out.push(Op.OP_3DUP); i += 5; changed = true; continue;
      }
      if (isOp(a, Op.OP_OVER) && isOp(b, Op.OP_OVER)) { out.push(Op.OP_2DUP); i += 1; changed = true; continue; }
      if (isOp(a, Op.OP_SWAP) && isOp(b, Op.OP_OVER)) { out.push(Op.OP_TUCK); i += 1; changed = true; continue; }
      if (isOp(a, Op.OP_SWAP) && isOp(b, Op.OP_DROP)) { out.push(Op.OP_NIP); i += 1; changed = true; continue; }
      if (isN(a, 3) && isOp(b, Op.OP_PICK) && isN(c, 3) && isOp(d, Op.OP_PICK)) {
        out.push(Op.OP_2OVER); i += 3; changed = true; continue;
      }
      if (isN(a, 3) && isOp(b, Op.OP_ROLL) && isN(c, 3) && isOp(d, Op.OP_ROLL)) {
        out.push(Op.OP_2SWAP); i += 3; changed = true; continue;
      }
      if (isN(a, 5) && isOp(b, Op.OP_ROLL) && isN(c, 5) && isOp(d, Op.OP_ROLL)) {
        out.push(Op.OP_2ROT); i += 3; changed = true; continue;
      }
      out.push(a);
    }
    ops = out;
  }
  return ops;
}

// ---------- cost models ----------

// Static estimate of the schedule-dependent part of the BCH2026 op-cost meter. Value ops'
// own result pushes are identical across schedules of the same DAG and are left out; this
// RANKS schedules, it does not predict absolute cost.
export function opCostEstimate(script: Script): number {
  let cost = 0;
  for (let i = 0; i < script.length; i += 1) {
    cost += costOfAppend(i > 0 ? script[i - 1] : undefined, script[i]);
  }
  return cost;
}

const scriptCost = (script: Script, objective: 'size' | 'opcost'): number => (
  // redeem bytes still cost 1 op each in the scriptSig push, which doubles as a tiebreak
  objective === 'opcost' ? opCostEstimate(script) + calculateBytesize(script) : calculateBytesize(script)
);

// ---------- per-script rescheduling ----------

interface ItemMapping {
  oldStart: number;
  oldEnd: number; // exclusive
  newStart: number;
  newEnd: number; // exclusive
  rewritten: boolean;
}

interface RecompiledScript {
  script: Script;
  mapping: ItemMapping[];
  changed: boolean;
}

interface RecompileOptions {
  entryPerm?: number[]; // permuted entry layout of the FIRST block (bottom -> top holds slot perm[j])
  calleePerms?: Map<number, number[]>;
}

const isIdentityPerm = (perm: number[] | undefined): boolean => perm === undefined || perm.every((v, i) => v === i);

// over ALL block nodes (not just exit-reachable ones): a dead invoke of a permuted callee
// still stages its arguments in the raw ops, which would be the wrong order
const blockInvokesPermuted = (block: BasicBlock, calleePerms: Map<number, number[]>): boolean => (
  calleePerms.size > 0 && block.nodes.some((nd) => nd.kind === 'invoke' && calleePerms.has(nd.code))
);

// A node unreachable from the block's exit stacks is dead computation: its result never
// leaves the block. Since script failure aborts evaluation, rejecting the spend is the
// only observable effect such a node has — deleting it widens the set of accepted
// witnesses. The realistic case is a void function call (its require lives in the callee,
// so the call site is a zero-output invoke node, dead by construction); an `unused`
// variable's failure-capable initializer (e.g. a division) is the same hole. Blocks
// containing dead computation keep their original ops verbatim.
const hasDeadComputation = (block: BasicBlock): boolean => {
  if (block.nodes.length === 0) return false;
  const reachable = new Set<number>();
  const visitNode = (node: DagNode): void => {
    if (reachable.has(node.id)) return;
    reachable.add(node.id);
    node.ins.forEach((ref) => { if (ref.k === 'out') visitNode(ref.node); });
  };
  [...block.exit, ...block.exitAlt].forEach((ref) => { if (ref.k === 'out') visitNode(ref.node); });
  return block.nodes.some((node) => !reachable.has(node.id));
};

function recompileScript(
  script: Script,
  arities: Map<number, FunctionArity>,
  inArity: number,
  strategy: Strategy,
  objective: 'size' | 'opcost',
  options: RecompileOptions = {},
): RecompiledScript {
  const calleePerms = options.calleePerms ?? NO_PERMS;
  const items = decompile(script, arities, inArity);
  const out: Script = [];
  const mapping: ItemMapping[] = [];
  let changed = false;
  let firstBlock = true;
  items.forEach((item) => {
    if ('ctrl' in item) {
      mapping.push({
        oldStart: item.index, oldEnd: item.index + 1, newStart: out.length, newEnd: out.length + 1, rewritten: false,
      });
      out.push(item.ctrl);
      return;
    }
    const { block } = item;
    const entryPerm = firstBlock ? options.entryPerm : undefined;
    const entrySeed = entryPerm !== undefined ? entryPerm.map((slot) => `m${slot}`) : undefined;
    firstBlock = false;
    // the plain-cashc block is only a valid candidate under the standard entry layout
    // and standard callee conventions
    const rawValid = isIdentityPerm(entryPerm) && !blockInvokesPermuted(block, calleePerms);
    // a block with dead computation has no valid re-emission (see hasDeadComputation);
    // if the original ops are not valid either, this whole variant is unusable
    const dead = hasDeadComputation(block);
    if (dead && !rawValid) throw new Error('dead computation in a block that cannot keep its original ops');
    // per-block min(original, rescheduled): both reproduce the block's entry->exit
    // transform AND its boundary layout, so they compose freely
    const mine = dead ? undefined : peephole(emitBlock(block, strategy, { entrySeed, calleePerms }));
    const useMine = mine !== undefined
      && (!rawValid || scriptCost(mine, objective) < scriptCost(block.rawOps, objective));
    const chosen = useMine ? mine! : block.rawOps;
    mapping.push({
      oldStart: block.rawStart,
      oldEnd: block.rawEnd,
      newStart: out.length,
      newEnd: out.length + chosen.length,
      rewritten: useMine,
    });
    chosen.forEach((el) => out.push(el));
    if (useMine) changed = true;
  });
  return { script: out, mapping, changed };
}

// ---------- OP_DEFINE table dissection ----------

interface Dissected {
  order: number[];
  bodies: Map<number, Script>;
  tableLength: number; // element count of the define table prefix
  main: Script;
}

function dissect(script: Script): Dissected {
  const order: number[] = [];
  const bodies = new Map<number, Script>();
  let i = 0;
  while (i + 2 < script.length && script[i] instanceof Uint8Array && elOpcode(script[i + 2]) === Op.OP_DEFINE) {
    const id = constNumOf(script[i + 1]);
    if (id === undefined) break;
    bodies.set(id, bytecodeToScript(script[i] as Uint8Array));
    order.push(id);
    i += 3;
  }
  return { order, bodies, tableLength: i, main: script.slice(i) };
}

// function ids a body invokes (directly)
function bodyInvokes(body: Script): number[] {
  const ids: number[] = [];
  for (let i = 1; i < body.length; i += 1) {
    if (elOpcode(body[i]) === Op.OP_INVOKE) {
      const id = constNumOf(body[i - 1]);
      if (id !== undefined) ids.push(id);
    }
  }
  return ids;
}

// An OP_INVOKE whose callee id is not the immediately preceding constant is invisible to
// bodyInvokes, so a permuted callee would silently receive its arguments in the old order at
// such a call site — layout experiments must not run when one exists anywhere in the program.
const hasAmbiguousInvoke = (script: Script): boolean => script.some((el, i) => (
  elOpcode(el) === Op.OP_INVOKE && (i === 0 || constNumOf(script[i - 1]) === undefined)
));

// callee-first processing order over the call graph (declaration order on cycles)
function calleeFirstOrder(d: Dissected): number[] {
  const visited = new Set<number>();
  const out: number[] = [];
  const visit = (id: number): void => {
    if (visited.has(id) || !d.bodies.has(id)) return;
    visited.add(id);
    bodyInvokes(d.bodies.get(id)!).forEach(visit);
    out.push(id);
  };
  d.order.forEach(visit);
  return out;
}

// ---------- differential testing + measurement on a loosened VM ----------

// Loosened BCH2026 VM: lifts size/op-cost/stack caps so any single function body can run
// to completion on random inputs regardless of contract-level limits.
/* eslint-disable @typescript-eslint/no-explicit-any */
const loosenedConsensus: any = {
  ...ConsensusBch2025,
  baseInstructionCost: 100,
  maximumFunctionIdentifierLength: 7,
  maximumMemorySlots: Number.MAX_SAFE_INTEGER,
  maximumStandardLockingBytecodeLength: -1,
  maximumStandardUnlockingBytecodeLength: Number.MAX_SAFE_INTEGER,
  maximumTokenCommitmentLength: 128,
  operationCostBudgetPerByte: Number.MAX_SAFE_INTEGER,
  maximumStackItemLength: Number.MAX_SAFE_INTEGER,
  maximumVmNumberByteLength: Number.MAX_SAFE_INTEGER,
  maximumStackDepth: Number.MAX_SAFE_INTEGER,
  maximumControlStackDepth: Number.MAX_SAFE_INTEGER,
  maximumBytecodeLength: Number.MAX_SAFE_INTEGER,
  maximumOperationCount: Number.MAX_SAFE_INTEGER,
};

let cachedVm: any;
const looseVm = (): any => {
  cachedVm ??= createVirtualMachine(createInstructionSetBch2026(false, {
    consensus: loosenedConsensus, ripemd160, secp256k1, sha1, sha256,
  } as any));
  return cachedVm;
};
/* eslint-enable @typescript-eslint/no-explicit-any */

// deterministic pseudo-random test inputs (~254-bit values, matching wide int math)
const RND_MOD = 21888242871839275222246405745257275088696311157297823662689037894645226208583n;
const rnd = (seed: number): bigint => {
  let x = BigInt(seed + 7);
  for (let i = 0; i < 6; i += 1) x = (x * 6364136223846793005n + 1442695040888963407n) % RND_MOD;
  return x;
};

interface BodyRun { stack?: string[]; opCost: number; error?: string }

// run one function on the loosened VM. `inputPerm` stages the inputs in the target's
// (possibly permuted) entry order: stack position j receives inputs[perm[j]].
function runBody(
  d: Dissected, overrides: Map<number, Script>, targetId: number, inputs: bigint[], inputPerm?: number[],
): BodyRun {
  const program: Script = [];
  d.order.forEach((id) => {
    program.push(scriptToBytecode(overrides.get(id) ?? d.bodies.get(id)!), encodeInt(BigInt(id)), Op.OP_DEFINE);
  });
  const staged = inputPerm !== undefined ? inputPerm.map((i) => inputs[i]) : inputs;
  staged.forEach((input) => program.push(encodeInt(input)));
  program.push(encodeInt(BigInt(targetId)), Op.OP_INVOKE);
  const state = looseVm().evaluate(createTestAuthenticationProgramBch({
    lockingBytecode: scriptToBytecode(program), unlockingBytecode: Uint8Array.of(), valueSatoshis: 1000n,
  }));
  // the only expected "error" is the benign post-evaluation clean-stack check
  const benign = state.error === undefined || /Non-P2SH|clean stack|exactly one|single/i.test(String(state.error));
  return {
    stack: benign
      ? state.stack.map((item: Uint8Array) => (
        vmNumberToBigInt(item, { maximumVmNumberByteLength: Number.MAX_SAFE_INTEGER as never }).toString()
      ))
      : undefined,
    opCost: Number(state.metrics.operationCost),
    error: benign ? undefined : String(state.error),
  };
}

// The candidate (with all chosen overrides and its entry permutation) must reproduce the
// ORIGINAL body's output stack — original bodies all the way down, standard input order —
// on K random vectors.
function bodyEquiv(
  d: Dissected, overrides: Map<number, Script>, id: number,
  candidate: Script, arity: FunctionArity, perm: number[] | undefined, K = 3,
): boolean {
  for (let t = 0; t < K; t += 1) {
    const inputs = Array.from({ length: arity.in }, (_, i) => rnd(i * 17 + t * 1009 + id));
    const reference = runBody(d, new Map(), id, inputs);
    const candidateRun = runBody(d, new Map([...overrides, [id, candidate]]), id, inputs, perm);
    if (reference.stack === undefined || candidateRun.stack === undefined) return false;
    if (reference.stack.join() !== candidateRun.stack.join()) return false;
  }
  return true;
}

// summed measured op-cost of a body over K fixed random vectors (Infinity on any error)
function measureBody(
  d: Dissected, overrides: Map<number, Script>, id: number,
  arity: FunctionArity, perm: number[] | undefined, K = 3,
): number {
  let total = 0;
  for (let t = 0; t < K; t += 1) {
    const inputs = Array.from({ length: arity.in }, (_, i) => rnd(i * 23 + t * 811 + id));
    const run = runBody(d, overrides, id, inputs, perm);
    if (run.error !== undefined || run.stack === undefined) return Infinity;
    total += run.opCost;
  }
  return total;
}

// ---------- entry-layout candidates ----------

// Candidate argument orders for a body, derived from its first block's DAG: identity,
// reverse, earliest-first-use nearest the top, and most-used nearest the top. A `perm`
// maps stack position j (bottom -> top) to the original entry slot held there.
function layoutCandidates(body: Script, arities: Map<number, FunctionArity>, inArity: number): number[][] {
  const identity = Array.from({ length: inArity }, (_, i) => i);
  if (inArity < 2) return [identity];
  let items: Item[];
  try { items = decompile(body, arities, inArity); } catch { return [identity]; }
  const first = items.find((item): item is { block: BasicBlock } => 'block' in item);
  if (first === undefined) return [identity];

  const visited = new Set<number>();
  const order: DagNode[] = [];
  const visitNode = (node: DagNode): void => {
    if (visited.has(node.id)) return;
    visited.add(node.id);
    node.ins.forEach((ref) => { if (ref.k === 'out') visitNode(ref.node); });
    order.push(node);
  };
  [...first.block.exit, ...first.block.exitAlt].forEach((ref) => { if (ref.k === 'out') visitNode(ref.node); });

  const firstUse = new Array<number>(inArity).fill(Number.MAX_SAFE_INTEGER);
  const useCount = new Array<number>(inArity).fill(0);
  order.forEach((nd, t) => nd.ins.forEach((r) => {
    if (r.k !== 'in' || r.i >= inArity) return;
    firstUse[r.i] = Math.min(firstUse[r.i], t);
    useCount[r.i] += 1;
  }));

  // stable sorts; the deepest position gets the FIRST element of the sorted list
  const byFirstUseDesc = [...identity].sort((a, b) => (firstUse[b] - firstUse[a]) || (a - b));
  const byUseCountAsc = [...identity].sort((a, b) => (useCount[a] - useCount[b]) || (a - b));
  const reverse = [...identity].reverse();

  const seen = new Set<string>();
  return [identity, byFirstUseDesc, byUseCountAsc, reverse].filter((perm) => {
    const key = perm.join(',');
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

// ---------- body selection ----------

const BODY_STRATEGIES: Strategy[] = ['topo', 'greedy', 'opcost'];
const MAIN_STRATEGIES: Strategy[] = ['topo', 'greedy', 'opcost'];
// adopt a non-identity entry layout only if it beats the best identity variant by >1%
// (its call-site staging costs are not visible in the body-level measurement)
const LAYOUT_HYSTERESIS = 1.01;

interface BodyChoices {
  overrides: Map<number, Script>;
  perms: Map<number, number[]>;
}

// Reschedule every OP_DEFINE'd body; keep, per body, the best diff-test-equivalent
// candidate ('size': smallest bytes; 'opcost': smallest MEASURED op-cost). With
// `layouts`, entry-order permutations and a beam schedule join the candidate set, and
// bodies are processed callee-first so callers re-stage for their callees' chosen
// orders. Throws if a body whose callee was permuted has no valid replacement (the
// caller falls back to identity layouts wholesale).
function rescheduleBodies(
  d: Dissected, arities: Map<number, FunctionArity>, objective: 'size' | 'opcost', layouts: boolean,
): BodyChoices {
  const overrides = new Map<number, Script>();
  const perms = new Map<number, number[]>();
  const strategies: Strategy[] = layouts ? [...BODY_STRATEGIES, 'beam'] : BODY_STRATEGIES;
  const processing = layouts ? calleeFirstOrder(d) : d.order;

  processing.forEach((id) => {
    const arity = arities.get(id);
    const original = d.bodies.get(id)!;
    const calleesPermuted = bodyInvokes(original).some((callee) => perms.has(callee));
    if (arity === undefined) {
      if (calleesPermuted) throw new Error(`body ${id} invokes a permuted callee but has no arity`);
      return;
    }
    const bodyCost = (candidate: Script, perm: number[] | undefined): number => (
      objective === 'opcost'
        ? measureBody(d, new Map([...overrides, [id, candidate]]), id, arity, perm)
        : calculateBytesize(candidate)
    );

    let best: Script | undefined;
    let bestPerm: number[] | undefined;
    let bestCost = Infinity;
    // baseline: the untouched cashc body (only valid while its callees are unpermuted)
    if (!calleesPermuted) {
      bestCost = objective === 'opcost' ? measureBody(d, overrides, id, arity, undefined) : calculateBytesize(original);
    }

    const candidatesPerms = layouts ? layoutCandidates(original, arities, arity.in) : [undefined];
    candidatesPerms.forEach((perm) => {
      const identity = isIdentityPerm(perm as number[] | undefined);
      strategies.forEach((strategy) => {
        let candidate: Script;
        try {
          candidate = recompileScript(original, arities, arity.in, strategy, objective, {
            entryPerm: perm as number[] | undefined, calleePerms: perms,
          }).script;
        } catch { return; }
        const cost = bodyCost(candidate, identity ? undefined : (perm as number[]));
        const effective = identity ? cost : cost * LAYOUT_HYSTERESIS;
        const effectivePerm = identity ? undefined : (perm as number[]);
        if (effective < bestCost && bodyEquiv(d, overrides, id, candidate, arity, effectivePerm)) {
          best = candidate;
          bestPerm = identity ? undefined : (perm as number[]);
          bestCost = effective;
        }
      });
    });

    if (best !== undefined) {
      overrides.set(id, best);
      if (bestPerm !== undefined) perms.set(id, bestPerm);
    } else if (calleesPermuted) {
      // the original body is invalid under the new callee conventions and no candidate
      // validated — abort the layout experiment for this contract
      throw new Error(`no valid re-emission for body ${id} under permuted callees`);
    }
  });

  return { overrides, perms };
}

// ---------- debug-information remapping ----------

const mergeLocations = (locations: SingleLocationData[]): SingleLocationData => {
  const lowest = locations.reduce((low, cur) => {
    const { start: a } = low.location; const { start: b } = cur.location;
    return (b.line < a.line || (b.line === a.line && b.column < a.column)) ? cur : low;
  });
  const highest = locations.reduce((high, cur) => {
    const { end: a } = high.location; const { end: b } = cur.location;
    return (b.line > a.line || (b.line === a.line && b.column > a.column)) ? cur : high;
  });
  return {
    location: { start: lowest.location.start, end: highest.location.end },
    positionHint: locations[locations.length - 1]?.positionHint ?? PositionHint.START,
  };
};

// old element index -> new element index. Exact for untouched regions and preserved
// boundary opcodes; indices inside a rewritten block clamp to the block's last opcode
// (the closest instruction to the failing check for error attribution).
const indexRemapper = (mapping: ItemMapping[], offset: number) => (oldIndex: number): number => {
  if (oldIndex < offset) return oldIndex;
  const local = oldIndex - offset;
  for (const m of mapping) {
    if (local >= m.oldStart && local < m.oldEnd) {
      return offset + (m.rewritten ? Math.max(m.newStart, m.newEnd - 1) : m.newStart + (local - m.oldStart));
    }
  }
  const last = mapping[mapping.length - 1];
  return offset + (last?.newEnd ?? 0) + (local - (last?.oldEnd ?? 0));
};

function remapLocationData(locationData: FullLocationData, mapping: ItemMapping[], offset: number): FullLocationData {
  const out: FullLocationData = locationData.slice(0, offset);
  mapping.forEach((m) => {
    const slice = locationData.slice(offset + m.oldStart, offset + m.oldEnd);
    if (!m.rewritten) { slice.forEach((entry) => out.push(entry)); return; }
    const merged = slice.length > 0 ? mergeLocations(slice) : locationData[offset + m.oldStart - 1];
    for (let i = m.newStart; i < m.newEnd; i += 1) out.push(merged);
  });
  return out;
}

// ---------- the pass ----------

export function applyStackRescheduling(
  optimised: OptimiseBytecodeResult,
  frames: DebugFrame[],
  options: RescheduleOptions,
): RescheduleOutcome {
  const { arities, objective, constructorParamLength } = options;
  const d = dissect(optimised.script);

  // 1. bodies (skipped for a body with console.log entries — wholesale reordering cannot
  // preserve per-instruction log data)
  const framesByBytecode = new Map(frames.map((frame) => [frame.bytecode, frame]));
  const loggedBodies = new Set(
    d.order.filter((id) => {
      const frame = framesByBytecode.get(binToHex(scriptToBytecode(d.bodies.get(id)!)));
      return (frame?.logs.length ?? 0) > 0;
    }),
  );
  const loggableArities = new Map([...arities].filter(([id]) => !loggedBodies.has(id)));

  let choices: BodyChoices;
  // The layout search needs main to be re-writable (it may have to re-stage arguments), and
  // every call site in the whole program must be `<id const> OP_INVOKE` — see hasAmbiguousInvoke.
  const allScripts = [d.main, ...d.order.map((id) => d.bodies.get(id)!)];
  const layouts = optimised.logs.length === 0 && !allScripts.some(hasAmbiguousInvoke);
  const debug = process.env.CASHC_DEBUG_RESCHEDULE !== undefined;
  try {
    choices = rescheduleBodies(d, loggableArities, objective, layouts);
    if (debug && layouts) {
      // eslint-disable-next-line no-console
      console.error(`[reschedule] layouts: ${choices.perms.size} permuted of ${d.order.length} bodies (${[...choices.perms.keys()].join(',')})`);
    }
  } catch (e) {
    if (debug) console.error(`[reschedule] layout experiment fell back to identity: ${(e as Error).message}`); // eslint-disable-line no-console
    // the layout experiment failed validation somewhere — identity layouts wholesale
    choices = rescheduleBodies(d, loggableArities, objective, false);
  }
  let { overrides } = choices;
  let { perms } = choices;

  // 2. main routine (kept as-is when the contract logs to console). When any callee's
  // entry layout changed, main MUST be re-emitted (its raw call sites stage the old
  // order); if that fails, redo everything with identity layouts.
  let main = d.main;
  let mainMapping: ItemMapping[] | undefined;
  const rescheduleMain = (): boolean => {
    // main MUST be re-emitted only when it itself stages arguments for a permuted callee;
    // permuted inner helpers (reached through other bodies) don't affect its call sites
    const needsReemit = perms.size > 0 && bodyInvokes(d.main).some((id) => perms.has(id));
    let best: RecompiledScript | undefined;
    let bestCost = needsReemit ? Infinity : scriptCost(d.main, objective);
    MAIN_STRATEGIES.forEach((strategy) => {
      let candidate: RecompiledScript;
      try {
        candidate = recompileScript(d.main, arities, options.mainInArity, strategy, objective, { calleePerms: perms });
      } catch (e) {
        if (debug) console.error(`[reschedule] main (${strategy}) failed: ${(e as Error).message}`); // eslint-disable-line no-console
        return;
      }
      const cost = scriptCost(candidate.script, objective);
      if (cost < bestCost && candidate.changed) { best = candidate; bestCost = cost; }
    });
    if (best !== undefined) { main = best.script; mainMapping = best.mapping; }
    return best !== undefined || !needsReemit;
  };
  if (optimised.logs.length === 0) {
    if (!rescheduleMain() && perms.size > 0) {
      ({ overrides, perms } = rescheduleBodies(d, loggableArities, objective, false));
      main = d.main;
      mainMapping = undefined;
      rescheduleMain();
    }
  } else if (perms.size > 0) {
    // main cannot be re-emitted (logs) so callee conventions must stay standard
    ({ overrides, perms } = rescheduleBodies(d, loggableArities, objective, false));
  }

  if (debug) {
    // eslint-disable-next-line no-console
    console.error(`[reschedule] final: overrides=${overrides.size} perms=${perms.size} mainRewritten=${mainMapping !== undefined}`);
  }
  if (overrides.size === 0 && mainMapping === undefined) return { result: optimised, frames };

  // 3. rebuild the script with the rescheduled bodies + main
  const script: Script = [];
  d.order.forEach((id) => {
    script.push(scriptToBytecode(overrides.get(id) ?? d.bodies.get(id)!), encodeInt(BigInt(id)), Op.OP_DEFINE);
  });
  main.forEach((el) => script.push(el));

  // 4. remap top-level debug structures across the main rewrite (the define-table prefix
  // is index-stable: body pushes change bytes, not element positions)
  let { locationData, requires, sourceTags } = optimised;
  if (mainMapping !== undefined) {
    const remap = indexRemapper(mainMapping, d.tableLength);
    locationData = remapLocationData(locationData, mainMapping, d.tableLength);
    requires = requires.map((req: RequireStatement) => ({
      ...req,
      ip: remap(req.ip - constructorParamLength) + constructorParamLength,
    }));
    sourceTags = sourceTags.map((tag: SourceTagEntry) => ({
      ...tag,
      startIndex: remap(tag.startIndex),
      endIndex: remap(tag.endIndex),
    }));
  }

  // 5. refresh the debug frames of rescheduled bodies: coarse (whole-function) source
  // map, requires re-anchored to their preserved boundaries, tags dropped
  const newFrames = frames.map((frame) => {
    const id = d.order.find((candidate) => binToHex(scriptToBytecode(d.bodies.get(candidate)!)) === frame.bytecode);
    if (id === undefined || !overrides.has(id)) return frame;
    const body = overrides.get(id)!;
    // The frame carries no whole-definition location, so span its own source map instead
    // (first entry's start to last entry's end).
    const frameLocations = sourceMapToLocationData(frame.sourceMap);
    const wholeLocation: SingleLocationData = {
      location: {
        start: frameLocations[0].location.start,
        end: frameLocations[frameLocations.length - 1].location.end,
      },
      positionHint: PositionHint.START,
    };
    const bodyLocationData: FullLocationData = new Array(body.length).fill(wholeLocation);
    // block-accurate require remapping is not tracked per body (candidates are selected
    // per strategy); clamp every ip into the new body's range instead
    const maxIp = Math.max(0, body.length - 1);
    return {
      ...frame,
      bytecode: binToHex(scriptToBytecode(body)),
      sourceMap: generateSourceMap(bodyLocationData),
      requires: frame.requires.map((req) => ({ ...req, ip: Math.min(req.ip, maxIp) })),
      ...(frame.sourceTags !== undefined ? { sourceTags: undefined } : {}),
    };
  });

  // Inline ranges are not remapped across a main rewrite (TODO: remap them alongside requires);
  // dropping them degrades inlined-callable attribution gracefully instead of pointing debuggers
  // at the wrong instructions.
  const inlineRanges = mainMapping === undefined ? optimised.inlineRanges : [];

  return {
    result: {
      ...optimised, script, locationData, requires, sourceTags, inlineRanges,
    },
    frames: newFrames,
  };
}
