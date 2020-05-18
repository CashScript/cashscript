// Generated from src/grammar/CashScript.g4 by ANTLR 4.7.3-SNAPSHOT


import { ParseTreeListener } from "antlr4ts/tree/ParseTreeListener";

import { ParenthesisedContext } from "./CashScriptParser";
import { CastContext } from "./CashScriptParser";
import { FunctionCallExpressionContext } from "./CashScriptParser";
import { InstantationContext } from "./CashScriptParser";
import { TupleIndexOpContext } from "./CashScriptParser";
import { SplitOpContext } from "./CashScriptParser";
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
 * This interface defines a complete listener for a parse tree produced by
 * `CashScriptParser`.
 */
export interface CashScriptListener extends ParseTreeListener {
	/**
	 * Enter a parse tree produced by the `Parenthesised`
	 * labeled alternative in `CashScriptParser.expression`.
	 * @param ctx the parse tree
	 */
	enterParenthesised?: (ctx: ParenthesisedContext) => void;
	/**
	 * Exit a parse tree produced by the `Parenthesised`
	 * labeled alternative in `CashScriptParser.expression`.
	 * @param ctx the parse tree
	 */
	exitParenthesised?: (ctx: ParenthesisedContext) => void;

	/**
	 * Enter a parse tree produced by the `Cast`
	 * labeled alternative in `CashScriptParser.expression`.
	 * @param ctx the parse tree
	 */
	enterCast?: (ctx: CastContext) => void;
	/**
	 * Exit a parse tree produced by the `Cast`
	 * labeled alternative in `CashScriptParser.expression`.
	 * @param ctx the parse tree
	 */
	exitCast?: (ctx: CastContext) => void;

	/**
	 * Enter a parse tree produced by the `FunctionCallExpression`
	 * labeled alternative in `CashScriptParser.expression`.
	 * @param ctx the parse tree
	 */
	enterFunctionCallExpression?: (ctx: FunctionCallExpressionContext) => void;
	/**
	 * Exit a parse tree produced by the `FunctionCallExpression`
	 * labeled alternative in `CashScriptParser.expression`.
	 * @param ctx the parse tree
	 */
	exitFunctionCallExpression?: (ctx: FunctionCallExpressionContext) => void;

	/**
	 * Enter a parse tree produced by the `Instantation`
	 * labeled alternative in `CashScriptParser.expression`.
	 * @param ctx the parse tree
	 */
	enterInstantation?: (ctx: InstantationContext) => void;
	/**
	 * Exit a parse tree produced by the `Instantation`
	 * labeled alternative in `CashScriptParser.expression`.
	 * @param ctx the parse tree
	 */
	exitInstantation?: (ctx: InstantationContext) => void;

	/**
	 * Enter a parse tree produced by the `TupleIndexOp`
	 * labeled alternative in `CashScriptParser.expression`.
	 * @param ctx the parse tree
	 */
	enterTupleIndexOp?: (ctx: TupleIndexOpContext) => void;
	/**
	 * Exit a parse tree produced by the `TupleIndexOp`
	 * labeled alternative in `CashScriptParser.expression`.
	 * @param ctx the parse tree
	 */
	exitTupleIndexOp?: (ctx: TupleIndexOpContext) => void;

	/**
	 * Enter a parse tree produced by the `SplitOp`
	 * labeled alternative in `CashScriptParser.expression`.
	 * @param ctx the parse tree
	 */
	enterSplitOp?: (ctx: SplitOpContext) => void;
	/**
	 * Exit a parse tree produced by the `SplitOp`
	 * labeled alternative in `CashScriptParser.expression`.
	 * @param ctx the parse tree
	 */
	exitSplitOp?: (ctx: SplitOpContext) => void;

	/**
	 * Enter a parse tree produced by the `UnaryOp`
	 * labeled alternative in `CashScriptParser.expression`.
	 * @param ctx the parse tree
	 */
	enterUnaryOp?: (ctx: UnaryOpContext) => void;
	/**
	 * Exit a parse tree produced by the `UnaryOp`
	 * labeled alternative in `CashScriptParser.expression`.
	 * @param ctx the parse tree
	 */
	exitUnaryOp?: (ctx: UnaryOpContext) => void;

	/**
	 * Enter a parse tree produced by the `BinaryOp`
	 * labeled alternative in `CashScriptParser.expression`.
	 * @param ctx the parse tree
	 */
	enterBinaryOp?: (ctx: BinaryOpContext) => void;
	/**
	 * Exit a parse tree produced by the `BinaryOp`
	 * labeled alternative in `CashScriptParser.expression`.
	 * @param ctx the parse tree
	 */
	exitBinaryOp?: (ctx: BinaryOpContext) => void;

	/**
	 * Enter a parse tree produced by the `Array`
	 * labeled alternative in `CashScriptParser.expression`.
	 * @param ctx the parse tree
	 */
	enterArray?: (ctx: ArrayContext) => void;
	/**
	 * Exit a parse tree produced by the `Array`
	 * labeled alternative in `CashScriptParser.expression`.
	 * @param ctx the parse tree
	 */
	exitArray?: (ctx: ArrayContext) => void;

	/**
	 * Enter a parse tree produced by the `PreimageField`
	 * labeled alternative in `CashScriptParser.expression`.
	 * @param ctx the parse tree
	 */
	enterPreimageField?: (ctx: PreimageFieldContext) => void;
	/**
	 * Exit a parse tree produced by the `PreimageField`
	 * labeled alternative in `CashScriptParser.expression`.
	 * @param ctx the parse tree
	 */
	exitPreimageField?: (ctx: PreimageFieldContext) => void;

	/**
	 * Enter a parse tree produced by the `Identifier`
	 * labeled alternative in `CashScriptParser.expression`.
	 * @param ctx the parse tree
	 */
	enterIdentifier?: (ctx: IdentifierContext) => void;
	/**
	 * Exit a parse tree produced by the `Identifier`
	 * labeled alternative in `CashScriptParser.expression`.
	 * @param ctx the parse tree
	 */
	exitIdentifier?: (ctx: IdentifierContext) => void;

	/**
	 * Enter a parse tree produced by the `LiteralExpression`
	 * labeled alternative in `CashScriptParser.expression`.
	 * @param ctx the parse tree
	 */
	enterLiteralExpression?: (ctx: LiteralExpressionContext) => void;
	/**
	 * Exit a parse tree produced by the `LiteralExpression`
	 * labeled alternative in `CashScriptParser.expression`.
	 * @param ctx the parse tree
	 */
	exitLiteralExpression?: (ctx: LiteralExpressionContext) => void;

	/**
	 * Enter a parse tree produced by `CashScriptParser.sourceFile`.
	 * @param ctx the parse tree
	 */
	enterSourceFile?: (ctx: SourceFileContext) => void;
	/**
	 * Exit a parse tree produced by `CashScriptParser.sourceFile`.
	 * @param ctx the parse tree
	 */
	exitSourceFile?: (ctx: SourceFileContext) => void;

	/**
	 * Enter a parse tree produced by `CashScriptParser.pragmaDirective`.
	 * @param ctx the parse tree
	 */
	enterPragmaDirective?: (ctx: PragmaDirectiveContext) => void;
	/**
	 * Exit a parse tree produced by `CashScriptParser.pragmaDirective`.
	 * @param ctx the parse tree
	 */
	exitPragmaDirective?: (ctx: PragmaDirectiveContext) => void;

	/**
	 * Enter a parse tree produced by `CashScriptParser.pragmaName`.
	 * @param ctx the parse tree
	 */
	enterPragmaName?: (ctx: PragmaNameContext) => void;
	/**
	 * Exit a parse tree produced by `CashScriptParser.pragmaName`.
	 * @param ctx the parse tree
	 */
	exitPragmaName?: (ctx: PragmaNameContext) => void;

	/**
	 * Enter a parse tree produced by `CashScriptParser.pragmaValue`.
	 * @param ctx the parse tree
	 */
	enterPragmaValue?: (ctx: PragmaValueContext) => void;
	/**
	 * Exit a parse tree produced by `CashScriptParser.pragmaValue`.
	 * @param ctx the parse tree
	 */
	exitPragmaValue?: (ctx: PragmaValueContext) => void;

	/**
	 * Enter a parse tree produced by `CashScriptParser.versionConstraint`.
	 * @param ctx the parse tree
	 */
	enterVersionConstraint?: (ctx: VersionConstraintContext) => void;
	/**
	 * Exit a parse tree produced by `CashScriptParser.versionConstraint`.
	 * @param ctx the parse tree
	 */
	exitVersionConstraint?: (ctx: VersionConstraintContext) => void;

	/**
	 * Enter a parse tree produced by `CashScriptParser.versionOperator`.
	 * @param ctx the parse tree
	 */
	enterVersionOperator?: (ctx: VersionOperatorContext) => void;
	/**
	 * Exit a parse tree produced by `CashScriptParser.versionOperator`.
	 * @param ctx the parse tree
	 */
	exitVersionOperator?: (ctx: VersionOperatorContext) => void;

	/**
	 * Enter a parse tree produced by `CashScriptParser.contractDefinition`.
	 * @param ctx the parse tree
	 */
	enterContractDefinition?: (ctx: ContractDefinitionContext) => void;
	/**
	 * Exit a parse tree produced by `CashScriptParser.contractDefinition`.
	 * @param ctx the parse tree
	 */
	exitContractDefinition?: (ctx: ContractDefinitionContext) => void;

	/**
	 * Enter a parse tree produced by `CashScriptParser.functionDefinition`.
	 * @param ctx the parse tree
	 */
	enterFunctionDefinition?: (ctx: FunctionDefinitionContext) => void;
	/**
	 * Exit a parse tree produced by `CashScriptParser.functionDefinition`.
	 * @param ctx the parse tree
	 */
	exitFunctionDefinition?: (ctx: FunctionDefinitionContext) => void;

	/**
	 * Enter a parse tree produced by `CashScriptParser.parameterList`.
	 * @param ctx the parse tree
	 */
	enterParameterList?: (ctx: ParameterListContext) => void;
	/**
	 * Exit a parse tree produced by `CashScriptParser.parameterList`.
	 * @param ctx the parse tree
	 */
	exitParameterList?: (ctx: ParameterListContext) => void;

	/**
	 * Enter a parse tree produced by `CashScriptParser.parameter`.
	 * @param ctx the parse tree
	 */
	enterParameter?: (ctx: ParameterContext) => void;
	/**
	 * Exit a parse tree produced by `CashScriptParser.parameter`.
	 * @param ctx the parse tree
	 */
	exitParameter?: (ctx: ParameterContext) => void;

	/**
	 * Enter a parse tree produced by `CashScriptParser.block`.
	 * @param ctx the parse tree
	 */
	enterBlock?: (ctx: BlockContext) => void;
	/**
	 * Exit a parse tree produced by `CashScriptParser.block`.
	 * @param ctx the parse tree
	 */
	exitBlock?: (ctx: BlockContext) => void;

	/**
	 * Enter a parse tree produced by `CashScriptParser.statement`.
	 * @param ctx the parse tree
	 */
	enterStatement?: (ctx: StatementContext) => void;
	/**
	 * Exit a parse tree produced by `CashScriptParser.statement`.
	 * @param ctx the parse tree
	 */
	exitStatement?: (ctx: StatementContext) => void;

	/**
	 * Enter a parse tree produced by `CashScriptParser.variableDefinition`.
	 * @param ctx the parse tree
	 */
	enterVariableDefinition?: (ctx: VariableDefinitionContext) => void;
	/**
	 * Exit a parse tree produced by `CashScriptParser.variableDefinition`.
	 * @param ctx the parse tree
	 */
	exitVariableDefinition?: (ctx: VariableDefinitionContext) => void;

	/**
	 * Enter a parse tree produced by `CashScriptParser.assignStatement`.
	 * @param ctx the parse tree
	 */
	enterAssignStatement?: (ctx: AssignStatementContext) => void;
	/**
	 * Exit a parse tree produced by `CashScriptParser.assignStatement`.
	 * @param ctx the parse tree
	 */
	exitAssignStatement?: (ctx: AssignStatementContext) => void;

	/**
	 * Enter a parse tree produced by `CashScriptParser.timeOpStatement`.
	 * @param ctx the parse tree
	 */
	enterTimeOpStatement?: (ctx: TimeOpStatementContext) => void;
	/**
	 * Exit a parse tree produced by `CashScriptParser.timeOpStatement`.
	 * @param ctx the parse tree
	 */
	exitTimeOpStatement?: (ctx: TimeOpStatementContext) => void;

	/**
	 * Enter a parse tree produced by `CashScriptParser.requireStatement`.
	 * @param ctx the parse tree
	 */
	enterRequireStatement?: (ctx: RequireStatementContext) => void;
	/**
	 * Exit a parse tree produced by `CashScriptParser.requireStatement`.
	 * @param ctx the parse tree
	 */
	exitRequireStatement?: (ctx: RequireStatementContext) => void;

	/**
	 * Enter a parse tree produced by `CashScriptParser.ifStatement`.
	 * @param ctx the parse tree
	 */
	enterIfStatement?: (ctx: IfStatementContext) => void;
	/**
	 * Exit a parse tree produced by `CashScriptParser.ifStatement`.
	 * @param ctx the parse tree
	 */
	exitIfStatement?: (ctx: IfStatementContext) => void;

	/**
	 * Enter a parse tree produced by `CashScriptParser.functionCall`.
	 * @param ctx the parse tree
	 */
	enterFunctionCall?: (ctx: FunctionCallContext) => void;
	/**
	 * Exit a parse tree produced by `CashScriptParser.functionCall`.
	 * @param ctx the parse tree
	 */
	exitFunctionCall?: (ctx: FunctionCallContext) => void;

	/**
	 * Enter a parse tree produced by `CashScriptParser.expressionList`.
	 * @param ctx the parse tree
	 */
	enterExpressionList?: (ctx: ExpressionListContext) => void;
	/**
	 * Exit a parse tree produced by `CashScriptParser.expressionList`.
	 * @param ctx the parse tree
	 */
	exitExpressionList?: (ctx: ExpressionListContext) => void;

	/**
	 * Enter a parse tree produced by `CashScriptParser.expression`.
	 * @param ctx the parse tree
	 */
	enterExpression?: (ctx: ExpressionContext) => void;
	/**
	 * Exit a parse tree produced by `CashScriptParser.expression`.
	 * @param ctx the parse tree
	 */
	exitExpression?: (ctx: ExpressionContext) => void;

	/**
	 * Enter a parse tree produced by `CashScriptParser.literal`.
	 * @param ctx the parse tree
	 */
	enterLiteral?: (ctx: LiteralContext) => void;
	/**
	 * Exit a parse tree produced by `CashScriptParser.literal`.
	 * @param ctx the parse tree
	 */
	exitLiteral?: (ctx: LiteralContext) => void;

	/**
	 * Enter a parse tree produced by `CashScriptParser.numberLiteral`.
	 * @param ctx the parse tree
	 */
	enterNumberLiteral?: (ctx: NumberLiteralContext) => void;
	/**
	 * Exit a parse tree produced by `CashScriptParser.numberLiteral`.
	 * @param ctx the parse tree
	 */
	exitNumberLiteral?: (ctx: NumberLiteralContext) => void;

	/**
	 * Enter a parse tree produced by `CashScriptParser.typeName`.
	 * @param ctx the parse tree
	 */
	enterTypeName?: (ctx: TypeNameContext) => void;
	/**
	 * Exit a parse tree produced by `CashScriptParser.typeName`.
	 * @param ctx the parse tree
	 */
	exitTypeName?: (ctx: TypeNameContext) => void;
}

