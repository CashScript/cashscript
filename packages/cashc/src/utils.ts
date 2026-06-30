import { arrayType, BytesType, implicitlyCastable, PrimitiveType, TupleType, Type } from '@cashscript/utils';
import { BinaryOperator } from './ast/Operator.js';

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

// The type of a ternary `condition ? consequent : alternative` is the common type of both branches,
// resolved the same way array element types are. Tuples (e.g. from `.split`) are not valid branch values.
export function resultingTypeForTernary(consequent?: Type, alternative?: Type): Type | undefined {
  if (!consequent || !alternative) return undefined;
  if (consequent instanceof TupleType || alternative instanceof TupleType) return undefined;
  return arrayType([consequent, alternative]);
}

export function isNumericType(type?: Type): boolean {
  return type === PrimitiveType.INT || type === PrimitiveType.BOOL;
}
