import { PreimageField, GlobalFunction } from '../ast/Globals';
import {
  ContractNode,
  ParameterNode,
  FunctionDefinitionNode,
  IdentifierNode,
  Node,
  RequireNode,
  FunctionCallNode,
  BranchNode,
} from '../ast/AST';
import AstTraversal from '../ast/AstTraversal';
import { UnverifiedCovenantError } from '../Errors';

export default class VerifyCovenantTraversal extends AstTraversal {
  private preimageIdentifierNode: IdentifierNode;
  private checkSigVerify: boolean;
  private scopeDepth: number = 0;

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

  visitBranch(node: BranchNode): Node {
    node.condition = this.visit(node.condition);

    this.scopeDepth += 1;
    node.ifBlock = this.visit(node.ifBlock);
    node.elseBlock = this.visitOptional(node.elseBlock);
    this.scopeDepth -= 1;

    return node;
  }

  visitRequire(node: RequireNode): Node {
    node.expression = this.visit(node.expression);

    if (this.isValidCovenantVerification(node)) {
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

  isValidCovenantVerification(node: RequireNode): boolean {
    if (!(node.expression instanceof FunctionCallNode)) return false;
    if (node.expression.identifier.name !== GlobalFunction.CHECKSIG) return false;
    if (this.scopeDepth > 0) return false;

    return true;
  }
}
