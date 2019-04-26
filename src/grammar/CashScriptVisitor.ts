// Generated from src/grammar/CashScript.g4 by ANTLR 4.7.3-SNAPSHOT


import { ParseTreeVisitor } from "antlr4ts/tree/ParseTreeVisitor";

import { SourceFileContext } from "./CashScriptParser";
import { ContractDefinitionContext } from "./CashScriptParser";
import { FunctionDefinitionContext } from "./CashScriptParser";
import { ParameterListContext } from "./CashScriptParser";
import { ParameterContext } from "./CashScriptParser";
import { BlockContext } from "./CashScriptParser";
import { StatementContext } from "./CashScriptParser";
import { VariableDefinitionContext } from "./CashScriptParser";
import { AssignStatementContext } from "./CashScriptParser";
import { IfStatementContext } from "./CashScriptParser";
import { ThrowStatementContext } from "./CashScriptParser";
import { FunctionCallStatementContext } from "./CashScriptParser";
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
	 * Visit a parse tree produced by `CashScriptParser.sourceFile`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitSourceFile?: (ctx: SourceFileContext) => Result;

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
	 * Visit a parse tree produced by `CashScriptParser.ifStatement`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitIfStatement?: (ctx: IfStatementContext) => Result;

	/**
	 * Visit a parse tree produced by `CashScriptParser.throwStatement`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitThrowStatement?: (ctx: ThrowStatementContext) => Result;

	/**
	 * Visit a parse tree produced by `CashScriptParser.functionCallStatement`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitFunctionCallStatement?: (ctx: FunctionCallStatementContext) => Result;

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

