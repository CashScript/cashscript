import {
  VariableDefinitionNode,
  ParameterNode,
  FunctionDefinitionNode,
  IdentifierNode,
} from './AST';
import { Type } from './Type';

export class Symbol {
  references: IdentifierNode[] = [];
  constructor(
    public name: string,
    public type: Type,
    public parameters?: Type[],
  ) {}

  static variable(node: VariableDefinitionNode) {
    return new Symbol(node.name, node.type);
  }

  static parameter(node: ParameterNode) {
    return new Symbol(node.name, node.type);
  }

  static function(node: FunctionDefinitionNode) {
    return new Symbol(node.name, Type.VOID, node.parameters.map(p => p.type));
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
}
