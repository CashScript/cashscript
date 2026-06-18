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
  RecursiveFunctionError,
} from '../Errors.js';
import { PrimitiveType } from '@cashscript/utils';

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

    // Register user-defined (value-returning) functions in the contract scope *before* visiting any
    // function body, so that calls can resolve regardless of declaration order and mutual calls work.
    node.functions.forEach((func) => {
      if (!func.isUserFunction) return;
      if (this.symbolTables[0].getFromThis(func.name)) {
        throw new FunctionRedefinitionError(func);
      }
      this.symbolTables[0].set(Symbol.function(
        func.name,
        func.returnType ?? PrimitiveType.BOOL,
        func.parameters.map((p) => p.type),
        func,
      ));
    });

    // Detect recursion (direct or mutual) among user-defined functions before inlining.
    detectRecursion(node.functions);

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

    // Check for function redefinition. User-defined functions are additionally registered in the
    // contract symbol table (see visitContract) so that internal calls can resolve to them.
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

function createTupleVariableDefinition(
  node: TupleAssignmentNode,
  variable: TupleAssignmentNode['left'],
): VariableDefinitionNode {
  const definition = new VariableDefinitionNode(variable.type, [], variable.name, node.tuple);
  definition.location = node.location;
  return definition;
}

// Builds the call graph among user-defined functions and throws RecursiveFunctionError if any
// cycle (direct or mutual recursion) is found. Inlining cannot terminate on recursive functions.
function detectRecursion(functions: FunctionDefinitionNode[]): void {
  const userFunctions = functions.filter((f) => f.isUserFunction);
  const userFunctionNames = new Set(userFunctions.map((f) => f.name));
  const functionByName = new Map(userFunctions.map((f) => [f.name, f]));

  // Map each user function to the set of user functions it calls.
  const callGraph = new Map<string, string[]>();
  userFunctions.forEach((func) => {
    const calls = collectFunctionCallNames(func.body).filter((name) => userFunctionNames.has(name));
    callGraph.set(func.name, calls);
  });

  const visited = new Set<string>();
  const stack: string[] = [];
  const onStack = new Set<string>();

  const dfs = (name: string): void => {
    stack.push(name);
    onStack.add(name);

    for (const callee of callGraph.get(name) ?? []) {
      if (onStack.has(callee)) {
        const cycleStart = stack.indexOf(callee);
        const cycle = [...stack.slice(cycleStart), callee];
        throw new RecursiveFunctionError(functionByName.get(callee)!, cycle);
      }
      if (!visited.has(callee)) dfs(callee);
    }

    onStack.delete(name);
    stack.pop();
    visited.add(name);
  };

  userFunctions.forEach((func) => {
    if (!visited.has(func.name)) dfs(func.name);
  });
}

// Recursively collects the names of all FunctionCall identifiers reachable from a node.
function collectFunctionCallNames(node: Node | undefined): string[] {
  if (!node) return [];

  const names: string[] = [];
  const collector = new (class extends AstTraversal {
    visitFunctionCall(callNode: FunctionCallNode): Node {
      names.push(callNode.identifier.name);
      return super.visitFunctionCall(callNode);
    }
  })();

  node.accept(collector);
  return names;
}
