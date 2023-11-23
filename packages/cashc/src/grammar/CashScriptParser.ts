// Generated from src/grammar/CashScript.g4 by ANTLR 4.9.0-SNAPSHOT


import { ATN } from "antlr4ts/atn/ATN.js";
import { ATNDeserializer } from "antlr4ts/atn/ATNDeserializer.js";
import { FailedPredicateException } from "antlr4ts/FailedPredicateException.js";
import { NotNull } from "antlr4ts/Decorators.js";
import { NoViableAltException } from "antlr4ts/NoViableAltException.js";
import { Override } from "antlr4ts/Decorators.js";
import { Parser } from "antlr4ts/Parser.js";
import { ParserRuleContext } from "antlr4ts/ParserRuleContext.js";
import { ParserATNSimulator } from "antlr4ts/atn/ParserATNSimulator.js";
import { ParseTreeListener } from "antlr4ts/tree/ParseTreeListener.js";
import { ParseTreeVisitor } from "antlr4ts/tree/ParseTreeVisitor.js";
import { RecognitionException } from "antlr4ts/RecognitionException.js";
import { RuleContext } from "antlr4ts/RuleContext.js";
//import { RuleVersion } from "antlr4ts/RuleVersion.js";
import { TerminalNode } from "antlr4ts/tree/TerminalNode.js";
import { Token } from "antlr4ts/Token.js";
import { TokenStream } from "antlr4ts/TokenStream.js";
import { Vocabulary } from "antlr4ts/Vocabulary.js";
import { VocabularyImpl } from "antlr4ts/VocabularyImpl.js";

import * as Utils from "antlr4ts/misc/Utils.js";

import { CashScriptVisitor } from "./CashScriptVisitor.js";


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
	public static readonly T__41 = 42;
	public static readonly T__42 = 43;
	public static readonly T__43 = 44;
	public static readonly T__44 = 45;
	public static readonly T__45 = 46;
	public static readonly T__46 = 47;
	public static readonly T__47 = 48;
	public static readonly T__48 = 49;
	public static readonly T__49 = 50;
	public static readonly T__50 = 51;
	public static readonly T__51 = 52;
	public static readonly T__52 = 53;
	public static readonly T__53 = 54;
	public static readonly T__54 = 55;
	public static readonly T__55 = 56;
	public static readonly T__56 = 57;
	public static readonly VersionLiteral = 58;
	public static readonly BooleanLiteral = 59;
	public static readonly NumberUnit = 60;
	public static readonly NumberLiteral = 61;
	public static readonly Bytes = 62;
	public static readonly Bound = 63;
	public static readonly StringLiteral = 64;
	public static readonly DateLiteral = 65;
	public static readonly HexLiteral = 66;
	public static readonly TxVar = 67;
	public static readonly NullaryOp = 68;
	public static readonly Identifier = 69;
	public static readonly WHITESPACE = 70;
	public static readonly COMMENT = 71;
	public static readonly LINE_COMMENT = 72;
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
	public static readonly RULE_tupleAssignment = 13;
	public static readonly RULE_assignStatement = 14;
	public static readonly RULE_timeOpStatement = 15;
	public static readonly RULE_requireStatement = 16;
	public static readonly RULE_ifStatement = 17;
	public static readonly RULE_consoleStatement = 18;
	public static readonly RULE_consoleParameter = 19;
	public static readonly RULE_consoleParameterList = 20;
	public static readonly RULE_functionCall = 21;
	public static readonly RULE_expressionList = 22;
	public static readonly RULE_expression = 23;
	public static readonly RULE_modifier = 24;
	public static readonly RULE_literal = 25;
	public static readonly RULE_numberLiteral = 26;
	public static readonly RULE_typeName = 27;
	// tslint:disable:no-trailing-whitespace
	public static readonly ruleNames: string[] = [
		"sourceFile", "pragmaDirective", "pragmaName", "pragmaValue", "versionConstraint", 
		"versionOperator", "contractDefinition", "functionDefinition", "parameterList", 
		"parameter", "block", "statement", "variableDefinition", "tupleAssignment", 
		"assignStatement", "timeOpStatement", "requireStatement", "ifStatement", 
		"consoleStatement", "consoleParameter", "consoleParameterList", "functionCall", 
		"expressionList", "expression", "modifier", "literal", "numberLiteral", 
		"typeName",
	];

	private static readonly _LITERAL_NAMES: Array<string | undefined> = [
		undefined, "'pragma'", "';'", "'cashscript'", "'^'", "'~'", "'>='", "'>'", 
		"'<'", "'<='", "'='", "'contract'", "'{'", "'}'", "'function'", "'('", 
		"','", "')'", "'require'", "'if'", "'else'", "'console.log'", "'new'", 
		"'['", "']'", "'tx.outputs'", "'.value'", "'.lockingBytecode'", "'.tokenCategory'", 
		"'.nftCommitment'", "'.tokenAmount'", "'tx.inputs'", "'.outpointTransactionHash'", 
		"'.outpointIndex'", "'.unlockingBytecode'", "'.sequenceNumber'", "'.reverse()'", 
		"'.length'", "'.split'", "'!'", "'-'", "'*'", "'/'", "'%'", "'+'", "'=='", 
		"'!='", "'&'", "'|'", "'&&'", "'||'", "'constant'", "'int'", "'bool'", 
		"'string'", "'pubkey'", "'sig'", "'datasig'",
	];
	private static readonly _SYMBOLIC_NAMES: Array<string | undefined> = [
		undefined, undefined, undefined, undefined, undefined, undefined, undefined, 
		undefined, undefined, undefined, undefined, undefined, undefined, undefined, 
		undefined, undefined, undefined, undefined, undefined, undefined, undefined, 
		undefined, undefined, undefined, undefined, undefined, undefined, undefined, 
		undefined, undefined, undefined, undefined, undefined, undefined, undefined, 
		undefined, undefined, undefined, undefined, undefined, undefined, undefined, 
		undefined, undefined, undefined, undefined, undefined, undefined, undefined, 
		undefined, undefined, undefined, undefined, undefined, undefined, undefined, 
		undefined, undefined, "VersionLiteral", "BooleanLiteral", "NumberUnit", 
		"NumberLiteral", "Bytes", "Bound", "StringLiteral", "DateLiteral", "HexLiteral", 
		"TxVar", "NullaryOp", "Identifier", "WHITESPACE", "COMMENT", "LINE_COMMENT",
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

	protected createFailedPredicateException(predicate?: string, message?: string): FailedPredicateException {
		return new FailedPredicateException(this, predicate, message);
	}

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
			this.state = 59;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while (_la === CashScriptParser.T__0) {
				{
				{
				this.state = 56;
				this.pragmaDirective();
				}
				}
				this.state = 61;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			}
			this.state = 62;
			this.contractDefinition();
			this.state = 63;
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
			this.state = 65;
			this.match(CashScriptParser.T__0);
			this.state = 66;
			this.pragmaName();
			this.state = 67;
			this.pragmaValue();
			this.state = 68;
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
	public pragmaValue(): PragmaValueContext {
		let _localctx: PragmaValueContext = new PragmaValueContext(this._ctx, this.state);
		this.enterRule(_localctx, 6, CashScriptParser.RULE_pragmaValue);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 72;
			this.versionConstraint();
			this.state = 74;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if ((((_la) & ~0x1F) === 0 && ((1 << _la) & ((1 << CashScriptParser.T__3) | (1 << CashScriptParser.T__4) | (1 << CashScriptParser.T__5) | (1 << CashScriptParser.T__6) | (1 << CashScriptParser.T__7) | (1 << CashScriptParser.T__8) | (1 << CashScriptParser.T__9))) !== 0) || _la === CashScriptParser.VersionLiteral) {
				{
				this.state = 73;
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
			this.state = 77;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if ((((_la) & ~0x1F) === 0 && ((1 << _la) & ((1 << CashScriptParser.T__3) | (1 << CashScriptParser.T__4) | (1 << CashScriptParser.T__5) | (1 << CashScriptParser.T__6) | (1 << CashScriptParser.T__7) | (1 << CashScriptParser.T__8) | (1 << CashScriptParser.T__9))) !== 0)) {
				{
				this.state = 76;
				this.versionOperator();
				}
			}

			this.state = 79;
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
			this.state = 81;
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
			this.state = 83;
			this.match(CashScriptParser.T__10);
			this.state = 84;
			this.match(CashScriptParser.Identifier);
			this.state = 85;
			this.parameterList();
			this.state = 86;
			this.match(CashScriptParser.T__11);
			this.state = 90;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while (_la === CashScriptParser.T__13) {
				{
				{
				this.state = 87;
				this.functionDefinition();
				}
				}
				this.state = 92;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			}
			this.state = 93;
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
			this.state = 95;
			this.match(CashScriptParser.T__13);
			this.state = 96;
			this.match(CashScriptParser.Identifier);
			this.state = 97;
			this.parameterList();
			this.state = 98;
			this.match(CashScriptParser.T__11);
			this.state = 102;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while ((((_la) & ~0x1F) === 0 && ((1 << _la) & ((1 << CashScriptParser.T__17) | (1 << CashScriptParser.T__18) | (1 << CashScriptParser.T__20))) !== 0) || ((((_la - 52)) & ~0x1F) === 0 && ((1 << (_la - 52)) & ((1 << (CashScriptParser.T__51 - 52)) | (1 << (CashScriptParser.T__52 - 52)) | (1 << (CashScriptParser.T__53 - 52)) | (1 << (CashScriptParser.T__54 - 52)) | (1 << (CashScriptParser.T__55 - 52)) | (1 << (CashScriptParser.T__56 - 52)) | (1 << (CashScriptParser.Bytes - 52)) | (1 << (CashScriptParser.Identifier - 52)))) !== 0)) {
				{
				{
				this.state = 99;
				this.statement();
				}
				}
				this.state = 104;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			}
			this.state = 105;
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
			let _alt: number;
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 107;
			this.match(CashScriptParser.T__14);
			this.state = 119;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (((((_la - 52)) & ~0x1F) === 0 && ((1 << (_la - 52)) & ((1 << (CashScriptParser.T__51 - 52)) | (1 << (CashScriptParser.T__52 - 52)) | (1 << (CashScriptParser.T__53 - 52)) | (1 << (CashScriptParser.T__54 - 52)) | (1 << (CashScriptParser.T__55 - 52)) | (1 << (CashScriptParser.T__56 - 52)) | (1 << (CashScriptParser.Bytes - 52)))) !== 0)) {
				{
				this.state = 108;
				this.parameter();
				this.state = 113;
				this._errHandler.sync(this);
				_alt = this.interpreter.adaptivePredict(this._input, 5, this._ctx);
				while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
					if (_alt === 1) {
						{
						{
						this.state = 109;
						this.match(CashScriptParser.T__15);
						this.state = 110;
						this.parameter();
						}
						}
					}
					this.state = 115;
					this._errHandler.sync(this);
					_alt = this.interpreter.adaptivePredict(this._input, 5, this._ctx);
				}
				this.state = 117;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la === CashScriptParser.T__15) {
					{
					this.state = 116;
					this.match(CashScriptParser.T__15);
					}
				}

				}
			}

			this.state = 121;
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
			this.state = 123;
			this.typeName();
			this.state = 124;
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
			this.state = 135;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case CashScriptParser.T__11:
				this.enterOuterAlt(_localctx, 1);
				{
				this.state = 126;
				this.match(CashScriptParser.T__11);
				this.state = 130;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				while ((((_la) & ~0x1F) === 0 && ((1 << _la) & ((1 << CashScriptParser.T__17) | (1 << CashScriptParser.T__18) | (1 << CashScriptParser.T__20))) !== 0) || ((((_la - 52)) & ~0x1F) === 0 && ((1 << (_la - 52)) & ((1 << (CashScriptParser.T__51 - 52)) | (1 << (CashScriptParser.T__52 - 52)) | (1 << (CashScriptParser.T__53 - 52)) | (1 << (CashScriptParser.T__54 - 52)) | (1 << (CashScriptParser.T__55 - 52)) | (1 << (CashScriptParser.T__56 - 52)) | (1 << (CashScriptParser.Bytes - 52)) | (1 << (CashScriptParser.Identifier - 52)))) !== 0)) {
					{
					{
					this.state = 127;
					this.statement();
					}
					}
					this.state = 132;
					this._errHandler.sync(this);
					_la = this._input.LA(1);
				}
				this.state = 133;
				this.match(CashScriptParser.T__12);
				}
				break;
			case CashScriptParser.T__17:
			case CashScriptParser.T__18:
			case CashScriptParser.T__20:
			case CashScriptParser.T__51:
			case CashScriptParser.T__52:
			case CashScriptParser.T__53:
			case CashScriptParser.T__54:
			case CashScriptParser.T__55:
			case CashScriptParser.T__56:
			case CashScriptParser.Bytes:
			case CashScriptParser.Identifier:
				this.enterOuterAlt(_localctx, 2);
				{
				this.state = 134;
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
			this.state = 144;
			this._errHandler.sync(this);
			switch ( this.interpreter.adaptivePredict(this._input, 10, this._ctx) ) {
			case 1:
				this.enterOuterAlt(_localctx, 1);
				{
				this.state = 137;
				this.variableDefinition();
				}
				break;

			case 2:
				this.enterOuterAlt(_localctx, 2);
				{
				this.state = 138;
				this.tupleAssignment();
				}
				break;

			case 3:
				this.enterOuterAlt(_localctx, 3);
				{
				this.state = 139;
				this.assignStatement();
				}
				break;

			case 4:
				this.enterOuterAlt(_localctx, 4);
				{
				this.state = 140;
				this.timeOpStatement();
				}
				break;

			case 5:
				this.enterOuterAlt(_localctx, 5);
				{
				this.state = 141;
				this.requireStatement();
				}
				break;

			case 6:
				this.enterOuterAlt(_localctx, 6);
				{
				this.state = 142;
				this.ifStatement();
				}
				break;

			case 7:
				this.enterOuterAlt(_localctx, 7);
				{
				this.state = 143;
				this.consoleStatement();
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
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 146;
			this.typeName();
			this.state = 150;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while (_la === CashScriptParser.T__50) {
				{
				{
				this.state = 147;
				this.modifier();
				}
				}
				this.state = 152;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			}
			this.state = 153;
			this.match(CashScriptParser.Identifier);
			this.state = 154;
			this.match(CashScriptParser.T__9);
			this.state = 155;
			this.expression(0);
			this.state = 156;
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
	public tupleAssignment(): TupleAssignmentContext {
		let _localctx: TupleAssignmentContext = new TupleAssignmentContext(this._ctx, this.state);
		this.enterRule(_localctx, 26, CashScriptParser.RULE_tupleAssignment);
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 158;
			this.typeName();
			this.state = 159;
			this.match(CashScriptParser.Identifier);
			this.state = 160;
			this.match(CashScriptParser.T__15);
			this.state = 161;
			this.typeName();
			this.state = 162;
			this.match(CashScriptParser.Identifier);
			this.state = 163;
			this.match(CashScriptParser.T__9);
			this.state = 164;
			this.expression(0);
			this.state = 165;
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
		this.enterRule(_localctx, 28, CashScriptParser.RULE_assignStatement);
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 167;
			this.match(CashScriptParser.Identifier);
			this.state = 168;
			this.match(CashScriptParser.T__9);
			this.state = 169;
			this.expression(0);
			this.state = 170;
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
		this.enterRule(_localctx, 30, CashScriptParser.RULE_timeOpStatement);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 172;
			this.match(CashScriptParser.T__17);
			this.state = 173;
			this.match(CashScriptParser.T__14);
			this.state = 174;
			this.match(CashScriptParser.TxVar);
			this.state = 175;
			this.match(CashScriptParser.T__5);
			this.state = 176;
			this.expression(0);
			this.state = 179;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la === CashScriptParser.T__15) {
				{
				this.state = 177;
				this.match(CashScriptParser.T__15);
				this.state = 178;
				this.match(CashScriptParser.StringLiteral);
				}
			}

			this.state = 181;
			this.match(CashScriptParser.T__16);
			this.state = 182;
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
		this.enterRule(_localctx, 32, CashScriptParser.RULE_requireStatement);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 184;
			this.match(CashScriptParser.T__17);
			this.state = 185;
			this.match(CashScriptParser.T__14);
			this.state = 186;
			this.expression(0);
			this.state = 189;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la === CashScriptParser.T__15) {
				{
				this.state = 187;
				this.match(CashScriptParser.T__15);
				this.state = 188;
				this.match(CashScriptParser.StringLiteral);
				}
			}

			this.state = 191;
			this.match(CashScriptParser.T__16);
			this.state = 192;
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
		this.enterRule(_localctx, 34, CashScriptParser.RULE_ifStatement);
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 194;
			this.match(CashScriptParser.T__18);
			this.state = 195;
			this.match(CashScriptParser.T__14);
			this.state = 196;
			this.expression(0);
			this.state = 197;
			this.match(CashScriptParser.T__16);
			this.state = 198;
			_localctx._ifBlock = this.block();
			this.state = 201;
			this._errHandler.sync(this);
			switch ( this.interpreter.adaptivePredict(this._input, 14, this._ctx) ) {
			case 1:
				{
				this.state = 199;
				this.match(CashScriptParser.T__19);
				this.state = 200;
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
	public consoleStatement(): ConsoleStatementContext {
		let _localctx: ConsoleStatementContext = new ConsoleStatementContext(this._ctx, this.state);
		this.enterRule(_localctx, 36, CashScriptParser.RULE_consoleStatement);
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 203;
			this.match(CashScriptParser.T__20);
			this.state = 204;
			this.consoleParameterList();
			this.state = 205;
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
	public consoleParameter(): ConsoleParameterContext {
		let _localctx: ConsoleParameterContext = new ConsoleParameterContext(this._ctx, this.state);
		this.enterRule(_localctx, 38, CashScriptParser.RULE_consoleParameter);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 207;
			_la = this._input.LA(1);
			if (!(((((_la - 59)) & ~0x1F) === 0 && ((1 << (_la - 59)) & ((1 << (CashScriptParser.BooleanLiteral - 59)) | (1 << (CashScriptParser.NumberLiteral - 59)) | (1 << (CashScriptParser.StringLiteral - 59)) | (1 << (CashScriptParser.HexLiteral - 59)) | (1 << (CashScriptParser.Identifier - 59)))) !== 0))) {
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
	public consoleParameterList(): ConsoleParameterListContext {
		let _localctx: ConsoleParameterListContext = new ConsoleParameterListContext(this._ctx, this.state);
		this.enterRule(_localctx, 40, CashScriptParser.RULE_consoleParameterList);
		let _la: number;
		try {
			let _alt: number;
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 209;
			this.match(CashScriptParser.T__14);
			this.state = 221;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (((((_la - 59)) & ~0x1F) === 0 && ((1 << (_la - 59)) & ((1 << (CashScriptParser.BooleanLiteral - 59)) | (1 << (CashScriptParser.NumberLiteral - 59)) | (1 << (CashScriptParser.StringLiteral - 59)) | (1 << (CashScriptParser.HexLiteral - 59)) | (1 << (CashScriptParser.Identifier - 59)))) !== 0)) {
				{
				this.state = 210;
				this.consoleParameter();
				this.state = 215;
				this._errHandler.sync(this);
				_alt = this.interpreter.adaptivePredict(this._input, 15, this._ctx);
				while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
					if (_alt === 1) {
						{
						{
						this.state = 211;
						this.match(CashScriptParser.T__15);
						this.state = 212;
						this.consoleParameter();
						}
						}
					}
					this.state = 217;
					this._errHandler.sync(this);
					_alt = this.interpreter.adaptivePredict(this._input, 15, this._ctx);
				}
				this.state = 219;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la === CashScriptParser.T__15) {
					{
					this.state = 218;
					this.match(CashScriptParser.T__15);
					}
				}

				}
			}

			this.state = 223;
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
	public functionCall(): FunctionCallContext {
		let _localctx: FunctionCallContext = new FunctionCallContext(this._ctx, this.state);
		this.enterRule(_localctx, 42, CashScriptParser.RULE_functionCall);
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 225;
			this.match(CashScriptParser.Identifier);
			this.state = 226;
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
		this.enterRule(_localctx, 44, CashScriptParser.RULE_expressionList);
		let _la: number;
		try {
			let _alt: number;
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 228;
			this.match(CashScriptParser.T__14);
			this.state = 240;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if ((((_la) & ~0x1F) === 0 && ((1 << _la) & ((1 << CashScriptParser.T__14) | (1 << CashScriptParser.T__21) | (1 << CashScriptParser.T__22) | (1 << CashScriptParser.T__24) | (1 << CashScriptParser.T__30))) !== 0) || ((((_la - 39)) & ~0x1F) === 0 && ((1 << (_la - 39)) & ((1 << (CashScriptParser.T__38 - 39)) | (1 << (CashScriptParser.T__39 - 39)) | (1 << (CashScriptParser.T__51 - 39)) | (1 << (CashScriptParser.T__52 - 39)) | (1 << (CashScriptParser.T__53 - 39)) | (1 << (CashScriptParser.T__54 - 39)) | (1 << (CashScriptParser.T__55 - 39)) | (1 << (CashScriptParser.T__56 - 39)) | (1 << (CashScriptParser.BooleanLiteral - 39)) | (1 << (CashScriptParser.NumberLiteral - 39)) | (1 << (CashScriptParser.Bytes - 39)) | (1 << (CashScriptParser.StringLiteral - 39)) | (1 << (CashScriptParser.DateLiteral - 39)) | (1 << (CashScriptParser.HexLiteral - 39)) | (1 << (CashScriptParser.NullaryOp - 39)) | (1 << (CashScriptParser.Identifier - 39)))) !== 0)) {
				{
				this.state = 229;
				this.expression(0);
				this.state = 234;
				this._errHandler.sync(this);
				_alt = this.interpreter.adaptivePredict(this._input, 18, this._ctx);
				while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
					if (_alt === 1) {
						{
						{
						this.state = 230;
						this.match(CashScriptParser.T__15);
						this.state = 231;
						this.expression(0);
						}
						}
					}
					this.state = 236;
					this._errHandler.sync(this);
					_alt = this.interpreter.adaptivePredict(this._input, 18, this._ctx);
				}
				this.state = 238;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la === CashScriptParser.T__15) {
					{
					this.state = 237;
					this.match(CashScriptParser.T__15);
					}
				}

				}
			}

			this.state = 242;
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
		let _startState: number = 46;
		this.enterRecursionRule(_localctx, 46, CashScriptParser.RULE_expression, _p);
		let _la: number;
		try {
			let _alt: number;
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 297;
			this._errHandler.sync(this);
			switch ( this.interpreter.adaptivePredict(this._input, 26, this._ctx) ) {
			case 1:
				{
				_localctx = new ParenthesisedContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;

				this.state = 245;
				this.match(CashScriptParser.T__14);
				this.state = 246;
				this.expression(0);
				this.state = 247;
				this.match(CashScriptParser.T__16);
				}
				break;

			case 2:
				{
				_localctx = new CastContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 249;
				this.typeName();
				this.state = 250;
				this.match(CashScriptParser.T__14);
				this.state = 251;
				(_localctx as CastContext)._castable = this.expression(0);
				this.state = 254;
				this._errHandler.sync(this);
				switch ( this.interpreter.adaptivePredict(this._input, 21, this._ctx) ) {
				case 1:
					{
					this.state = 252;
					this.match(CashScriptParser.T__15);
					this.state = 253;
					(_localctx as CastContext)._size = this.expression(0);
					}
					break;
				}
				this.state = 257;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la === CashScriptParser.T__15) {
					{
					this.state = 256;
					this.match(CashScriptParser.T__15);
					}
				}

				this.state = 259;
				this.match(CashScriptParser.T__16);
				}
				break;

			case 3:
				{
				_localctx = new FunctionCallExpressionContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 261;
				this.functionCall();
				}
				break;

			case 4:
				{
				_localctx = new InstantiationContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 262;
				this.match(CashScriptParser.T__21);
				this.state = 263;
				this.match(CashScriptParser.Identifier);
				this.state = 264;
				this.expressionList();
				}
				break;

			case 5:
				{
				_localctx = new UnaryIntrospectionOpContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 265;
				(_localctx as UnaryIntrospectionOpContext)._scope = this.match(CashScriptParser.T__24);
				this.state = 266;
				this.match(CashScriptParser.T__22);
				this.state = 267;
				this.expression(0);
				this.state = 268;
				this.match(CashScriptParser.T__23);
				this.state = 269;
				(_localctx as UnaryIntrospectionOpContext)._op = this._input.LT(1);
				_la = this._input.LA(1);
				if (!((((_la) & ~0x1F) === 0 && ((1 << _la) & ((1 << CashScriptParser.T__25) | (1 << CashScriptParser.T__26) | (1 << CashScriptParser.T__27) | (1 << CashScriptParser.T__28) | (1 << CashScriptParser.T__29))) !== 0))) {
					(_localctx as UnaryIntrospectionOpContext)._op = this._errHandler.recoverInline(this);
				} else {
					if (this._input.LA(1) === Token.EOF) {
						this.matchedEOF = true;
					}

					this._errHandler.reportMatch(this);
					this.consume();
				}
				}
				break;

			case 6:
				{
				_localctx = new UnaryIntrospectionOpContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 271;
				(_localctx as UnaryIntrospectionOpContext)._scope = this.match(CashScriptParser.T__30);
				this.state = 272;
				this.match(CashScriptParser.T__22);
				this.state = 273;
				this.expression(0);
				this.state = 274;
				this.match(CashScriptParser.T__23);
				this.state = 275;
				(_localctx as UnaryIntrospectionOpContext)._op = this._input.LT(1);
				_la = this._input.LA(1);
				if (!(((((_la - 26)) & ~0x1F) === 0 && ((1 << (_la - 26)) & ((1 << (CashScriptParser.T__25 - 26)) | (1 << (CashScriptParser.T__26 - 26)) | (1 << (CashScriptParser.T__27 - 26)) | (1 << (CashScriptParser.T__28 - 26)) | (1 << (CashScriptParser.T__29 - 26)) | (1 << (CashScriptParser.T__31 - 26)) | (1 << (CashScriptParser.T__32 - 26)) | (1 << (CashScriptParser.T__33 - 26)) | (1 << (CashScriptParser.T__34 - 26)))) !== 0))) {
					(_localctx as UnaryIntrospectionOpContext)._op = this._errHandler.recoverInline(this);
				} else {
					if (this._input.LA(1) === Token.EOF) {
						this.matchedEOF = true;
					}

					this._errHandler.reportMatch(this);
					this.consume();
				}
				}
				break;

			case 7:
				{
				_localctx = new UnaryOpContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 277;
				(_localctx as UnaryOpContext)._op = this._input.LT(1);
				_la = this._input.LA(1);
				if (!(_la === CashScriptParser.T__38 || _la === CashScriptParser.T__39)) {
					(_localctx as UnaryOpContext)._op = this._errHandler.recoverInline(this);
				} else {
					if (this._input.LA(1) === Token.EOF) {
						this.matchedEOF = true;
					}

					this._errHandler.reportMatch(this);
					this.consume();
				}
				this.state = 278;
				this.expression(14);
				}
				break;

			case 8:
				{
				_localctx = new ArrayContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 279;
				this.match(CashScriptParser.T__22);
				this.state = 291;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if ((((_la) & ~0x1F) === 0 && ((1 << _la) & ((1 << CashScriptParser.T__14) | (1 << CashScriptParser.T__21) | (1 << CashScriptParser.T__22) | (1 << CashScriptParser.T__24) | (1 << CashScriptParser.T__30))) !== 0) || ((((_la - 39)) & ~0x1F) === 0 && ((1 << (_la - 39)) & ((1 << (CashScriptParser.T__38 - 39)) | (1 << (CashScriptParser.T__39 - 39)) | (1 << (CashScriptParser.T__51 - 39)) | (1 << (CashScriptParser.T__52 - 39)) | (1 << (CashScriptParser.T__53 - 39)) | (1 << (CashScriptParser.T__54 - 39)) | (1 << (CashScriptParser.T__55 - 39)) | (1 << (CashScriptParser.T__56 - 39)) | (1 << (CashScriptParser.BooleanLiteral - 39)) | (1 << (CashScriptParser.NumberLiteral - 39)) | (1 << (CashScriptParser.Bytes - 39)) | (1 << (CashScriptParser.StringLiteral - 39)) | (1 << (CashScriptParser.DateLiteral - 39)) | (1 << (CashScriptParser.HexLiteral - 39)) | (1 << (CashScriptParser.NullaryOp - 39)) | (1 << (CashScriptParser.Identifier - 39)))) !== 0)) {
					{
					this.state = 280;
					this.expression(0);
					this.state = 285;
					this._errHandler.sync(this);
					_alt = this.interpreter.adaptivePredict(this._input, 23, this._ctx);
					while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
						if (_alt === 1) {
							{
							{
							this.state = 281;
							this.match(CashScriptParser.T__15);
							this.state = 282;
							this.expression(0);
							}
							}
						}
						this.state = 287;
						this._errHandler.sync(this);
						_alt = this.interpreter.adaptivePredict(this._input, 23, this._ctx);
					}
					this.state = 289;
					this._errHandler.sync(this);
					_la = this._input.LA(1);
					if (_la === CashScriptParser.T__15) {
						{
						this.state = 288;
						this.match(CashScriptParser.T__15);
						}
					}

					}
				}

				this.state = 293;
				this.match(CashScriptParser.T__23);
				}
				break;

			case 9:
				{
				_localctx = new NullaryOpContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 294;
				this.match(CashScriptParser.NullaryOp);
				}
				break;

			case 10:
				{
				_localctx = new IdentifierContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 295;
				this.match(CashScriptParser.Identifier);
				}
				break;

			case 11:
				{
				_localctx = new LiteralExpressionContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 296;
				this.literal();
				}
				break;
			}
			this._ctx._stop = this._input.tryLT(-1);
			this.state = 340;
			this._errHandler.sync(this);
			_alt = this.interpreter.adaptivePredict(this._input, 28, this._ctx);
			while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
				if (_alt === 1) {
					if (this._parseListeners != null) {
						this.triggerExitRuleEvent();
					}
					_prevctx = _localctx;
					{
					this.state = 338;
					this._errHandler.sync(this);
					switch ( this.interpreter.adaptivePredict(this._input, 27, this._ctx) ) {
					case 1:
						{
						_localctx = new BinaryOpContext(new ExpressionContext(_parentctx, _parentState));
						(_localctx as BinaryOpContext)._left = _prevctx;
						this.pushNewRecursionContext(_localctx, _startState, CashScriptParser.RULE_expression);
						this.state = 299;
						if (!(this.precpred(this._ctx, 13))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 13)");
						}
						this.state = 300;
						(_localctx as BinaryOpContext)._op = this._input.LT(1);
						_la = this._input.LA(1);
						if (!(((((_la - 41)) & ~0x1F) === 0 && ((1 << (_la - 41)) & ((1 << (CashScriptParser.T__40 - 41)) | (1 << (CashScriptParser.T__41 - 41)) | (1 << (CashScriptParser.T__42 - 41)))) !== 0))) {
							(_localctx as BinaryOpContext)._op = this._errHandler.recoverInline(this);
						} else {
							if (this._input.LA(1) === Token.EOF) {
								this.matchedEOF = true;
							}

							this._errHandler.reportMatch(this);
							this.consume();
						}
						this.state = 301;
						(_localctx as BinaryOpContext)._right = this.expression(14);
						}
						break;

					case 2:
						{
						_localctx = new BinaryOpContext(new ExpressionContext(_parentctx, _parentState));
						(_localctx as BinaryOpContext)._left = _prevctx;
						this.pushNewRecursionContext(_localctx, _startState, CashScriptParser.RULE_expression);
						this.state = 302;
						if (!(this.precpred(this._ctx, 12))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 12)");
						}
						this.state = 303;
						(_localctx as BinaryOpContext)._op = this._input.LT(1);
						_la = this._input.LA(1);
						if (!(_la === CashScriptParser.T__39 || _la === CashScriptParser.T__43)) {
							(_localctx as BinaryOpContext)._op = this._errHandler.recoverInline(this);
						} else {
							if (this._input.LA(1) === Token.EOF) {
								this.matchedEOF = true;
							}

							this._errHandler.reportMatch(this);
							this.consume();
						}
						this.state = 304;
						(_localctx as BinaryOpContext)._right = this.expression(13);
						}
						break;

					case 3:
						{
						_localctx = new BinaryOpContext(new ExpressionContext(_parentctx, _parentState));
						(_localctx as BinaryOpContext)._left = _prevctx;
						this.pushNewRecursionContext(_localctx, _startState, CashScriptParser.RULE_expression);
						this.state = 305;
						if (!(this.precpred(this._ctx, 11))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 11)");
						}
						this.state = 306;
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
						this.state = 307;
						(_localctx as BinaryOpContext)._right = this.expression(12);
						}
						break;

					case 4:
						{
						_localctx = new BinaryOpContext(new ExpressionContext(_parentctx, _parentState));
						(_localctx as BinaryOpContext)._left = _prevctx;
						this.pushNewRecursionContext(_localctx, _startState, CashScriptParser.RULE_expression);
						this.state = 308;
						if (!(this.precpred(this._ctx, 10))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 10)");
						}
						this.state = 309;
						(_localctx as BinaryOpContext)._op = this._input.LT(1);
						_la = this._input.LA(1);
						if (!(_la === CashScriptParser.T__44 || _la === CashScriptParser.T__45)) {
							(_localctx as BinaryOpContext)._op = this._errHandler.recoverInline(this);
						} else {
							if (this._input.LA(1) === Token.EOF) {
								this.matchedEOF = true;
							}

							this._errHandler.reportMatch(this);
							this.consume();
						}
						this.state = 310;
						(_localctx as BinaryOpContext)._right = this.expression(11);
						}
						break;

					case 5:
						{
						_localctx = new BinaryOpContext(new ExpressionContext(_parentctx, _parentState));
						(_localctx as BinaryOpContext)._left = _prevctx;
						this.pushNewRecursionContext(_localctx, _startState, CashScriptParser.RULE_expression);
						this.state = 311;
						if (!(this.precpred(this._ctx, 9))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 9)");
						}
						this.state = 312;
						(_localctx as BinaryOpContext)._op = this.match(CashScriptParser.T__46);
						this.state = 313;
						(_localctx as BinaryOpContext)._right = this.expression(10);
						}
						break;

					case 6:
						{
						_localctx = new BinaryOpContext(new ExpressionContext(_parentctx, _parentState));
						(_localctx as BinaryOpContext)._left = _prevctx;
						this.pushNewRecursionContext(_localctx, _startState, CashScriptParser.RULE_expression);
						this.state = 314;
						if (!(this.precpred(this._ctx, 8))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 8)");
						}
						this.state = 315;
						(_localctx as BinaryOpContext)._op = this.match(CashScriptParser.T__3);
						this.state = 316;
						(_localctx as BinaryOpContext)._right = this.expression(9);
						}
						break;

					case 7:
						{
						_localctx = new BinaryOpContext(new ExpressionContext(_parentctx, _parentState));
						(_localctx as BinaryOpContext)._left = _prevctx;
						this.pushNewRecursionContext(_localctx, _startState, CashScriptParser.RULE_expression);
						this.state = 317;
						if (!(this.precpred(this._ctx, 7))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 7)");
						}
						this.state = 318;
						(_localctx as BinaryOpContext)._op = this.match(CashScriptParser.T__47);
						this.state = 319;
						(_localctx as BinaryOpContext)._right = this.expression(8);
						}
						break;

					case 8:
						{
						_localctx = new BinaryOpContext(new ExpressionContext(_parentctx, _parentState));
						(_localctx as BinaryOpContext)._left = _prevctx;
						this.pushNewRecursionContext(_localctx, _startState, CashScriptParser.RULE_expression);
						this.state = 320;
						if (!(this.precpred(this._ctx, 6))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 6)");
						}
						this.state = 321;
						(_localctx as BinaryOpContext)._op = this.match(CashScriptParser.T__48);
						this.state = 322;
						(_localctx as BinaryOpContext)._right = this.expression(7);
						}
						break;

					case 9:
						{
						_localctx = new BinaryOpContext(new ExpressionContext(_parentctx, _parentState));
						(_localctx as BinaryOpContext)._left = _prevctx;
						this.pushNewRecursionContext(_localctx, _startState, CashScriptParser.RULE_expression);
						this.state = 323;
						if (!(this.precpred(this._ctx, 5))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 5)");
						}
						this.state = 324;
						(_localctx as BinaryOpContext)._op = this.match(CashScriptParser.T__49);
						this.state = 325;
						(_localctx as BinaryOpContext)._right = this.expression(6);
						}
						break;

					case 10:
						{
						_localctx = new TupleIndexOpContext(new ExpressionContext(_parentctx, _parentState));
						this.pushNewRecursionContext(_localctx, _startState, CashScriptParser.RULE_expression);
						this.state = 326;
						if (!(this.precpred(this._ctx, 19))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 19)");
						}
						this.state = 327;
						this.match(CashScriptParser.T__22);
						this.state = 328;
						(_localctx as TupleIndexOpContext)._index = this.match(CashScriptParser.NumberLiteral);
						this.state = 329;
						this.match(CashScriptParser.T__23);
						}
						break;

					case 11:
						{
						_localctx = new UnaryOpContext(new ExpressionContext(_parentctx, _parentState));
						this.pushNewRecursionContext(_localctx, _startState, CashScriptParser.RULE_expression);
						this.state = 330;
						if (!(this.precpred(this._ctx, 16))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 16)");
						}
						this.state = 331;
						(_localctx as UnaryOpContext)._op = this._input.LT(1);
						_la = this._input.LA(1);
						if (!(_la === CashScriptParser.T__35 || _la === CashScriptParser.T__36)) {
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

					case 12:
						{
						_localctx = new BinaryOpContext(new ExpressionContext(_parentctx, _parentState));
						(_localctx as BinaryOpContext)._left = _prevctx;
						this.pushNewRecursionContext(_localctx, _startState, CashScriptParser.RULE_expression);
						this.state = 332;
						if (!(this.precpred(this._ctx, 15))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 15)");
						}
						this.state = 333;
						(_localctx as BinaryOpContext)._op = this.match(CashScriptParser.T__37);
						this.state = 334;
						this.match(CashScriptParser.T__14);
						this.state = 335;
						(_localctx as BinaryOpContext)._right = this.expression(0);
						this.state = 336;
						this.match(CashScriptParser.T__16);
						}
						break;
					}
					}
				}
				this.state = 342;
				this._errHandler.sync(this);
				_alt = this.interpreter.adaptivePredict(this._input, 28, this._ctx);
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
	public modifier(): ModifierContext {
		let _localctx: ModifierContext = new ModifierContext(this._ctx, this.state);
		this.enterRule(_localctx, 48, CashScriptParser.RULE_modifier);
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 343;
			this.match(CashScriptParser.T__50);
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
	public literal(): LiteralContext {
		let _localctx: LiteralContext = new LiteralContext(this._ctx, this.state);
		this.enterRule(_localctx, 50, CashScriptParser.RULE_literal);
		try {
			this.state = 350;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case CashScriptParser.BooleanLiteral:
				this.enterOuterAlt(_localctx, 1);
				{
				this.state = 345;
				this.match(CashScriptParser.BooleanLiteral);
				}
				break;
			case CashScriptParser.NumberLiteral:
				this.enterOuterAlt(_localctx, 2);
				{
				this.state = 346;
				this.numberLiteral();
				}
				break;
			case CashScriptParser.StringLiteral:
				this.enterOuterAlt(_localctx, 3);
				{
				this.state = 347;
				this.match(CashScriptParser.StringLiteral);
				}
				break;
			case CashScriptParser.DateLiteral:
				this.enterOuterAlt(_localctx, 4);
				{
				this.state = 348;
				this.match(CashScriptParser.DateLiteral);
				}
				break;
			case CashScriptParser.HexLiteral:
				this.enterOuterAlt(_localctx, 5);
				{
				this.state = 349;
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
		this.enterRule(_localctx, 52, CashScriptParser.RULE_numberLiteral);
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 352;
			this.match(CashScriptParser.NumberLiteral);
			this.state = 354;
			this._errHandler.sync(this);
			switch ( this.interpreter.adaptivePredict(this._input, 30, this._ctx) ) {
			case 1:
				{
				this.state = 353;
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
		this.enterRule(_localctx, 54, CashScriptParser.RULE_typeName);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 356;
			_la = this._input.LA(1);
			if (!(((((_la - 52)) & ~0x1F) === 0 && ((1 << (_la - 52)) & ((1 << (CashScriptParser.T__51 - 52)) | (1 << (CashScriptParser.T__52 - 52)) | (1 << (CashScriptParser.T__53 - 52)) | (1 << (CashScriptParser.T__54 - 52)) | (1 << (CashScriptParser.T__55 - 52)) | (1 << (CashScriptParser.T__56 - 52)) | (1 << (CashScriptParser.Bytes - 52)))) !== 0))) {
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
		case 23:
			return this.expression_sempred(_localctx as ExpressionContext, predIndex);
		}
		return true;
	}
	private expression_sempred(_localctx: ExpressionContext, predIndex: number): boolean {
		switch (predIndex) {
		case 0:
			return this.precpred(this._ctx, 13);

		case 1:
			return this.precpred(this._ctx, 12);

		case 2:
			return this.precpred(this._ctx, 11);

		case 3:
			return this.precpred(this._ctx, 10);

		case 4:
			return this.precpred(this._ctx, 9);

		case 5:
			return this.precpred(this._ctx, 8);

		case 6:
			return this.precpred(this._ctx, 7);

		case 7:
			return this.precpred(this._ctx, 6);

		case 8:
			return this.precpred(this._ctx, 5);

		case 9:
			return this.precpred(this._ctx, 19);

		case 10:
			return this.precpred(this._ctx, 16);

		case 11:
			return this.precpred(this._ctx, 15);
		}
		return true;
	}

	public static readonly _serializedATN: string =
		"\x03\uC91D\uCABA\u058D\uAFBA\u4F53\u0607\uEA8B\uC241\x03J\u0169\x04\x02" +
		"\t\x02\x04\x03\t\x03\x04\x04\t\x04\x04\x05\t\x05\x04\x06\t\x06\x04\x07" +
		"\t\x07\x04\b\t\b\x04\t\t\t\x04\n\t\n\x04\v\t\v\x04\f\t\f\x04\r\t\r\x04" +
		"\x0E\t\x0E\x04\x0F\t\x0F\x04\x10\t\x10\x04\x11\t\x11\x04\x12\t\x12\x04" +
		"\x13\t\x13\x04\x14\t\x14\x04\x15\t\x15\x04\x16\t\x16\x04\x17\t\x17\x04" +
		"\x18\t\x18\x04\x19\t\x19\x04\x1A\t\x1A\x04\x1B\t\x1B\x04\x1C\t\x1C\x04" +
		"\x1D\t\x1D\x03\x02\x07\x02<\n\x02\f\x02\x0E\x02?\v\x02\x03\x02\x03\x02" +
		"\x03\x02\x03\x03\x03\x03\x03\x03\x03\x03\x03\x03\x03\x04\x03\x04\x03\x05" +
		"\x03\x05\x05\x05M\n\x05\x03\x06\x05\x06P\n\x06\x03\x06\x03\x06\x03\x07" +
		"\x03\x07\x03\b\x03\b\x03\b\x03\b\x03\b\x07\b[\n\b\f\b\x0E\b^\v\b\x03\b" +
		"\x03\b\x03\t\x03\t\x03\t\x03\t\x03\t\x07\tg\n\t\f\t\x0E\tj\v\t\x03\t\x03" +
		"\t\x03\n\x03\n\x03\n\x03\n\x07\nr\n\n\f\n\x0E\nu\v\n\x03\n\x05\nx\n\n" +
		"\x05\nz\n\n\x03\n\x03\n\x03\v\x03\v\x03\v\x03\f\x03\f\x07\f\x83\n\f\f" +
		"\f\x0E\f\x86\v\f\x03\f\x03\f\x05\f\x8A\n\f\x03\r\x03\r\x03\r\x03\r\x03" +
		"\r\x03\r\x03\r\x05\r\x93\n\r\x03\x0E\x03\x0E\x07\x0E\x97\n\x0E\f\x0E\x0E" +
		"\x0E\x9A\v\x0E\x03\x0E\x03\x0E\x03\x0E\x03\x0E\x03\x0E\x03\x0F\x03\x0F" +
		"\x03\x0F\x03\x0F\x03\x0F\x03\x0F\x03\x0F\x03\x0F\x03\x0F\x03\x10\x03\x10" +
		"\x03\x10\x03\x10\x03\x10\x03\x11\x03\x11\x03\x11\x03\x11\x03\x11\x03\x11" +
		"\x03\x11\x05\x11\xB6\n\x11\x03\x11\x03\x11\x03\x11\x03\x12\x03\x12\x03" +
		"\x12\x03\x12\x03\x12\x05\x12\xC0\n\x12\x03\x12\x03\x12\x03\x12\x03\x13" +
		"\x03\x13\x03\x13\x03\x13\x03\x13\x03\x13\x03\x13\x05\x13\xCC\n\x13\x03" +
		"\x14\x03\x14\x03\x14\x03\x14\x03\x15\x03\x15\x03\x16\x03\x16\x03\x16\x03" +
		"\x16\x07\x16\xD8\n\x16\f\x16\x0E\x16\xDB\v\x16\x03\x16\x05\x16\xDE\n\x16" +
		"\x05\x16\xE0\n\x16\x03\x16\x03\x16\x03\x17\x03\x17\x03\x17\x03\x18\x03" +
		"\x18\x03\x18\x03\x18\x07\x18\xEB\n\x18\f\x18\x0E\x18\xEE\v\x18\x03\x18" +
		"\x05\x18\xF1\n\x18\x05\x18\xF3\n\x18\x03\x18\x03\x18\x03\x19\x03\x19\x03" +
		"\x19\x03\x19\x03\x19\x03\x19\x03\x19\x03\x19\x03\x19\x03\x19\x05\x19\u0101" +
		"\n\x19\x03\x19\x05\x19\u0104\n\x19\x03\x19\x03\x19\x03\x19\x03\x19\x03" +
		"\x19\x03\x19\x03\x19\x03\x19\x03\x19\x03\x19\x03\x19\x03\x19\x03\x19\x03" +
		"\x19\x03\x19\x03\x19\x03\x19\x03\x19\x03\x19\x03\x19\x03\x19\x03\x19\x03" +
		"\x19\x03\x19\x07\x19\u011E\n\x19\f\x19\x0E\x19\u0121\v\x19\x03\x19\x05" +
		"\x19\u0124\n\x19\x05\x19\u0126\n\x19\x03\x19\x03\x19\x03\x19\x03\x19\x05" +
		"\x19\u012C\n\x19\x03\x19\x03\x19\x03\x19\x03\x19\x03\x19\x03\x19\x03\x19" +
		"\x03\x19\x03\x19\x03\x19\x03\x19\x03\x19\x03\x19\x03\x19\x03\x19\x03\x19" +
		"\x03\x19\x03\x19\x03\x19\x03\x19\x03\x19\x03\x19\x03\x19\x03\x19\x03\x19" +
		"\x03\x19\x03\x19\x03\x19\x03\x19\x03\x19\x03\x19\x03\x19\x03\x19\x03\x19" +
		"\x03\x19\x03\x19\x03\x19\x03\x19\x03\x19\x07\x19\u0155\n\x19\f\x19\x0E" +
		"\x19\u0158\v\x19\x03\x1A\x03\x1A\x03\x1B\x03\x1B\x03\x1B\x03\x1B\x03\x1B" +
		"\x05\x1B\u0161\n\x1B\x03\x1C\x03\x1C\x05\x1C\u0165\n\x1C\x03\x1D\x03\x1D" +
		"\x03\x1D\x02\x02\x030\x1E\x02\x02\x04\x02\x06\x02\b\x02\n\x02\f\x02\x0E" +
		"\x02\x10\x02\x12\x02\x14\x02\x16\x02\x18\x02\x1A\x02\x1C\x02\x1E\x02 " +
		"\x02\"\x02$\x02&\x02(\x02*\x02,\x02.\x020\x022\x024\x026\x028\x02\x02" +
		"\r\x03\x02\x06\f\x07\x02==??BBDDGG\x03\x02\x1C \x04\x02\x1C \"%\x03\x02" +
		")*\x03\x02+-\x04\x02**..\x03\x02\b\v\x03\x02/0\x03\x02&\'\x04\x026;@@" +
		"\x02\u0186\x02=\x03\x02\x02\x02\x04C\x03\x02\x02\x02\x06H\x03\x02\x02" +
		"\x02\bJ\x03\x02\x02\x02\nO\x03\x02\x02\x02\fS\x03\x02\x02\x02\x0EU\x03" +
		"\x02\x02\x02\x10a\x03\x02\x02\x02\x12m\x03\x02\x02\x02\x14}\x03\x02\x02" +
		"\x02\x16\x89\x03\x02\x02\x02\x18\x92\x03\x02\x02\x02\x1A\x94\x03\x02\x02" +
		"\x02\x1C\xA0\x03\x02\x02\x02\x1E\xA9\x03\x02\x02\x02 \xAE\x03\x02\x02" +
		"\x02\"\xBA\x03\x02\x02\x02$\xC4\x03\x02\x02\x02&\xCD\x03\x02\x02\x02(" +
		"\xD1\x03\x02\x02\x02*\xD3\x03\x02\x02\x02,\xE3\x03\x02\x02\x02.\xE6\x03" +
		"\x02\x02\x020\u012B\x03\x02\x02\x022\u0159\x03\x02\x02\x024\u0160\x03" +
		"\x02\x02\x026\u0162\x03\x02\x02\x028\u0166\x03\x02\x02\x02:<\x05\x04\x03" +
		"\x02;:\x03\x02\x02\x02<?\x03\x02\x02\x02=;\x03\x02\x02\x02=>\x03\x02\x02" +
		"\x02>@\x03\x02\x02\x02?=\x03\x02\x02\x02@A\x05\x0E\b\x02AB\x07\x02\x02" +
		"\x03B\x03\x03\x02\x02\x02CD\x07\x03\x02\x02DE\x05\x06\x04\x02EF\x05\b" +
		"\x05\x02FG\x07\x04\x02\x02G\x05\x03\x02\x02\x02HI\x07\x05\x02\x02I\x07" +
		"\x03\x02\x02\x02JL\x05\n\x06\x02KM\x05\n\x06\x02LK\x03\x02\x02\x02LM\x03" +
		"\x02\x02\x02M\t\x03\x02\x02\x02NP\x05\f\x07\x02ON\x03\x02\x02\x02OP\x03" +
		"\x02\x02\x02PQ\x03\x02\x02\x02QR\x07<\x02\x02R\v\x03\x02\x02\x02ST\t\x02" +
		"\x02\x02T\r\x03\x02\x02\x02UV\x07\r\x02\x02VW\x07G\x02\x02WX\x05\x12\n" +
		"\x02X\\\x07\x0E\x02\x02Y[\x05\x10\t\x02ZY\x03\x02\x02\x02[^\x03\x02\x02" +
		"\x02\\Z\x03\x02\x02\x02\\]\x03\x02\x02\x02]_\x03\x02\x02\x02^\\\x03\x02" +
		"\x02\x02_`\x07\x0F\x02\x02`\x0F\x03\x02\x02\x02ab\x07\x10\x02\x02bc\x07" +
		"G\x02\x02cd\x05\x12\n\x02dh\x07\x0E\x02\x02eg\x05\x18\r\x02fe\x03\x02" +
		"\x02\x02gj\x03\x02\x02\x02hf\x03\x02\x02\x02hi\x03\x02\x02\x02ik\x03\x02" +
		"\x02\x02jh\x03\x02\x02\x02kl\x07\x0F\x02\x02l\x11\x03\x02\x02\x02my\x07" +
		"\x11\x02\x02ns\x05\x14\v\x02op\x07\x12\x02\x02pr\x05\x14\v\x02qo\x03\x02" +
		"\x02\x02ru\x03\x02\x02\x02sq\x03\x02\x02\x02st\x03\x02\x02\x02tw\x03\x02" +
		"\x02\x02us\x03\x02\x02\x02vx\x07\x12\x02\x02wv\x03\x02\x02\x02wx\x03\x02" +
		"\x02\x02xz\x03\x02\x02\x02yn\x03\x02\x02\x02yz\x03\x02\x02\x02z{\x03\x02" +
		"\x02\x02{|\x07\x13\x02\x02|\x13\x03\x02\x02\x02}~\x058\x1D\x02~\x7F\x07" +
		"G\x02\x02\x7F\x15\x03\x02\x02\x02\x80\x84\x07\x0E\x02\x02\x81\x83\x05" +
		"\x18\r\x02\x82\x81\x03\x02\x02\x02\x83\x86\x03\x02\x02\x02\x84\x82\x03" +
		"\x02\x02\x02\x84\x85\x03\x02\x02\x02\x85\x87\x03\x02\x02\x02\x86\x84\x03" +
		"\x02\x02\x02\x87\x8A\x07\x0F\x02\x02\x88\x8A\x05\x18\r\x02\x89\x80\x03" +
		"\x02\x02\x02\x89\x88\x03\x02\x02\x02\x8A\x17\x03\x02\x02\x02\x8B\x93\x05" +
		"\x1A\x0E\x02\x8C\x93\x05\x1C\x0F\x02\x8D\x93\x05\x1E\x10\x02\x8E\x93\x05" +
		" \x11\x02\x8F\x93\x05\"\x12\x02\x90\x93\x05$\x13\x02\x91\x93\x05&\x14" +
		"\x02\x92\x8B\x03\x02\x02\x02\x92\x8C\x03\x02\x02\x02\x92\x8D\x03\x02\x02" +
		"\x02\x92\x8E\x03\x02\x02\x02\x92\x8F\x03\x02\x02\x02\x92\x90\x03\x02\x02" +
		"\x02\x92\x91\x03\x02\x02\x02\x93\x19\x03\x02\x02\x02\x94\x98\x058\x1D" +
		"\x02\x95\x97\x052\x1A\x02\x96\x95\x03\x02\x02\x02\x97\x9A\x03\x02\x02" +
		"\x02\x98\x96\x03\x02\x02\x02\x98\x99\x03\x02\x02\x02\x99\x9B\x03\x02\x02" +
		"\x02\x9A\x98\x03\x02\x02\x02\x9B\x9C\x07G\x02\x02\x9C\x9D\x07\f\x02\x02" +
		"\x9D\x9E\x050\x19\x02\x9E\x9F\x07\x04\x02\x02\x9F\x1B\x03\x02\x02\x02" +
		"\xA0\xA1\x058\x1D\x02\xA1\xA2\x07G\x02\x02\xA2\xA3\x07\x12\x02\x02\xA3" +
		"\xA4\x058\x1D\x02\xA4\xA5\x07G\x02\x02\xA5\xA6\x07\f\x02\x02\xA6\xA7\x05" +
		"0\x19\x02\xA7\xA8\x07\x04\x02\x02\xA8\x1D\x03\x02\x02\x02\xA9\xAA\x07" +
		"G\x02\x02\xAA\xAB\x07\f\x02\x02\xAB\xAC\x050\x19\x02\xAC\xAD\x07\x04\x02" +
		"\x02\xAD\x1F\x03\x02\x02\x02\xAE\xAF\x07\x14\x02\x02\xAF\xB0\x07\x11\x02" +
		"\x02\xB0\xB1\x07E\x02\x02\xB1\xB2\x07\b\x02\x02\xB2\xB5\x050\x19\x02\xB3" +
		"\xB4\x07\x12\x02\x02\xB4\xB6\x07B\x02\x02\xB5\xB3\x03\x02\x02\x02\xB5" +
		"\xB6\x03\x02\x02\x02\xB6\xB7\x03\x02\x02\x02\xB7\xB8\x07\x13\x02\x02\xB8" +
		"\xB9\x07\x04\x02\x02\xB9!\x03\x02\x02\x02\xBA\xBB\x07\x14\x02\x02\xBB" +
		"\xBC\x07\x11\x02\x02\xBC\xBF\x050\x19\x02\xBD\xBE\x07\x12\x02\x02\xBE" +
		"\xC0\x07B\x02\x02\xBF\xBD\x03\x02\x02\x02\xBF\xC0\x03\x02\x02\x02\xC0" +
		"\xC1\x03\x02\x02\x02\xC1\xC2\x07\x13\x02\x02\xC2\xC3\x07\x04\x02\x02\xC3" +
		"#\x03\x02\x02\x02\xC4\xC5\x07\x15\x02\x02\xC5\xC6\x07\x11\x02\x02\xC6" +
		"\xC7\x050\x19\x02\xC7\xC8\x07\x13\x02\x02\xC8\xCB\x05\x16\f\x02\xC9\xCA" +
		"\x07\x16\x02\x02\xCA\xCC\x05\x16\f\x02\xCB\xC9\x03\x02\x02\x02\xCB\xCC" +
		"\x03\x02\x02\x02\xCC%\x03\x02\x02\x02\xCD\xCE\x07\x17\x02\x02\xCE\xCF" +
		"\x05*\x16\x02\xCF\xD0\x07\x04\x02\x02\xD0\'\x03\x02\x02\x02\xD1\xD2\t" +
		"\x03\x02\x02\xD2)\x03\x02\x02\x02\xD3\xDF\x07\x11\x02\x02\xD4\xD9\x05" +
		"(\x15\x02\xD5\xD6\x07\x12\x02\x02\xD6\xD8\x05(\x15\x02\xD7\xD5\x03\x02" +
		"\x02\x02\xD8\xDB\x03\x02\x02\x02\xD9\xD7\x03\x02\x02\x02\xD9\xDA\x03\x02" +
		"\x02\x02\xDA\xDD\x03\x02\x02\x02\xDB\xD9\x03\x02\x02\x02\xDC\xDE\x07\x12" +
		"\x02\x02\xDD\xDC\x03\x02\x02\x02\xDD\xDE\x03\x02\x02\x02\xDE\xE0\x03\x02" +
		"\x02\x02\xDF\xD4\x03\x02\x02\x02\xDF\xE0\x03\x02\x02\x02\xE0\xE1\x03\x02" +
		"\x02\x02\xE1\xE2\x07\x13\x02\x02\xE2+\x03\x02\x02\x02\xE3\xE4\x07G\x02" +
		"\x02\xE4\xE5\x05.\x18\x02\xE5-\x03\x02\x02\x02\xE6\xF2\x07\x11\x02\x02" +
		"\xE7\xEC\x050\x19\x02\xE8\xE9\x07\x12\x02\x02\xE9\xEB\x050\x19\x02\xEA" +
		"\xE8\x03\x02\x02\x02\xEB\xEE\x03\x02\x02\x02\xEC\xEA\x03\x02\x02\x02\xEC" +
		"\xED\x03\x02\x02\x02\xED\xF0\x03\x02\x02\x02\xEE\xEC\x03\x02\x02\x02\xEF" +
		"\xF1\x07\x12\x02\x02\xF0\xEF\x03\x02\x02\x02\xF0\xF1\x03\x02\x02\x02\xF1" +
		"\xF3\x03\x02\x02\x02\xF2\xE7\x03\x02\x02\x02\xF2\xF3\x03\x02\x02\x02\xF3" +
		"\xF4\x03\x02\x02\x02\xF4\xF5\x07\x13\x02\x02\xF5/\x03\x02\x02\x02\xF6" +
		"\xF7\b\x19\x01\x02\xF7\xF8\x07\x11\x02\x02\xF8\xF9\x050\x19\x02\xF9\xFA" +
		"\x07\x13\x02\x02\xFA\u012C\x03\x02\x02\x02\xFB\xFC\x058\x1D\x02\xFC\xFD" +
		"\x07\x11\x02\x02\xFD\u0100\x050\x19\x02\xFE\xFF\x07\x12\x02\x02\xFF\u0101" +
		"\x050\x19\x02\u0100\xFE\x03\x02\x02\x02\u0100\u0101\x03\x02\x02\x02\u0101" +
		"\u0103\x03\x02\x02\x02\u0102\u0104\x07\x12\x02\x02\u0103\u0102\x03\x02" +
		"\x02\x02\u0103\u0104\x03\x02\x02\x02\u0104\u0105\x03\x02\x02\x02\u0105" +
		"\u0106\x07\x13\x02\x02\u0106\u012C\x03\x02\x02\x02\u0107\u012C\x05,\x17" +
		"\x02\u0108\u0109\x07\x18\x02\x02\u0109\u010A\x07G\x02\x02\u010A\u012C" +
		"\x05.\x18\x02\u010B\u010C\x07\x1B\x02\x02\u010C\u010D\x07\x19\x02\x02" +
		"\u010D\u010E\x050\x19\x02\u010E\u010F\x07\x1A\x02\x02\u010F\u0110\t\x04" +
		"\x02\x02\u0110\u012C\x03\x02\x02\x02\u0111\u0112\x07!\x02\x02\u0112\u0113" +
		"\x07\x19\x02\x02\u0113\u0114\x050\x19\x02\u0114\u0115\x07\x1A\x02\x02" +
		"\u0115\u0116\t\x05\x02\x02\u0116\u012C\x03\x02\x02\x02\u0117\u0118\t\x06" +
		"\x02\x02\u0118\u012C\x050\x19\x10\u0119\u0125\x07\x19\x02\x02\u011A\u011F" +
		"\x050\x19\x02\u011B\u011C\x07\x12\x02\x02\u011C\u011E\x050\x19\x02\u011D" +
		"\u011B\x03\x02\x02\x02\u011E\u0121\x03\x02\x02\x02\u011F\u011D\x03\x02" +
		"\x02\x02\u011F\u0120\x03\x02\x02\x02\u0120\u0123\x03\x02\x02\x02\u0121" +
		"\u011F\x03\x02\x02\x02\u0122\u0124\x07\x12\x02\x02\u0123\u0122\x03\x02" +
		"\x02\x02\u0123\u0124\x03\x02\x02\x02\u0124\u0126\x03\x02\x02\x02\u0125" +
		"\u011A\x03\x02\x02\x02\u0125\u0126\x03\x02\x02\x02\u0126\u0127\x03\x02" +
		"\x02\x02\u0127\u012C\x07\x1A\x02\x02\u0128\u012C\x07F\x02\x02\u0129\u012C" +
		"\x07G\x02\x02\u012A\u012C\x054\x1B\x02\u012B\xF6\x03\x02\x02\x02\u012B" +
		"\xFB\x03\x02\x02\x02\u012B\u0107\x03\x02\x02\x02\u012B\u0108\x03\x02\x02" +
		"\x02\u012B\u010B\x03\x02\x02\x02\u012B\u0111\x03\x02\x02\x02\u012B\u0117" +
		"\x03\x02\x02\x02\u012B\u0119\x03\x02\x02\x02\u012B\u0128\x03\x02\x02\x02" +
		"\u012B\u0129\x03\x02\x02\x02\u012B\u012A\x03\x02\x02\x02\u012C\u0156\x03" +
		"\x02\x02\x02\u012D\u012E\f\x0F\x02\x02\u012E\u012F\t\x07\x02\x02\u012F" +
		"\u0155\x050\x19\x10\u0130\u0131\f\x0E\x02\x02\u0131\u0132\t\b\x02\x02" +
		"\u0132\u0155\x050\x19\x0F\u0133\u0134\f\r\x02\x02\u0134\u0135\t\t\x02" +
		"\x02\u0135\u0155\x050\x19\x0E\u0136\u0137\f\f\x02\x02\u0137\u0138\t\n" +
		"\x02\x02\u0138\u0155\x050\x19\r\u0139\u013A\f\v\x02\x02\u013A\u013B\x07" +
		"1\x02\x02\u013B\u0155\x050\x19\f\u013C\u013D\f\n\x02\x02\u013D\u013E\x07" +
		"\x06\x02\x02\u013E\u0155\x050\x19\v\u013F\u0140\f\t\x02\x02\u0140\u0141" +
		"\x072\x02\x02\u0141\u0155\x050\x19\n\u0142\u0143\f\b\x02\x02\u0143\u0144" +
		"\x073\x02\x02\u0144\u0155\x050\x19\t\u0145\u0146\f\x07\x02\x02\u0146\u0147" +
		"\x074\x02\x02\u0147\u0155\x050\x19\b\u0148\u0149\f\x15\x02\x02\u0149\u014A" +
		"\x07\x19\x02\x02\u014A\u014B\x07?\x02\x02\u014B\u0155\x07\x1A\x02\x02" +
		"\u014C\u014D\f\x12\x02\x02\u014D\u0155\t\v\x02\x02\u014E\u014F\f\x11\x02" +
		"\x02\u014F\u0150\x07(\x02\x02\u0150\u0151\x07\x11\x02\x02\u0151\u0152" +
		"\x050\x19\x02\u0152\u0153\x07\x13\x02\x02\u0153\u0155\x03\x02\x02\x02" +
		"\u0154\u012D\x03\x02\x02\x02\u0154\u0130\x03\x02\x02\x02\u0154\u0133\x03" +
		"\x02\x02\x02\u0154\u0136\x03\x02\x02\x02\u0154\u0139\x03\x02\x02\x02\u0154" +
		"\u013C\x03\x02\x02\x02\u0154\u013F\x03\x02\x02\x02\u0154\u0142\x03\x02" +
		"\x02\x02\u0154\u0145\x03\x02\x02\x02\u0154\u0148\x03\x02\x02\x02\u0154" +
		"\u014C\x03\x02\x02\x02\u0154\u014E\x03\x02\x02\x02\u0155\u0158\x03\x02" +
		"\x02\x02\u0156\u0154\x03\x02\x02\x02\u0156\u0157\x03\x02\x02\x02\u0157" +
		"1\x03\x02\x02\x02\u0158\u0156\x03\x02\x02\x02\u0159\u015A\x075\x02\x02" +
		"\u015A3\x03\x02\x02\x02\u015B\u0161\x07=\x02\x02\u015C\u0161\x056\x1C" +
		"\x02\u015D\u0161\x07B\x02\x02\u015E\u0161\x07C\x02\x02\u015F\u0161\x07" +
		"D\x02\x02\u0160\u015B\x03\x02\x02\x02\u0160\u015C\x03\x02\x02\x02\u0160" +
		"\u015D\x03\x02\x02\x02\u0160\u015E\x03\x02\x02\x02\u0160\u015F\x03\x02" +
		"\x02\x02\u01615\x03\x02\x02\x02\u0162\u0164\x07?\x02\x02\u0163\u0165\x07" +
		">\x02\x02\u0164\u0163\x03\x02\x02\x02\u0164\u0165\x03\x02\x02\x02\u0165" +
		"7\x03\x02\x02\x02\u0166\u0167\t\f\x02\x02\u01679\x03\x02\x02\x02!=LO\\" +
		"hswy\x84\x89\x92\x98\xB5\xBF\xCB\xD9\xDD\xDF\xEC\xF0\xF2\u0100\u0103\u011F" +
		"\u0123\u0125\u012B\u0154\u0156\u0160\u0164";
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
	public tupleAssignment(): TupleAssignmentContext | undefined {
		return this.tryGetRuleContext(0, TupleAssignmentContext);
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
	public consoleStatement(): ConsoleStatementContext | undefined {
		return this.tryGetRuleContext(0, ConsoleStatementContext);
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
	public modifier(): ModifierContext[];
	public modifier(i: number): ModifierContext;
	public modifier(i?: number): ModifierContext | ModifierContext[] {
		if (i === undefined) {
			return this.getRuleContexts(ModifierContext);
		} else {
			return this.getRuleContext(i, ModifierContext);
		}
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


export class TupleAssignmentContext extends ParserRuleContext {
	public typeName(): TypeNameContext[];
	public typeName(i: number): TypeNameContext;
	public typeName(i?: number): TypeNameContext | TypeNameContext[] {
		if (i === undefined) {
			return this.getRuleContexts(TypeNameContext);
		} else {
			return this.getRuleContext(i, TypeNameContext);
		}
	}
	public Identifier(): TerminalNode[];
	public Identifier(i: number): TerminalNode;
	public Identifier(i?: number): TerminalNode | TerminalNode[] {
		if (i === undefined) {
			return this.getTokens(CashScriptParser.Identifier);
		} else {
			return this.getToken(CashScriptParser.Identifier, i);
		}
	}
	public expression(): ExpressionContext {
		return this.getRuleContext(0, ExpressionContext);
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return CashScriptParser.RULE_tupleAssignment; }
	// @Override
	public accept<Result>(visitor: CashScriptVisitor<Result>): Result {
		if (visitor.visitTupleAssignment) {
			return visitor.visitTupleAssignment(this);
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


export class TimeOpStatementContext extends ParserRuleContext {
	public TxVar(): TerminalNode { return this.getToken(CashScriptParser.TxVar, 0); }
	public expression(): ExpressionContext {
		return this.getRuleContext(0, ExpressionContext);
	}
	public StringLiteral(): TerminalNode | undefined { return this.tryGetToken(CashScriptParser.StringLiteral, 0); }
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return CashScriptParser.RULE_timeOpStatement; }
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
	public StringLiteral(): TerminalNode | undefined { return this.tryGetToken(CashScriptParser.StringLiteral, 0); }
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return CashScriptParser.RULE_requireStatement; }
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
	public _ifBlock!: BlockContext;
	public _elseBlock!: BlockContext;
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


export class ConsoleStatementContext extends ParserRuleContext {
	public consoleParameterList(): ConsoleParameterListContext {
		return this.getRuleContext(0, ConsoleParameterListContext);
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return CashScriptParser.RULE_consoleStatement; }
	// @Override
	public accept<Result>(visitor: CashScriptVisitor<Result>): Result {
		if (visitor.visitConsoleStatement) {
			return visitor.visitConsoleStatement(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class ConsoleParameterContext extends ParserRuleContext {
	public Identifier(): TerminalNode | undefined { return this.tryGetToken(CashScriptParser.Identifier, 0); }
	public StringLiteral(): TerminalNode | undefined { return this.tryGetToken(CashScriptParser.StringLiteral, 0); }
	public NumberLiteral(): TerminalNode | undefined { return this.tryGetToken(CashScriptParser.NumberLiteral, 0); }
	public HexLiteral(): TerminalNode | undefined { return this.tryGetToken(CashScriptParser.HexLiteral, 0); }
	public BooleanLiteral(): TerminalNode | undefined { return this.tryGetToken(CashScriptParser.BooleanLiteral, 0); }
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return CashScriptParser.RULE_consoleParameter; }
	// @Override
	public accept<Result>(visitor: CashScriptVisitor<Result>): Result {
		if (visitor.visitConsoleParameter) {
			return visitor.visitConsoleParameter(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class ConsoleParameterListContext extends ParserRuleContext {
	public consoleParameter(): ConsoleParameterContext[];
	public consoleParameter(i: number): ConsoleParameterContext;
	public consoleParameter(i?: number): ConsoleParameterContext | ConsoleParameterContext[] {
		if (i === undefined) {
			return this.getRuleContexts(ConsoleParameterContext);
		} else {
			return this.getRuleContext(i, ConsoleParameterContext);
		}
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return CashScriptParser.RULE_consoleParameterList; }
	// @Override
	public accept<Result>(visitor: CashScriptVisitor<Result>): Result {
		if (visitor.visitConsoleParameterList) {
			return visitor.visitConsoleParameterList(this);
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
	public accept<Result>(visitor: CashScriptVisitor<Result>): Result {
		if (visitor.visitParenthesised) {
			return visitor.visitParenthesised(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class CastContext extends ExpressionContext {
	public _castable!: ExpressionContext;
	public _size!: ExpressionContext;
	public typeName(): TypeNameContext {
		return this.getRuleContext(0, TypeNameContext);
	}
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
	public accept<Result>(visitor: CashScriptVisitor<Result>): Result {
		if (visitor.visitFunctionCallExpression) {
			return visitor.visitFunctionCallExpression(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class InstantiationContext extends ExpressionContext {
	public Identifier(): TerminalNode { return this.getToken(CashScriptParser.Identifier, 0); }
	public expressionList(): ExpressionListContext {
		return this.getRuleContext(0, ExpressionListContext);
	}
	constructor(ctx: ExpressionContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public accept<Result>(visitor: CashScriptVisitor<Result>): Result {
		if (visitor.visitInstantiation) {
			return visitor.visitInstantiation(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class TupleIndexOpContext extends ExpressionContext {
	public _index!: Token;
	public expression(): ExpressionContext {
		return this.getRuleContext(0, ExpressionContext);
	}
	public NumberLiteral(): TerminalNode { return this.getToken(CashScriptParser.NumberLiteral, 0); }
	constructor(ctx: ExpressionContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
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
export class UnaryIntrospectionOpContext extends ExpressionContext {
	public _scope!: Token;
	public _op!: Token;
	public expression(): ExpressionContext {
		return this.getRuleContext(0, ExpressionContext);
	}
	constructor(ctx: ExpressionContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public accept<Result>(visitor: CashScriptVisitor<Result>): Result {
		if (visitor.visitUnaryIntrospectionOp) {
			return visitor.visitUnaryIntrospectionOp(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class UnaryOpContext extends ExpressionContext {
	public _op!: Token;
	public expression(): ExpressionContext {
		return this.getRuleContext(0, ExpressionContext);
	}
	constructor(ctx: ExpressionContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
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
	public _left!: ExpressionContext;
	public _op!: Token;
	public _right!: ExpressionContext;
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
	public accept<Result>(visitor: CashScriptVisitor<Result>): Result {
		if (visitor.visitArray) {
			return visitor.visitArray(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class NullaryOpContext extends ExpressionContext {
	public NullaryOp(): TerminalNode { return this.getToken(CashScriptParser.NullaryOp, 0); }
	constructor(ctx: ExpressionContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public accept<Result>(visitor: CashScriptVisitor<Result>): Result {
		if (visitor.visitNullaryOp) {
			return visitor.visitNullaryOp(this);
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
	public accept<Result>(visitor: CashScriptVisitor<Result>): Result {
		if (visitor.visitLiteralExpression) {
			return visitor.visitLiteralExpression(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class ModifierContext extends ParserRuleContext {
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return CashScriptParser.RULE_modifier; }
	// @Override
	public accept<Result>(visitor: CashScriptVisitor<Result>): Result {
		if (visitor.visitModifier) {
			return visitor.visitModifier(this);
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
	public DateLiteral(): TerminalNode | undefined { return this.tryGetToken(CashScriptParser.DateLiteral, 0); }
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


