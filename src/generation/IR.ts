import { Op } from './Script';
import { UnaryOperator, BinaryOperator } from '../ast/Operator';
import { GlobalFunction, TimeOp } from '../ast/Globals';
import { PrimitiveType } from '../ast/Type';

export type IrOp = IntermediateOp | Op;
export abstract class IntermediateOp {}

export class PushBool extends IntermediateOp {
  constructor(
    public value: boolean,
  ) {
    super();
  }

  toString() {
    return `|push bool (${this.value})`;
  }
}

export class PushInt extends IntermediateOp {
  constructor(
    public value: number,
  ) {
    super();
  }

  toString() {
    return `|push int (${this.value})`;
  }
}

export class PushString extends IntermediateOp {
  constructor(
    public value: string,
  ) {
    super();
  }

  toString() {
    return `|push string (${this.value})`;
  }
}

export class PushBytes extends IntermediateOp {
  constructor(
    public value: Buffer,
  ) {
    super();
  }

  toString() {
    return `|push bytes (${this.value})`;
  }
}

export class Get extends IntermediateOp {
  constructor(
    public index: number,
  ) {
    super();
  }

  toString() {
    return `|get (${this.index})|`;
  }
}

export class Replace extends IntermediateOp {
  constructor(
    public index: number,
  ) {
    super();
  }

  toString() {
    return `|replace (${this.index})|`;
  }
}

export class toIrOps {
  static fromTimeOp(op: TimeOp): Op[] {
    const mapping = {
      [TimeOp.CHECK_LOCKTIME]: [Op.CHECKLOCKTIMEVERIFY, Op.DROP],
      [TimeOp.CHECK_SEQUENCE]: [Op.CHECKSEQUENCEVERIFY, Op.DROP],
    };

    return mapping[op];
  }

  static fromCast(from: PrimitiveType, to: PrimitiveType): IrOp[] {
    if (from === PrimitiveType.INT && to !== PrimitiveType.INT) {
      return [new PushInt(8), Op.NUM2BIN]; // TODO: Fix proper sized int casting
    } else if (from !== PrimitiveType.INT && to === PrimitiveType.INT) {
      return [Op.BIN2NUM];
    } else if (from === PrimitiveType.SIG && to === PrimitiveType.DATASIG) {
      return [Op.SIZE, new PushInt(1), Op.SUB, Op.SPLIT, Op.DROP];
    } else {
      return [];
    }
  }

  static fromFunction(fn: GlobalFunction): Op[] {
    const mapping = {
      [GlobalFunction.ABS]: [Op.ABS],
      [GlobalFunction.CHECKDATASIG]: [Op.CHECKDATASIG],
      [GlobalFunction.CHECKMULTISIG]: [Op.CHECKMULTISIG],
      [GlobalFunction.CHECKSIG]: [Op.CHECKSIG],
      [GlobalFunction.MAX]: [Op.MAX],
      [GlobalFunction.MIN]: [Op.MIN],
      [GlobalFunction.REQUIRE]: [Op.VERIFY],
      [GlobalFunction.RIPEMD160]: [Op.RIPEMD160],
      [GlobalFunction.SHA1]: [Op.SHA1],
      [GlobalFunction.SHA256]: [Op.SHA256],
      [GlobalFunction.HASH160]: [Op.HASH160],
      [GlobalFunction.HASH256]: [Op.HASH256],
      [GlobalFunction.WITHIN]: [Op.WITHIN],
    };

    return mapping[fn];
  }

  static fromBinaryOp(op: BinaryOperator, numeric: boolean = false): Op[] {
    const mapping = {
      [BinaryOperator.DIV]: [Op.DIV],
      [BinaryOperator.MOD]: [Op.MOD],
      [BinaryOperator.PLUS]: [Op.CAT],
      [BinaryOperator.MINUS]: [Op.SUB],
      [BinaryOperator.LT]: [Op.LESSTHAN],
      [BinaryOperator.LE]: [Op.LESSTHANOREQUAL],
      [BinaryOperator.GT]: [Op.GREATERTHAN],
      [BinaryOperator.GE]: [Op.GREATERTHANOREQUAL],
      [BinaryOperator.EQ]: [Op.EQUAL],
      [BinaryOperator.NE]: [Op.EQUAL, Op.NOT],
      [BinaryOperator.AND]: [Op.BOOLAND],
      [BinaryOperator.OR]: [Op.BOOLOR],
    };

    if (numeric) {
      switch (op) {
        case BinaryOperator.PLUS:
          return [Op.ADD];
        case BinaryOperator.EQ:
          return [Op.NUMEQUAL];
        case BinaryOperator.NE:
          return [Op.NUMNOTEQUAL];
        default:
          return mapping[op];
      }
    }
    return mapping[op];
  }

  static fromUnaryOp(op: UnaryOperator): Op[] {
    const mapping = {
      [UnaryOperator.NOT]: [Op.NOT],
      [UnaryOperator.NEGATE]: [Op.NEGATE],
      [UnaryOperator.PLUS]: [],
    };

    return mapping[op];
  }
}
