import {
  ContractNode,
  ParameterNode,
  FunctionDefinitionNode,
  FunctionKind,
  RequireNode,
  ReturnNode,
  TimeOpNode,
  BranchNode,
  ConsoleStatementNode,
  DoWhileNode,
  WhileNode,
  ForNode,
  BlockNode,
  StatementNode,
  Node,
} from '../ast/AST.js';
import AstTraversal from '../ast/AstTraversal.js';
import {
  EmptyContractError,
  EmptyFunctionError,
  FinalRequireStatementError,
  MissingReturnError,
  MisplacedReturnError,
} from '../Errors.js';

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

    if (node.kind === FunctionKind.CONTRACT) {
      ensureFinalStatementIsRequire(node.body);
    } else if (node.returnType !== undefined) {
      ensureSingleTailReturn(node.body);
    }

    return node;
  }
}

// TODO: This code is a bit convoluted, but we're likely to make changes to allow early returns before a mainline release,
// so we're leaving this code as-is for now.

function ensureSingleTailReturn(body: BlockNode): void {
  const statements = body.statements ?? [];
  const finalStatement = statements[statements.length - 1];
  if (!(finalStatement instanceof ReturnNode)) {
    throw new MissingReturnError(finalStatement ?? body);
  }

  const stray = findReturn(statements.slice(0, -1));
  if (stray) throw new MisplacedReturnError(stray);
}

function findReturn(statements: StatementNode[]): ReturnNode | undefined {
  for (const statement of statements) {
    if (statement instanceof ReturnNode) return statement;
    for (const list of nestedStatementLists(statement)) {
      const found = findReturn(list);
      if (found) return found;
    }
  }
  return undefined;
}

function nestedStatementLists(statement: StatementNode): StatementNode[][] {
  const asStatements = (block?: Node): StatementNode[] => {
    if (!block) return [];
    if (block instanceof BlockNode) return block.statements ?? [];
    return [block as StatementNode];
  };

  if (statement instanceof BranchNode) {
    return [asStatements(statement.ifBlock), asStatements(statement.elseBlock)];
  }
  if (statement instanceof DoWhileNode || statement instanceof WhileNode || statement instanceof ForNode) {
    return [asStatements(statement.block)];
  }
  return [];
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
