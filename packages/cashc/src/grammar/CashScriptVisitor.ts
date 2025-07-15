// Generated from src/grammar/CashScript.g4 by ANTLR 4.13.1

import {ParseTreeVisitor} from 'antlr4';


import { SourceFileContext } from "./CashScriptParser.js";
import { PragmaDirectiveContext } from "./CashScriptParser.js";
import { PragmaNameContext } from "./CashScriptParser.js";
import { PragmaValueContext } from "./CashScriptParser.js";
import { VersionConstraintContext } from "./CashScriptParser.js";
import { VersionOperatorContext } from "./CashScriptParser.js";
import { ContractDefinitionContext } from "./CashScriptParser.js";
import { FunctionDefinitionContext } from "./CashScriptParser.js";
import { ParameterListContext } from "./CashScriptParser.js";
import { ParameterContext } from "./CashScriptParser.js";
import { BlockContext } from "./CashScriptParser.js";
import { StatementContext } from "./CashScriptParser.js";
import { VariableDefinitionContext } from "./CashScriptParser.js";
import { TupleAssignmentContext } from "./CashScriptParser.js";
import { AssignStatementContext } from "./CashScriptParser.js";
import { TimeOpStatementContext } from "./CashScriptParser.js";
import { RequireStatementContext } from "./CashScriptParser.js";
import { IfStatementContext } from "./CashScriptParser.js";
import { ConsoleStatementContext } from "./CashScriptParser.js";
import { RequireMessageContext } from "./CashScriptParser.js";
import { ConsoleParameterContext } from "./CashScriptParser.js";
import { ConsoleParameterListContext } from "./CashScriptParser.js";
import { FunctionCallContext } from "./CashScriptParser.js";
import { ExpressionListContext } from "./CashScriptParser.js";
import { CastContext } from "./CashScriptParser.js";
import { UnaryIntrospectionOpContext } from "./CashScriptParser.js";
import { UnaryOpContext } from "./CashScriptParser.js";
import { LiteralExpressionContext } from "./CashScriptParser.js";
import { FunctionCallExpressionContext } from "./CashScriptParser.js";
import { ArrayContext } from "./CashScriptParser.js";
import { IdentifierContext } from "./CashScriptParser.js";
import { SliceContext } from "./CashScriptParser.js";
import { TupleIndexOpContext } from "./CashScriptParser.js";
import { InstantiationContext } from "./CashScriptParser.js";
import { NullaryOpContext } from "./CashScriptParser.js";
import { ParenthesisedContext } from "./CashScriptParser.js";
import { BinaryOpContext } from "./CashScriptParser.js";
import { ModifierContext } from "./CashScriptParser.js";
import { LiteralContext } from "./CashScriptParser.js";
import { NumberLiteralContext } from "./CashScriptParser.js";
import { TypeNameContext } from "./CashScriptParser.js";


/**
 * This interface defines a complete generic visitor for a parse tree produced
 * by `CashScriptParser`.
 *
 * @param <Result> The return type of the visit operation. Use `void` for
 * operations with no return type.
 */
export default class CashScriptVisitor<Result> extends ParseTreeVisitor<Result> {
	/**
	 * Visit a parse tree produced by `CashScriptParser.sourceFile`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitSourceFile?: (ctx: SourceFileContext) => Result;
	/**
	 * Visit a parse tree produced by `CashScriptParser.pragmaDirective`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitPragmaDirective?: (ctx: PragmaDirectiveContext) => Result;
	/**
	 * Visit a parse tree produced by `CashScriptParser.pragmaName`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitPragmaName?: (ctx: PragmaNameContext) => Result;
	/**
	 * Visit a parse tree produced by `CashScriptParser.pragmaValue`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitPragmaValue?: (ctx: PragmaValueContext) => Result;
	/**
	 * Visit a parse tree produced by `CashScriptParser.versionConstraint`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitVersionConstraint?: (ctx: VersionConstraintContext) => Result;
	/**
	 * Visit a parse tree produced by `CashScriptParser.versionOperator`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitVersionOperator?: (ctx: VersionOperatorContext) => Result;
	/**
	 * Visit a parse tree produced by `CashScriptParser.contractDefinition`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitContractDefinition?: (ctx: ContractDefinitionContext) => Result;
	/**
	 * Visit a parse tree produced by `CashScriptParser.functionDefinition`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitFunctionDefinition?: (ctx: FunctionDefinitionContext) => Result;
	/**
	 * Visit a parse tree produced by `CashScriptParser.parameterList`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitParameterList?: (ctx: ParameterListContext) => Result;
	/**
	 * Visit a parse tree produced by `CashScriptParser.parameter`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitParameter?: (ctx: ParameterContext) => Result;
	/**
	 * Visit a parse tree produced by `CashScriptParser.block`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitBlock?: (ctx: BlockContext) => Result;
	/**
	 * Visit a parse tree produced by `CashScriptParser.statement`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitStatement?: (ctx: StatementContext) => Result;
	/**
	 * Visit a parse tree produced by `CashScriptParser.variableDefinition`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitVariableDefinition?: (ctx: VariableDefinitionContext) => Result;
	/**
	 * Visit a parse tree produced by `CashScriptParser.tupleAssignment`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitTupleAssignment?: (ctx: TupleAssignmentContext) => Result;
	/**
	 * Visit a parse tree produced by `CashScriptParser.assignStatement`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitAssignStatement?: (ctx: AssignStatementContext) => Result;
	/**
	 * Visit a parse tree produced by `CashScriptParser.timeOpStatement`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitTimeOpStatement?: (ctx: TimeOpStatementContext) => Result;
	/**
	 * Visit a parse tree produced by `CashScriptParser.requireStatement`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitRequireStatement?: (ctx: RequireStatementContext) => Result;
	/**
	 * Visit a parse tree produced by `CashScriptParser.ifStatement`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitIfStatement?: (ctx: IfStatementContext) => Result;
	/**
	 * Visit a parse tree produced by `CashScriptParser.consoleStatement`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitConsoleStatement?: (ctx: ConsoleStatementContext) => Result;
	/**
	 * Visit a parse tree produced by `CashScriptParser.requireMessage`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitRequireMessage?: (ctx: RequireMessageContext) => Result;
	/**
	 * Visit a parse tree produced by `CashScriptParser.consoleParameter`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitConsoleParameter?: (ctx: ConsoleParameterContext) => Result;
	/**
	 * Visit a parse tree produced by `CashScriptParser.consoleParameterList`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitConsoleParameterList?: (ctx: ConsoleParameterListContext) => Result;
	/**
	 * Visit a parse tree produced by `CashScriptParser.functionCall`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitFunctionCall?: (ctx: FunctionCallContext) => Result;
	/**
	 * Visit a parse tree produced by `CashScriptParser.expressionList`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitExpressionList?: (ctx: ExpressionListContext) => Result;
	/**
	 * Visit a parse tree produced by the `Cast`
	 * labeled alternative in `CashScriptParser.expression`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitCast?: (ctx: CastContext) => Result;
	/**
	 * Visit a parse tree produced by the `UnaryIntrospectionOp`
	 * labeled alternative in `CashScriptParser.expression`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitUnaryIntrospectionOp?: (ctx: UnaryIntrospectionOpContext) => Result;
	/**
	 * Visit a parse tree produced by the `UnaryOp`
	 * labeled alternative in `CashScriptParser.expression`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitUnaryOp?: (ctx: UnaryOpContext) => Result;
	/**
	 * Visit a parse tree produced by the `LiteralExpression`
	 * labeled alternative in `CashScriptParser.expression`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitLiteralExpression?: (ctx: LiteralExpressionContext) => Result;
	/**
	 * Visit a parse tree produced by the `FunctionCallExpression`
	 * labeled alternative in `CashScriptParser.expression`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitFunctionCallExpression?: (ctx: FunctionCallExpressionContext) => Result;
	/**
	 * Visit a parse tree produced by the `Array`
	 * labeled alternative in `CashScriptParser.expression`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitArray?: (ctx: ArrayContext) => Result;
	/**
	 * Visit a parse tree produced by the `Identifier`
	 * labeled alternative in `CashScriptParser.expression`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitIdentifier?: (ctx: IdentifierContext) => Result;
	/**
	 * Visit a parse tree produced by the `Slice`
	 * labeled alternative in `CashScriptParser.expression`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitSlice?: (ctx: SliceContext) => Result;
	/**
	 * Visit a parse tree produced by the `TupleIndexOp`
	 * labeled alternative in `CashScriptParser.expression`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitTupleIndexOp?: (ctx: TupleIndexOpContext) => Result;
	/**
	 * Visit a parse tree produced by the `Instantiation`
	 * labeled alternative in `CashScriptParser.expression`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitInstantiation?: (ctx: InstantiationContext) => Result;
	/**
	 * Visit a parse tree produced by the `NullaryOp`
	 * labeled alternative in `CashScriptParser.expression`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitNullaryOp?: (ctx: NullaryOpContext) => Result;
	/**
	 * Visit a parse tree produced by the `Parenthesised`
	 * labeled alternative in `CashScriptParser.expression`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitParenthesised?: (ctx: ParenthesisedContext) => Result;
	/**
	 * Visit a parse tree produced by the `BinaryOp`
	 * labeled alternative in `CashScriptParser.expression`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitBinaryOp?: (ctx: BinaryOpContext) => Result;
	/**
	 * Visit a parse tree produced by `CashScriptParser.modifier`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitModifier?: (ctx: ModifierContext) => Result;
	/**
	 * Visit a parse tree produced by `CashScriptParser.literal`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitLiteral?: (ctx: LiteralContext) => Result;
	/**
	 * Visit a parse tree produced by `CashScriptParser.numberLiteral`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitNumberLiteral?: (ctx: NumberLiteralContext) => Result;
	/**
	 * Visit a parse tree produced by `CashScriptParser.typeName`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitTypeName?: (ctx: TypeNameContext) => Result;
}

