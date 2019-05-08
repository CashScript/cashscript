import {
  LiteralNode,
  IntLiteralNode,
  BoolLiteralNode,
  StringLiteralNode,
  HexLiteralNode,
} from './AST';

export enum UnaryOperator {
  NOT = '!',
  PLUS = '+',
  NEGATE = '-'
}

export enum BinaryOperator {
  DIV = '/',
  MOD = '%',
  PLUS = '+',
  MINUS = '-',
  LT = '<',
  LE = '<=',
  GT = '>',
  GE = '>=',
  EQ = '==',
  NE = '!=',
  // BIT_AND = '&',
  // BIT_XOR = '^',
  // BIT_OR = '|',
  AND = '&&',
  OR = '||'
}

export function applyUnaryOperator(
  op: UnaryOperator,
  expr: LiteralNode,
) {
  if (expr instanceof BoolLiteralNode) {
    return applyUnaryOperatorToBool(op, expr);
  } else if (expr instanceof IntLiteralNode) {
    return applyUnaryOperatorToInt(op, expr);
  } else {
    throw new Error();
  }
}

function applyUnaryOperatorToBool(
  op: UnaryOperator,
  expr: BoolLiteralNode,
) {
  switch (op) {
    case UnaryOperator.NOT:
      return new BoolLiteralNode(!expr.value);
    default:
      throw new Error();
  }
}

function applyUnaryOperatorToInt(
  op: UnaryOperator,
  expr: IntLiteralNode,
) {
  switch (op) {
    case UnaryOperator.NEGATE:
      return new IntLiteralNode(-expr.value);
    case UnaryOperator.PLUS:
      return expr;
    default:
      throw new Error();
  }
}

export function applyBinaryOperator(
  left: LiteralNode,
  op: BinaryOperator,
  right: LiteralNode,
): LiteralNode {
  if (left instanceof BoolLiteralNode && right instanceof BoolLiteralNode) {
    return applyBinaryOperatorToBool(left, op, right);
  } else if (left instanceof IntLiteralNode && right instanceof IntLiteralNode) {
    return applyBinaryOperatorToInt(left, op, right);
  } else if (left instanceof StringLiteralNode && right instanceof StringLiteralNode) {
    return applyBinaryOperatorToString(left, op, right);
  } else if (left instanceof HexLiteralNode && right instanceof HexLiteralNode) {
    return applyBinaryOperatorToHex(left, op, right);
  } else {
    throw new Error();
  }
}

function applyBinaryOperatorToBool(
  left: BoolLiteralNode,
  op: BinaryOperator,
  right: BoolLiteralNode,
): BoolLiteralNode {
  switch (op) {
    case BinaryOperator.AND:
      return new BoolLiteralNode(left.value && right.value);
    case BinaryOperator.OR:
      return new BoolLiteralNode(left.value || right.value);
    default:
      throw new Error();
  }
}

function applyBinaryOperatorToInt(
  left: IntLiteralNode,
  op: BinaryOperator,
  right: IntLiteralNode,
): LiteralNode {
  switch (op) {
    case BinaryOperator.DIV:
      return new IntLiteralNode(left.value / right.value);
    case BinaryOperator.MOD:
      return new IntLiteralNode(left.value % right.value);
    case BinaryOperator.PLUS:
      return new IntLiteralNode(left.value + right.value);
    case BinaryOperator.MINUS:
      return new IntLiteralNode(left.value - right.value);
    case BinaryOperator.LT:
      return new BoolLiteralNode(left.value < right.value);
    case BinaryOperator.LE:
      return new BoolLiteralNode(left.value <= right.value);
    case BinaryOperator.GT:
      return new BoolLiteralNode(left.value > right.value);
    case BinaryOperator.GE:
      return new BoolLiteralNode(left.value >= right.value);
    case BinaryOperator.EQ:
      return new BoolLiteralNode(left.value === right.value);
    case BinaryOperator.NE:
      return new BoolLiteralNode(left.value !== right.value);
    default:
      throw new Error();
  }
}

function applyBinaryOperatorToString(
  left: StringLiteralNode,
  op: BinaryOperator,
  right: StringLiteralNode,
): LiteralNode {
  switch (op) {
    case BinaryOperator.PLUS:
      return new StringLiteralNode(left.value + right.value, left.quote);
    case BinaryOperator.EQ:
      return new BoolLiteralNode(left.value === right.value);
    case BinaryOperator.NE:
      return new BoolLiteralNode(left.value !== right.value);
    default:
      throw new Error();
  }
}

function applyBinaryOperatorToHex(
  left: HexLiteralNode,
  op: BinaryOperator,
  right: HexLiteralNode,
): LiteralNode {
  switch (op) {
    case BinaryOperator.PLUS:
      return new HexLiteralNode(Buffer.concat([left.value, right.value]));
    case BinaryOperator.EQ:
      return new BoolLiteralNode(left.value.equals(right.value));
    case BinaryOperator.NE:
      return new BoolLiteralNode(!left.value.equals(right.value));
    default:
      throw new Error();
  }
}
