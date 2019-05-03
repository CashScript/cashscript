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

import { CashScriptListener } from "./CashScriptListener";
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
	public static readonly Bytes = 33;
	public static readonly BooleanLiteral = 34;
	public static readonly NumberUnit = 35;
	public static readonly NumberLiteral = 36;
	public static readonly StringLiteral = 37;
	public static readonly HexLiteral = 38;
	public static readonly TxVar = 39;
	public static readonly Require = 40;
	public static readonly Identifier = 41;
	public static readonly WHITESPACE = 42;
	public static readonly COMMENT = 43;
	public static readonly LINE_COMMENT = 44;
	public static readonly RULE_sourceFile = 0;
	public static readonly RULE_contractDefinition = 1;
	public static readonly RULE_functionDefinition = 2;
	public static readonly RULE_parameterList = 3;
	public static readonly RULE_parameter = 4;
	public static readonly RULE_block = 5;
	public static readonly RULE_statement = 6;
	public static readonly RULE_variableDefinition = 7;
	public static readonly RULE_assignStatement = 8;
	public static readonly RULE_throwStatement = 9;
	public static readonly RULE_timeOpStatement = 10;
	public static readonly RULE_functionCallStatement = 11;
	public static readonly RULE_ifStatement = 12;
	public static readonly RULE_cast = 13;
	public static readonly RULE_functionCall = 14;
	public static readonly RULE_expressionList = 15;
	public static readonly RULE_expression = 16;
	public static readonly RULE_literal = 17;
	public static readonly RULE_numberLiteral = 18;
	public static readonly RULE_typeName = 19;
	// tslint:disable:no-trailing-whitespace
	public static readonly ruleNames: string[] = [
		"sourceFile", "contractDefinition", "functionDefinition", "parameterList", 
		"parameter", "block", "statement", "variableDefinition", "assignStatement", 
		"throwStatement", "timeOpStatement", "functionCallStatement", "ifStatement", 
		"cast", "functionCall", "expressionList", "expression", "literal", "numberLiteral", 
		"typeName",
	];

	private static readonly _LITERAL_NAMES: Array<string | undefined> = [
		undefined, "'contract'", "'{'", "'}'", "'function'", "'('", "','", "')'", 
		"'='", "';'", "'throw'", "'>='", "'if'", "'else'", "'.length'", "'.splice'", 
		"'!'", "'+'", "'-'", "'/'", "'%'", "'<'", "'<='", "'>'", "'=='", "'!='", 
		"'&&'", "'||'", "'int'", "'bool'", "'string'", "'pubkey'", "'sig'", undefined, 
		undefined, undefined, undefined, undefined, undefined, undefined, "'require'",
	];
	private static readonly _SYMBOLIC_NAMES: Array<string | undefined> = [
		undefined, undefined, undefined, undefined, undefined, undefined, undefined, 
		undefined, undefined, undefined, undefined, undefined, undefined, undefined, 
		undefined, undefined, undefined, undefined, undefined, undefined, undefined, 
		undefined, undefined, undefined, undefined, undefined, undefined, undefined, 
		undefined, undefined, undefined, undefined, undefined, "Bytes", "BooleanLiteral", 
		"NumberUnit", "NumberLiteral", "StringLiteral", "HexLiteral", "TxVar", 
		"Require", "Identifier", "WHITESPACE", "COMMENT", "LINE_COMMENT",
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
			this.state = 40;
			this.contractDefinition();
			this.state = 41;
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
			this.state = 43;
			this.match(CashScriptParser.T__0);
			this.state = 44;
			this.match(CashScriptParser.Identifier);
			this.state = 45;
			this.parameterList();
			this.state = 46;
			this.match(CashScriptParser.T__1);
			this.state = 50;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while (((((_la - 28)) & ~0x1F) === 0 && ((1 << (_la - 28)) & ((1 << (CashScriptParser.T__27 - 28)) | (1 << (CashScriptParser.T__28 - 28)) | (1 << (CashScriptParser.T__29 - 28)) | (1 << (CashScriptParser.T__30 - 28)) | (1 << (CashScriptParser.T__31 - 28)) | (1 << (CashScriptParser.Bytes - 28)))) !== 0)) {
				{
				{
				this.state = 47;
				this.variableDefinition();
				}
				}
				this.state = 52;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			}
			this.state = 56;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while (_la === CashScriptParser.T__3) {
				{
				{
				this.state = 53;
				this.functionDefinition();
				}
				}
				this.state = 58;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			}
			this.state = 59;
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
			this.state = 61;
			this.match(CashScriptParser.T__3);
			this.state = 62;
			this.match(CashScriptParser.Identifier);
			this.state = 63;
			this.parameterList();
			this.state = 64;
			this.match(CashScriptParser.T__1);
			this.state = 68;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while (((((_la - 10)) & ~0x1F) === 0 && ((1 << (_la - 10)) & ((1 << (CashScriptParser.T__9 - 10)) | (1 << (CashScriptParser.T__11 - 10)) | (1 << (CashScriptParser.T__27 - 10)) | (1 << (CashScriptParser.T__28 - 10)) | (1 << (CashScriptParser.T__29 - 10)) | (1 << (CashScriptParser.T__30 - 10)) | (1 << (CashScriptParser.T__31 - 10)) | (1 << (CashScriptParser.Bytes - 10)) | (1 << (CashScriptParser.Require - 10)) | (1 << (CashScriptParser.Identifier - 10)))) !== 0)) {
				{
				{
				this.state = 65;
				this.statement();
				}
				}
				this.state = 70;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			}
			this.state = 71;
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
	public parameterList(): ParameterListContext {
		let _localctx: ParameterListContext = new ParameterListContext(this._ctx, this.state);
		this.enterRule(_localctx, 6, CashScriptParser.RULE_parameterList);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 73;
			this.match(CashScriptParser.T__4);
			this.state = 82;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (((((_la - 28)) & ~0x1F) === 0 && ((1 << (_la - 28)) & ((1 << (CashScriptParser.T__27 - 28)) | (1 << (CashScriptParser.T__28 - 28)) | (1 << (CashScriptParser.T__29 - 28)) | (1 << (CashScriptParser.T__30 - 28)) | (1 << (CashScriptParser.T__31 - 28)) | (1 << (CashScriptParser.Bytes - 28)))) !== 0)) {
				{
				this.state = 74;
				this.parameter();
				this.state = 79;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				while (_la === CashScriptParser.T__5) {
					{
					{
					this.state = 75;
					this.match(CashScriptParser.T__5);
					this.state = 76;
					this.parameter();
					}
					}
					this.state = 81;
					this._errHandler.sync(this);
					_la = this._input.LA(1);
				}
				}
			}

			this.state = 84;
			this.match(CashScriptParser.T__6);
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
		this.enterRule(_localctx, 8, CashScriptParser.RULE_parameter);
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 86;
			this.typeName();
			this.state = 87;
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
	// @RuleVersion(0)
	public block(): BlockContext {
		let _localctx: BlockContext = new BlockContext(this._ctx, this.state);
		this.enterRule(_localctx, 10, CashScriptParser.RULE_block);
		let _la: number;
		try {
			this.state = 98;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case CashScriptParser.T__1:
				this.enterOuterAlt(_localctx, 1);
				{
				this.state = 89;
				this.match(CashScriptParser.T__1);
				this.state = 93;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				while (((((_la - 10)) & ~0x1F) === 0 && ((1 << (_la - 10)) & ((1 << (CashScriptParser.T__9 - 10)) | (1 << (CashScriptParser.T__11 - 10)) | (1 << (CashScriptParser.T__27 - 10)) | (1 << (CashScriptParser.T__28 - 10)) | (1 << (CashScriptParser.T__29 - 10)) | (1 << (CashScriptParser.T__30 - 10)) | (1 << (CashScriptParser.T__31 - 10)) | (1 << (CashScriptParser.Bytes - 10)) | (1 << (CashScriptParser.Require - 10)) | (1 << (CashScriptParser.Identifier - 10)))) !== 0)) {
					{
					{
					this.state = 90;
					this.statement();
					}
					}
					this.state = 95;
					this._errHandler.sync(this);
					_la = this._input.LA(1);
				}
				this.state = 96;
				this.match(CashScriptParser.T__2);
				}
				break;
			case CashScriptParser.T__9:
			case CashScriptParser.T__11:
			case CashScriptParser.T__27:
			case CashScriptParser.T__28:
			case CashScriptParser.T__29:
			case CashScriptParser.T__30:
			case CashScriptParser.T__31:
			case CashScriptParser.Bytes:
			case CashScriptParser.Require:
			case CashScriptParser.Identifier:
				this.enterOuterAlt(_localctx, 2);
				{
				this.state = 97;
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
		this.enterRule(_localctx, 12, CashScriptParser.RULE_statement);
		try {
			this.state = 106;
			this._errHandler.sync(this);
			switch ( this.interpreter.adaptivePredict(this._input, 7, this._ctx) ) {
			case 1:
				this.enterOuterAlt(_localctx, 1);
				{
				this.state = 100;
				this.variableDefinition();
				}
				break;

			case 2:
				this.enterOuterAlt(_localctx, 2);
				{
				this.state = 101;
				this.assignStatement();
				}
				break;

			case 3:
				this.enterOuterAlt(_localctx, 3);
				{
				this.state = 102;
				this.throwStatement();
				}
				break;

			case 4:
				this.enterOuterAlt(_localctx, 4);
				{
				this.state = 103;
				this.timeOpStatement();
				}
				break;

			case 5:
				this.enterOuterAlt(_localctx, 5);
				{
				this.state = 104;
				this.functionCallStatement();
				}
				break;

			case 6:
				this.enterOuterAlt(_localctx, 6);
				{
				this.state = 105;
				this.ifStatement();
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
		this.enterRule(_localctx, 14, CashScriptParser.RULE_variableDefinition);
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 108;
			this.typeName();
			this.state = 109;
			this.match(CashScriptParser.Identifier);
			this.state = 110;
			this.match(CashScriptParser.T__7);
			this.state = 111;
			this.expression(0);
			this.state = 112;
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
	public assignStatement(): AssignStatementContext {
		let _localctx: AssignStatementContext = new AssignStatementContext(this._ctx, this.state);
		this.enterRule(_localctx, 16, CashScriptParser.RULE_assignStatement);
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 114;
			this.match(CashScriptParser.Identifier);
			this.state = 115;
			this.match(CashScriptParser.T__7);
			this.state = 116;
			this.expression(0);
			this.state = 117;
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
	public throwStatement(): ThrowStatementContext {
		let _localctx: ThrowStatementContext = new ThrowStatementContext(this._ctx, this.state);
		this.enterRule(_localctx, 18, CashScriptParser.RULE_throwStatement);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 119;
			this.match(CashScriptParser.T__9);
			this.state = 121;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if ((((_la) & ~0x1F) === 0 && ((1 << _la) & ((1 << CashScriptParser.T__4) | (1 << CashScriptParser.T__15) | (1 << CashScriptParser.T__16) | (1 << CashScriptParser.T__17) | (1 << CashScriptParser.T__27) | (1 << CashScriptParser.T__28) | (1 << CashScriptParser.T__29) | (1 << CashScriptParser.T__30))) !== 0) || ((((_la - 32)) & ~0x1F) === 0 && ((1 << (_la - 32)) & ((1 << (CashScriptParser.T__31 - 32)) | (1 << (CashScriptParser.Bytes - 32)) | (1 << (CashScriptParser.BooleanLiteral - 32)) | (1 << (CashScriptParser.NumberLiteral - 32)) | (1 << (CashScriptParser.StringLiteral - 32)) | (1 << (CashScriptParser.HexLiteral - 32)) | (1 << (CashScriptParser.Require - 32)) | (1 << (CashScriptParser.Identifier - 32)))) !== 0)) {
				{
				this.state = 120;
				this.expression(0);
				}
			}

			this.state = 123;
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
	public timeOpStatement(): TimeOpStatementContext {
		let _localctx: TimeOpStatementContext = new TimeOpStatementContext(this._ctx, this.state);
		this.enterRule(_localctx, 20, CashScriptParser.RULE_timeOpStatement);
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 125;
			this.match(CashScriptParser.Require);
			this.state = 126;
			this.match(CashScriptParser.T__4);
			this.state = 127;
			this.match(CashScriptParser.TxVar);
			this.state = 128;
			this.match(CashScriptParser.T__10);
			this.state = 129;
			this.expression(0);
			this.state = 130;
			this.match(CashScriptParser.T__6);
			this.state = 131;
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
	public functionCallStatement(): FunctionCallStatementContext {
		let _localctx: FunctionCallStatementContext = new FunctionCallStatementContext(this._ctx, this.state);
		this.enterRule(_localctx, 22, CashScriptParser.RULE_functionCallStatement);
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 133;
			this.functionCall();
			this.state = 134;
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
	public ifStatement(): IfStatementContext {
		let _localctx: IfStatementContext = new IfStatementContext(this._ctx, this.state);
		this.enterRule(_localctx, 24, CashScriptParser.RULE_ifStatement);
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 136;
			this.match(CashScriptParser.T__11);
			this.state = 137;
			this.match(CashScriptParser.T__4);
			this.state = 138;
			this.expression(0);
			this.state = 139;
			this.match(CashScriptParser.T__6);
			this.state = 140;
			_localctx._ifBlock = this.block();
			this.state = 143;
			this._errHandler.sync(this);
			switch ( this.interpreter.adaptivePredict(this._input, 9, this._ctx) ) {
			case 1:
				{
				this.state = 141;
				this.match(CashScriptParser.T__12);
				this.state = 142;
				_localctx._elseBlock = this.block();
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
	public cast(): CastContext {
		let _localctx: CastContext = new CastContext(this._ctx, this.state);
		this.enterRule(_localctx, 26, CashScriptParser.RULE_cast);
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 145;
			this.typeName();
			this.state = 146;
			this.match(CashScriptParser.T__4);
			this.state = 147;
			this.expression(0);
			this.state = 148;
			this.match(CashScriptParser.T__6);
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
		this.enterRule(_localctx, 28, CashScriptParser.RULE_functionCall);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 150;
			_localctx._id = this._input.LT(1);
			_la = this._input.LA(1);
			if (!(_la === CashScriptParser.Require || _la === CashScriptParser.Identifier)) {
				_localctx._id = this._errHandler.recoverInline(this);
			} else {
				if (this._input.LA(1) === Token.EOF) {
					this.matchedEOF = true;
				}

				this._errHandler.reportMatch(this);
				this.consume();
			}
			this.state = 151;
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
		this.enterRule(_localctx, 30, CashScriptParser.RULE_expressionList);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 153;
			this.match(CashScriptParser.T__4);
			this.state = 162;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if ((((_la) & ~0x1F) === 0 && ((1 << _la) & ((1 << CashScriptParser.T__4) | (1 << CashScriptParser.T__15) | (1 << CashScriptParser.T__16) | (1 << CashScriptParser.T__17) | (1 << CashScriptParser.T__27) | (1 << CashScriptParser.T__28) | (1 << CashScriptParser.T__29) | (1 << CashScriptParser.T__30))) !== 0) || ((((_la - 32)) & ~0x1F) === 0 && ((1 << (_la - 32)) & ((1 << (CashScriptParser.T__31 - 32)) | (1 << (CashScriptParser.Bytes - 32)) | (1 << (CashScriptParser.BooleanLiteral - 32)) | (1 << (CashScriptParser.NumberLiteral - 32)) | (1 << (CashScriptParser.StringLiteral - 32)) | (1 << (CashScriptParser.HexLiteral - 32)) | (1 << (CashScriptParser.Require - 32)) | (1 << (CashScriptParser.Identifier - 32)))) !== 0)) {
				{
				this.state = 154;
				this.expression(0);
				this.state = 159;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				while (_la === CashScriptParser.T__5) {
					{
					{
					this.state = 155;
					this.match(CashScriptParser.T__5);
					this.state = 156;
					this.expression(0);
					}
					}
					this.state = 161;
					this._errHandler.sync(this);
					_la = this._input.LA(1);
				}
				}
			}

			this.state = 164;
			this.match(CashScriptParser.T__6);
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
		let _startState: number = 32;
		this.enterRecursionRule(_localctx, 32, CashScriptParser.RULE_expression, _p);
		let _la: number;
		try {
			let _alt: number;
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 177;
			this._errHandler.sync(this);
			switch ( this.interpreter.adaptivePredict(this._input, 12, this._ctx) ) {
			case 1:
				{
				this.state = 167;
				this.match(CashScriptParser.T__4);
				this.state = 168;
				_localctx._paren = this.expression(0);
				this.state = 169;
				this.match(CashScriptParser.T__6);
				}
				break;

			case 2:
				{
				this.state = 171;
				this.cast();
				}
				break;

			case 3:
				{
				this.state = 172;
				this.functionCall();
				}
				break;

			case 4:
				{
				this.state = 173;
				_localctx._op = this._input.LT(1);
				_la = this._input.LA(1);
				if (!((((_la) & ~0x1F) === 0 && ((1 << _la) & ((1 << CashScriptParser.T__15) | (1 << CashScriptParser.T__16) | (1 << CashScriptParser.T__17))) !== 0))) {
					_localctx._op = this._errHandler.recoverInline(this);
				} else {
					if (this._input.LA(1) === Token.EOF) {
						this.matchedEOF = true;
					}

					this._errHandler.reportMatch(this);
					this.consume();
				}
				this.state = 174;
				_localctx._right = this.expression(9);
				}
				break;

			case 5:
				{
				this.state = 175;
				this.match(CashScriptParser.Identifier);
				}
				break;

			case 6:
				{
				this.state = 176;
				this.literal();
				}
				break;
			}
			this._ctx._stop = this._input.tryLT(-1);
			this.state = 207;
			this._errHandler.sync(this);
			_alt = this.interpreter.adaptivePredict(this._input, 14, this._ctx);
			while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
				if (_alt === 1) {
					if (this._parseListeners != null) {
						this.triggerExitRuleEvent();
					}
					_prevctx = _localctx;
					{
					this.state = 205;
					this._errHandler.sync(this);
					switch ( this.interpreter.adaptivePredict(this._input, 13, this._ctx) ) {
					case 1:
						{
						_localctx = new ExpressionContext(_parentctx, _parentState);
						_localctx._left = _prevctx;
						this.pushNewRecursionContext(_localctx, _startState, CashScriptParser.RULE_expression);
						this.state = 179;
						if (!(this.precpred(this._ctx, 8))) {
							throw new FailedPredicateException(this, "this.precpred(this._ctx, 8)");
						}
						this.state = 180;
						_localctx._op = this._input.LT(1);
						_la = this._input.LA(1);
						if (!(_la === CashScriptParser.T__18 || _la === CashScriptParser.T__19)) {
							_localctx._op = this._errHandler.recoverInline(this);
						} else {
							if (this._input.LA(1) === Token.EOF) {
								this.matchedEOF = true;
							}

							this._errHandler.reportMatch(this);
							this.consume();
						}
						this.state = 181;
						_localctx._right = this.expression(9);
						}
						break;

					case 2:
						{
						_localctx = new ExpressionContext(_parentctx, _parentState);
						_localctx._left = _prevctx;
						this.pushNewRecursionContext(_localctx, _startState, CashScriptParser.RULE_expression);
						this.state = 182;
						if (!(this.precpred(this._ctx, 7))) {
							throw new FailedPredicateException(this, "this.precpred(this._ctx, 7)");
						}
						this.state = 183;
						_localctx._op = this._input.LT(1);
						_la = this._input.LA(1);
						if (!(_la === CashScriptParser.T__16 || _la === CashScriptParser.T__17)) {
							_localctx._op = this._errHandler.recoverInline(this);
						} else {
							if (this._input.LA(1) === Token.EOF) {
								this.matchedEOF = true;
							}

							this._errHandler.reportMatch(this);
							this.consume();
						}
						this.state = 184;
						_localctx._right = this.expression(8);
						}
						break;

					case 3:
						{
						_localctx = new ExpressionContext(_parentctx, _parentState);
						_localctx._left = _prevctx;
						this.pushNewRecursionContext(_localctx, _startState, CashScriptParser.RULE_expression);
						this.state = 185;
						if (!(this.precpred(this._ctx, 6))) {
							throw new FailedPredicateException(this, "this.precpred(this._ctx, 6)");
						}
						this.state = 186;
						_localctx._op = this._input.LT(1);
						_la = this._input.LA(1);
						if (!((((_la) & ~0x1F) === 0 && ((1 << _la) & ((1 << CashScriptParser.T__10) | (1 << CashScriptParser.T__20) | (1 << CashScriptParser.T__21) | (1 << CashScriptParser.T__22))) !== 0))) {
							_localctx._op = this._errHandler.recoverInline(this);
						} else {
							if (this._input.LA(1) === Token.EOF) {
								this.matchedEOF = true;
							}

							this._errHandler.reportMatch(this);
							this.consume();
						}
						this.state = 187;
						_localctx._right = this.expression(7);
						}
						break;

					case 4:
						{
						_localctx = new ExpressionContext(_parentctx, _parentState);
						_localctx._left = _prevctx;
						this.pushNewRecursionContext(_localctx, _startState, CashScriptParser.RULE_expression);
						this.state = 188;
						if (!(this.precpred(this._ctx, 5))) {
							throw new FailedPredicateException(this, "this.precpred(this._ctx, 5)");
						}
						this.state = 189;
						_localctx._op = this._input.LT(1);
						_la = this._input.LA(1);
						if (!(_la === CashScriptParser.T__23 || _la === CashScriptParser.T__24)) {
							_localctx._op = this._errHandler.recoverInline(this);
						} else {
							if (this._input.LA(1) === Token.EOF) {
								this.matchedEOF = true;
							}

							this._errHandler.reportMatch(this);
							this.consume();
						}
						this.state = 190;
						_localctx._right = this.expression(6);
						}
						break;

					case 5:
						{
						_localctx = new ExpressionContext(_parentctx, _parentState);
						_localctx._left = _prevctx;
						this.pushNewRecursionContext(_localctx, _startState, CashScriptParser.RULE_expression);
						this.state = 191;
						if (!(this.precpred(this._ctx, 4))) {
							throw new FailedPredicateException(this, "this.precpred(this._ctx, 4)");
						}
						this.state = 192;
						_localctx._op = this.match(CashScriptParser.T__25);
						this.state = 193;
						_localctx._right = this.expression(5);
						}
						break;

					case 6:
						{
						_localctx = new ExpressionContext(_parentctx, _parentState);
						_localctx._left = _prevctx;
						this.pushNewRecursionContext(_localctx, _startState, CashScriptParser.RULE_expression);
						this.state = 194;
						if (!(this.precpred(this._ctx, 3))) {
							throw new FailedPredicateException(this, "this.precpred(this._ctx, 3)");
						}
						this.state = 195;
						_localctx._op = this.match(CashScriptParser.T__26);
						this.state = 196;
						_localctx._right = this.expression(4);
						}
						break;

					case 7:
						{
						_localctx = new ExpressionContext(_parentctx, _parentState);
						_localctx._obj = _prevctx;
						this.pushNewRecursionContext(_localctx, _startState, CashScriptParser.RULE_expression);
						this.state = 197;
						if (!(this.precpred(this._ctx, 11))) {
							throw new FailedPredicateException(this, "this.precpred(this._ctx, 11)");
						}
						this.state = 198;
						this.match(CashScriptParser.T__13);
						}
						break;

					case 8:
						{
						_localctx = new ExpressionContext(_parentctx, _parentState);
						_localctx._obj = _prevctx;
						this.pushNewRecursionContext(_localctx, _startState, CashScriptParser.RULE_expression);
						this.state = 199;
						if (!(this.precpred(this._ctx, 10))) {
							throw new FailedPredicateException(this, "this.precpred(this._ctx, 10)");
						}
						this.state = 200;
						this.match(CashScriptParser.T__14);
						this.state = 201;
						this.match(CashScriptParser.T__4);
						this.state = 202;
						_localctx._index = this.expression(0);
						this.state = 203;
						this.match(CashScriptParser.T__6);
						}
						break;
					}
					}
				}
				this.state = 209;
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
		this.enterRule(_localctx, 34, CashScriptParser.RULE_literal);
		try {
			this.state = 214;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case CashScriptParser.BooleanLiteral:
				this.enterOuterAlt(_localctx, 1);
				{
				this.state = 210;
				this.match(CashScriptParser.BooleanLiteral);
				}
				break;
			case CashScriptParser.NumberLiteral:
				this.enterOuterAlt(_localctx, 2);
				{
				this.state = 211;
				this.numberLiteral();
				}
				break;
			case CashScriptParser.StringLiteral:
				this.enterOuterAlt(_localctx, 3);
				{
				this.state = 212;
				this.match(CashScriptParser.StringLiteral);
				}
				break;
			case CashScriptParser.HexLiteral:
				this.enterOuterAlt(_localctx, 4);
				{
				this.state = 213;
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
		this.enterRule(_localctx, 36, CashScriptParser.RULE_numberLiteral);
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 216;
			this.match(CashScriptParser.NumberLiteral);
			this.state = 218;
			this._errHandler.sync(this);
			switch ( this.interpreter.adaptivePredict(this._input, 16, this._ctx) ) {
			case 1:
				{
				this.state = 217;
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
		this.enterRule(_localctx, 38, CashScriptParser.RULE_typeName);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 220;
			_la = this._input.LA(1);
			if (!(((((_la - 28)) & ~0x1F) === 0 && ((1 << (_la - 28)) & ((1 << (CashScriptParser.T__27 - 28)) | (1 << (CashScriptParser.T__28 - 28)) | (1 << (CashScriptParser.T__29 - 28)) | (1 << (CashScriptParser.T__30 - 28)) | (1 << (CashScriptParser.T__31 - 28)) | (1 << (CashScriptParser.Bytes - 28)))) !== 0))) {
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
		case 16:
			return this.expression_sempred(_localctx as ExpressionContext, predIndex);
		}
		return true;
	}
	private expression_sempred(_localctx: ExpressionContext, predIndex: number): boolean {
		switch (predIndex) {
		case 0:
			return this.precpred(this._ctx, 8);

		case 1:
			return this.precpred(this._ctx, 7);

		case 2:
			return this.precpred(this._ctx, 6);

		case 3:
			return this.precpred(this._ctx, 5);

		case 4:
			return this.precpred(this._ctx, 4);

		case 5:
			return this.precpred(this._ctx, 3);

		case 6:
			return this.precpred(this._ctx, 11);

		case 7:
			return this.precpred(this._ctx, 10);
		}
		return true;
	}

	public static readonly _serializedATN: string =
		"\x03\uC91D\uCABA\u058D\uAFBA\u4F53\u0607\uEA8B\uC241\x03.\xE1\x04\x02" +
		"\t\x02\x04\x03\t\x03\x04\x04\t\x04\x04\x05\t\x05\x04\x06\t\x06\x04\x07" +
		"\t\x07\x04\b\t\b\x04\t\t\t\x04\n\t\n\x04\v\t\v\x04\f\t\f\x04\r\t\r\x04" +
		"\x0E\t\x0E\x04\x0F\t\x0F\x04\x10\t\x10\x04\x11\t\x11\x04\x12\t\x12\x04" +
		"\x13\t\x13\x04\x14\t\x14\x04\x15\t\x15\x03\x02\x03\x02\x03\x02\x03\x03" +
		"\x03\x03\x03\x03\x03\x03\x03\x03\x07\x033\n\x03\f\x03\x0E\x036\v\x03\x03" +
		"\x03\x07\x039\n\x03\f\x03\x0E\x03<\v\x03\x03\x03\x03\x03\x03\x04\x03\x04" +
		"\x03\x04\x03\x04\x03\x04\x07\x04E\n\x04\f\x04\x0E\x04H\v\x04\x03\x04\x03" +
		"\x04\x03\x05\x03\x05\x03\x05\x03\x05\x07\x05P\n\x05\f\x05\x0E\x05S\v\x05" +
		"\x05\x05U\n\x05\x03\x05\x03\x05\x03\x06\x03\x06\x03\x06\x03\x07\x03\x07" +
		"\x07\x07^\n\x07\f\x07\x0E\x07a\v\x07\x03\x07\x03\x07\x05\x07e\n\x07\x03" +
		"\b\x03\b\x03\b\x03\b\x03\b\x03\b\x05\bm\n\b\x03\t\x03\t\x03\t\x03\t\x03" +
		"\t\x03\t\x03\n\x03\n\x03\n\x03\n\x03\n\x03\v\x03\v\x05\v|\n\v\x03\v\x03" +
		"\v\x03\f\x03\f\x03\f\x03\f\x03\f\x03\f\x03\f\x03\f\x03\r\x03\r\x03\r\x03" +
		"\x0E\x03\x0E\x03\x0E\x03\x0E\x03\x0E\x03\x0E\x03\x0E\x05\x0E\x92\n\x0E" +
		"\x03\x0F\x03\x0F\x03\x0F\x03\x0F\x03\x0F\x03\x10\x03\x10\x03\x10\x03\x11" +
		"\x03\x11\x03\x11\x03\x11\x07\x11\xA0\n\x11\f\x11\x0E\x11\xA3\v\x11\x05" +
		"\x11\xA5\n\x11\x03\x11\x03\x11\x03\x12\x03\x12\x03\x12\x03\x12\x03\x12" +
		"\x03\x12\x03\x12\x03\x12\x03\x12\x03\x12\x03\x12\x05\x12\xB4\n\x12\x03" +
		"\x12\x03\x12\x03\x12\x03\x12\x03\x12\x03\x12\x03\x12\x03\x12\x03\x12\x03" +
		"\x12\x03\x12\x03\x12\x03\x12\x03\x12\x03\x12\x03\x12\x03\x12\x03\x12\x03" +
		"\x12\x03\x12\x03\x12\x03\x12\x03\x12\x03\x12\x03\x12\x03\x12\x07\x12\xD0" +
		"\n\x12\f\x12\x0E\x12\xD3\v\x12\x03\x13\x03\x13\x03\x13\x03\x13\x05\x13" +
		"\xD9\n\x13\x03\x14\x03\x14\x05\x14\xDD\n\x14\x03\x15\x03\x15\x03\x15\x02" +
		"\x02\x03\"\x16\x02\x02\x04\x02\x06\x02\b\x02\n\x02\f\x02\x0E\x02\x10\x02" +
		"\x12\x02\x14\x02\x16\x02\x18\x02\x1A\x02\x1C\x02\x1E\x02 \x02\"\x02$\x02" +
		"&\x02(\x02\x02\t\x03\x02*+\x03\x02\x12\x14\x03\x02\x15\x16\x03\x02\x13" +
		"\x14\x04\x02\r\r\x17\x19\x03\x02\x1A\x1B\x03\x02\x1E#\x02\xED\x02*\x03" +
		"\x02\x02\x02\x04-\x03\x02\x02\x02\x06?\x03\x02\x02\x02\bK\x03\x02\x02" +
		"\x02\nX\x03\x02\x02\x02\fd\x03\x02\x02\x02\x0El\x03\x02\x02\x02\x10n\x03" +
		"\x02\x02\x02\x12t\x03\x02\x02\x02\x14y\x03\x02\x02\x02\x16\x7F\x03\x02" +
		"\x02\x02\x18\x87\x03\x02\x02\x02\x1A\x8A\x03\x02\x02\x02\x1C\x93\x03\x02" +
		"\x02\x02\x1E\x98\x03\x02\x02\x02 \x9B\x03\x02\x02\x02\"\xB3\x03\x02\x02" +
		"\x02$\xD8\x03\x02\x02\x02&\xDA\x03\x02\x02\x02(\xDE\x03\x02\x02\x02*+" +
		"\x05\x04\x03\x02+,\x07\x02\x02\x03,\x03\x03\x02\x02\x02-.\x07\x03\x02" +
		"\x02./\x07+\x02\x02/0\x05\b\x05\x0204\x07\x04\x02\x0213\x05\x10\t\x02" +
		"21\x03\x02\x02\x0236\x03\x02\x02\x0242\x03\x02\x02\x0245\x03\x02\x02\x02" +
		"5:\x03\x02\x02\x0264\x03\x02\x02\x0279\x05\x06\x04\x0287\x03\x02\x02\x02" +
		"9<\x03\x02\x02\x02:8\x03\x02\x02\x02:;\x03\x02\x02\x02;=\x03\x02\x02\x02" +
		"<:\x03\x02\x02\x02=>\x07\x05\x02\x02>\x05\x03\x02\x02\x02?@\x07\x06\x02" +
		"\x02@A\x07+\x02\x02AB\x05\b\x05\x02BF\x07\x04\x02\x02CE\x05\x0E\b\x02" +
		"DC\x03\x02\x02\x02EH\x03\x02\x02\x02FD\x03\x02\x02\x02FG\x03\x02\x02\x02" +
		"GI\x03\x02\x02\x02HF\x03\x02\x02\x02IJ\x07\x05\x02\x02J\x07\x03\x02\x02" +
		"\x02KT\x07\x07\x02\x02LQ\x05\n\x06\x02MN\x07\b\x02\x02NP\x05\n\x06\x02" +
		"OM\x03\x02\x02\x02PS\x03\x02\x02\x02QO\x03\x02\x02\x02QR\x03\x02\x02\x02" +
		"RU\x03\x02\x02\x02SQ\x03\x02\x02\x02TL\x03\x02\x02\x02TU\x03\x02\x02\x02" +
		"UV\x03\x02\x02\x02VW\x07\t\x02\x02W\t\x03\x02\x02\x02XY\x05(\x15\x02Y" +
		"Z\x07+\x02\x02Z\v\x03\x02\x02\x02[_\x07\x04\x02\x02\\^\x05\x0E\b\x02]" +
		"\\\x03\x02\x02\x02^a\x03\x02\x02\x02_]\x03\x02\x02\x02_`\x03\x02\x02\x02" +
		"`b\x03\x02\x02\x02a_\x03\x02\x02\x02be\x07\x05\x02\x02ce\x05\x0E\b\x02" +
		"d[\x03\x02\x02\x02dc\x03\x02\x02\x02e\r\x03\x02\x02\x02fm\x05\x10\t\x02" +
		"gm\x05\x12\n\x02hm\x05\x14\v\x02im\x05\x16\f\x02jm\x05\x18\r\x02km\x05" +
		"\x1A\x0E\x02lf\x03\x02\x02\x02lg\x03\x02\x02\x02lh\x03\x02\x02\x02li\x03" +
		"\x02\x02\x02lj\x03\x02\x02\x02lk\x03\x02\x02\x02m\x0F\x03\x02\x02\x02" +
		"no\x05(\x15\x02op\x07+\x02\x02pq\x07\n\x02\x02qr\x05\"\x12\x02rs\x07\v" +
		"\x02\x02s\x11\x03\x02\x02\x02tu\x07+\x02\x02uv\x07\n\x02\x02vw\x05\"\x12" +
		"\x02wx\x07\v\x02\x02x\x13\x03\x02\x02\x02y{\x07\f\x02\x02z|\x05\"\x12" +
		"\x02{z\x03\x02\x02\x02{|\x03\x02\x02\x02|}\x03\x02\x02\x02}~\x07\v\x02" +
		"\x02~\x15\x03\x02\x02\x02\x7F\x80\x07*\x02\x02\x80\x81\x07\x07\x02\x02" +
		"\x81\x82\x07)\x02\x02\x82\x83\x07\r\x02\x02\x83\x84\x05\"\x12\x02\x84" +
		"\x85\x07\t\x02\x02\x85\x86\x07\v\x02\x02\x86\x17\x03\x02\x02\x02\x87\x88" +
		"\x05\x1E\x10\x02\x88\x89\x07\v\x02\x02\x89\x19\x03\x02\x02\x02\x8A\x8B" +
		"\x07\x0E\x02\x02\x8B\x8C\x07\x07\x02\x02\x8C\x8D\x05\"\x12\x02\x8D\x8E" +
		"\x07\t\x02\x02\x8E\x91\x05\f\x07\x02\x8F\x90\x07\x0F\x02\x02\x90\x92\x05" +
		"\f\x07\x02\x91\x8F\x03\x02\x02\x02\x91\x92\x03\x02\x02\x02\x92\x1B\x03" +
		"\x02\x02\x02\x93\x94\x05(\x15\x02\x94\x95\x07\x07\x02\x02\x95\x96\x05" +
		"\"\x12\x02\x96\x97\x07\t\x02\x02\x97\x1D\x03\x02\x02\x02\x98\x99\t\x02" +
		"\x02\x02\x99\x9A\x05 \x11\x02\x9A\x1F\x03\x02\x02\x02\x9B\xA4\x07\x07" +
		"\x02\x02\x9C\xA1\x05\"\x12\x02\x9D\x9E\x07\b\x02\x02\x9E\xA0\x05\"\x12" +
		"\x02\x9F\x9D\x03\x02\x02\x02\xA0\xA3\x03\x02\x02\x02\xA1\x9F\x03\x02\x02" +
		"\x02\xA1\xA2\x03\x02\x02\x02\xA2\xA5\x03\x02\x02\x02\xA3\xA1\x03\x02\x02" +
		"\x02\xA4\x9C\x03\x02\x02\x02\xA4\xA5\x03\x02\x02\x02\xA5\xA6\x03\x02\x02" +
		"\x02\xA6\xA7\x07\t\x02\x02\xA7!\x03\x02\x02\x02\xA8\xA9\b\x12\x01\x02" +
		"\xA9\xAA\x07\x07\x02\x02\xAA\xAB\x05\"\x12\x02\xAB\xAC\x07\t\x02\x02\xAC" +
		"\xB4\x03\x02\x02\x02\xAD\xB4\x05\x1C\x0F\x02\xAE\xB4\x05\x1E\x10\x02\xAF" +
		"\xB0\t\x03\x02\x02\xB0\xB4\x05\"\x12\v\xB1\xB4\x07+\x02\x02\xB2\xB4\x05" +
		"$\x13\x02\xB3\xA8\x03\x02\x02\x02\xB3\xAD\x03\x02\x02\x02\xB3\xAE\x03" +
		"\x02\x02\x02\xB3\xAF\x03\x02\x02\x02\xB3\xB1\x03\x02\x02\x02\xB3\xB2\x03" +
		"\x02\x02\x02\xB4\xD1\x03\x02\x02\x02\xB5\xB6\f\n\x02\x02\xB6\xB7\t\x04" +
		"\x02\x02\xB7\xD0\x05\"\x12\v\xB8\xB9\f\t\x02\x02\xB9\xBA\t\x05\x02\x02" +
		"\xBA\xD0\x05\"\x12\n\xBB\xBC\f\b\x02\x02\xBC\xBD\t\x06\x02\x02\xBD\xD0" +
		"\x05\"\x12\t\xBE\xBF\f\x07\x02\x02\xBF\xC0\t\x07\x02\x02\xC0\xD0\x05\"" +
		"\x12\b\xC1\xC2\f\x06\x02\x02\xC2\xC3\x07\x1C\x02\x02\xC3\xD0\x05\"\x12" +
		"\x07\xC4\xC5\f\x05\x02\x02\xC5\xC6\x07\x1D\x02\x02\xC6\xD0\x05\"\x12\x06" +
		"\xC7\xC8\f\r\x02\x02\xC8\xD0\x07\x10\x02\x02\xC9\xCA\f\f\x02\x02\xCA\xCB" +
		"\x07\x11\x02\x02\xCB\xCC\x07\x07\x02\x02\xCC\xCD\x05\"\x12\x02\xCD\xCE" +
		"\x07\t\x02\x02\xCE\xD0\x03\x02\x02\x02\xCF\xB5\x03\x02\x02\x02\xCF\xB8" +
		"\x03\x02\x02\x02\xCF\xBB\x03\x02\x02\x02\xCF\xBE\x03\x02\x02\x02\xCF\xC1" +
		"\x03\x02\x02\x02\xCF\xC4\x03\x02\x02\x02\xCF\xC7\x03\x02\x02\x02\xCF\xC9" +
		"\x03\x02\x02\x02\xD0\xD3\x03\x02\x02\x02\xD1\xCF\x03\x02\x02\x02\xD1\xD2" +
		"\x03\x02\x02\x02\xD2#\x03\x02\x02\x02\xD3\xD1\x03\x02\x02\x02\xD4\xD9" +
		"\x07$\x02\x02\xD5\xD9\x05&\x14\x02\xD6\xD9\x07\'\x02\x02\xD7\xD9\x07(" +
		"\x02\x02\xD8\xD4\x03\x02\x02\x02\xD8\xD5\x03\x02\x02\x02\xD8\xD6\x03\x02" +
		"\x02\x02\xD8\xD7\x03\x02\x02\x02\xD9%\x03\x02\x02\x02\xDA\xDC\x07&\x02" +
		"\x02\xDB\xDD\x07%\x02\x02\xDC\xDB\x03\x02\x02\x02\xDC\xDD\x03\x02\x02" +
		"\x02\xDD\'\x03\x02\x02\x02\xDE\xDF\t\b\x02\x02\xDF)\x03\x02\x02\x02\x13" +
		"4:FQT_dl{\x91\xA1\xA4\xB3\xCF\xD1\xD8\xDC";
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
	public enterRule(listener: CashScriptListener): void {
		if (listener.enterSourceFile) {
			listener.enterSourceFile(this);
		}
	}
	// @Override
	public exitRule(listener: CashScriptListener): void {
		if (listener.exitSourceFile) {
			listener.exitSourceFile(this);
		}
	}
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
	public enterRule(listener: CashScriptListener): void {
		if (listener.enterContractDefinition) {
			listener.enterContractDefinition(this);
		}
	}
	// @Override
	public exitRule(listener: CashScriptListener): void {
		if (listener.exitContractDefinition) {
			listener.exitContractDefinition(this);
		}
	}
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
	public Identifier(): TerminalNode { return this.getToken(CashScriptParser.Identifier, 0); }
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
	public enterRule(listener: CashScriptListener): void {
		if (listener.enterFunctionDefinition) {
			listener.enterFunctionDefinition(this);
		}
	}
	// @Override
	public exitRule(listener: CashScriptListener): void {
		if (listener.exitFunctionDefinition) {
			listener.exitFunctionDefinition(this);
		}
	}
	// @Override
	public accept<Result>(visitor: CashScriptVisitor<Result>): Result {
		if (visitor.visitFunctionDefinition) {
			return visitor.visitFunctionDefinition(this);
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
	public enterRule(listener: CashScriptListener): void {
		if (listener.enterParameterList) {
			listener.enterParameterList(this);
		}
	}
	// @Override
	public exitRule(listener: CashScriptListener): void {
		if (listener.exitParameterList) {
			listener.exitParameterList(this);
		}
	}
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
	public enterRule(listener: CashScriptListener): void {
		if (listener.enterParameter) {
			listener.enterParameter(this);
		}
	}
	// @Override
	public exitRule(listener: CashScriptListener): void {
		if (listener.exitParameter) {
			listener.exitParameter(this);
		}
	}
	// @Override
	public accept<Result>(visitor: CashScriptVisitor<Result>): Result {
		if (visitor.visitParameter) {
			return visitor.visitParameter(this);
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
	public enterRule(listener: CashScriptListener): void {
		if (listener.enterBlock) {
			listener.enterBlock(this);
		}
	}
	// @Override
	public exitRule(listener: CashScriptListener): void {
		if (listener.exitBlock) {
			listener.exitBlock(this);
		}
	}
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
	public throwStatement(): ThrowStatementContext | undefined {
		return this.tryGetRuleContext(0, ThrowStatementContext);
	}
	public timeOpStatement(): TimeOpStatementContext | undefined {
		return this.tryGetRuleContext(0, TimeOpStatementContext);
	}
	public functionCallStatement(): FunctionCallStatementContext | undefined {
		return this.tryGetRuleContext(0, FunctionCallStatementContext);
	}
	public ifStatement(): IfStatementContext | undefined {
		return this.tryGetRuleContext(0, IfStatementContext);
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return CashScriptParser.RULE_statement; }
	// @Override
	public enterRule(listener: CashScriptListener): void {
		if (listener.enterStatement) {
			listener.enterStatement(this);
		}
	}
	// @Override
	public exitRule(listener: CashScriptListener): void {
		if (listener.exitStatement) {
			listener.exitStatement(this);
		}
	}
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
	public enterRule(listener: CashScriptListener): void {
		if (listener.enterVariableDefinition) {
			listener.enterVariableDefinition(this);
		}
	}
	// @Override
	public exitRule(listener: CashScriptListener): void {
		if (listener.exitVariableDefinition) {
			listener.exitVariableDefinition(this);
		}
	}
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
	public enterRule(listener: CashScriptListener): void {
		if (listener.enterAssignStatement) {
			listener.enterAssignStatement(this);
		}
	}
	// @Override
	public exitRule(listener: CashScriptListener): void {
		if (listener.exitAssignStatement) {
			listener.exitAssignStatement(this);
		}
	}
	// @Override
	public accept<Result>(visitor: CashScriptVisitor<Result>): Result {
		if (visitor.visitAssignStatement) {
			return visitor.visitAssignStatement(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class ThrowStatementContext extends ParserRuleContext {
	public expression(): ExpressionContext | undefined {
		return this.tryGetRuleContext(0, ExpressionContext);
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return CashScriptParser.RULE_throwStatement; }
	// @Override
	public enterRule(listener: CashScriptListener): void {
		if (listener.enterThrowStatement) {
			listener.enterThrowStatement(this);
		}
	}
	// @Override
	public exitRule(listener: CashScriptListener): void {
		if (listener.exitThrowStatement) {
			listener.exitThrowStatement(this);
		}
	}
	// @Override
	public accept<Result>(visitor: CashScriptVisitor<Result>): Result {
		if (visitor.visitThrowStatement) {
			return visitor.visitThrowStatement(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class TimeOpStatementContext extends ParserRuleContext {
	public Require(): TerminalNode { return this.getToken(CashScriptParser.Require, 0); }
	public TxVar(): TerminalNode { return this.getToken(CashScriptParser.TxVar, 0); }
	public expression(): ExpressionContext {
		return this.getRuleContext(0, ExpressionContext);
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return CashScriptParser.RULE_timeOpStatement; }
	// @Override
	public enterRule(listener: CashScriptListener): void {
		if (listener.enterTimeOpStatement) {
			listener.enterTimeOpStatement(this);
		}
	}
	// @Override
	public exitRule(listener: CashScriptListener): void {
		if (listener.exitTimeOpStatement) {
			listener.exitTimeOpStatement(this);
		}
	}
	// @Override
	public accept<Result>(visitor: CashScriptVisitor<Result>): Result {
		if (visitor.visitTimeOpStatement) {
			return visitor.visitTimeOpStatement(this);
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
	public enterRule(listener: CashScriptListener): void {
		if (listener.enterFunctionCallStatement) {
			listener.enterFunctionCallStatement(this);
		}
	}
	// @Override
	public exitRule(listener: CashScriptListener): void {
		if (listener.exitFunctionCallStatement) {
			listener.exitFunctionCallStatement(this);
		}
	}
	// @Override
	public accept<Result>(visitor: CashScriptVisitor<Result>): Result {
		if (visitor.visitFunctionCallStatement) {
			return visitor.visitFunctionCallStatement(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class IfStatementContext extends ParserRuleContext {
	public _ifBlock: BlockContext;
	public _elseBlock: BlockContext;
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
	public enterRule(listener: CashScriptListener): void {
		if (listener.enterIfStatement) {
			listener.enterIfStatement(this);
		}
	}
	// @Override
	public exitRule(listener: CashScriptListener): void {
		if (listener.exitIfStatement) {
			listener.exitIfStatement(this);
		}
	}
	// @Override
	public accept<Result>(visitor: CashScriptVisitor<Result>): Result {
		if (visitor.visitIfStatement) {
			return visitor.visitIfStatement(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class CastContext extends ParserRuleContext {
	public typeName(): TypeNameContext {
		return this.getRuleContext(0, TypeNameContext);
	}
	public expression(): ExpressionContext {
		return this.getRuleContext(0, ExpressionContext);
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return CashScriptParser.RULE_cast; }
	// @Override
	public enterRule(listener: CashScriptListener): void {
		if (listener.enterCast) {
			listener.enterCast(this);
		}
	}
	// @Override
	public exitRule(listener: CashScriptListener): void {
		if (listener.exitCast) {
			listener.exitCast(this);
		}
	}
	// @Override
	public accept<Result>(visitor: CashScriptVisitor<Result>): Result {
		if (visitor.visitCast) {
			return visitor.visitCast(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class FunctionCallContext extends ParserRuleContext {
	public _id: Token;
	public expressionList(): ExpressionListContext {
		return this.getRuleContext(0, ExpressionListContext);
	}
	public Identifier(): TerminalNode | undefined { return this.tryGetToken(CashScriptParser.Identifier, 0); }
	public Require(): TerminalNode | undefined { return this.tryGetToken(CashScriptParser.Require, 0); }
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return CashScriptParser.RULE_functionCall; }
	// @Override
	public enterRule(listener: CashScriptListener): void {
		if (listener.enterFunctionCall) {
			listener.enterFunctionCall(this);
		}
	}
	// @Override
	public exitRule(listener: CashScriptListener): void {
		if (listener.exitFunctionCall) {
			listener.exitFunctionCall(this);
		}
	}
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
	public enterRule(listener: CashScriptListener): void {
		if (listener.enterExpressionList) {
			listener.enterExpressionList(this);
		}
	}
	// @Override
	public exitRule(listener: CashScriptListener): void {
		if (listener.exitExpressionList) {
			listener.exitExpressionList(this);
		}
	}
	// @Override
	public accept<Result>(visitor: CashScriptVisitor<Result>): Result {
		if (visitor.visitExpressionList) {
			return visitor.visitExpressionList(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class ExpressionContext extends ParserRuleContext {
	public _obj: ExpressionContext;
	public _left: ExpressionContext;
	public _paren: ExpressionContext;
	public _op: Token;
	public _right: ExpressionContext;
	public _index: ExpressionContext;
	public expression(): ExpressionContext[];
	public expression(i: number): ExpressionContext;
	public expression(i?: number): ExpressionContext | ExpressionContext[] {
		if (i === undefined) {
			return this.getRuleContexts(ExpressionContext);
		} else {
			return this.getRuleContext(i, ExpressionContext);
		}
	}
	public cast(): CastContext | undefined {
		return this.tryGetRuleContext(0, CastContext);
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
	public enterRule(listener: CashScriptListener): void {
		if (listener.enterExpression) {
			listener.enterExpression(this);
		}
	}
	// @Override
	public exitRule(listener: CashScriptListener): void {
		if (listener.exitExpression) {
			listener.exitExpression(this);
		}
	}
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
	public enterRule(listener: CashScriptListener): void {
		if (listener.enterLiteral) {
			listener.enterLiteral(this);
		}
	}
	// @Override
	public exitRule(listener: CashScriptListener): void {
		if (listener.exitLiteral) {
			listener.exitLiteral(this);
		}
	}
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
	public enterRule(listener: CashScriptListener): void {
		if (listener.enterNumberLiteral) {
			listener.enterNumberLiteral(this);
		}
	}
	// @Override
	public exitRule(listener: CashScriptListener): void {
		if (listener.exitNumberLiteral) {
			listener.exitNumberLiteral(this);
		}
	}
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
	public enterRule(listener: CashScriptListener): void {
		if (listener.enterTypeName) {
			listener.enterTypeName(this);
		}
	}
	// @Override
	public exitRule(listener: CashScriptListener): void {
		if (listener.exitTypeName) {
			listener.exitTypeName(this);
		}
	}
	// @Override
	public accept<Result>(visitor: CashScriptVisitor<Result>): Result {
		if (visitor.visitTypeName) {
			return visitor.visitTypeName(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


