import { GLOBAL_SYMBOL_TABLE, Modifier } from '../ast/Globals.js';
import {
  SourceFileNode,
  ContractNode,
  ParameterNode,
  VariableDefinitionNode,
  FunctionDefinitionNode,
  FunctionKind,
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
  ForNode,
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
  private contractFunctionNames: Map<string, boolean> = new Map<string, boolean>();
  private currentFunction: FunctionDefinitionNode;
  private expectedSymbolType: SymbolType = SymbolType.VARIABLE;
  private insideConsoleStatement: boolean = false;

  visitSourceFile(node: SourceFileNode): Node {
    const globalFunctionTable = new SymbolTable(this.symbolTables[0]);

    node.functions.forEach((functionNode, functionId) => {
      if (globalFunctionTable.get(functionNode.name)) {
        throw new FunctionRedefinitionError(functionNode);
      }
      const symbol = Symbol.userFunction(functionNode, functionId);
      globalFunctionTable.set(symbol);
    });

    node.symbolTable = globalFunctionTable;
    this.symbolTables.unshift(globalFunctionTable);

    node.functions = this.visitList(node.functions) as FunctionDefinitionNode[];
    node.contract = this.visitOptional(node.contract) as ContractNode | undefined;

    this.symbolTables.shift();
    return node;
  }

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

    if (node.kind === FunctionKind.CONTRACT) {
      if (this.contractFunctionNames.get(node.name)) {
        throw new FunctionRedefinitionError(node);
      }
      this.contractFunctionNames.set(node.name, true);
    }

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

  visitFor(node: ForNode): Node {
    node.symbolTable = new SymbolTable(this.symbolTables[0]);
    this.symbolTables.unshift(node.symbolTable);

    node.init = this.visit(node.init) as VariableDefinitionNode | AssignNode;
    node.condition = this.visit(node.condition);
    node.update = this.visit(node.update) as AssignNode;
    node.block = this.visit(node.block);

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
    [node.left, node.right].forEach((variable) => {
      const definition = createTupleVariableDefinition(node, variable);

      const { name } = variable;
      if (this.symbolTables[0].get(name)) {
        throw new VariableRedefinitionError(definition);
      }
      this.symbolTables[0].set(
        Symbol.variable(definition),
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
    const symbol = this.symbolTables[0].get(node.name);
    if (!symbol) {
      throw new UndefinedReferenceError(node);
    }

    if (symbol.symbolType !== this.expectedSymbolType) {
      throw new InvalidSymbolTypeError(node, this.expectedSymbolType);
    }

    node.symbol = symbol;
    node.symbol.references.push(node);

    // Keep track of final use of variables for code generation (excluding console statements)
    if (!this.insideConsoleStatement) {
      this.currentFunction.opRolls.set(node.name, node);
    }

    return node;
  }
}

function createTupleVariableDefinition(
  node: TupleAssignmentNode,
  variable: TupleAssignmentNode['left'],
): VariableDefinitionNode {
  const definition = new VariableDefinitionNode(variable.type, [], variable.name, node.tuple);
  definition.location = node.location;
  return definition;
}
