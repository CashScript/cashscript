import { Node } from './ast/AST.js';
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

export type CashScriptWarningListener = (warnings: CashScriptWarning[]) => void;

export const defaultWarningListener: CashScriptWarningListener = (warnings) => {
  warnings.forEach((warning) => console.warn(`Warning: ${warning.message}`));
};
