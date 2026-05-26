import {
  ContractNode,
  ParameterNode,
  FunctionDefinitionNode,
  RequireNode,
  TimeOpNode,
  BranchNode,
  ConsoleStatementNode,
  DoWhileNode,
  WhileNode,
  ForNode,
  BlockNode,
} from '../ast/AST.js';
import AstTraversal from '../ast/AstTraversal.js';
import { EmptyContractError, EmptyFunctionError, FinalRequireStatementError } from '../Errors.js';

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

    ensureFinalStatementIsRequire(node.body);

    return node;
  }
}

function ensureFinalStatementIsRequire(block: BlockNode): void {
  const statementsWithoutLogs = (block.statements ?? []).filter((statement) => !(statement instanceof ConsoleStatementNode));
  const finalStatement = statementsWithoutLogs[statementsWithoutLogs.length - 1];

  // If the final statement is a branch node, then both branches need to end with a require()
  if (finalStatement instanceof BranchNode) {
    ensureFinalStatementIsRequire(finalStatement.ifBlock);
    finalStatement.elseBlock && ensureFinalStatementIsRequire(finalStatement.elseBlock);
    return;
  }

  if (
    finalStatement instanceof DoWhileNode
    || finalStatement instanceof WhileNode
    || finalStatement instanceof ForNode
  ) {
    ensureFinalStatementIsRequire(finalStatement.block);
    return;
  }

  // The final statement needs to be a require()
  if (!(finalStatement instanceof RequireNode || finalStatement instanceof TimeOpNode)) {
    // If no statements are present, we use the block node as the statement node for location data
    throw new FinalRequireStatementError(finalStatement ?? block);
  }
}
