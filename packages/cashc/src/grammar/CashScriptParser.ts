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
	public static readonly T__58 = 59;
	public static readonly T__59 = 60;
	public static readonly T__60 = 61;
	public static readonly T__61 = 62;
	public static readonly VersionLiteral = 63;
	public static readonly BooleanLiteral = 64;
	public static readonly NumberUnit = 65;
	public static readonly NumberLiteral = 66;
	public static readonly NumberPart = 67;
	public static readonly ExponentPart = 68;
	public static readonly Bytes = 69;
	public static readonly Bound = 70;
	public static readonly StringLiteral = 71;
	public static readonly DateLiteral = 72;
	public static readonly HexLiteral = 73;
	public static readonly TxVar = 74;
	public static readonly NullaryOp = 75;
	public static readonly Identifier = 76;
	public static readonly WHITESPACE = 77;
	public static readonly COMMENT = 78;
	public static readonly LINE_COMMENT = 79;
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
	public static readonly RULE_loopStatement = 18;
	public static readonly RULE_doWhileStatement = 19;
	public static readonly RULE_consoleStatement = 20;
	public static readonly RULE_requireMessage = 21;
	public static readonly RULE_consoleParameter = 22;
	public static readonly RULE_consoleParameterList = 23;
	public static readonly RULE_functionCall = 24;
	public static readonly RULE_expressionList = 25;
	public static readonly RULE_expression = 26;
	public static readonly RULE_modifier = 27;
	public static readonly RULE_literal = 28;
	public static readonly RULE_numberLiteral = 29;
	public static readonly RULE_typeName = 30;
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
                                                            "'do'", "'while'", 
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
                                                            "'>>'", "'<<'", 
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
		"loopStatement", "doWhileStatement", "consoleStatement", "requireMessage", 
		"consoleParameter", "consoleParameterList", "functionCall", "expressionList", 
		"expression", "modifier", "literal", "numberLiteral", "typeName",
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
			this.state = 65;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while (_la===1) {
				{
				{
				this.state = 62;
				this.pragmaDirective();
				}
				}
				this.state = 67;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			}
			this.state = 68;
			this.contractDefinition();
			this.state = 69;
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
			this.state = 71;
			this.match(CashScriptParser.T__0);
			this.state = 72;
			this.pragmaName();
			this.state = 73;
			this.pragmaValue();
			this.state = 74;
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
			this.state = 76;
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
			this.state = 78;
			this.versionConstraint();
			this.state = 80;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if ((((_la) & ~0x1F) === 0 && ((1 << _la) & 2032) !== 0) || _la===63) {
				{
				this.state = 79;
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
			this.state = 83;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if ((((_la) & ~0x1F) === 0 && ((1 << _la) & 2032) !== 0)) {
				{
				this.state = 82;
				this.versionOperator();
				}
			}

			this.state = 85;
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
			this.state = 87;
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
			this.state = 89;
			this.match(CashScriptParser.T__10);
			this.state = 90;
			this.match(CashScriptParser.Identifier);
			this.state = 91;
			this.parameterList();
			this.state = 92;
			this.match(CashScriptParser.T__11);
			this.state = 96;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while (_la===14) {
				{
				{
				this.state = 93;
				this.functionDefinition();
				}
				}
				this.state = 98;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			}
			this.state = 99;
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
			this.state = 101;
			this.match(CashScriptParser.T__13);
			this.state = 102;
			this.match(CashScriptParser.Identifier);
			this.state = 103;
			this.parameterList();
			this.state = 104;
			this.match(CashScriptParser.T__11);
			this.state = 108;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while ((((_la) & ~0x1F) === 0 && ((1 << _la) & 11272192) !== 0) || ((((_la - 57)) & ~0x1F) === 0 && ((1 << (_la - 57)) & 528447) !== 0)) {
				{
				{
				this.state = 105;
				this.statement();
				}
				}
				this.state = 110;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			}
			this.state = 111;
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
			this.state = 113;
			this.match(CashScriptParser.T__14);
			this.state = 125;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (((((_la - 57)) & ~0x1F) === 0 && ((1 << (_la - 57)) & 4159) !== 0)) {
				{
				this.state = 114;
				this.parameter();
				this.state = 119;
				this._errHandler.sync(this);
				_alt = this._interp.adaptivePredict(this._input, 5, this._ctx);
				while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
					if (_alt === 1) {
						{
						{
						this.state = 115;
						this.match(CashScriptParser.T__15);
						this.state = 116;
						this.parameter();
						}
						}
					}
					this.state = 121;
					this._errHandler.sync(this);
					_alt = this._interp.adaptivePredict(this._input, 5, this._ctx);
				}
				this.state = 123;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la===16) {
					{
					this.state = 122;
					this.match(CashScriptParser.T__15);
					}
				}

				}
			}

			this.state = 127;
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
			this.state = 129;
			this.typeName();
			this.state = 130;
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
			this.state = 141;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case 12:
				this.enterOuterAlt(localctx, 1);
				{
				this.state = 132;
				this.match(CashScriptParser.T__11);
				this.state = 136;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				while ((((_la) & ~0x1F) === 0 && ((1 << _la) & 11272192) !== 0) || ((((_la - 57)) & ~0x1F) === 0 && ((1 << (_la - 57)) & 528447) !== 0)) {
					{
					{
					this.state = 133;
					this.statement();
					}
					}
					this.state = 138;
					this._errHandler.sync(this);
					_la = this._input.LA(1);
				}
				this.state = 139;
				this.match(CashScriptParser.T__12);
				}
				break;
			case 18:
			case 19:
			case 21:
			case 23:
			case 57:
			case 58:
			case 59:
			case 60:
			case 61:
			case 62:
			case 69:
			case 76:
				this.enterOuterAlt(localctx, 2);
				{
				this.state = 140;
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
			this.state = 151;
			this._errHandler.sync(this);
			switch ( this._interp.adaptivePredict(this._input, 10, this._ctx) ) {
			case 1:
				this.enterOuterAlt(localctx, 1);
				{
				this.state = 143;
				this.variableDefinition();
				}
				break;
			case 2:
				this.enterOuterAlt(localctx, 2);
				{
				this.state = 144;
				this.tupleAssignment();
				}
				break;
			case 3:
				this.enterOuterAlt(localctx, 3);
				{
				this.state = 145;
				this.assignStatement();
				}
				break;
			case 4:
				this.enterOuterAlt(localctx, 4);
				{
				this.state = 146;
				this.timeOpStatement();
				}
				break;
			case 5:
				this.enterOuterAlt(localctx, 5);
				{
				this.state = 147;
				this.requireStatement();
				}
				break;
			case 6:
				this.enterOuterAlt(localctx, 6);
				{
				this.state = 148;
				this.ifStatement();
				}
				break;
			case 7:
				this.enterOuterAlt(localctx, 7);
				{
				this.state = 149;
				this.loopStatement();
				}
				break;
			case 8:
				this.enterOuterAlt(localctx, 8);
				{
				this.state = 150;
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
			this.state = 153;
			this.typeName();
			this.state = 157;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while (_la===56) {
				{
				{
				this.state = 154;
				this.modifier();
				}
				}
				this.state = 159;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			}
			this.state = 160;
			this.match(CashScriptParser.Identifier);
			this.state = 161;
			this.match(CashScriptParser.T__9);
			this.state = 162;
			this.expression(0);
			this.state = 163;
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
			this.state = 165;
			this.typeName();
			this.state = 166;
			this.match(CashScriptParser.Identifier);
			this.state = 167;
			this.match(CashScriptParser.T__15);
			this.state = 168;
			this.typeName();
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
	public assignStatement(): AssignStatementContext {
		let localctx: AssignStatementContext = new AssignStatementContext(this, this._ctx, this.state);
		this.enterRule(localctx, 28, CashScriptParser.RULE_assignStatement);
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 174;
			this.match(CashScriptParser.Identifier);
			this.state = 175;
			this.match(CashScriptParser.T__9);
			this.state = 176;
			this.expression(0);
			this.state = 177;
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
			this.state = 179;
			this.match(CashScriptParser.T__17);
			this.state = 180;
			this.match(CashScriptParser.T__14);
			this.state = 181;
			this.match(CashScriptParser.TxVar);
			this.state = 182;
			this.match(CashScriptParser.T__5);
			this.state = 183;
			this.expression(0);
			this.state = 186;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la===16) {
				{
				this.state = 184;
				this.match(CashScriptParser.T__15);
				this.state = 185;
				this.requireMessage();
				}
			}

			this.state = 188;
			this.match(CashScriptParser.T__16);
			this.state = 189;
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
			this.state = 191;
			this.match(CashScriptParser.T__17);
			this.state = 192;
			this.match(CashScriptParser.T__14);
			this.state = 193;
			this.expression(0);
			this.state = 196;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la===16) {
				{
				this.state = 194;
				this.match(CashScriptParser.T__15);
				this.state = 195;
				this.requireMessage();
				}
			}

			this.state = 198;
			this.match(CashScriptParser.T__16);
			this.state = 199;
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
			this.state = 201;
			this.match(CashScriptParser.T__18);
			this.state = 202;
			this.match(CashScriptParser.T__14);
			this.state = 203;
			this.expression(0);
			this.state = 204;
			this.match(CashScriptParser.T__16);
			this.state = 205;
			localctx._ifBlock = this.block();
			this.state = 208;
			this._errHandler.sync(this);
			switch ( this._interp.adaptivePredict(this._input, 14, this._ctx) ) {
			case 1:
				{
				this.state = 206;
				this.match(CashScriptParser.T__19);
				this.state = 207;
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
	public loopStatement(): LoopStatementContext {
		let localctx: LoopStatementContext = new LoopStatementContext(this, this._ctx, this.state);
		this.enterRule(localctx, 36, CashScriptParser.RULE_loopStatement);
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 210;
			this.doWhileStatement();
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
	public doWhileStatement(): DoWhileStatementContext {
		let localctx: DoWhileStatementContext = new DoWhileStatementContext(this, this._ctx, this.state);
		this.enterRule(localctx, 38, CashScriptParser.RULE_doWhileStatement);
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 212;
			this.match(CashScriptParser.T__20);
			this.state = 213;
			this.block();
			this.state = 214;
			this.match(CashScriptParser.T__21);
			this.state = 215;
			this.match(CashScriptParser.T__14);
			this.state = 216;
			this.expression(0);
			this.state = 217;
			this.match(CashScriptParser.T__16);
			this.state = 218;
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
	public consoleStatement(): ConsoleStatementContext {
		let localctx: ConsoleStatementContext = new ConsoleStatementContext(this, this._ctx, this.state);
		this.enterRule(localctx, 40, CashScriptParser.RULE_consoleStatement);
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 220;
			this.match(CashScriptParser.T__22);
			this.state = 221;
			this.consoleParameterList();
			this.state = 222;
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
		this.enterRule(localctx, 42, CashScriptParser.RULE_requireMessage);
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 224;
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
		this.enterRule(localctx, 44, CashScriptParser.RULE_consoleParameter);
		try {
			this.state = 228;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case 76:
				this.enterOuterAlt(localctx, 1);
				{
				this.state = 226;
				this.match(CashScriptParser.Identifier);
				}
				break;
			case 64:
			case 66:
			case 71:
			case 72:
			case 73:
				this.enterOuterAlt(localctx, 2);
				{
				this.state = 227;
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
		this.enterRule(localctx, 46, CashScriptParser.RULE_consoleParameterList);
		let _la: number;
		try {
			let _alt: number;
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 230;
			this.match(CashScriptParser.T__14);
			this.state = 242;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (((((_la - 64)) & ~0x1F) === 0 && ((1 << (_la - 64)) & 4997) !== 0)) {
				{
				this.state = 231;
				this.consoleParameter();
				this.state = 236;
				this._errHandler.sync(this);
				_alt = this._interp.adaptivePredict(this._input, 16, this._ctx);
				while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
					if (_alt === 1) {
						{
						{
						this.state = 232;
						this.match(CashScriptParser.T__15);
						this.state = 233;
						this.consoleParameter();
						}
						}
					}
					this.state = 238;
					this._errHandler.sync(this);
					_alt = this._interp.adaptivePredict(this._input, 16, this._ctx);
				}
				this.state = 240;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la===16) {
					{
					this.state = 239;
					this.match(CashScriptParser.T__15);
					}
				}

				}
			}

			this.state = 244;
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
		this.enterRule(localctx, 48, CashScriptParser.RULE_functionCall);
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 246;
			this.match(CashScriptParser.Identifier);
			this.state = 247;
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
		this.enterRule(localctx, 50, CashScriptParser.RULE_expressionList);
		let _la: number;
		try {
			let _alt: number;
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 249;
			this.match(CashScriptParser.T__14);
			this.state = 261;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if ((((_la) & ~0x1F) === 0 && ((1 << _la) & 184582176) !== 0) || ((((_la - 33)) & ~0x1F) === 0 && ((1 << (_la - 33)) & 3204449793) !== 0) || ((((_la - 66)) & ~0x1F) === 0 && ((1 << (_la - 66)) & 1769) !== 0)) {
				{
				this.state = 250;
				this.expression(0);
				this.state = 255;
				this._errHandler.sync(this);
				_alt = this._interp.adaptivePredict(this._input, 19, this._ctx);
				while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
					if (_alt === 1) {
						{
						{
						this.state = 251;
						this.match(CashScriptParser.T__15);
						this.state = 252;
						this.expression(0);
						}
						}
					}
					this.state = 257;
					this._errHandler.sync(this);
					_alt = this._interp.adaptivePredict(this._input, 19, this._ctx);
				}
				this.state = 259;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la===16) {
					{
					this.state = 258;
					this.match(CashScriptParser.T__15);
					}
				}

				}
			}

			this.state = 263;
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
		let _startState: number = 52;
		this.enterRecursionRule(localctx, 52, CashScriptParser.RULE_expression, _p);
		let _la: number;
		try {
			let _alt: number;
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 318;
			this._errHandler.sync(this);
			switch ( this._interp.adaptivePredict(this._input, 27, this._ctx) ) {
			case 1:
				{
				localctx = new ParenthesisedContext(this, localctx);
				this._ctx = localctx;
				_prevctx = localctx;

				this.state = 266;
				this.match(CashScriptParser.T__14);
				this.state = 267;
				this.expression(0);
				this.state = 268;
				this.match(CashScriptParser.T__16);
				}
				break;
			case 2:
				{
				localctx = new CastContext(this, localctx);
				this._ctx = localctx;
				_prevctx = localctx;
				this.state = 270;
				this.typeName();
				this.state = 271;
				this.match(CashScriptParser.T__14);
				this.state = 272;
				(localctx as CastContext)._castable = this.expression(0);
				this.state = 275;
				this._errHandler.sync(this);
				switch ( this._interp.adaptivePredict(this._input, 22, this._ctx) ) {
				case 1:
					{
					this.state = 273;
					this.match(CashScriptParser.T__15);
					this.state = 274;
					(localctx as CastContext)._size = this.expression(0);
					}
					break;
				}
				this.state = 278;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la===16) {
					{
					this.state = 277;
					this.match(CashScriptParser.T__15);
					}
				}

				this.state = 280;
				this.match(CashScriptParser.T__16);
				}
				break;
			case 3:
				{
				localctx = new FunctionCallExpressionContext(this, localctx);
				this._ctx = localctx;
				_prevctx = localctx;
				this.state = 282;
				this.functionCall();
				}
				break;
			case 4:
				{
				localctx = new InstantiationContext(this, localctx);
				this._ctx = localctx;
				_prevctx = localctx;
				this.state = 283;
				this.match(CashScriptParser.T__23);
				this.state = 284;
				this.match(CashScriptParser.Identifier);
				this.state = 285;
				this.expressionList();
				}
				break;
			case 5:
				{
				localctx = new UnaryIntrospectionOpContext(this, localctx);
				this._ctx = localctx;
				_prevctx = localctx;
				this.state = 286;
				(localctx as UnaryIntrospectionOpContext)._scope = this.match(CashScriptParser.T__26);
				this.state = 287;
				this.match(CashScriptParser.T__24);
				this.state = 288;
				this.expression(0);
				this.state = 289;
				this.match(CashScriptParser.T__25);
				this.state = 290;
				(localctx as UnaryIntrospectionOpContext)._op = this._input.LT(1);
				_la = this._input.LA(1);
				if(!(((((_la - 28)) & ~0x1F) === 0 && ((1 << (_la - 28)) & 31) !== 0))) {
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
				this.state = 292;
				(localctx as UnaryIntrospectionOpContext)._scope = this.match(CashScriptParser.T__32);
				this.state = 293;
				this.match(CashScriptParser.T__24);
				this.state = 294;
				this.expression(0);
				this.state = 295;
				this.match(CashScriptParser.T__25);
				this.state = 296;
				(localctx as UnaryIntrospectionOpContext)._op = this._input.LT(1);
				_la = this._input.LA(1);
				if(!(((((_la - 28)) & ~0x1F) === 0 && ((1 << (_la - 28)) & 991) !== 0))) {
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
				this.state = 298;
				(localctx as UnaryOpContext)._op = this._input.LT(1);
				_la = this._input.LA(1);
				if(!(_la===5 || _la===42 || _la===43)) {
				    (localctx as UnaryOpContext)._op = this._errHandler.recoverInline(this);
				}
				else {
					this._errHandler.reportMatch(this);
				    this.consume();
				}
				this.state = 299;
				this.expression(15);
				}
				break;
			case 8:
				{
				localctx = new ArrayContext(this, localctx);
				this._ctx = localctx;
				_prevctx = localctx;
				this.state = 300;
				this.match(CashScriptParser.T__24);
				this.state = 312;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if ((((_la) & ~0x1F) === 0 && ((1 << _la) & 184582176) !== 0) || ((((_la - 33)) & ~0x1F) === 0 && ((1 << (_la - 33)) & 3204449793) !== 0) || ((((_la - 66)) & ~0x1F) === 0 && ((1 << (_la - 66)) & 1769) !== 0)) {
					{
					this.state = 301;
					this.expression(0);
					this.state = 306;
					this._errHandler.sync(this);
					_alt = this._interp.adaptivePredict(this._input, 24, this._ctx);
					while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
						if (_alt === 1) {
							{
							{
							this.state = 302;
							this.match(CashScriptParser.T__15);
							this.state = 303;
							this.expression(0);
							}
							}
						}
						this.state = 308;
						this._errHandler.sync(this);
						_alt = this._interp.adaptivePredict(this._input, 24, this._ctx);
					}
					this.state = 310;
					this._errHandler.sync(this);
					_la = this._input.LA(1);
					if (_la===16) {
						{
						this.state = 309;
						this.match(CashScriptParser.T__15);
						}
					}

					}
				}

				this.state = 314;
				this.match(CashScriptParser.T__25);
				}
				break;
			case 9:
				{
				localctx = new NullaryOpContext(this, localctx);
				this._ctx = localctx;
				_prevctx = localctx;
				this.state = 315;
				this.match(CashScriptParser.NullaryOp);
				}
				break;
			case 10:
				{
				localctx = new IdentifierContext(this, localctx);
				this._ctx = localctx;
				_prevctx = localctx;
				this.state = 316;
				this.match(CashScriptParser.Identifier);
				}
				break;
			case 11:
				{
				localctx = new LiteralExpressionContext(this, localctx);
				this._ctx = localctx;
				_prevctx = localctx;
				this.state = 317;
				this.literal();
				}
				break;
			}
			this._ctx.stop = this._input.LT(-1);
			this.state = 372;
			this._errHandler.sync(this);
			_alt = this._interp.adaptivePredict(this._input, 29, this._ctx);
			while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
				if (_alt === 1) {
					if (this._parseListeners != null) {
						this.triggerExitRuleEvent();
					}
					_prevctx = localctx;
					{
					this.state = 370;
					this._errHandler.sync(this);
					switch ( this._interp.adaptivePredict(this._input, 28, this._ctx) ) {
					case 1:
						{
						localctx = new BinaryOpContext(this, new ExpressionContext(this, _parentctx, _parentState));
						(localctx as BinaryOpContext)._left = _prevctx;
						this.pushNewRecursionContext(localctx, _startState, CashScriptParser.RULE_expression);
						this.state = 320;
						if (!(this.precpred(this._ctx, 14))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 14)");
						}
						this.state = 321;
						(localctx as BinaryOpContext)._op = this._input.LT(1);
						_la = this._input.LA(1);
						if(!(((((_la - 44)) & ~0x1F) === 0 && ((1 << (_la - 44)) & 7) !== 0))) {
						    (localctx as BinaryOpContext)._op = this._errHandler.recoverInline(this);
						}
						else {
							this._errHandler.reportMatch(this);
						    this.consume();
						}
						this.state = 322;
						(localctx as BinaryOpContext)._right = this.expression(15);
						}
						break;
					case 2:
						{
						localctx = new BinaryOpContext(this, new ExpressionContext(this, _parentctx, _parentState));
						(localctx as BinaryOpContext)._left = _prevctx;
						this.pushNewRecursionContext(localctx, _startState, CashScriptParser.RULE_expression);
						this.state = 323;
						if (!(this.precpred(this._ctx, 13))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 13)");
						}
						this.state = 324;
						(localctx as BinaryOpContext)._op = this._input.LT(1);
						_la = this._input.LA(1);
						if(!(_la===43 || _la===47)) {
						    (localctx as BinaryOpContext)._op = this._errHandler.recoverInline(this);
						}
						else {
							this._errHandler.reportMatch(this);
						    this.consume();
						}
						this.state = 325;
						(localctx as BinaryOpContext)._right = this.expression(14);
						}
						break;
					case 3:
						{
						localctx = new BinaryOpContext(this, new ExpressionContext(this, _parentctx, _parentState));
						(localctx as BinaryOpContext)._left = _prevctx;
						this.pushNewRecursionContext(localctx, _startState, CashScriptParser.RULE_expression);
						this.state = 326;
						if (!(this.precpred(this._ctx, 12))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 12)");
						}
						this.state = 327;
						(localctx as BinaryOpContext)._op = this._input.LT(1);
						_la = this._input.LA(1);
						if(!(_la===48 || _la===49)) {
						    (localctx as BinaryOpContext)._op = this._errHandler.recoverInline(this);
						}
						else {
							this._errHandler.reportMatch(this);
						    this.consume();
						}
						this.state = 328;
						(localctx as BinaryOpContext)._right = this.expression(13);
						}
						break;
					case 4:
						{
						localctx = new BinaryOpContext(this, new ExpressionContext(this, _parentctx, _parentState));
						(localctx as BinaryOpContext)._left = _prevctx;
						this.pushNewRecursionContext(localctx, _startState, CashScriptParser.RULE_expression);
						this.state = 329;
						if (!(this.precpred(this._ctx, 11))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 11)");
						}
						this.state = 330;
						(localctx as BinaryOpContext)._op = this._input.LT(1);
						_la = this._input.LA(1);
						if(!((((_la) & ~0x1F) === 0 && ((1 << _la) & 960) !== 0))) {
						    (localctx as BinaryOpContext)._op = this._errHandler.recoverInline(this);
						}
						else {
							this._errHandler.reportMatch(this);
						    this.consume();
						}
						this.state = 331;
						(localctx as BinaryOpContext)._right = this.expression(12);
						}
						break;
					case 5:
						{
						localctx = new BinaryOpContext(this, new ExpressionContext(this, _parentctx, _parentState));
						(localctx as BinaryOpContext)._left = _prevctx;
						this.pushNewRecursionContext(localctx, _startState, CashScriptParser.RULE_expression);
						this.state = 332;
						if (!(this.precpred(this._ctx, 10))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 10)");
						}
						this.state = 333;
						(localctx as BinaryOpContext)._op = this._input.LT(1);
						_la = this._input.LA(1);
						if(!(_la===50 || _la===51)) {
						    (localctx as BinaryOpContext)._op = this._errHandler.recoverInline(this);
						}
						else {
							this._errHandler.reportMatch(this);
						    this.consume();
						}
						this.state = 334;
						(localctx as BinaryOpContext)._right = this.expression(11);
						}
						break;
					case 6:
						{
						localctx = new BinaryOpContext(this, new ExpressionContext(this, _parentctx, _parentState));
						(localctx as BinaryOpContext)._left = _prevctx;
						this.pushNewRecursionContext(localctx, _startState, CashScriptParser.RULE_expression);
						this.state = 335;
						if (!(this.precpred(this._ctx, 9))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 9)");
						}
						this.state = 336;
						(localctx as BinaryOpContext)._op = this.match(CashScriptParser.T__51);
						this.state = 337;
						(localctx as BinaryOpContext)._right = this.expression(10);
						}
						break;
					case 7:
						{
						localctx = new BinaryOpContext(this, new ExpressionContext(this, _parentctx, _parentState));
						(localctx as BinaryOpContext)._left = _prevctx;
						this.pushNewRecursionContext(localctx, _startState, CashScriptParser.RULE_expression);
						this.state = 338;
						if (!(this.precpred(this._ctx, 8))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 8)");
						}
						this.state = 339;
						(localctx as BinaryOpContext)._op = this.match(CashScriptParser.T__3);
						this.state = 340;
						(localctx as BinaryOpContext)._right = this.expression(9);
						}
						break;
					case 8:
						{
						localctx = new BinaryOpContext(this, new ExpressionContext(this, _parentctx, _parentState));
						(localctx as BinaryOpContext)._left = _prevctx;
						this.pushNewRecursionContext(localctx, _startState, CashScriptParser.RULE_expression);
						this.state = 341;
						if (!(this.precpred(this._ctx, 7))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 7)");
						}
						this.state = 342;
						(localctx as BinaryOpContext)._op = this.match(CashScriptParser.T__52);
						this.state = 343;
						(localctx as BinaryOpContext)._right = this.expression(8);
						}
						break;
					case 9:
						{
						localctx = new BinaryOpContext(this, new ExpressionContext(this, _parentctx, _parentState));
						(localctx as BinaryOpContext)._left = _prevctx;
						this.pushNewRecursionContext(localctx, _startState, CashScriptParser.RULE_expression);
						this.state = 344;
						if (!(this.precpred(this._ctx, 6))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 6)");
						}
						this.state = 345;
						(localctx as BinaryOpContext)._op = this.match(CashScriptParser.T__53);
						this.state = 346;
						(localctx as BinaryOpContext)._right = this.expression(7);
						}
						break;
					case 10:
						{
						localctx = new BinaryOpContext(this, new ExpressionContext(this, _parentctx, _parentState));
						(localctx as BinaryOpContext)._left = _prevctx;
						this.pushNewRecursionContext(localctx, _startState, CashScriptParser.RULE_expression);
						this.state = 347;
						if (!(this.precpred(this._ctx, 5))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 5)");
						}
						this.state = 348;
						(localctx as BinaryOpContext)._op = this.match(CashScriptParser.T__54);
						this.state = 349;
						(localctx as BinaryOpContext)._right = this.expression(6);
						}
						break;
					case 11:
						{
						localctx = new TupleIndexOpContext(this, new ExpressionContext(this, _parentctx, _parentState));
						this.pushNewRecursionContext(localctx, _startState, CashScriptParser.RULE_expression);
						this.state = 350;
						if (!(this.precpred(this._ctx, 21))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 21)");
						}
						this.state = 351;
						this.match(CashScriptParser.T__24);
						this.state = 352;
						(localctx as TupleIndexOpContext)._index = this.match(CashScriptParser.NumberLiteral);
						this.state = 353;
						this.match(CashScriptParser.T__25);
						}
						break;
					case 12:
						{
						localctx = new UnaryOpContext(this, new ExpressionContext(this, _parentctx, _parentState));
						this.pushNewRecursionContext(localctx, _startState, CashScriptParser.RULE_expression);
						this.state = 354;
						if (!(this.precpred(this._ctx, 18))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 18)");
						}
						this.state = 355;
						(localctx as UnaryOpContext)._op = this._input.LT(1);
						_la = this._input.LA(1);
						if(!(_la===38 || _la===39)) {
						    (localctx as UnaryOpContext)._op = this._errHandler.recoverInline(this);
						}
						else {
							this._errHandler.reportMatch(this);
						    this.consume();
						}
						}
						break;
					case 13:
						{
						localctx = new BinaryOpContext(this, new ExpressionContext(this, _parentctx, _parentState));
						(localctx as BinaryOpContext)._left = _prevctx;
						this.pushNewRecursionContext(localctx, _startState, CashScriptParser.RULE_expression);
						this.state = 356;
						if (!(this.precpred(this._ctx, 17))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 17)");
						}
						this.state = 357;
						(localctx as BinaryOpContext)._op = this.match(CashScriptParser.T__39);
						this.state = 358;
						this.match(CashScriptParser.T__14);
						this.state = 359;
						(localctx as BinaryOpContext)._right = this.expression(0);
						this.state = 360;
						this.match(CashScriptParser.T__16);
						}
						break;
					case 14:
						{
						localctx = new SliceContext(this, new ExpressionContext(this, _parentctx, _parentState));
						(localctx as SliceContext)._element = _prevctx;
						this.pushNewRecursionContext(localctx, _startState, CashScriptParser.RULE_expression);
						this.state = 362;
						if (!(this.precpred(this._ctx, 16))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 16)");
						}
						this.state = 363;
						this.match(CashScriptParser.T__40);
						this.state = 364;
						this.match(CashScriptParser.T__14);
						this.state = 365;
						(localctx as SliceContext)._start = this.expression(0);
						this.state = 366;
						this.match(CashScriptParser.T__15);
						this.state = 367;
						(localctx as SliceContext)._end = this.expression(0);
						this.state = 368;
						this.match(CashScriptParser.T__16);
						}
						break;
					}
					}
				}
				this.state = 374;
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
		this.enterRule(localctx, 54, CashScriptParser.RULE_modifier);
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 375;
			this.match(CashScriptParser.T__55);
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
		this.enterRule(localctx, 56, CashScriptParser.RULE_literal);
		try {
			this.state = 382;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case 64:
				this.enterOuterAlt(localctx, 1);
				{
				this.state = 377;
				this.match(CashScriptParser.BooleanLiteral);
				}
				break;
			case 66:
				this.enterOuterAlt(localctx, 2);
				{
				this.state = 378;
				this.numberLiteral();
				}
				break;
			case 71:
				this.enterOuterAlt(localctx, 3);
				{
				this.state = 379;
				this.match(CashScriptParser.StringLiteral);
				}
				break;
			case 72:
				this.enterOuterAlt(localctx, 4);
				{
				this.state = 380;
				this.match(CashScriptParser.DateLiteral);
				}
				break;
			case 73:
				this.enterOuterAlt(localctx, 5);
				{
				this.state = 381;
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
		this.enterRule(localctx, 58, CashScriptParser.RULE_numberLiteral);
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 384;
			this.match(CashScriptParser.NumberLiteral);
			this.state = 386;
			this._errHandler.sync(this);
			switch ( this._interp.adaptivePredict(this._input, 31, this._ctx) ) {
			case 1:
				{
				this.state = 385;
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
		this.enterRule(localctx, 60, CashScriptParser.RULE_typeName);
		let _la: number;
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 388;
			_la = this._input.LA(1);
			if(!(((((_la - 57)) & ~0x1F) === 0 && ((1 << (_la - 57)) & 4159) !== 0))) {
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
		case 26:
			return this.expression_sempred(localctx as ExpressionContext, predIndex);
		}
		return true;
	}
	private expression_sempred(localctx: ExpressionContext, predIndex: number): boolean {
		switch (predIndex) {
		case 0:
			return this.precpred(this._ctx, 14);
		case 1:
			return this.precpred(this._ctx, 13);
		case 2:
			return this.precpred(this._ctx, 12);
		case 3:
			return this.precpred(this._ctx, 11);
		case 4:
			return this.precpred(this._ctx, 10);
		case 5:
			return this.precpred(this._ctx, 9);
		case 6:
			return this.precpred(this._ctx, 8);
		case 7:
			return this.precpred(this._ctx, 7);
		case 8:
			return this.precpred(this._ctx, 6);
		case 9:
			return this.precpred(this._ctx, 5);
		case 10:
			return this.precpred(this._ctx, 21);
		case 11:
			return this.precpred(this._ctx, 18);
		case 12:
			return this.precpred(this._ctx, 17);
		case 13:
			return this.precpred(this._ctx, 16);
		}
		return true;
	}

	public static readonly _serializedATN: number[] = [4,1,79,391,2,0,7,0,2,
	1,7,1,2,2,7,2,2,3,7,3,2,4,7,4,2,5,7,5,2,6,7,6,2,7,7,7,2,8,7,8,2,9,7,9,2,
	10,7,10,2,11,7,11,2,12,7,12,2,13,7,13,2,14,7,14,2,15,7,15,2,16,7,16,2,17,
	7,17,2,18,7,18,2,19,7,19,2,20,7,20,2,21,7,21,2,22,7,22,2,23,7,23,2,24,7,
	24,2,25,7,25,2,26,7,26,2,27,7,27,2,28,7,28,2,29,7,29,2,30,7,30,1,0,5,0,
	64,8,0,10,0,12,0,67,9,0,1,0,1,0,1,0,1,1,1,1,1,1,1,1,1,1,1,2,1,2,1,3,1,3,
	3,3,81,8,3,1,4,3,4,84,8,4,1,4,1,4,1,5,1,5,1,6,1,6,1,6,1,6,1,6,5,6,95,8,
	6,10,6,12,6,98,9,6,1,6,1,6,1,7,1,7,1,7,1,7,1,7,5,7,107,8,7,10,7,12,7,110,
	9,7,1,7,1,7,1,8,1,8,1,8,1,8,5,8,118,8,8,10,8,12,8,121,9,8,1,8,3,8,124,8,
	8,3,8,126,8,8,1,8,1,8,1,9,1,9,1,9,1,10,1,10,5,10,135,8,10,10,10,12,10,138,
	9,10,1,10,1,10,3,10,142,8,10,1,11,1,11,1,11,1,11,1,11,1,11,1,11,1,11,3,
	11,152,8,11,1,12,1,12,5,12,156,8,12,10,12,12,12,159,9,12,1,12,1,12,1,12,
	1,12,1,12,1,13,1,13,1,13,1,13,1,13,1,13,1,13,1,13,1,13,1,14,1,14,1,14,1,
	14,1,14,1,15,1,15,1,15,1,15,1,15,1,15,1,15,3,15,187,8,15,1,15,1,15,1,15,
	1,16,1,16,1,16,1,16,1,16,3,16,197,8,16,1,16,1,16,1,16,1,17,1,17,1,17,1,
	17,1,17,1,17,1,17,3,17,209,8,17,1,18,1,18,1,19,1,19,1,19,1,19,1,19,1,19,
	1,19,1,19,1,20,1,20,1,20,1,20,1,21,1,21,1,22,1,22,3,22,229,8,22,1,23,1,
	23,1,23,1,23,5,23,235,8,23,10,23,12,23,238,9,23,1,23,3,23,241,8,23,3,23,
	243,8,23,1,23,1,23,1,24,1,24,1,24,1,25,1,25,1,25,1,25,5,25,254,8,25,10,
	25,12,25,257,9,25,1,25,3,25,260,8,25,3,25,262,8,25,1,25,1,25,1,26,1,26,
	1,26,1,26,1,26,1,26,1,26,1,26,1,26,1,26,3,26,276,8,26,1,26,3,26,279,8,26,
	1,26,1,26,1,26,1,26,1,26,1,26,1,26,1,26,1,26,1,26,1,26,1,26,1,26,1,26,1,
	26,1,26,1,26,1,26,1,26,1,26,1,26,1,26,1,26,1,26,5,26,305,8,26,10,26,12,
	26,308,9,26,1,26,3,26,311,8,26,3,26,313,8,26,1,26,1,26,1,26,1,26,3,26,319,
	8,26,1,26,1,26,1,26,1,26,1,26,1,26,1,26,1,26,1,26,1,26,1,26,1,26,1,26,1,
	26,1,26,1,26,1,26,1,26,1,26,1,26,1,26,1,26,1,26,1,26,1,26,1,26,1,26,1,26,
	1,26,1,26,1,26,1,26,1,26,1,26,1,26,1,26,1,26,1,26,1,26,1,26,1,26,1,26,1,
	26,1,26,1,26,1,26,1,26,1,26,1,26,1,26,5,26,371,8,26,10,26,12,26,374,9,26,
	1,27,1,27,1,28,1,28,1,28,1,28,1,28,3,28,383,8,28,1,29,1,29,3,29,387,8,29,
	1,30,1,30,1,30,0,1,52,31,0,2,4,6,8,10,12,14,16,18,20,22,24,26,28,30,32,
	34,36,38,40,42,44,46,48,50,52,54,56,58,60,0,11,1,0,4,10,1,0,28,32,2,0,28,
	32,34,37,2,0,5,5,42,43,1,0,44,46,2,0,43,43,47,47,1,0,48,49,1,0,6,9,1,0,
	50,51,1,0,38,39,2,0,57,62,69,69,421,0,65,1,0,0,0,2,71,1,0,0,0,4,76,1,0,
	0,0,6,78,1,0,0,0,8,83,1,0,0,0,10,87,1,0,0,0,12,89,1,0,0,0,14,101,1,0,0,
	0,16,113,1,0,0,0,18,129,1,0,0,0,20,141,1,0,0,0,22,151,1,0,0,0,24,153,1,
	0,0,0,26,165,1,0,0,0,28,174,1,0,0,0,30,179,1,0,0,0,32,191,1,0,0,0,34,201,
	1,0,0,0,36,210,1,0,0,0,38,212,1,0,0,0,40,220,1,0,0,0,42,224,1,0,0,0,44,
	228,1,0,0,0,46,230,1,0,0,0,48,246,1,0,0,0,50,249,1,0,0,0,52,318,1,0,0,0,
	54,375,1,0,0,0,56,382,1,0,0,0,58,384,1,0,0,0,60,388,1,0,0,0,62,64,3,2,1,
	0,63,62,1,0,0,0,64,67,1,0,0,0,65,63,1,0,0,0,65,66,1,0,0,0,66,68,1,0,0,0,
	67,65,1,0,0,0,68,69,3,12,6,0,69,70,5,0,0,1,70,1,1,0,0,0,71,72,5,1,0,0,72,
	73,3,4,2,0,73,74,3,6,3,0,74,75,5,2,0,0,75,3,1,0,0,0,76,77,5,3,0,0,77,5,
	1,0,0,0,78,80,3,8,4,0,79,81,3,8,4,0,80,79,1,0,0,0,80,81,1,0,0,0,81,7,1,
	0,0,0,82,84,3,10,5,0,83,82,1,0,0,0,83,84,1,0,0,0,84,85,1,0,0,0,85,86,5,
	63,0,0,86,9,1,0,0,0,87,88,7,0,0,0,88,11,1,0,0,0,89,90,5,11,0,0,90,91,5,
	76,0,0,91,92,3,16,8,0,92,96,5,12,0,0,93,95,3,14,7,0,94,93,1,0,0,0,95,98,
	1,0,0,0,96,94,1,0,0,0,96,97,1,0,0,0,97,99,1,0,0,0,98,96,1,0,0,0,99,100,
	5,13,0,0,100,13,1,0,0,0,101,102,5,14,0,0,102,103,5,76,0,0,103,104,3,16,
	8,0,104,108,5,12,0,0,105,107,3,22,11,0,106,105,1,0,0,0,107,110,1,0,0,0,
	108,106,1,0,0,0,108,109,1,0,0,0,109,111,1,0,0,0,110,108,1,0,0,0,111,112,
	5,13,0,0,112,15,1,0,0,0,113,125,5,15,0,0,114,119,3,18,9,0,115,116,5,16,
	0,0,116,118,3,18,9,0,117,115,1,0,0,0,118,121,1,0,0,0,119,117,1,0,0,0,119,
	120,1,0,0,0,120,123,1,0,0,0,121,119,1,0,0,0,122,124,5,16,0,0,123,122,1,
	0,0,0,123,124,1,0,0,0,124,126,1,0,0,0,125,114,1,0,0,0,125,126,1,0,0,0,126,
	127,1,0,0,0,127,128,5,17,0,0,128,17,1,0,0,0,129,130,3,60,30,0,130,131,5,
	76,0,0,131,19,1,0,0,0,132,136,5,12,0,0,133,135,3,22,11,0,134,133,1,0,0,
	0,135,138,1,0,0,0,136,134,1,0,0,0,136,137,1,0,0,0,137,139,1,0,0,0,138,136,
	1,0,0,0,139,142,5,13,0,0,140,142,3,22,11,0,141,132,1,0,0,0,141,140,1,0,
	0,0,142,21,1,0,0,0,143,152,3,24,12,0,144,152,3,26,13,0,145,152,3,28,14,
	0,146,152,3,30,15,0,147,152,3,32,16,0,148,152,3,34,17,0,149,152,3,36,18,
	0,150,152,3,40,20,0,151,143,1,0,0,0,151,144,1,0,0,0,151,145,1,0,0,0,151,
	146,1,0,0,0,151,147,1,0,0,0,151,148,1,0,0,0,151,149,1,0,0,0,151,150,1,0,
	0,0,152,23,1,0,0,0,153,157,3,60,30,0,154,156,3,54,27,0,155,154,1,0,0,0,
	156,159,1,0,0,0,157,155,1,0,0,0,157,158,1,0,0,0,158,160,1,0,0,0,159,157,
	1,0,0,0,160,161,5,76,0,0,161,162,5,10,0,0,162,163,3,52,26,0,163,164,5,2,
	0,0,164,25,1,0,0,0,165,166,3,60,30,0,166,167,5,76,0,0,167,168,5,16,0,0,
	168,169,3,60,30,0,169,170,5,76,0,0,170,171,5,10,0,0,171,172,3,52,26,0,172,
	173,5,2,0,0,173,27,1,0,0,0,174,175,5,76,0,0,175,176,5,10,0,0,176,177,3,
	52,26,0,177,178,5,2,0,0,178,29,1,0,0,0,179,180,5,18,0,0,180,181,5,15,0,
	0,181,182,5,74,0,0,182,183,5,6,0,0,183,186,3,52,26,0,184,185,5,16,0,0,185,
	187,3,42,21,0,186,184,1,0,0,0,186,187,1,0,0,0,187,188,1,0,0,0,188,189,5,
	17,0,0,189,190,5,2,0,0,190,31,1,0,0,0,191,192,5,18,0,0,192,193,5,15,0,0,
	193,196,3,52,26,0,194,195,5,16,0,0,195,197,3,42,21,0,196,194,1,0,0,0,196,
	197,1,0,0,0,197,198,1,0,0,0,198,199,5,17,0,0,199,200,5,2,0,0,200,33,1,0,
	0,0,201,202,5,19,0,0,202,203,5,15,0,0,203,204,3,52,26,0,204,205,5,17,0,
	0,205,208,3,20,10,0,206,207,5,20,0,0,207,209,3,20,10,0,208,206,1,0,0,0,
	208,209,1,0,0,0,209,35,1,0,0,0,210,211,3,38,19,0,211,37,1,0,0,0,212,213,
	5,21,0,0,213,214,3,20,10,0,214,215,5,22,0,0,215,216,5,15,0,0,216,217,3,
	52,26,0,217,218,5,17,0,0,218,219,5,2,0,0,219,39,1,0,0,0,220,221,5,23,0,
	0,221,222,3,46,23,0,222,223,5,2,0,0,223,41,1,0,0,0,224,225,5,71,0,0,225,
	43,1,0,0,0,226,229,5,76,0,0,227,229,3,56,28,0,228,226,1,0,0,0,228,227,1,
	0,0,0,229,45,1,0,0,0,230,242,5,15,0,0,231,236,3,44,22,0,232,233,5,16,0,
	0,233,235,3,44,22,0,234,232,1,0,0,0,235,238,1,0,0,0,236,234,1,0,0,0,236,
	237,1,0,0,0,237,240,1,0,0,0,238,236,1,0,0,0,239,241,5,16,0,0,240,239,1,
	0,0,0,240,241,1,0,0,0,241,243,1,0,0,0,242,231,1,0,0,0,242,243,1,0,0,0,243,
	244,1,0,0,0,244,245,5,17,0,0,245,47,1,0,0,0,246,247,5,76,0,0,247,248,3,
	50,25,0,248,49,1,0,0,0,249,261,5,15,0,0,250,255,3,52,26,0,251,252,5,16,
	0,0,252,254,3,52,26,0,253,251,1,0,0,0,254,257,1,0,0,0,255,253,1,0,0,0,255,
	256,1,0,0,0,256,259,1,0,0,0,257,255,1,0,0,0,258,260,5,16,0,0,259,258,1,
	0,0,0,259,260,1,0,0,0,260,262,1,0,0,0,261,250,1,0,0,0,261,262,1,0,0,0,262,
	263,1,0,0,0,263,264,5,17,0,0,264,51,1,0,0,0,265,266,6,26,-1,0,266,267,5,
	15,0,0,267,268,3,52,26,0,268,269,5,17,0,0,269,319,1,0,0,0,270,271,3,60,
	30,0,271,272,5,15,0,0,272,275,3,52,26,0,273,274,5,16,0,0,274,276,3,52,26,
	0,275,273,1,0,0,0,275,276,1,0,0,0,276,278,1,0,0,0,277,279,5,16,0,0,278,
	277,1,0,0,0,278,279,1,0,0,0,279,280,1,0,0,0,280,281,5,17,0,0,281,319,1,
	0,0,0,282,319,3,48,24,0,283,284,5,24,0,0,284,285,5,76,0,0,285,319,3,50,
	25,0,286,287,5,27,0,0,287,288,5,25,0,0,288,289,3,52,26,0,289,290,5,26,0,
	0,290,291,7,1,0,0,291,319,1,0,0,0,292,293,5,33,0,0,293,294,5,25,0,0,294,
	295,3,52,26,0,295,296,5,26,0,0,296,297,7,2,0,0,297,319,1,0,0,0,298,299,
	7,3,0,0,299,319,3,52,26,15,300,312,5,25,0,0,301,306,3,52,26,0,302,303,5,
	16,0,0,303,305,3,52,26,0,304,302,1,0,0,0,305,308,1,0,0,0,306,304,1,0,0,
	0,306,307,1,0,0,0,307,310,1,0,0,0,308,306,1,0,0,0,309,311,5,16,0,0,310,
	309,1,0,0,0,310,311,1,0,0,0,311,313,1,0,0,0,312,301,1,0,0,0,312,313,1,0,
	0,0,313,314,1,0,0,0,314,319,5,26,0,0,315,319,5,75,0,0,316,319,5,76,0,0,
	317,319,3,56,28,0,318,265,1,0,0,0,318,270,1,0,0,0,318,282,1,0,0,0,318,283,
	1,0,0,0,318,286,1,0,0,0,318,292,1,0,0,0,318,298,1,0,0,0,318,300,1,0,0,0,
	318,315,1,0,0,0,318,316,1,0,0,0,318,317,1,0,0,0,319,372,1,0,0,0,320,321,
	10,14,0,0,321,322,7,4,0,0,322,371,3,52,26,15,323,324,10,13,0,0,324,325,
	7,5,0,0,325,371,3,52,26,14,326,327,10,12,0,0,327,328,7,6,0,0,328,371,3,
	52,26,13,329,330,10,11,0,0,330,331,7,7,0,0,331,371,3,52,26,12,332,333,10,
	10,0,0,333,334,7,8,0,0,334,371,3,52,26,11,335,336,10,9,0,0,336,337,5,52,
	0,0,337,371,3,52,26,10,338,339,10,8,0,0,339,340,5,4,0,0,340,371,3,52,26,
	9,341,342,10,7,0,0,342,343,5,53,0,0,343,371,3,52,26,8,344,345,10,6,0,0,
	345,346,5,54,0,0,346,371,3,52,26,7,347,348,10,5,0,0,348,349,5,55,0,0,349,
	371,3,52,26,6,350,351,10,21,0,0,351,352,5,25,0,0,352,353,5,66,0,0,353,371,
	5,26,0,0,354,355,10,18,0,0,355,371,7,9,0,0,356,357,10,17,0,0,357,358,5,
	40,0,0,358,359,5,15,0,0,359,360,3,52,26,0,360,361,5,17,0,0,361,371,1,0,
	0,0,362,363,10,16,0,0,363,364,5,41,0,0,364,365,5,15,0,0,365,366,3,52,26,
	0,366,367,5,16,0,0,367,368,3,52,26,0,368,369,5,17,0,0,369,371,1,0,0,0,370,
	320,1,0,0,0,370,323,1,0,0,0,370,326,1,0,0,0,370,329,1,0,0,0,370,332,1,0,
	0,0,370,335,1,0,0,0,370,338,1,0,0,0,370,341,1,0,0,0,370,344,1,0,0,0,370,
	347,1,0,0,0,370,350,1,0,0,0,370,354,1,0,0,0,370,356,1,0,0,0,370,362,1,0,
	0,0,371,374,1,0,0,0,372,370,1,0,0,0,372,373,1,0,0,0,373,53,1,0,0,0,374,
	372,1,0,0,0,375,376,5,56,0,0,376,55,1,0,0,0,377,383,5,64,0,0,378,383,3,
	58,29,0,379,383,5,71,0,0,380,383,5,72,0,0,381,383,5,73,0,0,382,377,1,0,
	0,0,382,378,1,0,0,0,382,379,1,0,0,0,382,380,1,0,0,0,382,381,1,0,0,0,383,
	57,1,0,0,0,384,386,5,66,0,0,385,387,5,65,0,0,386,385,1,0,0,0,386,387,1,
	0,0,0,387,59,1,0,0,0,388,389,7,10,0,0,389,61,1,0,0,0,32,65,80,83,96,108,
	119,123,125,136,141,151,157,186,196,208,228,236,240,242,255,259,261,275,
	278,306,310,312,318,370,372,382,386];

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
	public loopStatement(): LoopStatementContext {
		return this.getTypedRuleContext(LoopStatementContext, 0) as LoopStatementContext;
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


export class LoopStatementContext extends ParserRuleContext {
	constructor(parser?: CashScriptParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public doWhileStatement(): DoWhileStatementContext {
		return this.getTypedRuleContext(DoWhileStatementContext, 0) as DoWhileStatementContext;
	}
    public get ruleIndex(): number {
    	return CashScriptParser.RULE_loopStatement;
	}
	// @Override
	public accept<Result>(visitor: CashScriptVisitor<Result>): Result {
		if (visitor.visitLoopStatement) {
			return visitor.visitLoopStatement(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class DoWhileStatementContext extends ParserRuleContext {
	constructor(parser?: CashScriptParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public block(): BlockContext {
		return this.getTypedRuleContext(BlockContext, 0) as BlockContext;
	}
	public expression(): ExpressionContext {
		return this.getTypedRuleContext(ExpressionContext, 0) as ExpressionContext;
	}
    public get ruleIndex(): number {
    	return CashScriptParser.RULE_doWhileStatement;
	}
	// @Override
	public accept<Result>(visitor: CashScriptVisitor<Result>): Result {
		if (visitor.visitDoWhileStatement) {
			return visitor.visitDoWhileStatement(this);
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
