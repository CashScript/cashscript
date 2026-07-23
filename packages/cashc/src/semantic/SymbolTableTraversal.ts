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
  UnusedVariableError,
  InvalidSymbolTypeError,
  ConstantModificationError,
  DuplicateTupleTargetError,
  TupleTargetOrderError,
  InvalidModifierError,
} from '../Errors.js';

export default class SymbolTableTraversal extends AstTraversal {
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

    const unusedSymbols = node.symbolTable.unusedSymbols();
    if (unusedSymbols.length !== 0) {
      throw new UnusedVariableError(unusedSymbols[0]);
    }

    this.symbolTables.shift();
    return node;
  }

  visitParameter(node: ParameterNode): Node {
    if (this.symbolTables[0].get(node.name)) {
      throw new RedefinitionError(node, node.name);
    }

    validateModifiers(node, node.modifiers, [Modifier.UNUSED]);

    this.symbolTables[0].set(Symbol.variable(node));
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
      throw new RedefinitionError(node, node.name);
    }

    validateModifiers(node, node.modifiers, [Modifier.CONSTANT, Modifier.UNUSED]);

    node.expression = this.visit(node.expression);

    this.symbolTables[0].set(Symbol.variable(node));

    return node;
  }

  visitAssign(node: AssignNode): Node {
    const symbol = this.symbolTables[0].get(node.identifier.name);

    if (symbol?.definition === undefined || symbol.definition instanceof FunctionDefinitionNode) {
      throw new UndefinedReferenceError(node.identifier);
    }

    if (symbol.hasModifier(Modifier.CONSTANT)) {
      throw new ConstantModificationError(node, node.identifier.name);
    }

    super.visitAssign(node);
    return node;
  }

  visitTupleAssignment(node: TupleAssignmentNode): Node {
    // Declarations must form a contiguous block before all reassignment targets — the one layout
    // scoped codegen can fold in place (see GenerateTargetTraversal.visitTupleAssignment). Enforced
    // uniformly so a statement's legality does not depend on whether it sits inside a loop/branch.
    const firstReassignment = node.targets.findIndex((target) => target.isReassignment);
    if (firstReassignment !== -1 && node.targets.slice(firstReassignment).some((target) => !target.isReassignment)) {
      throw new TupleTargetOrderError(node);
    }

    const seenTargetNames = new Set<string>();
    node.targets.forEach((variable) => {
      if (seenTargetNames.has(variable.name)) {
        throw new DuplicateTupleTargetError(node, variable.name);
      }
      seenTargetNames.add(variable.name);

      if (variable.isReassignment) {
        // Reassignment of an existing variable (`x`, no type): adopt its type for the type-check and
        // register a reference (so it isn't flagged unused). Do NOT create a new symbol.
        const reference = new IdentifierNode(variable.name);
        reference.location = node.location;
        const existing = this.symbolTables[0].get(variable.name);
        if (!existing) {
          throw new UndefinedReferenceError(reference);
        }
        // only variables can be reassigned (not functions or classes)
        if (existing.symbolType !== SymbolType.VARIABLE) {
          throw new InvalidSymbolTypeError(reference, SymbolType.VARIABLE);
        }
        if (existing.definition instanceof ConstantDefinitionNode) {
          throw new ConstantModificationError(node, variable.name);
        }
        const definition = existing.definition as VariableDefinitionNode | undefined;
        if (definition?.modifiers?.includes(Modifier.CONSTANT)) {
          throw new ConstantModificationError(node, variable.name);
        }
        variable.type = existing.type;
        existing.references.push(reference);
        // The reassignment is now the variable's latest use, so codegen must not roll it off the
        // stack at an earlier read (mirrors visitIdentifier's bookkeeping for plain assignments).
        this.currentFunction.opRolls.set(variable.name, reference);
        return;
      }

      const definition = createTupleVariableDefinition(node, variable);

      const { name } = variable;
      if (this.symbolTables[0].get(name)) {
        throw new RedefinitionError(definition, name);
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

    if (symbol.hasModifier(Modifier.UNUSED)) {
      throw new InvalidModifierError(node, `Cannot reference variable '${node.name}' because it is marked 'unused'`);
    }

    // Global constant references are replaced by their literal value, so all later passes
    // (type checking, literal-driven analysis, codegen) see a plain literal at the use site.
    if (symbol.definition instanceof ConstantDefinitionNode) {
      return createConstantLiteral(symbol.definition, node);
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
  variable: TupleAssignmentTarget,
): VariableDefinitionNode {
  // Only declaration targets reach here (reassignment targets are handled before this is called),
  // so `type` is always defined.
  const definition = new VariableDefinitionNode(variable.type!, [], variable.name, node.tuple);
  definition.location = node.location;
  return definition;
}
