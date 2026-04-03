import {
  ContractNode,
  FunctionDefinitionNode,
  ParameterNode,
  Node,
} from '../ast/AST.js';
import AstTraversal from '../ast/AstTraversal.js';
import { FunctionVisibility } from '../ast/Globals.js';
import {
  LibraryParameterError,
  LibraryPublicFunctionError,
} from '../Errors.js';

export default class EnsureContainerSemanticsTraversal extends AstTraversal {
  visitContract(node: ContractNode): Node {
    node.parameters = this.visitList(node.parameters) as ParameterNode[];
    node.functions = this.visitList(node.functions) as FunctionDefinitionNode[];

    if (node.kind !== 'library') {
      return node;
    }

    if (node.parameters.length > 0) {
      throw new LibraryParameterError(node);
    }

    const publicFunction = node.functions.find((func) => func.visibility === FunctionVisibility.PUBLIC);
    if (publicFunction) {
      throw new LibraryPublicFunctionError(publicFunction);
    }

    return node;
  }
}
