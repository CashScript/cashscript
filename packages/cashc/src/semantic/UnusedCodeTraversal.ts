import {
  AssignNode,
  BlockNode,
  ContractNode,
  DoWhileNode,
  ForNode,
  FunctionDefinitionNode,
  IdentifierNode,
  Node,
  TupleAssignmentNode,
  WhileNode,
} from '../ast/AST.js';
import AstTraversal from '../ast/AstTraversal.js';
import { Symbol, SymbolTable } from '../ast/SymbolTable.js';
import { CashScriptWarningListener, UnusedAssignmentWarning, UnusedVariableWarning } from '../Warnings.js';

export default class UnusedCodeWarningsTraversal extends AstTraversal {
  private pendingWrites: Map<Symbol, Set<IdentifierNode>> = new Map<Symbol, Set<IdentifierNode>>();
  private readWrites: Set<IdentifierNode> = new Set<IdentifierNode>();
  private reportedScopes: Set<SymbolTable> = new Set<SymbolTable>();

  constructor(private warningListener: CashScriptWarningListener) {
    super();
  }

  visitContract(node: ContractNode): Node {
    super.visitContract(node);
    this.collectUnusedVariableWarnings(node.symbolTable!);
    return node;
  }

  visitFunctionDefinition(node: FunctionDefinitionNode): Node {
    super.visitFunctionDefinition(node);
    this.collectUnusedVariableWarnings(node.symbolTable!);
    this.collectUnusedAssignmentWarnings();
    return node;
  }

  visitBlock(node: BlockNode): Node {
    super.visitBlock(node);
    this.collectUnusedVariableWarnings(node.symbolTable!);
    return node;
  }

  visitFor(node: ForNode): Node {
    this.visit(node.init);
    this.visitLoop(() => {
      this.visit(node.condition);
      this.visit(node.block);
      this.visit(node.update);
    });
    this.collectUnusedVariableWarnings(node.symbolTable!);
    return node;
  }

  visitWhile(node: WhileNode): Node {
    this.visitLoop(() => {
      this.visit(node.condition);
      this.visit(node.block);
    });
    return node;
  }

  visitDoWhile(node: DoWhileNode): Node {
    this.visitLoop(() => {
      this.visit(node.block);
      this.visit(node.condition);
    });
    return node;
  }

  // Loops are visited twice (in execution order), so that a read at the start of the loop is seen to follow
  // a write later in the loop, as it does in the next iteration
  private visitLoop(visitIteration: () => void): void {
    visitIteration();
    visitIteration();
  }

  visitAssign(node: AssignNode): Node {
    // The expression is visited before the write is recorded, so that reads inside the expression
    // (e.g. x = x + 1) do not count as reading the assigned value
    this.visit(node.expression);
    this.recordWrite(node.identifier);
    return node;
  }

  visitTupleAssignment(node: TupleAssignmentNode): Node {
    this.visit(node.tuple);
    node.targets
      .filter((target) => target.isReassignment)
      .forEach((target) => this.recordWrite(target.identifier));
    return node;
  }

  visitIdentifier(node: IdentifierNode): Node {
    this.pendingWrites.get(node.symbol!)?.forEach((write) => this.readWrites.add(write));
    this.pendingWrites.delete(node.symbol!);
    return node;
  }

  private recordWrite(identifier: IdentifierNode): void {
    if (this.readWrites.has(identifier)) return;

    const symbol = identifier.symbol!;
    const pendingWrites = this.pendingWrites.get(symbol) ?? new Set<IdentifierNode>();
    pendingWrites.add(identifier);
    this.pendingWrites.set(symbol, pendingWrites);
  }

  // Each scope is reported once, even though scopes inside loops are visited twice
  private collectUnusedVariableWarnings(symbolTable: SymbolTable): void {
    if (this.reportedScopes.has(symbolTable)) return;
    this.reportedScopes.add(symbolTable);

    symbolTable.getUnmarkedUnusedSymbols().forEach((symbol) => this.warningListener(new UnusedVariableWarning(symbol)));
  }

  // At the end of a function, every read that could follow its assignments has been visited
  private collectUnusedAssignmentWarnings(): void {
    this.pendingWrites.forEach((writes, symbol) => {
      // Writes to a variable that is never read at all are covered by its unused variable warning
      if (symbol.isUnused()) return;
      writes.forEach((write) => this.warningListener(new UnusedAssignmentWarning(write)));
    });

    this.pendingWrites.clear();
    this.readWrites.clear();
  }
}
