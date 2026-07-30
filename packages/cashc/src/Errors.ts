import { Type, PrimitiveType } from '@cashscript/utils';
import {
  IdentifierNode,
  ImportNode,
  FunctionDefinitionNode,
  ConstantDefinitionNode,
  VariableDefinitionNode,
  Node,
  FunctionCallNode,
  BinaryOpNode,
  UnaryOpNode,
  TimeOpNode,
  CastNode,
  AssignNode,
  ArrayNode,
  TupleIndexOpNode,
  RequireNode,
  InstantiationNode,
  StatementNode,
  ContractNode,
  SliceNode,
  IntLiteralNode,
} from './ast/AST.js';
import { Symbol, SymbolType } from './ast/SymbolTable.js';
import { Location } from './ast/Location.js';
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
    public location: Location,
  ) {
    message += ` at ${location.start}`;

    super(message);
    this.name = this.constructor.name;
    this.location = location;
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
    super(node, `Found symbol ${node.name} with type ${node.symbol?.symbolType} where type ${expected} was expected`);
  }
}

export class RedefinitionError extends CashScriptError {
  constructor(
    public node: Node,
    public identifier: string,
  ) {
    super(node, `Redefinition of identifier ${identifier}`);
  }
}

export class MissingContractError extends Error {
  constructor() {
    super('Source file does not contain a contract definition');
    this.name = this.constructor.name;
  }
}

export class ImportResolutionError extends CashScriptError {
  constructor(
    public node: ImportNode,
    message: string,
  ) {
    super(node, message);
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

export class UnusedFunctionReturnError extends CashScriptError {
  constructor(
    public node: FunctionCallNode,
  ) {
    super(node, `Return value of ${node.identifier.name} must be used; only void functions may be called as a statement`);
  }
}

export class MissingReturnError extends CashScriptError {
  constructor(
    public node: Node,
  ) {
    super(node, 'A value-returning function must end with a return statement');
  }
}

export class MisplacedReturnError extends CashScriptError {
  constructor(
    public node: StatementNode,
  ) {
    super(node, 'A return statement is only allowed as the final statement of a function body');
  }
}

export class UnsafeFunctionOperationError extends CashScriptError {
  constructor(
    node: Node,
    operation: string,
  ) {
    super(
      node,
      `'${operation}' cannot be used inside a user-defined function. Use it directly in a `
      + 'contract function instead, or pass the resulting value into the function as a parameter',
    );
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

export class ReturnTypeError extends TypeError {
  constructor(
    node: Node,
    actual?: Type,
    expected?: Type,
  ) {
    super(node, actual, expected, `Cannot return type '${actual}' from a function with return type '${expected}'`);
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

export class AssignTypeError extends TypeError {
  constructor(
    node: AssignNode | VariableDefinitionNode | ConstantDefinitionNode,
  ) {
    const expected = node instanceof AssignNode ? node.identifier.type : node.type;
    const expression = node instanceof ConstantDefinitionNode ? node.value : node.expression;
    const target = node instanceof ConstantDefinitionNode ? `constant '${node.name}'` : 'variable';
    super(node, expression.type, expected, `Type '${expression.type}' can not be assigned to ${target} of type '${expected}'`);
  }
}

export class InvalidConstantExpressionError extends CashScriptError {
  constructor(
    public node: Node,
  ) {
    super(
      node,
      'Global constant definitions only support literals, references to other constants, '
      + 'integer arithmetic and concatenation',
    );
  }
}

export class DivisionByZeroError extends CashScriptError {
  constructor(
    public node: BinaryOpNode,
  ) {
    super(node, 'Division by zero');
  }
}

export class ConstantModificationError extends CashScriptError {
  constructor(node: VariableDefinitionNode | ConstantDefinitionNode);
  constructor(node: Node, name: string);
  constructor(
    node: Node,
    name?: string,
  ) {
    const constantName = name ?? (node as VariableDefinitionNode | ConstantDefinitionNode).name;
    super(node, `Tried to modify immutable variable '${constantName}'`);
  }
}

export class InvalidModifierError extends CashScriptError { }

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

export class BitshiftBitcountNegativeError extends CashScriptError {
  constructor(
    node: BinaryOpNode,
    bitcount: number,
  ) {
    super(node, `Bitshift bitcount cannot be negative: ${bitcount}`);
  }
}

export class VersionError extends Error {
  constructor(
    readonly actual: string,
    readonly constraint: string,
    readonly sourceFile?: string,
  ) {
    const provenance = sourceFile ? ` (from pragma in imported file '${sourceFile}')` : '';
    const message = `cashc version ${actual} does not satisfy version constraint ${constraint}${provenance}`;
    super(message);

    this.name = this.constructor.name;
  }
}
