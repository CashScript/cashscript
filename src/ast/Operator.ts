import { GlobalFunction, TimeOp } from './Globals';
import { PrimitiveType } from './Type';

export type Operator = UnaryOperator | BinaryOperator | GlobalFunction | TimeOp | PrimitiveType | 'size' | 'splice';

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
