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
  StatementNode,
  BlockNode,
  TimeOpNode,
  SizeOpNode,
  SplitOpNode,
  ArrayNode,
  TupleIndexOpNode,
  RequireNode,
  InstantiationNode,
} from './AST';
import AstVisitor from './AstVisitor';

export default class AstTraversal extends AstVisitor<Node> {
  visitSourceFile(node: SourceFileNode): Node {
    node.contract = this.visit(node.contract) as ContractNode;
    return node;
  }

  visitContract(node: ContractNode): Node {
    node.parameters = this.visitList(node.parameters) as ParameterNode[];
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

  visitTimeOp(node: TimeOpNode): Node {
    node.expression = this.visit(node.expression);
    return node;
  }

  visitRequire(node: RequireNode): Node {
    node.expression = this.visit(node.expression);
    return node;
  }

  visitBranch(node: BranchNode): Node {
    node.condition = this.visit(node.condition);
    node.ifBlock = this.visit(node.ifBlock) as BlockNode;
    node.elseBlock = this.visitOptional(node.elseBlock) as BlockNode;
    return node;
  }

  visitBlock(node: BlockNode): Node {
    node.statements = this.visitList(node.statements) as StatementNode[];
    return node;
  }

  visitCast(node: CastNode): Node {
    node.expression = this.visit(node.expression);
    return node;
  }

  visitFunctionCall(node: FunctionCallNode): Node {
    node.identifier = this.visit(node.identifier) as IdentifierNode;
    node.parameters = this.visitList(node.parameters);
    return node;
  }

  visitInstantiation(node: InstantiationNode): Node {
    node.identifier = this.visit(node.identifier) as IdentifierNode;
    node.parameters = this.visitList(node.parameters);
    return node;
  }

  visitTupleIndexOp(node: TupleIndexOpNode): Node {
    node.tuple = this.visit(node.tuple);
    return node;
  }

  visitSizeOp(node: SizeOpNode): Node {
    node.object = this.visit(node.object);
    return node;
  }

  visitSplitOp(node: SplitOpNode): Node {
    node.object = this.visit(node.object);
    node.index = this.visit(node.index);
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

  visitArray(node: ArrayNode): Node {
    node.elements = this.visitList(node.elements);
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
