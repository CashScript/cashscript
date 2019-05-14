import { Operator } from '../ast/Operator';

export class IntermediateOp {}
export class Op extends IntermediateOp {}

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

export class If extends Op {
  toString() {
    return 'IF';
  }
}

export class Else extends Op {
  toString() {
    return 'ELSE';
  }
}

export class EndIf extends Op {
  toString() {
    return 'ENDIF';
  }
}

export class Drop extends Op {
  toString() {
    return 'DROP';
  }
}

export class Nip extends Op {
  toString() {
    return 'NIP';
  }
}
