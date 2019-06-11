import { Script as BScript } from 'bitbox-sdk';
import { UnaryOperator, BinaryOperator } from '../ast/Operator';
import { GlobalFunction, TimeOp } from '../ast/Globals';
import { PrimitiveType } from '../ast/Type';
import { Data } from '../util';

export const Op = new BScript().opcodes;

export type Op = number;
export type OpOrData = Op | Buffer;
export type Script = OpOrData[];

export class toOps {
  static fromTimeOp(op: TimeOp): Script {
    const mapping = {
      [TimeOp.CHECK_LOCKTIME]: [Op.OP_CHECKLOCKTIMEVERIFY, Op.OP_DROP],
      [TimeOp.CHECK_SEQUENCE]: [Op.OP_CHECKSEQUENCEVERIFY, Op.OP_DROP],
    };

    return mapping[op];
  }

  static fromCast(from: PrimitiveType, to: PrimitiveType): Script {
    if (from === PrimitiveType.INT && to !== PrimitiveType.INT) {
      return [Data.encodeInt(8), Op.OP_NUM2BIN]; // TODO: Fix proper sized int casting
    } else if (from !== PrimitiveType.INT && to === PrimitiveType.INT) {
      return [Op.OP_BIN2NUM];
    } else if (from === PrimitiveType.SIG && to === PrimitiveType.DATASIG) {
      return [Op.OP_SIZE, Data.encodeInt(1), Op.OP_SUB, Op.OP_SPLIT, Op.OP_DROP];
    } else {
      return [];
    }
  }

  static fromFunction(fn: GlobalFunction): Script {
    const mapping = {
      [GlobalFunction.ABS]: [Op.OP_ABS],
      [GlobalFunction.CHECKDATASIG]: [Op.OP_CHECKDATASIG],
      [GlobalFunction.CHECKMULTISIG]: [Op.OP_CHECKMULTISIG],
      [GlobalFunction.CHECKSIG]: [Op.OP_CHECKSIG],
      [GlobalFunction.MAX]: [Op.OP_MAX],
      [GlobalFunction.MIN]: [Op.OP_MIN],
      [GlobalFunction.REQUIRE]: [Op.OP_VERIFY],
      [GlobalFunction.RIPEMD160]: [Op.OP_RIPEMD160],
      [GlobalFunction.SHA1]: [Op.OP_SHA1],
      [GlobalFunction.SHA256]: [Op.OP_SHA256],
      [GlobalFunction.HASH160]: [Op.OP_HASH160],
      [GlobalFunction.HASH256]: [Op.OP_HASH256],
      [GlobalFunction.WITHIN]: [Op.OP_WITHIN],
    };

    return mapping[fn];
  }

  static fromBinaryOp(op: BinaryOperator, numeric: boolean = false): Script {
    const mapping = {
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
    };

    if (numeric) {
      switch (op) {
        case BinaryOperator.PLUS:
          return [Op.OP_ADD];
        case BinaryOperator.EQ:
          return [Op.OP_NUMEQUAL];
        case BinaryOperator.NE:
          return [Op.OP_NUMNOTEQUAL];
        default:
          return mapping[op];
      }
    }
    return mapping[op];
  }

  static fromUnaryOp(op: UnaryOperator): Op[] {
    const mapping = {
      [UnaryOperator.NOT]: [Op.OP_NOT],
      [UnaryOperator.NEGATE]: [Op.OP_NEGATE],
    };

    return mapping[op];
  }
}
