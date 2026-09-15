import { PrimitiveType } from '@cashscript/utils';
import {
  BlockNode,
  ContractNode,
  FunctionCallNode,
  FunctionDefinitionNode,
  IntLiteralNode,
  Node,
  NullaryOpNode,
  SourceFileNode,
  TimeOpNode,
} from '../ast/AST.js';
import AstTraversal from '../ast/AstTraversal.js';
import { TimeOp } from '../ast/Globals.js';
import { Location } from '../ast/Location.js';
import { NullaryOperator } from '../ast/Operator.js';

// Per BCH consensus, `tx.locktime` is only protocol-enforced if at least one input has a non-final
// sequence number. A require(tx.time >= ...) check — or a require(this.age >= ...) with a compile-time
// int literal below 2^31 — forces that non-finality. When a spending path uses `tx.locktime` without
// such a check, we inject a synthetic require(tx.time >= tx.locktime) guard at the start of the function.
export default class InjectLocktimeGuardTraversal extends AstTraversal {
  // Keep track of which global functions require a locktime guard when called.
  private globalFunctionRequiresLocktimeGuard = new Map<FunctionDefinitionNode, boolean>();

  visitSourceFile(node: SourceFileNode): Node {
    // Only contract spending functions are traversed (and guarded); globals are analysed on demand.
    node.contract = this.visitOptional(node.contract) as ContractNode | undefined;
    return node;
  }

  visitFunctionDefinition(node: FunctionDefinitionNode): Node {
    if (this.requiresLocktimeGuard(node.body)) {
      node.body.statements = [createLocktimeGuard(node), ...(node.body.statements ?? [])];
    }
    return node;
  }

  private requiresLocktimeGuard(body: BlockNode): boolean {
    const analyser = new LocktimeGuardRequirementAnalyser((func) => this.checkGlobalFunctionRequiresLocktimeGuard(func));
    analyser.visit(body);
    return analyser.requiresLocktimeGuard;
  }

  // Memoised, cycle-safe analysis of a single global function.
  private checkGlobalFunctionRequiresLocktimeGuard(func: FunctionDefinitionNode): boolean {
    const memoised = this.globalFunctionRequiresLocktimeGuard.get(func);
    if (memoised !== undefined) return memoised;

    this.globalFunctionRequiresLocktimeGuard.set(func, false); // seed: a re-entrant (cyclic) call contributes nothing
    const requiresLocktimeGuard = this.requiresLocktimeGuard(func.body);
    this.globalFunctionRequiresLocktimeGuard.set(func, requiresLocktimeGuard);
    return requiresLocktimeGuard;
  }
}

class LocktimeGuardRequirementAnalyser extends AstTraversal {
  requiresLocktimeGuard = false;
  private isAlreadyCovered = false;

  constructor(
    private checkGlobalFunctionRequiresLocktimeGuard: (func: FunctionDefinitionNode) => boolean,
  ) {
    super();
  }

  visitBlock(node: BlockNode): Node {
    const enclosingIsAlreadyCovered = this.isAlreadyCovered;

    // A time check anywhere in this block covers the whole block (order within the block is irrelevant);
    // a sibling branch's check does not, since each branch body is its own block.
    if (node.statements?.some(isLocktimeCheck)) {
      this.isAlreadyCovered = true;
    }

    super.visitBlock(node);

    this.isAlreadyCovered = enclosingIsAlreadyCovered;
    return node;
  }

  visitNullaryOp(node: NullaryOpNode): Node {
    if (node.operator === NullaryOperator.LOCKTIME && !this.isAlreadyCovered) {
      this.requiresLocktimeGuard = true;
    }
    return node;
  }

  visitFunctionCall(node: FunctionCallNode): Node {
    node = super.visitFunctionCall(node) as FunctionCallNode;
    if (this.isAlreadyCovered) return node;

    const functionDefinition = node.identifier.symbol?.definition;
    if (!functionDefinition || !(functionDefinition instanceof FunctionDefinitionNode)) return node;

    if (this.checkGlobalFunctionRequiresLocktimeGuard(functionDefinition)) {
      this.requiresLocktimeGuard = true;
    }

    return node;
  }
}

// Note that `require(tx.time >= ...)` checks are always sufficient to enforce the non-finality of the spending input,
// while `require(this.age >= ...)` checks are only sufficient when the operand is a compile-time int literal below 2^31.
function isLocktimeCheck(statement: Node): boolean {
  if (statement instanceof TimeOpNode) {
    if (statement.timeOp === TimeOp.CHECK_LOCKTIME) return true;
    if (statement.timeOp === TimeOp.CHECK_SEQUENCE) {
      return statement.expression instanceof IntLiteralNode && statement.expression.value < 2_147_483_648;
    }
  }
  return false;
}

function createLocktimeGuard(funcNode: FunctionDefinitionNode): TimeOpNode {
  const guardLocation = new Location(funcNode.body.location.start, funcNode.body.location.start);

  const expression = new NullaryOpNode(NullaryOperator.LOCKTIME);
  expression.type = PrimitiveType.INT;
  expression.location = guardLocation;

  const message = 'Using tx.locktime requires a non-final sequence number on the spending input';
  const guard = new TimeOpNode(TimeOp.CHECK_LOCKTIME, expression, message);
  guard.location = guardLocation;
  guard.isGuard = true;
  return guard;
}
