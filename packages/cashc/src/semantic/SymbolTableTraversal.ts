import { GLOBAL_SYMBOL_TABLE, Modifier } from '../ast/Globals.js';
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
  AssignNode,
  TupleAssignmentNode,
  ConsoleStatementNode,
  ConsoleParameterNode,
} from '../ast/AST.js';
import AstTraversal from '../ast/AstTraversal.js';
import { SymbolTable, Symbol, SymbolType } from '../ast/SymbolTable.js';
import {
  FunctionRedefinitionError,
  VariableRedefinitionError,
  UndefinedReferenceError,
  UnusedVariableError,
  InvalidSymbolTypeError,
  ConstantModificationError,
} from '../Errors.js';

export default class SymbolTableTraversal extends AstTraversal {
  private symbolTables: SymbolTable[] = [GLOBAL_SYMBOL_TABLE];
  private functionNames: Map<string, boolean> = new Map<string, boolean>();
  private currentFunction: FunctionDefinitionNode;
  private expectedSymbolType: SymbolType = SymbolType.VARIABLE;
  private insideConsoleStatement: boolean = false;

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
    node.body = this.visit(node.body);

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

    node.statements = this.visitOptionalList(node.statements) as StatementNode[];

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

  visitAssign(node: AssignNode): Node {
    const v = this.symbolTables[0].get(node.identifier.name)?.definition as VariableDefinitionNode;
    // const used_modifiers = [] # PREVENT USER FROM USING SAME MODIFIER AGAIN
    v?.modifier?.forEach((modifier) => {
      if (modifier === Modifier.CONSTANT) {
        throw new ConstantModificationError(v);
      }
    });

    super.visitAssign(node);
    return node;
  }

  visitTupleAssignment(node: TupleAssignmentNode): Node {
    [node.left, node.right].forEach(({ name, type }) => {
      if (this.symbolTables[0].get(name)) {
        throw new VariableRedefinitionError(new VariableDefinitionNode(type, [], name, node.tuple));
      }
      this.symbolTables[0].set(
        Symbol.variable(new VariableDefinitionNode(type, [], name, node.tuple)),
      );
    });

    node.tuple = this.visit(node.tuple);
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

  // When we enter a console statement,
  visitConsoleStatement(node: ConsoleStatementNode): Node {
    this.insideConsoleStatement = true;
    node.parameters = this.visitList(node.parameters) as ConsoleParameterNode[];
    this.insideConsoleStatement = false;

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

    // Keep track of final use of variables for code generation (excluding console statements)
    if (!this.insideConsoleStatement) {
      this.currentFunction.opRolls.set(node.name, node);
    }

    return node;
  }
}
