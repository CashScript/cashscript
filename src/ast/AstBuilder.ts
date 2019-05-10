import { AbstractParseTreeVisitor } from 'antlr4ts/tree/AbstractParseTreeVisitor';
import { ParseTree } from 'antlr4ts/tree/ParseTree';
import { TerminalNode } from 'antlr4ts/tree/TerminalNode';
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
  ExpressionNode,
  StatementNode,
  LiteralNode,
  FunctionCallStatementNode,
  BlockNode,
  SpliceOpNode,
  SizeOpNode,
  TimeOpNode,
  ArrayNode,
} from './AST';
import { UnaryOperator, BinaryOperator } from './Operator';
import {
  ContractDefinitionContext,
  FunctionDefinitionContext,
  VariableDefinitionContext,
  ParameterContext,
  AssignStatementContext,
  IfStatementContext,
  FunctionCallContext,
  CastContext,
  ExpressionContext,
  LiteralContext,
  NumberLiteralContext,
  FunctionCallStatementContext,
  SourceFileContext,
  BlockContext,
  TimeOpStatementContext,
  ArrayContext,
} from '../grammar/CashScriptParser';
import { CashScriptVisitor } from '../grammar/CashScriptVisitor';
import { Location } from './Location';
import { NumberUnit, TimeOp } from './Globals';
import { getPrimitiveTypeFromCtx } from './Type';

export default class AstBuilder
  extends AbstractParseTreeVisitor<Node>
  implements CashScriptVisitor<Node> {
  constructor(private tree: ParseTree) {
    super();
  }

  defaultResult(): Node {
    return new BoolLiteralNode(false);
  }

  build(): Node {
    return this.visit(this.tree);
  }

  visitSourceFile(ctx: SourceFileContext): SourceFileNode {
    const contract = this.visit(ctx.contractDefinition()) as ContractNode;
    const sourceFileNode = new SourceFileNode(contract);
    sourceFileNode.location = Location.fromCtx(ctx);
    return sourceFileNode;
  }

  visitContractDefinition(ctx: ContractDefinitionContext): ContractNode {
    const name = ctx.Identifier().text;
    const parameters = ctx.parameterList().parameter().map(p => this.visit(p) as ParameterNode);
    const functions = ctx.functionDefinition().map(f => this.visit(f) as FunctionDefinitionNode);
    const contract = new ContractNode(name, parameters, functions);
    contract.location = Location.fromCtx(ctx);
    return contract;
  }

  visitFunctionDefinition(ctx: FunctionDefinitionContext): FunctionDefinitionNode {
    const name = ctx.Identifier().text;
    const parameters = ctx.parameterList().parameter().map(p => this.visit(p) as ParameterNode);
    const statements = ctx.statement().map(s => this.visit(s) as StatementNode);
    const block = new BlockNode(statements);
    block.location = Location.fromCtx(ctx);

    const functionDefinition = new FunctionDefinitionNode(name, parameters, block);
    functionDefinition.location = Location.fromCtx(ctx);
    return functionDefinition;
  }

  visitParameter(ctx: ParameterContext): ParameterNode {
    const type = getPrimitiveTypeFromCtx(ctx.typeName());
    const name = ctx.Identifier().text;
    const parameter = new ParameterNode(type, name);
    parameter.location = Location.fromCtx(ctx);
    return parameter;
  }

  visitVariableDefinition(ctx: VariableDefinitionContext): VariableDefinitionNode {
    const type = getPrimitiveTypeFromCtx(ctx.typeName());
    const name = ctx.Identifier().text;
    const expression = this.visit(ctx.expression());
    const variableDefinition = new VariableDefinitionNode(type, name, expression);
    variableDefinition.location = Location.fromCtx(ctx);
    return variableDefinition;
  }

  visitAssignStatement(ctx: AssignStatementContext): AssignNode {
    const identifier = new IdentifierNode(ctx.Identifier().text);
    identifier.location = Location.fromToken(ctx.Identifier().symbol);

    const expression = this.visit(ctx.expression());
    const assign = new AssignNode(identifier, expression);
    assign.location = Location.fromCtx(ctx);
    return assign;
  }

  visitTimeOpStatement(ctx: TimeOpStatementContext): TimeOpNode {
    const expression = this.visit(ctx.expression());
    const timeOp = new TimeOpNode(ctx.TxVar().text as TimeOp, expression);
    timeOp.location = Location.fromCtx(ctx);

    return timeOp;
  }

  visitFunctionCallStatement(ctx: FunctionCallStatementContext): FunctionCallStatementNode {
    const functionCall = this.visit(ctx.functionCall()) as FunctionCallNode;
    const functionCallStatement = new FunctionCallStatementNode(functionCall);
    functionCallStatement.location = Location.fromCtx(ctx);
    return functionCallStatement;
  }

  visitIfStatement(ctx: IfStatementContext): BranchNode {
    const condition = this.visit(ctx.expression());
    // I want these _ifBlock variables to be getters @antlr4ts :(
    const ifBlock = this.visit(ctx._ifBlock) as StatementNode;
    const elseBlock = ctx._elseBlock && this.visit(ctx._elseBlock) as StatementNode;
    const branch = new BranchNode(condition, ifBlock, elseBlock);
    branch.location = Location.fromCtx(ctx);
    return branch;
  }

  visitBlock(ctx: BlockContext): BlockNode {
    const statements = ctx.statement().map(s => this.visit(s) as StatementNode);
    const block = new BlockNode(statements);
    block.location = Location.fromCtx(ctx);
    return block;
  }

  visitExpression(ctx: ExpressionContext): ExpressionNode {
    if (ctx._paren) {
      return this.visit(ctx._paren);
    } else if (ctx.cast()) {
      return this.visit(ctx.cast() as CastContext);
    } else if (ctx._obj) {
      if (ctx._index) {
        return this.createSpliceOp(ctx);
      } else {
        return this.createSizeOp(ctx);
      }
    } else if (ctx.functionCall()) {
      return this.visit(ctx.functionCall() as FunctionCallContext);
    } else if (ctx._left) {
      return this.createBinaryOp(ctx);
    } else if (ctx._right) {
      return this.createUnaryOp(ctx);
    } else if (ctx.array()) {
      return this.visit(ctx.array() as ArrayContext);
    } else if (ctx.Identifier()) {
      return this.createIdentifier(ctx);
    } else if (ctx.literal()) {
      const literal = ctx.literal() as LiteralContext;
      return this.createLiteral(literal);
    } else {
      throw new Error();
    }
  }

  visitCast(ctx: CastContext): CastNode {
    const type = getPrimitiveTypeFromCtx(ctx.typeName());
    const expression = this.visit(ctx.expression());
    const cast = new CastNode(type, expression);
    cast.location = Location.fromCtx(ctx);
    return cast;
  }

  visitFunctionCall(ctx: FunctionCallContext): FunctionCallNode {
    const identifier = new IdentifierNode(ctx._id.text as string);
    identifier.location = Location.fromToken(ctx._id);
    const parameters = ctx.expressionList().expression().map(e => this.visit(e));
    const functionCall = new FunctionCallNode(identifier, parameters);
    functionCall.location = Location.fromCtx(ctx);
    return functionCall;
  }

  createSizeOp(ctx: ExpressionContext): SizeOpNode {
    const obj = this.visit(ctx._obj);
    const sizeOp = new SizeOpNode(obj);
    sizeOp.location = Location.fromCtx(ctx);
    return sizeOp;
  }

  createSpliceOp(ctx: ExpressionContext): SpliceOpNode {
    const obj = this.visit(ctx._obj);
    const index = this.visit(ctx._index);
    const spliceOp = new SpliceOpNode(obj, index);
    spliceOp.location = Location.fromCtx(ctx);
    return spliceOp;
  }

  createBinaryOp(ctx: ExpressionContext): BinaryOpNode {
    const left = this.visit(ctx._left);
    const operator = ctx._op.text as BinaryOperator;
    const right = this.visit(ctx._right);
    const binaryOp = new BinaryOpNode(left, operator, right);
    binaryOp.location = Location.fromCtx(ctx);
    return binaryOp;
  }

  createUnaryOp(ctx: ExpressionContext): UnaryOpNode {
    const operator = ctx._op.text as UnaryOperator;
    const expression = this.visit(ctx._right);
    const unaryOp = new UnaryOpNode(operator, expression);
    unaryOp.location = Location.fromCtx(ctx);
    return unaryOp;
  }

  visitArray(ctx: ArrayContext): ArrayNode {
    const elements = ctx.expression().map(e => this.visit(e));
    const array = new ArrayNode(elements);
    array.location = Location.fromCtx(ctx);
    return array;
  }

  createIdentifier(ctx: ExpressionContext): IdentifierNode {
    const identifier = new IdentifierNode((ctx.Identifier() as TerminalNode).text);
    identifier.location = Location.fromCtx(ctx);
    return identifier;
  }

  createLiteral(ctx: LiteralContext): LiteralNode {
    if (ctx.BooleanLiteral()) {
      return this.createBooleanLiteral(ctx);
    } else if (ctx.numberLiteral()) {
      return this.createIntLiteral(ctx);
    } else if (ctx.StringLiteral()) {
      return this.createStringLiteral(ctx);
    } else if (ctx.HexLiteral()) {
      return this.createHexLiteral(ctx);
    } else {
      throw new Error();
    }
  }

  createBooleanLiteral(ctx: LiteralContext): BoolLiteralNode {
    const boolString = (ctx.BooleanLiteral() as TerminalNode).text;
    const boolValue = boolString === 'true';
    const booleanLiteral = new BoolLiteralNode(boolValue);
    booleanLiteral.location = Location.fromCtx(ctx);
    return booleanLiteral;
  }

  createIntLiteral(ctx: LiteralContext): IntLiteralNode {
    const numberCtx = ctx.numberLiteral() as NumberLiteralContext;
    const numberString = numberCtx.NumberLiteral().text;
    const numberUnit = numberCtx.NumberUnit();
    let numberValue = parseInt(numberString, 10);
    numberValue *= numberUnit ? NumberUnit[numberUnit.text.toUpperCase()] : 1;
    const intLiteral = new IntLiteralNode(numberValue);
    intLiteral.location = Location.fromCtx(ctx);
    return intLiteral;
  }

  createStringLiteral(ctx: LiteralContext): StringLiteralNode {
    const rawString = (ctx.StringLiteral() as TerminalNode).text;
    const stringValue = rawString.substring(1, rawString.length - 1);
    const quote = rawString.substring(0, 1);
    const stringLiteral = new StringLiteralNode(stringValue, quote);
    stringLiteral.location = Location.fromCtx(ctx);
    return stringLiteral;
  }

  createHexLiteral(ctx: LiteralContext): HexLiteralNode {
    const hexString = (ctx.HexLiteral() as TerminalNode).text;
    const hexValue = Buffer.from(hexString.substring(2), 'hex');
    const hexLiteral = new HexLiteralNode(hexValue);
    hexLiteral.location = Location.fromCtx(ctx);
    return hexLiteral;
  }
}
