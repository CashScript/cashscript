import { DebugFrame, Type, Script, Op, encodeInt } from '@cashscript/utils';
import {
  VariableDefinitionNode,
  ParameterNode,
  FunctionDefinitionNode,
  ConstantDefinitionNode,
  IdentifierNode,
  DefinitionNode,
} from './AST.js';
import { Modifier } from './Globals.js';
import { functionReturnType } from '../utils.js';

export class Symbol {
  uses: IdentifierNode[] = [];
  inlinedFrame?: DebugFrame;

  private constructor(
    public name: string,
    public type: Type,
    public symbolType: SymbolType,
    public definition?: DefinitionNode,
    public parameters?: Type[],
    public bytecode?: Script,
    public functionId?: number,
  ) { }

  hasModifier(modifier: Modifier): boolean {
    return this.definition !== undefined
      && !(this.definition instanceof FunctionDefinitionNode)
      && this.definition.modifiers.includes(modifier);
  }

  isUnused(): boolean {
    return this.uses.length === 0;
  }

  static variable(node: VariableDefinitionNode | ParameterNode): Symbol {
    return new Symbol(node.name, node.type, SymbolType.VARIABLE, node);
  }

  static constant(node: ConstantDefinitionNode): Symbol {
    return new Symbol(node.name, node.type, SymbolType.VARIABLE, node);
  }

  static global(name: string, type: Type): Symbol {
    return new Symbol(name, type, SymbolType.VARIABLE);
  }

  static builtinFunction(name: string, returnType: Type, parameters: Type[], bytecode: Script): Symbol {
    return new Symbol(name, returnType, SymbolType.FUNCTION, undefined, parameters, bytecode);
  }

  static userFunction(node: FunctionDefinitionNode): Symbol {
    const parameterTypes = node.parameters.map((parameter) => parameter.type);
    return new Symbol(node.name, functionReturnType(node.returnTypes), SymbolType.FUNCTION, node, parameterTypes);
  }

  setFunctionId(functionId: number): void {
    this.functionId = functionId;
    this.bytecode = [encodeInt(BigInt(functionId)), Op.OP_INVOKE];
  }

  setInlinedBytecode(bytecode: Script, frame: DebugFrame): void {
    this.bytecode = bytecode;
    this.inlinedFrame = frame;
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

  getUnmarkedUnusedSymbols(): Symbol[] {
    return Array.from(this.symbols)
      .map((e) => e[1])
      .filter((s) => !s.hasModifier(Modifier.UNUSED))
      .filter((s) => s.isUnused());
  }
}
