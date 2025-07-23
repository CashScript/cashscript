import { Type, PrimitiveType } from '@cashscript/utils';
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
  CastNode,
  AssignNode,
  BranchNode,
  ArrayNode,
  TupleIndexOpNode,
  RequireNode,
  InstantiationNode,
  StatementNode,
  ContractNode,
  ExpressionNode,
  SliceNode,
  IntLiteralNode,
} from './ast/AST.js';
import { Symbol, SymbolType } from './ast/SymbolTable.js';
import { Location, Point } from './ast/Location.js';
import { BinaryOperator } from './ast/Operator.js';

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

export class ParseError extends Error {
  constructor(
    message: string,
    location?: Point | Location,
  ) {
    const start = location instanceof Point ? location : location?.start;

    if (start) {
      message += ` at ${start}`;
    }

    super(message);
    this.name = this.constructor.name;
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

export class RedefinitionError extends CashScriptError { }

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

export class EmptyContractError extends CashScriptError {
  constructor(
    public node: ContractNode,
  ) {
    super(node, `Contract ${node.name} contains no functions`);
  }
}

export class EmptyFunctionError extends CashScriptError {
  constructor(
    public node: FunctionDefinitionNode,
  ) {
    super(node, `Function ${node.name} contains no statements`);
  }
}

export class FinalRequireStatementError extends CashScriptError {
  constructor(
    public node: StatementNode,
  ) {
    super(node, 'Final statement is expected to be a require() statement');
  }
}

export class TypeError extends CashScriptError {
  constructor(
    node: Node,
    public actual?: Type | Type[],
    public expected?: Type | Type[],
    message?: string,
  ) {
    super(node, message ?? `Found type '${actual}' where type '${expected}' was expected`);
  }
}

export class InvalidParameterTypeError extends TypeError {
  constructor(
    node: FunctionCallNode | RequireNode | InstantiationNode,
    actual: Type[],
    expected: Type[],
  ) {
    const name = node instanceof RequireNode ? 'require' : node.identifier.name;
    super(
      node, actual, expected,
      `Found parameters (${actual}) in call to function '${name}' where parameters (${expected}) were expected`,
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
    node: BinaryOpNode | UnaryOpNode | TimeOpNode | TupleIndexOpNode | SliceNode,
    actual?: Type,
    expected?: Type,
  ) {
    if (node instanceof BinaryOpNode && node.operator.startsWith('.')) {
      if (expected === PrimitiveType.INT) {
        super(node, actual, expected, `Tried to call member 'split' with unsupported parameter type '${actual}'`);
      } else {
        super(node, actual, expected, `Tried to call member 'split' on unsupported type '${actual}'`);
      }
    } else if (node instanceof SliceNode) {
      super(node, actual, expected, `Tried to call member 'slice' on unsupported type '${actual}'`);
    } else if (node instanceof BinaryOpNode) {
      super(node, actual, expected, `Tried to apply operator '${node.operator}' to unsupported type '${actual}'`);
    } else if (node instanceof UnaryOpNode && node.operator.startsWith('.')) {
      super(node, actual, expected, `Tried to access member '${node.operator}' on unsupported type '${actual}'`);
    } else if (node instanceof UnaryOpNode && node.operator.includes('[i]')) {
      const [scope] = node.operator.split('[i]');
      super(node, actual, expected, `Tried to index '${scope}''with unsupported type '${actual}'`);
    } else if (node instanceof UnaryOpNode) {
      super(node, actual, expected, `Tried to apply operator '${node.operator}' to unsupported type '${actual}'`);
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

export class CastSizeError extends CashScriptError {
  constructor(
    node: CastNode,
  ) {
    super(node, 'Unexpected cast size argument found');
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

export class TupleAssignmentError extends CashScriptError {
  constructor(
    node: ExpressionNode,
  ) {
    super(node, 'Expression must return a tuple to use destructuring');
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

export class ConstantModificationError extends CashScriptError {
  constructor(
    node: VariableDefinitionNode,
  ) {
    super(node, `Tried to modify immutable variable '${node.name}'`);
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
    node: TupleIndexOpNode | BinaryOpNode | SliceNode,
  ) {
    if (node instanceof TupleIndexOpNode) {
      super(node, `Index ${node.index} out of bounds`);
    } else if (
      node instanceof BinaryOpNode && node.operator === BinaryOperator.SPLIT && node.right instanceof IntLiteralNode
    ) {
      const splitIndex = Number(node.right.value);
      super(node, `Split index ${splitIndex} out of bounds for type ${node.left.type}`);
    } else if (node instanceof SliceNode) {
      const start = node.start instanceof IntLiteralNode ? Number(node.start.value) : 'start';
      const end = node.end instanceof IntLiteralNode ? Number(node.end.value) : 'end';
      super(node, `Slice indexes (${start}, ${end}) out of bounds for type ${node.element.type}`);
    } else {
      super(node, 'Index out of bounds');
    }
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
  }
}
