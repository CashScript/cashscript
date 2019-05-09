import {
  IdentifierNode,
  FunctionDefinitionNode,
  VariableDefinitionNode,
  ParameterNode,
  Node,
  FunctionCallNode,
  BinaryOpNode,
  UnaryOpNode,
  TimeOpNode,
  SizeOpNode,
  SpliceOpNode,
  CastNode,
  AssignNode,
  BranchNode,
} from './ast/AST';
import { Type } from './ast/Type';
import { Symbol } from './ast/SymbolTable';

export class CashScriptError extends Error {
  node: Node;

  constructor(
    node: Node,
    message: string,
  ) {
    if (node.location) {
      message += ` at ${node.location.start}`;
    }

    super(message);

    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);

    this.node = node;
  }
}

export class UndefinedReferenceError extends CashScriptError {
  constructor(
    public node: IdentifierNode,
  ) {
    super(node, `Undefined reference to symbol ${node.name}`);
  }
}

export class RedefinitionError extends CashScriptError {}

export class FunctionRedefinitionError extends RedefinitionError {
  constructor(
    public node: FunctionDefinitionNode,
  ) {
    super(node, `Redefinition of function ${node.name}`);
  }
}

export class VariableRedefinitionError extends RedefinitionError {
  constructor(
    public node: VariableDefinitionNode | ParameterNode,
  ) {
    super(node, `Redefinition of variable ${node.name}`);
  }
}

export class UnusedVariableError extends CashScriptError {
  constructor(
    public symbol: Symbol,
  ) {
    super(symbol.definition as Node, `Unused variable ${symbol.name}`);
  }
}

export class TypeError extends CashScriptError {
  constructor(
    node: Node,
    public actual?: Type | Type[],
    public expected?: Type | Type[],
    message?: string,
  ) {
    super(node, message || `Found type '${actual}' where type '${expected}' was expected`);
  }
}

export class InvalidParameterTypeError extends TypeError {
  constructor(
    node: FunctionCallNode,
    actual: Type[],
    expected: Type[],
  ) {
    super(
      node, actual, expected,
      `Found function parameters (${actual}) in call to function '${node.identifier.name}' where parameters (${expected}) were expected`,
    );
  }
}

export class UnequalTypeError extends TypeError {
  constructor(
    node: BinaryOpNode,
  ) {
    const left = node.left.type;
    const right = node.right.type;
    super(node, left, right, `Tried to apply operator '${node.operator}' to unequal types '${left}' and '${right}'`);
  }
}

export class UnsupportedTypeError extends TypeError {
  constructor(
    node: BinaryOpNode | UnaryOpNode | SizeOpNode | SpliceOpNode | TimeOpNode,
    actual?: Type,
    expected?: Type,
  ) {
    if (node instanceof BinaryOpNode) {
      super(node, actual, expected, `Tried to apply operator '${node.operator}' to unsupported type '${actual}'`);
    } else if (node instanceof UnaryOpNode) {
      super(node, actual, expected, `Tried to apply operator '${node.operator}' to unsupported type '${actual}'`);
    } else if (node instanceof SizeOpNode) {
      super(node, actual, expected, `Tried to access member 'length' on unsupported type '${actual}'`);
    } else if (node instanceof SpliceOpNode) {
      if (expected === Type.INT) {
        super(node, actual, expected, `Tried to call member 'splice' on unsupported type '${actual}'`);
      } else {
        super(node, actual, expected, `Tried to call member 'splice' with unsupported parameter type '${actual}'`);
      }
    } else if (node instanceof TimeOpNode) {
      super(node, actual, expected, `Tried to apply operator '>=' on unsupported type '${actual}'`);
    } else {
      super(node, actual, expected);
    }
  }
}

export class CastTypeError extends TypeError {
  constructor(
    node: CastNode,
  ) {
    super(node, node.expression.type, node.type, `Type '${node.expression.type}' is not castable to type '${node.type}'`);
  }
}

export class AssignTypeError extends TypeError {
  constructor(
    node: AssignNode | VariableDefinitionNode,
  ) {
    const expected = node instanceof AssignNode ? node.identifier.type : node.type;
    super(node, node.expression.type, expected, `Type '${node.expression.type}' can not be assigned to variable of type '${expected}'`);
  }
}

export class UnsupportedTimeOpError extends CashScriptError {
  constructor(
    node: TimeOpNode,
  ) {
    super(node, `Unsupported use of ${node.timeOp}`);
  }
}

export class UnboundedBytesTypeError extends CashScriptError {
  constructor(
    node: BinaryOpNode,
  ) {
    super(
      node,
      `Tried to apply operator '${node.operator}' to unbounded '${Type.BYTES}' type`
      + ` where fixed length '${Type.BYTES20}' or '${Type.BYTES32}' was expected`,
    );
  }
}

export class ConstantConditionError extends CashScriptError {
  constructor(
    node: BranchNode | FunctionCallNode,
    res: boolean,
  ) {
    super(node, `Condition always evaluates to ${res}`);
  }
}
