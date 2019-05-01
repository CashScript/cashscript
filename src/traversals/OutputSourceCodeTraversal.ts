import {
  Node,
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
} from '../ast/AST';
import AstTraversal from '../ast/AstTraversal';

export default class OutputSourceCodeTraversal extends AstTraversal {
  private indentationLevel: number = 0;
  output: string = '';

  private addOutput(s: string, indent: boolean = false) {
    s = indent ? `${this.getIndentation()}${s}` : s;
    this.output += s;
  }

  private getIndentation() {
    return '    '.repeat(this.indentationLevel);
  }

  private indent() {
    this.indentationLevel += 1;
  }

  private unindent() {
    this.indentationLevel -= 1;
  }

  visitContract(node: ContractNode) {
    this.addOutput(`contract ${node.name}(`, true);
    node.parameters = this.visitCommaList(node.parameters) as ParameterNode[];
    this.addOutput(') {\n');

    this.indent();
    node.variables = this.visitList(node.variables) as VariableDefinitionNode[];
    if (node.variables.length > 0) {
      this.addOutput('\n');
    }
    node.functions = this.visitList(node.functions) as FunctionDefinitionNode[];
    this.unindent();

    this.addOutput('}\n', true);
    return node;
  }

  visitFunctionDefinition(node: FunctionDefinitionNode) {
    this.addOutput(`function ${node.name}(`, true);
    node.parameters = this.visitCommaList(node.parameters) as ParameterNode[];
    this.addOutput(') ');

    node.body = this.visit(node.body) as BlockNode;
    this.addOutput('\n');

    return node;
  }

  visitCommaList(list: Node[]) {
    return list.map((e, i) => {
      const visited = this.visit(e);
      if (i !== list.length - 1) {
        this.addOutput(', ');
      }
      return visited;
    });
  }

  visitParameter(node: ParameterNode) {
    this.addOutput(`${node.type} ${node.name}`);
    return node;
  }

  visitVariableDefinition(node: VariableDefinitionNode) {
    this.addOutput(`${node.type} ${node.name} = `, true);
    this.visit(node.expression);
    this.addOutput(';\n');

    return node;
  }

  visitAssign(node: AssignNode) {
    this.addOutput('', true);
    node.identifier = this.visit(node.identifier) as IdentifierNode;
    this.addOutput(' = ');
    node.expression = this.visit(node.expression);
    this.addOutput(';\n');

    return node;
  }

  visitThrow(node: ThrowNode) {
    this.addOutput('throw', true);

    if (node.expression) {
      this.addOutput(' ');
      node.expression = this.visit(node.expression);
    }

    this.addOutput(';\n');
    return node;
  }

  visitFunctionCallStatement(node: FunctionCallStatementNode) {
    this.addOutput('', true);
    node.functionCall = this.visit(node.functionCall) as FunctionCallNode;
    this.addOutput(';\n');
    return node;
  }

  visitBranch(node: BranchNode) {
    this.addOutput('if (', true);
    node.condition = this.visit(node.condition);
    this.addOutput(') ');

    node.ifBlock = this.visit(node.ifBlock) as BlockNode;
    if (node.elseBlock) {
      this.addOutput(' else ');
      node.elseBlock = this.visit(node.elseBlock) as BlockNode;
    }

    this.addOutput('\n');

    return node;
  }

  visitBlock(node: BlockNode) {
    this.addOutput('{\n');
    this.indent();
    node.statements = this.visitOptionalList(node.statements) as StatementNode[];
    this.unindent();
    this.addOutput('}', true);

    return node;
  }

  visitCast(node: CastNode) {
    this.addOutput(`${node.type}(`);
    node.expression = this.visit(node.expression);
    this.addOutput(')');
    return node;
  }

  visitMemberAccess(node: MemberAccessNode) {
    node.object = this.visit(node.object);
    this.addOutput(`.${node.member}`);
    return node;
  }

  visitMemberFunctionCall(node: MemberFunctionCallNode) {
    node.object = this.visit(node.object);
    this.addOutput('.');
    node.functionCall = this.visit(node.functionCall) as FunctionCallNode;
    return node;
  }

  visitFunctionCall(node: FunctionCallNode) {
    node.identifier = this.visit(node.identifier) as IdentifierNode;

    this.addOutput('(');
    node.parameters = this.visitCommaList(node.parameters);
    this.addOutput(')');

    return node;
  }

  visitBinaryOp(node: BinaryOpNode) {
    node.left = this.visit(node.left);
    this.addOutput(` ${node.operator} `);
    node.right = this.visit(node.right);
    return node;
  }

  visitUnaryOp(node: UnaryOpNode) {
    this.addOutput(node.operator);
    node.expression = this.visit(node.expression);
    return node;
  }

  visitIdentifier(node: IdentifierNode) {
    this.addOutput(node.name);
    return node;
  }

  visitBoolLiteral(node: BoolLiteralNode) {
    this.addOutput(node.value.toString());
    return node;
  }

  visitIntLiteral(node: IntLiteralNode) {
    this.addOutput(node.value.toString());
    return node;
  }

  visitStringLiteral(node: StringLiteralNode) {
    this.addOutput(`${node.quote}${node.value}${node.quote}`);
    return node;
  }

  visitHexLiteral(node: HexLiteralNode) {
    this.addOutput(`0x${node.value.toString('hex')}`);
    return node;
  }
}
