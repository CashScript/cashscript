import {
  VariableDefinitionNode,
  ParameterNode,
  IdentifierNode,
  Node,
} from './AST';
import { Type } from './Type';

export class Symbol {
  references: IdentifierNode[] = [];
  constructor(
    public name: string,
    public type: Type,
    public definition?: Node,
    public parameters?: Type[],
  ) {}

  static variable(node: VariableDefinitionNode): Symbol {
    return new Symbol(node.name, node.type, node);
  }

  static parameter(node: ParameterNode): Symbol {
    return new Symbol(node.name, node.type, node);
  }

  toString(): string {
    let str = `${this.type} ${this.name}`;
    if (this.parameters) {
      str += ` (${this.parameters})`;
    }
    return str;
  }
}

export class SymbolTable {
  symbols: Map<String, Symbol> = new Map<String, Symbol>();

  constructor(
    public parent?: SymbolTable,
  ) {}

  set(symbol: Symbol): void {
    this.symbols.set(symbol.name, symbol);
  }

  get(name: string): Symbol | undefined {
    let symbol = this.symbols.get(name);
    symbol = symbol || (this.parent && this.parent.get(name));
    return symbol;
  }

  getFromThis(name: string): Symbol | undefined {
    return this.symbols.get(name);
  }

  toString(): string {
    return `[${Array.from(this.symbols).map(e => e[1])}]`;
  }

  unusedSymbols(): Symbol[] {
    return Array.from(this.symbols)
      .map(e => e[1])
      .filter(s => s.references.length === 0);
  }
}
