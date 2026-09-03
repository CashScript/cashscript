import { IdentifierNode, Node } from './ast/AST.js';
import { Symbol } from './ast/SymbolTable.js';

export class CashScriptWarning {
  name: string;
  message: string;

  constructor(
    public node: Node,
    message: string,
  ) {
    if (node.location) {
      message += ` at ${node.location.start}`;
    }

    this.name = this.constructor.name;
    this.message = message;
  }
}

export class UnusedVariableWarning extends CashScriptWarning {
  constructor(
    public symbol: Symbol,
  ) {
    super(symbol.definition as Node, `Unused variable '${symbol.name}'`);
  }
}

export class UnusedAssignmentWarning extends CashScriptWarning {
  constructor(
    public identifier: IdentifierNode,
  ) {
    super(identifier, `Value assigned to '${identifier.name}' is never read`);
  }
}

export type CashScriptWarningListener = (warning: CashScriptWarning) => void;

export const defaultWarningListener: CashScriptWarningListener = (warning) => {
  console.warn(`Warning: ${warning.message}`);
};
