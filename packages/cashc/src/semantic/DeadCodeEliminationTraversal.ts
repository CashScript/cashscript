import {
  FunctionCallNode,
  FunctionDefinitionNode,
  Node,
  SourceFileNode,
} from '../ast/AST.js';
import AstTraversal from '../ast/AstTraversal.js';

export default class DeadCodeEliminationTraversal extends AstTraversal {
  private reachableFunctions = new Set<FunctionDefinitionNode>();

  visitSourceFile(node: SourceFileNode): Node {
    super.visitOptional(node.contract);

    // Set the node.functions to the reachable functions and re-index functionIds, the order is based on insertion
    // into the set, which is most stable for the functionId as it is based on contract structure rather than
    // name or order of declaration.
    node.functions = [...this.reachableFunctions];
    node.functions.forEach((func, index) => {
      node.symbolTable!.getFromThis(func.name)!.setFunctionId(index);
    });

    return node;
  }

  visitFunctionCall(node: FunctionCallNode): Node {
    node = super.visitFunctionCall(node) as FunctionCallNode;

    const functionDefinition = node.identifier.symbol?.definition;
    if (!functionDefinition || !(functionDefinition instanceof FunctionDefinitionNode)) return node;

    // Only descend into a function the first time it is reached to prevent infinite recursion.
    if (!this.reachableFunctions.has(functionDefinition)) {
      this.reachableFunctions.add(functionDefinition);
      this.visit(functionDefinition.body);
    }

    return node;
  }
}
