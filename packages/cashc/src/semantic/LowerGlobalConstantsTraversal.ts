import {
  BlockNode,
  BoolLiteralNode,
  ConsoleStatementNode,
  ConstantDefinitionNode,
  ContractNode,
  FunctionCallNode,
  FunctionDefinitionNode,
  FunctionKind,
  HexLiteralNode,
  IdentifierNode,
  IntLiteralNode,
  LiteralNode,
  Node,
  ReturnNode,
  SourceFileNode,
  StringLiteralNode,
} from '../ast/AST.js';
import { Symbol, SymbolTable } from '../ast/SymbolTable.js';
import AstTraversal from '../ast/AstTraversal.js';

// Lowers constants to synthetic zero-argument global functions, so they can share reachability analysis and
// VM function-ID assignment with user-defined functions.
export class LowerGlobalConstantsTraversal extends AstTraversal {
  private symbolTable: SymbolTable;

  visitSourceFile(node: SourceFileNode): Node {
    this.symbolTable = node.symbolTable!;

    // Every constant becomes a function definition (replacing the constant's symbol in the table)
    const constantFunctions = node.constants.map((constant) => {
      const definition = createConstantFunction(constant);
      this.symbolTable.set(Symbol.userFunction(definition));
      return definition;
    });

    node.functions = this.visitList(node.functions) as FunctionDefinitionNode[];
    node.contract = this.visitOptional(node.contract) as ContractNode | undefined;
    node.functions.push(...constantFunctions);
    return node;
  }

  // constant usage within console.log statements are exempt from the rewrite because we
  // want to log the constant value at compile-time, not the function call at runtime
  visitConsoleStatement(node: ConsoleStatementNode): Node {
    return node;
  }

  visitBoolLiteral(node: BoolLiteralNode): Node {
    return this.lowerLiteral(node);
  }

  visitIntLiteral(node: IntLiteralNode): Node {
    return this.lowerLiteral(node);
  }

  visitStringLiteral(node: StringLiteralNode): Node {
    return this.lowerLiteral(node);
  }

  visitHexLiteral(node: HexLiteralNode): Node {
    return this.lowerLiteral(node);
  }

  private lowerLiteral(node: LiteralNode): Node {
    if (!node.constant) return node;

    const symbol = this.symbolTable.getFromThis(node.constant.name)!;
    const identifier = new IdentifierNode(node.constant.name);
    identifier.location = node.location;
    identifier.type = node.type;
    identifier.symbol = symbol;
    symbol.references.push(identifier);

    const call = new FunctionCallNode(identifier, []);
    call.location = node.location;
    call.type = node.type;
    return call;
  }
}

// Create a synthetic FunctionDefinitionNode that represents a lowered constant
function createConstantFunction(constant: ConstantDefinitionNode): FunctionDefinitionNode {
  const literal = cloneLiteral(constant.value);
  literal.type = constant.type;
  const returnStatement = new ReturnNode([literal]);
  returnStatement.location = constant.location;
  const body = new BlockNode([returnStatement]);
  body.location = constant.location;

  const definition = new FunctionDefinitionNode(FunctionKind.GLOBAL, constant.name, [], body, [constant.type]);
  definition.constant = constant;
  definition.location = constant.location;
  definition.sourceCode = constant.sourceCode;
  definition.sourceFile = constant.sourceFile;
  return definition;
}

// Create a synthetic LiteralNode that represents a reference to a lowered constant function,
// so later passes can treat it as a literal
export function createConstantLiteral(constant: ConstantDefinitionNode, reference: IdentifierNode): LiteralNode {
  const literal = cloneLiteral(constant.value);
  literal.location = reference.location;
  literal.type = constant.type;
  literal.constant = constant;
  return literal;
}

function cloneLiteral(node: LiteralNode): LiteralNode {
  const clone: LiteralNode = Object.assign(Object.create(Object.getPrototypeOf(node)), node);
  if (clone instanceof HexLiteralNode) clone.value = clone.value.slice();
  return clone;
}
