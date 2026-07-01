import { Type, PrimitiveType, Script, Op, encodeInt } from '@cashscript/utils';
import {
  VariableDefinitionNode,
  ParameterNode,
  FunctionDefinitionNode,
  IdentifierNode,
  Node,
} from './AST.js';

export class Symbol {
  references: IdentifierNode[] = [];

  // For functions, the full ordered list of return types (empty for void). `type` mirrors the first
  // (or VOID) so single-value call sites are unchanged; multi-return call sites read `returnTypes`.
  returnTypes: Type[] = [];

  private constructor(
    public name: string,
    public type: Type,
    public symbolType: SymbolType,
    public definition?: Node,
    public parameters?: Type[],
    public bytecode?: Script,
    public functionId?: number,
  ) { }

  static variable(node: VariableDefinitionNode | ParameterNode): Symbol {
    return new Symbol(node.name, node.type, SymbolType.VARIABLE, node);
  }

  static global(name: string, type: Type): Symbol {
    return new Symbol(name, type, SymbolType.VARIABLE);
  }

  static builtinFunction(name: string, returnType: Type, parameters: Type[], bytecode: Script): Symbol {
    const symbol = new Symbol(name, returnType, SymbolType.FUNCTION, undefined, parameters, bytecode);
    symbol.returnTypes = returnType === PrimitiveType.VOID ? [] : [returnType];
    return symbol;
  }

  static userFunction(node: FunctionDefinitionNode, functionId: number): Symbol {
    const parameterTypes = node.parameters.map((parameter) => parameter.type);
    const returnTypes = node.returnTypes ?? [];
    const symbol = new Symbol(node.name, returnTypes[0] ?? PrimitiveType.VOID, SymbolType.FUNCTION, node, parameterTypes);
    symbol.returnTypes = returnTypes;
    symbol.setFunctionId(functionId);
    return symbol;
  }

  setFunctionId(functionId: number): void {
    this.functionId = functionId;
    this.bytecode = [encodeInt(BigInt(functionId)), Op.OP_INVOKE];
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
  ) { }

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
      .filter((s) => s.references.length === 0);
  }
}
