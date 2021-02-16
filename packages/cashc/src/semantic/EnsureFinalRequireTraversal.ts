import {
  ContractNode,
  ParameterNode,
  FunctionDefinitionNode,
  RequireNode,
  StatementNode,
  TimeOpNode,
  BranchNode,
} from '../ast/AST';
import AstTraversal from '../ast/AstTraversal';
import { EmptyContractError, EmptyFunctionError, FinalRequireStatementError } from '../Errors';

export default class EnsureFinalRequireTraversal extends AstTraversal {
  visitContract(node: ContractNode): ContractNode {
    node.parameters = this.visitList(node.parameters) as ParameterNode[];
    node.functions = this.visitList(node.functions) as FunctionDefinitionNode[];

    if (node.functions.length === 0) {
      throw new EmptyContractError(node);
    }

    return node;
  }

  visitFunctionDefinition(node: FunctionDefinitionNode): FunctionDefinitionNode {
    node.parameters = this.visitList(node.parameters) as ParameterNode[];
    node.body = this.visit(node.body);

    if (node.body.statements === undefined || node.body.statements.length === 0) {
      throw new EmptyFunctionError(node);
    }

    ensureFinalStatementIsRequire(node.body.statements);

    return node;
  }
}

function ensureFinalStatementIsRequire(statements: StatementNode[] = []): void {
  const finalStatement = statements[statements.length - 1];

  if (!finalStatement) return;

  // If the final statement is a branch node, then both branches need to end with a require()
  if (finalStatement instanceof BranchNode) {
    ensureFinalStatementIsRequire(finalStatement.ifBlock.statements);
    ensureFinalStatementIsRequire(finalStatement.elseBlock?.statements);
    return;
  }

  // The final statement needs to be a require()
  if (!(finalStatement instanceof RequireNode || finalStatement instanceof TimeOpNode)) {
    throw new FinalRequireStatementError(finalStatement);
  }
}
