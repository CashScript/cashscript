import { PrimitiveType } from '@cashscript/utils';
import {
  BlockNode,
  FunctionDefinitionNode,
  Node,
  NullaryOpNode,
  TimeOpNode,
} from '../ast/AST.js';
import AstTraversal from '../ast/AstTraversal.js';
import { TimeOp } from '../ast/Globals.js';
import { Location } from '../ast/Location.js';
import { NullaryOperator } from '../ast/Operator.js';

// Per BCH consensus, `tx.locktime` is only protocol-enforced if at least one input has a
// non-final sequence number — a property that `OP_CHECKLOCKTIMEVERIFY` (i.e. `tx.time`)
// implicitly requires. This pass scans each function for `tx.locktime` references that are
// not already covered by a `require(tx.time >= ...)` check on the same execution path, and
// prepends `require(tx.time >= tx.locktime)` to the function body when needed.
export default class InjectLocktimeGuardTraversal extends AstTraversal {
  private hasTimeCheckOnPath = false;
  private functionNeedsGuard = false;

  visitFunctionDefinition(node: FunctionDefinitionNode): Node {
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

    // Check whether there are any `require(tx.time >= ...)` checks on the same execution path, BEFORE entering the
    // block body. So even if there are `require(tx.time >= ...)` after the `tx.locktime` access, it counts as a time check
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

function isLocktimeCheck(statement: Node): boolean {
  return statement instanceof TimeOpNode && statement.timeOp === TimeOp.CHECK_LOCKTIME;
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
