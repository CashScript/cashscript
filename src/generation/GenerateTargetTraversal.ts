import { OpOrData, Op } from './Script';
import {
  IrOp,
  Get,
  Replace,
} from './IR';
import { encodeInt } from '../sdk';

export default class GenerateTargetTraversal {
  private output: OpOrData[] = [];
  constructor(private input: IrOp[]) {}

  emit(opOrData: OpOrData) {
    this.output.push(opOrData);
  }

  traverse(): OpOrData[] {
    this.input.forEach((op) => {
      if (op instanceof Op) {
        this.emit(op);
      } else if (op instanceof Get) {
        this.visitGet(op);
      } else if (op instanceof Replace) {
        this.visitReplace(op);
      }
    });
    return this.output;
  }

  visitGet(op: Get) {
    this.emit(encodeInt(op.index));
    this.emit(Op.PICK);
  }

  // This algorithm can be optimised for hardcoded depths
  // See thesis for explanation
  visitReplace(op: Replace) {
    this.emit(encodeInt(op.index));
    this.emit(Op.ROLL);
    this.emit(Op.DROP);
    for (let i = 0; i < op.index - 1; i += 1) {
      this.emit(Op.SWAP);
      if (i < op.index - 2) {
        this.emit(Op.TOALTSTACK);
      }
    }
    for (let i = 0; i < op.index - 2; i += 1) {
      this.emit(Op.FROMALTSTACK);
    }
  }
}
