import { Operator } from '../ast/Operator';

export abstract class IntermediateOp {}
export type Op = IntermediateOp | Operator;

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

export class Call extends IntermediateOp {
  constructor(
    public op: Operator,
  ) {
    super();
  }

  toString() {
    return `|call (${this.op})|`;
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
