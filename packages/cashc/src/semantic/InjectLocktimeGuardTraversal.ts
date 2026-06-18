import { PrimitiveType } from '@cashscript/utils';
import {
  BlockNode,
  FunctionDefinitionNode,
  IntLiteralNode,
  Node,
  NullaryOpNode,
  TimeOpNode,
} from '../ast/AST.js';
import AstTraversal from '../ast/AstTraversal.js';
import { TimeOp } from '../ast/Globals.js';
import { Location } from '../ast/Location.js';
import { NullaryOperator } from '../ast/Operator.js';

// Per BCH consensus, `tx.locktime` is only protocol-enforced if at least one input has a non-final sequence number
// If a require(tx.time >= ...) check or a require(this.age >= ...) with a compile-time int literal below 2^31 is
// present, then `tx.locktime` is protocol-enforced. If no such check is present, then we add a
// synthetic require(tx.time >= tx.locktime) check.
export default class InjectLocktimeGuardTraversal extends AstTraversal {
  private hasTimeCheckOnPath = false;
  private functionNeedsGuard = false;

  visitFunctionDefinition(node: FunctionDefinitionNode): Node {
    // User-defined (value-returning) functions are compiled to standalone OP_DEFINE routines and
    // never form a top-level spending path on their own, so they do not get a locktime guard.
    if (node.isUserFunction) {
      return node;
    }

    this.hasTimeCheckOnPath = false;
    this.functionNeedsGuard = false;

    super.visitFunctionDefinition(node);

    if (this.functionNeedsGuard) {
      node.body.statements = [createLocktimeGuard(node), ...(node.body.statements ?? [])];
    }
    return node;
  }

  visitBlock(node: BlockNode): Node {
    const previous = this.hasTimeCheckOnPath;

    // Check whether there are any locktime checks on the same execution path, BEFORE entering the block body.
    // So even if there are locktime checks after the `tx.locktime` access, it counts as a locktime check
    if (node.statements?.some(isLocktimeCheck)) {
      this.hasTimeCheckOnPath = true;
    }
    super.visitBlock(node);
    this.hasTimeCheckOnPath = previous;
    return node;
  }

  visitNullaryOp(node: NullaryOpNode): Node {
    if (node.operator === NullaryOperator.LOCKTIME && !this.hasTimeCheckOnPath) {
      this.functionNeedsGuard = true;
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
