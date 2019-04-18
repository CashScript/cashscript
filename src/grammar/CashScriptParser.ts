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
	public static readonly T__39 = 40;
	public static readonly T__40 = 41;
	public static readonly Bytes = 42;
	public static readonly BooleanLiteral = 43;
	public static readonly NumberUnit = 44;
	public static readonly NumberLiteral = 45;
	public static readonly StringLiteral = 46;
	public static readonly HexLiteral = 47;
	public static readonly ReservedFunctions = 48;
	public static readonly Identifier = 49;
	public static readonly WHITESPACE = 50;
	public static readonly COMMENT = 51;
	public static readonly LINE_COMMENT = 52;
	public static readonly RULE_sourceFile = 0;
	public static readonly RULE_contractDefinition = 1;
	public static readonly RULE_functionDefinition = 2;
	public static readonly RULE_block = 3;
	public static readonly RULE_statement = 4;
	public static readonly RULE_variableDefinition = 5;
	public static readonly RULE_variableDeclaration = 6;
	public static readonly RULE_variableDeclarationStatement = 7;
	public static readonly RULE_assignStatement = 8;
	public static readonly RULE_ifStatement = 9;
	public static readonly RULE_returnStatement = 10;
	public static readonly RULE_functionCallStatement = 11;
	public static readonly RULE_functionCall = 12;
	public static readonly RULE_expressionList = 13;
	public static readonly RULE_parameterList = 14;
	public static readonly RULE_parameter = 15;
	public static readonly RULE_expression = 16;
	public static readonly RULE_literal = 17;
	public static readonly RULE_numberLiteral = 18;
	public static readonly RULE_typeName = 19;
	// tslint:disable:no-trailing-whitespace
	public static readonly ruleNames: string[] = [
		"sourceFile", "contractDefinition", "functionDefinition", "block", "statement", 
		"variableDefinition", "variableDeclaration", "variableDeclarationStatement", 
		"assignStatement", "ifStatement", "returnStatement", "functionCallStatement", 
		"functionCall", "expressionList", "parameterList", "parameter", "expression", 
		"literal", "numberLiteral", "typeName",
	];

	private static readonly _LITERAL_NAMES: Array<string | undefined> = [
		undefined, "'contract'", "'{'", "'}'", "'function'", "'='", "';'", "'if'", 
		"'('", "')'", "'else'", "'return'", "','", "'.'", "'++'", "'--'", "'!'", 
		"'~'", "'+'", "'-'", "'**'", "'/'", "'%'", "'<'", "'<='", "'>'", "'>='", 
		"'=='", "'!='", "'==='", "'!=='", "'&'", "'^'", "'|'", "'&&'", "'||'", 
		"'int'", "'string'", "'time'", "'address'", "'pubkey'", "'sig'",
	];
	private static readonly _SYMBOLIC_NAMES: Array<string | undefined> = [
		undefined, undefined, undefined, undefined, undefined, undefined, undefined, 
		undefined, undefined, undefined, undefined, undefined, undefined, undefined, 
		undefined, undefined, undefined, undefined, undefined, undefined, undefined, 
		undefined, undefined, undefined, undefined, undefined, undefined, undefined, 
		undefined, undefined, undefined, undefined, undefined, undefined, undefined, 
		undefined, undefined, undefined, undefined, undefined, undefined, undefined, 
		"Bytes", "BooleanLiteral", "NumberUnit", "NumberLiteral", "StringLiteral", 
		"HexLiteral", "ReservedFunctions", "Identifier", "WHITESPACE", "COMMENT", 
		"LINE_COMMENT",
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
			while (((((_la - 36)) & ~0x1F) === 0 && ((1 << (_la - 36)) & ((1 << (CashScriptParser.T__35 - 36)) | (1 << (CashScriptParser.T__36 - 36)) | (1 << (CashScriptParser.T__37 - 36)) | (1 << (CashScriptParser.T__38 - 36)) | (1 << (CashScriptParser.T__39 - 36)) | (1 << (CashScriptParser.T__40 - 36)) | (1 << (CashScriptParser.Bytes - 36)))) !== 0)) {
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
			this.parameterList();
			this.state = 63;
			this.match(CashScriptParser.T__1);
			this.state = 67;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while (_la === CashScriptParser.T__6 || _la === CashScriptParser.T__10 || ((((_la - 36)) & ~0x1F) === 0 && ((1 << (_la - 36)) & ((1 << (CashScriptParser.T__35 - 36)) | (1 << (CashScriptParser.T__36 - 36)) | (1 << (CashScriptParser.T__37 - 36)) | (1 << (CashScriptParser.T__38 - 36)) | (1 << (CashScriptParser.T__39 - 36)) | (1 << (CashScriptParser.T__40 - 36)) | (1 << (CashScriptParser.Bytes - 36)) | (1 << (CashScriptParser.Identifier - 36)))) !== 0)) {
				{
				{
				this.state = 64;
				this.statement();
				}
				}
				this.state = 69;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			}
			this.state = 70;
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
			this.state = 81;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case CashScriptParser.T__1:
				this.enterOuterAlt(_localctx, 1);
				{
				this.state = 72;
				this.match(CashScriptParser.T__1);
				this.state = 76;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				while (_la === CashScriptParser.T__6 || _la === CashScriptParser.T__10 || ((((_la - 36)) & ~0x1F) === 0 && ((1 << (_la - 36)) & ((1 << (CashScriptParser.T__35 - 36)) | (1 << (CashScriptParser.T__36 - 36)) | (1 << (CashScriptParser.T__37 - 36)) | (1 << (CashScriptParser.T__38 - 36)) | (1 << (CashScriptParser.T__39 - 36)) | (1 << (CashScriptParser.T__40 - 36)) | (1 << (CashScriptParser.Bytes - 36)) | (1 << (CashScriptParser.Identifier - 36)))) !== 0)) {
					{
					{
					this.state = 73;
					this.statement();
					}
					}
					this.state = 78;
					this._errHandler.sync(this);
					_la = this._input.LA(1);
				}
				this.state = 79;
				this.match(CashScriptParser.T__2);
				}
				break;
			case CashScriptParser.T__6:
			case CashScriptParser.T__10:
			case CashScriptParser.T__35:
			case CashScriptParser.T__36:
			case CashScriptParser.T__37:
			case CashScriptParser.T__38:
			case CashScriptParser.T__39:
			case CashScriptParser.T__40:
			case CashScriptParser.Bytes:
			case CashScriptParser.Identifier:
				this.enterOuterAlt(_localctx, 2);
				{
				this.state = 80;
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
			this.state = 89;
			this._errHandler.sync(this);
			switch ( this.interpreter.adaptivePredict(this._input, 5, this._ctx) ) {
			case 1:
				this.enterOuterAlt(_localctx, 1);
				{
				this.state = 83;
				this.variableDefinition();
				}
				break;

			case 2:
				this.enterOuterAlt(_localctx, 2);
				{
				this.state = 84;
				this.variableDeclarationStatement();
				}
				break;

			case 3:
				this.enterOuterAlt(_localctx, 3);
				{
				this.state = 85;
				this.assignStatement();
				}
				break;

			case 4:
				this.enterOuterAlt(_localctx, 4);
				{
				this.state = 86;
				this.ifStatement();
				}
				break;

			case 5:
				this.enterOuterAlt(_localctx, 5);
				{
				this.state = 87;
				this.returnStatement();
				}
				break;

			case 6:
				this.enterOuterAlt(_localctx, 6);
				{
				this.state = 88;
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
			this.state = 91;
			this.variableDeclaration();
			this.state = 92;
			this.match(CashScriptParser.T__4);
			this.state = 93;
			this.expression(0);
			this.state = 94;
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
	public variableDeclaration(): VariableDeclarationContext {
		let _localctx: VariableDeclarationContext = new VariableDeclarationContext(this._ctx, this.state);
		this.enterRule(_localctx, 12, CashScriptParser.RULE_variableDeclaration);
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 96;
			this.typeName();
			this.state = 97;
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
	public variableDeclarationStatement(): VariableDeclarationStatementContext {
		let _localctx: VariableDeclarationStatementContext = new VariableDeclarationStatementContext(this._ctx, this.state);
		this.enterRule(_localctx, 14, CashScriptParser.RULE_variableDeclarationStatement);
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 99;
			this.variableDeclaration();
			this.state = 100;
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
		this.enterRule(_localctx, 16, CashScriptParser.RULE_assignStatement);
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 102;
			this.match(CashScriptParser.Identifier);
			this.state = 103;
			this.match(CashScriptParser.T__4);
			this.state = 104;
			this.expression(0);
			this.state = 105;
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
		this.enterRule(_localctx, 18, CashScriptParser.RULE_ifStatement);
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 107;
			this.match(CashScriptParser.T__6);
			this.state = 108;
			this.match(CashScriptParser.T__7);
			this.state = 109;
			this.expression(0);
			this.state = 110;
			this.match(CashScriptParser.T__8);
			this.state = 111;
			this.block();
			this.state = 114;
			this._errHandler.sync(this);
			switch ( this.interpreter.adaptivePredict(this._input, 6, this._ctx) ) {
			case 1:
				{
				this.state = 112;
				this.match(CashScriptParser.T__9);
				this.state = 113;
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
		this.enterRule(_localctx, 20, CashScriptParser.RULE_returnStatement);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 116;
			this.match(CashScriptParser.T__10);
			this.state = 118;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if ((((_la) & ~0x1F) === 0 && ((1 << _la) & ((1 << CashScriptParser.T__7) | (1 << CashScriptParser.T__13) | (1 << CashScriptParser.T__14) | (1 << CashScriptParser.T__15) | (1 << CashScriptParser.T__16) | (1 << CashScriptParser.T__17) | (1 << CashScriptParser.T__18))) !== 0) || ((((_la - 36)) & ~0x1F) === 0 && ((1 << (_la - 36)) & ((1 << (CashScriptParser.T__35 - 36)) | (1 << (CashScriptParser.T__36 - 36)) | (1 << (CashScriptParser.T__37 - 36)) | (1 << (CashScriptParser.T__38 - 36)) | (1 << (CashScriptParser.T__39 - 36)) | (1 << (CashScriptParser.T__40 - 36)) | (1 << (CashScriptParser.Bytes - 36)) | (1 << (CashScriptParser.BooleanLiteral - 36)) | (1 << (CashScriptParser.NumberLiteral - 36)) | (1 << (CashScriptParser.StringLiteral - 36)) | (1 << (CashScriptParser.HexLiteral - 36)) | (1 << (CashScriptParser.Identifier - 36)))) !== 0)) {
				{
				this.state = 117;
				this.expression(0);
				}
			}

			this.state = 120;
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
		this.enterRule(_localctx, 22, CashScriptParser.RULE_functionCallStatement);
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 122;
			this.functionCall();
			this.state = 123;
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
		this.enterRule(_localctx, 24, CashScriptParser.RULE_functionCall);
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 125;
			this.match(CashScriptParser.Identifier);
			this.state = 126;
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
		this.enterRule(_localctx, 26, CashScriptParser.RULE_expressionList);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 128;
			this.match(CashScriptParser.T__7);
			this.state = 137;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if ((((_la) & ~0x1F) === 0 && ((1 << _la) & ((1 << CashScriptParser.T__7) | (1 << CashScriptParser.T__13) | (1 << CashScriptParser.T__14) | (1 << CashScriptParser.T__15) | (1 << CashScriptParser.T__16) | (1 << CashScriptParser.T__17) | (1 << CashScriptParser.T__18))) !== 0) || ((((_la - 36)) & ~0x1F) === 0 && ((1 << (_la - 36)) & ((1 << (CashScriptParser.T__35 - 36)) | (1 << (CashScriptParser.T__36 - 36)) | (1 << (CashScriptParser.T__37 - 36)) | (1 << (CashScriptParser.T__38 - 36)) | (1 << (CashScriptParser.T__39 - 36)) | (1 << (CashScriptParser.T__40 - 36)) | (1 << (CashScriptParser.Bytes - 36)) | (1 << (CashScriptParser.BooleanLiteral - 36)) | (1 << (CashScriptParser.NumberLiteral - 36)) | (1 << (CashScriptParser.StringLiteral - 36)) | (1 << (CashScriptParser.HexLiteral - 36)) | (1 << (CashScriptParser.Identifier - 36)))) !== 0)) {
				{
				this.state = 129;
				this.expression(0);
				this.state = 134;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				while (_la === CashScriptParser.T__11) {
					{
					{
					this.state = 130;
					this.match(CashScriptParser.T__11);
					this.state = 131;
					this.expression(0);
					}
					}
					this.state = 136;
					this._errHandler.sync(this);
					_la = this._input.LA(1);
				}
				}
			}

			this.state = 139;
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
		this.enterRule(_localctx, 28, CashScriptParser.RULE_parameterList);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 141;
			this.match(CashScriptParser.T__7);
			this.state = 150;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (((((_la - 36)) & ~0x1F) === 0 && ((1 << (_la - 36)) & ((1 << (CashScriptParser.T__35 - 36)) | (1 << (CashScriptParser.T__36 - 36)) | (1 << (CashScriptParser.T__37 - 36)) | (1 << (CashScriptParser.T__38 - 36)) | (1 << (CashScriptParser.T__39 - 36)) | (1 << (CashScriptParser.T__40 - 36)) | (1 << (CashScriptParser.Bytes - 36)))) !== 0)) {
				{
				this.state = 142;
				this.parameter();
				this.state = 147;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				while (_la === CashScriptParser.T__11) {
					{
					{
					this.state = 143;
					this.match(CashScriptParser.T__11);
					this.state = 144;
					this.parameter();
					}
					}
					this.state = 149;
					this._errHandler.sync(this);
					_la = this._input.LA(1);
				}
				}
			}

			this.state = 152;
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
		this.enterRule(_localctx, 30, CashScriptParser.RULE_parameter);
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 154;
			this.typeName();
			this.state = 155;
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
		let _startState: number = 32;
		this.enterRecursionRule(_localctx, 32, CashScriptParser.RULE_expression, _p);
		let _la: number;
		try {
			let _alt: number;
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 171;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case CashScriptParser.T__7:
				{
				this.state = 158;
				this.match(CashScriptParser.T__7);
				this.state = 159;
				this.expression(0);
				this.state = 160;
				this.match(CashScriptParser.T__8);
				}
				break;
			case CashScriptParser.Identifier:
				{
				this.state = 162;
				this.functionCall();
				}
				break;
			case CashScriptParser.T__35:
			case CashScriptParser.T__36:
			case CashScriptParser.T__37:
			case CashScriptParser.T__38:
			case CashScriptParser.T__39:
			case CashScriptParser.T__40:
			case CashScriptParser.Bytes:
				{
				this.state = 163;
				this.typeName();
				this.state = 164;
				this.match(CashScriptParser.T__7);
				this.state = 165;
				this.expression(0);
				this.state = 166;
				this.match(CashScriptParser.T__8);
				}
				break;
			case CashScriptParser.T__13:
			case CashScriptParser.T__14:
			case CashScriptParser.T__15:
			case CashScriptParser.T__16:
			case CashScriptParser.T__17:
			case CashScriptParser.T__18:
				{
				this.state = 168;
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
				this.state = 169;
				this.expression(12);
				}
				break;
			case CashScriptParser.BooleanLiteral:
			case CashScriptParser.NumberLiteral:
			case CashScriptParser.StringLiteral:
			case CashScriptParser.HexLiteral:
				{
				this.state = 170;
				this.literal();
				}
				break;
			default:
				throw new NoViableAltException(this);
			}
			this._ctx._stop = this._input.tryLT(-1);
			this.state = 210;
			this._errHandler.sync(this);
			_alt = this.interpreter.adaptivePredict(this._input, 14, this._ctx);
			while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
				if (_alt === 1) {
					if (this._parseListeners != null) {
						this.triggerExitRuleEvent();
					}
					_prevctx = _localctx;
					{
					this.state = 208;
					this._errHandler.sync(this);
					switch ( this.interpreter.adaptivePredict(this._input, 13, this._ctx) ) {
					case 1:
						{
						_localctx = new ExpressionContext(_parentctx, _parentState);
						this.pushNewRecursionContext(_localctx, _startState, CashScriptParser.RULE_expression);
						this.state = 173;
						if (!(this.precpred(this._ctx, 11))) {
							throw new FailedPredicateException(this, "this.precpred(this._ctx, 11)");
						}
						this.state = 174;
						this.match(CashScriptParser.T__19);
						this.state = 175;
						this.expression(12);
						}
						break;

					case 2:
						{
						_localctx = new ExpressionContext(_parentctx, _parentState);
						this.pushNewRecursionContext(_localctx, _startState, CashScriptParser.RULE_expression);
						this.state = 176;
						if (!(this.precpred(this._ctx, 10))) {
							throw new FailedPredicateException(this, "this.precpred(this._ctx, 10)");
						}
						this.state = 177;
						_la = this._input.LA(1);
						if (!(_la === CashScriptParser.T__20 || _la === CashScriptParser.T__21)) {
						this._errHandler.recoverInline(this);
						} else {
							if (this._input.LA(1) === Token.EOF) {
								this.matchedEOF = true;
							}

							this._errHandler.reportMatch(this);
							this.consume();
						}
						this.state = 178;
						this.expression(11);
						}
						break;

					case 3:
						{
						_localctx = new ExpressionContext(_parentctx, _parentState);
						this.pushNewRecursionContext(_localctx, _startState, CashScriptParser.RULE_expression);
						this.state = 179;
						if (!(this.precpred(this._ctx, 9))) {
							throw new FailedPredicateException(this, "this.precpred(this._ctx, 9)");
						}
						this.state = 180;
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
						this.state = 181;
						this.expression(10);
						}
						break;

					case 4:
						{
						_localctx = new ExpressionContext(_parentctx, _parentState);
						this.pushNewRecursionContext(_localctx, _startState, CashScriptParser.RULE_expression);
						this.state = 182;
						if (!(this.precpred(this._ctx, 8))) {
							throw new FailedPredicateException(this, "this.precpred(this._ctx, 8)");
						}
						this.state = 183;
						_la = this._input.LA(1);
						if (!((((_la) & ~0x1F) === 0 && ((1 << _la) & ((1 << CashScriptParser.T__22) | (1 << CashScriptParser.T__23) | (1 << CashScriptParser.T__24) | (1 << CashScriptParser.T__25))) !== 0))) {
						this._errHandler.recoverInline(this);
						} else {
							if (this._input.LA(1) === Token.EOF) {
								this.matchedEOF = true;
							}

							this._errHandler.reportMatch(this);
							this.consume();
						}
						this.state = 184;
						this.expression(9);
						}
						break;

					case 5:
						{
						_localctx = new ExpressionContext(_parentctx, _parentState);
						this.pushNewRecursionContext(_localctx, _startState, CashScriptParser.RULE_expression);
						this.state = 185;
						if (!(this.precpred(this._ctx, 7))) {
							throw new FailedPredicateException(this, "this.precpred(this._ctx, 7)");
						}
						this.state = 186;
						_la = this._input.LA(1);
						if (!((((_la) & ~0x1F) === 0 && ((1 << _la) & ((1 << CashScriptParser.T__26) | (1 << CashScriptParser.T__27) | (1 << CashScriptParser.T__28) | (1 << CashScriptParser.T__29))) !== 0))) {
						this._errHandler.recoverInline(this);
						} else {
							if (this._input.LA(1) === Token.EOF) {
								this.matchedEOF = true;
							}

							this._errHandler.reportMatch(this);
							this.consume();
						}
						this.state = 187;
						this.expression(8);
						}
						break;

					case 6:
						{
						_localctx = new ExpressionContext(_parentctx, _parentState);
						this.pushNewRecursionContext(_localctx, _startState, CashScriptParser.RULE_expression);
						this.state = 188;
						if (!(this.precpred(this._ctx, 6))) {
							throw new FailedPredicateException(this, "this.precpred(this._ctx, 6)");
						}
						this.state = 189;
						this.match(CashScriptParser.T__30);
						this.state = 190;
						this.expression(7);
						}
						break;

					case 7:
						{
						_localctx = new ExpressionContext(_parentctx, _parentState);
						this.pushNewRecursionContext(_localctx, _startState, CashScriptParser.RULE_expression);
						this.state = 191;
						if (!(this.precpred(this._ctx, 5))) {
							throw new FailedPredicateException(this, "this.precpred(this._ctx, 5)");
						}
						this.state = 192;
						this.match(CashScriptParser.T__31);
						this.state = 193;
						this.expression(6);
						}
						break;

					case 8:
						{
						_localctx = new ExpressionContext(_parentctx, _parentState);
						this.pushNewRecursionContext(_localctx, _startState, CashScriptParser.RULE_expression);
						this.state = 194;
						if (!(this.precpred(this._ctx, 4))) {
							throw new FailedPredicateException(this, "this.precpred(this._ctx, 4)");
						}
						this.state = 195;
						this.match(CashScriptParser.T__32);
						this.state = 196;
						this.expression(5);
						}
						break;

					case 9:
						{
						_localctx = new ExpressionContext(_parentctx, _parentState);
						this.pushNewRecursionContext(_localctx, _startState, CashScriptParser.RULE_expression);
						this.state = 197;
						if (!(this.precpred(this._ctx, 3))) {
							throw new FailedPredicateException(this, "this.precpred(this._ctx, 3)");
						}
						this.state = 198;
						this.match(CashScriptParser.T__33);
						this.state = 199;
						this.expression(4);
						}
						break;

					case 10:
						{
						_localctx = new ExpressionContext(_parentctx, _parentState);
						this.pushNewRecursionContext(_localctx, _startState, CashScriptParser.RULE_expression);
						this.state = 200;
						if (!(this.precpred(this._ctx, 2))) {
							throw new FailedPredicateException(this, "this.precpred(this._ctx, 2)");
						}
						this.state = 201;
						this.match(CashScriptParser.T__34);
						this.state = 202;
						this.expression(3);
						}
						break;

					case 11:
						{
						_localctx = new ExpressionContext(_parentctx, _parentState);
						this.pushNewRecursionContext(_localctx, _startState, CashScriptParser.RULE_expression);
						this.state = 203;
						if (!(this.precpred(this._ctx, 14))) {
							throw new FailedPredicateException(this, "this.precpred(this._ctx, 14)");
						}
						this.state = 204;
						this.match(CashScriptParser.T__12);
						this.state = 205;
						this.match(CashScriptParser.Identifier);
						}
						break;

					case 12:
						{
						_localctx = new ExpressionContext(_parentctx, _parentState);
						this.pushNewRecursionContext(_localctx, _startState, CashScriptParser.RULE_expression);
						this.state = 206;
						if (!(this.precpred(this._ctx, 13))) {
							throw new FailedPredicateException(this, "this.precpred(this._ctx, 13)");
						}
						this.state = 207;
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
				this.state = 212;
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
			this.state = 217;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case CashScriptParser.BooleanLiteral:
				this.enterOuterAlt(_localctx, 1);
				{
				this.state = 213;
				this.match(CashScriptParser.BooleanLiteral);
				}
				break;
			case CashScriptParser.NumberLiteral:
				this.enterOuterAlt(_localctx, 2);
				{
				this.state = 214;
				this.numberLiteral();
				}
				break;
			case CashScriptParser.StringLiteral:
				this.enterOuterAlt(_localctx, 3);
				{
				this.state = 215;
				this.match(CashScriptParser.StringLiteral);
				}
				break;
			case CashScriptParser.HexLiteral:
				this.enterOuterAlt(_localctx, 4);
				{
				this.state = 216;
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
			this.state = 219;
			this.match(CashScriptParser.NumberLiteral);
			this.state = 221;
			this._errHandler.sync(this);
			switch ( this.interpreter.adaptivePredict(this._input, 16, this._ctx) ) {
			case 1:
				{
				this.state = 220;
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
			this.state = 223;
			_la = this._input.LA(1);
			if (!(((((_la - 36)) & ~0x1F) === 0 && ((1 << (_la - 36)) & ((1 << (CashScriptParser.T__35 - 36)) | (1 << (CashScriptParser.T__36 - 36)) | (1 << (CashScriptParser.T__37 - 36)) | (1 << (CashScriptParser.T__38 - 36)) | (1 << (CashScriptParser.T__39 - 36)) | (1 << (CashScriptParser.T__40 - 36)) | (1 << (CashScriptParser.Bytes - 36)))) !== 0))) {
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
			return this.precpred(this._ctx, 2);

		case 10:
			return this.precpred(this._ctx, 14);

		case 11:
			return this.precpred(this._ctx, 13);
		}
		return true;
	}

	public static readonly _serializedATN: string =
		"\x03\uC91D\uCABA\u058D\uAFBA\u4F53\u0607\uEA8B\uC241\x036\xE4\x04\x02" +
		"\t\x02\x04\x03\t\x03\x04\x04\t\x04\x04\x05\t\x05\x04\x06\t\x06\x04\x07" +
		"\t\x07\x04\b\t\b\x04\t\t\t\x04\n\t\n\x04\v\t\v\x04\f\t\f\x04\r\t\r\x04" +
		"\x0E\t\x0E\x04\x0F\t\x0F\x04\x10\t\x10\x04\x11\t\x11\x04\x12\t\x12\x04" +
		"\x13\t\x13\x04\x14\t\x14\x04\x15\t\x15\x03\x02\x03\x02\x03\x02\x03\x03" +
		"\x03\x03\x03\x03\x03\x03\x03\x03\x07\x033\n\x03\f\x03\x0E\x036\v\x03\x03" +
		"\x03\x07\x039\n\x03\f\x03\x0E\x03<\v\x03\x03\x03\x03\x03\x03\x04\x03\x04" +
		"\x03\x04\x03\x04\x07\x04D\n\x04\f\x04\x0E\x04G\v\x04\x03\x04\x03\x04\x03" +
		"\x05\x03\x05\x07\x05M\n\x05\f\x05\x0E\x05P\v\x05\x03\x05\x03\x05\x05\x05" +
		"T\n\x05\x03\x06\x03\x06\x03\x06\x03\x06\x03\x06\x03\x06\x05\x06\\\n\x06" +
		"\x03\x07\x03\x07\x03\x07\x03\x07\x03\x07\x03\b\x03\b\x03\b\x03\t\x03\t" +
		"\x03\t\x03\n\x03\n\x03\n\x03\n\x03\n\x03\v\x03\v\x03\v\x03\v\x03\v\x03" +
		"\v\x03\v\x05\vu\n\v\x03\f\x03\f\x05\fy\n\f\x03\f\x03\f\x03\r\x03\r\x03" +
		"\r\x03\x0E\x03\x0E\x03\x0E\x03\x0F\x03\x0F\x03\x0F\x03\x0F\x07\x0F\x87" +
		"\n\x0F\f\x0F\x0E\x0F\x8A\v\x0F\x05\x0F\x8C\n\x0F\x03\x0F\x03\x0F\x03\x10" +
		"\x03\x10\x03\x10\x03\x10\x07\x10\x94\n\x10\f\x10\x0E\x10\x97\v\x10\x05" +
		"\x10\x99\n\x10\x03\x10\x03\x10\x03\x11\x03\x11\x03\x11\x03\x12\x03\x12" +
		"\x03\x12\x03\x12\x03\x12\x03\x12\x03\x12\x03\x12\x03\x12\x03\x12\x03\x12" +
		"\x03\x12\x03\x12\x03\x12\x05\x12\xAE\n\x12\x03\x12\x03\x12\x03\x12\x03" +
		"\x12\x03\x12\x03\x12\x03\x12\x03\x12\x03\x12\x03\x12\x03\x12\x03\x12\x03" +
		"\x12\x03\x12\x03\x12\x03\x12\x03\x12\x03\x12\x03\x12\x03\x12\x03\x12\x03" +
		"\x12\x03\x12\x03\x12\x03\x12\x03\x12\x03\x12\x03\x12\x03\x12\x03\x12\x03" +
		"\x12\x03\x12\x03\x12\x03\x12\x03\x12\x07\x12\xD3\n\x12\f\x12\x0E\x12\xD6" +
		"\v\x12\x03\x13\x03\x13\x03\x13\x03\x13\x05\x13\xDC\n\x13\x03\x14\x03\x14" +
		"\x05\x14\xE0\n\x14\x03\x15\x03\x15\x03\x15\x02\x02\x03\"\x16\x02\x02\x04" +
		"\x02\x06\x02\b\x02\n\x02\f\x02\x0E\x02\x10\x02\x12\x02\x14\x02\x16\x02" +
		"\x18\x02\x1A\x02\x1C\x02\x1E\x02 \x02\"\x02$\x02&\x02(\x02\x02\t\x03\x02" +
		"\x10\x15\x03\x02\x17\x18\x03\x02\x14\x15\x03\x02\x19\x1C\x03\x02\x1D " +
		"\x03\x02\x10\x11\x03\x02&,\x02\xF3\x02*\x03\x02\x02\x02\x04-\x03\x02\x02" +
		"\x02\x06?\x03\x02\x02\x02\bS\x03\x02\x02\x02\n[\x03\x02\x02\x02\f]\x03" +
		"\x02\x02\x02\x0Eb\x03\x02\x02\x02\x10e\x03\x02\x02\x02\x12h\x03\x02\x02" +
		"\x02\x14m\x03\x02\x02\x02\x16v\x03\x02\x02\x02\x18|\x03\x02\x02\x02\x1A" +
		"\x7F\x03\x02\x02\x02\x1C\x82\x03\x02\x02\x02\x1E\x8F\x03\x02\x02\x02 " +
		"\x9C\x03\x02\x02\x02\"\xAD\x03\x02\x02\x02$\xDB\x03\x02\x02\x02&\xDD\x03" +
		"\x02\x02\x02(\xE1\x03\x02\x02\x02*+\x05\x04\x03\x02+,\x07\x02\x02\x03" +
		",\x03\x03\x02\x02\x02-.\x07\x03\x02\x02./\x073\x02\x02/0\x05\x1E\x10\x02" +
		"04\x07\x04\x02\x0213\x05\f\x07\x0221\x03\x02\x02\x0236\x03\x02\x02\x02" +
		"42\x03\x02\x02\x0245\x03\x02\x02\x025:\x03\x02\x02\x0264\x03\x02\x02\x02" +
		"79\x05\x06\x04\x0287\x03\x02\x02\x029<\x03\x02\x02\x02:8\x03\x02\x02\x02" +
		":;\x03\x02\x02\x02;=\x03\x02\x02\x02<:\x03\x02\x02\x02=>\x07\x05\x02\x02" +
		">\x05\x03\x02\x02\x02?@\x07\x06\x02\x02@A\x05\x1E\x10\x02AE\x07\x04\x02" +
		"\x02BD\x05\n\x06\x02CB\x03\x02\x02\x02DG\x03\x02\x02\x02EC\x03\x02\x02" +
		"\x02EF\x03\x02\x02\x02FH\x03\x02\x02\x02GE\x03\x02\x02\x02HI\x07\x05\x02" +
		"\x02I\x07\x03\x02\x02\x02JN\x07\x04\x02\x02KM\x05\n\x06\x02LK\x03\x02" +
		"\x02\x02MP\x03\x02\x02\x02NL\x03\x02\x02\x02NO\x03\x02\x02\x02OQ\x03\x02" +
		"\x02\x02PN\x03\x02\x02\x02QT\x07\x05\x02\x02RT\x05\n\x06\x02SJ\x03\x02" +
		"\x02\x02SR\x03\x02\x02\x02T\t\x03\x02\x02\x02U\\\x05\f\x07\x02V\\\x05" +
		"\x10\t\x02W\\\x05\x12\n\x02X\\\x05\x14\v\x02Y\\\x05\x16\f\x02Z\\\x05\x18" +
		"\r\x02[U\x03\x02\x02\x02[V\x03\x02\x02\x02[W\x03\x02\x02\x02[X\x03\x02" +
		"\x02\x02[Y\x03\x02\x02\x02[Z\x03\x02\x02\x02\\\v\x03\x02\x02\x02]^\x05" +
		"\x0E\b\x02^_\x07\x07\x02\x02_`\x05\"\x12\x02`a\x07\b\x02\x02a\r\x03\x02" +
		"\x02\x02bc\x05(\x15\x02cd\x073\x02\x02d\x0F\x03\x02\x02\x02ef\x05\x0E" +
		"\b\x02fg\x07\b\x02\x02g\x11\x03\x02\x02\x02hi\x073\x02\x02ij\x07\x07\x02" +
		"\x02jk\x05\"\x12\x02kl\x07\b\x02\x02l\x13\x03\x02\x02\x02mn\x07\t\x02" +
		"\x02no\x07\n\x02\x02op\x05\"\x12\x02pq\x07\v\x02\x02qt\x05\b\x05\x02r" +
		"s\x07\f\x02\x02su\x05\b\x05\x02tr\x03\x02\x02\x02tu\x03\x02\x02\x02u\x15" +
		"\x03\x02\x02\x02vx\x07\r\x02\x02wy\x05\"\x12\x02xw\x03\x02\x02\x02xy\x03" +
		"\x02\x02\x02yz\x03\x02\x02\x02z{\x07\b\x02\x02{\x17\x03\x02\x02\x02|}" +
		"\x05\x1A\x0E\x02}~\x07\b\x02\x02~\x19\x03\x02\x02\x02\x7F\x80\x073\x02" +
		"\x02\x80\x81\x05\x1C\x0F\x02\x81\x1B\x03\x02\x02\x02\x82\x8B\x07\n\x02" +
		"\x02\x83\x88\x05\"\x12\x02\x84\x85\x07\x0E\x02\x02\x85\x87\x05\"\x12\x02" +
		"\x86\x84\x03\x02\x02\x02\x87\x8A\x03\x02\x02\x02\x88\x86\x03\x02\x02\x02" +
		"\x88\x89\x03\x02\x02\x02\x89\x8C\x03\x02\x02\x02\x8A\x88\x03\x02\x02\x02" +
		"\x8B\x83\x03\x02\x02\x02\x8B\x8C\x03\x02\x02\x02\x8C\x8D\x03\x02\x02\x02" +
		"\x8D\x8E\x07\v\x02\x02\x8E\x1D\x03\x02\x02\x02\x8F\x98\x07\n\x02\x02\x90" +
		"\x95\x05 \x11\x02\x91\x92\x07\x0E\x02\x02\x92\x94\x05 \x11\x02\x93\x91" +
		"\x03\x02\x02\x02\x94\x97\x03\x02\x02\x02\x95\x93\x03\x02\x02\x02\x95\x96" +
		"\x03\x02\x02\x02\x96\x99\x03\x02\x02\x02\x97\x95\x03\x02\x02\x02\x98\x90" +
		"\x03\x02\x02\x02\x98\x99\x03\x02\x02\x02\x99\x9A\x03\x02\x02\x02\x9A\x9B" +
		"\x07\v\x02\x02\x9B\x1F\x03\x02\x02\x02\x9C\x9D\x05(\x15\x02\x9D\x9E\x07" +
		"3\x02\x02\x9E!\x03\x02\x02\x02\x9F\xA0\b\x12\x01\x02\xA0\xA1\x07\n\x02" +
		"\x02\xA1\xA2\x05\"\x12\x02\xA2\xA3\x07\v\x02\x02\xA3\xAE\x03\x02\x02\x02" +
		"\xA4\xAE\x05\x1A\x0E\x02\xA5\xA6\x05(\x15\x02\xA6\xA7\x07\n\x02\x02\xA7" +
		"\xA8\x05\"\x12\x02\xA8\xA9\x07\v\x02\x02\xA9\xAE\x03\x02\x02\x02\xAA\xAB" +
		"\t\x02\x02\x02\xAB\xAE\x05\"\x12\x0E\xAC\xAE\x05$\x13\x02\xAD\x9F\x03" +
		"\x02\x02\x02\xAD\xA4\x03\x02\x02\x02\xAD\xA5\x03\x02\x02\x02\xAD\xAA\x03" +
		"\x02\x02\x02\xAD\xAC\x03\x02\x02\x02\xAE\xD4\x03\x02\x02\x02\xAF\xB0\f" +
		"\r\x02\x02\xB0\xB1\x07\x16\x02\x02\xB1\xD3\x05\"\x12\x0E\xB2\xB3\f\f\x02" +
		"\x02\xB3\xB4\t\x03\x02\x02\xB4\xD3\x05\"\x12\r\xB5\xB6\f\v\x02\x02\xB6" +
		"\xB7\t\x04\x02\x02\xB7\xD3\x05\"\x12\f\xB8\xB9\f\n\x02\x02\xB9\xBA\t\x05" +
		"\x02\x02\xBA\xD3\x05\"\x12\v\xBB\xBC\f\t\x02\x02\xBC\xBD\t\x06\x02\x02" +
		"\xBD\xD3\x05\"\x12\n\xBE\xBF\f\b\x02\x02\xBF\xC0\x07!\x02\x02\xC0\xD3" +
		"\x05\"\x12\t\xC1\xC2\f\x07\x02\x02\xC2\xC3\x07\"\x02\x02\xC3\xD3\x05\"" +
		"\x12\b\xC4\xC5\f\x06\x02\x02\xC5\xC6\x07#\x02\x02\xC6\xD3\x05\"\x12\x07" +
		"\xC7\xC8\f\x05\x02\x02\xC8\xC9\x07$\x02\x02\xC9\xD3\x05\"\x12\x06\xCA" +
		"\xCB\f\x04\x02\x02\xCB\xCC\x07%\x02\x02\xCC\xD3\x05\"\x12\x05\xCD\xCE" +
		"\f\x10\x02\x02\xCE\xCF\x07\x0F\x02\x02\xCF\xD3\x073\x02\x02\xD0\xD1\f" +
		"\x0F\x02\x02\xD1\xD3\t\x07\x02\x02\xD2\xAF\x03\x02\x02\x02\xD2\xB2\x03" +
		"\x02\x02\x02\xD2\xB5\x03\x02\x02\x02\xD2\xB8\x03\x02\x02\x02\xD2\xBB\x03" +
		"\x02\x02\x02\xD2\xBE\x03\x02\x02\x02\xD2\xC1\x03\x02\x02\x02\xD2\xC4\x03" +
		"\x02\x02\x02\xD2\xC7\x03\x02\x02\x02\xD2\xCA\x03\x02\x02\x02\xD2\xCD\x03" +
		"\x02\x02\x02\xD2\xD0\x03\x02\x02\x02\xD3\xD6\x03\x02\x02\x02\xD4\xD2\x03" +
		"\x02\x02\x02\xD4\xD5\x03\x02\x02\x02\xD5#\x03\x02\x02\x02\xD6\xD4\x03" +
		"\x02\x02\x02\xD7\xDC\x07-\x02\x02\xD8\xDC\x05&\x14\x02\xD9\xDC\x070\x02" +
		"\x02\xDA\xDC\x071\x02\x02\xDB\xD7\x03\x02\x02\x02\xDB\xD8\x03\x02\x02" +
		"\x02\xDB\xD9\x03\x02\x02\x02\xDB\xDA\x03\x02\x02\x02\xDC%\x03\x02\x02" +
		"\x02\xDD\xDF\x07/\x02\x02\xDE\xE0\x07.\x02\x02\xDF\xDE\x03\x02\x02\x02" +
		"\xDF\xE0\x03\x02\x02\x02\xE0\'\x03\x02\x02\x02\xE1\xE2\t\b\x02\x02\xE2" +
		")\x03\x02\x02\x02\x134:ENS[tx\x88\x8B\x95\x98\xAD\xD2\xD4\xDB\xDF";
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
	public variableDeclarationStatement(): VariableDeclarationStatementContext | undefined {
		return this.tryGetRuleContext(0, VariableDeclarationStatementContext);
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
	public variableDeclaration(): VariableDeclarationContext {
		return this.getRuleContext(0, VariableDeclarationContext);
	}
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


export class VariableDeclarationContext extends ParserRuleContext {
	public typeName(): TypeNameContext {
		return this.getRuleContext(0, TypeNameContext);
	}
	public Identifier(): TerminalNode { return this.getToken(CashScriptParser.Identifier, 0); }
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return CashScriptParser.RULE_variableDeclaration; }
	// @Override
	public enterRule(listener: CashScriptListener): void {
		if (listener.enterVariableDeclaration) {
			listener.enterVariableDeclaration(this);
		}
	}
	// @Override
	public exitRule(listener: CashScriptListener): void {
		if (listener.exitVariableDeclaration) {
			listener.exitVariableDeclaration(this);
		}
	}
	// @Override
	public accept<Result>(visitor: CashScriptVisitor<Result>): Result {
		if (visitor.visitVariableDeclaration) {
			return visitor.visitVariableDeclaration(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class VariableDeclarationStatementContext extends ParserRuleContext {
	public variableDeclaration(): VariableDeclarationContext {
		return this.getRuleContext(0, VariableDeclarationContext);
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return CashScriptParser.RULE_variableDeclarationStatement; }
	// @Override
	public enterRule(listener: CashScriptListener): void {
		if (listener.enterVariableDeclarationStatement) {
			listener.enterVariableDeclarationStatement(this);
		}
	}
	// @Override
	public exitRule(listener: CashScriptListener): void {
		if (listener.exitVariableDeclarationStatement) {
			listener.exitVariableDeclarationStatement(this);
		}
	}
	// @Override
	public accept<Result>(visitor: CashScriptVisitor<Result>): Result {
		if (visitor.visitVariableDeclarationStatement) {
			return visitor.visitVariableDeclarationStatement(this);
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
	public enterRule(listener: CashScriptListener): void {
		if (listener.enterReturnStatement) {
			listener.enterReturnStatement(this);
		}
	}
	// @Override
	public exitRule(listener: CashScriptListener): void {
		if (listener.exitReturnStatement) {
			listener.exitReturnStatement(this);
		}
	}
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
	public functionCall(): FunctionCallContext | undefined {
		return this.tryGetRuleContext(0, FunctionCallContext);
	}
	public typeName(): TypeNameContext | undefined {
		return this.tryGetRuleContext(0, TypeNameContext);
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


