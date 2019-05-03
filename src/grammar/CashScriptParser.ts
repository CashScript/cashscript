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
	public static readonly T__32 = 33;
	public static readonly T__33 = 34;
	public static readonly T__34 = 35;
	public static readonly T__35 = 36;
	public static readonly T__36 = 37;
	public static readonly T__37 = 38;
	public static readonly T__38 = 39;
	public static readonly Bytes = 40;
	public static readonly BooleanLiteral = 41;
	public static readonly NumberUnit = 42;
	public static readonly NumberLiteral = 43;
	public static readonly StringLiteral = 44;
	public static readonly HexLiteral = 45;
	public static readonly GlobalFunction = 46;
	public static readonly Identifier = 47;
	public static readonly WHITESPACE = 48;
	public static readonly COMMENT = 49;
	public static readonly LINE_COMMENT = 50;
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
	public static readonly RULE_functionCallStatement = 10;
	public static readonly RULE_ifStatement = 11;
	public static readonly RULE_cast = 12;
	public static readonly RULE_timeOp = 13;
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
		"throwStatement", "functionCallStatement", "ifStatement", "cast", "timeOp", 
		"functionCall", "expressionList", "expression", "literal", "numberLiteral", 
		"typeName",
	];

	private static readonly _LITERAL_NAMES: Array<string | undefined> = [
		undefined, "'contract'", "'{'", "'}'", "'function'", "'('", "','", "')'", 
		"'='", "';'", "'throw'", "'if'", "'else'", "'require'", "'tx.minTime'", 
		"'>='", "'tx.minAge'", "'.length'", "'.splice'", "'!'", "'~'", "'+'", 
		"'-'", "'/'", "'%'", "'<'", "'<='", "'>'", "'=='", "'!='", "'&'", "'^'", 
		"'|'", "'&&'", "'||'", "'int'", "'bool'", "'string'", "'pubkey'", "'sig'",
	];
	private static readonly _SYMBOLIC_NAMES: Array<string | undefined> = [
		undefined, undefined, undefined, undefined, undefined, undefined, undefined, 
		undefined, undefined, undefined, undefined, undefined, undefined, undefined, 
		undefined, undefined, undefined, undefined, undefined, undefined, undefined, 
		undefined, undefined, undefined, undefined, undefined, undefined, undefined, 
		undefined, undefined, undefined, undefined, undefined, undefined, undefined, 
		undefined, undefined, undefined, undefined, undefined, "Bytes", "BooleanLiteral", 
		"NumberUnit", "NumberLiteral", "StringLiteral", "HexLiteral", "GlobalFunction", 
		"Identifier", "WHITESPACE", "COMMENT", "LINE_COMMENT",
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
			while (((((_la - 35)) & ~0x1F) === 0 && ((1 << (_la - 35)) & ((1 << (CashScriptParser.T__34 - 35)) | (1 << (CashScriptParser.T__35 - 35)) | (1 << (CashScriptParser.T__36 - 35)) | (1 << (CashScriptParser.T__37 - 35)) | (1 << (CashScriptParser.T__38 - 35)) | (1 << (CashScriptParser.Bytes - 35)))) !== 0)) {
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
			while (_la === CashScriptParser.T__9 || _la === CashScriptParser.T__10 || ((((_la - 35)) & ~0x1F) === 0 && ((1 << (_la - 35)) & ((1 << (CashScriptParser.T__34 - 35)) | (1 << (CashScriptParser.T__35 - 35)) | (1 << (CashScriptParser.T__36 - 35)) | (1 << (CashScriptParser.T__37 - 35)) | (1 << (CashScriptParser.T__38 - 35)) | (1 << (CashScriptParser.Bytes - 35)) | (1 << (CashScriptParser.GlobalFunction - 35)) | (1 << (CashScriptParser.Identifier - 35)))) !== 0)) {
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
			if (((((_la - 35)) & ~0x1F) === 0 && ((1 << (_la - 35)) & ((1 << (CashScriptParser.T__34 - 35)) | (1 << (CashScriptParser.T__35 - 35)) | (1 << (CashScriptParser.T__36 - 35)) | (1 << (CashScriptParser.T__37 - 35)) | (1 << (CashScriptParser.T__38 - 35)) | (1 << (CashScriptParser.Bytes - 35)))) !== 0)) {
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
				while (_la === CashScriptParser.T__9 || _la === CashScriptParser.T__10 || ((((_la - 35)) & ~0x1F) === 0 && ((1 << (_la - 35)) & ((1 << (CashScriptParser.T__34 - 35)) | (1 << (CashScriptParser.T__35 - 35)) | (1 << (CashScriptParser.T__36 - 35)) | (1 << (CashScriptParser.T__37 - 35)) | (1 << (CashScriptParser.T__38 - 35)) | (1 << (CashScriptParser.Bytes - 35)) | (1 << (CashScriptParser.GlobalFunction - 35)) | (1 << (CashScriptParser.Identifier - 35)))) !== 0)) {
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
			case CashScriptParser.T__10:
			case CashScriptParser.T__34:
			case CashScriptParser.T__35:
			case CashScriptParser.T__36:
			case CashScriptParser.T__37:
			case CashScriptParser.T__38:
			case CashScriptParser.Bytes:
			case CashScriptParser.GlobalFunction:
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
			this.state = 105;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case CashScriptParser.T__34:
			case CashScriptParser.T__35:
			case CashScriptParser.T__36:
			case CashScriptParser.T__37:
			case CashScriptParser.T__38:
			case CashScriptParser.Bytes:
				this.enterOuterAlt(_localctx, 1);
				{
				this.state = 100;
				this.variableDefinition();
				}
				break;
			case CashScriptParser.Identifier:
				this.enterOuterAlt(_localctx, 2);
				{
				this.state = 101;
				this.assignStatement();
				}
				break;
			case CashScriptParser.T__9:
				this.enterOuterAlt(_localctx, 3);
				{
				this.state = 102;
				this.throwStatement();
				}
				break;
			case CashScriptParser.GlobalFunction:
				this.enterOuterAlt(_localctx, 4);
				{
				this.state = 103;
				this.functionCallStatement();
				}
				break;
			case CashScriptParser.T__10:
				this.enterOuterAlt(_localctx, 5);
				{
				this.state = 104;
				this.ifStatement();
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
	public variableDefinition(): VariableDefinitionContext {
		let _localctx: VariableDefinitionContext = new VariableDefinitionContext(this._ctx, this.state);
		this.enterRule(_localctx, 14, CashScriptParser.RULE_variableDefinition);
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 107;
			this.typeName();
			this.state = 108;
			this.match(CashScriptParser.Identifier);
			this.state = 109;
			this.match(CashScriptParser.T__7);
			this.state = 110;
			this.expression(0);
			this.state = 111;
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
			this.state = 113;
			this.match(CashScriptParser.Identifier);
			this.state = 114;
			this.match(CashScriptParser.T__7);
			this.state = 115;
			this.expression(0);
			this.state = 116;
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
			this.state = 118;
			this.match(CashScriptParser.T__9);
			this.state = 120;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if ((((_la) & ~0x1F) === 0 && ((1 << _la) & ((1 << CashScriptParser.T__4) | (1 << CashScriptParser.T__12) | (1 << CashScriptParser.T__18) | (1 << CashScriptParser.T__19) | (1 << CashScriptParser.T__20) | (1 << CashScriptParser.T__21))) !== 0) || ((((_la - 35)) & ~0x1F) === 0 && ((1 << (_la - 35)) & ((1 << (CashScriptParser.T__34 - 35)) | (1 << (CashScriptParser.T__35 - 35)) | (1 << (CashScriptParser.T__36 - 35)) | (1 << (CashScriptParser.T__37 - 35)) | (1 << (CashScriptParser.T__38 - 35)) | (1 << (CashScriptParser.Bytes - 35)) | (1 << (CashScriptParser.BooleanLiteral - 35)) | (1 << (CashScriptParser.NumberLiteral - 35)) | (1 << (CashScriptParser.StringLiteral - 35)) | (1 << (CashScriptParser.HexLiteral - 35)) | (1 << (CashScriptParser.GlobalFunction - 35)) | (1 << (CashScriptParser.Identifier - 35)))) !== 0)) {
				{
				this.state = 119;
				this.expression(0);
				}
			}

			this.state = 122;
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
		this.enterRule(_localctx, 20, CashScriptParser.RULE_functionCallStatement);
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 124;
			this.functionCall();
			this.state = 125;
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
		this.enterRule(_localctx, 22, CashScriptParser.RULE_ifStatement);
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 127;
			this.match(CashScriptParser.T__10);
			this.state = 128;
			this.match(CashScriptParser.T__4);
			this.state = 129;
			this.expression(0);
			this.state = 130;
			this.match(CashScriptParser.T__6);
			this.state = 131;
			_localctx._ifBlock = this.block();
			this.state = 134;
			this._errHandler.sync(this);
			switch ( this.interpreter.adaptivePredict(this._input, 9, this._ctx) ) {
			case 1:
				{
				this.state = 132;
				this.match(CashScriptParser.T__11);
				this.state = 133;
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
		this.enterRule(_localctx, 24, CashScriptParser.RULE_cast);
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 136;
			this.typeName();
			this.state = 137;
			this.match(CashScriptParser.T__4);
			this.state = 138;
			this.expression(0);
			this.state = 139;
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
	public timeOp(): TimeOpContext {
		let _localctx: TimeOpContext = new TimeOpContext(this._ctx, this.state);
		this.enterRule(_localctx, 26, CashScriptParser.RULE_timeOp);
		try {
			this.state = 155;
			this._errHandler.sync(this);
			switch ( this.interpreter.adaptivePredict(this._input, 10, this._ctx) ) {
			case 1:
				this.enterOuterAlt(_localctx, 1);
				{
				this.state = 141;
				this.match(CashScriptParser.T__12);
				this.state = 142;
				this.match(CashScriptParser.T__4);
				this.state = 143;
				_localctx._op = this.match(CashScriptParser.T__13);
				this.state = 144;
				this.match(CashScriptParser.T__14);
				this.state = 145;
				this.expression(0);
				this.state = 146;
				this.match(CashScriptParser.T__6);
				}
				break;

			case 2:
				this.enterOuterAlt(_localctx, 2);
				{
				this.state = 148;
				this.match(CashScriptParser.T__12);
				this.state = 149;
				this.match(CashScriptParser.T__4);
				this.state = 150;
				_localctx._op = this.match(CashScriptParser.T__15);
				this.state = 151;
				this.match(CashScriptParser.T__14);
				this.state = 152;
				this.expression(0);
				this.state = 153;
				this.match(CashScriptParser.T__6);
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
	public functionCall(): FunctionCallContext {
		let _localctx: FunctionCallContext = new FunctionCallContext(this._ctx, this.state);
		this.enterRule(_localctx, 28, CashScriptParser.RULE_functionCall);
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 157;
			this.match(CashScriptParser.GlobalFunction);
			this.state = 158;
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
			this.state = 160;
			this.match(CashScriptParser.T__4);
			this.state = 169;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if ((((_la) & ~0x1F) === 0 && ((1 << _la) & ((1 << CashScriptParser.T__4) | (1 << CashScriptParser.T__12) | (1 << CashScriptParser.T__18) | (1 << CashScriptParser.T__19) | (1 << CashScriptParser.T__20) | (1 << CashScriptParser.T__21))) !== 0) || ((((_la - 35)) & ~0x1F) === 0 && ((1 << (_la - 35)) & ((1 << (CashScriptParser.T__34 - 35)) | (1 << (CashScriptParser.T__35 - 35)) | (1 << (CashScriptParser.T__36 - 35)) | (1 << (CashScriptParser.T__37 - 35)) | (1 << (CashScriptParser.T__38 - 35)) | (1 << (CashScriptParser.Bytes - 35)) | (1 << (CashScriptParser.BooleanLiteral - 35)) | (1 << (CashScriptParser.NumberLiteral - 35)) | (1 << (CashScriptParser.StringLiteral - 35)) | (1 << (CashScriptParser.HexLiteral - 35)) | (1 << (CashScriptParser.GlobalFunction - 35)) | (1 << (CashScriptParser.Identifier - 35)))) !== 0)) {
				{
				this.state = 161;
				this.expression(0);
				this.state = 166;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				while (_la === CashScriptParser.T__5) {
					{
					{
					this.state = 162;
					this.match(CashScriptParser.T__5);
					this.state = 163;
					this.expression(0);
					}
					}
					this.state = 168;
					this._errHandler.sync(this);
					_la = this._input.LA(1);
				}
				}
			}

			this.state = 171;
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
			this.state = 185;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case CashScriptParser.T__4:
				{
				this.state = 174;
				this.match(CashScriptParser.T__4);
				this.state = 175;
				_localctx._paren = this.expression(0);
				this.state = 176;
				this.match(CashScriptParser.T__6);
				}
				break;
			case CashScriptParser.T__34:
			case CashScriptParser.T__35:
			case CashScriptParser.T__36:
			case CashScriptParser.T__37:
			case CashScriptParser.T__38:
			case CashScriptParser.Bytes:
				{
				this.state = 178;
				this.cast();
				}
				break;
			case CashScriptParser.T__12:
				{
				this.state = 179;
				this.timeOp();
				}
				break;
			case CashScriptParser.GlobalFunction:
				{
				this.state = 180;
				this.functionCall();
				}
				break;
			case CashScriptParser.T__18:
			case CashScriptParser.T__19:
			case CashScriptParser.T__20:
			case CashScriptParser.T__21:
				{
				this.state = 181;
				_localctx._op = this._input.LT(1);
				_la = this._input.LA(1);
				if (!((((_la) & ~0x1F) === 0 && ((1 << _la) & ((1 << CashScriptParser.T__18) | (1 << CashScriptParser.T__19) | (1 << CashScriptParser.T__20) | (1 << CashScriptParser.T__21))) !== 0))) {
					_localctx._op = this._errHandler.recoverInline(this);
				} else {
					if (this._input.LA(1) === Token.EOF) {
						this.matchedEOF = true;
					}

					this._errHandler.reportMatch(this);
					this.consume();
				}
				this.state = 182;
				_localctx._right = this.expression(12);
				}
				break;
			case CashScriptParser.Identifier:
				{
				this.state = 183;
				this.match(CashScriptParser.Identifier);
				}
				break;
			case CashScriptParser.BooleanLiteral:
			case CashScriptParser.NumberLiteral:
			case CashScriptParser.StringLiteral:
			case CashScriptParser.HexLiteral:
				{
				this.state = 184;
				this.literal();
				}
				break;
			default:
				throw new NoViableAltException(this);
			}
			this._ctx._stop = this._input.tryLT(-1);
			this.state = 224;
			this._errHandler.sync(this);
			_alt = this.interpreter.adaptivePredict(this._input, 15, this._ctx);
			while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
				if (_alt === 1) {
					if (this._parseListeners != null) {
						this.triggerExitRuleEvent();
					}
					_prevctx = _localctx;
					{
					this.state = 222;
					this._errHandler.sync(this);
					switch ( this.interpreter.adaptivePredict(this._input, 14, this._ctx) ) {
					case 1:
						{
						_localctx = new ExpressionContext(_parentctx, _parentState);
						_localctx._left = _prevctx;
						this.pushNewRecursionContext(_localctx, _startState, CashScriptParser.RULE_expression);
						this.state = 187;
						if (!(this.precpred(this._ctx, 11))) {
							throw new FailedPredicateException(this, "this.precpred(this._ctx, 11)");
						}
						this.state = 188;
						_localctx._op = this._input.LT(1);
						_la = this._input.LA(1);
						if (!(_la === CashScriptParser.T__22 || _la === CashScriptParser.T__23)) {
							_localctx._op = this._errHandler.recoverInline(this);
						} else {
							if (this._input.LA(1) === Token.EOF) {
								this.matchedEOF = true;
							}

							this._errHandler.reportMatch(this);
							this.consume();
						}
						this.state = 189;
						_localctx._right = this.expression(12);
						}
						break;

					case 2:
						{
						_localctx = new ExpressionContext(_parentctx, _parentState);
						_localctx._left = _prevctx;
						this.pushNewRecursionContext(_localctx, _startState, CashScriptParser.RULE_expression);
						this.state = 190;
						if (!(this.precpred(this._ctx, 10))) {
							throw new FailedPredicateException(this, "this.precpred(this._ctx, 10)");
						}
						this.state = 191;
						_localctx._op = this._input.LT(1);
						_la = this._input.LA(1);
						if (!(_la === CashScriptParser.T__20 || _la === CashScriptParser.T__21)) {
							_localctx._op = this._errHandler.recoverInline(this);
						} else {
							if (this._input.LA(1) === Token.EOF) {
								this.matchedEOF = true;
							}

							this._errHandler.reportMatch(this);
							this.consume();
						}
						this.state = 192;
						_localctx._right = this.expression(11);
						}
						break;

					case 3:
						{
						_localctx = new ExpressionContext(_parentctx, _parentState);
						_localctx._left = _prevctx;
						this.pushNewRecursionContext(_localctx, _startState, CashScriptParser.RULE_expression);
						this.state = 193;
						if (!(this.precpred(this._ctx, 9))) {
							throw new FailedPredicateException(this, "this.precpred(this._ctx, 9)");
						}
						this.state = 194;
						_localctx._op = this._input.LT(1);
						_la = this._input.LA(1);
						if (!((((_la) & ~0x1F) === 0 && ((1 << _la) & ((1 << CashScriptParser.T__14) | (1 << CashScriptParser.T__24) | (1 << CashScriptParser.T__25) | (1 << CashScriptParser.T__26))) !== 0))) {
							_localctx._op = this._errHandler.recoverInline(this);
						} else {
							if (this._input.LA(1) === Token.EOF) {
								this.matchedEOF = true;
							}

							this._errHandler.reportMatch(this);
							this.consume();
						}
						this.state = 195;
						_localctx._right = this.expression(10);
						}
						break;

					case 4:
						{
						_localctx = new ExpressionContext(_parentctx, _parentState);
						_localctx._left = _prevctx;
						this.pushNewRecursionContext(_localctx, _startState, CashScriptParser.RULE_expression);
						this.state = 196;
						if (!(this.precpred(this._ctx, 8))) {
							throw new FailedPredicateException(this, "this.precpred(this._ctx, 8)");
						}
						this.state = 197;
						_localctx._op = this._input.LT(1);
						_la = this._input.LA(1);
						if (!(_la === CashScriptParser.T__27 || _la === CashScriptParser.T__28)) {
							_localctx._op = this._errHandler.recoverInline(this);
						} else {
							if (this._input.LA(1) === Token.EOF) {
								this.matchedEOF = true;
							}

							this._errHandler.reportMatch(this);
							this.consume();
						}
						this.state = 198;
						_localctx._right = this.expression(9);
						}
						break;

					case 5:
						{
						_localctx = new ExpressionContext(_parentctx, _parentState);
						_localctx._left = _prevctx;
						this.pushNewRecursionContext(_localctx, _startState, CashScriptParser.RULE_expression);
						this.state = 199;
						if (!(this.precpred(this._ctx, 7))) {
							throw new FailedPredicateException(this, "this.precpred(this._ctx, 7)");
						}
						this.state = 200;
						_localctx._op = this.match(CashScriptParser.T__29);
						this.state = 201;
						_localctx._right = this.expression(8);
						}
						break;

					case 6:
						{
						_localctx = new ExpressionContext(_parentctx, _parentState);
						_localctx._left = _prevctx;
						this.pushNewRecursionContext(_localctx, _startState, CashScriptParser.RULE_expression);
						this.state = 202;
						if (!(this.precpred(this._ctx, 6))) {
							throw new FailedPredicateException(this, "this.precpred(this._ctx, 6)");
						}
						this.state = 203;
						_localctx._op = this.match(CashScriptParser.T__30);
						this.state = 204;
						_localctx._right = this.expression(7);
						}
						break;

					case 7:
						{
						_localctx = new ExpressionContext(_parentctx, _parentState);
						_localctx._left = _prevctx;
						this.pushNewRecursionContext(_localctx, _startState, CashScriptParser.RULE_expression);
						this.state = 205;
						if (!(this.precpred(this._ctx, 5))) {
							throw new FailedPredicateException(this, "this.precpred(this._ctx, 5)");
						}
						this.state = 206;
						_localctx._op = this.match(CashScriptParser.T__31);
						this.state = 207;
						_localctx._right = this.expression(6);
						}
						break;

					case 8:
						{
						_localctx = new ExpressionContext(_parentctx, _parentState);
						_localctx._left = _prevctx;
						this.pushNewRecursionContext(_localctx, _startState, CashScriptParser.RULE_expression);
						this.state = 208;
						if (!(this.precpred(this._ctx, 4))) {
							throw new FailedPredicateException(this, "this.precpred(this._ctx, 4)");
						}
						this.state = 209;
						_localctx._op = this.match(CashScriptParser.T__32);
						this.state = 210;
						_localctx._right = this.expression(5);
						}
						break;

					case 9:
						{
						_localctx = new ExpressionContext(_parentctx, _parentState);
						_localctx._left = _prevctx;
						this.pushNewRecursionContext(_localctx, _startState, CashScriptParser.RULE_expression);
						this.state = 211;
						if (!(this.precpred(this._ctx, 3))) {
							throw new FailedPredicateException(this, "this.precpred(this._ctx, 3)");
						}
						this.state = 212;
						_localctx._op = this.match(CashScriptParser.T__33);
						this.state = 213;
						_localctx._right = this.expression(4);
						}
						break;

					case 10:
						{
						_localctx = new ExpressionContext(_parentctx, _parentState);
						_localctx._obj = _prevctx;
						this.pushNewRecursionContext(_localctx, _startState, CashScriptParser.RULE_expression);
						this.state = 214;
						if (!(this.precpred(this._ctx, 14))) {
							throw new FailedPredicateException(this, "this.precpred(this._ctx, 14)");
						}
						this.state = 215;
						this.match(CashScriptParser.T__16);
						}
						break;

					case 11:
						{
						_localctx = new ExpressionContext(_parentctx, _parentState);
						_localctx._obj = _prevctx;
						this.pushNewRecursionContext(_localctx, _startState, CashScriptParser.RULE_expression);
						this.state = 216;
						if (!(this.precpred(this._ctx, 13))) {
							throw new FailedPredicateException(this, "this.precpred(this._ctx, 13)");
						}
						this.state = 217;
						this.match(CashScriptParser.T__17);
						this.state = 218;
						this.match(CashScriptParser.T__4);
						this.state = 219;
						_localctx._index = this.expression(0);
						this.state = 220;
						this.match(CashScriptParser.T__6);
						}
						break;
					}
					}
				}
				this.state = 226;
				this._errHandler.sync(this);
				_alt = this.interpreter.adaptivePredict(this._input, 15, this._ctx);
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
			this.state = 231;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case CashScriptParser.BooleanLiteral:
				this.enterOuterAlt(_localctx, 1);
				{
				this.state = 227;
				this.match(CashScriptParser.BooleanLiteral);
				}
				break;
			case CashScriptParser.NumberLiteral:
				this.enterOuterAlt(_localctx, 2);
				{
				this.state = 228;
				this.numberLiteral();
				}
				break;
			case CashScriptParser.StringLiteral:
				this.enterOuterAlt(_localctx, 3);
				{
				this.state = 229;
				this.match(CashScriptParser.StringLiteral);
				}
				break;
			case CashScriptParser.HexLiteral:
				this.enterOuterAlt(_localctx, 4);
				{
				this.state = 230;
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
			this.state = 233;
			this.match(CashScriptParser.NumberLiteral);
			this.state = 235;
			this._errHandler.sync(this);
			switch ( this.interpreter.adaptivePredict(this._input, 17, this._ctx) ) {
			case 1:
				{
				this.state = 234;
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
			this.state = 237;
			_la = this._input.LA(1);
			if (!(((((_la - 35)) & ~0x1F) === 0 && ((1 << (_la - 35)) & ((1 << (CashScriptParser.T__34 - 35)) | (1 << (CashScriptParser.T__35 - 35)) | (1 << (CashScriptParser.T__36 - 35)) | (1 << (CashScriptParser.T__37 - 35)) | (1 << (CashScriptParser.T__38 - 35)) | (1 << (CashScriptParser.Bytes - 35)))) !== 0))) {
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
			return this.precpred(this._ctx, 11);

		case 1:
			return this.precpred(this._ctx, 10);

		case 2:
			return this.precpred(this._ctx, 9);

		case 3:
			return this.precpred(this._ctx, 8);

		case 4:
			return this.precpred(this._ctx, 7);

		case 5:
			return this.precpred(this._ctx, 6);

		case 6:
			return this.precpred(this._ctx, 5);

		case 7:
			return this.precpred(this._ctx, 4);

		case 8:
			return this.precpred(this._ctx, 3);

		case 9:
			return this.precpred(this._ctx, 14);

		case 10:
			return this.precpred(this._ctx, 13);
		}
		return true;
	}

	public static readonly _serializedATN: string =
		"\x03\uC91D\uCABA\u058D\uAFBA\u4F53\u0607\uEA8B\uC241\x034\xF2\x04\x02" +
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
		"\b\x03\b\x03\b\x03\b\x03\b\x05\bl\n\b\x03\t\x03\t\x03\t\x03\t\x03\t\x03" +
		"\t\x03\n\x03\n\x03\n\x03\n\x03\n\x03\v\x03\v\x05\v{\n\v\x03\v\x03\v\x03" +
		"\f\x03\f\x03\f\x03\r\x03\r\x03\r\x03\r\x03\r\x03\r\x03\r\x05\r\x89\n\r" +
		"\x03\x0E\x03\x0E\x03\x0E\x03\x0E\x03\x0E\x03\x0F\x03\x0F\x03\x0F\x03\x0F" +
		"\x03\x0F\x03\x0F\x03\x0F\x03\x0F\x03\x0F\x03\x0F\x03\x0F\x03\x0F\x03\x0F" +
		"\x03\x0F\x05\x0F\x9E\n\x0F\x03\x10\x03\x10\x03\x10\x03\x11\x03\x11\x03" +
		"\x11\x03\x11\x07\x11\xA7\n\x11\f\x11\x0E\x11\xAA\v\x11\x05\x11\xAC\n\x11" +
		"\x03\x11\x03\x11\x03\x12\x03\x12\x03\x12\x03\x12\x03\x12\x03\x12\x03\x12" +
		"\x03\x12\x03\x12\x03\x12\x03\x12\x03\x12\x05\x12\xBC\n\x12\x03\x12\x03" +
		"\x12\x03\x12\x03\x12\x03\x12\x03\x12\x03\x12\x03\x12\x03\x12\x03\x12\x03" +
		"\x12\x03\x12\x03\x12\x03\x12\x03\x12\x03\x12\x03\x12\x03\x12\x03\x12\x03" +
		"\x12\x03\x12\x03\x12\x03\x12\x03\x12\x03\x12\x03\x12\x03\x12\x03\x12\x03" +
		"\x12\x03\x12\x03\x12\x03\x12\x03\x12\x03\x12\x03\x12\x07\x12\xE1\n\x12" +
		"\f\x12\x0E\x12\xE4\v\x12\x03\x13\x03\x13\x03\x13\x03\x13\x05\x13\xEA\n" +
		"\x13\x03\x14\x03\x14\x05\x14\xEE\n\x14\x03\x15\x03\x15\x03\x15\x02\x02" +
		"\x03\"\x16\x02\x02\x04\x02\x06\x02\b\x02\n\x02\f\x02\x0E\x02\x10\x02\x12" +
		"\x02\x14\x02\x16\x02\x18\x02\x1A\x02\x1C\x02\x1E\x02 \x02\"\x02$\x02&" +
		"\x02(\x02\x02\b\x03\x02\x15\x18\x03\x02\x19\x1A\x03\x02\x17\x18\x04\x02" +
		"\x11\x11\x1B\x1D\x03\x02\x1E\x1F\x03\x02%*\x02\u0102\x02*\x03\x02\x02" +
		"\x02\x04-\x03\x02\x02\x02\x06?\x03\x02\x02\x02\bK\x03\x02\x02\x02\nX\x03" +
		"\x02\x02\x02\fd\x03\x02\x02\x02\x0Ek\x03\x02\x02\x02\x10m\x03\x02\x02" +
		"\x02\x12s\x03\x02\x02\x02\x14x\x03\x02\x02\x02\x16~\x03\x02\x02\x02\x18" +
		"\x81\x03\x02\x02\x02\x1A\x8A\x03\x02\x02\x02\x1C\x9D\x03\x02\x02\x02\x1E" +
		"\x9F\x03\x02\x02\x02 \xA2\x03\x02\x02\x02\"\xBB\x03\x02\x02\x02$\xE9\x03" +
		"\x02\x02\x02&\xEB\x03\x02\x02\x02(\xEF\x03\x02\x02\x02*+\x05\x04\x03\x02" +
		"+,\x07\x02\x02\x03,\x03\x03\x02\x02\x02-.\x07\x03\x02\x02./\x071\x02\x02" +
		"/0\x05\b\x05\x0204\x07\x04\x02\x0213\x05\x10\t\x0221\x03\x02\x02\x023" +
		"6\x03\x02\x02\x0242\x03\x02\x02\x0245\x03\x02\x02\x025:\x03\x02\x02\x02" +
		"64\x03\x02\x02\x0279\x05\x06\x04\x0287\x03\x02\x02\x029<\x03\x02\x02\x02" +
		":8\x03\x02\x02\x02:;\x03\x02\x02\x02;=\x03\x02\x02\x02<:\x03\x02\x02\x02" +
		"=>\x07\x05\x02\x02>\x05\x03\x02\x02\x02?@\x07\x06\x02\x02@A\x071\x02\x02" +
		"AB\x05\b\x05\x02BF\x07\x04\x02\x02CE\x05\x0E\b\x02DC\x03\x02\x02\x02E" +
		"H\x03\x02\x02\x02FD\x03\x02\x02\x02FG\x03\x02\x02\x02GI\x03\x02\x02\x02" +
		"HF\x03\x02\x02\x02IJ\x07\x05\x02\x02J\x07\x03\x02\x02\x02KT\x07\x07\x02" +
		"\x02LQ\x05\n\x06\x02MN\x07\b\x02\x02NP\x05\n\x06\x02OM\x03\x02\x02\x02" +
		"PS\x03\x02\x02\x02QO\x03\x02\x02\x02QR\x03\x02\x02\x02RU\x03\x02\x02\x02" +
		"SQ\x03\x02\x02\x02TL\x03\x02\x02\x02TU\x03\x02\x02\x02UV\x03\x02\x02\x02" +
		"VW\x07\t\x02\x02W\t\x03\x02\x02\x02XY\x05(\x15\x02YZ\x071\x02\x02Z\v\x03" +
		"\x02\x02\x02[_\x07\x04\x02\x02\\^\x05\x0E\b\x02]\\\x03\x02\x02\x02^a\x03" +
		"\x02\x02\x02_]\x03\x02\x02\x02_`\x03\x02\x02\x02`b\x03\x02\x02\x02a_\x03" +
		"\x02\x02\x02be\x07\x05\x02\x02ce\x05\x0E\b\x02d[\x03\x02\x02\x02dc\x03" +
		"\x02\x02\x02e\r\x03\x02\x02\x02fl\x05\x10\t\x02gl\x05\x12\n\x02hl\x05" +
		"\x14\v\x02il\x05\x16\f\x02jl\x05\x18\r\x02kf\x03\x02\x02\x02kg\x03\x02" +
		"\x02\x02kh\x03\x02\x02\x02ki\x03\x02\x02\x02kj\x03\x02\x02\x02l\x0F\x03" +
		"\x02\x02\x02mn\x05(\x15\x02no\x071\x02\x02op\x07\n\x02\x02pq\x05\"\x12" +
		"\x02qr\x07\v\x02\x02r\x11\x03\x02\x02\x02st\x071\x02\x02tu\x07\n\x02\x02" +
		"uv\x05\"\x12\x02vw\x07\v\x02\x02w\x13\x03\x02\x02\x02xz\x07\f\x02\x02" +
		"y{\x05\"\x12\x02zy\x03\x02\x02\x02z{\x03\x02\x02\x02{|\x03\x02\x02\x02" +
		"|}\x07\v\x02\x02}\x15\x03\x02\x02\x02~\x7F\x05\x1E\x10\x02\x7F\x80\x07" +
		"\v\x02\x02\x80\x17\x03\x02\x02\x02\x81\x82\x07\r\x02\x02\x82\x83\x07\x07" +
		"\x02\x02\x83\x84\x05\"\x12\x02\x84\x85\x07\t\x02\x02\x85\x88\x05\f\x07" +
		"\x02\x86\x87\x07\x0E\x02\x02\x87\x89\x05\f\x07\x02\x88\x86\x03\x02\x02" +
		"\x02\x88\x89\x03\x02\x02\x02\x89\x19\x03\x02\x02\x02\x8A\x8B\x05(\x15" +
		"\x02\x8B\x8C\x07\x07\x02\x02\x8C\x8D\x05\"\x12\x02\x8D\x8E\x07\t\x02\x02" +
		"\x8E\x1B\x03\x02\x02\x02\x8F\x90\x07\x0F\x02\x02\x90\x91\x07\x07\x02\x02" +
		"\x91\x92\x07\x10\x02\x02\x92\x93\x07\x11\x02\x02\x93\x94\x05\"\x12\x02" +
		"\x94\x95\x07\t\x02\x02\x95\x9E\x03\x02\x02\x02\x96\x97\x07\x0F\x02\x02" +
		"\x97\x98\x07\x07\x02\x02\x98\x99\x07\x12\x02\x02\x99\x9A\x07\x11\x02\x02" +
		"\x9A\x9B\x05\"\x12\x02\x9B\x9C\x07\t\x02\x02\x9C\x9E\x03\x02\x02\x02\x9D" +
		"\x8F\x03\x02\x02\x02\x9D\x96\x03\x02\x02\x02\x9E\x1D\x03\x02\x02\x02\x9F" +
		"\xA0\x070\x02\x02\xA0\xA1\x05 \x11\x02\xA1\x1F\x03\x02\x02\x02\xA2\xAB" +
		"\x07\x07\x02\x02\xA3\xA8\x05\"\x12\x02\xA4\xA5\x07\b\x02\x02\xA5\xA7\x05" +
		"\"\x12\x02\xA6\xA4\x03\x02\x02\x02\xA7\xAA\x03\x02\x02\x02\xA8\xA6\x03" +
		"\x02\x02\x02\xA8\xA9\x03\x02\x02\x02\xA9\xAC\x03\x02\x02\x02\xAA\xA8\x03" +
		"\x02\x02\x02\xAB\xA3\x03\x02\x02\x02\xAB\xAC\x03\x02\x02\x02\xAC\xAD\x03" +
		"\x02\x02\x02\xAD\xAE\x07\t\x02\x02\xAE!\x03\x02\x02\x02\xAF\xB0\b\x12" +
		"\x01\x02\xB0\xB1\x07\x07\x02\x02\xB1\xB2\x05\"\x12\x02\xB2\xB3\x07\t\x02" +
		"\x02\xB3\xBC\x03\x02\x02\x02\xB4\xBC\x05\x1A\x0E\x02\xB5\xBC\x05\x1C\x0F" +
		"\x02\xB6\xBC\x05\x1E\x10\x02\xB7\xB8\t\x02\x02\x02\xB8\xBC\x05\"\x12\x0E" +
		"\xB9\xBC\x071\x02\x02\xBA\xBC\x05$\x13\x02\xBB\xAF\x03\x02\x02\x02\xBB" +
		"\xB4\x03\x02\x02\x02\xBB\xB5\x03\x02\x02\x02\xBB\xB6\x03\x02\x02\x02\xBB" +
		"\xB7\x03\x02\x02\x02\xBB\xB9\x03\x02\x02\x02\xBB\xBA\x03\x02\x02\x02\xBC" +
		"\xE2\x03\x02\x02\x02\xBD\xBE\f\r\x02\x02\xBE\xBF\t\x03\x02\x02\xBF\xE1" +
		"\x05\"\x12\x0E\xC0\xC1\f\f\x02\x02\xC1\xC2\t\x04\x02\x02\xC2\xE1\x05\"" +
		"\x12\r\xC3\xC4\f\v\x02\x02\xC4\xC5\t\x05\x02\x02\xC5\xE1\x05\"\x12\f\xC6" +
		"\xC7\f\n\x02\x02\xC7\xC8\t\x06\x02\x02\xC8\xE1\x05\"\x12\v\xC9\xCA\f\t" +
		"\x02\x02\xCA\xCB\x07 \x02\x02\xCB\xE1\x05\"\x12\n\xCC\xCD\f\b\x02\x02" +
		"\xCD\xCE\x07!\x02\x02\xCE\xE1\x05\"\x12\t\xCF\xD0\f\x07\x02\x02\xD0\xD1" +
		"\x07\"\x02\x02\xD1\xE1\x05\"\x12\b\xD2\xD3\f\x06\x02\x02\xD3\xD4\x07#" +
		"\x02\x02\xD4\xE1\x05\"\x12\x07\xD5\xD6\f\x05\x02\x02\xD6\xD7\x07$\x02" +
		"\x02\xD7\xE1\x05\"\x12\x06\xD8\xD9\f\x10\x02\x02\xD9\xE1\x07\x13\x02\x02" +
		"\xDA\xDB\f\x0F\x02\x02\xDB\xDC\x07\x14\x02\x02\xDC\xDD\x07\x07\x02\x02" +
		"\xDD\xDE\x05\"\x12\x02\xDE\xDF\x07\t\x02\x02\xDF\xE1\x03\x02\x02\x02\xE0" +
		"\xBD\x03\x02\x02\x02\xE0\xC0\x03\x02\x02\x02\xE0\xC3\x03\x02\x02\x02\xE0" +
		"\xC6\x03\x02\x02\x02\xE0\xC9\x03\x02\x02\x02\xE0\xCC\x03\x02\x02\x02\xE0" +
		"\xCF\x03\x02\x02\x02\xE0\xD2\x03\x02\x02\x02\xE0\xD5\x03\x02\x02\x02\xE0" +
		"\xD8\x03\x02\x02\x02\xE0\xDA\x03\x02\x02\x02\xE1\xE4\x03\x02\x02\x02\xE2" +
		"\xE0\x03\x02\x02\x02\xE2\xE3\x03\x02\x02\x02\xE3#\x03\x02\x02\x02\xE4" +
		"\xE2\x03\x02\x02\x02\xE5\xEA\x07+\x02\x02\xE6\xEA\x05&\x14\x02\xE7\xEA" +
		"\x07.\x02\x02\xE8\xEA\x07/\x02\x02\xE9\xE5\x03\x02\x02\x02\xE9\xE6\x03" +
		"\x02\x02\x02\xE9\xE7\x03\x02\x02\x02\xE9\xE8\x03\x02\x02\x02\xEA%\x03" +
		"\x02\x02\x02\xEB\xED\x07-\x02\x02\xEC\xEE\x07,\x02\x02\xED\xEC\x03\x02" +
		"\x02\x02\xED\xEE\x03\x02\x02\x02\xEE\'\x03\x02\x02\x02\xEF\xF0\t\x07\x02" +
		"\x02\xF0)\x03\x02\x02\x02\x144:FQT_dkz\x88\x9D\xA8\xAB\xBB\xE0\xE2\xE9" +
		"\xED";
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


export class TimeOpContext extends ParserRuleContext {
	public _op: Token;
	public expression(): ExpressionContext {
		return this.getRuleContext(0, ExpressionContext);
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return CashScriptParser.RULE_timeOp; }
	// @Override
	public enterRule(listener: CashScriptListener): void {
		if (listener.enterTimeOp) {
			listener.enterTimeOp(this);
		}
	}
	// @Override
	public exitRule(listener: CashScriptListener): void {
		if (listener.exitTimeOp) {
			listener.exitTimeOp(this);
		}
	}
	// @Override
	public accept<Result>(visitor: CashScriptVisitor<Result>): Result {
		if (visitor.visitTimeOp) {
			return visitor.visitTimeOp(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class FunctionCallContext extends ParserRuleContext {
	public GlobalFunction(): TerminalNode { return this.getToken(CashScriptParser.GlobalFunction, 0); }
	public expressionList(): ExpressionListContext {
		return this.getRuleContext(0, ExpressionListContext);
	}
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
	public timeOp(): TimeOpContext | undefined {
		return this.tryGetRuleContext(0, TimeOpContext);
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


