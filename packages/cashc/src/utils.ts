import { BytesType, implicitlyCastable, PrimitiveType, TupleType, Type } from '@cashscript/utils';
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
