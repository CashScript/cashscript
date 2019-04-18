// Generated from src/grammar/CashScript.g4 by ANTLR 4.7.3-SNAPSHOT


import { ParseTreeVisitor } from "antlr4ts/tree/ParseTreeVisitor";

import { EvalContext } from "./CashScriptParser";
import { AdditionExpContext } from "./CashScriptParser";
import { MultiplyExpContext } from "./CashScriptParser";
import { AtomExpContext } from "./CashScriptParser";


/**
 * This interface defines a complete generic visitor for a parse tree produced
 * by `CashScriptParser`.
 *
 * @param <Result> The return type of the visit operation. Use `void` for
 * operations with no return type.
 */
export interface CashScriptVisitor<Result> extends ParseTreeVisitor<Result> {
	/**
	 * Visit a parse tree produced by `CashScriptParser.eval`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitEval?: (ctx: EvalContext) => Result;

	/**
	 * Visit a parse tree produced by `CashScriptParser.additionExp`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitAdditionExp?: (ctx: AdditionExpContext) => Result;

	/**
	 * Visit a parse tree produced by `CashScriptParser.multiplyExp`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitMultiplyExp?: (ctx: MultiplyExpContext) => Result;

	/**
	 * Visit a parse tree produced by `CashScriptParser.atomExp`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitAtomExp?: (ctx: AtomExpContext) => Result;
}

