import { binToHex } from '@bitauth/libauth';
import { SymbolTable } from '../ast/SymbolTable';
import {
  Node,
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
  ArrayNode,
  TupleIndexOpNode,
  RequireNode,
} from '../ast/AST';
import AstTraversal from '../ast/AstTraversal';

export default class OutputSourceCodeTraversal extends AstTraversal {
  private indentationLevel: number = 0;
  output: string = '';

  private addOutput(s: string, indent: boolean = false): void {
    s = indent ? `${this.getIndentation()}${s}` : s;
    this.output += s;
  }

  private getIndentation(): string {
    return '    '.repeat(this.indentationLevel);
  }

  private indent(): void {
    this.indentationLevel += 1;
  }

  private unindent(): void {
    this.indentationLevel -= 1;
  }

  private outputSymbolTable(symbolTable?: SymbolTable): void {
    if (!symbolTable) return;
    this.addOutput(` --> ST: ${symbolTable}`);
  }

  visitContract(node: ContractNode): Node {
    this.addOutput(`contract ${node.name}(`, true);
    node.parameters = this.visitCommaList(node.parameters) as ParameterNode[];
    this.addOutput(') {');
    this.outputSymbolTable(node.symbolTable);
    this.addOutput('\n');

    this.indent();
    node.functions = this.visitList(node.functions) as FunctionDefinitionNode[];
    this.unindent();

    this.addOutput('}\n', true);
    return node;
  }

  visitFunctionDefinition(node: FunctionDefinitionNode): Node {
    this.addOutput(`function ${node.name}(`, true);
    node.parameters = this.visitCommaList(node.parameters) as ParameterNode[];
    this.addOutput(')');
    this.outputSymbolTable(node.symbolTable);
    this.addOutput(' ');

    node.body = this.visit(node.body) as BlockNode;
    this.addOutput('\n');

    return node;
  }

  visitCommaList(list: Node[]): Node[] {
    return list.map((e, i) => {
      const visited = this.visit(e);
      if (i !== list.length - 1) {
        this.addOutput(', ');
      }
      return visited;
    });
  }

  visitParameter(node: ParameterNode): Node {
    this.addOutput(`${node.type} ${node.name}`);
    return node;
  }

  visitVariableDefinition(node: VariableDefinitionNode): Node {
    this.addOutput(`${node.type} ${node.name} = `, true);
    this.visit(node.expression);
    this.addOutput(';\n');

    return node;
  }

  visitAssign(node: AssignNode): Node {
    this.addOutput('', true);
    node.identifier = this.visit(node.identifier) as IdentifierNode;
    this.addOutput(' = ');
    node.expression = this.visit(node.expression);
    this.addOutput(';\n');

    return node;
  }

  visitTimeOp(node: TimeOpNode): Node {
    this.addOutput(`require(${node.timeOp} >= `, true);
    node.expression = this.visit(node.expression);
    this.addOutput(');\n');
    return node;
  }

  visitRequire(node: RequireNode): Node {
    this.addOutput('require(', true);
    node.expression = this.visit(node.expression);
    this.addOutput(');\n');
    return node;
  }

  visitBranch(node: BranchNode): Node {
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

  visitBlock(node: BlockNode): Node {
    this.addOutput('{');
    this.outputSymbolTable(node.symbolTable);
    this.addOutput('\n');

    this.indent();
    node.statements = this.visitOptionalList(node.statements) as StatementNode[];
    this.unindent();
    this.addOutput('}', true);

    return node;
  }

  visitCast(node: CastNode): Node {
    this.addOutput(`${node.type}(`);
    node.expression = this.visit(node.expression);
    this.addOutput(')');
    return node;
  }

  visitFunctionCall(node: FunctionCallNode): Node {
    node.identifier = this.visit(node.identifier) as IdentifierNode;

    this.addOutput('(');
    node.parameters = this.visitCommaList(node.parameters);
    this.addOutput(')');

    return node;
  }

  visitTupleIndexOp(node: TupleIndexOpNode): Node {
    node.tuple = this.visit(node.tuple);
    this.addOutput(`[${node.index}]`);
    return node;
  }

  visitBinaryOp(node: BinaryOpNode): Node {
    if (node.operator.startsWith('.')) {
      node.left = this.visit(node.left);
      this.addOutput(`${node.operator}(`);
      node.right = this.visit(node.right);
      this.addOutput(')');
      return node;
    }

    this.addOutput('(');
    node.left = this.visit(node.left);
    this.addOutput(` ${node.operator} `);
    node.right = this.visit(node.right);
    this.addOutput(')');
    return node;
  }

  visitUnaryOp(node: UnaryOpNode): Node {
    if (node.operator.startsWith('.')) {
      this.visit(node.expression);
      this.addOutput(node.operator);
      return node;
    }

    this.addOutput('(');
    this.addOutput(node.operator);
    node.expression = this.visit(node.expression);
    this.addOutput(')');
    return node;
  }

  visitArray(node: ArrayNode): Node {
    this.addOutput('[');
    node.elements = this.visitCommaList(node.elements);
    this.addOutput(']');
    return node;
  }

  visitIdentifier(node: IdentifierNode): Node {
    this.addOutput(node.name);
    return node;
  }

  visitBoolLiteral(node: BoolLiteralNode): Node {
    this.addOutput(node.value.toString());
    return node;
  }

  visitIntLiteral(node: IntLiteralNode): Node {
    this.addOutput(node.value.toString());
    return node;
  }

  visitStringLiteral(node: StringLiteralNode): Node {
    this.addOutput(`${node.quote}${node.value}${node.quote}`);
    return node;
  }

  visitHexLiteral(node: HexLiteralNode): Node {
    this.addOutput(`0x${binToHex(node.value)}`);
    return node;
  }
}
