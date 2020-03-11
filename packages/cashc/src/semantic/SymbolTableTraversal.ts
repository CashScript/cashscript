import { GLOBAL_SYMBOL_TABLE } from '../ast/Globals';
import {
  ContractNode,
  ParameterNode,
  VariableDefinitionNode,
  FunctionDefinitionNode,
  IdentifierNode,
  StatementNode,
  BlockNode,
  Node,
  FunctionCallNode,
  InstantiationNode,
} from '../ast/AST';
import AstTraversal from '../ast/AstTraversal';
import { SymbolTable, Symbol, SymbolType } from '../ast/SymbolTable';
import {
  FunctionRedefinitionError,
  VariableRedefinitionError,
  UndefinedReferenceError,
  UnusedVariableError,
  InvalidSymbolTypeError,
} from '../Errors';

export default class SymbolTableTraversal extends AstTraversal {
  private symbolTables: SymbolTable[] = [GLOBAL_SYMBOL_TABLE];
  private functionNames: Map<string, boolean> = new Map<string, boolean>();
  private currentFunction: FunctionDefinitionNode;
  private expectedSymbolType: SymbolType = SymbolType.VARIABLE;

  visitContract(node: ContractNode): Node {
    node.symbolTable = new SymbolTable(this.symbolTables[0]);
    this.symbolTables.unshift(node.symbolTable);

    node.parameters = this.visitList(node.parameters) as ParameterNode[];
    node.functions = this.visitList(node.functions) as FunctionDefinitionNode[];

    const unusedSymbols = node.symbolTable.unusedSymbols();
    if (unusedSymbols.length !== 0) {
      throw new UnusedVariableError(unusedSymbols[0]);
    }

    this.symbolTables.shift();
    return node;
  }

  visitParameter(node: ParameterNode): Node {
    if (this.symbolTables[0].get(node.name)) {
      throw new VariableRedefinitionError(node);
    }

    this.symbolTables[0].set(Symbol.variable(node));
    return node;
  }

  visitFunctionDefinition(node: FunctionDefinitionNode): Node {
    this.currentFunction = node;

    // Checked for function redefinition, but they are not included in the
    // symbol table, as internal function calls are not supported.
    if (this.functionNames.get(node.name)) {
      throw new FunctionRedefinitionError(node);
    }
    this.functionNames.set(node.name, true);

    node.symbolTable = new SymbolTable(this.symbolTables[0]);
    this.symbolTables.unshift(node.symbolTable);

    node.parameters = this.visitList(node.parameters) as ParameterNode[];
    node.body = this.visit(node.body) as BlockNode;

    const unusedSymbols = node.symbolTable.unusedSymbols();
    if (unusedSymbols.length !== 0) {
      throw new UnusedVariableError(unusedSymbols[0]);
    }

    this.symbolTables.shift();
    return node;
  }

  visitBlock(node: BlockNode): Node {
    node.symbolTable = new SymbolTable(this.symbolTables[0]);
    this.symbolTables.unshift(node.symbolTable);

    node.statements = this.visitList(node.statements) as StatementNode[];

    const unusedSymbols = node.symbolTable.unusedSymbols();
    if (unusedSymbols.length !== 0) {
      throw new UnusedVariableError(unusedSymbols[0]);
    }

    this.symbolTables.shift();
    return node;
  }

  visitVariableDefinition(node: VariableDefinitionNode): Node {
    if (this.symbolTables[0].get(node.name)) {
      throw new VariableRedefinitionError(node);
    }

    node.expression = this.visit(node.expression);
    this.symbolTables[0].set(Symbol.variable(node));

    return node;
  }

  visitFunctionCall(node: FunctionCallNode): Node {
    this.expectedSymbolType = SymbolType.FUNCTION;
    node.identifier = this.visit(node.identifier) as IdentifierNode;
    this.expectedSymbolType = SymbolType.VARIABLE;
    node.parameters = this.visitList(node.parameters);
    return node;
  }

  visitInstantiation(node: InstantiationNode): Node {
    this.expectedSymbolType = SymbolType.CLASS;
    node.identifier = this.visit(node.identifier) as IdentifierNode;
    this.expectedSymbolType = SymbolType.VARIABLE;
    node.parameters = this.visitList(node.parameters);
    return node;
  }

  visitIdentifier(node: IdentifierNode): Node {
    const definition = this.symbolTables[0].get(node.name);

    if (!definition) {
      throw new UndefinedReferenceError(node);
    }

    if (definition.symbolType !== this.expectedSymbolType) {
      throw new InvalidSymbolTypeError(node, this.expectedSymbolType);
    }

    node.definition = definition;
    node.definition.references.push(node);

    // Keep track of final use of variables for code generation
    this.currentFunction.opRolls.set(node.name, node);

    return node;
  }
}
