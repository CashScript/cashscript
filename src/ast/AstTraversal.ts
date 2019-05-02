import {
  Node,
  SourceFileNode,
  ContractNode,
  ParameterNode,
  VariableDefinitionNode,
  FunctionDefinitionNode,
  AssignNode,
  IdentifierNode,
  ThrowNode,
  BranchNode,
  CastNode,
  MemberAccessNode,
  MemberFunctionCallNode,
  FunctionCallNode,
  UnaryOpNode,
  BinaryOpNode,
  BoolLiteralNode,
  IntLiteralNode,
  HexLiteralNode,
  StringLiteralNode,
  StatementNode,
  FunctionCallStatementNode,
  BlockNode,
} from './AST';
import AstVisitor from './AstVisitor';

export default class AstTraversal extends AstVisitor<Node> {
  visitSourceFile(node: SourceFileNode): Node {
    node.contract = this.visit(node.contract) as ContractNode;
    return node;
  }

  visitContract(node: ContractNode): Node {
    node.parameters = this.visitList(node.parameters) as ParameterNode[];
    node.variables = this.visitList(node.variables) as VariableDefinitionNode[];
    node.functions = this.visitList(node.functions) as FunctionDefinitionNode[];
    return node;
  }

  visitFunctionDefinition(node: FunctionDefinitionNode): Node {
    node.parameters = this.visitList(node.parameters) as ParameterNode[];
    node.body = this.visit(node.body) as BlockNode;
    return node;
  }

  visitParameter(node: ParameterNode): Node {
    return node;
  }

  visitVariableDefinition(node: VariableDefinitionNode): Node {
    node.expression = this.visit(node.expression);
    return node;
  }

  visitAssign(node: AssignNode): Node {
    node.identifier = this.visit(node.identifier) as IdentifierNode;
    node.expression = this.visit(node.expression);
    return node;
  }

  visitThrow(node: ThrowNode): Node {
    node.expression = this.visitOptional(node.expression);
    return node;
  }

  visitFunctionCallStatement(node: FunctionCallStatementNode): Node {
    node.functionCall = this.visit(node.functionCall) as FunctionCallNode;
    return node;
  }

  visitBranch(node: BranchNode): Node {
    node.condition = this.visit(node.condition);
    node.ifBlock = this.visit(node.ifBlock) as StatementNode;
    node.elseBlock = this.visitOptional(node.elseBlock) as StatementNode;
    return node;
  }

  visitBlock(node: BlockNode): Node {
    node.statements = this.visitOptionalList(node.statements) as StatementNode[];
    return node;
  }

  visitCast(node: CastNode): Node {
    node.expression = this.visit(node.expression);
    return node;
  }

  visitMemberAccess(node: MemberAccessNode): Node {
    node.object = this.visit(node.object);
    return node;
  }

  visitMemberFunctionCall(node: MemberFunctionCallNode): Node {
    node.object = this.visit(node.object);
    node.parameters = this.visitList(node.parameters);
    return node;
  }

  visitFunctionCall(node: FunctionCallNode): Node {
    node.identifier = this.visit(node.identifier) as IdentifierNode;
    node.parameters = this.visitList(node.parameters);
    return node;
  }

  visitBinaryOp(node: BinaryOpNode): Node {
    node.left = this.visit(node.left);
    node.right = this.visit(node.right);
    return node;
  }

  visitUnaryOp(node: UnaryOpNode): Node {
    node.expression = this.visit(node.expression);
    return node;
  }

  visitIdentifier(node: IdentifierNode): Node {
    return node;
  }

  visitBoolLiteral(node: BoolLiteralNode): Node {
    return node;
  }

  visitIntLiteral(node: IntLiteralNode): Node {
    return node;
  }

  visitStringLiteral(node: StringLiteralNode): Node {
    return node;
  }

  visitHexLiteral(node: HexLiteralNode): Node {
    return node;
  }
}
