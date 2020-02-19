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
  SplitOpNode,
  CastNode,
  AssignNode,
  BranchNode,
  ArrayNode,
  TupleIndexOpNode,
  RequireNode,
  ExpressionNode,
} from './ast/AST';
import { Type, PrimitiveType } from './ast/Type';
import { Symbol, SymbolType } from './ast/SymbolTable';

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

export class InvalidSymbolTypeError extends CashScriptError {
  constructor(
    public node: IdentifierNode,
    public expected: SymbolType,
  ) {
    super(node, `Found symbol ${node.name} with type ${node.definition?.symbolType} where type ${expected} was expected`);
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
    node: FunctionCallNode | RequireNode,
    actual: Type[],
    expected: Type[],
  ) {
    const name = node instanceof FunctionCallNode ? node.identifier.name : 'require';
    super(
      node, actual, expected,
      `Found function parameters (${actual}) in call to function '${name}' where parameters (${expected}) were expected`,
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
    node: BinaryOpNode | UnaryOpNode | SizeOpNode | SplitOpNode | TimeOpNode | TupleIndexOpNode,
    actual?: Type,
    expected?: Type,
  ) {
    if (node instanceof BinaryOpNode) {
      super(node, actual, expected, `Tried to apply operator '${node.operator}' to unsupported type '${actual}'`);
    } else if (node instanceof UnaryOpNode) {
      super(node, actual, expected, `Tried to apply operator '${node.operator}' to unsupported type '${actual}'`);
    } else if (node instanceof SizeOpNode) {
      super(node, actual, expected, `Tried to access member 'length' on unsupported type '${actual}'`);
    } else if (node instanceof SplitOpNode) {
      if (expected === PrimitiveType.INT) {
        super(node, actual, expected, `Tried to call member 'split' with unsupported parameter type '${actual}'`);
      } else {
        super(node, actual, expected, `Tried to call member 'split' on unsupported type '${actual}'`);
      }
    } else if (node instanceof TimeOpNode) {
      super(node, actual, expected, `Tried to apply operator '>=' on unsupported type '${actual}'`);
    } else if (node instanceof TupleIndexOpNode) {
      super(node, actual, expected, `Tried to index unsupported type '${actual}'`);
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

export class ConstantConditionError extends CashScriptError {
  constructor(
    node: BranchNode | RequireNode,
    res: boolean,
  ) {
    super(node, `Condition always evaluates to ${res}`);
  }
}

export class ArrayElementError extends CashScriptError {
  constructor(
    node: ArrayNode,
  ) {
    super(node, 'Incorrect elements in array');
  }
}

export class IndexOutOfBoundsError extends CashScriptError {
  constructor(
    node: TupleIndexOpNode,
  ) {
    super(node, `Index ${node.index} out of bounds`);
  }
}

export class VersionError extends Error {
  constructor(
    actual: string,
    constraint: string,
  ) {
    const message = `cashc version ${actual} does not satisfy version constraint ${constraint}`;
    super(message);

    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class UnverifiedCovenantError extends CashScriptError {
  constructor(
    node: IdentifierNode,
  ) {
    super(node, `Covenant variable ${node.name} was used without signature check`);
  }
}

export class SimulationError extends CashScriptError {}

export class WillCauseFailureError extends SimulationError {
  constructor(
    node: ExpressionNode,
  ) {
    super(node, 'Statement will cause a transaction error');
  }
}

export class ExecutionError extends Error {}
