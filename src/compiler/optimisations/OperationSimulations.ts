import { BITBOX } from 'bitbox-sdk';
import { UnaryOperator, BinaryOperator } from '../ast/Operator';
import {
  LiteralNode,
  BoolLiteralNode,
  IntLiteralNode,
  HexLiteralNode,
  StringLiteralNode,
  FunctionCallNode,
} from '../ast/AST';
import { GlobalFunction } from '../ast/Globals';
import { Type, PrimitiveType } from '../ast/Type';

const bitbox: BITBOX = new BITBOX();

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

export function applyGlobalFunction(node: FunctionCallNode): LiteralNode {
  const { parameters } = node;
  if (!parameters.every(p => p instanceof LiteralNode)) {
    throw new Error();
  }

  switch (node.identifier.name) {
    case GlobalFunction.ABS:
      return new IntLiteralNode(Math.abs((parameters[0] as IntLiteralNode).value));
    case GlobalFunction.MIN:
      return new IntLiteralNode(Math.min(
        (parameters[0] as IntLiteralNode).value,
        (parameters[1] as IntLiteralNode).value,
      ));
    case GlobalFunction.MAX:
      return new IntLiteralNode(Math.max(
        (parameters[0] as IntLiteralNode).value,
        (parameters[1] as IntLiteralNode).value,
      ));
    case GlobalFunction.WITHIN:
      return applyWithin(parameters[0], parameters[1], parameters[2]);
    case GlobalFunction.RIPEMD160:
      return applyHashFunction(bitbox.Crypto.ripemd160, parameters[0]);
    case GlobalFunction.SHA1:
      return applyHashFunction(bitbox.Crypto.sha1, parameters[0]);
    case GlobalFunction.SHA256:
      return applyHashFunction(bitbox.Crypto.sha256, parameters[0]);
    // TODO: case GlobalFunction.SIGCHECK:
    default:
      throw new Error();
  }
}

function applyWithin(x: LiteralNode, min: LiteralNode, max: LiteralNode): BoolLiteralNode {
  x = x as IntLiteralNode;
  return new BoolLiteralNode(x >= (min as IntLiteralNode) && x < (max as IntLiteralNode));
}

function applyHashFunction(f: (a: Buffer)=>Buffer, node: LiteralNode): HexLiteralNode {
  if (node instanceof IntLiteralNode) {
    return new HexLiteralNode(f(Buffer.alloc(32, node.value)));
  } else if (node instanceof BoolLiteralNode) {
    return new HexLiteralNode(f(Buffer.alloc(1, node.value ? 0x01 : 0x00)));
  } else if (node instanceof StringLiteralNode) {
    return new HexLiteralNode(f(Buffer.from(node.value)));
  } else if (node instanceof HexLiteralNode) {
    return new HexLiteralNode(f(node.value));
  } else {
    throw new Error();
  }
}

export function applySizeOp(node: StringLiteralNode | HexLiteralNode): IntLiteralNode {
  return new IntLiteralNode(node.value.length);
}

export function applyCast(node: LiteralNode, castType: Type): LiteralNode {
  if (node instanceof BoolLiteralNode) {
    return castBoolean(node, castType);
  } else if (node instanceof IntLiteralNode) {
    return castInt(node, castType);
  } else if (node instanceof StringLiteralNode) {
    return castString(node, castType);
  } else if (node instanceof HexLiteralNode) {
    return castHex(node, castType);
  } else {
    throw new Error();
  }
}

function castBoolean(node: BoolLiteralNode, castType: Type): LiteralNode {
  switch (castType) {
    case PrimitiveType.INT:
      return new IntLiteralNode(node.value ? 1 : 0);
    case PrimitiveType.BOOL:
      return node;
    default:
      throw new Error();
  }
}

function castInt(node: IntLiteralNode, castType: Type): LiteralNode {
  switch (castType) {
    case PrimitiveType.INT:
      return node;
    case PrimitiveType.BOOL:
      return new BoolLiteralNode(node.value !== 0);
    case PrimitiveType.BYTES:
    case PrimitiveType.BYTES20:
    case PrimitiveType.BYTES32:
      return new HexLiteralNode(Buffer.alloc(32, node.value));
    default:
      throw new Error();
  }
}

function castString(node: StringLiteralNode, castType: Type): LiteralNode {
  switch (castType) {
    case PrimitiveType.STRING:
      return node;
    case PrimitiveType.BYTES:
      return new HexLiteralNode(Buffer.from(node.value));
    default:
      throw new Error();
  }
}

function castHex(node: HexLiteralNode, castType: Type): LiteralNode {
  switch (castType) {
    case PrimitiveType.PUBKEY:
    case PrimitiveType.SIG:
    case PrimitiveType.BYTES:
    case PrimitiveType.BYTES20:
    case PrimitiveType.BYTES32:
      return node;
    default:
      throw new Error();
  }
}
