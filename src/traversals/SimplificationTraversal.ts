import {
  IdentifierNode,
  BranchNode,
  CastNode,
  FunctionCallNode,
  UnaryOpNode,
  BinaryOpNode,
  BlockNode,
  SizeOpNode,
  SpliceOpNode,
  LiteralNode,
} from '../ast/AST';
import AstTraversal from '../ast/AstTraversal';
import { applyUnaryOperator, applyBinaryOperator } from '../ast/Operator';

export default class SimplificationTraversal extends AstTraversal {
  // TODO
  visitBranch(node: BranchNode) {
    node.condition = this.visit(node.condition);
    node.ifBlock = this.visit(node.ifBlock) as BlockNode;
    node.elseBlock = this.visitOptional(node.elseBlock);
    return node;
  }

  // TODO
  visitCast(node: CastNode) {
    node.expression = this.visit(node.expression);
    return node;
  }

  // TODO
  visitSizeOp(node: SizeOpNode) {
    node.object = this.visit(node.object);
    return node;
  }

  // TODO
  visitSpliceOp(node: SpliceOpNode) {
    node.object = this.visit(node.object);
    node.index = this.visit(node.index);
    return node;
  }

  // TODO
  visitFunctionCall(node: FunctionCallNode) {
    node.identifier = this.visit(node.identifier) as IdentifierNode;
    node.parameters = this.visitList(node.parameters);
    return node;
  }

  visitBinaryOp(node: BinaryOpNode) {
    node.left = this.visit(node.left);
    node.right = this.visit(node.right);
    if (node.left instanceof LiteralNode && node.right instanceof LiteralNode) {
      return applyBinaryOperator(node.left, node.operator, node.right);
    }
    return node;
  }

  visitUnaryOp(node: UnaryOpNode) {
    node.expression = this.visit(node.expression);
    if (node.expression instanceof LiteralNode) {
      return applyUnaryOperator(node.operator, node.expression);
    }
    return node;
  }
}
