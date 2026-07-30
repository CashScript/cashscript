import { PrimitiveType } from '@cashscript/utils';
import {
  BinaryOpNode,
  ConstantDefinitionNode,
  ExpressionNode,
  HexLiteralNode,
  IdentifierNode,
  IntLiteralNode,
  LiteralNode,
  Node,
  SourceFileNode,
  StringLiteralNode,
  UnaryOpNode,
} from '../ast/AST.js';
import AstTraversal from '../ast/AstTraversal.js';
import { GLOBAL_SYMBOL_TABLE } from '../ast/Globals.js';
import { BinaryOperator, UnaryOperator } from '../ast/Operator.js';
import { cloneConstantValue } from './LowerGlobalConstantsTraversal.js';
import { resultingTypeForBinaryOp } from '../utils.js';
import {
  CashScriptError,
  DivisionByZeroError,
  InvalidConstantExpressionError,
  UndefinedReferenceError,
  UnequalTypeError,
  UnsupportedTypeError,
} from '../Errors.js';

// Supports literals, references to other constants, integer arithmetic (+, -, *, /, %, unary -) and concatenation (+)
export class FoldGlobalConstantsTraversal extends AstTraversal {
  private foldedConstants: Map<string, ConstantDefinitionNode> = new Map();
  private functionNames: Set<string> = new Set();

  visitSourceFile(node: SourceFileNode): Node {
    this.functionNames = new Set(node.functions.map((func) => func.name));
    node.constants = this.visitList(node.constants) as ConstantDefinitionNode[];
    return node;
  }

  visitConstantDefinition(node: ConstantDefinitionNode): Node {
    node.value = this.visitExpression(node.value);
    this.foldedConstants.set(node.name, node);
    return node;
  }

  // Folds an expression through the regular visitor dispatch and rejects any expression kind
  // that did not fold down to a single literal
  private visitExpression(node: ExpressionNode): LiteralNode {
    const folded = this.visit(node);
    if (!(folded instanceof LiteralNode)) throw new InvalidConstantExpressionError(node);
    return folded;
  }

  visitIdentifier(node: IdentifierNode): Node {
    const constant = this.foldedConstants.get(node.name);
    if (constant) return cloneConstantValue(constant, node);

    // Existing names (except previously declared constants) are invalid in a constant initialiser
    if (this.functionNames.has(node.name) || GLOBAL_SYMBOL_TABLE.get(node.name)) {
      throw new InvalidConstantExpressionError(node);
    }

    throw new UndefinedReferenceError(node);
  }

  visitUnaryOp(node: UnaryOpNode): Node {
    if (!FOLDABLE_UNARY_OPERATORS.includes(node.operator)) throw new InvalidConstantExpressionError(node);

    node.expression = this.visitExpression(node.expression);
    if (!(node.expression instanceof IntLiteralNode)) {
      throw new UnsupportedTypeError(node, node.expression.type, PrimitiveType.INT);
    }

    return withLocation(new IntLiteralNode(-node.expression.value), node);
  }

  visitBinaryOp(node: BinaryOpNode): Node {
    if (!FOLDABLE_BINARY_OPERATORS.includes(node.operator)) throw new InvalidConstantExpressionError(node);

    // The folded operands are written back so the type errors below report the resolved operand types
    node.left = this.visitExpression(node.left);
    node.right = this.visitExpression(node.right);

    if (node.operator === BinaryOperator.PLUS) return foldPlus(node);
    return foldIntArithmetic(node);
  }
}

const FOLDABLE_UNARY_OPERATORS = [
  UnaryOperator.NEGATE,
];

const FOLDABLE_BINARY_OPERATORS = [
  BinaryOperator.PLUS,
  BinaryOperator.MINUS,
  BinaryOperator.MUL,
  BinaryOperator.DIV,
  BinaryOperator.MOD,
];

function foldPlus(node: BinaryOpNode): LiteralNode {
  const { left, right } = node;

  if (left instanceof IntLiteralNode && right instanceof IntLiteralNode) {
    return withLocation(new IntLiteralNode(left.value + right.value), node);
  }

  if (left instanceof StringLiteralNode && right instanceof StringLiteralNode) {
    return withLocation(new StringLiteralNode(left.value + right.value, left.quote), node);
  }

  if (left instanceof HexLiteralNode && right instanceof HexLiteralNode) {
    return withLocation(new HexLiteralNode(new Uint8Array([...left.value, ...right.value])), node);
  }

  throw typeMismatchError(node, PrimitiveType.INT);
}

function foldIntArithmetic(node: BinaryOpNode): LiteralNode {
  const { left, right, operator } = node;

  if (!(left instanceof IntLiteralNode) || !(right instanceof IntLiteralNode)) {
    throw typeMismatchError(node, PrimitiveType.INT);
  }

  if ((operator === BinaryOperator.DIV || operator === BinaryOperator.MOD) && right.value === 0n) {
    throw new DivisionByZeroError(node);
  }

  switch (operator) {
    case BinaryOperator.MINUS: return withLocation(new IntLiteralNode(left.value - right.value), node);
    case BinaryOperator.MUL: return withLocation(new IntLiteralNode(left.value * right.value), node);
    // Note: BigInt division and modulo truncate towards zero, matching OP_DIV / OP_MOD semantics
    case BinaryOperator.DIV: return withLocation(new IntLiteralNode(left.value / right.value), node);
    case BinaryOperator.MOD: return withLocation(new IntLiteralNode(left.value % right.value), node);
    default: throw new InvalidConstantExpressionError(node);
  }
}

function typeMismatchError(node: BinaryOpNode, expected: PrimitiveType): CashScriptError {
  const resultingType = resultingTypeForBinaryOp(node.operator, node.left.type!, node.right.type!);
  if (resultingType) return new UnsupportedTypeError(node, resultingType, expected);
  return new UnequalTypeError(node);
}

function withLocation<T extends LiteralNode>(literal: T, source: Node): T {
  literal.location = source.location;
  return literal;
}
