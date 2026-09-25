import { BytesType, encodeString, implicitlyCastable, PrimitiveType, TupleType, Type } from '@cashscript/utils';
import { CastNode, ExpressionNode, HexLiteralNode, StringLiteralNode } from './ast/AST.js';
import { BinaryOperator } from './ast/Operator.js';

export function functionReturnType(returnTypes?: Type[]): Type {
  if (returnTypes === undefined || returnTypes.length === 0) return PrimitiveType.VOID;
  if (returnTypes.length === 1) return returnTypes[0];
  return new TupleType(returnTypes);
}

export function resultingTypeForBinaryOp(
  operator: BinaryOperator,
  left: Type,
  right: Type,
): Type | undefined {
  if ([BinaryOperator.SHIFT_LEFT, BinaryOperator.SHIFT_RIGHT, BinaryOperator.SPLIT].includes(operator)) return left;

  if (implicitlyCastable(left, right)) return right;
  if (implicitlyCastable(right, left)) return left;
  if (left instanceof BytesType && right instanceof BytesType) {
    return new BytesType();
  }

  return undefined;
}

export function isNumericType(type?: Type): boolean {
  return type === PrimitiveType.INT || type === PrimitiveType.BOOL;
}

// The value of a bytes expression if it is known at compile time: (casts of) hex and string literals
export function getCompileTimeBytes(node: ExpressionNode): Uint8Array | undefined {
  if (node instanceof HexLiteralNode) return node.value;
  if (node instanceof StringLiteralNode) return encodeString(node.value);
  if (node instanceof CastNode && node.type instanceof BytesType) return getCompileTimeBytes(node.expression);
  return undefined;
}

// The length of a bytes expression if it is known at compile time, from its value or its type (e.g. bytes20)
export function getCompileTimeByteLength(node: ExpressionNode): number | undefined {
  return getCompileTimeBytes(node)?.byteLength ?? (node.type instanceof BytesType ? node.type.bound : undefined);
}
