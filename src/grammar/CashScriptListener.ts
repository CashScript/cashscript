// Generated from src/grammar/CashScript.g4 by ANTLR 4.7.3-SNAPSHOT


import { ParseTreeListener } from "antlr4ts/tree/ParseTreeListener";

import { EvalContext } from "./CashScriptParser";
import { AdditionExpContext } from "./CashScriptParser";
import { MultiplyExpContext } from "./CashScriptParser";
import { AtomExpContext } from "./CashScriptParser";


/**
 * This interface defines a complete listener for a parse tree produced by
 * `CashScriptParser`.
 */
export interface CashScriptListener extends ParseTreeListener {
	/**
	 * Enter a parse tree produced by `CashScriptParser.eval`.
	 * @param ctx the parse tree
	 */
	enterEval?: (ctx: EvalContext) => void;
	/**
	 * Exit a parse tree produced by `CashScriptParser.eval`.
	 * @param ctx the parse tree
	 */
	exitEval?: (ctx: EvalContext) => void;

	/**
	 * Enter a parse tree produced by `CashScriptParser.additionExp`.
	 * @param ctx the parse tree
	 */
	enterAdditionExp?: (ctx: AdditionExpContext) => void;
	/**
	 * Exit a parse tree produced by `CashScriptParser.additionExp`.
	 * @param ctx the parse tree
	 */
	exitAdditionExp?: (ctx: AdditionExpContext) => void;

	/**
	 * Enter a parse tree produced by `CashScriptParser.multiplyExp`.
	 * @param ctx the parse tree
	 */
	enterMultiplyExp?: (ctx: MultiplyExpContext) => void;
	/**
	 * Exit a parse tree produced by `CashScriptParser.multiplyExp`.
	 * @param ctx the parse tree
	 */
	exitMultiplyExp?: (ctx: MultiplyExpContext) => void;

	/**
	 * Enter a parse tree produced by `CashScriptParser.atomExp`.
	 * @param ctx the parse tree
	 */
	enterAtomExp?: (ctx: AtomExpContext) => void;
	/**
	 * Exit a parse tree produced by `CashScriptParser.atomExp`.
	 * @param ctx the parse tree
	 */
	exitAtomExp?: (ctx: AtomExpContext) => void;
}

