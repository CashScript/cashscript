import {
  IdentifierNode,
  FunctionDefinitionNode,
  VariableDefinitionNode,
  ParameterNode,
  Node,
} from './ast/AST';

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
