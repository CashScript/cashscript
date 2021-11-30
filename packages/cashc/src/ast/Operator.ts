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
  INPUT_VALUE = 'tx.inputs[i].value',
  INPUT_LOCKING_BYTECODE = 'tx.inputs[i].lockingBytecode',
  INPUT_OUTPOINT_HASH = 'tx.inputs[i].outpointTransactionHash',
  INPUT_OUTPOINT_INDEX = 'tx.inputs[i].outpointIndex',
  INPUT_UNLOCKING_BYTECODE = 'tx.inputs[i].unlockingBytecode',
  INPUT_SEQUENCE_NUMBER = 'tx.inputs[i].sequenceNumber',
  OUTPUT_VALUE = 'tx.outputs[i].value',
  OUTPUT_LOCKING_BYTECODE = 'tx.outputs[i].lockingBytecode',
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
