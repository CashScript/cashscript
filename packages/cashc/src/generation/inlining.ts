import {
  encodeInt,
  OptimizationTarget,
  OptimiseBytecodeResult,
  Script,
  scriptToBytecode,
} from '@cashscript/utils';
import {
  AssignNode,
  BlockNode,
  DoWhileNode,
  ForNode,
  FunctionCallNode,
  FunctionDefinitionNode,
  Node,
  SourceFileNode,
  VariableDefinitionNode,
  WhileNode,
} from '../ast/AST.js';
import AstTraversal from '../ast/AstTraversal.js';
import { Symbol } from '../ast/SymbolTable.js';
import type { InternalCompilerOptions } from '../compiler.js';

export const shouldInline = (
  symbol: Symbol,
  optimisedResult: OptimiseBytecodeResult,
  reachableCalls: FunctionCallNode[],
  entryReachableCalls: FunctionCallNode[][],
  loopResidentFunctions: Set<FunctionDefinitionNode>,
  nextFunctionId: number,
  compilerOptions: InternalCompilerOptions,
): boolean => {
  if (compilerOptions.disableInlining) return false;
  if (symbol.functionId !== undefined) return false;

  // Loop-resident functions stay OP_DEFINE'd to avoid stepping cost. Tiny bodies (<= 2 script
  // elements) are exempt: inlined they step no more opcodes than the 2-op invoke site even when
  // skipped and execute fewer when taken, so the op-cost axis cannot lose. Bytes can still lose
  // (a 2-element body may carry a large push), so whether inlining actually happens is still
  // decided by the byte model below.
  const definition = symbol.definition;
  if (
    definition instanceof FunctionDefinitionNode
    && loopResidentFunctions.has(definition)
    && optimisedResult.script.length > 2
  ) {
    return false;
  }

  const callCount = reachableCalls.filter((call) => call.identifier.symbol === symbol).length;
  const entryCallCounts = entryReachableCalls
    .map((calls) => calls.filter((call) => call.identifier.symbol === symbol).length);
  return isWorthInlining(nextFunctionId, optimisedResult.script, callCount, entryCallCounts, compilerOptions.optimizeFor);
};

// Op-cost accounting (CHIP-2021-05 VM limits): every evaluated instruction costs a base 100 and
// stack pushes add 1 per pushed byte, so sharing a body of B bytes (1-byte funcid) pays
// <body push> <id push> OP_DEFINE = 301 + 2B once per spend (OP_DEFINE re-prices the body's
// stack-pushed bytes) plus <id push> OP_INVOKE = 201 per call, while an inlined body executes at
// identical cost to an invoked one. For EXECUTED call sites inlining therefore always wins
// op-cost, so under the 'opcost' objective tiny bodies inline regardless of use count. The cap
// bounds the collateral bytes: each inlined call site costs B bytes instead of the ~2-byte invoke
// site, so 6 tolerates ~4 extra bytes per additional call site (~50 op-cost bought per byte).
// Loop-resident bodies are excluded before this rule (stepping a skipped inlined body costs
// 100/opcode per ITERATION), and the density guard below excludes bodies whose call sites are
// spread across contract entry functions.
const OPCOST_INLINE_MAX_BODY_BYTES = 6;

function isWorthInlining(
  candidateFunctionId: number,
  bodyScript: Script,
  callCount: number,
  entryCallCounts: number[],
  optimizeFor?: OptimizationTarget,
): boolean {
  const bodyBytes = scriptToBytecode(bodyScript).length;
  if (
    optimizeFor !== 'size'
    && bodyBytes <= OPCOST_INLINE_MAX_BODY_BYTES
    && passesDensityGuard(entryCallCounts, bodyScript.length, bodyBytes)
  ) {
    return true;
  }

  const idBytes = scriptToBytecode([encodeInt(BigInt(candidateFunctionId))]).length;

  // The define site pushes the body as data, so it carries a push-length prefix; serializing the
  // wrapped body computes prefix + body exactly at any size.
  const bodyPushBytes = scriptToBytecode([scriptToBytecode(bodyScript)]).length;
  const bytesWhenDefined = bodyPushBytes + idBytes + 1 + callCount * (idBytes + 1);
  const bytesWhenInlined = callCount * bodyBytes;

  return bytesWhenInlined <= bytesWhenDefined;
}

// A multi-function contract compiles into one script with a selector branch per entry function,
// and the VM steps (and charges 100/opcode for) the branches a spend does NOT take. An inlined
// copy in an untaken branch therefore costs 100 x elements per spend where an invoke site costs
// 200 — so a tiny body is only forced inline when no spend path can lose op-cost: for every entry
// function, the extra stepping of the OTHER entries' copies must not exceed what inlining saves
// (the one-time define and the entry's own invoke overhead). Single-entry contracts pass
// trivially (no other branches); bodies of <= 2 elements pass at any spread (a copy steps no more
// than the invoke site it replaces). No spend-frequency assumptions: the bound must hold for
// every entry. Call sites inside still-defined helpers are attributed to every entry reaching the
// helper, an over-approximation that only makes the guard more conservative (keeps OP_DEFINE and
// forgoes at most the 201/call invoke saving — never a stepping regression).
function passesDensityGuard(entryCallCounts: number[], bodyElements: number, bodyBytes: number): boolean {
  if (bodyElements <= 2) return true;
  const totalCalls = entryCallCounts.reduce((total, count) => total + count, 0);
  const defineCost = 301 + 2 * bodyBytes;
  return entryCallCounts.every((count) => (
    100 * (bodyElements - 2) * (totalCalls - count) <= defineCost + 201 * count
  ));
}

class FunctionCallCollector extends AstTraversal {
  functionCalls: FunctionCallNode[] = [];

  visitFunctionCall(node: FunctionCallNode): Node {
    this.functionCalls.push(node);
    node.parameters = this.visitList(node.parameters);
    return node;
  }
}

export function collectFunctionCalls(node: Node): FunctionCallNode[] {
  const collector = new FunctionCallCollector();
  collector.visit(node);
  return collector.functionCalls;
}

// Call sites reachable from each contract entry function: the entry's own body plus the bodies
// of every global function it (transitively) calls. Feeds the inlining density guard, which
// needs to know how a callee's call sites distribute over the selector branches.
export function collectEntryReachableCalls(node: SourceFileNode): FunctionCallNode[][] {
  return (node.contract?.functions ?? []).map((entry) => {
    const calls = [...collectFunctionCalls(entry)];
    const seen = new Set<FunctionDefinitionNode>();
    const queue = callDefinitions(calls);
    while (queue.length > 0) {
      const definition = queue.shift()!;
      if (seen.has(definition)) continue;
      seen.add(definition);
      const inner = collectFunctionCalls(definition.body);
      calls.push(...inner);
      queue.push(...callDefinitions(inner));
    }
    return calls;
  });
}

const callDefinitions = (calls: FunctionCallNode[]): FunctionDefinitionNode[] => calls
  .map((call) => call.identifier.symbol?.definition)
  .filter((definition): definition is FunctionDefinitionNode => definition instanceof FunctionDefinitionNode);

export function isRecursive(func: FunctionDefinitionNode): boolean {
  return transitiveCalledFunctions(func).includes(func);
}

function transitiveCalledFunctions(func: FunctionDefinitionNode): FunctionDefinitionNode[] {
  const callees: FunctionDefinitionNode[] = [];

  const visit = (current: FunctionDefinitionNode): void => calledFunctions(current).forEach((callee) => {
    if (callees.includes(callee)) return;
    callees.push(callee);
    visit(callee);
  });

  visit(func);
  return callees;
}

function calledFunctions(func: FunctionDefinitionNode): FunctionDefinitionNode[] {
  return collectFunctionCalls(func.body)
    .map((call) => call.identifier.symbol?.definition)
    .filter((definition): definition is FunctionDefinitionNode => definition instanceof FunctionDefinitionNode)
    .filter((definition, index, definitions) => definitions.indexOf(definition) === index);
}

// Functions that must stay OP_DEFINE'd because a call site sits inside a loop — directly, or via
// the callee chain of such a function. Splicing a body into a loop makes every iteration step over
// it, and the VM charges per-opcode cost even for opcodes in an untaken branch, so a small byte
// saving multiplies into a large op-cost regression (measured ~2.8x on sparse-input double-and-add
// loops, where the group-law body sits in a rarely-taken `if`). With OP_DEFINE the skipped call
// site costs 2 stepped opcodes instead of the whole body.
//
// The callee closure protects callees on CONDITIONAL paths inside a loop-resident caller: the
// caller's defined body is stepped end-to-end on every invoke, so a callee inlined into one of its
// untaken branches would be stepped per invocation too. A callee on the caller's always-path is
// stepped ≈ executed either way, so excluding it over-approximates — but the residual cost is only
// ~2 stepped ops per invocation (paid on every call) plus ~5 define bytes per function, so the
// closure is kept coarse rather than branch-aware. Same
// deliberate imprecision for always-executed call sites directly in loops: inlining there would
// actually save the 2 invoke ops per iteration, but the asymmetry (2 ops/iteration sacrificed vs
// ~100×body-size/iteration protected) makes conservative the right default.
export function collectLoopResidentFunctions(node: SourceFileNode): Set<FunctionDefinitionNode> {
  const loopResident = new Set<FunctionDefinitionNode>();
  let loopDepth = 0;

  const collector = new class extends AstTraversal {
    visitWhile(n: WhileNode): Node {
      loopDepth += 1;
      const result = super.visitWhile(n);
      loopDepth -= 1;
      return result;
    }

    visitDoWhile(n: DoWhileNode): Node {
      loopDepth += 1;
      const result = super.visitDoWhile(n);
      loopDepth -= 1;
      return result;
    }

    visitFor(n: ForNode): Node {
      // The init statement runs once, before OP_BEGIN, so a call there is not loop-resident;
      // only the condition, update, and body are re-stepped every iteration.
      n.init = this.visit(n.init) as VariableDefinitionNode | AssignNode;
      loopDepth += 1;
      n.condition = this.visit(n.condition);
      n.update = this.visit(n.update) as AssignNode;
      n.block = this.visit(n.block) as BlockNode;
      loopDepth -= 1;
      return n;
    }

    visitFunctionCall(n: FunctionCallNode): Node {
      const definition = n.identifier.symbol?.definition;
      if (loopDepth > 0 && definition instanceof FunctionDefinitionNode) loopResident.add(definition);
      return super.visitFunctionCall(n);
    }
  }();

  node.functions.forEach((func) => collector.visit(func.body));
  if (node.contract) collector.visit(node.contract);

  // Close over the callee chain of every loop-resident function.
  const queue = [...loopResident];
  while (queue.length > 0) {
    calledFunctions(queue.shift()!).forEach((callee) => {
      if (loopResident.has(callee)) return;
      loopResident.add(callee);
      queue.push(callee);
    });
  }

  return loopResident;
}
