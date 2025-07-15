// Generated from src/grammar/CashScript.g4 by ANTLR 4.13.1
// noinspection ES6UnusedImports,JSUnusedGlobalSymbols,JSUnusedLocalSymbols

import {
	ATN,
	ATNDeserializer, DecisionState, DFA, FailedPredicateException,
	RecognitionException, NoViableAltException, BailErrorStrategy,
	Parser, ParserATNSimulator,
	RuleContext, ParserRuleContext, PredictionMode, PredictionContextCache,
	TerminalNode, RuleNode,
	Token, TokenStream,
	Interval, IntervalSet
} from 'antlr4';
import CashScriptVisitor from "./CashScriptVisitor.js";

// for running tests with parameters, TODO: discuss strategy for typed parameters in CI
// eslint-disable-next-line no-unused-vars
type int = number;

export default class CashScriptParser extends Parser {
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
	public static readonly T__57 = 58;
	public static readonly VersionLiteral = 59;
	public static readonly BooleanLiteral = 60;
	public static readonly NumberUnit = 61;
	public static readonly NumberLiteral = 62;
	public static readonly NumberPart = 63;
	public static readonly ExponentPart = 64;
	public static readonly Bytes = 65;
	public static readonly Bound = 66;
	public static readonly StringLiteral = 67;
	public static readonly DateLiteral = 68;
	public static readonly HexLiteral = 69;
	public static readonly TxVar = 70;
	public static readonly NullaryOp = 71;
	public static readonly Identifier = 72;
	public static readonly WHITESPACE = 73;
	public static readonly COMMENT = 74;
	public static readonly LINE_COMMENT = 75;
	public static readonly EOF = Token.EOF;
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
	public static readonly RULE_requireMessage = 19;
	public static readonly RULE_consoleParameter = 20;
	public static readonly RULE_consoleParameterList = 21;
	public static readonly RULE_functionCall = 22;
	public static readonly RULE_expressionList = 23;
	public static readonly RULE_expression = 24;
	public static readonly RULE_modifier = 25;
	public static readonly RULE_literal = 26;
	public static readonly RULE_numberLiteral = 27;
	public static readonly RULE_typeName = 28;
	public static readonly literalNames: (string | null)[] = [ null, "'pragma'", 
                                                            "';'", "'cashscript'", 
                                                            "'^'", "'~'", 
                                                            "'>='", "'>'", 
                                                            "'<'", "'<='", 
                                                            "'='", "'contract'", 
                                                            "'{'", "'}'", 
                                                            "'function'", 
                                                            "'('", "','", 
                                                            "')'", "'require'", 
                                                            "'if'", "'else'", 
                                                            "'console.log'", 
                                                            "'new'", "'['", 
                                                            "']'", "'tx.outputs'", 
                                                            "'.value'", 
                                                            "'.lockingBytecode'", 
                                                            "'.tokenCategory'", 
                                                            "'.nftCommitment'", 
                                                            "'.tokenAmount'", 
                                                            "'tx.inputs'", 
                                                            "'.outpointTransactionHash'", 
                                                            "'.outpointIndex'", 
                                                            "'.unlockingBytecode'", 
                                                            "'.sequenceNumber'", 
                                                            "'.reverse()'", 
                                                            "'.length'", 
                                                            "'.split'", 
                                                            "'.slice'", 
                                                            "'!'", "'-'", 
                                                            "'*'", "'/'", 
                                                            "'%'", "'+'", 
                                                            "'=='", "'!='", 
                                                            "'&'", "'|'", 
                                                            "'&&'", "'||'", 
                                                            "'constant'", 
                                                            "'int'", "'bool'", 
                                                            "'string'", 
                                                            "'pubkey'", 
                                                            "'sig'", "'datasig'" ];
	public static readonly symbolicNames: (string | null)[] = [ null, null, 
                                                             null, null, 
                                                             null, null, 
                                                             null, null, 
                                                             null, null, 
                                                             null, null, 
                                                             null, null, 
                                                             null, null, 
                                                             null, null, 
                                                             null, null, 
                                                             null, null, 
                                                             null, null, 
                                                             null, null, 
                                                             null, null, 
                                                             null, null, 
                                                             null, null, 
                                                             null, null, 
                                                             null, null, 
                                                             null, null, 
                                                             null, null, 
                                                             null, null, 
                                                             null, null, 
                                                             null, null, 
                                                             null, null, 
                                                             null, null, 
                                                             null, null, 
                                                             null, null, 
                                                             null, null, 
                                                             null, null, 
                                                             null, "VersionLiteral", 
                                                             "BooleanLiteral", 
                                                             "NumberUnit", 
                                                             "NumberLiteral", 
                                                             "NumberPart", 
                                                             "ExponentPart", 
                                                             "Bytes", "Bound", 
                                                             "StringLiteral", 
                                                             "DateLiteral", 
                                                             "HexLiteral", 
                                                             "TxVar", "NullaryOp", 
                                                             "Identifier", 
                                                             "WHITESPACE", 
                                                             "COMMENT", 
                                                             "LINE_COMMENT" ];
	// tslint:disable:no-trailing-whitespace
	public static readonly ruleNames: string[] = [
		"sourceFile", "pragmaDirective", "pragmaName", "pragmaValue", "versionConstraint", 
		"versionOperator", "contractDefinition", "functionDefinition", "parameterList", 
		"parameter", "block", "statement", "variableDefinition", "tupleAssignment", 
		"assignStatement", "timeOpStatement", "requireStatement", "ifStatement", 
		"consoleStatement", "requireMessage", "consoleParameter", "consoleParameterList", 
		"functionCall", "expressionList", "expression", "modifier", "literal", 
		"numberLiteral", "typeName",
	];
	public get grammarFileName(): string { return "CashScript.g4"; }
	public get literalNames(): (string | null)[] { return CashScriptParser.literalNames; }
	public get symbolicNames(): (string | null)[] { return CashScriptParser.symbolicNames; }
	public get ruleNames(): string[] { return CashScriptParser.ruleNames; }
	public get serializedATN(): number[] { return CashScriptParser._serializedATN; }

	protected createFailedPredicateException(predicate?: string, message?: string): FailedPredicateException {
		return new FailedPredicateException(this, predicate, message);
	}

	constructor(input: TokenStream) {
		super(input);
		this._interp = new ParserATNSimulator(this, CashScriptParser._ATN, CashScriptParser.DecisionsToDFA, new PredictionContextCache());
	}
	// @RuleVersion(0)
	public sourceFile(): SourceFileContext {
		let localctx: SourceFileContext = new SourceFileContext(this, this._ctx, this.state);
		this.enterRule(localctx, 0, CashScriptParser.RULE_sourceFile);
		let _la: number;
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 61;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while (_la===1) {
				{
				{
				this.state = 58;
				this.pragmaDirective();
				}
				}
				this.state = 63;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			}
			this.state = 64;
			this.contractDefinition();
			this.state = 65;
			this.match(CashScriptParser.EOF);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public pragmaDirective(): PragmaDirectiveContext {
		let localctx: PragmaDirectiveContext = new PragmaDirectiveContext(this, this._ctx, this.state);
		this.enterRule(localctx, 2, CashScriptParser.RULE_pragmaDirective);
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 67;
			this.match(CashScriptParser.T__0);
			this.state = 68;
			this.pragmaName();
			this.state = 69;
			this.pragmaValue();
			this.state = 70;
			this.match(CashScriptParser.T__1);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public pragmaName(): PragmaNameContext {
		let localctx: PragmaNameContext = new PragmaNameContext(this, this._ctx, this.state);
		this.enterRule(localctx, 4, CashScriptParser.RULE_pragmaName);
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 72;
			this.match(CashScriptParser.T__2);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public pragmaValue(): PragmaValueContext {
		let localctx: PragmaValueContext = new PragmaValueContext(this, this._ctx, this.state);
		this.enterRule(localctx, 6, CashScriptParser.RULE_pragmaValue);
		let _la: number;
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 74;
			this.versionConstraint();
			this.state = 76;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if ((((_la) & ~0x1F) === 0 && ((1 << _la) & 2032) !== 0) || _la===59) {
				{
				this.state = 75;
				this.versionConstraint();
				}
			}

			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public versionConstraint(): VersionConstraintContext {
		let localctx: VersionConstraintContext = new VersionConstraintContext(this, this._ctx, this.state);
		this.enterRule(localctx, 8, CashScriptParser.RULE_versionConstraint);
		let _la: number;
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 79;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if ((((_la) & ~0x1F) === 0 && ((1 << _la) & 2032) !== 0)) {
				{
				this.state = 78;
				this.versionOperator();
				}
			}

			this.state = 81;
			this.match(CashScriptParser.VersionLiteral);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public versionOperator(): VersionOperatorContext {
		let localctx: VersionOperatorContext = new VersionOperatorContext(this, this._ctx, this.state);
		this.enterRule(localctx, 10, CashScriptParser.RULE_versionOperator);
		let _la: number;
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 83;
			_la = this._input.LA(1);
			if(!((((_la) & ~0x1F) === 0 && ((1 << _la) & 2032) !== 0))) {
			this._errHandler.recoverInline(this);
			}
			else {
				this._errHandler.reportMatch(this);
			    this.consume();
			}
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public contractDefinition(): ContractDefinitionContext {
		let localctx: ContractDefinitionContext = new ContractDefinitionContext(this, this._ctx, this.state);
		this.enterRule(localctx, 12, CashScriptParser.RULE_contractDefinition);
		let _la: number;
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 85;
			this.match(CashScriptParser.T__10);
			this.state = 86;
			this.match(CashScriptParser.Identifier);
			this.state = 87;
			this.parameterList();
			this.state = 88;
			this.match(CashScriptParser.T__11);
			this.state = 92;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while (_la===14) {
				{
				{
				this.state = 89;
				this.functionDefinition();
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
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public functionDefinition(): FunctionDefinitionContext {
		let localctx: FunctionDefinitionContext = new FunctionDefinitionContext(this, this._ctx, this.state);
		this.enterRule(localctx, 14, CashScriptParser.RULE_functionDefinition);
		let _la: number;
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 97;
			this.match(CashScriptParser.T__13);
			this.state = 98;
			this.match(CashScriptParser.Identifier);
			this.state = 99;
			this.parameterList();
			this.state = 100;
			this.match(CashScriptParser.T__11);
			this.state = 104;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while ((((_la) & ~0x1F) === 0 && ((1 << _la) & 2883584) !== 0) || ((((_la - 53)) & ~0x1F) === 0 && ((1 << (_la - 53)) & 528447) !== 0)) {
				{
				{
				this.state = 101;
				this.statement();
				}
				}
				this.state = 106;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			}
			this.state = 107;
			this.match(CashScriptParser.T__12);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public parameterList(): ParameterListContext {
		let localctx: ParameterListContext = new ParameterListContext(this, this._ctx, this.state);
		this.enterRule(localctx, 16, CashScriptParser.RULE_parameterList);
		let _la: number;
		try {
			let _alt: number;
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 109;
			this.match(CashScriptParser.T__14);
			this.state = 121;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (((((_la - 53)) & ~0x1F) === 0 && ((1 << (_la - 53)) & 4159) !== 0)) {
				{
				this.state = 110;
				this.parameter();
				this.state = 115;
				this._errHandler.sync(this);
				_alt = this._interp.adaptivePredict(this._input, 5, this._ctx);
				while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
					if (_alt === 1) {
						{
						{
						this.state = 111;
						this.match(CashScriptParser.T__15);
						this.state = 112;
						this.parameter();
						}
						}
					}
					this.state = 117;
					this._errHandler.sync(this);
					_alt = this._interp.adaptivePredict(this._input, 5, this._ctx);
				}
				this.state = 119;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la===16) {
					{
					this.state = 118;
					this.match(CashScriptParser.T__15);
					}
				}

				}
			}

			this.state = 123;
			this.match(CashScriptParser.T__16);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public parameter(): ParameterContext {
		let localctx: ParameterContext = new ParameterContext(this, this._ctx, this.state);
		this.enterRule(localctx, 18, CashScriptParser.RULE_parameter);
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 125;
			this.typeName();
			this.state = 126;
			this.match(CashScriptParser.Identifier);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public block(): BlockContext {
		let localctx: BlockContext = new BlockContext(this, this._ctx, this.state);
		this.enterRule(localctx, 20, CashScriptParser.RULE_block);
		let _la: number;
		try {
			this.state = 137;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case 12:
				this.enterOuterAlt(localctx, 1);
				{
				this.state = 128;
				this.match(CashScriptParser.T__11);
				this.state = 132;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				while ((((_la) & ~0x1F) === 0 && ((1 << _la) & 2883584) !== 0) || ((((_la - 53)) & ~0x1F) === 0 && ((1 << (_la - 53)) & 528447) !== 0)) {
					{
					{
					this.state = 129;
					this.statement();
					}
					}
					this.state = 134;
					this._errHandler.sync(this);
					_la = this._input.LA(1);
				}
				this.state = 135;
				this.match(CashScriptParser.T__12);
				}
				break;
			case 18:
			case 19:
			case 21:
			case 53:
			case 54:
			case 55:
			case 56:
			case 57:
			case 58:
			case 65:
			case 72:
				this.enterOuterAlt(localctx, 2);
				{
				this.state = 136;
				this.statement();
				}
				break;
			default:
				throw new NoViableAltException(this);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public statement(): StatementContext {
		let localctx: StatementContext = new StatementContext(this, this._ctx, this.state);
		this.enterRule(localctx, 22, CashScriptParser.RULE_statement);
		try {
			this.state = 146;
			this._errHandler.sync(this);
			switch ( this._interp.adaptivePredict(this._input, 10, this._ctx) ) {
			case 1:
				this.enterOuterAlt(localctx, 1);
				{
				this.state = 139;
				this.variableDefinition();
				}
				break;
			case 2:
				this.enterOuterAlt(localctx, 2);
				{
				this.state = 140;
				this.tupleAssignment();
				}
				break;
			case 3:
				this.enterOuterAlt(localctx, 3);
				{
				this.state = 141;
				this.assignStatement();
				}
				break;
			case 4:
				this.enterOuterAlt(localctx, 4);
				{
				this.state = 142;
				this.timeOpStatement();
				}
				break;
			case 5:
				this.enterOuterAlt(localctx, 5);
				{
				this.state = 143;
				this.requireStatement();
				}
				break;
			case 6:
				this.enterOuterAlt(localctx, 6);
				{
				this.state = 144;
				this.ifStatement();
				}
				break;
			case 7:
				this.enterOuterAlt(localctx, 7);
				{
				this.state = 145;
				this.consoleStatement();
				}
				break;
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public variableDefinition(): VariableDefinitionContext {
		let localctx: VariableDefinitionContext = new VariableDefinitionContext(this, this._ctx, this.state);
		this.enterRule(localctx, 24, CashScriptParser.RULE_variableDefinition);
		let _la: number;
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 148;
			this.typeName();
			this.state = 152;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while (_la===52) {
				{
				{
				this.state = 149;
				this.modifier();
				}
				}
				this.state = 154;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			}
			this.state = 155;
			this.match(CashScriptParser.Identifier);
			this.state = 156;
			this.match(CashScriptParser.T__9);
			this.state = 157;
			this.expression(0);
			this.state = 158;
			this.match(CashScriptParser.T__1);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public tupleAssignment(): TupleAssignmentContext {
		let localctx: TupleAssignmentContext = new TupleAssignmentContext(this, this._ctx, this.state);
		this.enterRule(localctx, 26, CashScriptParser.RULE_tupleAssignment);
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 160;
			this.typeName();
			this.state = 161;
			this.match(CashScriptParser.Identifier);
			this.state = 162;
			this.match(CashScriptParser.T__15);
			this.state = 163;
			this.typeName();
			this.state = 164;
			this.match(CashScriptParser.Identifier);
			this.state = 165;
			this.match(CashScriptParser.T__9);
			this.state = 166;
			this.expression(0);
			this.state = 167;
			this.match(CashScriptParser.T__1);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public assignStatement(): AssignStatementContext {
		let localctx: AssignStatementContext = new AssignStatementContext(this, this._ctx, this.state);
		this.enterRule(localctx, 28, CashScriptParser.RULE_assignStatement);
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 169;
			this.match(CashScriptParser.Identifier);
			this.state = 170;
			this.match(CashScriptParser.T__9);
			this.state = 171;
			this.expression(0);
			this.state = 172;
			this.match(CashScriptParser.T__1);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public timeOpStatement(): TimeOpStatementContext {
		let localctx: TimeOpStatementContext = new TimeOpStatementContext(this, this._ctx, this.state);
		this.enterRule(localctx, 30, CashScriptParser.RULE_timeOpStatement);
		let _la: number;
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 174;
			this.match(CashScriptParser.T__17);
			this.state = 175;
			this.match(CashScriptParser.T__14);
			this.state = 176;
			this.match(CashScriptParser.TxVar);
			this.state = 177;
			this.match(CashScriptParser.T__5);
			this.state = 178;
			this.expression(0);
			this.state = 181;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la===16) {
				{
				this.state = 179;
				this.match(CashScriptParser.T__15);
				this.state = 180;
				this.requireMessage();
				}
			}

			this.state = 183;
			this.match(CashScriptParser.T__16);
			this.state = 184;
			this.match(CashScriptParser.T__1);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public requireStatement(): RequireStatementContext {
		let localctx: RequireStatementContext = new RequireStatementContext(this, this._ctx, this.state);
		this.enterRule(localctx, 32, CashScriptParser.RULE_requireStatement);
		let _la: number;
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 186;
			this.match(CashScriptParser.T__17);
			this.state = 187;
			this.match(CashScriptParser.T__14);
			this.state = 188;
			this.expression(0);
			this.state = 191;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la===16) {
				{
				this.state = 189;
				this.match(CashScriptParser.T__15);
				this.state = 190;
				this.requireMessage();
				}
			}

			this.state = 193;
			this.match(CashScriptParser.T__16);
			this.state = 194;
			this.match(CashScriptParser.T__1);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public ifStatement(): IfStatementContext {
		let localctx: IfStatementContext = new IfStatementContext(this, this._ctx, this.state);
		this.enterRule(localctx, 34, CashScriptParser.RULE_ifStatement);
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 196;
			this.match(CashScriptParser.T__18);
			this.state = 197;
			this.match(CashScriptParser.T__14);
			this.state = 198;
			this.expression(0);
			this.state = 199;
			this.match(CashScriptParser.T__16);
			this.state = 200;
			localctx._ifBlock = this.block();
			this.state = 203;
			this._errHandler.sync(this);
			switch ( this._interp.adaptivePredict(this._input, 14, this._ctx) ) {
			case 1:
				{
				this.state = 201;
				this.match(CashScriptParser.T__19);
				this.state = 202;
				localctx._elseBlock = this.block();
				}
				break;
			}
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public consoleStatement(): ConsoleStatementContext {
		let localctx: ConsoleStatementContext = new ConsoleStatementContext(this, this._ctx, this.state);
		this.enterRule(localctx, 36, CashScriptParser.RULE_consoleStatement);
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 205;
			this.match(CashScriptParser.T__20);
			this.state = 206;
			this.consoleParameterList();
			this.state = 207;
			this.match(CashScriptParser.T__1);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public requireMessage(): RequireMessageContext {
		let localctx: RequireMessageContext = new RequireMessageContext(this, this._ctx, this.state);
		this.enterRule(localctx, 38, CashScriptParser.RULE_requireMessage);
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 209;
			this.match(CashScriptParser.StringLiteral);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public consoleParameter(): ConsoleParameterContext {
		let localctx: ConsoleParameterContext = new ConsoleParameterContext(this, this._ctx, this.state);
		this.enterRule(localctx, 40, CashScriptParser.RULE_consoleParameter);
		try {
			this.state = 213;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case 72:
				this.enterOuterAlt(localctx, 1);
				{
				this.state = 211;
				this.match(CashScriptParser.Identifier);
				}
				break;
			case 60:
			case 62:
			case 67:
			case 68:
			case 69:
				this.enterOuterAlt(localctx, 2);
				{
				this.state = 212;
				this.literal();
				}
				break;
			default:
				throw new NoViableAltException(this);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public consoleParameterList(): ConsoleParameterListContext {
		let localctx: ConsoleParameterListContext = new ConsoleParameterListContext(this, this._ctx, this.state);
		this.enterRule(localctx, 42, CashScriptParser.RULE_consoleParameterList);
		let _la: number;
		try {
			let _alt: number;
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 215;
			this.match(CashScriptParser.T__14);
			this.state = 227;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (((((_la - 60)) & ~0x1F) === 0 && ((1 << (_la - 60)) & 4997) !== 0)) {
				{
				this.state = 216;
				this.consoleParameter();
				this.state = 221;
				this._errHandler.sync(this);
				_alt = this._interp.adaptivePredict(this._input, 16, this._ctx);
				while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
					if (_alt === 1) {
						{
						{
						this.state = 217;
						this.match(CashScriptParser.T__15);
						this.state = 218;
						this.consoleParameter();
						}
						}
					}
					this.state = 223;
					this._errHandler.sync(this);
					_alt = this._interp.adaptivePredict(this._input, 16, this._ctx);
				}
				this.state = 225;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la===16) {
					{
					this.state = 224;
					this.match(CashScriptParser.T__15);
					}
				}

				}
			}

			this.state = 229;
			this.match(CashScriptParser.T__16);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public functionCall(): FunctionCallContext {
		let localctx: FunctionCallContext = new FunctionCallContext(this, this._ctx, this.state);
		this.enterRule(localctx, 44, CashScriptParser.RULE_functionCall);
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 231;
			this.match(CashScriptParser.Identifier);
			this.state = 232;
			this.expressionList();
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public expressionList(): ExpressionListContext {
		let localctx: ExpressionListContext = new ExpressionListContext(this, this._ctx, this.state);
		this.enterRule(localctx, 46, CashScriptParser.RULE_expressionList);
		let _la: number;
		try {
			let _alt: number;
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 234;
			this.match(CashScriptParser.T__14);
			this.state = 246;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (((((_la - 15)) & ~0x1F) === 0 && ((1 << (_la - 15)) & 100730241) !== 0) || ((((_la - 53)) & ~0x1F) === 0 && ((1 << (_la - 53)) & 905919) !== 0)) {
				{
				this.state = 235;
				this.expression(0);
				this.state = 240;
				this._errHandler.sync(this);
				_alt = this._interp.adaptivePredict(this._input, 19, this._ctx);
				while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
					if (_alt === 1) {
						{
						{
						this.state = 236;
						this.match(CashScriptParser.T__15);
						this.state = 237;
						this.expression(0);
						}
						}
					}
					this.state = 242;
					this._errHandler.sync(this);
					_alt = this._interp.adaptivePredict(this._input, 19, this._ctx);
				}
				this.state = 244;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la===16) {
					{
					this.state = 243;
					this.match(CashScriptParser.T__15);
					}
				}

				}
			}

			this.state = 248;
			this.match(CashScriptParser.T__16);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
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
		let localctx: ExpressionContext = new ExpressionContext(this, this._ctx, _parentState);
		let _prevctx: ExpressionContext = localctx;
		let _startState: number = 48;
		this.enterRecursionRule(localctx, 48, CashScriptParser.RULE_expression, _p);
		let _la: number;
		try {
			let _alt: number;
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 303;
			this._errHandler.sync(this);
			switch ( this._interp.adaptivePredict(this._input, 27, this._ctx) ) {
			case 1:
				{
				localctx = new ParenthesisedContext(this, localctx);
				this._ctx = localctx;
				_prevctx = localctx;

				this.state = 251;
				this.match(CashScriptParser.T__14);
				this.state = 252;
				this.expression(0);
				this.state = 253;
				this.match(CashScriptParser.T__16);
				}
				break;
			case 2:
				{
				localctx = new CastContext(this, localctx);
				this._ctx = localctx;
				_prevctx = localctx;
				this.state = 255;
				this.typeName();
				this.state = 256;
				this.match(CashScriptParser.T__14);
				this.state = 257;
				(localctx as CastContext)._castable = this.expression(0);
				this.state = 260;
				this._errHandler.sync(this);
				switch ( this._interp.adaptivePredict(this._input, 22, this._ctx) ) {
				case 1:
					{
					this.state = 258;
					this.match(CashScriptParser.T__15);
					this.state = 259;
					(localctx as CastContext)._size = this.expression(0);
					}
					break;
				}
				this.state = 263;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la===16) {
					{
					this.state = 262;
					this.match(CashScriptParser.T__15);
					}
				}

				this.state = 265;
				this.match(CashScriptParser.T__16);
				}
				break;
			case 3:
				{
				localctx = new FunctionCallExpressionContext(this, localctx);
				this._ctx = localctx;
				_prevctx = localctx;
				this.state = 267;
				this.functionCall();
				}
				break;
			case 4:
				{
				localctx = new InstantiationContext(this, localctx);
				this._ctx = localctx;
				_prevctx = localctx;
				this.state = 268;
				this.match(CashScriptParser.T__21);
				this.state = 269;
				this.match(CashScriptParser.Identifier);
				this.state = 270;
				this.expressionList();
				}
				break;
			case 5:
				{
				localctx = new UnaryIntrospectionOpContext(this, localctx);
				this._ctx = localctx;
				_prevctx = localctx;
				this.state = 271;
				(localctx as UnaryIntrospectionOpContext)._scope = this.match(CashScriptParser.T__24);
				this.state = 272;
				this.match(CashScriptParser.T__22);
				this.state = 273;
				this.expression(0);
				this.state = 274;
				this.match(CashScriptParser.T__23);
				this.state = 275;
				(localctx as UnaryIntrospectionOpContext)._op = this._input.LT(1);
				_la = this._input.LA(1);
				if(!((((_la) & ~0x1F) === 0 && ((1 << _la) & 2080374784) !== 0))) {
				    (localctx as UnaryIntrospectionOpContext)._op = this._errHandler.recoverInline(this);
				}
				else {
					this._errHandler.reportMatch(this);
				    this.consume();
				}
				}
				break;
			case 6:
				{
				localctx = new UnaryIntrospectionOpContext(this, localctx);
				this._ctx = localctx;
				_prevctx = localctx;
				this.state = 277;
				(localctx as UnaryIntrospectionOpContext)._scope = this.match(CashScriptParser.T__30);
				this.state = 278;
				this.match(CashScriptParser.T__22);
				this.state = 279;
				this.expression(0);
				this.state = 280;
				this.match(CashScriptParser.T__23);
				this.state = 281;
				(localctx as UnaryIntrospectionOpContext)._op = this._input.LT(1);
				_la = this._input.LA(1);
				if(!(((((_la - 26)) & ~0x1F) === 0 && ((1 << (_la - 26)) & 991) !== 0))) {
				    (localctx as UnaryIntrospectionOpContext)._op = this._errHandler.recoverInline(this);
				}
				else {
					this._errHandler.reportMatch(this);
				    this.consume();
				}
				}
				break;
			case 7:
				{
				localctx = new UnaryOpContext(this, localctx);
				this._ctx = localctx;
				_prevctx = localctx;
				this.state = 283;
				(localctx as UnaryOpContext)._op = this._input.LT(1);
				_la = this._input.LA(1);
				if(!(_la===40 || _la===41)) {
				    (localctx as UnaryOpContext)._op = this._errHandler.recoverInline(this);
				}
				else {
					this._errHandler.reportMatch(this);
				    this.consume();
				}
				this.state = 284;
				this.expression(14);
				}
				break;
			case 8:
				{
				localctx = new ArrayContext(this, localctx);
				this._ctx = localctx;
				_prevctx = localctx;
				this.state = 285;
				this.match(CashScriptParser.T__22);
				this.state = 297;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (((((_la - 15)) & ~0x1F) === 0 && ((1 << (_la - 15)) & 100730241) !== 0) || ((((_la - 53)) & ~0x1F) === 0 && ((1 << (_la - 53)) & 905919) !== 0)) {
					{
					this.state = 286;
					this.expression(0);
					this.state = 291;
					this._errHandler.sync(this);
					_alt = this._interp.adaptivePredict(this._input, 24, this._ctx);
					while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
						if (_alt === 1) {
							{
							{
							this.state = 287;
							this.match(CashScriptParser.T__15);
							this.state = 288;
							this.expression(0);
							}
							}
						}
						this.state = 293;
						this._errHandler.sync(this);
						_alt = this._interp.adaptivePredict(this._input, 24, this._ctx);
					}
					this.state = 295;
					this._errHandler.sync(this);
					_la = this._input.LA(1);
					if (_la===16) {
						{
						this.state = 294;
						this.match(CashScriptParser.T__15);
						}
					}

					}
				}

				this.state = 299;
				this.match(CashScriptParser.T__23);
				}
				break;
			case 9:
				{
				localctx = new NullaryOpContext(this, localctx);
				this._ctx = localctx;
				_prevctx = localctx;
				this.state = 300;
				this.match(CashScriptParser.NullaryOp);
				}
				break;
			case 10:
				{
				localctx = new IdentifierContext(this, localctx);
				this._ctx = localctx;
				_prevctx = localctx;
				this.state = 301;
				this.match(CashScriptParser.Identifier);
				}
				break;
			case 11:
				{
				localctx = new LiteralExpressionContext(this, localctx);
				this._ctx = localctx;
				_prevctx = localctx;
				this.state = 302;
				this.literal();
				}
				break;
			}
			this._ctx.stop = this._input.LT(-1);
			this.state = 354;
			this._errHandler.sync(this);
			_alt = this._interp.adaptivePredict(this._input, 29, this._ctx);
			while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
				if (_alt === 1) {
					if (this._parseListeners != null) {
						this.triggerExitRuleEvent();
					}
					_prevctx = localctx;
					{
					this.state = 352;
					this._errHandler.sync(this);
					switch ( this._interp.adaptivePredict(this._input, 28, this._ctx) ) {
					case 1:
						{
						localctx = new BinaryOpContext(this, new ExpressionContext(this, _parentctx, _parentState));
						(localctx as BinaryOpContext)._left = _prevctx;
						this.pushNewRecursionContext(localctx, _startState, CashScriptParser.RULE_expression);
						this.state = 305;
						if (!(this.precpred(this._ctx, 13))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 13)");
						}
						this.state = 306;
						(localctx as BinaryOpContext)._op = this._input.LT(1);
						_la = this._input.LA(1);
						if(!(((((_la - 42)) & ~0x1F) === 0 && ((1 << (_la - 42)) & 7) !== 0))) {
						    (localctx as BinaryOpContext)._op = this._errHandler.recoverInline(this);
						}
						else {
							this._errHandler.reportMatch(this);
						    this.consume();
						}
						this.state = 307;
						(localctx as BinaryOpContext)._right = this.expression(14);
						}
						break;
					case 2:
						{
						localctx = new BinaryOpContext(this, new ExpressionContext(this, _parentctx, _parentState));
						(localctx as BinaryOpContext)._left = _prevctx;
						this.pushNewRecursionContext(localctx, _startState, CashScriptParser.RULE_expression);
						this.state = 308;
						if (!(this.precpred(this._ctx, 12))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 12)");
						}
						this.state = 309;
						(localctx as BinaryOpContext)._op = this._input.LT(1);
						_la = this._input.LA(1);
						if(!(_la===41 || _la===45)) {
						    (localctx as BinaryOpContext)._op = this._errHandler.recoverInline(this);
						}
						else {
							this._errHandler.reportMatch(this);
						    this.consume();
						}
						this.state = 310;
						(localctx as BinaryOpContext)._right = this.expression(13);
						}
						break;
					case 3:
						{
						localctx = new BinaryOpContext(this, new ExpressionContext(this, _parentctx, _parentState));
						(localctx as BinaryOpContext)._left = _prevctx;
						this.pushNewRecursionContext(localctx, _startState, CashScriptParser.RULE_expression);
						this.state = 311;
						if (!(this.precpred(this._ctx, 11))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 11)");
						}
						this.state = 312;
						(localctx as BinaryOpContext)._op = this._input.LT(1);
						_la = this._input.LA(1);
						if(!((((_la) & ~0x1F) === 0 && ((1 << _la) & 960) !== 0))) {
						    (localctx as BinaryOpContext)._op = this._errHandler.recoverInline(this);
						}
						else {
							this._errHandler.reportMatch(this);
						    this.consume();
						}
						this.state = 313;
						(localctx as BinaryOpContext)._right = this.expression(12);
						}
						break;
					case 4:
						{
						localctx = new BinaryOpContext(this, new ExpressionContext(this, _parentctx, _parentState));
						(localctx as BinaryOpContext)._left = _prevctx;
						this.pushNewRecursionContext(localctx, _startState, CashScriptParser.RULE_expression);
						this.state = 314;
						if (!(this.precpred(this._ctx, 10))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 10)");
						}
						this.state = 315;
						(localctx as BinaryOpContext)._op = this._input.LT(1);
						_la = this._input.LA(1);
						if(!(_la===46 || _la===47)) {
						    (localctx as BinaryOpContext)._op = this._errHandler.recoverInline(this);
						}
						else {
							this._errHandler.reportMatch(this);
						    this.consume();
						}
						this.state = 316;
						(localctx as BinaryOpContext)._right = this.expression(11);
						}
						break;
					case 5:
						{
						localctx = new BinaryOpContext(this, new ExpressionContext(this, _parentctx, _parentState));
						(localctx as BinaryOpContext)._left = _prevctx;
						this.pushNewRecursionContext(localctx, _startState, CashScriptParser.RULE_expression);
						this.state = 317;
						if (!(this.precpred(this._ctx, 9))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 9)");
						}
						this.state = 318;
						(localctx as BinaryOpContext)._op = this.match(CashScriptParser.T__47);
						this.state = 319;
						(localctx as BinaryOpContext)._right = this.expression(10);
						}
						break;
					case 6:
						{
						localctx = new BinaryOpContext(this, new ExpressionContext(this, _parentctx, _parentState));
						(localctx as BinaryOpContext)._left = _prevctx;
						this.pushNewRecursionContext(localctx, _startState, CashScriptParser.RULE_expression);
						this.state = 320;
						if (!(this.precpred(this._ctx, 8))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 8)");
						}
						this.state = 321;
						(localctx as BinaryOpContext)._op = this.match(CashScriptParser.T__3);
						this.state = 322;
						(localctx as BinaryOpContext)._right = this.expression(9);
						}
						break;
					case 7:
						{
						localctx = new BinaryOpContext(this, new ExpressionContext(this, _parentctx, _parentState));
						(localctx as BinaryOpContext)._left = _prevctx;
						this.pushNewRecursionContext(localctx, _startState, CashScriptParser.RULE_expression);
						this.state = 323;
						if (!(this.precpred(this._ctx, 7))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 7)");
						}
						this.state = 324;
						(localctx as BinaryOpContext)._op = this.match(CashScriptParser.T__48);
						this.state = 325;
						(localctx as BinaryOpContext)._right = this.expression(8);
						}
						break;
					case 8:
						{
						localctx = new BinaryOpContext(this, new ExpressionContext(this, _parentctx, _parentState));
						(localctx as BinaryOpContext)._left = _prevctx;
						this.pushNewRecursionContext(localctx, _startState, CashScriptParser.RULE_expression);
						this.state = 326;
						if (!(this.precpred(this._ctx, 6))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 6)");
						}
						this.state = 327;
						(localctx as BinaryOpContext)._op = this.match(CashScriptParser.T__49);
						this.state = 328;
						(localctx as BinaryOpContext)._right = this.expression(7);
						}
						break;
					case 9:
						{
						localctx = new BinaryOpContext(this, new ExpressionContext(this, _parentctx, _parentState));
						(localctx as BinaryOpContext)._left = _prevctx;
						this.pushNewRecursionContext(localctx, _startState, CashScriptParser.RULE_expression);
						this.state = 329;
						if (!(this.precpred(this._ctx, 5))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 5)");
						}
						this.state = 330;
						(localctx as BinaryOpContext)._op = this.match(CashScriptParser.T__50);
						this.state = 331;
						(localctx as BinaryOpContext)._right = this.expression(6);
						}
						break;
					case 10:
						{
						localctx = new TupleIndexOpContext(this, new ExpressionContext(this, _parentctx, _parentState));
						this.pushNewRecursionContext(localctx, _startState, CashScriptParser.RULE_expression);
						this.state = 332;
						if (!(this.precpred(this._ctx, 20))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 20)");
						}
						this.state = 333;
						this.match(CashScriptParser.T__22);
						this.state = 334;
						(localctx as TupleIndexOpContext)._index = this.match(CashScriptParser.NumberLiteral);
						this.state = 335;
						this.match(CashScriptParser.T__23);
						}
						break;
					case 11:
						{
						localctx = new UnaryOpContext(this, new ExpressionContext(this, _parentctx, _parentState));
						this.pushNewRecursionContext(localctx, _startState, CashScriptParser.RULE_expression);
						this.state = 336;
						if (!(this.precpred(this._ctx, 17))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 17)");
						}
						this.state = 337;
						(localctx as UnaryOpContext)._op = this._input.LT(1);
						_la = this._input.LA(1);
						if(!(_la===36 || _la===37)) {
						    (localctx as UnaryOpContext)._op = this._errHandler.recoverInline(this);
						}
						else {
							this._errHandler.reportMatch(this);
						    this.consume();
						}
						}
						break;
					case 12:
						{
						localctx = new BinaryOpContext(this, new ExpressionContext(this, _parentctx, _parentState));
						(localctx as BinaryOpContext)._left = _prevctx;
						this.pushNewRecursionContext(localctx, _startState, CashScriptParser.RULE_expression);
						this.state = 338;
						if (!(this.precpred(this._ctx, 16))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 16)");
						}
						this.state = 339;
						(localctx as BinaryOpContext)._op = this.match(CashScriptParser.T__37);
						this.state = 340;
						this.match(CashScriptParser.T__14);
						this.state = 341;
						(localctx as BinaryOpContext)._right = this.expression(0);
						this.state = 342;
						this.match(CashScriptParser.T__16);
						}
						break;
					case 13:
						{
						localctx = new SliceContext(this, new ExpressionContext(this, _parentctx, _parentState));
						(localctx as SliceContext)._element = _prevctx;
						this.pushNewRecursionContext(localctx, _startState, CashScriptParser.RULE_expression);
						this.state = 344;
						if (!(this.precpred(this._ctx, 15))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 15)");
						}
						this.state = 345;
						this.match(CashScriptParser.T__38);
						this.state = 346;
						this.match(CashScriptParser.T__14);
						this.state = 347;
						(localctx as SliceContext)._start = this.expression(0);
						this.state = 348;
						this.match(CashScriptParser.T__15);
						this.state = 349;
						(localctx as SliceContext)._end = this.expression(0);
						this.state = 350;
						this.match(CashScriptParser.T__16);
						}
						break;
					}
					}
				}
				this.state = 356;
				this._errHandler.sync(this);
				_alt = this._interp.adaptivePredict(this._input, 29, this._ctx);
			}
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.unrollRecursionContexts(_parentctx);
		}
		return localctx;
	}
	// @RuleVersion(0)
	public modifier(): ModifierContext {
		let localctx: ModifierContext = new ModifierContext(this, this._ctx, this.state);
		this.enterRule(localctx, 50, CashScriptParser.RULE_modifier);
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 357;
			this.match(CashScriptParser.T__51);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public literal(): LiteralContext {
		let localctx: LiteralContext = new LiteralContext(this, this._ctx, this.state);
		this.enterRule(localctx, 52, CashScriptParser.RULE_literal);
		try {
			this.state = 364;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case 60:
				this.enterOuterAlt(localctx, 1);
				{
				this.state = 359;
				this.match(CashScriptParser.BooleanLiteral);
				}
				break;
			case 62:
				this.enterOuterAlt(localctx, 2);
				{
				this.state = 360;
				this.numberLiteral();
				}
				break;
			case 67:
				this.enterOuterAlt(localctx, 3);
				{
				this.state = 361;
				this.match(CashScriptParser.StringLiteral);
				}
				break;
			case 68:
				this.enterOuterAlt(localctx, 4);
				{
				this.state = 362;
				this.match(CashScriptParser.DateLiteral);
				}
				break;
			case 69:
				this.enterOuterAlt(localctx, 5);
				{
				this.state = 363;
				this.match(CashScriptParser.HexLiteral);
				}
				break;
			default:
				throw new NoViableAltException(this);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public numberLiteral(): NumberLiteralContext {
		let localctx: NumberLiteralContext = new NumberLiteralContext(this, this._ctx, this.state);
		this.enterRule(localctx, 54, CashScriptParser.RULE_numberLiteral);
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 366;
			this.match(CashScriptParser.NumberLiteral);
			this.state = 368;
			this._errHandler.sync(this);
			switch ( this._interp.adaptivePredict(this._input, 31, this._ctx) ) {
			case 1:
				{
				this.state = 367;
				this.match(CashScriptParser.NumberUnit);
				}
				break;
			}
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public typeName(): TypeNameContext {
		let localctx: TypeNameContext = new TypeNameContext(this, this._ctx, this.state);
		this.enterRule(localctx, 56, CashScriptParser.RULE_typeName);
		let _la: number;
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 370;
			_la = this._input.LA(1);
			if(!(((((_la - 53)) & ~0x1F) === 0 && ((1 << (_la - 53)) & 4159) !== 0))) {
			this._errHandler.recoverInline(this);
			}
			else {
				this._errHandler.reportMatch(this);
			    this.consume();
			}
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}

	public sempred(localctx: RuleContext, ruleIndex: number, predIndex: number): boolean {
		switch (ruleIndex) {
		case 24:
			return this.expression_sempred(localctx as ExpressionContext, predIndex);
		}
		return true;
	}
	private expression_sempred(localctx: ExpressionContext, predIndex: number): boolean {
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
			return this.precpred(this._ctx, 20);
		case 10:
			return this.precpred(this._ctx, 17);
		case 11:
			return this.precpred(this._ctx, 16);
		case 12:
			return this.precpred(this._ctx, 15);
		}
		return true;
	}

	public static readonly _serializedATN: number[] = [4,1,75,373,2,0,7,0,2,
	1,7,1,2,2,7,2,2,3,7,3,2,4,7,4,2,5,7,5,2,6,7,6,2,7,7,7,2,8,7,8,2,9,7,9,2,
	10,7,10,2,11,7,11,2,12,7,12,2,13,7,13,2,14,7,14,2,15,7,15,2,16,7,16,2,17,
	7,17,2,18,7,18,2,19,7,19,2,20,7,20,2,21,7,21,2,22,7,22,2,23,7,23,2,24,7,
	24,2,25,7,25,2,26,7,26,2,27,7,27,2,28,7,28,1,0,5,0,60,8,0,10,0,12,0,63,
	9,0,1,0,1,0,1,0,1,1,1,1,1,1,1,1,1,1,1,2,1,2,1,3,1,3,3,3,77,8,3,1,4,3,4,
	80,8,4,1,4,1,4,1,5,1,5,1,6,1,6,1,6,1,6,1,6,5,6,91,8,6,10,6,12,6,94,9,6,
	1,6,1,6,1,7,1,7,1,7,1,7,1,7,5,7,103,8,7,10,7,12,7,106,9,7,1,7,1,7,1,8,1,
	8,1,8,1,8,5,8,114,8,8,10,8,12,8,117,9,8,1,8,3,8,120,8,8,3,8,122,8,8,1,8,
	1,8,1,9,1,9,1,9,1,10,1,10,5,10,131,8,10,10,10,12,10,134,9,10,1,10,1,10,
	3,10,138,8,10,1,11,1,11,1,11,1,11,1,11,1,11,1,11,3,11,147,8,11,1,12,1,12,
	5,12,151,8,12,10,12,12,12,154,9,12,1,12,1,12,1,12,1,12,1,12,1,13,1,13,1,
	13,1,13,1,13,1,13,1,13,1,13,1,13,1,14,1,14,1,14,1,14,1,14,1,15,1,15,1,15,
	1,15,1,15,1,15,1,15,3,15,182,8,15,1,15,1,15,1,15,1,16,1,16,1,16,1,16,1,
	16,3,16,192,8,16,1,16,1,16,1,16,1,17,1,17,1,17,1,17,1,17,1,17,1,17,3,17,
	204,8,17,1,18,1,18,1,18,1,18,1,19,1,19,1,20,1,20,3,20,214,8,20,1,21,1,21,
	1,21,1,21,5,21,220,8,21,10,21,12,21,223,9,21,1,21,3,21,226,8,21,3,21,228,
	8,21,1,21,1,21,1,22,1,22,1,22,1,23,1,23,1,23,1,23,5,23,239,8,23,10,23,12,
	23,242,9,23,1,23,3,23,245,8,23,3,23,247,8,23,1,23,1,23,1,24,1,24,1,24,1,
	24,1,24,1,24,1,24,1,24,1,24,1,24,3,24,261,8,24,1,24,3,24,264,8,24,1,24,
	1,24,1,24,1,24,1,24,1,24,1,24,1,24,1,24,1,24,1,24,1,24,1,24,1,24,1,24,1,
	24,1,24,1,24,1,24,1,24,1,24,1,24,1,24,1,24,5,24,290,8,24,10,24,12,24,293,
	9,24,1,24,3,24,296,8,24,3,24,298,8,24,1,24,1,24,1,24,1,24,3,24,304,8,24,
	1,24,1,24,1,24,1,24,1,24,1,24,1,24,1,24,1,24,1,24,1,24,1,24,1,24,1,24,1,
	24,1,24,1,24,1,24,1,24,1,24,1,24,1,24,1,24,1,24,1,24,1,24,1,24,1,24,1,24,
	1,24,1,24,1,24,1,24,1,24,1,24,1,24,1,24,1,24,1,24,1,24,1,24,1,24,1,24,1,
	24,1,24,1,24,1,24,5,24,353,8,24,10,24,12,24,356,9,24,1,25,1,25,1,26,1,26,
	1,26,1,26,1,26,3,26,365,8,26,1,27,1,27,3,27,369,8,27,1,28,1,28,1,28,0,1,
	48,29,0,2,4,6,8,10,12,14,16,18,20,22,24,26,28,30,32,34,36,38,40,42,44,46,
	48,50,52,54,56,0,10,1,0,4,10,1,0,26,30,2,0,26,30,32,35,1,0,40,41,1,0,42,
	44,2,0,41,41,45,45,1,0,6,9,1,0,46,47,1,0,36,37,2,0,53,58,65,65,403,0,61,
	1,0,0,0,2,67,1,0,0,0,4,72,1,0,0,0,6,74,1,0,0,0,8,79,1,0,0,0,10,83,1,0,0,
	0,12,85,1,0,0,0,14,97,1,0,0,0,16,109,1,0,0,0,18,125,1,0,0,0,20,137,1,0,
	0,0,22,146,1,0,0,0,24,148,1,0,0,0,26,160,1,0,0,0,28,169,1,0,0,0,30,174,
	1,0,0,0,32,186,1,0,0,0,34,196,1,0,0,0,36,205,1,0,0,0,38,209,1,0,0,0,40,
	213,1,0,0,0,42,215,1,0,0,0,44,231,1,0,0,0,46,234,1,0,0,0,48,303,1,0,0,0,
	50,357,1,0,0,0,52,364,1,0,0,0,54,366,1,0,0,0,56,370,1,0,0,0,58,60,3,2,1,
	0,59,58,1,0,0,0,60,63,1,0,0,0,61,59,1,0,0,0,61,62,1,0,0,0,62,64,1,0,0,0,
	63,61,1,0,0,0,64,65,3,12,6,0,65,66,5,0,0,1,66,1,1,0,0,0,67,68,5,1,0,0,68,
	69,3,4,2,0,69,70,3,6,3,0,70,71,5,2,0,0,71,3,1,0,0,0,72,73,5,3,0,0,73,5,
	1,0,0,0,74,76,3,8,4,0,75,77,3,8,4,0,76,75,1,0,0,0,76,77,1,0,0,0,77,7,1,
	0,0,0,78,80,3,10,5,0,79,78,1,0,0,0,79,80,1,0,0,0,80,81,1,0,0,0,81,82,5,
	59,0,0,82,9,1,0,0,0,83,84,7,0,0,0,84,11,1,0,0,0,85,86,5,11,0,0,86,87,5,
	72,0,0,87,88,3,16,8,0,88,92,5,12,0,0,89,91,3,14,7,0,90,89,1,0,0,0,91,94,
	1,0,0,0,92,90,1,0,0,0,92,93,1,0,0,0,93,95,1,0,0,0,94,92,1,0,0,0,95,96,5,
	13,0,0,96,13,1,0,0,0,97,98,5,14,0,0,98,99,5,72,0,0,99,100,3,16,8,0,100,
	104,5,12,0,0,101,103,3,22,11,0,102,101,1,0,0,0,103,106,1,0,0,0,104,102,
	1,0,0,0,104,105,1,0,0,0,105,107,1,0,0,0,106,104,1,0,0,0,107,108,5,13,0,
	0,108,15,1,0,0,0,109,121,5,15,0,0,110,115,3,18,9,0,111,112,5,16,0,0,112,
	114,3,18,9,0,113,111,1,0,0,0,114,117,1,0,0,0,115,113,1,0,0,0,115,116,1,
	0,0,0,116,119,1,0,0,0,117,115,1,0,0,0,118,120,5,16,0,0,119,118,1,0,0,0,
	119,120,1,0,0,0,120,122,1,0,0,0,121,110,1,0,0,0,121,122,1,0,0,0,122,123,
	1,0,0,0,123,124,5,17,0,0,124,17,1,0,0,0,125,126,3,56,28,0,126,127,5,72,
	0,0,127,19,1,0,0,0,128,132,5,12,0,0,129,131,3,22,11,0,130,129,1,0,0,0,131,
	134,1,0,0,0,132,130,1,0,0,0,132,133,1,0,0,0,133,135,1,0,0,0,134,132,1,0,
	0,0,135,138,5,13,0,0,136,138,3,22,11,0,137,128,1,0,0,0,137,136,1,0,0,0,
	138,21,1,0,0,0,139,147,3,24,12,0,140,147,3,26,13,0,141,147,3,28,14,0,142,
	147,3,30,15,0,143,147,3,32,16,0,144,147,3,34,17,0,145,147,3,36,18,0,146,
	139,1,0,0,0,146,140,1,0,0,0,146,141,1,0,0,0,146,142,1,0,0,0,146,143,1,0,
	0,0,146,144,1,0,0,0,146,145,1,0,0,0,147,23,1,0,0,0,148,152,3,56,28,0,149,
	151,3,50,25,0,150,149,1,0,0,0,151,154,1,0,0,0,152,150,1,0,0,0,152,153,1,
	0,0,0,153,155,1,0,0,0,154,152,1,0,0,0,155,156,5,72,0,0,156,157,5,10,0,0,
	157,158,3,48,24,0,158,159,5,2,0,0,159,25,1,0,0,0,160,161,3,56,28,0,161,
	162,5,72,0,0,162,163,5,16,0,0,163,164,3,56,28,0,164,165,5,72,0,0,165,166,
	5,10,0,0,166,167,3,48,24,0,167,168,5,2,0,0,168,27,1,0,0,0,169,170,5,72,
	0,0,170,171,5,10,0,0,171,172,3,48,24,0,172,173,5,2,0,0,173,29,1,0,0,0,174,
	175,5,18,0,0,175,176,5,15,0,0,176,177,5,70,0,0,177,178,5,6,0,0,178,181,
	3,48,24,0,179,180,5,16,0,0,180,182,3,38,19,0,181,179,1,0,0,0,181,182,1,
	0,0,0,182,183,1,0,0,0,183,184,5,17,0,0,184,185,5,2,0,0,185,31,1,0,0,0,186,
	187,5,18,0,0,187,188,5,15,0,0,188,191,3,48,24,0,189,190,5,16,0,0,190,192,
	3,38,19,0,191,189,1,0,0,0,191,192,1,0,0,0,192,193,1,0,0,0,193,194,5,17,
	0,0,194,195,5,2,0,0,195,33,1,0,0,0,196,197,5,19,0,0,197,198,5,15,0,0,198,
	199,3,48,24,0,199,200,5,17,0,0,200,203,3,20,10,0,201,202,5,20,0,0,202,204,
	3,20,10,0,203,201,1,0,0,0,203,204,1,0,0,0,204,35,1,0,0,0,205,206,5,21,0,
	0,206,207,3,42,21,0,207,208,5,2,0,0,208,37,1,0,0,0,209,210,5,67,0,0,210,
	39,1,0,0,0,211,214,5,72,0,0,212,214,3,52,26,0,213,211,1,0,0,0,213,212,1,
	0,0,0,214,41,1,0,0,0,215,227,5,15,0,0,216,221,3,40,20,0,217,218,5,16,0,
	0,218,220,3,40,20,0,219,217,1,0,0,0,220,223,1,0,0,0,221,219,1,0,0,0,221,
	222,1,0,0,0,222,225,1,0,0,0,223,221,1,0,0,0,224,226,5,16,0,0,225,224,1,
	0,0,0,225,226,1,0,0,0,226,228,1,0,0,0,227,216,1,0,0,0,227,228,1,0,0,0,228,
	229,1,0,0,0,229,230,5,17,0,0,230,43,1,0,0,0,231,232,5,72,0,0,232,233,3,
	46,23,0,233,45,1,0,0,0,234,246,5,15,0,0,235,240,3,48,24,0,236,237,5,16,
	0,0,237,239,3,48,24,0,238,236,1,0,0,0,239,242,1,0,0,0,240,238,1,0,0,0,240,
	241,1,0,0,0,241,244,1,0,0,0,242,240,1,0,0,0,243,245,5,16,0,0,244,243,1,
	0,0,0,244,245,1,0,0,0,245,247,1,0,0,0,246,235,1,0,0,0,246,247,1,0,0,0,247,
	248,1,0,0,0,248,249,5,17,0,0,249,47,1,0,0,0,250,251,6,24,-1,0,251,252,5,
	15,0,0,252,253,3,48,24,0,253,254,5,17,0,0,254,304,1,0,0,0,255,256,3,56,
	28,0,256,257,5,15,0,0,257,260,3,48,24,0,258,259,5,16,0,0,259,261,3,48,24,
	0,260,258,1,0,0,0,260,261,1,0,0,0,261,263,1,0,0,0,262,264,5,16,0,0,263,
	262,1,0,0,0,263,264,1,0,0,0,264,265,1,0,0,0,265,266,5,17,0,0,266,304,1,
	0,0,0,267,304,3,44,22,0,268,269,5,22,0,0,269,270,5,72,0,0,270,304,3,46,
	23,0,271,272,5,25,0,0,272,273,5,23,0,0,273,274,3,48,24,0,274,275,5,24,0,
	0,275,276,7,1,0,0,276,304,1,0,0,0,277,278,5,31,0,0,278,279,5,23,0,0,279,
	280,3,48,24,0,280,281,5,24,0,0,281,282,7,2,0,0,282,304,1,0,0,0,283,284,
	7,3,0,0,284,304,3,48,24,14,285,297,5,23,0,0,286,291,3,48,24,0,287,288,5,
	16,0,0,288,290,3,48,24,0,289,287,1,0,0,0,290,293,1,0,0,0,291,289,1,0,0,
	0,291,292,1,0,0,0,292,295,1,0,0,0,293,291,1,0,0,0,294,296,5,16,0,0,295,
	294,1,0,0,0,295,296,1,0,0,0,296,298,1,0,0,0,297,286,1,0,0,0,297,298,1,0,
	0,0,298,299,1,0,0,0,299,304,5,24,0,0,300,304,5,71,0,0,301,304,5,72,0,0,
	302,304,3,52,26,0,303,250,1,0,0,0,303,255,1,0,0,0,303,267,1,0,0,0,303,268,
	1,0,0,0,303,271,1,0,0,0,303,277,1,0,0,0,303,283,1,0,0,0,303,285,1,0,0,0,
	303,300,1,0,0,0,303,301,1,0,0,0,303,302,1,0,0,0,304,354,1,0,0,0,305,306,
	10,13,0,0,306,307,7,4,0,0,307,353,3,48,24,14,308,309,10,12,0,0,309,310,
	7,5,0,0,310,353,3,48,24,13,311,312,10,11,0,0,312,313,7,6,0,0,313,353,3,
	48,24,12,314,315,10,10,0,0,315,316,7,7,0,0,316,353,3,48,24,11,317,318,10,
	9,0,0,318,319,5,48,0,0,319,353,3,48,24,10,320,321,10,8,0,0,321,322,5,4,
	0,0,322,353,3,48,24,9,323,324,10,7,0,0,324,325,5,49,0,0,325,353,3,48,24,
	8,326,327,10,6,0,0,327,328,5,50,0,0,328,353,3,48,24,7,329,330,10,5,0,0,
	330,331,5,51,0,0,331,353,3,48,24,6,332,333,10,20,0,0,333,334,5,23,0,0,334,
	335,5,62,0,0,335,353,5,24,0,0,336,337,10,17,0,0,337,353,7,8,0,0,338,339,
	10,16,0,0,339,340,5,38,0,0,340,341,5,15,0,0,341,342,3,48,24,0,342,343,5,
	17,0,0,343,353,1,0,0,0,344,345,10,15,0,0,345,346,5,39,0,0,346,347,5,15,
	0,0,347,348,3,48,24,0,348,349,5,16,0,0,349,350,3,48,24,0,350,351,5,17,0,
	0,351,353,1,0,0,0,352,305,1,0,0,0,352,308,1,0,0,0,352,311,1,0,0,0,352,314,
	1,0,0,0,352,317,1,0,0,0,352,320,1,0,0,0,352,323,1,0,0,0,352,326,1,0,0,0,
	352,329,1,0,0,0,352,332,1,0,0,0,352,336,1,0,0,0,352,338,1,0,0,0,352,344,
	1,0,0,0,353,356,1,0,0,0,354,352,1,0,0,0,354,355,1,0,0,0,355,49,1,0,0,0,
	356,354,1,0,0,0,357,358,5,52,0,0,358,51,1,0,0,0,359,365,5,60,0,0,360,365,
	3,54,27,0,361,365,5,67,0,0,362,365,5,68,0,0,363,365,5,69,0,0,364,359,1,
	0,0,0,364,360,1,0,0,0,364,361,1,0,0,0,364,362,1,0,0,0,364,363,1,0,0,0,365,
	53,1,0,0,0,366,368,5,62,0,0,367,369,5,61,0,0,368,367,1,0,0,0,368,369,1,
	0,0,0,369,55,1,0,0,0,370,371,7,9,0,0,371,57,1,0,0,0,32,61,76,79,92,104,
	115,119,121,132,137,146,152,181,191,203,213,221,225,227,240,244,246,260,
	263,291,295,297,303,352,354,364,368];

	private static __ATN: ATN;
	public static get _ATN(): ATN {
		if (!CashScriptParser.__ATN) {
			CashScriptParser.__ATN = new ATNDeserializer().deserialize(CashScriptParser._serializedATN);
		}

		return CashScriptParser.__ATN;
	}


	static DecisionsToDFA = CashScriptParser._ATN.decisionToState.map( (ds: DecisionState, index: number) => new DFA(ds, index) );

}

export class SourceFileContext extends ParserRuleContext {
	constructor(parser?: CashScriptParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public contractDefinition(): ContractDefinitionContext {
		return this.getTypedRuleContext(ContractDefinitionContext, 0) as ContractDefinitionContext;
	}
	public EOF(): TerminalNode {
		return this.getToken(CashScriptParser.EOF, 0);
	}
	public pragmaDirective_list(): PragmaDirectiveContext[] {
		return this.getTypedRuleContexts(PragmaDirectiveContext) as PragmaDirectiveContext[];
	}
	public pragmaDirective(i: number): PragmaDirectiveContext {
		return this.getTypedRuleContext(PragmaDirectiveContext, i) as PragmaDirectiveContext;
	}
    public get ruleIndex(): number {
    	return CashScriptParser.RULE_sourceFile;
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
	constructor(parser?: CashScriptParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public pragmaName(): PragmaNameContext {
		return this.getTypedRuleContext(PragmaNameContext, 0) as PragmaNameContext;
	}
	public pragmaValue(): PragmaValueContext {
		return this.getTypedRuleContext(PragmaValueContext, 0) as PragmaValueContext;
	}
    public get ruleIndex(): number {
    	return CashScriptParser.RULE_pragmaDirective;
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
	constructor(parser?: CashScriptParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
    public get ruleIndex(): number {
    	return CashScriptParser.RULE_pragmaName;
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
	constructor(parser?: CashScriptParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public versionConstraint_list(): VersionConstraintContext[] {
		return this.getTypedRuleContexts(VersionConstraintContext) as VersionConstraintContext[];
	}
	public versionConstraint(i: number): VersionConstraintContext {
		return this.getTypedRuleContext(VersionConstraintContext, i) as VersionConstraintContext;
	}
    public get ruleIndex(): number {
    	return CashScriptParser.RULE_pragmaValue;
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
	constructor(parser?: CashScriptParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public VersionLiteral(): TerminalNode {
		return this.getToken(CashScriptParser.VersionLiteral, 0);
	}
	public versionOperator(): VersionOperatorContext {
		return this.getTypedRuleContext(VersionOperatorContext, 0) as VersionOperatorContext;
	}
    public get ruleIndex(): number {
    	return CashScriptParser.RULE_versionConstraint;
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
	constructor(parser?: CashScriptParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
    public get ruleIndex(): number {
    	return CashScriptParser.RULE_versionOperator;
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
	constructor(parser?: CashScriptParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public Identifier(): TerminalNode {
		return this.getToken(CashScriptParser.Identifier, 0);
	}
	public parameterList(): ParameterListContext {
		return this.getTypedRuleContext(ParameterListContext, 0) as ParameterListContext;
	}
	public functionDefinition_list(): FunctionDefinitionContext[] {
		return this.getTypedRuleContexts(FunctionDefinitionContext) as FunctionDefinitionContext[];
	}
	public functionDefinition(i: number): FunctionDefinitionContext {
		return this.getTypedRuleContext(FunctionDefinitionContext, i) as FunctionDefinitionContext;
	}
    public get ruleIndex(): number {
    	return CashScriptParser.RULE_contractDefinition;
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
	constructor(parser?: CashScriptParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public Identifier(): TerminalNode {
		return this.getToken(CashScriptParser.Identifier, 0);
	}
	public parameterList(): ParameterListContext {
		return this.getTypedRuleContext(ParameterListContext, 0) as ParameterListContext;
	}
	public statement_list(): StatementContext[] {
		return this.getTypedRuleContexts(StatementContext) as StatementContext[];
	}
	public statement(i: number): StatementContext {
		return this.getTypedRuleContext(StatementContext, i) as StatementContext;
	}
    public get ruleIndex(): number {
    	return CashScriptParser.RULE_functionDefinition;
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
	constructor(parser?: CashScriptParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public parameter_list(): ParameterContext[] {
		return this.getTypedRuleContexts(ParameterContext) as ParameterContext[];
	}
	public parameter(i: number): ParameterContext {
		return this.getTypedRuleContext(ParameterContext, i) as ParameterContext;
	}
    public get ruleIndex(): number {
    	return CashScriptParser.RULE_parameterList;
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
	constructor(parser?: CashScriptParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public typeName(): TypeNameContext {
		return this.getTypedRuleContext(TypeNameContext, 0) as TypeNameContext;
	}
	public Identifier(): TerminalNode {
		return this.getToken(CashScriptParser.Identifier, 0);
	}
    public get ruleIndex(): number {
    	return CashScriptParser.RULE_parameter;
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
	constructor(parser?: CashScriptParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public statement_list(): StatementContext[] {
		return this.getTypedRuleContexts(StatementContext) as StatementContext[];
	}
	public statement(i: number): StatementContext {
		return this.getTypedRuleContext(StatementContext, i) as StatementContext;
	}
    public get ruleIndex(): number {
    	return CashScriptParser.RULE_block;
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
	constructor(parser?: CashScriptParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public variableDefinition(): VariableDefinitionContext {
		return this.getTypedRuleContext(VariableDefinitionContext, 0) as VariableDefinitionContext;
	}
	public tupleAssignment(): TupleAssignmentContext {
		return this.getTypedRuleContext(TupleAssignmentContext, 0) as TupleAssignmentContext;
	}
	public assignStatement(): AssignStatementContext {
		return this.getTypedRuleContext(AssignStatementContext, 0) as AssignStatementContext;
	}
	public timeOpStatement(): TimeOpStatementContext {
		return this.getTypedRuleContext(TimeOpStatementContext, 0) as TimeOpStatementContext;
	}
	public requireStatement(): RequireStatementContext {
		return this.getTypedRuleContext(RequireStatementContext, 0) as RequireStatementContext;
	}
	public ifStatement(): IfStatementContext {
		return this.getTypedRuleContext(IfStatementContext, 0) as IfStatementContext;
	}
	public consoleStatement(): ConsoleStatementContext {
		return this.getTypedRuleContext(ConsoleStatementContext, 0) as ConsoleStatementContext;
	}
    public get ruleIndex(): number {
    	return CashScriptParser.RULE_statement;
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
	constructor(parser?: CashScriptParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public typeName(): TypeNameContext {
		return this.getTypedRuleContext(TypeNameContext, 0) as TypeNameContext;
	}
	public Identifier(): TerminalNode {
		return this.getToken(CashScriptParser.Identifier, 0);
	}
	public expression(): ExpressionContext {
		return this.getTypedRuleContext(ExpressionContext, 0) as ExpressionContext;
	}
	public modifier_list(): ModifierContext[] {
		return this.getTypedRuleContexts(ModifierContext) as ModifierContext[];
	}
	public modifier(i: number): ModifierContext {
		return this.getTypedRuleContext(ModifierContext, i) as ModifierContext;
	}
    public get ruleIndex(): number {
    	return CashScriptParser.RULE_variableDefinition;
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


export class TupleAssignmentContext extends ParserRuleContext {
	constructor(parser?: CashScriptParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public typeName_list(): TypeNameContext[] {
		return this.getTypedRuleContexts(TypeNameContext) as TypeNameContext[];
	}
	public typeName(i: number): TypeNameContext {
		return this.getTypedRuleContext(TypeNameContext, i) as TypeNameContext;
	}
	public Identifier_list(): TerminalNode[] {
	    	return this.getTokens(CashScriptParser.Identifier);
	}
	public Identifier(i: number): TerminalNode {
		return this.getToken(CashScriptParser.Identifier, i);
	}
	public expression(): ExpressionContext {
		return this.getTypedRuleContext(ExpressionContext, 0) as ExpressionContext;
	}
    public get ruleIndex(): number {
    	return CashScriptParser.RULE_tupleAssignment;
	}
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
	constructor(parser?: CashScriptParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public Identifier(): TerminalNode {
		return this.getToken(CashScriptParser.Identifier, 0);
	}
	public expression(): ExpressionContext {
		return this.getTypedRuleContext(ExpressionContext, 0) as ExpressionContext;
	}
    public get ruleIndex(): number {
    	return CashScriptParser.RULE_assignStatement;
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
	constructor(parser?: CashScriptParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public TxVar(): TerminalNode {
		return this.getToken(CashScriptParser.TxVar, 0);
	}
	public expression(): ExpressionContext {
		return this.getTypedRuleContext(ExpressionContext, 0) as ExpressionContext;
	}
	public requireMessage(): RequireMessageContext {
		return this.getTypedRuleContext(RequireMessageContext, 0) as RequireMessageContext;
	}
    public get ruleIndex(): number {
    	return CashScriptParser.RULE_timeOpStatement;
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
	constructor(parser?: CashScriptParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public expression(): ExpressionContext {
		return this.getTypedRuleContext(ExpressionContext, 0) as ExpressionContext;
	}
	public requireMessage(): RequireMessageContext {
		return this.getTypedRuleContext(RequireMessageContext, 0) as RequireMessageContext;
	}
    public get ruleIndex(): number {
    	return CashScriptParser.RULE_requireStatement;
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
	public _ifBlock!: BlockContext;
	public _elseBlock!: BlockContext;
	constructor(parser?: CashScriptParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public expression(): ExpressionContext {
		return this.getTypedRuleContext(ExpressionContext, 0) as ExpressionContext;
	}
	public block_list(): BlockContext[] {
		return this.getTypedRuleContexts(BlockContext) as BlockContext[];
	}
	public block(i: number): BlockContext {
		return this.getTypedRuleContext(BlockContext, i) as BlockContext;
	}
    public get ruleIndex(): number {
    	return CashScriptParser.RULE_ifStatement;
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


export class ConsoleStatementContext extends ParserRuleContext {
	constructor(parser?: CashScriptParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public consoleParameterList(): ConsoleParameterListContext {
		return this.getTypedRuleContext(ConsoleParameterListContext, 0) as ConsoleParameterListContext;
	}
    public get ruleIndex(): number {
    	return CashScriptParser.RULE_consoleStatement;
	}
	// @Override
	public accept<Result>(visitor: CashScriptVisitor<Result>): Result {
		if (visitor.visitConsoleStatement) {
			return visitor.visitConsoleStatement(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class RequireMessageContext extends ParserRuleContext {
	constructor(parser?: CashScriptParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public StringLiteral(): TerminalNode {
		return this.getToken(CashScriptParser.StringLiteral, 0);
	}
    public get ruleIndex(): number {
    	return CashScriptParser.RULE_requireMessage;
	}
	// @Override
	public accept<Result>(visitor: CashScriptVisitor<Result>): Result {
		if (visitor.visitRequireMessage) {
			return visitor.visitRequireMessage(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class ConsoleParameterContext extends ParserRuleContext {
	constructor(parser?: CashScriptParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public Identifier(): TerminalNode {
		return this.getToken(CashScriptParser.Identifier, 0);
	}
	public literal(): LiteralContext {
		return this.getTypedRuleContext(LiteralContext, 0) as LiteralContext;
	}
    public get ruleIndex(): number {
    	return CashScriptParser.RULE_consoleParameter;
	}
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
	constructor(parser?: CashScriptParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public consoleParameter_list(): ConsoleParameterContext[] {
		return this.getTypedRuleContexts(ConsoleParameterContext) as ConsoleParameterContext[];
	}
	public consoleParameter(i: number): ConsoleParameterContext {
		return this.getTypedRuleContext(ConsoleParameterContext, i) as ConsoleParameterContext;
	}
    public get ruleIndex(): number {
    	return CashScriptParser.RULE_consoleParameterList;
	}
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
	constructor(parser?: CashScriptParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public Identifier(): TerminalNode {
		return this.getToken(CashScriptParser.Identifier, 0);
	}
	public expressionList(): ExpressionListContext {
		return this.getTypedRuleContext(ExpressionListContext, 0) as ExpressionListContext;
	}
    public get ruleIndex(): number {
    	return CashScriptParser.RULE_functionCall;
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
	constructor(parser?: CashScriptParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public expression_list(): ExpressionContext[] {
		return this.getTypedRuleContexts(ExpressionContext) as ExpressionContext[];
	}
	public expression(i: number): ExpressionContext {
		return this.getTypedRuleContext(ExpressionContext, i) as ExpressionContext;
	}
    public get ruleIndex(): number {
    	return CashScriptParser.RULE_expressionList;
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
	constructor(parser?: CashScriptParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
    public get ruleIndex(): number {
    	return CashScriptParser.RULE_expression;
	}
	public copyFrom(ctx: ExpressionContext): void {
		super.copyFrom(ctx);
	}
}
export class CastContext extends ExpressionContext {
	public _castable!: ExpressionContext;
	public _size!: ExpressionContext;
	constructor(parser: CashScriptParser, ctx: ExpressionContext) {
		super(parser, ctx.parentCtx, ctx.invokingState);
		super.copyFrom(ctx);
	}
	public typeName(): TypeNameContext {
		return this.getTypedRuleContext(TypeNameContext, 0) as TypeNameContext;
	}
	public expression_list(): ExpressionContext[] {
		return this.getTypedRuleContexts(ExpressionContext) as ExpressionContext[];
	}
	public expression(i: number): ExpressionContext {
		return this.getTypedRuleContext(ExpressionContext, i) as ExpressionContext;
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
export class UnaryIntrospectionOpContext extends ExpressionContext {
	public _scope!: Token;
	public _op!: Token;
	constructor(parser: CashScriptParser, ctx: ExpressionContext) {
		super(parser, ctx.parentCtx, ctx.invokingState);
		super.copyFrom(ctx);
	}
	public expression(): ExpressionContext {
		return this.getTypedRuleContext(ExpressionContext, 0) as ExpressionContext;
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
	constructor(parser: CashScriptParser, ctx: ExpressionContext) {
		super(parser, ctx.parentCtx, ctx.invokingState);
		super.copyFrom(ctx);
	}
	public expression(): ExpressionContext {
		return this.getTypedRuleContext(ExpressionContext, 0) as ExpressionContext;
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
export class LiteralExpressionContext extends ExpressionContext {
	constructor(parser: CashScriptParser, ctx: ExpressionContext) {
		super(parser, ctx.parentCtx, ctx.invokingState);
		super.copyFrom(ctx);
	}
	public literal(): LiteralContext {
		return this.getTypedRuleContext(LiteralContext, 0) as LiteralContext;
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
export class FunctionCallExpressionContext extends ExpressionContext {
	constructor(parser: CashScriptParser, ctx: ExpressionContext) {
		super(parser, ctx.parentCtx, ctx.invokingState);
		super.copyFrom(ctx);
	}
	public functionCall(): FunctionCallContext {
		return this.getTypedRuleContext(FunctionCallContext, 0) as FunctionCallContext;
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
export class ArrayContext extends ExpressionContext {
	constructor(parser: CashScriptParser, ctx: ExpressionContext) {
		super(parser, ctx.parentCtx, ctx.invokingState);
		super.copyFrom(ctx);
	}
	public expression_list(): ExpressionContext[] {
		return this.getTypedRuleContexts(ExpressionContext) as ExpressionContext[];
	}
	public expression(i: number): ExpressionContext {
		return this.getTypedRuleContext(ExpressionContext, i) as ExpressionContext;
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
export class IdentifierContext extends ExpressionContext {
	constructor(parser: CashScriptParser, ctx: ExpressionContext) {
		super(parser, ctx.parentCtx, ctx.invokingState);
		super.copyFrom(ctx);
	}
	public Identifier(): TerminalNode {
		return this.getToken(CashScriptParser.Identifier, 0);
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
export class SliceContext extends ExpressionContext {
	public _element!: ExpressionContext;
	public _start!: ExpressionContext;
	public _end!: ExpressionContext;
	constructor(parser: CashScriptParser, ctx: ExpressionContext) {
		super(parser, ctx.parentCtx, ctx.invokingState);
		super.copyFrom(ctx);
	}
	public expression_list(): ExpressionContext[] {
		return this.getTypedRuleContexts(ExpressionContext) as ExpressionContext[];
	}
	public expression(i: number): ExpressionContext {
		return this.getTypedRuleContext(ExpressionContext, i) as ExpressionContext;
	}
	// @Override
	public accept<Result>(visitor: CashScriptVisitor<Result>): Result {
		if (visitor.visitSlice) {
			return visitor.visitSlice(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class TupleIndexOpContext extends ExpressionContext {
	public _index!: Token;
	constructor(parser: CashScriptParser, ctx: ExpressionContext) {
		super(parser, ctx.parentCtx, ctx.invokingState);
		super.copyFrom(ctx);
	}
	public expression(): ExpressionContext {
		return this.getTypedRuleContext(ExpressionContext, 0) as ExpressionContext;
	}
	public NumberLiteral(): TerminalNode {
		return this.getToken(CashScriptParser.NumberLiteral, 0);
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
export class InstantiationContext extends ExpressionContext {
	constructor(parser: CashScriptParser, ctx: ExpressionContext) {
		super(parser, ctx.parentCtx, ctx.invokingState);
		super.copyFrom(ctx);
	}
	public Identifier(): TerminalNode {
		return this.getToken(CashScriptParser.Identifier, 0);
	}
	public expressionList(): ExpressionListContext {
		return this.getTypedRuleContext(ExpressionListContext, 0) as ExpressionListContext;
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
export class NullaryOpContext extends ExpressionContext {
	constructor(parser: CashScriptParser, ctx: ExpressionContext) {
		super(parser, ctx.parentCtx, ctx.invokingState);
		super.copyFrom(ctx);
	}
	public NullaryOp(): TerminalNode {
		return this.getToken(CashScriptParser.NullaryOp, 0);
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
export class ParenthesisedContext extends ExpressionContext {
	constructor(parser: CashScriptParser, ctx: ExpressionContext) {
		super(parser, ctx.parentCtx, ctx.invokingState);
		super.copyFrom(ctx);
	}
	public expression(): ExpressionContext {
		return this.getTypedRuleContext(ExpressionContext, 0) as ExpressionContext;
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
export class BinaryOpContext extends ExpressionContext {
	public _left!: ExpressionContext;
	public _op!: Token;
	public _right!: ExpressionContext;
	constructor(parser: CashScriptParser, ctx: ExpressionContext) {
		super(parser, ctx.parentCtx, ctx.invokingState);
		super.copyFrom(ctx);
	}
	public expression_list(): ExpressionContext[] {
		return this.getTypedRuleContexts(ExpressionContext) as ExpressionContext[];
	}
	public expression(i: number): ExpressionContext {
		return this.getTypedRuleContext(ExpressionContext, i) as ExpressionContext;
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


export class ModifierContext extends ParserRuleContext {
	constructor(parser?: CashScriptParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
    public get ruleIndex(): number {
    	return CashScriptParser.RULE_modifier;
	}
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
	constructor(parser?: CashScriptParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public BooleanLiteral(): TerminalNode {
		return this.getToken(CashScriptParser.BooleanLiteral, 0);
	}
	public numberLiteral(): NumberLiteralContext {
		return this.getTypedRuleContext(NumberLiteralContext, 0) as NumberLiteralContext;
	}
	public StringLiteral(): TerminalNode {
		return this.getToken(CashScriptParser.StringLiteral, 0);
	}
	public DateLiteral(): TerminalNode {
		return this.getToken(CashScriptParser.DateLiteral, 0);
	}
	public HexLiteral(): TerminalNode {
		return this.getToken(CashScriptParser.HexLiteral, 0);
	}
    public get ruleIndex(): number {
    	return CashScriptParser.RULE_literal;
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
	constructor(parser?: CashScriptParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public NumberLiteral(): TerminalNode {
		return this.getToken(CashScriptParser.NumberLiteral, 0);
	}
	public NumberUnit(): TerminalNode {
		return this.getToken(CashScriptParser.NumberUnit, 0);
	}
    public get ruleIndex(): number {
    	return CashScriptParser.RULE_numberLiteral;
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
	constructor(parser?: CashScriptParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public Bytes(): TerminalNode {
		return this.getToken(CashScriptParser.Bytes, 0);
	}
    public get ruleIndex(): number {
    	return CashScriptParser.RULE_typeName;
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
