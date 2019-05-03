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
  FunctionCallNode,
  UnaryOpNode,
  BinaryOpNode,
  BoolLiteralNode,
  IntLiteralNode,
  HexLiteralNode,
  StringLiteralNode,
  FunctionCallStatementNode,
  BlockNode,
  SizeOpNode,
  SpliceOpNode,
  TimeOpNode,
} from './AST';

export default abstract class AstVisitor<T> {
  abstract visitSourceFile(node: SourceFileNode): T;
  abstract visitContract(node: ContractNode): T;
  abstract visitFunctionDefinition(node: FunctionDefinitionNode): T;
  abstract visitParameter(node: ParameterNode): T;
  abstract visitVariableDefinition(node: VariableDefinitionNode): T;
  abstract visitAssign(node: AssignNode): T;
  abstract visitThrow(node: ThrowNode): T;
  abstract visitFunctionCallStatement(node: FunctionCallStatementNode): T;
  abstract visitBranch(node: BranchNode): T;
  abstract visitBlock(node: BlockNode): T;
  abstract visitCast(node: CastNode): T;
  abstract visitTimeOp(node: TimeOpNode): T;
  abstract visitFunctionCall(node: FunctionCallNode): T;
  abstract visitSizeOp(node: SizeOpNode): T;
  abstract visitSpliceOp(node: SpliceOpNode): T;
  abstract visitBinaryOp(node: BinaryOpNode): T;
  abstract visitUnaryOp(node: UnaryOpNode): T;
  abstract visitIdentifier(node: IdentifierNode): T;
  abstract visitBoolLiteral(node: BoolLiteralNode): T;
  abstract visitIntLiteral(node: IntLiteralNode): T;
  abstract visitStringLiteral(node: StringLiteralNode): T;
  abstract visitHexLiteral(node: HexLiteralNode): T;

  visit(node: Node): T {
    return node.accept(this);
  }

  visitOptional(node?: Node): T | undefined {
    return node && this.visit(node);
  }

  visitList(nodes: Node[]): T[] {
    return nodes.map(n => this.visit(n));
  }

  visitOptionalList(nodes?: Node[]): T[] | undefined {
    return nodes && nodes.map(n => this.visit(n));
  }
}
