import { ParseTree, ParseTreeVisitor } from 'antlr4';
import { hexToBin } from '@bitauth/libauth';
import { parseType } from '@cashscript/utils';
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
  ConsoleStatementNode,
  ConsoleParameterNode,
  SliceNode,
  DoWhileNode,
} from './AST.js';
import { UnaryOperator, BinaryOperator, NullaryOperator } from './Operator.js';
import type {
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
  ConsoleStatementContext,
  ConsoleParameterContext,
  StatementContext,
  RequireMessageContext,
  SliceContext,
  DoWhileStatementContext,
  LoopStatementContext,
} from '../grammar/CashScriptParser.js';
import CashScriptVisitor from '../grammar/CashScriptVisitor.js';
import { Location } from './Location.js';
import {
  NumberUnit,
  TimeOp,
} from './Globals.js';
import { getPragmaName, PragmaName, getVersionOpFromCtx } from './Pragma.js';
import { version } from '../index.js';
import { ParseError, VersionError } from '../Errors.js';

export default class AstBuilder
  extends ParseTreeVisitor<Node>
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
    ctx.pragmaDirective_list().forEach((pragma) => {
      this.processPragma(pragma);
    });

    const contract = this.visit(ctx.contractDefinition()) as ContractNode;
    const sourceFileNode = new SourceFileNode(contract);
    sourceFileNode.location = Location.fromCtx(ctx);
    return sourceFileNode;
  }

  processPragma(ctx: PragmaDirectiveContext): void {
    const pragmaName = getPragmaName(ctx.pragmaName().getText());
    if (pragmaName !== PragmaName.CASHSCRIPT) throw new Error(); // Shouldn't happen

    // Strip any -beta tags
    const actualVersion = version.replace(/-.*/g, '');

    ctx.pragmaValue().versionConstraint_list().forEach((constraint) => {
      const op = getVersionOpFromCtx(constraint.versionOperator());
      const versionConstraint = `${op}${constraint.VersionLiteral().getText()}`;
      if (!semver.satisfies(actualVersion, versionConstraint)) {
        throw new VersionError(actualVersion, versionConstraint);
      }
    });
  }

  visitContractDefinition(ctx: ContractDefinitionContext): ContractNode {
    const name = ctx.Identifier().getText();
    const parameters = ctx.parameterList().parameter_list().map((p) => this.visit(p) as ParameterNode);
    const functions = ctx.functionDefinition_list().map((f) => this.visit(f) as FunctionDefinitionNode);
    const contract = new ContractNode(name, parameters, functions);
    contract.location = Location.fromCtx(ctx);
    return contract;
  }

  visitFunctionDefinition(ctx: FunctionDefinitionContext): FunctionDefinitionNode {
    const name = ctx.Identifier().getText();
    const parameters = ctx.parameterList().parameter_list().map((p) => this.visit(p) as ParameterNode);
    const statements = ctx.statement_list().map((s) => this.visit(s) as StatementNode);
    const block = new BlockNode(statements);
    block.location = Location.fromCtx(ctx);

    const functionDefinition = new FunctionDefinitionNode(name, parameters, block);
    functionDefinition.location = Location.fromCtx(ctx);
    return functionDefinition;
  }

  visitParameter(ctx: ParameterContext): ParameterNode {
    const type = parseType(ctx.typeName().getText());
    const name = ctx.Identifier().getText();
    const parameter = new ParameterNode(type, name);
    parameter.location = Location.fromCtx(ctx);
    return parameter;
  }

  visitStatement(ctx: StatementContext): StatementNode {
    // Statement nodes only have a single child, so we can just visit that child
    return this.visit(ctx.getChild(0));
  }

  visitVariableDefinition(ctx: VariableDefinitionContext): VariableDefinitionNode {
    const type = parseType(ctx.typeName().getText());
    const modifiers = ctx.modifier_list().map((modifier) => modifier.getText());
    const name = ctx.Identifier().getText();
    const expression = this.visit(ctx.expression());
    const variableDefinition = new VariableDefinitionNode(type, modifiers, name, expression);
    variableDefinition.location = Location.fromCtx(ctx);
    return variableDefinition;
  }

  visitTupleAssignment(ctx: TupleAssignmentContext): TupleAssignmentNode {
    const expression = this.visit(ctx.expression());
    const names = ctx.Identifier_list();
    const types = ctx.typeName_list();
    const [var1, var2] = names.map((name, i) => ({
      name: name.getText(),
      type: parseType(types[i].getText()),
    }));
    const tupleAssignment = new TupleAssignmentNode(var1, var2, expression);
    tupleAssignment.location = Location.fromCtx(ctx);
    return tupleAssignment;
  }

  visitAssignStatement(ctx: AssignStatementContext): AssignNode {
    const identifier = new IdentifierNode(ctx.Identifier().getText());
    identifier.location = Location.fromToken(ctx.Identifier().symbol);

    const expression = this.visit(ctx.expression());
    const assign = new AssignNode(identifier, expression);
    assign.location = Location.fromCtx(ctx);
    return assign;
  }

  visitTimeOpStatement(ctx: TimeOpStatementContext): TimeOpNode {
    const expression = this.visit(ctx.expression());
    const message = ctx.requireMessage() ? this.createStringLiteral(ctx.requireMessage()).value : undefined;
    const timeOp = new TimeOpNode(ctx.TxVar().getText() as TimeOp, expression, message);
    timeOp.location = Location.fromCtx(ctx);

    return timeOp;
  }

  visitRequireStatement(ctx: RequireStatementContext): RequireNode {
    const expression = this.visit(ctx.expression());
    const message = ctx.requireMessage() ? this.createStringLiteral(ctx.requireMessage()).value : undefined;
    const require = new RequireNode(expression, message);
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

  visitLoopStatement(ctx: LoopStatementContext): DoWhileNode {
    return this.visit(ctx.doWhileStatement()) as DoWhileNode;
  }

  visitDoWhileStatement(ctx: DoWhileStatementContext): DoWhileNode {
    const condition = this.visit(ctx.expression());
    const block = this.visit(ctx.block()) as StatementNode;
    const doWhile = new DoWhileNode(condition, block);
    doWhile.location = Location.fromCtx(ctx);
    return doWhile;
  }

  visitBlock(ctx: BlockContext): BlockNode {
    const statements = ctx.statement_list().map((s) => this.visit(s) as StatementNode);
    const block = new BlockNode(statements);
    block.location = Location.fromCtx(ctx);
    return block;
  }

  visitParenthesised(ctx: ParenthesisedContext): ExpressionNode {
    return this.visit(ctx.expression());
  }

  visitCast(ctx: CastContext): CastNode {
    const rawType = ctx.typeCast().getText();
    const type = parseType(rawType.replace('unsafe_', ''));
    const isUnsafe = rawType.startsWith('unsafe_');
    const expression = this.visit(ctx._castable);
    const cast = new CastNode(type, expression, isUnsafe);
    cast.location = Location.fromCtx(ctx);
    return cast;
  }

  visitFunctionCallExpression(ctx: FunctionCallExpressionContext): FunctionCallNode {
    return this.visit(ctx.functionCall()) as FunctionCallNode;
  }

  visitFunctionCall(ctx: FunctionCallContext): FunctionCallNode {
    const identifier = new IdentifierNode(ctx.Identifier().getText());
    identifier.location = Location.fromToken(ctx.Identifier().symbol);
    const parameters = ctx.expressionList().expression_list().map((e) => this.visit(e));
    const functionCall = new FunctionCallNode(identifier, parameters);
    functionCall.location = Location.fromCtx(ctx);
    return functionCall;
  }

  visitInstantiation(ctx: InstantiationContext): InstantiationNode {
    const identifier = new IdentifierNode(ctx.Identifier().getText());
    identifier.location = Location.fromToken(ctx.Identifier().symbol);
    const parameters = ctx.expressionList().expression_list().map((e) => this.visit(e));
    const instantiation = new InstantiationNode(identifier, parameters);
    instantiation.location = Location.fromCtx(ctx);
    return instantiation;
  }

  visitTupleIndexOp(ctx: TupleIndexOpContext): TupleIndexOpNode {
    const tuple = this.visit(ctx.expression());
    const index = parseInt(ctx._index.text, 10);
    const tupleIndexOp = new TupleIndexOpNode(tuple, index);
    tupleIndexOp.location = Location.fromCtx(ctx);
    return tupleIndexOp;
  }

  visitSlice(ctx: SliceContext): SliceNode {
    const element = this.visit(ctx._element);
    const start = this.visit(ctx._start);
    const end = this.visit(ctx._end);
    const slice = new SliceNode(element, start, end);
    slice.location = Location.fromCtx(ctx);
    return slice;
  }

  visitNullaryOp(ctx: NullaryOpContext): NullaryOpNode {
    const operator = ctx.getText() as NullaryOperator;
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
    const elements = ctx.expression_list().map((e) => this.visit(e));
    const array = new ArrayNode(elements);
    array.location = Location.fromCtx(ctx);
    return array;
  }

  visitIdentifier(ctx: IdentifierContext): IdentifierNode {
    const identifier = new IdentifierNode(ctx.Identifier().getText());
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
    const boolString = ctx.BooleanLiteral().getText();
    const boolValue = boolString === 'true';
    const booleanLiteral = new BoolLiteralNode(boolValue);
    booleanLiteral.location = Location.fromCtx(ctx);
    return booleanLiteral;
  }

  createIntLiteral(ctx: LiteralContext): IntLiteralNode {
    const numberCtx = ctx.numberLiteral();
    const numberString = numberCtx.NumberLiteral().getText();
    const numberUnit = numberCtx.NumberUnit()?.getText();
    const numberValue = parseNumberString(numberString) * BigInt(numberUnit ? NumberUnit[numberUnit.toUpperCase()] : 1);
    const intLiteral = new IntLiteralNode(numberValue);
    intLiteral.location = Location.fromCtx(ctx);
    return intLiteral;
  }

  createStringLiteral(ctx: LiteralContext | RequireMessageContext): StringLiteralNode {
    const rawString = ctx.StringLiteral().getText();
    const stringValue = rawString.substring(1, rawString.length - 1);
    const quote = rawString.substring(0, 1);
    const stringLiteral = new StringLiteralNode(stringValue, quote);
    stringLiteral.location = Location.fromCtx(ctx);
    return stringLiteral;
  }

  createDateLiteral(ctx: LiteralContext): IntLiteralNode {
    const rawString = ctx.DateLiteral().getText();
    const stringValue = rawString.substring(6, rawString.length - 2).trim();

    if (!/^\d\d\d\d-\d\d-\d\dT\d\d:\d\d:\d\d$/.test(stringValue)) {
      throw new ParseError('Date should be in format `YYYY-MM-DDThh:mm:ss`', Location.fromCtx(ctx));
    }

    const timestamp = Math.round(Date.parse(stringValue) / 1000);

    if (Number.isNaN(timestamp)) {
      throw new ParseError(`Incorrectly formatted date "${stringValue}"`, Location.fromCtx(ctx));
    }

    const intLiteral = new IntLiteralNode(BigInt(timestamp));
    intLiteral.location = Location.fromCtx(ctx);
    return intLiteral;
  }

  createHexLiteral(ctx: LiteralContext): HexLiteralNode {
    const hexString = ctx.HexLiteral().getText();
    const hexValue = hexToBin(hexString.substring(2));
    const hexLiteral = new HexLiteralNode(hexValue);
    hexLiteral.location = Location.fromCtx(ctx);
    return hexLiteral;
  }

  visitConsoleStatement(ctx: ConsoleStatementContext): ConsoleStatementNode {
    const parameters = ctx.consoleParameterList()
      .consoleParameter_list()
      .map((p) => this.visit(p) as ConsoleParameterNode);

    const node = new ConsoleStatementNode(parameters);
    node.location = Location.fromCtx(ctx);
    return node;
  }

  visitConsoleParameter(ctx: ConsoleParameterContext): ConsoleParameterNode {
    const node = ctx.literal() ? this.createLiteral(ctx.literal()) : new IdentifierNode(ctx.Identifier().getText());
    node.location = Location.fromCtx(ctx);
    return node;
  }

  // For safety reasons, we throw an error when the "default" visitChildren is called. *All* nodes
  // must have a custom visit method, so that we can be sure that we've covered all cases.
  visitChildren(): Node {
    throw new Error('Safety Warning: Unhandled node in AST builder');
  }
}

const parseNumberString = (numberString: string): bigint => {
  const cleanedNumberString = numberString.replace(/_/g, '');

  const isScientificNotation = /[eE]/.test(cleanedNumberString);
  if (!isScientificNotation) return BigInt(cleanedNumberString);

  const [coefficient, exponent] = cleanedNumberString.split(/[eE]/);
  return BigInt(coefficient) * BigInt(10) ** BigInt(exponent);
};
