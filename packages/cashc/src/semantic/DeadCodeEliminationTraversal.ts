import {
  FunctionCallNode,
  FunctionDefinitionNode,
  Node,
  SourceFileNode,
} from '../ast/AST.js';
import AstTraversal from '../ast/AstTraversal.js';

export default class DeadCodeEliminationTraversal extends AstTraversal {
  private visitedFunctions: FunctionDefinitionNode[] = [];
  private reachableFunctions: FunctionDefinitionNode[] = [];

  visitSourceFile(node: SourceFileNode): Node {
    super.visitOptional(node.contract);

    // The reachable functions are stored callee-first, which code generation relies on
    node.functions = this.reachableFunctions;
    return node;
  }

  visitFunctionCall(node: FunctionCallNode): Node {
    node = super.visitFunctionCall(node) as FunctionCallNode;

    const functionDefinition = node.identifier.symbol?.definition;
    if (!functionDefinition || !(functionDefinition instanceof FunctionDefinitionNode)) return node;

    // Only descend into a function the first time it is reached to prevent infinite recursion.
    if (!this.visitedFunctions.includes(functionDefinition)) {
      this.visitedFunctions.push(functionDefinition);
      this.visit(functionDefinition.body);
      this.reachableFunctions.push(functionDefinition);
    }

    return node;
  }
}
