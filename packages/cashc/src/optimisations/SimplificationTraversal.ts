// import {
//   IdentifierNode,
//   BranchNode,
//   CastNode,
//   FunctionCallNode,
//   UnaryOpNode,
//   BinaryOpNode,
//   BlockNode,
//   SizeOpNode,
//   SplitOpNode,
//   LiteralNode,
//   StringLiteralNode,
//   HexLiteralNode,
//   BoolLiteralNode,
//   RequireNode,
// } from '../ast/AST';
// import AstTraversal from '../ast/AstTraversal';
// import {
//   applyUnaryOperator,
//   applyBinaryOperator,
//   applyGlobalFunction,
//   applySizeOp,
//   applyCast,
// } from './OperationSimulations';
// import { ConstantConditionError } from '../Errors';

// export default class SimplificationTraversal extends AstTraversal {
//   visitRequire(node: RequireNode) {
//     node.expression = this.visit(node.expression);

//     if (node.expression instanceof BoolLiteralNode) {
//       throw new ConstantConditionError(node, node.expression.value);
//     }

//     return node;
//   }

//   visitBranch(node: BranchNode) {
//     node.condition = this.visit(node.condition);
//     node.ifBlock = this.visit(node.ifBlock) as BlockNode;
//     node.elseBlock = this.visitOptional(node.elseBlock);

//     if (node.condition instanceof BoolLiteralNode) {
//       throw new ConstantConditionError(node, node.condition.value);
//     }

//     return node;
//   }

//   visitCast(node: CastNode) {
//     node.expression = this.visit(node.expression);

//     if (node.expression instanceof LiteralNode) {
//       return applyCast(node.expression, node.type);
//     }

//     return node;
//   }

//   visitSizeOp(node: SizeOpNode) {
//     node.object = this.visit(node.object);

//     if (node.object instanceof StringLiteralNode || node.object instanceof HexLiteralNode) {
//       return applySizeOp(node.object);
//     }

//     return node;
//   }

//   // TODO
//   visitSplitOp(node: SplitOpNode) {
//     node.object = this.visit(node.object);
//     node.index = this.visit(node.index);
//     return node;
//   }

//   visitFunctionCall(node: FunctionCallNode) {
//     node.identifier = this.visit(node.identifier) as IdentifierNode;
//     node.parameters = this.visitList(node.parameters);

//     if (node.parameters.every(p => p instanceof LiteralNode)) {
//       return applyGlobalFunction(node);
//     }

//     return node;
//   }

//   visitBinaryOp(node: BinaryOpNode) {
//     node.left = this.visit(node.left);
//     node.right = this.visit(node.right);
//     if (node.left instanceof LiteralNode && node.right instanceof LiteralNode) {
//       return applyBinaryOperator(node.left, node.operator, node.right);
//     }
//     return node;
//   }

//   visitUnaryOp(node: UnaryOpNode) {
//     node.expression = this.visit(node.expression);
//     if (node.expression instanceof LiteralNode) {
//       return applyUnaryOperator(node.operator, node.expression);
//     }
//     return node;
//   }
// }
