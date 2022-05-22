import { hexToBin } from '@bitauth/libauth';
import { parseType } from '@cashscript/utils';
import { AbstractParseTreeVisitor } from 'antlr4ts/tree/AbstractParseTreeVisitor';
import { ParseTree } from 'antlr4ts/tree/ParseTree';
import { TerminalNode } from 'antlr4ts/tree/TerminalNode';
import semver from 'semver';
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
  BlockNode,
  TimeOpNode,
  ArrayNode,
  TupleIndexOpNode,
  RequireNode,
  InstantiationNode,
  TupleAssignmentNode,
  NullaryOpNode,
} from './AST';
import { UnaryOperator, BinaryOperator, NullaryOperator } from './Operator';
import {
  ContractDefinitionContext,
  FunctionDefinitionContext,
  VariableDefinitionContext,
  TupleAssignmentContext,
  ParameterContext,
  AssignStatementContext,
  IfStatementContext,
  FunctionCallContext,
  CastContext,
  LiteralContext,
  NumberLiteralContext,
  SourceFileContext,
  BlockContext,
  TimeOpStatementContext,
  ArrayContext,
  ParenthesisedContext,
  FunctionCallExpressionContext,
  UnaryOpContext,
  BinaryOpContext,
  IdentifierContext,
  LiteralExpressionContext,
  TupleIndexOpContext,
  RequireStatementContext,
  PragmaDirectiveContext,
  InstantiationContext,
  NullaryOpContext,
  UnaryIntrospectionOpContext,
} from '../grammar/CashScriptParser';
import { CashScriptVisitor } from '../grammar/CashScriptVisitor';
import { Location } from './Location';
import {
  NumberUnit,
  TimeOp,
} from './Globals';
import { getPragmaName, PragmaName, getVersionOpFromCtx } from './Pragma';
import { version } from '..';
import { ParseError, VersionError } from '../Errors';

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
    ctx.pragmaDirective().forEach((pragma) => {
      this.processPragma(pragma);
    });

    const contract = this.visit(ctx.contractDefinition()) as ContractNode;
    const sourceFileNode = new SourceFileNode(contract);
    sourceFileNode.location = Location.fromCtx(ctx);
    return sourceFileNode;
  }

  processPragma(ctx: PragmaDirectiveContext): void {
    const pragmaName = getPragmaName(ctx.pragmaName().text);
    if (pragmaName !== PragmaName.CASHSCRIPT) throw new Error(); // Shouldn't happen

    // Strip any -beta tags
    const actualVersion = version.replace(/-.*/g, '');

    ctx.pragmaValue().versionConstraint().forEach((constraint) => {
      const op = getVersionOpFromCtx(constraint.versionOperator());
      const versionConstraint = `${op}${constraint.VersionLiteral().text}`;
      if (!semver.satisfies(actualVersion, versionConstraint)) {
        throw new VersionError(actualVersion, versionConstraint);
      }
    });
  }

  visitContractDefinition(ctx: ContractDefinitionContext): ContractNode {
    const name = ctx.Identifier().text;
    const parameters = ctx.parameterList().parameter().map((p) => this.visit(p) as ParameterNode);
    const functions = ctx.functionDefinition().map((f) => this.visit(f) as FunctionDefinitionNode);
    const contract = new ContractNode(name, parameters, functions);
    contract.location = Location.fromCtx(ctx);
    return contract;
  }

  visitFunctionDefinition(ctx: FunctionDefinitionContext): FunctionDefinitionNode {
    const name = ctx.Identifier().text;
    const parameters = ctx.parameterList().parameter().map((p) => this.visit(p) as ParameterNode);
    const statements = ctx.statement().map((s) => this.visit(s) as StatementNode);
    const block = new BlockNode(statements);
    block.location = Location.fromCtx(ctx);

    const functionDefinition = new FunctionDefinitionNode(name, parameters, block);
    functionDefinition.location = Location.fromCtx(ctx);
    return functionDefinition;
  }

  visitParameter(ctx: ParameterContext): ParameterNode {
    const type = parseType(ctx.typeName().text);
    const name = ctx.Identifier().text;
    const parameter = new ParameterNode(type, name);
    parameter.location = Location.fromCtx(ctx);
    return parameter;
  }

  visitVariableDefinition(ctx: VariableDefinitionContext): VariableDefinitionNode {
    const type = parseType(ctx.typeName().text);
    const name = ctx.Identifier().text;
    const expression = this.visit(ctx.expression());
    const variableDefinition = new VariableDefinitionNode(type, name, expression);
    variableDefinition.location = Location.fromCtx(ctx);
    return variableDefinition;
  }

  visitTupleAssignment(ctx: TupleAssignmentContext): TupleAssignmentNode {
    const expression = this.visit(ctx.expression());
    const names = ctx.Identifier();
    const types = ctx.typeName();
    const [var1, var2] = names.map((name, i) => (
      { name: name.text, type: parseType(types[i].text) }
    ));
    const tupleAssignment = new TupleAssignmentNode(var1, var2, expression);
    tupleAssignment.location = Location.fromCtx(ctx);
    return tupleAssignment;
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

  visitRequireStatement(ctx: RequireStatementContext): RequireNode {
    const expression = this.visit(ctx.expression());
    const require = new RequireNode(expression);
    require.location = Location.fromCtx(ctx);
    return require;
  }

  visitIfStatement(ctx: IfStatementContext): BranchNode {
    const condition = this.visit(ctx.expression());
    const ifBlock = this.visit(ctx._ifBlock) as StatementNode;
    const elseBlock = ctx._elseBlock && this.visit(ctx._elseBlock) as StatementNode;
    const branch = new BranchNode(condition, ifBlock, elseBlock);
    branch.location = Location.fromCtx(ctx);
    return branch;
  }

  visitBlock(ctx: BlockContext): BlockNode {
    const statements = ctx.statement().map((s) => this.visit(s) as StatementNode);
    const block = new BlockNode(statements);
    block.location = Location.fromCtx(ctx);
    return block;
  }

  visitParenthesised(ctx: ParenthesisedContext): ExpressionNode {
    return this.visit(ctx.expression());
  }

  visitCast(ctx: CastContext): CastNode {
    const type = parseType(ctx.typeName().text);
    const expression = this.visit(ctx._castable);
    const size = ctx._size && this.visit(ctx._size);
    const cast = new CastNode(type, expression, size);
    cast.location = Location.fromCtx(ctx);
    return cast;
  }

  visitFunctionCallExpression(ctx: FunctionCallExpressionContext): FunctionCallNode {
    return this.visit(ctx.functionCall()) as FunctionCallNode;
  }

  visitFunctionCall(ctx: FunctionCallContext): FunctionCallNode {
    const identifier = new IdentifierNode(ctx.Identifier().text as string);
    identifier.location = Location.fromToken(ctx.Identifier().symbol);
    const parameters = ctx.expressionList().expression().map((e) => this.visit(e));
    const functionCall = new FunctionCallNode(identifier, parameters);
    functionCall.location = Location.fromCtx(ctx);
    return functionCall;
  }

  visitInstantiation(ctx: InstantiationContext): InstantiationNode {
    const identifier = new IdentifierNode(ctx.Identifier().text as string);
    identifier.location = Location.fromToken(ctx.Identifier().symbol);
    const parameters = ctx.expressionList().expression().map((e) => this.visit(e));
    const instantiation = new InstantiationNode(identifier, parameters);
    instantiation.location = Location.fromCtx(ctx);
    return instantiation;
  }

  visitTupleIndexOp(ctx: TupleIndexOpContext): TupleIndexOpNode {
    const tuple = this.visit(ctx.expression());
    const index = parseInt(ctx._index.text as string, 10);
    const tupleIndexOp = new TupleIndexOpNode(tuple, index);
    tupleIndexOp.location = Location.fromCtx(ctx);
    return tupleIndexOp;
  }

  visitNullaryOp(ctx: NullaryOpContext): NullaryOpNode {
    const operator = ctx.text as NullaryOperator;
    const nullaryOp = new NullaryOpNode(operator);
    nullaryOp.location = Location.fromCtx(ctx);
    return nullaryOp;
  }

  visitUnaryIntrospectionOp(ctx: UnaryIntrospectionOpContext): UnaryOpNode {
    const operator = `${ctx._scope.text}[i]${ctx._op.text}` as UnaryOperator;
    const expression = this.visit(ctx.expression());
    const unaryOp = new UnaryOpNode(operator, expression);
    unaryOp.location = Location.fromCtx(ctx);
    return unaryOp;
  }

  visitUnaryOp(ctx: UnaryOpContext): UnaryOpNode {
    const operator = ctx._op.text as UnaryOperator;
    const expression = this.visit(ctx.expression());
    const unaryOp = new UnaryOpNode(operator, expression);
    unaryOp.location = Location.fromCtx(ctx);
    return unaryOp;
  }

  visitBinaryOp(ctx: BinaryOpContext): BinaryOpNode {
    const left = this.visit(ctx._left);
    const operator = ctx._op.text as BinaryOperator;
    const right = this.visit(ctx._right);
    const binaryOp = new BinaryOpNode(left, operator, right);
    binaryOp.location = Location.fromCtx(ctx);
    return binaryOp;
  }

  visitArray(ctx: ArrayContext): ArrayNode {
    const elements = ctx.expression().map((e) => this.visit(e));
    const array = new ArrayNode(elements);
    array.location = Location.fromCtx(ctx);
    return array;
  }

  visitIdentifier(ctx: IdentifierContext): IdentifierNode {
    const identifier = new IdentifierNode((ctx.Identifier() as TerminalNode).text);
    identifier.location = Location.fromCtx(ctx);
    return identifier;
  }

  visitLiteralExpression(ctx: LiteralExpressionContext): LiteralNode {
    return this.createLiteral(ctx.literal());
  }

  createLiteral(ctx: LiteralContext): LiteralNode {
    if (ctx.BooleanLiteral()) {
      return this.createBooleanLiteral(ctx);
    }

    if (ctx.numberLiteral()) {
      return this.createIntLiteral(ctx);
    }

    if (ctx.StringLiteral()) {
      return this.createStringLiteral(ctx);
    }

    if (ctx.DateLiteral()) {
      return this.createDateLiteral(ctx);
    }

    if (ctx.HexLiteral()) {
      return this.createHexLiteral(ctx);
    }

    throw new Error(); // Should not happen
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

  createDateLiteral(ctx: LiteralContext): IntLiteralNode {
    const rawString = (ctx.DateLiteral() as TerminalNode).text;
    const stringValue = rawString.substring(6, rawString.length - 2).trim();

    if (!/^\d\d\d\d-\d\d-\d\dT\d\d:\d\d:\d\d$/.test(stringValue)) {
      throw new ParseError('Date should be in format `YYYY-MM-DDThh:mm:ss`', Location.fromCtx(ctx));
    }

    const timestamp = Math.round(Date.parse(stringValue) / 1000);

    if (Number.isNaN(timestamp)) {
      throw new ParseError(`Incorrectly formatted date "${stringValue}"`, Location.fromCtx(ctx));
    }

    const intLiteral = new IntLiteralNode(timestamp);
    intLiteral.location = Location.fromCtx(ctx);
    return intLiteral;
  }

  createHexLiteral(ctx: LiteralContext): HexLiteralNode {
    const hexString = (ctx.HexLiteral() as TerminalNode).text;
    const hexValue = hexToBin(hexString.substring(2));
    const hexLiteral = new HexLiteralNode(hexValue);
    hexLiteral.location = Location.fromCtx(ctx);
    return hexLiteral;
  }
}
