import {
  Node,
  SourceFileNode,
  ContractNode,
  ParameterNode,
  VariableDefinitionNode,
  FunctionDefinitionNode,
  AssignNode,
  IdentifierNode,
  BranchNode,
  CastNode,
  FunctionCallNode,
  UnaryOpNode,
  BinaryOpNode,
  BoolLiteralNode,
  IntLiteralNode,
  HexLiteralNode,
  StringLiteralNode,
  BlockNode,
  TimeOpNode,
  ArrayNode,
  TupleIndexOpNode,
  RequireNode,
  InstantiationNode,
  TupleAssignmentNode,
  NullaryOpNode,
  ConsoleStatementNode,
  SliceNode,
  DoWhileNode,
} from './AST.js';

export default abstract class AstVisitor<T> {
  abstract visitSourceFile(node: SourceFileNode): T;
  abstract visitContract(node: ContractNode): T;
  abstract visitFunctionDefinition(node: FunctionDefinitionNode): T;
  abstract visitParameter(node: ParameterNode): T;
  abstract visitVariableDefinition(node: VariableDefinitionNode): T;
  abstract visitTupleAssignment(node: TupleAssignmentNode): T;
  abstract visitAssign(node: AssignNode): T;
  abstract visitTimeOp(node: TimeOpNode): T;
  abstract visitRequire(node: RequireNode): T;
  abstract visitBranch(node: BranchNode): T;
  abstract visitDoWhile(node: DoWhileNode): T;
  abstract visitBlock(node: BlockNode): T;
  abstract visitCast(node: CastNode): T;
  abstract visitFunctionCall(node: FunctionCallNode): T;
  abstract visitInstantiation(node: InstantiationNode): T;
  abstract visitSlice(node: SliceNode): T;
  abstract visitTupleIndexOp(node: TupleIndexOpNode): T;
  abstract visitBinaryOp(node: BinaryOpNode): T;
  abstract visitUnaryOp(node: UnaryOpNode): T;
  abstract visitNullaryOp(node: NullaryOpNode): T;
  abstract visitArray(node: ArrayNode): T;
  abstract visitIdentifier(node: IdentifierNode): T;
  abstract visitBoolLiteral(node: BoolLiteralNode): T;
  abstract visitIntLiteral(node: IntLiteralNode): T;
  abstract visitStringLiteral(node: StringLiteralNode): T;
  abstract visitHexLiteral(node: HexLiteralNode): T;
  abstract visitConsoleStatement(node: ConsoleStatementNode): T;

  visit(node: Node): T {
    return node.accept(this);
  }

  visitOptional(node?: Node): T | undefined {
    return node && this.visit(node);
  }

  visitList(nodes: Node[]): T[] {
    return nodes.map((n) => this.visit(n));
  }

  visitOptionalList(nodes?: Node[]): T[] | undefined {
    return nodes && this.visitList(nodes);
  }
}
