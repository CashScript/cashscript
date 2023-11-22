import {
  BytesType,
  encodeInt,
  Op,
  PrimitiveType,
  Script,
  Type,
} from '@cashscript/utils';
import { UnaryOperator, BinaryOperator, NullaryOperator } from '../ast/Operator.js';
import { TimeOp } from '../ast/Globals.js';

export function compileTimeOp(op: TimeOp): Script {
  const mapping = {
    [TimeOp.CHECK_LOCKTIME]: [Op.OP_CHECKLOCKTIMEVERIFY, Op.OP_DROP],
    [TimeOp.CHECK_SEQUENCE]: [Op.OP_CHECKSEQUENCEVERIFY, Op.OP_DROP],
  };

  return mapping[op];
}

export function compileCast(from: Type, to: Type): Script {
  if (from === PrimitiveType.INT && to instanceof BytesType && to.bound !== undefined) {
    return [encodeInt(BigInt(to.bound)), Op.OP_NUM2BIN];
  }

  if (from !== PrimitiveType.INT && to === PrimitiveType.INT) {
    return [Op.OP_BIN2NUM];
  }

  return [];
}

export function compileBinaryOp(op: BinaryOperator, numeric: boolean = false): Script {
  const mapping: { [key in BinaryOperator]: Script } = {
    [BinaryOperator.MUL]: [Op.OP_MUL],
    [BinaryOperator.DIV]: [Op.OP_DIV],
    [BinaryOperator.MOD]: [Op.OP_MOD],
    [BinaryOperator.PLUS]: [Op.OP_CAT],
    [BinaryOperator.MINUS]: [Op.OP_SUB],
    [BinaryOperator.LT]: [Op.OP_LESSTHAN],
    [BinaryOperator.LE]: [Op.OP_LESSTHANOREQUAL],
    [BinaryOperator.GT]: [Op.OP_GREATERTHAN],
    [BinaryOperator.GE]: [Op.OP_GREATERTHANOREQUAL],
    [BinaryOperator.EQ]: [Op.OP_EQUAL],
    [BinaryOperator.NE]: [Op.OP_EQUAL, Op.OP_NOT],
    [BinaryOperator.AND]: [Op.OP_BOOLAND],
    [BinaryOperator.OR]: [Op.OP_BOOLOR],
    [BinaryOperator.BIT_AND]: [Op.OP_AND],
    [BinaryOperator.BIT_OR]: [Op.OP_OR],
    [BinaryOperator.BIT_XOR]: [Op.OP_XOR],
    [BinaryOperator.SPLIT]: [Op.OP_SPLIT],
  };

  if (numeric) {
    mapping[BinaryOperator.PLUS] = [Op.OP_ADD];
    mapping[BinaryOperator.EQ] = [Op.OP_NUMEQUAL];
    mapping[BinaryOperator.NE] = [Op.OP_NUMNOTEQUAL];
  }

  return mapping[op];
}

export function compileUnaryOp(op: UnaryOperator): Op[] {
  const mapping = {
    [UnaryOperator.NOT]: [Op.OP_NOT],
    [UnaryOperator.NEGATE]: [Op.OP_NEGATE],
    [UnaryOperator.SIZE]: [Op.OP_SIZE, Op.OP_NIP],
    [UnaryOperator.REVERSE]: [Op.OP_REVERSEBYTES],
    [UnaryOperator.INPUT_VALUE]: [Op.OP_UTXOVALUE],
    [UnaryOperator.INPUT_LOCKING_BYTECODE]: [Op.OP_UTXOBYTECODE],
    [UnaryOperator.INPUT_OUTPOINT_HASH]: [Op.OP_OUTPOINTTXHASH],
    [UnaryOperator.INPUT_OUTPOINT_INDEX]: [Op.OP_OUTPOINTINDEX],
    [UnaryOperator.INPUT_UNLOCKING_BYTECODE]: [Op.OP_INPUTBYTECODE],
    [UnaryOperator.INPUT_SEQUENCE_NUMBER]: [Op.OP_INPUTSEQUENCENUMBER],
    [UnaryOperator.OUTPUT_VALUE]: [Op.OP_OUTPUTVALUE],
    [UnaryOperator.OUTPUT_LOCKING_BYTECODE]: [Op.OP_OUTPUTBYTECODE],
    [UnaryOperator.INPUT_TOKEN_CATEGORY]: [Op.OP_UTXOTOKENCATEGORY],
    [UnaryOperator.INPUT_NFT_COMMITMENT]: [Op.OP_UTXOTOKENCOMMITMENT],
    [UnaryOperator.INPUT_TOKEN_AMOUNT]: [Op.OP_UTXOTOKENAMOUNT],
    [UnaryOperator.OUTPUT_TOKEN_CATEGORY]: [Op.OP_OUTPUTTOKENCATEGORY],
    [UnaryOperator.OUTPUT_NFT_COMMITMENT]: [Op.OP_OUTPUTTOKENCOMMITMENT],
    [UnaryOperator.OUTPUT_TOKEN_AMOUNT]: [Op.OP_OUTPUTTOKENAMOUNT],
  };

  return mapping[op];
}

export function compileNullaryOp(op: NullaryOperator): Op[] {
  const mapping = {
    [NullaryOperator.INPUT_INDEX]: [Op.OP_INPUTINDEX],
    [NullaryOperator.BYTECODE]: [Op.OP_ACTIVEBYTECODE],
    [NullaryOperator.INPUT_COUNT]: [Op.OP_TXINPUTCOUNT],
    [NullaryOperator.OUTPUT_COUNT]: [Op.OP_TXOUTPUTCOUNT],
    [NullaryOperator.VERSION]: [Op.OP_TXVERSION],
    [NullaryOperator.LOCKTIME]: [Op.OP_TXLOCKTIME],
  };

  return mapping[op];
}
