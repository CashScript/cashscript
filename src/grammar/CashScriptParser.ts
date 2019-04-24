// Generated from src/grammar/CashScript.g4 by ANTLR 4.7.3-SNAPSHOT


import { ATN } from "antlr4ts/atn/ATN";
import { ATNDeserializer } from "antlr4ts/atn/ATNDeserializer";
import { FailedPredicateException } from "antlr4ts/FailedPredicateException";
import { NotNull } from "antlr4ts/Decorators";
import { NoViableAltException } from "antlr4ts/NoViableAltException";
import { Override } from "antlr4ts/Decorators";
import { Parser } from "antlr4ts/Parser";
import { ParserRuleContext } from "antlr4ts/ParserRuleContext";
import { ParserATNSimulator } from "antlr4ts/atn/ParserATNSimulator";
import { ParseTreeListener } from "antlr4ts/tree/ParseTreeListener";
import { ParseTreeVisitor } from "antlr4ts/tree/ParseTreeVisitor";
import { RecognitionException } from "antlr4ts/RecognitionException";
import { RuleContext } from "antlr4ts/RuleContext";
//import { RuleVersion } from "antlr4ts/RuleVersion";
import { TerminalNode } from "antlr4ts/tree/TerminalNode";
import { Token } from "antlr4ts/Token";
import { TokenStream } from "antlr4ts/TokenStream";
import { Vocabulary } from "antlr4ts/Vocabulary";
import { VocabularyImpl } from "antlr4ts/VocabularyImpl";

import * as Utils from "antlr4ts/misc/Utils";

import { CashScriptVisitor } from "./CashScriptVisitor";


export class CashScriptParser extends Parser {
	public static readonly T__0 = 1;
	public static readonly T__1 = 2;
	public static readonly T__2 = 3;
	public static readonly T__3 = 4;
	public static readonly T__4 = 5;
	public static readonly T__5 = 6;
	public static readonly T__6 = 7;
	public static readonly T__7 = 8;
	public static readonly T__8 = 9;
	public static readonly T__9 = 10;
	public static readonly T__10 = 11;
	public static readonly T__11 = 12;
	public static readonly T__12 = 13;
	public static readonly T__13 = 14;
	public static readonly T__14 = 15;
	public static readonly T__15 = 16;
	public static readonly T__16 = 17;
	public static readonly T__17 = 18;
	public static readonly T__18 = 19;
	public static readonly T__19 = 20;
	public static readonly T__20 = 21;
	public static readonly T__21 = 22;
	public static readonly T__22 = 23;
	public static readonly T__23 = 24;
	public static readonly T__24 = 25;
	public static readonly T__25 = 26;
	public static readonly T__26 = 27;
	public static readonly T__27 = 28;
	public static readonly T__28 = 29;
	public static readonly T__29 = 30;
	public static readonly T__30 = 31;
	public static readonly T__31 = 32;
	public static readonly T__32 = 33;
	public static readonly T__33 = 34;
	public static readonly T__34 = 35;
	public static readonly T__35 = 36;
	public static readonly T__36 = 37;
	public static readonly T__37 = 38;
	public static readonly T__38 = 39;
	public static readonly T__39 = 40;
	public static readonly Bytes = 41;
	public static readonly BooleanLiteral = 42;
	public static readonly NumberUnit = 43;
	public static readonly NumberLiteral = 44;
	public static readonly StringLiteral = 45;
	public static readonly HexLiteral = 46;
	public static readonly ReservedFunctions = 47;
	public static readonly Identifier = 48;
	public static readonly WHITESPACE = 49;
	public static readonly COMMENT = 50;
	public static readonly LINE_COMMENT = 51;
	public static readonly RULE_sourceFile = 0;
	public static readonly RULE_contractDefinition = 1;
	public static readonly RULE_functionDefinition = 2;
	public static readonly RULE_block = 3;
	public static readonly RULE_statement = 4;
	public static readonly RULE_variableDefinition = 5;
	public static readonly RULE_assignStatement = 6;
	public static readonly RULE_ifStatement = 7;
	public static readonly RULE_returnStatement = 8;
	public static readonly RULE_functionCallStatement = 9;
	public static readonly RULE_functionCall = 10;
	public static readonly RULE_expressionList = 11;
	public static readonly RULE_parameterList = 12;
	public static readonly RULE_parameter = 13;
	public static readonly RULE_expression = 14;
	public static readonly RULE_literal = 15;
	public static readonly RULE_numberLiteral = 16;
	public static readonly RULE_typeName = 17;
	// tslint:disable:no-trailing-whitespace
	public static readonly ruleNames: string[] = [
		"sourceFile", "contractDefinition", "functionDefinition", "block", "statement", 
		"variableDefinition", "assignStatement", "ifStatement", "returnStatement", 
		"functionCallStatement", "functionCall", "expressionList", "parameterList", 
		"parameter", "expression", "literal", "numberLiteral", "typeName",
	];

	private static readonly _LITERAL_NAMES: Array<string | undefined> = [
		undefined, "'contract'", "'{'", "'}'", "'function'", "'='", "';'", "'if'", 
		"'('", "')'", "'else'", "'return'", "','", "'.'", "'++'", "'--'", "'!'", 
		"'~'", "'+'", "'-'", "'/'", "'%'", "'<'", "'<='", "'>'", "'>='", "'=='", 
		"'!='", "'==='", "'!=='", "'&'", "'^'", "'|'", "'&&'", "'||'", "'int'", 
		"'bool'", "'string'", "'address'", "'pubkey'", "'sig'",
	];
	private static readonly _SYMBOLIC_NAMES: Array<string | undefined> = [
		undefined, undefined, undefined, undefined, undefined, undefined, undefined, 
		undefined, undefined, undefined, undefined, undefined, undefined, undefined, 
		undefined, undefined, undefined, undefined, undefined, undefined, undefined, 
		undefined, undefined, undefined, undefined, undefined, undefined, undefined, 
		undefined, undefined, undefined, undefined, undefined, undefined, undefined, 
		undefined, undefined, undefined, undefined, undefined, undefined, "Bytes", 
		"BooleanLiteral", "NumberUnit", "NumberLiteral", "StringLiteral", "HexLiteral", 
		"ReservedFunctions", "Identifier", "WHITESPACE", "COMMENT", "LINE_COMMENT",
	];
	public static readonly VOCABULARY: Vocabulary = new VocabularyImpl(CashScriptParser._LITERAL_NAMES, CashScriptParser._SYMBOLIC_NAMES, []);

	// @Override
	// @NotNull
	public get vocabulary(): Vocabulary {
		return CashScriptParser.VOCABULARY;
	}
	// tslint:enable:no-trailing-whitespace

	// @Override
	public get grammarFileName(): string { return "CashScript.g4"; }

	// @Override
	public get ruleNames(): string[] { return CashScriptParser.ruleNames; }

	// @Override
	public get serializedATN(): string { return CashScriptParser._serializedATN; }

	constructor(input: TokenStream) {
		super(input);
		this._interp = new ParserATNSimulator(CashScriptParser._ATN, this);
	}
	// @RuleVersion(0)
	public sourceFile(): SourceFileContext {
		let _localctx: SourceFileContext = new SourceFileContext(this._ctx, this.state);
		this.enterRule(_localctx, 0, CashScriptParser.RULE_sourceFile);
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 36;
			this.contractDefinition();
			this.state = 37;
			this.match(CashScriptParser.EOF);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public contractDefinition(): ContractDefinitionContext {
		let _localctx: ContractDefinitionContext = new ContractDefinitionContext(this._ctx, this.state);
		this.enterRule(_localctx, 2, CashScriptParser.RULE_contractDefinition);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 39;
			this.match(CashScriptParser.T__0);
			this.state = 40;
			this.match(CashScriptParser.Identifier);
			this.state = 41;
			this.parameterList();
			this.state = 42;
			this.match(CashScriptParser.T__1);
			this.state = 46;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while (((((_la - 35)) & ~0x1F) === 0 && ((1 << (_la - 35)) & ((1 << (CashScriptParser.T__34 - 35)) | (1 << (CashScriptParser.T__35 - 35)) | (1 << (CashScriptParser.T__36 - 35)) | (1 << (CashScriptParser.T__37 - 35)) | (1 << (CashScriptParser.T__38 - 35)) | (1 << (CashScriptParser.T__39 - 35)) | (1 << (CashScriptParser.Bytes - 35)))) !== 0)) {
				{
				{
				this.state = 43;
				this.variableDefinition();
				}
				}
				this.state = 48;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			}
			this.state = 52;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while (_la === CashScriptParser.T__3) {
				{
				{
				this.state = 49;
				this.functionDefinition();
				}
				}
				this.state = 54;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			}
			this.state = 55;
			this.match(CashScriptParser.T__2);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public functionDefinition(): FunctionDefinitionContext {
		let _localctx: FunctionDefinitionContext = new FunctionDefinitionContext(this._ctx, this.state);
		this.enterRule(_localctx, 4, CashScriptParser.RULE_functionDefinition);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 57;
			this.match(CashScriptParser.T__3);
			this.state = 58;
			this.parameterList();
			this.state = 59;
			this.match(CashScriptParser.T__1);
			this.state = 63;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while (_la === CashScriptParser.T__6 || _la === CashScriptParser.T__10 || ((((_la - 35)) & ~0x1F) === 0 && ((1 << (_la - 35)) & ((1 << (CashScriptParser.T__34 - 35)) | (1 << (CashScriptParser.T__35 - 35)) | (1 << (CashScriptParser.T__36 - 35)) | (1 << (CashScriptParser.T__37 - 35)) | (1 << (CashScriptParser.T__38 - 35)) | (1 << (CashScriptParser.T__39 - 35)) | (1 << (CashScriptParser.Bytes - 35)) | (1 << (CashScriptParser.Identifier - 35)))) !== 0)) {
				{
				{
				this.state = 60;
				this.statement();
				}
				}
				this.state = 65;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			}
			this.state = 66;
			this.match(CashScriptParser.T__2);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public block(): BlockContext {
		let _localctx: BlockContext = new BlockContext(this._ctx, this.state);
		this.enterRule(_localctx, 6, CashScriptParser.RULE_block);
		let _la: number;
		try {
			this.state = 77;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case CashScriptParser.T__1:
				this.enterOuterAlt(_localctx, 1);
				{
				this.state = 68;
				this.match(CashScriptParser.T__1);
				this.state = 72;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				while (_la === CashScriptParser.T__6 || _la === CashScriptParser.T__10 || ((((_la - 35)) & ~0x1F) === 0 && ((1 << (_la - 35)) & ((1 << (CashScriptParser.T__34 - 35)) | (1 << (CashScriptParser.T__35 - 35)) | (1 << (CashScriptParser.T__36 - 35)) | (1 << (CashScriptParser.T__37 - 35)) | (1 << (CashScriptParser.T__38 - 35)) | (1 << (CashScriptParser.T__39 - 35)) | (1 << (CashScriptParser.Bytes - 35)) | (1 << (CashScriptParser.Identifier - 35)))) !== 0)) {
					{
					{
					this.state = 69;
					this.statement();
					}
					}
					this.state = 74;
					this._errHandler.sync(this);
					_la = this._input.LA(1);
				}
				this.state = 75;
				this.match(CashScriptParser.T__2);
				}
				break;
			case CashScriptParser.T__6:
			case CashScriptParser.T__10:
			case CashScriptParser.T__34:
			case CashScriptParser.T__35:
			case CashScriptParser.T__36:
			case CashScriptParser.T__37:
			case CashScriptParser.T__38:
			case CashScriptParser.T__39:
			case CashScriptParser.Bytes:
			case CashScriptParser.Identifier:
				this.enterOuterAlt(_localctx, 2);
				{
				this.state = 76;
				this.statement();
				}
				break;
			default:
				throw new NoViableAltException(this);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public statement(): StatementContext {
		let _localctx: StatementContext = new StatementContext(this._ctx, this.state);
		this.enterRule(_localctx, 8, CashScriptParser.RULE_statement);
		try {
			this.state = 84;
			this._errHandler.sync(this);
			switch ( this.interpreter.adaptivePredict(this._input, 5, this._ctx) ) {
			case 1:
				this.enterOuterAlt(_localctx, 1);
				{
				this.state = 79;
				this.variableDefinition();
				}
				break;

			case 2:
				this.enterOuterAlt(_localctx, 2);
				{
				this.state = 80;
				this.assignStatement();
				}
				break;

			case 3:
				this.enterOuterAlt(_localctx, 3);
				{
				this.state = 81;
				this.ifStatement();
				}
				break;

			case 4:
				this.enterOuterAlt(_localctx, 4);
				{
				this.state = 82;
				this.returnStatement();
				}
				break;

			case 5:
				this.enterOuterAlt(_localctx, 5);
				{
				this.state = 83;
				this.functionCallStatement();
				}
				break;
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public variableDefinition(): VariableDefinitionContext {
		let _localctx: VariableDefinitionContext = new VariableDefinitionContext(this._ctx, this.state);
		this.enterRule(_localctx, 10, CashScriptParser.RULE_variableDefinition);
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 86;
			this.typeName();
			this.state = 87;
			this.match(CashScriptParser.Identifier);
			this.state = 88;
			this.match(CashScriptParser.T__4);
			this.state = 89;
			this.expression(0);
			this.state = 90;
			this.match(CashScriptParser.T__5);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public assignStatement(): AssignStatementContext {
		let _localctx: AssignStatementContext = new AssignStatementContext(this._ctx, this.state);
		this.enterRule(_localctx, 12, CashScriptParser.RULE_assignStatement);
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 92;
			this.match(CashScriptParser.Identifier);
			this.state = 93;
			this.match(CashScriptParser.T__4);
			this.state = 94;
			this.expression(0);
			this.state = 95;
			this.match(CashScriptParser.T__5);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public ifStatement(): IfStatementContext {
		let _localctx: IfStatementContext = new IfStatementContext(this._ctx, this.state);
		this.enterRule(_localctx, 14, CashScriptParser.RULE_ifStatement);
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 97;
			this.match(CashScriptParser.T__6);
			this.state = 98;
			this.match(CashScriptParser.T__7);
			this.state = 99;
			this.expression(0);
			this.state = 100;
			this.match(CashScriptParser.T__8);
			this.state = 101;
			this.block();
			this.state = 104;
			this._errHandler.sync(this);
			switch ( this.interpreter.adaptivePredict(this._input, 6, this._ctx) ) {
			case 1:
				{
				this.state = 102;
				this.match(CashScriptParser.T__9);
				this.state = 103;
				this.block();
				}
				break;
			}
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public returnStatement(): ReturnStatementContext {
		let _localctx: ReturnStatementContext = new ReturnStatementContext(this._ctx, this.state);
		this.enterRule(_localctx, 16, CashScriptParser.RULE_returnStatement);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 106;
			this.match(CashScriptParser.T__10);
			this.state = 108;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if ((((_la) & ~0x1F) === 0 && ((1 << _la) & ((1 << CashScriptParser.T__7) | (1 << CashScriptParser.T__13) | (1 << CashScriptParser.T__14) | (1 << CashScriptParser.T__15) | (1 << CashScriptParser.T__16) | (1 << CashScriptParser.T__17) | (1 << CashScriptParser.T__18))) !== 0) || ((((_la - 35)) & ~0x1F) === 0 && ((1 << (_la - 35)) & ((1 << (CashScriptParser.T__34 - 35)) | (1 << (CashScriptParser.T__35 - 35)) | (1 << (CashScriptParser.T__36 - 35)) | (1 << (CashScriptParser.T__37 - 35)) | (1 << (CashScriptParser.T__38 - 35)) | (1 << (CashScriptParser.T__39 - 35)) | (1 << (CashScriptParser.Bytes - 35)) | (1 << (CashScriptParser.BooleanLiteral - 35)) | (1 << (CashScriptParser.NumberLiteral - 35)) | (1 << (CashScriptParser.StringLiteral - 35)) | (1 << (CashScriptParser.HexLiteral - 35)) | (1 << (CashScriptParser.Identifier - 35)))) !== 0)) {
				{
				this.state = 107;
				this.expression(0);
				}
			}

			this.state = 110;
			this.match(CashScriptParser.T__5);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public functionCallStatement(): FunctionCallStatementContext {
		let _localctx: FunctionCallStatementContext = new FunctionCallStatementContext(this._ctx, this.state);
		this.enterRule(_localctx, 18, CashScriptParser.RULE_functionCallStatement);
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 112;
			this.functionCall();
			this.state = 113;
			this.match(CashScriptParser.T__5);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public functionCall(): FunctionCallContext {
		let _localctx: FunctionCallContext = new FunctionCallContext(this._ctx, this.state);
		this.enterRule(_localctx, 20, CashScriptParser.RULE_functionCall);
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 115;
			this.match(CashScriptParser.Identifier);
			this.state = 116;
			this.expressionList();
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public expressionList(): ExpressionListContext {
		let _localctx: ExpressionListContext = new ExpressionListContext(this._ctx, this.state);
		this.enterRule(_localctx, 22, CashScriptParser.RULE_expressionList);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 118;
			this.match(CashScriptParser.T__7);
			this.state = 127;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if ((((_la) & ~0x1F) === 0 && ((1 << _la) & ((1 << CashScriptParser.T__7) | (1 << CashScriptParser.T__13) | (1 << CashScriptParser.T__14) | (1 << CashScriptParser.T__15) | (1 << CashScriptParser.T__16) | (1 << CashScriptParser.T__17) | (1 << CashScriptParser.T__18))) !== 0) || ((((_la - 35)) & ~0x1F) === 0 && ((1 << (_la - 35)) & ((1 << (CashScriptParser.T__34 - 35)) | (1 << (CashScriptParser.T__35 - 35)) | (1 << (CashScriptParser.T__36 - 35)) | (1 << (CashScriptParser.T__37 - 35)) | (1 << (CashScriptParser.T__38 - 35)) | (1 << (CashScriptParser.T__39 - 35)) | (1 << (CashScriptParser.Bytes - 35)) | (1 << (CashScriptParser.BooleanLiteral - 35)) | (1 << (CashScriptParser.NumberLiteral - 35)) | (1 << (CashScriptParser.StringLiteral - 35)) | (1 << (CashScriptParser.HexLiteral - 35)) | (1 << (CashScriptParser.Identifier - 35)))) !== 0)) {
				{
				this.state = 119;
				this.expression(0);
				this.state = 124;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				while (_la === CashScriptParser.T__11) {
					{
					{
					this.state = 120;
					this.match(CashScriptParser.T__11);
					this.state = 121;
					this.expression(0);
					}
					}
					this.state = 126;
					this._errHandler.sync(this);
					_la = this._input.LA(1);
				}
				}
			}

			this.state = 129;
			this.match(CashScriptParser.T__8);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public parameterList(): ParameterListContext {
		let _localctx: ParameterListContext = new ParameterListContext(this._ctx, this.state);
		this.enterRule(_localctx, 24, CashScriptParser.RULE_parameterList);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 131;
			this.match(CashScriptParser.T__7);
			this.state = 140;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (((((_la - 35)) & ~0x1F) === 0 && ((1 << (_la - 35)) & ((1 << (CashScriptParser.T__34 - 35)) | (1 << (CashScriptParser.T__35 - 35)) | (1 << (CashScriptParser.T__36 - 35)) | (1 << (CashScriptParser.T__37 - 35)) | (1 << (CashScriptParser.T__38 - 35)) | (1 << (CashScriptParser.T__39 - 35)) | (1 << (CashScriptParser.Bytes - 35)))) !== 0)) {
				{
				this.state = 132;
				this.parameter();
				this.state = 137;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				while (_la === CashScriptParser.T__11) {
					{
					{
					this.state = 133;
					this.match(CashScriptParser.T__11);
					this.state = 134;
					this.parameter();
					}
					}
					this.state = 139;
					this._errHandler.sync(this);
					_la = this._input.LA(1);
				}
				}
			}

			this.state = 142;
			this.match(CashScriptParser.T__8);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public parameter(): ParameterContext {
		let _localctx: ParameterContext = new ParameterContext(this._ctx, this.state);
		this.enterRule(_localctx, 26, CashScriptParser.RULE_parameter);
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 144;
			this.typeName();
			this.state = 145;
			this.match(CashScriptParser.Identifier);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}

	public expression(): ExpressionContext;
	public expression(_p: number): ExpressionContext;
	// @RuleVersion(0)
	public expression(_p?: number): ExpressionContext {
		if (_p === undefined) {
			_p = 0;
		}

		let _parentctx: ParserRuleContext = this._ctx;
		let _parentState: number = this.state;
		let _localctx: ExpressionContext = new ExpressionContext(this._ctx, _parentState);
		let _prevctx: ExpressionContext = _localctx;
		let _startState: number = 28;
		this.enterRecursionRule(_localctx, 28, CashScriptParser.RULE_expression, _p);
		let _la: number;
		try {
			let _alt: number;
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 161;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case CashScriptParser.T__7:
				{
				this.state = 148;
				this.match(CashScriptParser.T__7);
				this.state = 149;
				this.expression(0);
				this.state = 150;
				this.match(CashScriptParser.T__8);
				}
				break;
			case CashScriptParser.T__34:
			case CashScriptParser.T__35:
			case CashScriptParser.T__36:
			case CashScriptParser.T__37:
			case CashScriptParser.T__38:
			case CashScriptParser.T__39:
			case CashScriptParser.Bytes:
				{
				this.state = 152;
				this.typeName();
				this.state = 153;
				this.match(CashScriptParser.T__7);
				this.state = 154;
				this.expression(0);
				this.state = 155;
				this.match(CashScriptParser.T__8);
				}
				break;
			case CashScriptParser.Identifier:
				{
				this.state = 157;
				this.functionCall();
				}
				break;
			case CashScriptParser.T__13:
			case CashScriptParser.T__14:
			case CashScriptParser.T__15:
			case CashScriptParser.T__16:
			case CashScriptParser.T__17:
			case CashScriptParser.T__18:
				{
				this.state = 158;
				_la = this._input.LA(1);
				if (!((((_la) & ~0x1F) === 0 && ((1 << _la) & ((1 << CashScriptParser.T__13) | (1 << CashScriptParser.T__14) | (1 << CashScriptParser.T__15) | (1 << CashScriptParser.T__16) | (1 << CashScriptParser.T__17) | (1 << CashScriptParser.T__18))) !== 0))) {
				this._errHandler.recoverInline(this);
				} else {
					if (this._input.LA(1) === Token.EOF) {
						this.matchedEOF = true;
					}

					this._errHandler.reportMatch(this);
					this.consume();
				}
				this.state = 159;
				this.expression(11);
				}
				break;
			case CashScriptParser.BooleanLiteral:
			case CashScriptParser.NumberLiteral:
			case CashScriptParser.StringLiteral:
			case CashScriptParser.HexLiteral:
				{
				this.state = 160;
				this.literal();
				}
				break;
			default:
				throw new NoViableAltException(this);
			}
			this._ctx._stop = this._input.tryLT(-1);
			this.state = 200;
			this._errHandler.sync(this);
			_alt = this.interpreter.adaptivePredict(this._input, 14, this._ctx);
			while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
				if (_alt === 1) {
					if (this._parseListeners != null) {
						this.triggerExitRuleEvent();
					}
					_prevctx = _localctx;
					{
					this.state = 198;
					this._errHandler.sync(this);
					switch ( this.interpreter.adaptivePredict(this._input, 13, this._ctx) ) {
					case 1:
						{
						_localctx = new ExpressionContext(_parentctx, _parentState);
						this.pushNewRecursionContext(_localctx, _startState, CashScriptParser.RULE_expression);
						this.state = 163;
						if (!(this.precpred(this._ctx, 10))) {
							throw new FailedPredicateException(this, "this.precpred(this._ctx, 10)");
						}
						this.state = 164;
						_la = this._input.LA(1);
						if (!(_la === CashScriptParser.T__19 || _la === CashScriptParser.T__20)) {
						this._errHandler.recoverInline(this);
						} else {
							if (this._input.LA(1) === Token.EOF) {
								this.matchedEOF = true;
							}

							this._errHandler.reportMatch(this);
							this.consume();
						}
						this.state = 165;
						this.expression(11);
						}
						break;

					case 2:
						{
						_localctx = new ExpressionContext(_parentctx, _parentState);
						this.pushNewRecursionContext(_localctx, _startState, CashScriptParser.RULE_expression);
						this.state = 166;
						if (!(this.precpred(this._ctx, 9))) {
							throw new FailedPredicateException(this, "this.precpred(this._ctx, 9)");
						}
						this.state = 167;
						_la = this._input.LA(1);
						if (!(_la === CashScriptParser.T__17 || _la === CashScriptParser.T__18)) {
						this._errHandler.recoverInline(this);
						} else {
							if (this._input.LA(1) === Token.EOF) {
								this.matchedEOF = true;
							}

							this._errHandler.reportMatch(this);
							this.consume();
						}
						this.state = 168;
						this.expression(10);
						}
						break;

					case 3:
						{
						_localctx = new ExpressionContext(_parentctx, _parentState);
						this.pushNewRecursionContext(_localctx, _startState, CashScriptParser.RULE_expression);
						this.state = 169;
						if (!(this.precpred(this._ctx, 8))) {
							throw new FailedPredicateException(this, "this.precpred(this._ctx, 8)");
						}
						this.state = 170;
						_la = this._input.LA(1);
						if (!((((_la) & ~0x1F) === 0 && ((1 << _la) & ((1 << CashScriptParser.T__21) | (1 << CashScriptParser.T__22) | (1 << CashScriptParser.T__23) | (1 << CashScriptParser.T__24))) !== 0))) {
						this._errHandler.recoverInline(this);
						} else {
							if (this._input.LA(1) === Token.EOF) {
								this.matchedEOF = true;
							}

							this._errHandler.reportMatch(this);
							this.consume();
						}
						this.state = 171;
						this.expression(9);
						}
						break;

					case 4:
						{
						_localctx = new ExpressionContext(_parentctx, _parentState);
						this.pushNewRecursionContext(_localctx, _startState, CashScriptParser.RULE_expression);
						this.state = 172;
						if (!(this.precpred(this._ctx, 7))) {
							throw new FailedPredicateException(this, "this.precpred(this._ctx, 7)");
						}
						this.state = 173;
						_la = this._input.LA(1);
						if (!((((_la) & ~0x1F) === 0 && ((1 << _la) & ((1 << CashScriptParser.T__25) | (1 << CashScriptParser.T__26) | (1 << CashScriptParser.T__27) | (1 << CashScriptParser.T__28))) !== 0))) {
						this._errHandler.recoverInline(this);
						} else {
							if (this._input.LA(1) === Token.EOF) {
								this.matchedEOF = true;
							}

							this._errHandler.reportMatch(this);
							this.consume();
						}
						this.state = 174;
						this.expression(8);
						}
						break;

					case 5:
						{
						_localctx = new ExpressionContext(_parentctx, _parentState);
						this.pushNewRecursionContext(_localctx, _startState, CashScriptParser.RULE_expression);
						this.state = 175;
						if (!(this.precpred(this._ctx, 6))) {
							throw new FailedPredicateException(this, "this.precpred(this._ctx, 6)");
						}
						this.state = 176;
						this.match(CashScriptParser.T__29);
						this.state = 177;
						this.expression(7);
						}
						break;

					case 6:
						{
						_localctx = new ExpressionContext(_parentctx, _parentState);
						this.pushNewRecursionContext(_localctx, _startState, CashScriptParser.RULE_expression);
						this.state = 178;
						if (!(this.precpred(this._ctx, 5))) {
							throw new FailedPredicateException(this, "this.precpred(this._ctx, 5)");
						}
						this.state = 179;
						this.match(CashScriptParser.T__30);
						this.state = 180;
						this.expression(6);
						}
						break;

					case 7:
						{
						_localctx = new ExpressionContext(_parentctx, _parentState);
						this.pushNewRecursionContext(_localctx, _startState, CashScriptParser.RULE_expression);
						this.state = 181;
						if (!(this.precpred(this._ctx, 4))) {
							throw new FailedPredicateException(this, "this.precpred(this._ctx, 4)");
						}
						this.state = 182;
						this.match(CashScriptParser.T__31);
						this.state = 183;
						this.expression(5);
						}
						break;

					case 8:
						{
						_localctx = new ExpressionContext(_parentctx, _parentState);
						this.pushNewRecursionContext(_localctx, _startState, CashScriptParser.RULE_expression);
						this.state = 184;
						if (!(this.precpred(this._ctx, 3))) {
							throw new FailedPredicateException(this, "this.precpred(this._ctx, 3)");
						}
						this.state = 185;
						this.match(CashScriptParser.T__32);
						this.state = 186;
						this.expression(4);
						}
						break;

					case 9:
						{
						_localctx = new ExpressionContext(_parentctx, _parentState);
						this.pushNewRecursionContext(_localctx, _startState, CashScriptParser.RULE_expression);
						this.state = 187;
						if (!(this.precpred(this._ctx, 2))) {
							throw new FailedPredicateException(this, "this.precpred(this._ctx, 2)");
						}
						this.state = 188;
						this.match(CashScriptParser.T__33);
						this.state = 189;
						this.expression(3);
						}
						break;

					case 10:
						{
						_localctx = new ExpressionContext(_parentctx, _parentState);
						this.pushNewRecursionContext(_localctx, _startState, CashScriptParser.RULE_expression);
						this.state = 190;
						if (!(this.precpred(this._ctx, 14))) {
							throw new FailedPredicateException(this, "this.precpred(this._ctx, 14)");
						}
						this.state = 191;
						this.match(CashScriptParser.T__12);
						this.state = 192;
						this.match(CashScriptParser.Identifier);
						}
						break;

					case 11:
						{
						_localctx = new ExpressionContext(_parentctx, _parentState);
						this.pushNewRecursionContext(_localctx, _startState, CashScriptParser.RULE_expression);
						this.state = 193;
						if (!(this.precpred(this._ctx, 13))) {
							throw new FailedPredicateException(this, "this.precpred(this._ctx, 13)");
						}
						this.state = 194;
						this.match(CashScriptParser.T__12);
						this.state = 195;
						this.functionCall();
						}
						break;

					case 12:
						{
						_localctx = new ExpressionContext(_parentctx, _parentState);
						this.pushNewRecursionContext(_localctx, _startState, CashScriptParser.RULE_expression);
						this.state = 196;
						if (!(this.precpred(this._ctx, 12))) {
							throw new FailedPredicateException(this, "this.precpred(this._ctx, 12)");
						}
						this.state = 197;
						_la = this._input.LA(1);
						if (!(_la === CashScriptParser.T__13 || _la === CashScriptParser.T__14)) {
						this._errHandler.recoverInline(this);
						} else {
							if (this._input.LA(1) === Token.EOF) {
								this.matchedEOF = true;
							}

							this._errHandler.reportMatch(this);
							this.consume();
						}
						}
						break;
					}
					}
				}
				this.state = 202;
				this._errHandler.sync(this);
				_alt = this.interpreter.adaptivePredict(this._input, 14, this._ctx);
			}
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.unrollRecursionContexts(_parentctx);
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public literal(): LiteralContext {
		let _localctx: LiteralContext = new LiteralContext(this._ctx, this.state);
		this.enterRule(_localctx, 30, CashScriptParser.RULE_literal);
		try {
			this.state = 207;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case CashScriptParser.BooleanLiteral:
				this.enterOuterAlt(_localctx, 1);
				{
				this.state = 203;
				this.match(CashScriptParser.BooleanLiteral);
				}
				break;
			case CashScriptParser.NumberLiteral:
				this.enterOuterAlt(_localctx, 2);
				{
				this.state = 204;
				this.numberLiteral();
				}
				break;
			case CashScriptParser.StringLiteral:
				this.enterOuterAlt(_localctx, 3);
				{
				this.state = 205;
				this.match(CashScriptParser.StringLiteral);
				}
				break;
			case CashScriptParser.HexLiteral:
				this.enterOuterAlt(_localctx, 4);
				{
				this.state = 206;
				this.match(CashScriptParser.HexLiteral);
				}
				break;
			default:
				throw new NoViableAltException(this);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public numberLiteral(): NumberLiteralContext {
		let _localctx: NumberLiteralContext = new NumberLiteralContext(this._ctx, this.state);
		this.enterRule(_localctx, 32, CashScriptParser.RULE_numberLiteral);
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 209;
			this.match(CashScriptParser.NumberLiteral);
			this.state = 211;
			this._errHandler.sync(this);
			switch ( this.interpreter.adaptivePredict(this._input, 16, this._ctx) ) {
			case 1:
				{
				this.state = 210;
				this.match(CashScriptParser.NumberUnit);
				}
				break;
			}
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public typeName(): TypeNameContext {
		let _localctx: TypeNameContext = new TypeNameContext(this._ctx, this.state);
		this.enterRule(_localctx, 34, CashScriptParser.RULE_typeName);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 213;
			_la = this._input.LA(1);
			if (!(((((_la - 35)) & ~0x1F) === 0 && ((1 << (_la - 35)) & ((1 << (CashScriptParser.T__34 - 35)) | (1 << (CashScriptParser.T__35 - 35)) | (1 << (CashScriptParser.T__36 - 35)) | (1 << (CashScriptParser.T__37 - 35)) | (1 << (CashScriptParser.T__38 - 35)) | (1 << (CashScriptParser.T__39 - 35)) | (1 << (CashScriptParser.Bytes - 35)))) !== 0))) {
			this._errHandler.recoverInline(this);
			} else {
				if (this._input.LA(1) === Token.EOF) {
					this.matchedEOF = true;
				}

				this._errHandler.reportMatch(this);
				this.consume();
			}
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}

	public sempred(_localctx: RuleContext, ruleIndex: number, predIndex: number): boolean {
		switch (ruleIndex) {
		case 14:
			return this.expression_sempred(_localctx as ExpressionContext, predIndex);
		}
		return true;
	}
	private expression_sempred(_localctx: ExpressionContext, predIndex: number): boolean {
		switch (predIndex) {
		case 0:
			return this.precpred(this._ctx, 10);

		case 1:
			return this.precpred(this._ctx, 9);

		case 2:
			return this.precpred(this._ctx, 8);

		case 3:
			return this.precpred(this._ctx, 7);

		case 4:
			return this.precpred(this._ctx, 6);

		case 5:
			return this.precpred(this._ctx, 5);

		case 6:
			return this.precpred(this._ctx, 4);

		case 7:
			return this.precpred(this._ctx, 3);

		case 8:
			return this.precpred(this._ctx, 2);

		case 9:
			return this.precpred(this._ctx, 14);

		case 10:
			return this.precpred(this._ctx, 13);

		case 11:
			return this.precpred(this._ctx, 12);
		}
		return true;
	}

	public static readonly _serializedATN: string =
		"\x03\uC91D\uCABA\u058D\uAFBA\u4F53\u0607\uEA8B\uC241\x035\xDA\x04\x02" +
		"\t\x02\x04\x03\t\x03\x04\x04\t\x04\x04\x05\t\x05\x04\x06\t\x06\x04\x07" +
		"\t\x07\x04\b\t\b\x04\t\t\t\x04\n\t\n\x04\v\t\v\x04\f\t\f\x04\r\t\r\x04" +
		"\x0E\t\x0E\x04\x0F\t\x0F\x04\x10\t\x10\x04\x11\t\x11\x04\x12\t\x12\x04" +
		"\x13\t\x13\x03\x02\x03\x02\x03\x02\x03\x03\x03\x03\x03\x03\x03\x03\x03" +
		"\x03\x07\x03/\n\x03\f\x03\x0E\x032\v\x03\x03\x03\x07\x035\n\x03\f\x03" +
		"\x0E\x038\v\x03\x03\x03\x03\x03\x03\x04\x03\x04\x03\x04\x03\x04\x07\x04" +
		"@\n\x04\f\x04\x0E\x04C\v\x04\x03\x04\x03\x04\x03\x05\x03\x05\x07\x05I" +
		"\n\x05\f\x05\x0E\x05L\v\x05\x03\x05\x03\x05\x05\x05P\n\x05\x03\x06\x03" +
		"\x06\x03\x06\x03\x06\x03\x06\x05\x06W\n\x06\x03\x07\x03\x07\x03\x07\x03" +
		"\x07\x03\x07\x03\x07\x03\b\x03\b\x03\b\x03\b\x03\b\x03\t\x03\t\x03\t\x03" +
		"\t\x03\t\x03\t\x03\t\x05\tk\n\t\x03\n\x03\n\x05\no\n\n\x03\n\x03\n\x03" +
		"\v\x03\v\x03\v\x03\f\x03\f\x03\f\x03\r\x03\r\x03\r\x03\r\x07\r}\n\r\f" +
		"\r\x0E\r\x80\v\r\x05\r\x82\n\r\x03\r\x03\r\x03\x0E\x03\x0E\x03\x0E\x03" +
		"\x0E\x07\x0E\x8A\n\x0E\f\x0E\x0E\x0E\x8D\v\x0E\x05\x0E\x8F\n\x0E\x03\x0E" +
		"\x03\x0E\x03\x0F\x03\x0F\x03\x0F\x03\x10\x03\x10\x03\x10\x03\x10\x03\x10" +
		"\x03\x10\x03\x10\x03\x10\x03\x10\x03\x10\x03\x10\x03\x10\x03\x10\x03\x10" +
		"\x05\x10\xA4\n\x10\x03\x10\x03\x10\x03\x10\x03\x10\x03\x10\x03\x10\x03" +
		"\x10\x03\x10\x03\x10\x03\x10\x03\x10\x03\x10\x03\x10\x03\x10\x03\x10\x03" +
		"\x10\x03\x10\x03\x10\x03\x10\x03\x10\x03\x10\x03\x10\x03\x10\x03\x10\x03" +
		"\x10\x03\x10\x03\x10\x03\x10\x03\x10\x03\x10\x03\x10\x03\x10\x03\x10\x03" +
		"\x10\x03\x10\x07\x10\xC9\n\x10\f\x10\x0E\x10\xCC\v\x10\x03\x11\x03\x11" +
		"\x03\x11\x03\x11\x05\x11\xD2\n\x11\x03\x12\x03\x12\x05\x12\xD6\n\x12\x03" +
		"\x13\x03\x13\x03\x13\x02\x02\x03\x1E\x14\x02\x02\x04\x02\x06\x02\b\x02" +
		"\n\x02\f\x02\x0E\x02\x10\x02\x12\x02\x14\x02\x16\x02\x18\x02\x1A\x02\x1C" +
		"\x02\x1E\x02 \x02\"\x02$\x02\x02\t\x03\x02\x10\x15\x03\x02\x16\x17\x03" +
		"\x02\x14\x15\x03\x02\x18\x1B\x03\x02\x1C\x1F\x03\x02\x10\x11\x03\x02%" +
		"+\x02\xEA\x02&\x03\x02\x02\x02\x04)\x03\x02\x02\x02\x06;\x03\x02\x02\x02" +
		"\bO\x03\x02\x02\x02\nV\x03\x02\x02\x02\fX\x03\x02\x02\x02\x0E^\x03\x02" +
		"\x02\x02\x10c\x03\x02\x02\x02\x12l\x03\x02\x02\x02\x14r\x03\x02\x02\x02" +
		"\x16u\x03\x02\x02\x02\x18x\x03\x02\x02\x02\x1A\x85\x03\x02\x02\x02\x1C" +
		"\x92\x03\x02\x02\x02\x1E\xA3\x03\x02\x02\x02 \xD1\x03\x02\x02\x02\"\xD3" +
		"\x03\x02\x02\x02$\xD7\x03\x02\x02\x02&\'\x05\x04\x03\x02\'(\x07\x02\x02" +
		"\x03(\x03\x03\x02\x02\x02)*\x07\x03\x02\x02*+\x072\x02\x02+,\x05\x1A\x0E" +
		"\x02,0\x07\x04\x02\x02-/\x05\f\x07\x02.-\x03\x02\x02\x02/2\x03\x02\x02" +
		"\x020.\x03\x02\x02\x0201\x03\x02\x02\x0216\x03\x02\x02\x0220\x03\x02\x02" +
		"\x0235\x05\x06\x04\x0243\x03\x02\x02\x0258\x03\x02\x02\x0264\x03\x02\x02" +
		"\x0267\x03\x02\x02\x0279\x03\x02\x02\x0286\x03\x02\x02\x029:\x07\x05\x02" +
		"\x02:\x05\x03\x02\x02\x02;<\x07\x06\x02\x02<=\x05\x1A\x0E\x02=A\x07\x04" +
		"\x02\x02>@\x05\n\x06\x02?>\x03\x02\x02\x02@C\x03\x02\x02\x02A?\x03\x02" +
		"\x02\x02AB\x03\x02\x02\x02BD\x03\x02\x02\x02CA\x03\x02\x02\x02DE\x07\x05" +
		"\x02\x02E\x07\x03\x02\x02\x02FJ\x07\x04\x02\x02GI\x05\n\x06\x02HG\x03" +
		"\x02\x02\x02IL\x03\x02\x02\x02JH\x03\x02\x02\x02JK\x03\x02\x02\x02KM\x03" +
		"\x02\x02\x02LJ\x03\x02\x02\x02MP\x07\x05\x02\x02NP\x05\n\x06\x02OF\x03" +
		"\x02\x02\x02ON\x03\x02\x02\x02P\t\x03\x02\x02\x02QW\x05\f\x07\x02RW\x05" +
		"\x0E\b\x02SW\x05\x10\t\x02TW\x05\x12\n\x02UW\x05\x14\v\x02VQ\x03\x02\x02" +
		"\x02VR\x03\x02\x02\x02VS\x03\x02\x02\x02VT\x03\x02\x02\x02VU\x03\x02\x02" +
		"\x02W\v\x03\x02\x02\x02XY\x05$\x13\x02YZ\x072\x02\x02Z[\x07\x07\x02\x02" +
		"[\\\x05\x1E\x10\x02\\]\x07\b\x02\x02]\r\x03\x02\x02\x02^_\x072\x02\x02" +
		"_`\x07\x07\x02\x02`a\x05\x1E\x10\x02ab\x07\b\x02\x02b\x0F\x03\x02\x02" +
		"\x02cd\x07\t\x02\x02de\x07\n\x02\x02ef\x05\x1E\x10\x02fg\x07\v\x02\x02" +
		"gj\x05\b\x05\x02hi\x07\f\x02\x02ik\x05\b\x05\x02jh\x03\x02\x02\x02jk\x03" +
		"\x02\x02\x02k\x11\x03\x02\x02\x02ln\x07\r\x02\x02mo\x05\x1E\x10\x02nm" +
		"\x03\x02\x02\x02no\x03\x02\x02\x02op\x03\x02\x02\x02pq\x07\b\x02\x02q" +
		"\x13\x03\x02\x02\x02rs\x05\x16\f\x02st\x07\b\x02\x02t\x15\x03\x02\x02" +
		"\x02uv\x072\x02\x02vw\x05\x18\r\x02w\x17\x03\x02\x02\x02x\x81\x07\n\x02" +
		"\x02y~\x05\x1E\x10\x02z{\x07\x0E\x02\x02{}\x05\x1E\x10\x02|z\x03\x02\x02" +
		"\x02}\x80\x03\x02\x02\x02~|\x03\x02\x02\x02~\x7F\x03\x02\x02\x02\x7F\x82" +
		"\x03\x02\x02\x02\x80~\x03\x02\x02\x02\x81y\x03\x02\x02\x02\x81\x82\x03" +
		"\x02\x02\x02\x82\x83\x03\x02\x02\x02\x83\x84\x07\v\x02\x02\x84\x19\x03" +
		"\x02\x02\x02\x85\x8E\x07\n\x02\x02\x86\x8B\x05\x1C\x0F\x02\x87\x88\x07" +
		"\x0E\x02\x02\x88\x8A\x05\x1C\x0F\x02\x89\x87\x03\x02\x02\x02\x8A\x8D\x03" +
		"\x02\x02\x02\x8B\x89\x03\x02\x02\x02\x8B\x8C\x03\x02\x02\x02\x8C\x8F\x03" +
		"\x02\x02\x02\x8D\x8B\x03\x02\x02\x02\x8E\x86\x03\x02\x02\x02\x8E\x8F\x03" +
		"\x02\x02\x02\x8F\x90\x03\x02\x02\x02\x90\x91\x07\v\x02\x02\x91\x1B\x03" +
		"\x02\x02\x02\x92\x93\x05$\x13\x02\x93\x94\x072\x02\x02\x94\x1D\x03\x02" +
		"\x02\x02\x95\x96\b\x10\x01\x02\x96\x97\x07\n\x02\x02\x97\x98\x05\x1E\x10" +
		"\x02\x98\x99\x07\v\x02\x02\x99\xA4\x03\x02\x02\x02\x9A\x9B\x05$\x13\x02" +
		"\x9B\x9C\x07\n\x02\x02\x9C\x9D\x05\x1E\x10\x02\x9D\x9E\x07\v\x02\x02\x9E" +
		"\xA4\x03\x02\x02\x02\x9F\xA4\x05\x16\f\x02\xA0\xA1\t\x02\x02\x02\xA1\xA4" +
		"\x05\x1E\x10\r\xA2\xA4\x05 \x11\x02\xA3\x95\x03\x02\x02\x02\xA3\x9A\x03" +
		"\x02\x02\x02\xA3\x9F\x03\x02\x02\x02\xA3\xA0\x03\x02\x02\x02\xA3\xA2\x03" +
		"\x02\x02\x02\xA4\xCA\x03\x02\x02\x02\xA5\xA6\f\f\x02\x02\xA6\xA7\t\x03" +
		"\x02\x02\xA7\xC9\x05\x1E\x10\r\xA8\xA9\f\v\x02\x02\xA9\xAA\t\x04\x02\x02" +
		"\xAA\xC9\x05\x1E\x10\f\xAB\xAC\f\n\x02\x02\xAC\xAD\t\x05\x02\x02\xAD\xC9" +
		"\x05\x1E\x10\v\xAE\xAF\f\t\x02\x02\xAF\xB0\t\x06\x02\x02\xB0\xC9\x05\x1E" +
		"\x10\n\xB1\xB2\f\b\x02\x02\xB2\xB3\x07 \x02\x02\xB3\xC9\x05\x1E\x10\t" +
		"\xB4\xB5\f\x07\x02\x02\xB5\xB6\x07!\x02\x02\xB6\xC9\x05\x1E\x10\b\xB7" +
		"\xB8\f\x06\x02\x02\xB8\xB9\x07\"\x02\x02\xB9\xC9\x05\x1E\x10\x07\xBA\xBB" +
		"\f\x05\x02\x02\xBB\xBC\x07#\x02\x02\xBC\xC9\x05\x1E\x10\x06\xBD\xBE\f" +
		"\x04\x02\x02\xBE\xBF\x07$\x02\x02\xBF\xC9\x05\x1E\x10\x05\xC0\xC1\f\x10" +
		"\x02\x02\xC1\xC2\x07\x0F\x02\x02\xC2\xC9\x072\x02\x02\xC3\xC4\f\x0F\x02" +
		"\x02\xC4\xC5\x07\x0F\x02\x02\xC5\xC9\x05\x16\f\x02\xC6\xC7\f\x0E\x02\x02" +
		"\xC7\xC9\t\x07\x02\x02\xC8\xA5\x03\x02\x02\x02\xC8\xA8\x03\x02\x02\x02" +
		"\xC8\xAB\x03\x02\x02\x02\xC8\xAE\x03\x02\x02\x02\xC8\xB1\x03\x02\x02\x02" +
		"\xC8\xB4\x03\x02\x02\x02\xC8\xB7\x03\x02\x02\x02\xC8\xBA\x03\x02\x02\x02" +
		"\xC8\xBD\x03\x02\x02\x02\xC8\xC0\x03\x02\x02\x02\xC8\xC3\x03\x02\x02\x02" +
		"\xC8\xC6\x03\x02\x02\x02\xC9\xCC\x03\x02\x02\x02\xCA\xC8\x03\x02\x02\x02" +
		"\xCA\xCB\x03\x02\x02\x02\xCB\x1F\x03\x02\x02\x02\xCC\xCA\x03\x02\x02\x02" +
		"\xCD\xD2\x07,\x02\x02\xCE\xD2\x05\"\x12\x02\xCF\xD2\x07/\x02\x02\xD0\xD2" +
		"\x070\x02\x02\xD1\xCD\x03\x02\x02\x02\xD1\xCE\x03\x02\x02\x02\xD1\xCF" +
		"\x03\x02\x02\x02\xD1\xD0\x03\x02\x02\x02\xD2!\x03\x02\x02\x02\xD3\xD5" +
		"\x07.\x02\x02\xD4\xD6\x07-\x02\x02\xD5\xD4\x03\x02\x02\x02\xD5\xD6\x03" +
		"\x02\x02\x02\xD6#\x03\x02\x02\x02\xD7\xD8\t\b\x02\x02\xD8%\x03\x02\x02" +
		"\x02\x1306AJOVjn~\x81\x8B\x8E\xA3\xC8\xCA\xD1\xD5";
	public static __ATN: ATN;
	public static get _ATN(): ATN {
		if (!CashScriptParser.__ATN) {
			CashScriptParser.__ATN = new ATNDeserializer().deserialize(Utils.toCharArray(CashScriptParser._serializedATN));
		}

		return CashScriptParser.__ATN;
	}

}

export class SourceFileContext extends ParserRuleContext {
	public contractDefinition(): ContractDefinitionContext {
		return this.getRuleContext(0, ContractDefinitionContext);
	}
	public EOF(): TerminalNode { return this.getToken(CashScriptParser.EOF, 0); }
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return CashScriptParser.RULE_sourceFile; }
	// @Override
	public accept<Result>(visitor: CashScriptVisitor<Result>): Result {
		if (visitor.visitSourceFile) {
			return visitor.visitSourceFile(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class ContractDefinitionContext extends ParserRuleContext {
	public Identifier(): TerminalNode { return this.getToken(CashScriptParser.Identifier, 0); }
	public parameterList(): ParameterListContext {
		return this.getRuleContext(0, ParameterListContext);
	}
	public variableDefinition(): VariableDefinitionContext[];
	public variableDefinition(i: number): VariableDefinitionContext;
	public variableDefinition(i?: number): VariableDefinitionContext | VariableDefinitionContext[] {
		if (i === undefined) {
			return this.getRuleContexts(VariableDefinitionContext);
		} else {
			return this.getRuleContext(i, VariableDefinitionContext);
		}
	}
	public functionDefinition(): FunctionDefinitionContext[];
	public functionDefinition(i: number): FunctionDefinitionContext;
	public functionDefinition(i?: number): FunctionDefinitionContext | FunctionDefinitionContext[] {
		if (i === undefined) {
			return this.getRuleContexts(FunctionDefinitionContext);
		} else {
			return this.getRuleContext(i, FunctionDefinitionContext);
		}
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return CashScriptParser.RULE_contractDefinition; }
	// @Override
	public accept<Result>(visitor: CashScriptVisitor<Result>): Result {
		if (visitor.visitContractDefinition) {
			return visitor.visitContractDefinition(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class FunctionDefinitionContext extends ParserRuleContext {
	public parameterList(): ParameterListContext {
		return this.getRuleContext(0, ParameterListContext);
	}
	public statement(): StatementContext[];
	public statement(i: number): StatementContext;
	public statement(i?: number): StatementContext | StatementContext[] {
		if (i === undefined) {
			return this.getRuleContexts(StatementContext);
		} else {
			return this.getRuleContext(i, StatementContext);
		}
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return CashScriptParser.RULE_functionDefinition; }
	// @Override
	public accept<Result>(visitor: CashScriptVisitor<Result>): Result {
		if (visitor.visitFunctionDefinition) {
			return visitor.visitFunctionDefinition(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class BlockContext extends ParserRuleContext {
	public statement(): StatementContext[];
	public statement(i: number): StatementContext;
	public statement(i?: number): StatementContext | StatementContext[] {
		if (i === undefined) {
			return this.getRuleContexts(StatementContext);
		} else {
			return this.getRuleContext(i, StatementContext);
		}
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return CashScriptParser.RULE_block; }
	// @Override
	public accept<Result>(visitor: CashScriptVisitor<Result>): Result {
		if (visitor.visitBlock) {
			return visitor.visitBlock(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class StatementContext extends ParserRuleContext {
	public variableDefinition(): VariableDefinitionContext | undefined {
		return this.tryGetRuleContext(0, VariableDefinitionContext);
	}
	public assignStatement(): AssignStatementContext | undefined {
		return this.tryGetRuleContext(0, AssignStatementContext);
	}
	public ifStatement(): IfStatementContext | undefined {
		return this.tryGetRuleContext(0, IfStatementContext);
	}
	public returnStatement(): ReturnStatementContext | undefined {
		return this.tryGetRuleContext(0, ReturnStatementContext);
	}
	public functionCallStatement(): FunctionCallStatementContext | undefined {
		return this.tryGetRuleContext(0, FunctionCallStatementContext);
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return CashScriptParser.RULE_statement; }
	// @Override
	public accept<Result>(visitor: CashScriptVisitor<Result>): Result {
		if (visitor.visitStatement) {
			return visitor.visitStatement(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class VariableDefinitionContext extends ParserRuleContext {
	public typeName(): TypeNameContext {
		return this.getRuleContext(0, TypeNameContext);
	}
	public Identifier(): TerminalNode { return this.getToken(CashScriptParser.Identifier, 0); }
	public expression(): ExpressionContext {
		return this.getRuleContext(0, ExpressionContext);
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return CashScriptParser.RULE_variableDefinition; }
	// @Override
	public accept<Result>(visitor: CashScriptVisitor<Result>): Result {
		if (visitor.visitVariableDefinition) {
			return visitor.visitVariableDefinition(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class AssignStatementContext extends ParserRuleContext {
	public Identifier(): TerminalNode { return this.getToken(CashScriptParser.Identifier, 0); }
	public expression(): ExpressionContext {
		return this.getRuleContext(0, ExpressionContext);
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return CashScriptParser.RULE_assignStatement; }
	// @Override
	public accept<Result>(visitor: CashScriptVisitor<Result>): Result {
		if (visitor.visitAssignStatement) {
			return visitor.visitAssignStatement(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class IfStatementContext extends ParserRuleContext {
	public expression(): ExpressionContext {
		return this.getRuleContext(0, ExpressionContext);
	}
	public block(): BlockContext[];
	public block(i: number): BlockContext;
	public block(i?: number): BlockContext | BlockContext[] {
		if (i === undefined) {
			return this.getRuleContexts(BlockContext);
		} else {
			return this.getRuleContext(i, BlockContext);
		}
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return CashScriptParser.RULE_ifStatement; }
	// @Override
	public accept<Result>(visitor: CashScriptVisitor<Result>): Result {
		if (visitor.visitIfStatement) {
			return visitor.visitIfStatement(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class ReturnStatementContext extends ParserRuleContext {
	public expression(): ExpressionContext | undefined {
		return this.tryGetRuleContext(0, ExpressionContext);
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return CashScriptParser.RULE_returnStatement; }
	// @Override
	public accept<Result>(visitor: CashScriptVisitor<Result>): Result {
		if (visitor.visitReturnStatement) {
			return visitor.visitReturnStatement(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class FunctionCallStatementContext extends ParserRuleContext {
	public functionCall(): FunctionCallContext {
		return this.getRuleContext(0, FunctionCallContext);
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return CashScriptParser.RULE_functionCallStatement; }
	// @Override
	public accept<Result>(visitor: CashScriptVisitor<Result>): Result {
		if (visitor.visitFunctionCallStatement) {
			return visitor.visitFunctionCallStatement(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class FunctionCallContext extends ParserRuleContext {
	public Identifier(): TerminalNode { return this.getToken(CashScriptParser.Identifier, 0); }
	public expressionList(): ExpressionListContext {
		return this.getRuleContext(0, ExpressionListContext);
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return CashScriptParser.RULE_functionCall; }
	// @Override
	public accept<Result>(visitor: CashScriptVisitor<Result>): Result {
		if (visitor.visitFunctionCall) {
			return visitor.visitFunctionCall(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class ExpressionListContext extends ParserRuleContext {
	public expression(): ExpressionContext[];
	public expression(i: number): ExpressionContext;
	public expression(i?: number): ExpressionContext | ExpressionContext[] {
		if (i === undefined) {
			return this.getRuleContexts(ExpressionContext);
		} else {
			return this.getRuleContext(i, ExpressionContext);
		}
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return CashScriptParser.RULE_expressionList; }
	// @Override
	public accept<Result>(visitor: CashScriptVisitor<Result>): Result {
		if (visitor.visitExpressionList) {
			return visitor.visitExpressionList(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class ParameterListContext extends ParserRuleContext {
	public parameter(): ParameterContext[];
	public parameter(i: number): ParameterContext;
	public parameter(i?: number): ParameterContext | ParameterContext[] {
		if (i === undefined) {
			return this.getRuleContexts(ParameterContext);
		} else {
			return this.getRuleContext(i, ParameterContext);
		}
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return CashScriptParser.RULE_parameterList; }
	// @Override
	public accept<Result>(visitor: CashScriptVisitor<Result>): Result {
		if (visitor.visitParameterList) {
			return visitor.visitParameterList(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class ParameterContext extends ParserRuleContext {
	public typeName(): TypeNameContext {
		return this.getRuleContext(0, TypeNameContext);
	}
	public Identifier(): TerminalNode { return this.getToken(CashScriptParser.Identifier, 0); }
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return CashScriptParser.RULE_parameter; }
	// @Override
	public accept<Result>(visitor: CashScriptVisitor<Result>): Result {
		if (visitor.visitParameter) {
			return visitor.visitParameter(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class ExpressionContext extends ParserRuleContext {
	public expression(): ExpressionContext[];
	public expression(i: number): ExpressionContext;
	public expression(i?: number): ExpressionContext | ExpressionContext[] {
		if (i === undefined) {
			return this.getRuleContexts(ExpressionContext);
		} else {
			return this.getRuleContext(i, ExpressionContext);
		}
	}
	public typeName(): TypeNameContext | undefined {
		return this.tryGetRuleContext(0, TypeNameContext);
	}
	public functionCall(): FunctionCallContext | undefined {
		return this.tryGetRuleContext(0, FunctionCallContext);
	}
	public Identifier(): TerminalNode | undefined { return this.tryGetToken(CashScriptParser.Identifier, 0); }
	public literal(): LiteralContext | undefined {
		return this.tryGetRuleContext(0, LiteralContext);
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return CashScriptParser.RULE_expression; }
	// @Override
	public accept<Result>(visitor: CashScriptVisitor<Result>): Result {
		if (visitor.visitExpression) {
			return visitor.visitExpression(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class LiteralContext extends ParserRuleContext {
	public BooleanLiteral(): TerminalNode | undefined { return this.tryGetToken(CashScriptParser.BooleanLiteral, 0); }
	public numberLiteral(): NumberLiteralContext | undefined {
		return this.tryGetRuleContext(0, NumberLiteralContext);
	}
	public StringLiteral(): TerminalNode | undefined { return this.tryGetToken(CashScriptParser.StringLiteral, 0); }
	public HexLiteral(): TerminalNode | undefined { return this.tryGetToken(CashScriptParser.HexLiteral, 0); }
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return CashScriptParser.RULE_literal; }
	// @Override
	public accept<Result>(visitor: CashScriptVisitor<Result>): Result {
		if (visitor.visitLiteral) {
			return visitor.visitLiteral(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class NumberLiteralContext extends ParserRuleContext {
	public NumberLiteral(): TerminalNode { return this.getToken(CashScriptParser.NumberLiteral, 0); }
	public NumberUnit(): TerminalNode | undefined { return this.tryGetToken(CashScriptParser.NumberUnit, 0); }
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return CashScriptParser.RULE_numberLiteral; }
	// @Override
	public accept<Result>(visitor: CashScriptVisitor<Result>): Result {
		if (visitor.visitNumberLiteral) {
			return visitor.visitNumberLiteral(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class TypeNameContext extends ParserRuleContext {
	public Bytes(): TerminalNode { return this.getToken(CashScriptParser.Bytes, 0); }
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return CashScriptParser.RULE_typeName; }
	// @Override
	public accept<Result>(visitor: CashScriptVisitor<Result>): Result {
		if (visitor.visitTypeName) {
			return visitor.visitTypeName(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


