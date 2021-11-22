export enum NullaryOperator {
  INPUT_INDEX = 'this.inputIndex',
  BYTECODE = 'this.bytecode',
  INPUT_COUNT = 'tx.inputs.length',
  OUTPUT_COUNT = 'tx.outputs.length',
  VERSION = 'tx.version',
  LOCKTIME = 'tx.locktime',
}

export enum UnaryOperator {
  NOT = '!',
  NEGATE = '-',
  SIZE = '.length',
  REVERSE = '.reverse()',
}

export enum BinaryOperator {
  MUL = '*',
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
  BIT_AND = '&',
  BIT_XOR = '^',
  BIT_OR = '|',
  AND = '&&',
  OR = '||',
  SPLIT = '.split',
}
