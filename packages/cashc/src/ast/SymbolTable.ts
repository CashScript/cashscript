import { Type } from '@cashscript/utils';
import {
  VariableDefinitionNode,
  ParameterNode,
  IdentifierNode,
  Node,
} from './AST.js';

export class Symbol {
  references: IdentifierNode[] = [];
  private constructor(
    public name: string,
    public type: Type,
    public symbolType: SymbolType,
    public definition?: Node,
    public parameters?: Type[],
    // For user-defined functions: the full ordered list of declared return types. A single-return
    // function has one element (matching `type`); a multi-return function has N elements. Used to
    // type-check and bind tuple-destructuring call sites.
    public returnTypes?: Type[],
  ) {}

  static variable(node: VariableDefinitionNode | ParameterNode): Symbol {
    return new Symbol(node.name, node.type, SymbolType.VARIABLE, node);
  }

  static global(name: string, type: Type): Symbol {
    return new Symbol(name, type, SymbolType.VARIABLE);
  }

  static function(name: string, type: Type, parameters: Type[], definition?: Node, returnTypes?: Type[]): Symbol {
    return new Symbol(name, type, SymbolType.FUNCTION, definition, parameters, returnTypes);
  }

  static class(name: string, type: Type, parameters: Type[]): Symbol {
    return new Symbol(name, type, SymbolType.CLASS, undefined, parameters);
  }

  toString(): string {
    let str = `${this.type} ${this.name}`;
    if (this.parameters) {
      str += ` (${this.parameters})`;
    }
    return str;
  }
}

export enum SymbolType {
  VARIABLE = 'variable',
  FUNCTION = 'function',
  CLASS = 'class',
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
    return this.symbols.get(name) ?? this.parent?.get(name);
  }

  getFromThis(name: string): Symbol | undefined {
    return this.symbols.get(name);
  }

  toString(): string {
    return `[${Array.from(this.symbols).map((e) => e[1])}]`;
  }

  unusedSymbols(): Symbol[] {
    return Array.from(this.symbols)
      .map((e) => e[1])
      // Only variables are subject to the unused-variable check; user-defined function symbols
      // may legitimately go uncalled (and are reported elsewhere if needed).
      .filter((s) => s.symbolType === SymbolType.VARIABLE)
      .filter((s) => s.references.length === 0);
  }
}
