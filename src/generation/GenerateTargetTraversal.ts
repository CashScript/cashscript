import { OpOrData, Op } from './Script';
import {
  IrOp,
  PushBool,
  PushInt,
  PushString,
  PushBytes,
  Get,
  Replace,
} from './IR';
import { encodeBool, encodeInt, encodeString } from '../util';

export default class GenerateTargetTraversal {
  private output: OpOrData[] = [];
  constructor(private input: IrOp[]) {}

  emit(opOrData: OpOrData) {
    this.output.push(opOrData);
  }

  traverse(): OpOrData[] {
    this.input.forEach((op) => {
      if (typeof op === 'number') {
        this.emit(op);
      } else if (op instanceof PushBool) {
        this.visitPushBool(op);
      } else if (op instanceof PushInt) {
        this.visitPushInt(op);
      } else if (op instanceof PushString) {
        this.visitPushString(op);
      } else if (op instanceof PushBytes) {
        this.visitPushBytes(op);
      } else if (op instanceof Get) {
        this.visitGet(op);
      } else if (op instanceof Replace) {
        this.visitReplace(op);
      }
    });
    return this.output;
  }

  visitPushBool(op: PushBool) {
    this.emit(encodeBool(op.value));
  }

  visitPushInt(op: PushInt) {
    this.emit(encodeInt(op.value));
  }

  visitPushString(op: PushString) {
    this.emit(encodeString(op.value));
  }

  visitPushBytes(op: PushBytes) {
    this.emit(op.value);
  }

  visitGet(op: Get) {
    this.emit(encodeInt(op.index));
    this.emit(Op.OP_PICK);
  }

  // This algorithm can be optimised for hardcoded depths
  // See thesis for explanation
  visitReplace(op: Replace) {
    this.emit(encodeInt(op.index));
    this.emit(Op.OP_ROLL);
    this.emit(Op.OP_DROP);
    for (let i = 0; i < op.index - 1; i += 1) {
      this.emit(Op.OP_SWAP);
      if (i < op.index - 2) {
        this.emit(Op.OP_TOALTSTACK);
      }
    }
    for (let i = 0; i < op.index - 2; i += 1) {
      this.emit(Op.OP_FROMALTSTACK);
    }
  }
}
