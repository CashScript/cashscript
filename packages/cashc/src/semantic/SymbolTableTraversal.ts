import { GLOBAL_SYMBOL_TABLE, Modifier } from '../ast/Globals.js';
import {
  SourceFileNode,
  ContractNode,
  ParameterNode,
  VariableDefinitionNode,
  FunctionDefinitionNode,
  ConstantDefinitionNode,
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
  TupleAssignmentTarget,
} from '../ast/AST.js';
import AstTraversal from '../ast/AstTraversal.js';
import { SymbolTable, Symbol, SymbolType } from '../ast/SymbolTable.js';
import { createConstantLiteral } from './LowerGlobalConstantsTraversal.js';
import {
  RedefinitionError,
  UndefinedReferenceError,
  InvalidSymbolTypeError,
  ConstantModificationError,
  DuplicateTupleTargetError,
  InvalidModifierError,
} from '../Errors.js';
import { CashScriptWarning, UnusedVariableWarning } from '../Warnings.js';

export default class SymbolTableTraversal extends AstTraversal {
  warnings: CashScriptWarning[] = [];

  private symbolTables: SymbolTable[] = [GLOBAL_SYMBOL_TABLE];
  private contractFunctionNames: Map<string, boolean> = new Map<string, boolean>();
  private currentFunction: FunctionDefinitionNode;
  private expectedSymbolType: SymbolType = SymbolType.VARIABLE;
  private insideConsoleStatement: boolean = false;

  visitSourceFile(node: SourceFileNode): Node {
    const globalFunctionTable = new SymbolTable(this.symbolTables[0]);

    node.functions.forEach((functionNode) => {
      if (globalFunctionTable.get(functionNode.name)) throw new RedefinitionError(functionNode, functionNode.name);
      globalFunctionTable.set(Symbol.userFunction(functionNode));
    });

    node.constants.forEach((constantNode) => {
      if (globalFunctionTable.get(constantNode.name)) throw new RedefinitionError(constantNode, constantNode.name);
      globalFunctionTable.set(Symbol.constant(constantNode));
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

    this.collectUnusedSymbolWarnings(node.symbolTable);

    this.symbolTables.shift();
    return node;
  }

  visitParameter(node: ParameterNode): Node {
    if (this.symbolTables[0].get(node.name)) {
      throw new RedefinitionError(node, node.name);
    }

    validateModifiers(node, node.modifiers, [Modifier.UNUSED]);

    node.symbol = Symbol.variable(node);
    this.symbolTables[0].set(node.symbol);
    return node;
  }

  visitFunctionDefinition(node: FunctionDefinitionNode): Node {
    this.currentFunction = node;

    if (node.kind === FunctionKind.CONTRACT) {
      if (this.contractFunctionNames.get(node.name)) {
        throw new RedefinitionError(node, node.name);
      }
      this.contractFunctionNames.set(node.name, true);
    }

    node.symbolTable = new SymbolTable(this.symbolTables[0]);
    this.symbolTables.unshift(node.symbolTable);

    node.parameters = this.visitList(node.parameters) as ParameterNode[];
    node.body = this.visit(node.body);

    this.collectUnusedSymbolWarnings(node.symbolTable);

    this.symbolTables.shift();
    return node;
  }

  visitBlock(node: BlockNode): Node {
    node.symbolTable = new SymbolTable(this.symbolTables[0]);
    this.symbolTables.unshift(node.symbolTable);

    node.statements = this.visitOptionalList(node.statements) as StatementNode[];

    this.collectUnusedSymbolWarnings(node.symbolTable);

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

    this.collectUnusedSymbolWarnings(node.symbolTable);

    this.symbolTables.shift();
    return node;
  }

  visitVariableDefinition(node: VariableDefinitionNode): Node {
    if (this.symbolTables[0].get(node.name)) {
      throw new RedefinitionError(node, node.name);
    }

    validateModifiers(node, node.modifiers, [Modifier.CONSTANT, Modifier.UNUSED]);

    node.expression = this.visit(node.expression);

    node.symbol = Symbol.variable(node);
    this.symbolTables[0].set(node.symbol);

    return node;
  }

  visitAssign(node: AssignNode): Node {
    node.identifier.symbol = this.resolveAssignmentTarget(node, node.identifier);
    node.expression = this.visit(node.expression);
    return node;
  }

  visitTupleAssignment(node: TupleAssignmentNode): Node {
    const seenTargetNames = new Set<string>();
    node.targets.forEach((target) => {
      if (seenTargetNames.has(target.identifier.name)) {
        throw new DuplicateTupleTargetError(node, target.identifier.name);
      }
      seenTargetNames.add(target.identifier.name);

      if (target.isReassignment) {
        target.identifier.symbol = this.resolveAssignmentTarget(node, target.identifier);
        target.type = target.identifier.symbol.type;
      } else {
        const definition = createTupleVariableDefinition(node, target);

        if (this.symbolTables[0].get(target.identifier.name)) {
          throw new RedefinitionError(definition, target.identifier.name);
        }

        validateModifiers(definition, definition.modifiers, [Modifier.CONSTANT, Modifier.UNUSED]);

        target.identifier.symbol = Symbol.variable(definition);
        this.symbolTables[0].set(target.identifier.symbol);
      }
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

    if (symbol.hasModifier(Modifier.UNUSED)) {
      throw new InvalidModifierError(node, `Cannot reference variable '${node.name}' because it is marked 'unused'`);
    }

    // Global constant references are replaced by their literal value, so all later passes
    // (type checking, literal-driven analysis, codegen) see a plain literal at the use site.
    if (symbol.definition instanceof ConstantDefinitionNode) {
      return createConstantLiteral(symbol.definition, node);
    }

    node.symbol = symbol;
    node.symbol.uses.push(node);

    // Keep track of final use of variables for code generation (excluding console statements)
    if (!this.insideConsoleStatement) {
      this.currentFunction.opRolls.set(node.name, node);
    }

    return node;
  }

  // Assignment targets are resolved without counting as a use of the variable, since only reads count
  private resolveAssignmentTarget(node: AssignNode | TupleAssignmentNode, identifier: IdentifierNode): Symbol {
    const symbol = this.symbolTables[0].get(identifier.name);

    if (!symbol) {
      throw new UndefinedReferenceError(identifier);
    }

    if (symbol.hasModifier(Modifier.CONSTANT)) {
      throw new ConstantModificationError(node, identifier.name);
    }

    if (symbol.symbolType !== SymbolType.VARIABLE) {
      throw new InvalidSymbolTypeError(identifier, SymbolType.VARIABLE);
    }

    if (symbol.hasModifier(Modifier.UNUSED)) {
      throw new InvalidModifierError(identifier, `Cannot assign to variable '${identifier.name}' because it is marked 'unused'`);
    }

    // An assignment still needs the variable to be on the stack, so it does count as its final use for code generation
    this.currentFunction.opRolls.set(identifier.name, identifier);

    return symbol;
  }

  private collectUnusedSymbolWarnings(symbolTable: SymbolTable): void {
    this.warnings.push(...symbolTable.getUnmarkedUnusedSymbols().map((symbol) => new UnusedVariableWarning(symbol)));
  }
}

function validateModifiers(
  node: ParameterNode | VariableDefinitionNode,
  modifiers: Modifier[],
  allowed: Modifier[],
): void {
  const seen = new Set<Modifier>();

  modifiers.forEach((modifier) => {
    if (seen.has(modifier)) {
      throw new InvalidModifierError(node, `Duplicate modifier '${modifier}'`);
    }

    if (!allowed.includes(modifier)) {
      const target = node instanceof ParameterNode ? 'parameters' : 'variables';
      throw new InvalidModifierError(node, `Modifier '${modifier}' is not allowed on ${target}`);
    }

    seen.add(modifier);
  });
}

function createTupleVariableDefinition(
  node: TupleAssignmentNode,
  target: TupleAssignmentTarget,
): VariableDefinitionNode {
  const definition = new VariableDefinitionNode(target.type!, target.modifiers, target.identifier.name, node.tuple);
  definition.location = node.location;
  return definition;
}
