import { PreimageField } from '../ast/Globals';
import {
  ContractNode,
  ParameterNode,
  FunctionDefinitionNode,
  IdentifierNode,
  Node,
  RequireNode,
  FunctionCallNode,
} from '../ast/AST';
import AstTraversal from '../ast/AstTraversal';
import { UnverifiedCovenantError } from '../Errors';

export default class VerifyCovenantTraversal extends AstTraversal {
  private preimageIdentifierNode: IdentifierNode;
  private checkSigVerify: boolean;

  visitContract(node: ContractNode): Node {
    node.parameters = this.visitList(node.parameters) as ParameterNode[];
    node.functions = node.functions.map((f) => {
      if (f.preimageFields.length === 0) return f;
      this.checkSigVerify = false;
      f = this.visit(f) as FunctionDefinitionNode;
      if (!this.checkSigVerify) {
        throw new UnverifiedCovenantError(this.preimageIdentifierNode);
      }
      return f;
    });

    return node;
  }

  visitRequire(node: RequireNode): Node {
    node.expression = this.visit(node.expression);
    const exp = node.expression;
    if (exp instanceof FunctionCallNode && exp.identifier.name === 'checkSig') {
      this.checkSigVerify = true;
    }

    return node;
  }

  visitIdentifier(node: IdentifierNode): Node {
    if (this.preimageIdentifierNode) return node;
    if (Object.values(PreimageField).includes(node.name as PreimageField)) {
      this.preimageIdentifierNode = node;
    }
    return node;
  }
}
