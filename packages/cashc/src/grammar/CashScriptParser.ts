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
	public static readonly VersionLiteral = 42;
	public static readonly BooleanLiteral = 43;
	public static readonly NumberUnit = 44;
	public static readonly NumberLiteral = 45;
	public static readonly Bytes = 46;
	public static readonly Bound = 47;
	public static readonly StringLiteral = 48;
	public static readonly HexLiteral = 49;
	public static readonly TxVar = 50;
	public static readonly PreimageField = 51;
	public static readonly Identifier = 52;
	public static readonly WHITESPACE = 53;
	public static readonly COMMENT = 54;
	public static readonly LINE_COMMENT = 55;
	public static readonly RULE_sourceFile = 0;
	public static readonly RULE_pragmaDirective = 1;
	public static readonly RULE_pragmaName = 2;
	public static readonly RULE_pragmaValue = 3;
	public static readonly RULE_versionConstraint = 4;
	public static readonly RULE_versionOperator = 5;
	public static readonly RULE_contractDefinition = 6;
	public static readonly RULE_functionDefinition = 7;
	public static readonly RULE_parameterList = 8;
	public static readonly RULE_parameter = 9;
	public static readonly RULE_block = 10;
	public static readonly RULE_statement = 11;
	public static readonly RULE_variableDefinition = 12;
	public static readonly RULE_assignStatement = 13;
	public static readonly RULE_timeOpStatement = 14;
	public static readonly RULE_requireStatement = 15;
	public static readonly RULE_ifStatement = 16;
	public static readonly RULE_functionCall = 17;
	public static readonly RULE_expressionList = 18;
	public static readonly RULE_expression = 19;
	public static readonly RULE_literal = 20;
	public static readonly RULE_numberLiteral = 21;
	public static readonly RULE_typeName = 22;
	// tslint:disable:no-trailing-whitespace
	public static readonly ruleNames: string[] = [
		"sourceFile", "pragmaDirective", "pragmaName", "pragmaValue", "versionConstraint", 
		"versionOperator", "contractDefinition", "functionDefinition", "parameterList", 
		"parameter", "block", "statement", "variableDefinition", "assignStatement", 
		"timeOpStatement", "requireStatement", "ifStatement", "functionCall", 
		"expressionList", "expression", "literal", "numberLiteral", "typeName",
	];

	private static readonly _LITERAL_NAMES: Array<string | undefined> = [
		undefined, "'pragma'", "';'", "'cashscript'", "'^'", "'~'", "'>='", "'>'", 
		"'<'", "'<='", "'='", "'contract'", "'{'", "'}'", "'function'", "'('", 
		"','", "')'", "'require'", "'if'", "'else'", "'new'", "'['", "']'", "'.reverse()'", 
		"'.length'", "'!'", "'-'", "'.split'", "'/'", "'%'", "'+'", "'=='", "'!='", 
		"'&&'", "'||'", "'int'", "'bool'", "'string'", "'pubkey'", "'sig'", "'datasig'",
	];
	private static readonly _SYMBOLIC_NAMES: Array<string | undefined> = [
		undefined, undefined, undefined, undefined, undefined, undefined, undefined, 
		undefined, undefined, undefined, undefined, undefined, undefined, undefined, 
		undefined, undefined, undefined, undefined, undefined, undefined, undefined, 
		undefined, undefined, undefined, undefined, undefined, undefined, undefined, 
		undefined, undefined, undefined, undefined, undefined, undefined, undefined, 
		undefined, undefined, undefined, undefined, undefined, undefined, undefined, 
		"VersionLiteral", "BooleanLiteral", "NumberUnit", "NumberLiteral", "Bytes", 
		"Bound", "StringLiteral", "HexLiteral", "TxVar", "PreimageField", "Identifier", 
		"WHITESPACE", "COMMENT", "LINE_COMMENT",
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
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 49;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while (_la === CashScriptParser.T__0) {
				{
				{
				this.state = 46;
				this.pragmaDirective();
				}
				}
				this.state = 51;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			}
			this.state = 52;
			this.contractDefinition();
			this.state = 53;
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
	public pragmaDirective(): PragmaDirectiveContext {
		let _localctx: PragmaDirectiveContext = new PragmaDirectiveContext(this._ctx, this.state);
		this.enterRule(_localctx, 2, CashScriptParser.RULE_pragmaDirective);
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 55;
			this.match(CashScriptParser.T__0);
			this.state = 56;
			this.pragmaName();
			this.state = 57;
			this.pragmaValue();
			this.state = 58;
			this.match(CashScriptParser.T__1);
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
	public pragmaName(): PragmaNameContext {
		let _localctx: PragmaNameContext = new PragmaNameContext(this._ctx, this.state);
		this.enterRule(_localctx, 4, CashScriptParser.RULE_pragmaName);
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 60;
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
	public pragmaValue(): PragmaValueContext {
		let _localctx: PragmaValueContext = new PragmaValueContext(this._ctx, this.state);
		this.enterRule(_localctx, 6, CashScriptParser.RULE_pragmaValue);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 62;
			this.versionConstraint();
			this.state = 64;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if ((((_la) & ~0x1F) === 0 && ((1 << _la) & ((1 << CashScriptParser.T__3) | (1 << CashScriptParser.T__4) | (1 << CashScriptParser.T__5) | (1 << CashScriptParser.T__6) | (1 << CashScriptParser.T__7) | (1 << CashScriptParser.T__8) | (1 << CashScriptParser.T__9))) !== 0) || _la === CashScriptParser.VersionLiteral) {
				{
				this.state = 63;
				this.versionConstraint();
				}
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
	public versionConstraint(): VersionConstraintContext {
		let _localctx: VersionConstraintContext = new VersionConstraintContext(this._ctx, this.state);
		this.enterRule(_localctx, 8, CashScriptParser.RULE_versionConstraint);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 67;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if ((((_la) & ~0x1F) === 0 && ((1 << _la) & ((1 << CashScriptParser.T__3) | (1 << CashScriptParser.T__4) | (1 << CashScriptParser.T__5) | (1 << CashScriptParser.T__6) | (1 << CashScriptParser.T__7) | (1 << CashScriptParser.T__8) | (1 << CashScriptParser.T__9))) !== 0)) {
				{
				this.state = 66;
				this.versionOperator();
				}
			}

			this.state = 69;
			this.match(CashScriptParser.VersionLiteral);
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
	public versionOperator(): VersionOperatorContext {
		let _localctx: VersionOperatorContext = new VersionOperatorContext(this._ctx, this.state);
		this.enterRule(_localctx, 10, CashScriptParser.RULE_versionOperator);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 71;
			_la = this._input.LA(1);
			if (!((((_la) & ~0x1F) === 0 && ((1 << _la) & ((1 << CashScriptParser.T__3) | (1 << CashScriptParser.T__4) | (1 << CashScriptParser.T__5) | (1 << CashScriptParser.T__6) | (1 << CashScriptParser.T__7) | (1 << CashScriptParser.T__8) | (1 << CashScriptParser.T__9))) !== 0))) {
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
	// @RuleVersion(0)
	public contractDefinition(): ContractDefinitionContext {
		let _localctx: ContractDefinitionContext = new ContractDefinitionContext(this._ctx, this.state);
		this.enterRule(_localctx, 12, CashScriptParser.RULE_contractDefinition);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 73;
			this.match(CashScriptParser.T__10);
			this.state = 74;
			this.match(CashScriptParser.Identifier);
			this.state = 75;
			this.parameterList();
			this.state = 76;
			this.match(CashScriptParser.T__11);
			this.state = 80;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while (_la === CashScriptParser.T__13) {
				{
				{
				this.state = 77;
				this.functionDefinition();
				}
				}
				this.state = 82;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			}
			this.state = 83;
			this.match(CashScriptParser.T__12);
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
		this.enterRule(_localctx, 14, CashScriptParser.RULE_functionDefinition);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 85;
			this.match(CashScriptParser.T__13);
			this.state = 86;
			this.match(CashScriptParser.Identifier);
			this.state = 87;
			this.parameterList();
			this.state = 88;
			this.match(CashScriptParser.T__11);
			this.state = 92;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while (_la === CashScriptParser.T__17 || _la === CashScriptParser.T__18 || ((((_la - 36)) & ~0x1F) === 0 && ((1 << (_la - 36)) & ((1 << (CashScriptParser.T__35 - 36)) | (1 << (CashScriptParser.T__36 - 36)) | (1 << (CashScriptParser.T__37 - 36)) | (1 << (CashScriptParser.T__38 - 36)) | (1 << (CashScriptParser.T__39 - 36)) | (1 << (CashScriptParser.T__40 - 36)) | (1 << (CashScriptParser.Bytes - 36)) | (1 << (CashScriptParser.Identifier - 36)))) !== 0)) {
				{
				{
				this.state = 89;
				this.statement();
				}
				}
				this.state = 94;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			}
			this.state = 95;
			this.match(CashScriptParser.T__12);
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
		this.enterRule(_localctx, 16, CashScriptParser.RULE_parameterList);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 97;
			this.match(CashScriptParser.T__14);
			this.state = 106;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (((((_la - 36)) & ~0x1F) === 0 && ((1 << (_la - 36)) & ((1 << (CashScriptParser.T__35 - 36)) | (1 << (CashScriptParser.T__36 - 36)) | (1 << (CashScriptParser.T__37 - 36)) | (1 << (CashScriptParser.T__38 - 36)) | (1 << (CashScriptParser.T__39 - 36)) | (1 << (CashScriptParser.T__40 - 36)) | (1 << (CashScriptParser.Bytes - 36)))) !== 0)) {
				{
				this.state = 98;
				this.parameter();
				this.state = 103;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				while (_la === CashScriptParser.T__15) {
					{
					{
					this.state = 99;
					this.match(CashScriptParser.T__15);
					this.state = 100;
					this.parameter();
					}
					}
					this.state = 105;
					this._errHandler.sync(this);
					_la = this._input.LA(1);
				}
				}
			}

			this.state = 108;
			this.match(CashScriptParser.T__16);
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
		this.enterRule(_localctx, 18, CashScriptParser.RULE_parameter);
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 110;
			this.typeName();
			this.state = 111;
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
		this.enterRule(_localctx, 20, CashScriptParser.RULE_block);
		let _la: number;
		try {
			this.state = 122;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case CashScriptParser.T__11:
				this.enterOuterAlt(_localctx, 1);
				{
				this.state = 113;
				this.match(CashScriptParser.T__11);
				this.state = 117;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				while (_la === CashScriptParser.T__17 || _la === CashScriptParser.T__18 || ((((_la - 36)) & ~0x1F) === 0 && ((1 << (_la - 36)) & ((1 << (CashScriptParser.T__35 - 36)) | (1 << (CashScriptParser.T__36 - 36)) | (1 << (CashScriptParser.T__37 - 36)) | (1 << (CashScriptParser.T__38 - 36)) | (1 << (CashScriptParser.T__39 - 36)) | (1 << (CashScriptParser.T__40 - 36)) | (1 << (CashScriptParser.Bytes - 36)) | (1 << (CashScriptParser.Identifier - 36)))) !== 0)) {
					{
					{
					this.state = 114;
					this.statement();
					}
					}
					this.state = 119;
					this._errHandler.sync(this);
					_la = this._input.LA(1);
				}
				this.state = 120;
				this.match(CashScriptParser.T__12);
				}
				break;
			case CashScriptParser.T__17:
			case CashScriptParser.T__18:
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
				this.state = 121;
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
		this.enterRule(_localctx, 22, CashScriptParser.RULE_statement);
		try {
			this.state = 129;
			this._errHandler.sync(this);
			switch ( this.interpreter.adaptivePredict(this._input, 9, this._ctx) ) {
			case 1:
				this.enterOuterAlt(_localctx, 1);
				{
				this.state = 124;
				this.variableDefinition();
				}
				break;

			case 2:
				this.enterOuterAlt(_localctx, 2);
				{
				this.state = 125;
				this.assignStatement();
				}
				break;

			case 3:
				this.enterOuterAlt(_localctx, 3);
				{
				this.state = 126;
				this.timeOpStatement();
				}
				break;

			case 4:
				this.enterOuterAlt(_localctx, 4);
				{
				this.state = 127;
				this.requireStatement();
				}
				break;

			case 5:
				this.enterOuterAlt(_localctx, 5);
				{
				this.state = 128;
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
		this.enterRule(_localctx, 24, CashScriptParser.RULE_variableDefinition);
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 131;
			this.typeName();
			this.state = 132;
			this.match(CashScriptParser.Identifier);
			this.state = 133;
			this.match(CashScriptParser.T__9);
			this.state = 134;
			this.expression(0);
			this.state = 135;
			this.match(CashScriptParser.T__1);
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
		this.enterRule(_localctx, 26, CashScriptParser.RULE_assignStatement);
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 137;
			this.match(CashScriptParser.Identifier);
			this.state = 138;
			this.match(CashScriptParser.T__9);
			this.state = 139;
			this.expression(0);
			this.state = 140;
			this.match(CashScriptParser.T__1);
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
		this.enterRule(_localctx, 28, CashScriptParser.RULE_timeOpStatement);
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 142;
			this.match(CashScriptParser.T__17);
			this.state = 143;
			this.match(CashScriptParser.T__14);
			this.state = 144;
			this.match(CashScriptParser.TxVar);
			this.state = 145;
			this.match(CashScriptParser.T__5);
			this.state = 146;
			this.expression(0);
			this.state = 147;
			this.match(CashScriptParser.T__16);
			this.state = 148;
			this.match(CashScriptParser.T__1);
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
	public requireStatement(): RequireStatementContext {
		let _localctx: RequireStatementContext = new RequireStatementContext(this._ctx, this.state);
		this.enterRule(_localctx, 30, CashScriptParser.RULE_requireStatement);
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 150;
			this.match(CashScriptParser.T__17);
			this.state = 151;
			this.match(CashScriptParser.T__14);
			this.state = 152;
			this.expression(0);
			this.state = 153;
			this.match(CashScriptParser.T__16);
			this.state = 154;
			this.match(CashScriptParser.T__1);
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
		this.enterRule(_localctx, 32, CashScriptParser.RULE_ifStatement);
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 156;
			this.match(CashScriptParser.T__18);
			this.state = 157;
			this.match(CashScriptParser.T__14);
			this.state = 158;
			this.expression(0);
			this.state = 159;
			this.match(CashScriptParser.T__16);
			this.state = 160;
			_localctx._ifBlock = this.block();
			this.state = 163;
			this._errHandler.sync(this);
			switch ( this.interpreter.adaptivePredict(this._input, 10, this._ctx) ) {
			case 1:
				{
				this.state = 161;
				this.match(CashScriptParser.T__19);
				this.state = 162;
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
	public functionCall(): FunctionCallContext {
		let _localctx: FunctionCallContext = new FunctionCallContext(this._ctx, this.state);
		this.enterRule(_localctx, 34, CashScriptParser.RULE_functionCall);
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 165;
			this.match(CashScriptParser.Identifier);
			this.state = 166;
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
		this.enterRule(_localctx, 36, CashScriptParser.RULE_expressionList);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 168;
			this.match(CashScriptParser.T__14);
			this.state = 177;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if ((((_la) & ~0x1F) === 0 && ((1 << _la) & ((1 << CashScriptParser.T__14) | (1 << CashScriptParser.T__20) | (1 << CashScriptParser.T__21) | (1 << CashScriptParser.T__25) | (1 << CashScriptParser.T__26))) !== 0) || ((((_la - 36)) & ~0x1F) === 0 && ((1 << (_la - 36)) & ((1 << (CashScriptParser.T__35 - 36)) | (1 << (CashScriptParser.T__36 - 36)) | (1 << (CashScriptParser.T__37 - 36)) | (1 << (CashScriptParser.T__38 - 36)) | (1 << (CashScriptParser.T__39 - 36)) | (1 << (CashScriptParser.T__40 - 36)) | (1 << (CashScriptParser.BooleanLiteral - 36)) | (1 << (CashScriptParser.NumberLiteral - 36)) | (1 << (CashScriptParser.Bytes - 36)) | (1 << (CashScriptParser.StringLiteral - 36)) | (1 << (CashScriptParser.HexLiteral - 36)) | (1 << (CashScriptParser.PreimageField - 36)) | (1 << (CashScriptParser.Identifier - 36)))) !== 0)) {
				{
				this.state = 169;
				this.expression(0);
				this.state = 174;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				while (_la === CashScriptParser.T__15) {
					{
					{
					this.state = 170;
					this.match(CashScriptParser.T__15);
					this.state = 171;
					this.expression(0);
					}
					}
					this.state = 176;
					this._errHandler.sync(this);
					_la = this._input.LA(1);
				}
				}
			}

			this.state = 179;
			this.match(CashScriptParser.T__16);
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
		let _startState: number = 38;
		this.enterRecursionRule(_localctx, 38, CashScriptParser.RULE_expression, _p);
		let _la: number;
		try {
			let _alt: number;
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 212;
			this._errHandler.sync(this);
			switch ( this.interpreter.adaptivePredict(this._input, 15, this._ctx) ) {
			case 1:
				{
				_localctx = new ParenthesisedContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;

				this.state = 182;
				this.match(CashScriptParser.T__14);
				this.state = 183;
				this.expression(0);
				this.state = 184;
				this.match(CashScriptParser.T__16);
				}
				break;

			case 2:
				{
				_localctx = new CastContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 186;
				this.typeName();
				this.state = 187;
				this.match(CashScriptParser.T__14);
				this.state = 188;
				this.expression(0);
				this.state = 189;
				this.match(CashScriptParser.T__16);
				}
				break;

			case 3:
				{
				_localctx = new FunctionCallExpressionContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 191;
				this.functionCall();
				}
				break;

			case 4:
				{
				_localctx = new InstantationContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 192;
				this.match(CashScriptParser.T__20);
				this.state = 193;
				this.match(CashScriptParser.Identifier);
				this.state = 194;
				this.expressionList();
				}
				break;

			case 5:
				{
				_localctx = new UnaryOpContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 195;
				(_localctx as UnaryOpContext)._op = this._input.LT(1);
				_la = this._input.LA(1);
				if (!(_la === CashScriptParser.T__25 || _la === CashScriptParser.T__26)) {
					(_localctx as UnaryOpContext)._op = this._errHandler.recoverInline(this);
				} else {
					if (this._input.LA(1) === Token.EOF) {
						this.matchedEOF = true;
					}

					this._errHandler.reportMatch(this);
					this.consume();
				}
				this.state = 196;
				this.expression(12);
				}
				break;

			case 6:
				{
				_localctx = new ArrayContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 197;
				this.match(CashScriptParser.T__21);
				this.state = 206;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if ((((_la) & ~0x1F) === 0 && ((1 << _la) & ((1 << CashScriptParser.T__14) | (1 << CashScriptParser.T__20) | (1 << CashScriptParser.T__21) | (1 << CashScriptParser.T__25) | (1 << CashScriptParser.T__26))) !== 0) || ((((_la - 36)) & ~0x1F) === 0 && ((1 << (_la - 36)) & ((1 << (CashScriptParser.T__35 - 36)) | (1 << (CashScriptParser.T__36 - 36)) | (1 << (CashScriptParser.T__37 - 36)) | (1 << (CashScriptParser.T__38 - 36)) | (1 << (CashScriptParser.T__39 - 36)) | (1 << (CashScriptParser.T__40 - 36)) | (1 << (CashScriptParser.BooleanLiteral - 36)) | (1 << (CashScriptParser.NumberLiteral - 36)) | (1 << (CashScriptParser.Bytes - 36)) | (1 << (CashScriptParser.StringLiteral - 36)) | (1 << (CashScriptParser.HexLiteral - 36)) | (1 << (CashScriptParser.PreimageField - 36)) | (1 << (CashScriptParser.Identifier - 36)))) !== 0)) {
					{
					this.state = 198;
					this.expression(0);
					this.state = 203;
					this._errHandler.sync(this);
					_la = this._input.LA(1);
					while (_la === CashScriptParser.T__15) {
						{
						{
						this.state = 199;
						this.match(CashScriptParser.T__15);
						this.state = 200;
						this.expression(0);
						}
						}
						this.state = 205;
						this._errHandler.sync(this);
						_la = this._input.LA(1);
					}
					}
				}

				this.state = 208;
				this.match(CashScriptParser.T__22);
				}
				break;

			case 7:
				{
				_localctx = new PreimageFieldContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 209;
				this.match(CashScriptParser.PreimageField);
				}
				break;

			case 8:
				{
				_localctx = new IdentifierContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 210;
				this.match(CashScriptParser.Identifier);
				}
				break;

			case 9:
				{
				_localctx = new LiteralExpressionContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 211;
				this.literal();
				}
				break;
			}
			this._ctx._stop = this._input.tryLT(-1);
			this.state = 246;
			this._errHandler.sync(this);
			_alt = this.interpreter.adaptivePredict(this._input, 17, this._ctx);
			while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
				if (_alt === 1) {
					if (this._parseListeners != null) {
						this.triggerExitRuleEvent();
					}
					_prevctx = _localctx;
					{
					this.state = 244;
					this._errHandler.sync(this);
					switch ( this.interpreter.adaptivePredict(this._input, 16, this._ctx) ) {
					case 1:
						{
						_localctx = new BinaryOpContext(new ExpressionContext(_parentctx, _parentState));
						(_localctx as BinaryOpContext)._left = _prevctx;
						this.pushNewRecursionContext(_localctx, _startState, CashScriptParser.RULE_expression);
						this.state = 214;
						if (!(this.precpred(this._ctx, 10))) {
							throw new FailedPredicateException(this, "this.precpred(this._ctx, 10)");
						}
						this.state = 215;
						(_localctx as BinaryOpContext)._op = this._input.LT(1);
						_la = this._input.LA(1);
						if (!(_la === CashScriptParser.T__28 || _la === CashScriptParser.T__29)) {
							(_localctx as BinaryOpContext)._op = this._errHandler.recoverInline(this);
						} else {
							if (this._input.LA(1) === Token.EOF) {
								this.matchedEOF = true;
							}

							this._errHandler.reportMatch(this);
							this.consume();
						}
						this.state = 216;
						(_localctx as BinaryOpContext)._right = this.expression(11);
						}
						break;

					case 2:
						{
						_localctx = new BinaryOpContext(new ExpressionContext(_parentctx, _parentState));
						(_localctx as BinaryOpContext)._left = _prevctx;
						this.pushNewRecursionContext(_localctx, _startState, CashScriptParser.RULE_expression);
						this.state = 217;
						if (!(this.precpred(this._ctx, 9))) {
							throw new FailedPredicateException(this, "this.precpred(this._ctx, 9)");
						}
						this.state = 218;
						(_localctx as BinaryOpContext)._op = this._input.LT(1);
						_la = this._input.LA(1);
						if (!(_la === CashScriptParser.T__26 || _la === CashScriptParser.T__30)) {
							(_localctx as BinaryOpContext)._op = this._errHandler.recoverInline(this);
						} else {
							if (this._input.LA(1) === Token.EOF) {
								this.matchedEOF = true;
							}

							this._errHandler.reportMatch(this);
							this.consume();
						}
						this.state = 219;
						(_localctx as BinaryOpContext)._right = this.expression(10);
						}
						break;

					case 3:
						{
						_localctx = new BinaryOpContext(new ExpressionContext(_parentctx, _parentState));
						(_localctx as BinaryOpContext)._left = _prevctx;
						this.pushNewRecursionContext(_localctx, _startState, CashScriptParser.RULE_expression);
						this.state = 220;
						if (!(this.precpred(this._ctx, 8))) {
							throw new FailedPredicateException(this, "this.precpred(this._ctx, 8)");
						}
						this.state = 221;
						(_localctx as BinaryOpContext)._op = this._input.LT(1);
						_la = this._input.LA(1);
						if (!((((_la) & ~0x1F) === 0 && ((1 << _la) & ((1 << CashScriptParser.T__5) | (1 << CashScriptParser.T__6) | (1 << CashScriptParser.T__7) | (1 << CashScriptParser.T__8))) !== 0))) {
							(_localctx as BinaryOpContext)._op = this._errHandler.recoverInline(this);
						} else {
							if (this._input.LA(1) === Token.EOF) {
								this.matchedEOF = true;
							}

							this._errHandler.reportMatch(this);
							this.consume();
						}
						this.state = 222;
						(_localctx as BinaryOpContext)._right = this.expression(9);
						}
						break;

					case 4:
						{
						_localctx = new BinaryOpContext(new ExpressionContext(_parentctx, _parentState));
						(_localctx as BinaryOpContext)._left = _prevctx;
						this.pushNewRecursionContext(_localctx, _startState, CashScriptParser.RULE_expression);
						this.state = 223;
						if (!(this.precpred(this._ctx, 7))) {
							throw new FailedPredicateException(this, "this.precpred(this._ctx, 7)");
						}
						this.state = 224;
						(_localctx as BinaryOpContext)._op = this._input.LT(1);
						_la = this._input.LA(1);
						if (!(_la === CashScriptParser.T__31 || _la === CashScriptParser.T__32)) {
							(_localctx as BinaryOpContext)._op = this._errHandler.recoverInline(this);
						} else {
							if (this._input.LA(1) === Token.EOF) {
								this.matchedEOF = true;
							}

							this._errHandler.reportMatch(this);
							this.consume();
						}
						this.state = 225;
						(_localctx as BinaryOpContext)._right = this.expression(8);
						}
						break;

					case 5:
						{
						_localctx = new BinaryOpContext(new ExpressionContext(_parentctx, _parentState));
						(_localctx as BinaryOpContext)._left = _prevctx;
						this.pushNewRecursionContext(_localctx, _startState, CashScriptParser.RULE_expression);
						this.state = 226;
						if (!(this.precpred(this._ctx, 6))) {
							throw new FailedPredicateException(this, "this.precpred(this._ctx, 6)");
						}
						this.state = 227;
						(_localctx as BinaryOpContext)._op = this.match(CashScriptParser.T__33);
						this.state = 228;
						(_localctx as BinaryOpContext)._right = this.expression(7);
						}
						break;

					case 6:
						{
						_localctx = new BinaryOpContext(new ExpressionContext(_parentctx, _parentState));
						(_localctx as BinaryOpContext)._left = _prevctx;
						this.pushNewRecursionContext(_localctx, _startState, CashScriptParser.RULE_expression);
						this.state = 229;
						if (!(this.precpred(this._ctx, 5))) {
							throw new FailedPredicateException(this, "this.precpred(this._ctx, 5)");
						}
						this.state = 230;
						(_localctx as BinaryOpContext)._op = this.match(CashScriptParser.T__34);
						this.state = 231;
						(_localctx as BinaryOpContext)._right = this.expression(6);
						}
						break;

					case 7:
						{
						_localctx = new TupleIndexOpContext(new ExpressionContext(_parentctx, _parentState));
						this.pushNewRecursionContext(_localctx, _startState, CashScriptParser.RULE_expression);
						this.state = 232;
						if (!(this.precpred(this._ctx, 14))) {
							throw new FailedPredicateException(this, "this.precpred(this._ctx, 14)");
						}
						this.state = 233;
						this.match(CashScriptParser.T__21);
						this.state = 234;
						(_localctx as TupleIndexOpContext)._index = this.match(CashScriptParser.NumberLiteral);
						this.state = 235;
						this.match(CashScriptParser.T__22);
						}
						break;

					case 8:
						{
						_localctx = new UnaryOpContext(new ExpressionContext(_parentctx, _parentState));
						this.pushNewRecursionContext(_localctx, _startState, CashScriptParser.RULE_expression);
						this.state = 236;
						if (!(this.precpred(this._ctx, 13))) {
							throw new FailedPredicateException(this, "this.precpred(this._ctx, 13)");
						}
						this.state = 237;
						(_localctx as UnaryOpContext)._op = this._input.LT(1);
						_la = this._input.LA(1);
						if (!(_la === CashScriptParser.T__23 || _la === CashScriptParser.T__24)) {
							(_localctx as UnaryOpContext)._op = this._errHandler.recoverInline(this);
						} else {
							if (this._input.LA(1) === Token.EOF) {
								this.matchedEOF = true;
							}

							this._errHandler.reportMatch(this);
							this.consume();
						}
						}
						break;

					case 9:
						{
						_localctx = new BinaryOpContext(new ExpressionContext(_parentctx, _parentState));
						(_localctx as BinaryOpContext)._left = _prevctx;
						this.pushNewRecursionContext(_localctx, _startState, CashScriptParser.RULE_expression);
						this.state = 238;
						if (!(this.precpred(this._ctx, 11))) {
							throw new FailedPredicateException(this, "this.precpred(this._ctx, 11)");
						}
						this.state = 239;
						(_localctx as BinaryOpContext)._op = this.match(CashScriptParser.T__27);
						this.state = 240;
						this.match(CashScriptParser.T__14);
						this.state = 241;
						(_localctx as BinaryOpContext)._right = this.expression(0);
						this.state = 242;
						this.match(CashScriptParser.T__16);
						}
						break;
					}
					}
				}
				this.state = 248;
				this._errHandler.sync(this);
				_alt = this.interpreter.adaptivePredict(this._input, 17, this._ctx);
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
		this.enterRule(_localctx, 40, CashScriptParser.RULE_literal);
		try {
			this.state = 253;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case CashScriptParser.BooleanLiteral:
				this.enterOuterAlt(_localctx, 1);
				{
				this.state = 249;
				this.match(CashScriptParser.BooleanLiteral);
				}
				break;
			case CashScriptParser.NumberLiteral:
				this.enterOuterAlt(_localctx, 2);
				{
				this.state = 250;
				this.numberLiteral();
				}
				break;
			case CashScriptParser.StringLiteral:
				this.enterOuterAlt(_localctx, 3);
				{
				this.state = 251;
				this.match(CashScriptParser.StringLiteral);
				}
				break;
			case CashScriptParser.HexLiteral:
				this.enterOuterAlt(_localctx, 4);
				{
				this.state = 252;
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
		this.enterRule(_localctx, 42, CashScriptParser.RULE_numberLiteral);
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 255;
			this.match(CashScriptParser.NumberLiteral);
			this.state = 257;
			this._errHandler.sync(this);
			switch ( this.interpreter.adaptivePredict(this._input, 19, this._ctx) ) {
			case 1:
				{
				this.state = 256;
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
		this.enterRule(_localctx, 44, CashScriptParser.RULE_typeName);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 259;
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
		case 19:
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
			return this.precpred(this._ctx, 14);

		case 7:
			return this.precpred(this._ctx, 13);

		case 8:
			return this.precpred(this._ctx, 11);
		}
		return true;
	}

	public static readonly _serializedATN: string =
		"\x03\uC91D\uCABA\u058D\uAFBA\u4F53\u0607\uEA8B\uC241\x039\u0108\x04\x02" +
		"\t\x02\x04\x03\t\x03\x04\x04\t\x04\x04\x05\t\x05\x04\x06\t\x06\x04\x07" +
		"\t\x07\x04\b\t\b\x04\t\t\t\x04\n\t\n\x04\v\t\v\x04\f\t\f\x04\r\t\r\x04" +
		"\x0E\t\x0E\x04\x0F\t\x0F\x04\x10\t\x10\x04\x11\t\x11\x04\x12\t\x12\x04" +
		"\x13\t\x13\x04\x14\t\x14\x04\x15\t\x15\x04\x16\t\x16\x04\x17\t\x17\x04" +
		"\x18\t\x18\x03\x02\x07\x022\n\x02\f\x02\x0E\x025\v\x02\x03\x02\x03\x02" +
		"\x03\x02\x03\x03\x03\x03\x03\x03\x03\x03\x03\x03\x03\x04\x03\x04\x03\x05" +
		"\x03\x05\x05\x05C\n\x05\x03\x06\x05\x06F\n\x06\x03\x06\x03\x06\x03\x07" +
		"\x03\x07\x03\b\x03\b\x03\b\x03\b\x03\b\x07\bQ\n\b\f\b\x0E\bT\v\b\x03\b" +
		"\x03\b\x03\t\x03\t\x03\t\x03\t\x03\t\x07\t]\n\t\f\t\x0E\t`\v\t\x03\t\x03" +
		"\t\x03\n\x03\n\x03\n\x03\n\x07\nh\n\n\f\n\x0E\nk\v\n\x05\nm\n\n\x03\n" +
		"\x03\n\x03\v\x03\v\x03\v\x03\f\x03\f\x07\fv\n\f\f\f\x0E\fy\v\f\x03\f\x03" +
		"\f\x05\f}\n\f\x03\r\x03\r\x03\r\x03\r\x03\r\x05\r\x84\n\r\x03\x0E\x03" +
		"\x0E\x03\x0E\x03\x0E\x03\x0E\x03\x0E\x03\x0F\x03\x0F\x03\x0F\x03\x0F\x03" +
		"\x0F\x03\x10\x03\x10\x03\x10\x03\x10\x03\x10\x03\x10\x03\x10\x03\x10\x03" +
		"\x11\x03\x11\x03\x11\x03\x11\x03\x11\x03\x11\x03\x12\x03\x12\x03\x12\x03" +
		"\x12\x03\x12\x03\x12\x03\x12\x05\x12\xA6\n\x12\x03\x13\x03\x13\x03\x13" +
		"\x03\x14\x03\x14\x03\x14\x03\x14\x07\x14\xAF\n\x14\f\x14\x0E\x14\xB2\v" +
		"\x14\x05\x14\xB4\n\x14\x03\x14\x03\x14\x03\x15\x03\x15\x03\x15\x03\x15" +
		"\x03\x15\x03\x15\x03\x15\x03\x15\x03\x15\x03\x15\x03\x15\x03\x15\x03\x15" +
		"\x03\x15\x03\x15\x03\x15\x03\x15\x03\x15\x03\x15\x03\x15\x07\x15\xCC\n" +
		"\x15\f\x15\x0E\x15\xCF\v\x15\x05\x15\xD1\n\x15\x03\x15\x03\x15\x03\x15" +
		"\x03\x15\x05\x15\xD7\n\x15\x03\x15\x03\x15\x03\x15\x03\x15\x03\x15\x03" +
		"\x15\x03\x15\x03\x15\x03\x15\x03\x15\x03\x15\x03\x15\x03\x15\x03\x15\x03" +
		"\x15\x03\x15\x03\x15\x03\x15\x03\x15\x03\x15\x03\x15\x03\x15\x03\x15\x03" +
		"\x15\x03\x15\x03\x15\x03\x15\x03\x15\x03\x15\x03\x15\x07\x15\xF7\n\x15" +
		"\f\x15\x0E\x15\xFA\v\x15\x03\x16\x03\x16\x03\x16\x03\x16\x05\x16\u0100" +
		"\n\x16\x03\x17\x03\x17\x05\x17\u0104\n\x17\x03\x18\x03\x18\x03\x18\x02" +
		"\x02\x03(\x19\x02\x02\x04\x02\x06\x02\b\x02\n\x02\f\x02\x0E\x02\x10\x02" +
		"\x12\x02\x14\x02\x16\x02\x18\x02\x1A\x02\x1C\x02\x1E\x02 \x02\"\x02$\x02" +
		"&\x02(\x02*\x02,\x02.\x02\x02\n\x03\x02\x06\f\x03\x02\x1C\x1D\x03\x02" +
		"\x1F \x04\x02\x1D\x1D!!\x03\x02\b\v\x03\x02\"#\x03\x02\x1A\x1B\x04\x02" +
		"&+00\x02\u0117\x023\x03\x02\x02\x02\x049\x03\x02\x02\x02\x06>\x03\x02" +
		"\x02\x02\b@\x03\x02\x02\x02\nE\x03\x02\x02\x02\fI\x03\x02\x02\x02\x0E" +
		"K\x03\x02\x02\x02\x10W\x03\x02\x02\x02\x12c\x03\x02\x02\x02\x14p\x03\x02" +
		"\x02\x02\x16|\x03\x02\x02\x02\x18\x83\x03\x02\x02\x02\x1A\x85\x03\x02" +
		"\x02\x02\x1C\x8B\x03\x02\x02\x02\x1E\x90\x03\x02\x02\x02 \x98\x03\x02" +
		"\x02\x02\"\x9E\x03\x02\x02\x02$\xA7\x03\x02\x02\x02&\xAA\x03\x02\x02\x02" +
		"(\xD6\x03\x02\x02\x02*\xFF\x03\x02\x02\x02,\u0101\x03\x02\x02\x02.\u0105" +
		"\x03\x02\x02\x0202\x05\x04\x03\x0210\x03\x02\x02\x0225\x03\x02\x02\x02" +
		"31\x03\x02\x02\x0234\x03\x02\x02\x0246\x03\x02\x02\x0253\x03\x02\x02\x02" +
		"67\x05\x0E\b\x0278\x07\x02\x02\x038\x03\x03\x02\x02\x029:\x07\x03\x02" +
		"\x02:;\x05\x06\x04\x02;<\x05\b\x05\x02<=\x07\x04\x02\x02=\x05\x03\x02" +
		"\x02\x02>?\x07\x05\x02\x02?\x07\x03\x02\x02\x02@B\x05\n\x06\x02AC\x05" +
		"\n\x06\x02BA\x03\x02\x02\x02BC\x03\x02\x02\x02C\t\x03\x02\x02\x02DF\x05" +
		"\f\x07\x02ED\x03\x02\x02\x02EF\x03\x02\x02\x02FG\x03\x02\x02\x02GH\x07" +
		",\x02\x02H\v\x03\x02\x02\x02IJ\t\x02\x02\x02J\r\x03\x02\x02\x02KL\x07" +
		"\r\x02\x02LM\x076\x02\x02MN\x05\x12\n\x02NR\x07\x0E\x02\x02OQ\x05\x10" +
		"\t\x02PO\x03\x02\x02\x02QT\x03\x02\x02\x02RP\x03\x02\x02\x02RS\x03\x02" +
		"\x02\x02SU\x03\x02\x02\x02TR\x03\x02\x02\x02UV\x07\x0F\x02\x02V\x0F\x03" +
		"\x02\x02\x02WX\x07\x10\x02\x02XY\x076\x02\x02YZ\x05\x12\n\x02Z^\x07\x0E" +
		"\x02\x02[]\x05\x18\r\x02\\[\x03\x02\x02\x02]`\x03\x02\x02\x02^\\\x03\x02" +
		"\x02\x02^_\x03\x02\x02\x02_a\x03\x02\x02\x02`^\x03\x02\x02\x02ab\x07\x0F" +
		"\x02\x02b\x11\x03\x02\x02\x02cl\x07\x11\x02\x02di\x05\x14\v\x02ef\x07" +
		"\x12\x02\x02fh\x05\x14\v\x02ge\x03\x02\x02\x02hk\x03\x02\x02\x02ig\x03" +
		"\x02\x02\x02ij\x03\x02\x02\x02jm\x03\x02\x02\x02ki\x03\x02\x02\x02ld\x03" +
		"\x02\x02\x02lm\x03\x02\x02\x02mn\x03\x02\x02\x02no\x07\x13\x02\x02o\x13" +
		"\x03\x02\x02\x02pq\x05.\x18\x02qr\x076\x02\x02r\x15\x03\x02\x02\x02sw" +
		"\x07\x0E\x02\x02tv\x05\x18\r\x02ut\x03\x02\x02\x02vy\x03\x02\x02\x02w" +
		"u\x03\x02\x02\x02wx\x03\x02\x02\x02xz\x03\x02\x02\x02yw\x03\x02\x02\x02" +
		"z}\x07\x0F\x02\x02{}\x05\x18\r\x02|s\x03\x02\x02\x02|{\x03\x02\x02\x02" +
		"}\x17\x03\x02\x02\x02~\x84\x05\x1A\x0E\x02\x7F\x84\x05\x1C\x0F\x02\x80" +
		"\x84\x05\x1E\x10\x02\x81\x84\x05 \x11\x02\x82\x84\x05\"\x12\x02\x83~\x03" +
		"\x02\x02\x02\x83\x7F\x03\x02\x02\x02\x83\x80\x03\x02\x02\x02\x83\x81\x03" +
		"\x02\x02\x02\x83\x82\x03\x02\x02\x02\x84\x19\x03\x02\x02\x02\x85\x86\x05" +
		".\x18\x02\x86\x87\x076\x02\x02\x87\x88\x07\f\x02\x02\x88\x89\x05(\x15" +
		"\x02\x89\x8A\x07\x04\x02\x02\x8A\x1B\x03\x02\x02\x02\x8B\x8C\x076\x02" +
		"\x02\x8C\x8D\x07\f\x02\x02\x8D\x8E\x05(\x15\x02\x8E\x8F\x07\x04\x02\x02" +
		"\x8F\x1D\x03\x02\x02\x02\x90\x91\x07\x14\x02\x02\x91\x92\x07\x11\x02\x02" +
		"\x92\x93\x074\x02\x02\x93\x94\x07\b\x02\x02\x94\x95\x05(\x15\x02\x95\x96" +
		"\x07\x13\x02\x02\x96\x97\x07\x04\x02\x02\x97\x1F\x03\x02\x02\x02\x98\x99" +
		"\x07\x14\x02\x02\x99\x9A\x07\x11\x02\x02\x9A\x9B\x05(\x15\x02\x9B\x9C" +
		"\x07\x13\x02\x02\x9C\x9D\x07\x04\x02\x02\x9D!\x03\x02\x02\x02\x9E\x9F" +
		"\x07\x15\x02\x02\x9F\xA0\x07\x11\x02\x02\xA0\xA1\x05(\x15\x02\xA1\xA2" +
		"\x07\x13\x02\x02\xA2\xA5\x05\x16\f\x02\xA3\xA4\x07\x16\x02\x02\xA4\xA6" +
		"\x05\x16\f\x02\xA5\xA3\x03\x02\x02\x02\xA5\xA6\x03\x02\x02\x02\xA6#\x03" +
		"\x02\x02\x02\xA7\xA8\x076\x02\x02\xA8\xA9\x05&\x14\x02\xA9%\x03\x02\x02" +
		"\x02\xAA\xB3\x07\x11\x02\x02\xAB\xB0\x05(\x15\x02\xAC\xAD\x07\x12\x02" +
		"\x02\xAD\xAF\x05(\x15\x02\xAE\xAC\x03\x02\x02\x02\xAF\xB2\x03\x02\x02" +
		"\x02\xB0\xAE\x03\x02\x02\x02\xB0\xB1\x03\x02\x02\x02\xB1\xB4\x03\x02\x02" +
		"\x02\xB2\xB0\x03\x02\x02\x02\xB3\xAB\x03\x02\x02\x02\xB3\xB4\x03\x02\x02" +
		"\x02\xB4\xB5\x03\x02\x02\x02\xB5\xB6\x07\x13\x02\x02\xB6\'\x03\x02\x02" +
		"\x02\xB7\xB8\b\x15\x01\x02\xB8\xB9\x07\x11\x02\x02\xB9\xBA\x05(\x15\x02" +
		"\xBA\xBB\x07\x13\x02\x02\xBB\xD7\x03\x02\x02\x02\xBC\xBD\x05.\x18\x02" +
		"\xBD\xBE\x07\x11\x02\x02\xBE\xBF\x05(\x15\x02\xBF\xC0\x07\x13\x02\x02" +
		"\xC0\xD7\x03\x02\x02\x02\xC1\xD7\x05$\x13\x02\xC2\xC3\x07\x17\x02\x02" +
		"\xC3\xC4\x076\x02\x02\xC4\xD7\x05&\x14\x02\xC5\xC6\t\x03\x02\x02\xC6\xD7" +
		"\x05(\x15\x0E\xC7\xD0\x07\x18\x02\x02\xC8\xCD\x05(\x15\x02\xC9\xCA\x07" +
		"\x12\x02\x02\xCA\xCC\x05(\x15\x02\xCB\xC9\x03\x02\x02\x02\xCC\xCF\x03" +
		"\x02\x02\x02\xCD\xCB\x03\x02\x02\x02\xCD\xCE\x03\x02\x02\x02\xCE\xD1\x03" +
		"\x02\x02\x02\xCF\xCD\x03\x02\x02\x02\xD0\xC8\x03\x02\x02\x02\xD0\xD1\x03" +
		"\x02\x02\x02\xD1\xD2\x03\x02\x02\x02\xD2\xD7\x07\x19\x02\x02\xD3\xD7\x07" +
		"5\x02\x02\xD4\xD7\x076\x02\x02\xD5\xD7\x05*\x16\x02\xD6\xB7\x03\x02\x02" +
		"\x02\xD6\xBC\x03\x02\x02\x02\xD6\xC1\x03\x02\x02\x02\xD6\xC2\x03\x02\x02" +
		"\x02\xD6\xC5\x03\x02\x02\x02\xD6\xC7\x03\x02\x02\x02\xD6\xD3\x03\x02\x02" +
		"\x02\xD6\xD4\x03\x02\x02\x02\xD6\xD5\x03\x02\x02\x02\xD7\xF8\x03\x02\x02" +
		"\x02\xD8\xD9\f\f\x02\x02\xD9\xDA\t\x04\x02\x02\xDA\xF7\x05(\x15\r\xDB" +
		"\xDC\f\v\x02\x02\xDC\xDD\t\x05\x02\x02\xDD\xF7\x05(\x15\f\xDE\xDF\f\n" +
		"\x02\x02\xDF\xE0\t\x06\x02\x02\xE0\xF7\x05(\x15\v\xE1\xE2\f\t\x02\x02" +
		"\xE2\xE3\t\x07\x02\x02\xE3\xF7\x05(\x15\n\xE4\xE5\f\b\x02\x02\xE5\xE6" +
		"\x07$\x02\x02\xE6\xF7\x05(\x15\t\xE7\xE8\f\x07\x02\x02\xE8\xE9\x07%\x02" +
		"\x02\xE9\xF7\x05(\x15\b\xEA\xEB\f\x10\x02\x02\xEB\xEC\x07\x18\x02\x02" +
		"\xEC\xED\x07/\x02\x02\xED\xF7\x07\x19\x02\x02\xEE\xEF\f\x0F\x02\x02\xEF" +
		"\xF7\t\b\x02\x02\xF0\xF1\f\r\x02\x02\xF1\xF2\x07\x1E\x02\x02\xF2\xF3\x07" +
		"\x11\x02\x02\xF3\xF4\x05(\x15\x02\xF4\xF5\x07\x13\x02\x02\xF5\xF7\x03" +
		"\x02\x02\x02\xF6\xD8\x03\x02\x02\x02\xF6\xDB\x03\x02\x02\x02\xF6\xDE\x03" +
		"\x02\x02\x02\xF6\xE1\x03\x02\x02\x02\xF6\xE4\x03\x02\x02\x02\xF6\xE7\x03" +
		"\x02\x02\x02\xF6\xEA\x03\x02\x02\x02\xF6\xEE\x03\x02\x02\x02\xF6\xF0\x03" +
		"\x02\x02\x02\xF7\xFA\x03\x02\x02\x02\xF8\xF6\x03\x02\x02\x02\xF8\xF9\x03" +
		"\x02\x02\x02\xF9)\x03\x02\x02\x02\xFA\xF8\x03\x02\x02\x02\xFB\u0100\x07" +
		"-\x02\x02\xFC\u0100\x05,\x17\x02\xFD\u0100\x072\x02\x02\xFE\u0100\x07" +
		"3\x02\x02\xFF\xFB\x03\x02\x02\x02\xFF\xFC\x03\x02\x02\x02\xFF\xFD\x03" +
		"\x02\x02\x02\xFF\xFE\x03\x02\x02\x02\u0100+\x03\x02\x02\x02\u0101\u0103" +
		"\x07/\x02\x02\u0102\u0104\x07.\x02\x02\u0103\u0102\x03\x02\x02\x02\u0103" +
		"\u0104\x03\x02\x02\x02\u0104-\x03\x02\x02\x02\u0105\u0106\t\t\x02\x02" +
		"\u0106/\x03\x02\x02\x02\x163BER^ilw|\x83\xA5\xB0\xB3\xCD\xD0\xD6\xF6\xF8" +
		"\xFF\u0103";
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
	public pragmaDirective(): PragmaDirectiveContext[];
	public pragmaDirective(i: number): PragmaDirectiveContext;
	public pragmaDirective(i?: number): PragmaDirectiveContext | PragmaDirectiveContext[] {
		if (i === undefined) {
			return this.getRuleContexts(PragmaDirectiveContext);
		} else {
			return this.getRuleContext(i, PragmaDirectiveContext);
		}
	}
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


export class PragmaDirectiveContext extends ParserRuleContext {
	public pragmaName(): PragmaNameContext {
		return this.getRuleContext(0, PragmaNameContext);
	}
	public pragmaValue(): PragmaValueContext {
		return this.getRuleContext(0, PragmaValueContext);
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return CashScriptParser.RULE_pragmaDirective; }
	// @Override
	public enterRule(listener: CashScriptListener): void {
		if (listener.enterPragmaDirective) {
			listener.enterPragmaDirective(this);
		}
	}
	// @Override
	public exitRule(listener: CashScriptListener): void {
		if (listener.exitPragmaDirective) {
			listener.exitPragmaDirective(this);
		}
	}
	// @Override
	public accept<Result>(visitor: CashScriptVisitor<Result>): Result {
		if (visitor.visitPragmaDirective) {
			return visitor.visitPragmaDirective(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class PragmaNameContext extends ParserRuleContext {
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return CashScriptParser.RULE_pragmaName; }
	// @Override
	public enterRule(listener: CashScriptListener): void {
		if (listener.enterPragmaName) {
			listener.enterPragmaName(this);
		}
	}
	// @Override
	public exitRule(listener: CashScriptListener): void {
		if (listener.exitPragmaName) {
			listener.exitPragmaName(this);
		}
	}
	// @Override
	public accept<Result>(visitor: CashScriptVisitor<Result>): Result {
		if (visitor.visitPragmaName) {
			return visitor.visitPragmaName(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class PragmaValueContext extends ParserRuleContext {
	public versionConstraint(): VersionConstraintContext[];
	public versionConstraint(i: number): VersionConstraintContext;
	public versionConstraint(i?: number): VersionConstraintContext | VersionConstraintContext[] {
		if (i === undefined) {
			return this.getRuleContexts(VersionConstraintContext);
		} else {
			return this.getRuleContext(i, VersionConstraintContext);
		}
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return CashScriptParser.RULE_pragmaValue; }
	// @Override
	public enterRule(listener: CashScriptListener): void {
		if (listener.enterPragmaValue) {
			listener.enterPragmaValue(this);
		}
	}
	// @Override
	public exitRule(listener: CashScriptListener): void {
		if (listener.exitPragmaValue) {
			listener.exitPragmaValue(this);
		}
	}
	// @Override
	public accept<Result>(visitor: CashScriptVisitor<Result>): Result {
		if (visitor.visitPragmaValue) {
			return visitor.visitPragmaValue(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class VersionConstraintContext extends ParserRuleContext {
	public VersionLiteral(): TerminalNode { return this.getToken(CashScriptParser.VersionLiteral, 0); }
	public versionOperator(): VersionOperatorContext | undefined {
		return this.tryGetRuleContext(0, VersionOperatorContext);
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return CashScriptParser.RULE_versionConstraint; }
	// @Override
	public enterRule(listener: CashScriptListener): void {
		if (listener.enterVersionConstraint) {
			listener.enterVersionConstraint(this);
		}
	}
	// @Override
	public exitRule(listener: CashScriptListener): void {
		if (listener.exitVersionConstraint) {
			listener.exitVersionConstraint(this);
		}
	}
	// @Override
	public accept<Result>(visitor: CashScriptVisitor<Result>): Result {
		if (visitor.visitVersionConstraint) {
			return visitor.visitVersionConstraint(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class VersionOperatorContext extends ParserRuleContext {
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return CashScriptParser.RULE_versionOperator; }
	// @Override
	public enterRule(listener: CashScriptListener): void {
		if (listener.enterVersionOperator) {
			listener.enterVersionOperator(this);
		}
	}
	// @Override
	public exitRule(listener: CashScriptListener): void {
		if (listener.exitVersionOperator) {
			listener.exitVersionOperator(this);
		}
	}
	// @Override
	public accept<Result>(visitor: CashScriptVisitor<Result>): Result {
		if (visitor.visitVersionOperator) {
			return visitor.visitVersionOperator(this);
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
	public timeOpStatement(): TimeOpStatementContext | undefined {
		return this.tryGetRuleContext(0, TimeOpStatementContext);
	}
	public requireStatement(): RequireStatementContext | undefined {
		return this.tryGetRuleContext(0, RequireStatementContext);
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


export class TimeOpStatementContext extends ParserRuleContext {
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


export class RequireStatementContext extends ParserRuleContext {
	public expression(): ExpressionContext {
		return this.getRuleContext(0, ExpressionContext);
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return CashScriptParser.RULE_requireStatement; }
	// @Override
	public enterRule(listener: CashScriptListener): void {
		if (listener.enterRequireStatement) {
			listener.enterRequireStatement(this);
		}
	}
	// @Override
	public exitRule(listener: CashScriptListener): void {
		if (listener.exitRequireStatement) {
			listener.exitRequireStatement(this);
		}
	}
	// @Override
	public accept<Result>(visitor: CashScriptVisitor<Result>): Result {
		if (visitor.visitRequireStatement) {
			return visitor.visitRequireStatement(this);
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


export class ExpressionContext extends ParserRuleContext {
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return CashScriptParser.RULE_expression; }
	public copyFrom(ctx: ExpressionContext): void {
		super.copyFrom(ctx);
	}
}
export class ParenthesisedContext extends ExpressionContext {
	public expression(): ExpressionContext {
		return this.getRuleContext(0, ExpressionContext);
	}
	constructor(ctx: ExpressionContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public enterRule(listener: CashScriptListener): void {
		if (listener.enterParenthesised) {
			listener.enterParenthesised(this);
		}
	}
	// @Override
	public exitRule(listener: CashScriptListener): void {
		if (listener.exitParenthesised) {
			listener.exitParenthesised(this);
		}
	}
	// @Override
	public accept<Result>(visitor: CashScriptVisitor<Result>): Result {
		if (visitor.visitParenthesised) {
			return visitor.visitParenthesised(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class CastContext extends ExpressionContext {
	public typeName(): TypeNameContext {
		return this.getRuleContext(0, TypeNameContext);
	}
	public expression(): ExpressionContext {
		return this.getRuleContext(0, ExpressionContext);
	}
	constructor(ctx: ExpressionContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
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
export class FunctionCallExpressionContext extends ExpressionContext {
	public functionCall(): FunctionCallContext {
		return this.getRuleContext(0, FunctionCallContext);
	}
	constructor(ctx: ExpressionContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public enterRule(listener: CashScriptListener): void {
		if (listener.enterFunctionCallExpression) {
			listener.enterFunctionCallExpression(this);
		}
	}
	// @Override
	public exitRule(listener: CashScriptListener): void {
		if (listener.exitFunctionCallExpression) {
			listener.exitFunctionCallExpression(this);
		}
	}
	// @Override
	public accept<Result>(visitor: CashScriptVisitor<Result>): Result {
		if (visitor.visitFunctionCallExpression) {
			return visitor.visitFunctionCallExpression(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class InstantationContext extends ExpressionContext {
	public Identifier(): TerminalNode { return this.getToken(CashScriptParser.Identifier, 0); }
	public expressionList(): ExpressionListContext {
		return this.getRuleContext(0, ExpressionListContext);
	}
	constructor(ctx: ExpressionContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public enterRule(listener: CashScriptListener): void {
		if (listener.enterInstantation) {
			listener.enterInstantation(this);
		}
	}
	// @Override
	public exitRule(listener: CashScriptListener): void {
		if (listener.exitInstantation) {
			listener.exitInstantation(this);
		}
	}
	// @Override
	public accept<Result>(visitor: CashScriptVisitor<Result>): Result {
		if (visitor.visitInstantation) {
			return visitor.visitInstantation(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class TupleIndexOpContext extends ExpressionContext {
	public _index: Token;
	public expression(): ExpressionContext {
		return this.getRuleContext(0, ExpressionContext);
	}
	public NumberLiteral(): TerminalNode { return this.getToken(CashScriptParser.NumberLiteral, 0); }
	constructor(ctx: ExpressionContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public enterRule(listener: CashScriptListener): void {
		if (listener.enterTupleIndexOp) {
			listener.enterTupleIndexOp(this);
		}
	}
	// @Override
	public exitRule(listener: CashScriptListener): void {
		if (listener.exitTupleIndexOp) {
			listener.exitTupleIndexOp(this);
		}
	}
	// @Override
	public accept<Result>(visitor: CashScriptVisitor<Result>): Result {
		if (visitor.visitTupleIndexOp) {
			return visitor.visitTupleIndexOp(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class UnaryOpContext extends ExpressionContext {
	public _op: Token;
	public expression(): ExpressionContext {
		return this.getRuleContext(0, ExpressionContext);
	}
	constructor(ctx: ExpressionContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public enterRule(listener: CashScriptListener): void {
		if (listener.enterUnaryOp) {
			listener.enterUnaryOp(this);
		}
	}
	// @Override
	public exitRule(listener: CashScriptListener): void {
		if (listener.exitUnaryOp) {
			listener.exitUnaryOp(this);
		}
	}
	// @Override
	public accept<Result>(visitor: CashScriptVisitor<Result>): Result {
		if (visitor.visitUnaryOp) {
			return visitor.visitUnaryOp(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class BinaryOpContext extends ExpressionContext {
	public _left: ExpressionContext;
	public _op: Token;
	public _right: ExpressionContext;
	public expression(): ExpressionContext[];
	public expression(i: number): ExpressionContext;
	public expression(i?: number): ExpressionContext | ExpressionContext[] {
		if (i === undefined) {
			return this.getRuleContexts(ExpressionContext);
		} else {
			return this.getRuleContext(i, ExpressionContext);
		}
	}
	constructor(ctx: ExpressionContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public enterRule(listener: CashScriptListener): void {
		if (listener.enterBinaryOp) {
			listener.enterBinaryOp(this);
		}
	}
	// @Override
	public exitRule(listener: CashScriptListener): void {
		if (listener.exitBinaryOp) {
			listener.exitBinaryOp(this);
		}
	}
	// @Override
	public accept<Result>(visitor: CashScriptVisitor<Result>): Result {
		if (visitor.visitBinaryOp) {
			return visitor.visitBinaryOp(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class ArrayContext extends ExpressionContext {
	public expression(): ExpressionContext[];
	public expression(i: number): ExpressionContext;
	public expression(i?: number): ExpressionContext | ExpressionContext[] {
		if (i === undefined) {
			return this.getRuleContexts(ExpressionContext);
		} else {
			return this.getRuleContext(i, ExpressionContext);
		}
	}
	constructor(ctx: ExpressionContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public enterRule(listener: CashScriptListener): void {
		if (listener.enterArray) {
			listener.enterArray(this);
		}
	}
	// @Override
	public exitRule(listener: CashScriptListener): void {
		if (listener.exitArray) {
			listener.exitArray(this);
		}
	}
	// @Override
	public accept<Result>(visitor: CashScriptVisitor<Result>): Result {
		if (visitor.visitArray) {
			return visitor.visitArray(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class PreimageFieldContext extends ExpressionContext {
	public PreimageField(): TerminalNode { return this.getToken(CashScriptParser.PreimageField, 0); }
	constructor(ctx: ExpressionContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public enterRule(listener: CashScriptListener): void {
		if (listener.enterPreimageField) {
			listener.enterPreimageField(this);
		}
	}
	// @Override
	public exitRule(listener: CashScriptListener): void {
		if (listener.exitPreimageField) {
			listener.exitPreimageField(this);
		}
	}
	// @Override
	public accept<Result>(visitor: CashScriptVisitor<Result>): Result {
		if (visitor.visitPreimageField) {
			return visitor.visitPreimageField(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class IdentifierContext extends ExpressionContext {
	public Identifier(): TerminalNode { return this.getToken(CashScriptParser.Identifier, 0); }
	constructor(ctx: ExpressionContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public enterRule(listener: CashScriptListener): void {
		if (listener.enterIdentifier) {
			listener.enterIdentifier(this);
		}
	}
	// @Override
	public exitRule(listener: CashScriptListener): void {
		if (listener.exitIdentifier) {
			listener.exitIdentifier(this);
		}
	}
	// @Override
	public accept<Result>(visitor: CashScriptVisitor<Result>): Result {
		if (visitor.visitIdentifier) {
			return visitor.visitIdentifier(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class LiteralExpressionContext extends ExpressionContext {
	public literal(): LiteralContext {
		return this.getRuleContext(0, LiteralContext);
	}
	constructor(ctx: ExpressionContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public enterRule(listener: CashScriptListener): void {
		if (listener.enterLiteralExpression) {
			listener.enterLiteralExpression(this);
		}
	}
	// @Override
	public exitRule(listener: CashScriptListener): void {
		if (listener.exitLiteralExpression) {
			listener.exitLiteralExpression(this);
		}
	}
	// @Override
	public accept<Result>(visitor: CashScriptVisitor<Result>): Result {
		if (visitor.visitLiteralExpression) {
			return visitor.visitLiteralExpression(this);
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


