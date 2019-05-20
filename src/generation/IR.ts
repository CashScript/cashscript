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
    switch (op) {
      case TimeOp.CHECK_LOCKTIME:
        return [Op.CHECKLOCKTIMEVERIFY, Op.DROP];
      case TimeOp.CHECK_SEQUENCE:
        return [Op.CHECKSEQUENCEVERIFY, Op.DROP];
      default:
        throw new Error();
    }
  }

  static fromCast(from: PrimitiveType, to: PrimitiveType): IrOp[] {
    if (from === PrimitiveType.INT && to !== PrimitiveType.INT) {
      return [new PushInt(8), Op.NUM2BIN]; // TODO: Fix proper sized int casting
    } else if (from !== PrimitiveType.INT && to === PrimitiveType.INT) {
      return [Op.BIN2NUM];
    } else {
      return [];
    }
  }

  static fromFunction(fn: GlobalFunction): Op[] {
    switch (fn) {
      case GlobalFunction.ABS:
        return [Op.ABS];
      case GlobalFunction.CHECKDATASIG:
        return [Op.CHECKDATASIG];
      case GlobalFunction.CHECKMULTISIG:
        return [Op.CHECKMULTISIG];
      case GlobalFunction.CHECKSIG:
        return [Op.CHECKSIG];
      case GlobalFunction.MAX:
        return [Op.MAX];
      case GlobalFunction.MIN:
        return [Op.MIN];
      case GlobalFunction.REQUIRE:
        return [Op.VERIFY];
      case GlobalFunction.RIPEMD160:
        return [Op.RIPEMD160];
      case GlobalFunction.SHA1:
        return [Op.SHA1];
      case GlobalFunction.SHA256:
        return [Op.SHA256];
      case GlobalFunction.WITHIN:
        return [Op.WITHIN];
      default:
        throw new Error();
    }
  }

  static fromBinaryOp(op: BinaryOperator, numeric: boolean = false): Op[] {
    switch (op) {
      case BinaryOperator.DIV:
        return [Op.DIV];
      case BinaryOperator.MOD:
        return [Op.MOD];
      case BinaryOperator.PLUS:
        if (numeric) return [Op.ADD];
        else return [Op.CAT];
      case BinaryOperator.MINUS:
        return [Op.SUB];
      case BinaryOperator.LT:
        return [Op.LESSTHAN];
      case BinaryOperator.LE:
        return [Op.LESSTHANOREQUAL];
      case BinaryOperator.GT:
        return [Op.GREATERTHAN];
      case BinaryOperator.GE:
        return [Op.GREATERTHANOREQUAL];
      case BinaryOperator.EQ:
        if (numeric) return [Op.NUMEQUAL];
        else return [Op.EQUAL];
      case BinaryOperator.NE:
        if (numeric) return [Op.NUMNOTEQUAL];
        else return [Op.EQUAL, Op.NOT];
      case BinaryOperator.AND:
        return [Op.BOOLAND];
      case BinaryOperator.OR:
        return [Op.BOOLOR];
      default:
        throw new Error();
    }
  }

  static fromUnaryOp(op: UnaryOperator): Op[] {
    switch (op) {
      case UnaryOperator.NOT:
        return [Op.NOT];
      case UnaryOperator.NEGATE:
        return [Op.NEGATE];
      case UnaryOperator.PLUS:
        return [];
      default:
        throw new Error();
    }
  }
}
