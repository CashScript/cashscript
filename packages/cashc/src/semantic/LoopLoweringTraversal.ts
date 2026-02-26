import {
  Node,
  ExpressionNode,
  BlockNode,
  BranchNode,
  DoWhileNode,
  WhileNode,
  ForNode,
  VariableDefinitionNode,
  AssignNode,
} from '../ast/AST.js';
import AstTraversal from '../ast/AstTraversal.js';

export default class LoopLoweringTraversal extends AstTraversal {
  visitWhile(node: WhileNode): Node {
    const loweredBody = this.visit(node.block) as BlockNode;
    const condPre = this.cloneExpression(node.condition);
    const condLoop = this.cloneExpression(node.condition);

    const doWhile = new DoWhileNode(condLoop, loweredBody);
    doWhile.location = node.location;

    const ifBlock = new BlockNode([doWhile]);
    ifBlock.location = loweredBody.location;

    const branch = new BranchNode(condPre, ifBlock);
    branch.location = node.location;

    return branch;
  }

  visitFor(node: ForNode): Node {
    const init = this.visit(node.init) as VariableDefinitionNode | AssignNode;
    const condPre = this.cloneExpression(node.condition);
    const condLoop = this.cloneExpression(node.condition);
    const update = this.visit(node.update) as AssignNode;
    const loweredBody = this.visit(node.block) as BlockNode;

    const doWhileBody = new BlockNode([...(loweredBody.statements ?? []), update]);
    doWhileBody.location = loweredBody.location;

    const doWhile = new DoWhileNode(condLoop, doWhileBody);
    doWhile.location = node.location;

    const ifBlock = new BlockNode([doWhile]);
    ifBlock.location = loweredBody.location;

    const branch = new BranchNode(condPre, ifBlock);
    branch.location = node.location;

    // Preserve for-loop init scoping by wrapping init + lowered loop in a block.
    const scopedBlock = new BlockNode([init, branch]);
    scopedBlock.location = node.location;

    return scopedBlock;
  }

  private cloneNode<T>(value: T): T {
    if (value === null || typeof value !== 'object') return value;

    if (Array.isArray(value)) {
      return value.map((item) => this.cloneNode(item)) as T;
    }

    if (value instanceof Uint8Array) {
      return new Uint8Array(value) as T;
    }

    const clone = Object.create(Object.getPrototypeOf(value)) as Record<string, unknown>;
    Object.keys(value).forEach((key) => {
      clone[key] = this.cloneNode((value as Record<string, unknown>)[key]);
    });

    return clone as T;
  }

  private cloneExpression(node: ExpressionNode): ExpressionNode {
    const clone = this.cloneNode(node);
    clone.location = node.location;
    clone.type = node.type;
    return clone;
  }
}
