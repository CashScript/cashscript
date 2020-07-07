// Generated from src/grammar/CashScript.g4 by ANTLR 4.7.3-SNAPSHOT


import { ParseTreeVisitor } from "antlr4ts/tree/ParseTreeVisitor";

import { ParenthesisedContext } from "./CashScriptParser";
import { CastContext } from "./CashScriptParser";
import { FunctionCallExpressionContext } from "./CashScriptParser";
import { InstantiationContext } from "./CashScriptParser";
import { TupleIndexOpContext } from "./CashScriptParser";
import { UnaryOpContext } from "./CashScriptParser";
import { BinaryOpContext } from "./CashScriptParser";
import { ArrayContext } from "./CashScriptParser";
import { PreimageFieldContext } from "./CashScriptParser";
import { IdentifierContext } from "./CashScriptParser";
import { LiteralExpressionContext } from "./CashScriptParser";
import { SourceFileContext } from "./CashScriptParser";
import { PragmaDirectiveContext } from "./CashScriptParser";
import { PragmaNameContext } from "./CashScriptParser";
import { PragmaValueContext } from "./CashScriptParser";
import { VersionConstraintContext } from "./CashScriptParser";
import { VersionOperatorContext } from "./CashScriptParser";
import { ContractDefinitionContext } from "./CashScriptParser";
import { FunctionDefinitionContext } from "./CashScriptParser";
import { ParameterListContext } from "./CashScriptParser";
import { ParameterContext } from "./CashScriptParser";
import { BlockContext } from "./CashScriptParser";
import { StatementContext } from "./CashScriptParser";
import { VariableDefinitionContext } from "./CashScriptParser";
import { AssignStatementContext } from "./CashScriptParser";
import { TimeOpStatementContext } from "./CashScriptParser";
import { RequireStatementContext } from "./CashScriptParser";
import { IfStatementContext } from "./CashScriptParser";
import { FunctionCallContext } from "./CashScriptParser";
import { ExpressionListContext } from "./CashScriptParser";
import { ExpressionContext } from "./CashScriptParser";
import { LiteralContext } from "./CashScriptParser";
import { NumberLiteralContext } from "./CashScriptParser";
import { TypeNameContext } from "./CashScriptParser";


/**
 * This interface defines a complete generic visitor for a parse tree produced
 * by `CashScriptParser`.
 *
 * @param <Result> The return type of the visit operation. Use `void` for
 * operations with no return type.
 */
export interface CashScriptVisitor<Result> extends ParseTreeVisitor<Result> {
	/**
	 * Visit a parse tree produced by the `Parenthesised`
	 * labeled alternative in `CashScriptParser.expression`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitParenthesised?: (ctx: ParenthesisedContext) => Result;

	/**
	 * Visit a parse tree produced by the `Cast`
	 * labeled alternative in `CashScriptParser.expression`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitCast?: (ctx: CastContext) => Result;

	/**
	 * Visit a parse tree produced by the `FunctionCallExpression`
	 * labeled alternative in `CashScriptParser.expression`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitFunctionCallExpression?: (ctx: FunctionCallExpressionContext) => Result;

	/**
	 * Visit a parse tree produced by the `Instantiation`
	 * labeled alternative in `CashScriptParser.expression`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitInstantiation?: (ctx: InstantiationContext) => Result;

	/**
	 * Visit a parse tree produced by the `TupleIndexOp`
	 * labeled alternative in `CashScriptParser.expression`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitTupleIndexOp?: (ctx: TupleIndexOpContext) => Result;

	/**
	 * Visit a parse tree produced by the `UnaryOp`
	 * labeled alternative in `CashScriptParser.expression`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitUnaryOp?: (ctx: UnaryOpContext) => Result;

	/**
	 * Visit a parse tree produced by the `BinaryOp`
	 * labeled alternative in `CashScriptParser.expression`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitBinaryOp?: (ctx: BinaryOpContext) => Result;

	/**
	 * Visit a parse tree produced by the `Array`
	 * labeled alternative in `CashScriptParser.expression`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitArray?: (ctx: ArrayContext) => Result;

	/**
	 * Visit a parse tree produced by the `PreimageField`
	 * labeled alternative in `CashScriptParser.expression`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitPreimageField?: (ctx: PreimageFieldContext) => Result;

	/**
	 * Visit a parse tree produced by the `Identifier`
	 * labeled alternative in `CashScriptParser.expression`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitIdentifier?: (ctx: IdentifierContext) => Result;

	/**
	 * Visit a parse tree produced by the `LiteralExpression`
	 * labeled alternative in `CashScriptParser.expression`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitLiteralExpression?: (ctx: LiteralExpressionContext) => Result;

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
	 * Visit a parse tree produced by `CashScriptParser.expression`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitExpression?: (ctx: ExpressionContext) => Result;

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

