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
	public static readonly VersionLiteral = 57;
	public static readonly BooleanLiteral = 58;
	public static readonly NumberUnit = 59;
	public static readonly NumberLiteral = 60;
	public static readonly Bytes = 61;
	public static readonly Bound = 62;
	public static readonly StringLiteral = 63;
	public static readonly DateLiteral = 64;
	public static readonly HexLiteral = 65;
	public static readonly TxVar = 66;
	public static readonly NullaryOp = 67;
	public static readonly Identifier = 68;
	public static readonly WHITESPACE = 69;
	public static readonly COMMENT = 70;
	public static readonly LINE_COMMENT = 71;
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
	public static readonly RULE_functionCall = 18;
	public static readonly RULE_expressionList = 19;
	public static readonly RULE_expression = 20;
	public static readonly RULE_modifier = 21;
	public static readonly RULE_literal = 22;
	public static readonly RULE_numberLiteral = 23;
	public static readonly RULE_typeName = 24;
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
                                                             null, "VersionLiteral", 
                                                             "BooleanLiteral", 
                                                             "NumberUnit", 
                                                             "NumberLiteral", 
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
			this.state = 53;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while (_la===1) {
				{
				{
				this.state = 50;
				this.pragmaDirective();
				}
				}
				this.state = 55;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			}
			this.state = 56;
			this.contractDefinition();
			this.state = 57;
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
			this.state = 59;
			this.match(CashScriptParser.T__0);
			this.state = 60;
			this.pragmaName();
			this.state = 61;
			this.pragmaValue();
			this.state = 62;
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
			this.state = 64;
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
			this.state = 66;
			this.versionConstraint();
			this.state = 68;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if ((((_la) & ~0x1F) === 0 && ((1 << _la) & 2032) !== 0) || _la===57) {
				{
				this.state = 67;
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
			this.state = 71;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if ((((_la) & ~0x1F) === 0 && ((1 << _la) & 2032) !== 0)) {
				{
				this.state = 70;
				this.versionOperator();
				}
			}

			this.state = 73;
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
			this.state = 75;
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
			this.state = 77;
			this.match(CashScriptParser.T__10);
			this.state = 78;
			this.match(CashScriptParser.Identifier);
			this.state = 79;
			this.parameterList();
			this.state = 80;
			this.match(CashScriptParser.T__11);
			this.state = 84;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while (_la===14) {
				{
				{
				this.state = 81;
				this.functionDefinition();
				}
				}
				this.state = 86;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			}
			this.state = 87;
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
			this.state = 89;
			this.match(CashScriptParser.T__13);
			this.state = 90;
			this.match(CashScriptParser.Identifier);
			this.state = 91;
			this.parameterList();
			this.state = 92;
			this.match(CashScriptParser.T__11);
			this.state = 96;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while (_la===18 || _la===19 || ((((_la - 51)) & ~0x1F) === 0 && ((1 << (_la - 51)) & 132159) !== 0)) {
				{
				{
				this.state = 93;
				this.statement();
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
	public parameterList(): ParameterListContext {
		let localctx: ParameterListContext = new ParameterListContext(this, this._ctx, this.state);
		this.enterRule(localctx, 16, CashScriptParser.RULE_parameterList);
		let _la: number;
		try {
			let _alt: number;
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 101;
			this.match(CashScriptParser.T__14);
			this.state = 113;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (((((_la - 51)) & ~0x1F) === 0 && ((1 << (_la - 51)) & 1087) !== 0)) {
				{
				this.state = 102;
				this.parameter();
				this.state = 107;
				this._errHandler.sync(this);
				_alt = this._interp.adaptivePredict(this._input, 5, this._ctx);
				while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
					if (_alt === 1) {
						{
						{
						this.state = 103;
						this.match(CashScriptParser.T__15);
						this.state = 104;
						this.parameter();
						}
						}
					}
					this.state = 109;
					this._errHandler.sync(this);
					_alt = this._interp.adaptivePredict(this._input, 5, this._ctx);
				}
				this.state = 111;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la===16) {
					{
					this.state = 110;
					this.match(CashScriptParser.T__15);
					}
				}

				}
			}

			this.state = 115;
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
			this.state = 117;
			this.typeName();
			this.state = 118;
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
			this.state = 129;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case 12:
				this.enterOuterAlt(localctx, 1);
				{
				this.state = 120;
				this.match(CashScriptParser.T__11);
				this.state = 124;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				while (_la===18 || _la===19 || ((((_la - 51)) & ~0x1F) === 0 && ((1 << (_la - 51)) & 132159) !== 0)) {
					{
					{
					this.state = 121;
					this.statement();
					}
					}
					this.state = 126;
					this._errHandler.sync(this);
					_la = this._input.LA(1);
				}
				this.state = 127;
				this.match(CashScriptParser.T__12);
				}
				break;
			case 18:
			case 19:
			case 51:
			case 52:
			case 53:
			case 54:
			case 55:
			case 56:
			case 61:
			case 68:
				this.enterOuterAlt(localctx, 2);
				{
				this.state = 128;
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
			this.state = 137;
			this._errHandler.sync(this);
			switch ( this._interp.adaptivePredict(this._input, 10, this._ctx) ) {
			case 1:
				this.enterOuterAlt(localctx, 1);
				{
				this.state = 131;
				this.variableDefinition();
				}
				break;
			case 2:
				this.enterOuterAlt(localctx, 2);
				{
				this.state = 132;
				this.tupleAssignment();
				}
				break;
			case 3:
				this.enterOuterAlt(localctx, 3);
				{
				this.state = 133;
				this.assignStatement();
				}
				break;
			case 4:
				this.enterOuterAlt(localctx, 4);
				{
				this.state = 134;
				this.timeOpStatement();
				}
				break;
			case 5:
				this.enterOuterAlt(localctx, 5);
				{
				this.state = 135;
				this.requireStatement();
				}
				break;
			case 6:
				this.enterOuterAlt(localctx, 6);
				{
				this.state = 136;
				this.ifStatement();
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
			this.state = 139;
			this.typeName();
			this.state = 143;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while (_la===50) {
				{
				{
				this.state = 140;
				this.modifier();
				}
				}
				this.state = 145;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			}
			this.state = 146;
			this.match(CashScriptParser.Identifier);
			this.state = 147;
			this.match(CashScriptParser.T__9);
			this.state = 148;
			this.expression(0);
			this.state = 149;
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
			this.state = 151;
			this.typeName();
			this.state = 152;
			this.match(CashScriptParser.Identifier);
			this.state = 153;
			this.match(CashScriptParser.T__15);
			this.state = 154;
			this.typeName();
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
	public assignStatement(): AssignStatementContext {
		let localctx: AssignStatementContext = new AssignStatementContext(this, this._ctx, this.state);
		this.enterRule(localctx, 28, CashScriptParser.RULE_assignStatement);
		try {
			this.enterOuterAlt(localctx, 1);
			{
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
	public timeOpStatement(): TimeOpStatementContext {
		let localctx: TimeOpStatementContext = new TimeOpStatementContext(this, this._ctx, this.state);
		this.enterRule(localctx, 30, CashScriptParser.RULE_timeOpStatement);
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 165;
			this.match(CashScriptParser.T__17);
			this.state = 166;
			this.match(CashScriptParser.T__14);
			this.state = 167;
			this.match(CashScriptParser.TxVar);
			this.state = 168;
			this.match(CashScriptParser.T__5);
			this.state = 169;
			this.expression(0);
			this.state = 170;
			this.match(CashScriptParser.T__16);
			this.state = 171;
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
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 173;
			this.match(CashScriptParser.T__17);
			this.state = 174;
			this.match(CashScriptParser.T__14);
			this.state = 175;
			this.expression(0);
			this.state = 176;
			this.match(CashScriptParser.T__16);
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
	public ifStatement(): IfStatementContext {
		let localctx: IfStatementContext = new IfStatementContext(this, this._ctx, this.state);
		this.enterRule(localctx, 34, CashScriptParser.RULE_ifStatement);
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 179;
			this.match(CashScriptParser.T__18);
			this.state = 180;
			this.match(CashScriptParser.T__14);
			this.state = 181;
			this.expression(0);
			this.state = 182;
			this.match(CashScriptParser.T__16);
			this.state = 183;
			localctx._ifBlock = this.block();
			this.state = 186;
			this._errHandler.sync(this);
			switch ( this._interp.adaptivePredict(this._input, 12, this._ctx) ) {
			case 1:
				{
				this.state = 184;
				this.match(CashScriptParser.T__19);
				this.state = 185;
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
	public functionCall(): FunctionCallContext {
		let localctx: FunctionCallContext = new FunctionCallContext(this, this._ctx, this.state);
		this.enterRule(localctx, 36, CashScriptParser.RULE_functionCall);
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 188;
			this.match(CashScriptParser.Identifier);
			this.state = 189;
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
		this.enterRule(localctx, 38, CashScriptParser.RULE_expressionList);
		let _la: number;
		try {
			let _alt: number;
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 191;
			this.match(CashScriptParser.T__14);
			this.state = 203;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if ((((_la) & ~0x1F) === 0 && ((1 << _la) & 1096843264) !== 0) || ((((_la - 38)) & ~0x1F) === 0 && ((1 << (_la - 38)) & 1859641347) !== 0)) {
				{
				this.state = 192;
				this.expression(0);
				this.state = 197;
				this._errHandler.sync(this);
				_alt = this._interp.adaptivePredict(this._input, 13, this._ctx);
				while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
					if (_alt === 1) {
						{
						{
						this.state = 193;
						this.match(CashScriptParser.T__15);
						this.state = 194;
						this.expression(0);
						}
						}
					}
					this.state = 199;
					this._errHandler.sync(this);
					_alt = this._interp.adaptivePredict(this._input, 13, this._ctx);
				}
				this.state = 201;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la===16) {
					{
					this.state = 200;
					this.match(CashScriptParser.T__15);
					}
				}

				}
			}

			this.state = 205;
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
		let _startState: number = 40;
		this.enterRecursionRule(localctx, 40, CashScriptParser.RULE_expression, _p);
		let _la: number;
		try {
			let _alt: number;
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 260;
			this._errHandler.sync(this);
			switch ( this._interp.adaptivePredict(this._input, 21, this._ctx) ) {
			case 1:
				{
				localctx = new ParenthesisedContext(this, localctx);
				this._ctx = localctx;
				_prevctx = localctx;

				this.state = 208;
				this.match(CashScriptParser.T__14);
				this.state = 209;
				this.expression(0);
				this.state = 210;
				this.match(CashScriptParser.T__16);
				}
				break;
			case 2:
				{
				localctx = new CastContext(this, localctx);
				this._ctx = localctx;
				_prevctx = localctx;
				this.state = 212;
				this.typeName();
				this.state = 213;
				this.match(CashScriptParser.T__14);
				this.state = 214;
				(localctx as CastContext)._castable = this.expression(0);
				this.state = 217;
				this._errHandler.sync(this);
				switch ( this._interp.adaptivePredict(this._input, 16, this._ctx) ) {
				case 1:
					{
					this.state = 215;
					this.match(CashScriptParser.T__15);
					this.state = 216;
					(localctx as CastContext)._size = this.expression(0);
					}
					break;
				}
				this.state = 220;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la===16) {
					{
					this.state = 219;
					this.match(CashScriptParser.T__15);
					}
				}

				this.state = 222;
				this.match(CashScriptParser.T__16);
				}
				break;
			case 3:
				{
				localctx = new FunctionCallExpressionContext(this, localctx);
				this._ctx = localctx;
				_prevctx = localctx;
				this.state = 224;
				this.functionCall();
				}
				break;
			case 4:
				{
				localctx = new InstantiationContext(this, localctx);
				this._ctx = localctx;
				_prevctx = localctx;
				this.state = 225;
				this.match(CashScriptParser.T__20);
				this.state = 226;
				this.match(CashScriptParser.Identifier);
				this.state = 227;
				this.expressionList();
				}
				break;
			case 5:
				{
				localctx = new UnaryIntrospectionOpContext(this, localctx);
				this._ctx = localctx;
				_prevctx = localctx;
				this.state = 228;
				(localctx as UnaryIntrospectionOpContext)._scope = this.match(CashScriptParser.T__23);
				this.state = 229;
				this.match(CashScriptParser.T__21);
				this.state = 230;
				this.expression(0);
				this.state = 231;
				this.match(CashScriptParser.T__22);
				this.state = 232;
				(localctx as UnaryIntrospectionOpContext)._op = this._input.LT(1);
				_la = this._input.LA(1);
				if(!((((_la) & ~0x1F) === 0 && ((1 << _la) & 1040187392) !== 0))) {
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
				this.state = 234;
				(localctx as UnaryIntrospectionOpContext)._scope = this.match(CashScriptParser.T__29);
				this.state = 235;
				this.match(CashScriptParser.T__21);
				this.state = 236;
				this.expression(0);
				this.state = 237;
				this.match(CashScriptParser.T__22);
				this.state = 238;
				(localctx as UnaryIntrospectionOpContext)._op = this._input.LT(1);
				_la = this._input.LA(1);
				if(!(((((_la - 25)) & ~0x1F) === 0 && ((1 << (_la - 25)) & 991) !== 0))) {
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
				this.state = 240;
				(localctx as UnaryOpContext)._op = this._input.LT(1);
				_la = this._input.LA(1);
				if(!(_la===38 || _la===39)) {
				    (localctx as UnaryOpContext)._op = this._errHandler.recoverInline(this);
				}
				else {
					this._errHandler.reportMatch(this);
				    this.consume();
				}
				this.state = 241;
				this.expression(14);
				}
				break;
			case 8:
				{
				localctx = new ArrayContext(this, localctx);
				this._ctx = localctx;
				_prevctx = localctx;
				this.state = 242;
				this.match(CashScriptParser.T__21);
				this.state = 254;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if ((((_la) & ~0x1F) === 0 && ((1 << _la) & 1096843264) !== 0) || ((((_la - 38)) & ~0x1F) === 0 && ((1 << (_la - 38)) & 1859641347) !== 0)) {
					{
					this.state = 243;
					this.expression(0);
					this.state = 248;
					this._errHandler.sync(this);
					_alt = this._interp.adaptivePredict(this._input, 18, this._ctx);
					while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
						if (_alt === 1) {
							{
							{
							this.state = 244;
							this.match(CashScriptParser.T__15);
							this.state = 245;
							this.expression(0);
							}
							}
						}
						this.state = 250;
						this._errHandler.sync(this);
						_alt = this._interp.adaptivePredict(this._input, 18, this._ctx);
					}
					this.state = 252;
					this._errHandler.sync(this);
					_la = this._input.LA(1);
					if (_la===16) {
						{
						this.state = 251;
						this.match(CashScriptParser.T__15);
						}
					}

					}
				}

				this.state = 256;
				this.match(CashScriptParser.T__22);
				}
				break;
			case 9:
				{
				localctx = new NullaryOpContext(this, localctx);
				this._ctx = localctx;
				_prevctx = localctx;
				this.state = 257;
				this.match(CashScriptParser.NullaryOp);
				}
				break;
			case 10:
				{
				localctx = new IdentifierContext(this, localctx);
				this._ctx = localctx;
				_prevctx = localctx;
				this.state = 258;
				this.match(CashScriptParser.Identifier);
				}
				break;
			case 11:
				{
				localctx = new LiteralExpressionContext(this, localctx);
				this._ctx = localctx;
				_prevctx = localctx;
				this.state = 259;
				this.literal();
				}
				break;
			}
			this._ctx.stop = this._input.LT(-1);
			this.state = 303;
			this._errHandler.sync(this);
			_alt = this._interp.adaptivePredict(this._input, 23, this._ctx);
			while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
				if (_alt === 1) {
					if (this._parseListeners != null) {
						this.triggerExitRuleEvent();
					}
					_prevctx = localctx;
					{
					this.state = 301;
					this._errHandler.sync(this);
					switch ( this._interp.adaptivePredict(this._input, 22, this._ctx) ) {
					case 1:
						{
						localctx = new BinaryOpContext(this, new ExpressionContext(this, _parentctx, _parentState));
						(localctx as BinaryOpContext)._left = _prevctx;
						this.pushNewRecursionContext(localctx, _startState, CashScriptParser.RULE_expression);
						this.state = 262;
						if (!(this.precpred(this._ctx, 13))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 13)");
						}
						this.state = 263;
						(localctx as BinaryOpContext)._op = this._input.LT(1);
						_la = this._input.LA(1);
						if(!(((((_la - 40)) & ~0x1F) === 0 && ((1 << (_la - 40)) & 7) !== 0))) {
						    (localctx as BinaryOpContext)._op = this._errHandler.recoverInline(this);
						}
						else {
							this._errHandler.reportMatch(this);
						    this.consume();
						}
						this.state = 264;
						(localctx as BinaryOpContext)._right = this.expression(14);
						}
						break;
					case 2:
						{
						localctx = new BinaryOpContext(this, new ExpressionContext(this, _parentctx, _parentState));
						(localctx as BinaryOpContext)._left = _prevctx;
						this.pushNewRecursionContext(localctx, _startState, CashScriptParser.RULE_expression);
						this.state = 265;
						if (!(this.precpred(this._ctx, 12))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 12)");
						}
						this.state = 266;
						(localctx as BinaryOpContext)._op = this._input.LT(1);
						_la = this._input.LA(1);
						if(!(_la===39 || _la===43)) {
						    (localctx as BinaryOpContext)._op = this._errHandler.recoverInline(this);
						}
						else {
							this._errHandler.reportMatch(this);
						    this.consume();
						}
						this.state = 267;
						(localctx as BinaryOpContext)._right = this.expression(13);
						}
						break;
					case 3:
						{
						localctx = new BinaryOpContext(this, new ExpressionContext(this, _parentctx, _parentState));
						(localctx as BinaryOpContext)._left = _prevctx;
						this.pushNewRecursionContext(localctx, _startState, CashScriptParser.RULE_expression);
						this.state = 268;
						if (!(this.precpred(this._ctx, 11))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 11)");
						}
						this.state = 269;
						(localctx as BinaryOpContext)._op = this._input.LT(1);
						_la = this._input.LA(1);
						if(!((((_la) & ~0x1F) === 0 && ((1 << _la) & 960) !== 0))) {
						    (localctx as BinaryOpContext)._op = this._errHandler.recoverInline(this);
						}
						else {
							this._errHandler.reportMatch(this);
						    this.consume();
						}
						this.state = 270;
						(localctx as BinaryOpContext)._right = this.expression(12);
						}
						break;
					case 4:
						{
						localctx = new BinaryOpContext(this, new ExpressionContext(this, _parentctx, _parentState));
						(localctx as BinaryOpContext)._left = _prevctx;
						this.pushNewRecursionContext(localctx, _startState, CashScriptParser.RULE_expression);
						this.state = 271;
						if (!(this.precpred(this._ctx, 10))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 10)");
						}
						this.state = 272;
						(localctx as BinaryOpContext)._op = this._input.LT(1);
						_la = this._input.LA(1);
						if(!(_la===44 || _la===45)) {
						    (localctx as BinaryOpContext)._op = this._errHandler.recoverInline(this);
						}
						else {
							this._errHandler.reportMatch(this);
						    this.consume();
						}
						this.state = 273;
						(localctx as BinaryOpContext)._right = this.expression(11);
						}
						break;
					case 5:
						{
						localctx = new BinaryOpContext(this, new ExpressionContext(this, _parentctx, _parentState));
						(localctx as BinaryOpContext)._left = _prevctx;
						this.pushNewRecursionContext(localctx, _startState, CashScriptParser.RULE_expression);
						this.state = 274;
						if (!(this.precpred(this._ctx, 9))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 9)");
						}
						this.state = 275;
						(localctx as BinaryOpContext)._op = this.match(CashScriptParser.T__45);
						this.state = 276;
						(localctx as BinaryOpContext)._right = this.expression(10);
						}
						break;
					case 6:
						{
						localctx = new BinaryOpContext(this, new ExpressionContext(this, _parentctx, _parentState));
						(localctx as BinaryOpContext)._left = _prevctx;
						this.pushNewRecursionContext(localctx, _startState, CashScriptParser.RULE_expression);
						this.state = 277;
						if (!(this.precpred(this._ctx, 8))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 8)");
						}
						this.state = 278;
						(localctx as BinaryOpContext)._op = this.match(CashScriptParser.T__3);
						this.state = 279;
						(localctx as BinaryOpContext)._right = this.expression(9);
						}
						break;
					case 7:
						{
						localctx = new BinaryOpContext(this, new ExpressionContext(this, _parentctx, _parentState));
						(localctx as BinaryOpContext)._left = _prevctx;
						this.pushNewRecursionContext(localctx, _startState, CashScriptParser.RULE_expression);
						this.state = 280;
						if (!(this.precpred(this._ctx, 7))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 7)");
						}
						this.state = 281;
						(localctx as BinaryOpContext)._op = this.match(CashScriptParser.T__46);
						this.state = 282;
						(localctx as BinaryOpContext)._right = this.expression(8);
						}
						break;
					case 8:
						{
						localctx = new BinaryOpContext(this, new ExpressionContext(this, _parentctx, _parentState));
						(localctx as BinaryOpContext)._left = _prevctx;
						this.pushNewRecursionContext(localctx, _startState, CashScriptParser.RULE_expression);
						this.state = 283;
						if (!(this.precpred(this._ctx, 6))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 6)");
						}
						this.state = 284;
						(localctx as BinaryOpContext)._op = this.match(CashScriptParser.T__47);
						this.state = 285;
						(localctx as BinaryOpContext)._right = this.expression(7);
						}
						break;
					case 9:
						{
						localctx = new BinaryOpContext(this, new ExpressionContext(this, _parentctx, _parentState));
						(localctx as BinaryOpContext)._left = _prevctx;
						this.pushNewRecursionContext(localctx, _startState, CashScriptParser.RULE_expression);
						this.state = 286;
						if (!(this.precpred(this._ctx, 5))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 5)");
						}
						this.state = 287;
						(localctx as BinaryOpContext)._op = this.match(CashScriptParser.T__48);
						this.state = 288;
						(localctx as BinaryOpContext)._right = this.expression(6);
						}
						break;
					case 10:
						{
						localctx = new TupleIndexOpContext(this, new ExpressionContext(this, _parentctx, _parentState));
						this.pushNewRecursionContext(localctx, _startState, CashScriptParser.RULE_expression);
						this.state = 289;
						if (!(this.precpred(this._ctx, 19))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 19)");
						}
						this.state = 290;
						this.match(CashScriptParser.T__21);
						this.state = 291;
						(localctx as TupleIndexOpContext)._index = this.match(CashScriptParser.NumberLiteral);
						this.state = 292;
						this.match(CashScriptParser.T__22);
						}
						break;
					case 11:
						{
						localctx = new UnaryOpContext(this, new ExpressionContext(this, _parentctx, _parentState));
						this.pushNewRecursionContext(localctx, _startState, CashScriptParser.RULE_expression);
						this.state = 293;
						if (!(this.precpred(this._ctx, 16))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 16)");
						}
						this.state = 294;
						(localctx as UnaryOpContext)._op = this._input.LT(1);
						_la = this._input.LA(1);
						if(!(_la===35 || _la===36)) {
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
						this.state = 295;
						if (!(this.precpred(this._ctx, 15))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 15)");
						}
						this.state = 296;
						(localctx as BinaryOpContext)._op = this.match(CashScriptParser.T__36);
						this.state = 297;
						this.match(CashScriptParser.T__14);
						this.state = 298;
						(localctx as BinaryOpContext)._right = this.expression(0);
						this.state = 299;
						this.match(CashScriptParser.T__16);
						}
						break;
					}
					}
				}
				this.state = 305;
				this._errHandler.sync(this);
				_alt = this._interp.adaptivePredict(this._input, 23, this._ctx);
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
		this.enterRule(localctx, 42, CashScriptParser.RULE_modifier);
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 306;
			this.match(CashScriptParser.T__49);
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
		this.enterRule(localctx, 44, CashScriptParser.RULE_literal);
		try {
			this.state = 313;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case 58:
				this.enterOuterAlt(localctx, 1);
				{
				this.state = 308;
				this.match(CashScriptParser.BooleanLiteral);
				}
				break;
			case 60:
				this.enterOuterAlt(localctx, 2);
				{
				this.state = 309;
				this.numberLiteral();
				}
				break;
			case 63:
				this.enterOuterAlt(localctx, 3);
				{
				this.state = 310;
				this.match(CashScriptParser.StringLiteral);
				}
				break;
			case 64:
				this.enterOuterAlt(localctx, 4);
				{
				this.state = 311;
				this.match(CashScriptParser.DateLiteral);
				}
				break;
			case 65:
				this.enterOuterAlt(localctx, 5);
				{
				this.state = 312;
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
		this.enterRule(localctx, 46, CashScriptParser.RULE_numberLiteral);
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 315;
			this.match(CashScriptParser.NumberLiteral);
			this.state = 317;
			this._errHandler.sync(this);
			switch ( this._interp.adaptivePredict(this._input, 25, this._ctx) ) {
			case 1:
				{
				this.state = 316;
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
		this.enterRule(localctx, 48, CashScriptParser.RULE_typeName);
		let _la: number;
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 319;
			_la = this._input.LA(1);
			if(!(((((_la - 51)) & ~0x1F) === 0 && ((1 << (_la - 51)) & 1087) !== 0))) {
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
		case 20:
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
			return this.precpred(this._ctx, 19);
		case 10:
			return this.precpred(this._ctx, 16);
		case 11:
			return this.precpred(this._ctx, 15);
		}
		return true;
	}

	public static readonly _serializedATN: number[] = [4,1,71,322,2,0,7,0,2,
	1,7,1,2,2,7,2,2,3,7,3,2,4,7,4,2,5,7,5,2,6,7,6,2,7,7,7,2,8,7,8,2,9,7,9,2,
	10,7,10,2,11,7,11,2,12,7,12,2,13,7,13,2,14,7,14,2,15,7,15,2,16,7,16,2,17,
	7,17,2,18,7,18,2,19,7,19,2,20,7,20,2,21,7,21,2,22,7,22,2,23,7,23,2,24,7,
	24,1,0,5,0,52,8,0,10,0,12,0,55,9,0,1,0,1,0,1,0,1,1,1,1,1,1,1,1,1,1,1,2,
	1,2,1,3,1,3,3,3,69,8,3,1,4,3,4,72,8,4,1,4,1,4,1,5,1,5,1,6,1,6,1,6,1,6,1,
	6,5,6,83,8,6,10,6,12,6,86,9,6,1,6,1,6,1,7,1,7,1,7,1,7,1,7,5,7,95,8,7,10,
	7,12,7,98,9,7,1,7,1,7,1,8,1,8,1,8,1,8,5,8,106,8,8,10,8,12,8,109,9,8,1,8,
	3,8,112,8,8,3,8,114,8,8,1,8,1,8,1,9,1,9,1,9,1,10,1,10,5,10,123,8,10,10,
	10,12,10,126,9,10,1,10,1,10,3,10,130,8,10,1,11,1,11,1,11,1,11,1,11,1,11,
	3,11,138,8,11,1,12,1,12,5,12,142,8,12,10,12,12,12,145,9,12,1,12,1,12,1,
	12,1,12,1,12,1,13,1,13,1,13,1,13,1,13,1,13,1,13,1,13,1,13,1,14,1,14,1,14,
	1,14,1,14,1,15,1,15,1,15,1,15,1,15,1,15,1,15,1,15,1,16,1,16,1,16,1,16,1,
	16,1,16,1,17,1,17,1,17,1,17,1,17,1,17,1,17,3,17,187,8,17,1,18,1,18,1,18,
	1,19,1,19,1,19,1,19,5,19,196,8,19,10,19,12,19,199,9,19,1,19,3,19,202,8,
	19,3,19,204,8,19,1,19,1,19,1,20,1,20,1,20,1,20,1,20,1,20,1,20,1,20,1,20,
	1,20,3,20,218,8,20,1,20,3,20,221,8,20,1,20,1,20,1,20,1,20,1,20,1,20,1,20,
	1,20,1,20,1,20,1,20,1,20,1,20,1,20,1,20,1,20,1,20,1,20,1,20,1,20,1,20,1,
	20,1,20,1,20,5,20,247,8,20,10,20,12,20,250,9,20,1,20,3,20,253,8,20,3,20,
	255,8,20,1,20,1,20,1,20,1,20,3,20,261,8,20,1,20,1,20,1,20,1,20,1,20,1,20,
	1,20,1,20,1,20,1,20,1,20,1,20,1,20,1,20,1,20,1,20,1,20,1,20,1,20,1,20,1,
	20,1,20,1,20,1,20,1,20,1,20,1,20,1,20,1,20,1,20,1,20,1,20,1,20,1,20,1,20,
	1,20,1,20,1,20,1,20,5,20,302,8,20,10,20,12,20,305,9,20,1,21,1,21,1,22,1,
	22,1,22,1,22,1,22,3,22,314,8,22,1,23,1,23,3,23,318,8,23,1,24,1,24,1,24,
	0,1,40,25,0,2,4,6,8,10,12,14,16,18,20,22,24,26,28,30,32,34,36,38,40,42,
	44,46,48,0,10,1,0,4,10,1,0,25,29,2,0,25,29,31,34,1,0,38,39,1,0,40,42,2,
	0,39,39,43,43,1,0,6,9,1,0,44,45,1,0,35,36,2,0,51,56,61,61,348,0,53,1,0,
	0,0,2,59,1,0,0,0,4,64,1,0,0,0,6,66,1,0,0,0,8,71,1,0,0,0,10,75,1,0,0,0,12,
	77,1,0,0,0,14,89,1,0,0,0,16,101,1,0,0,0,18,117,1,0,0,0,20,129,1,0,0,0,22,
	137,1,0,0,0,24,139,1,0,0,0,26,151,1,0,0,0,28,160,1,0,0,0,30,165,1,0,0,0,
	32,173,1,0,0,0,34,179,1,0,0,0,36,188,1,0,0,0,38,191,1,0,0,0,40,260,1,0,
	0,0,42,306,1,0,0,0,44,313,1,0,0,0,46,315,1,0,0,0,48,319,1,0,0,0,50,52,3,
	2,1,0,51,50,1,0,0,0,52,55,1,0,0,0,53,51,1,0,0,0,53,54,1,0,0,0,54,56,1,0,
	0,0,55,53,1,0,0,0,56,57,3,12,6,0,57,58,5,0,0,1,58,1,1,0,0,0,59,60,5,1,0,
	0,60,61,3,4,2,0,61,62,3,6,3,0,62,63,5,2,0,0,63,3,1,0,0,0,64,65,5,3,0,0,
	65,5,1,0,0,0,66,68,3,8,4,0,67,69,3,8,4,0,68,67,1,0,0,0,68,69,1,0,0,0,69,
	7,1,0,0,0,70,72,3,10,5,0,71,70,1,0,0,0,71,72,1,0,0,0,72,73,1,0,0,0,73,74,
	5,57,0,0,74,9,1,0,0,0,75,76,7,0,0,0,76,11,1,0,0,0,77,78,5,11,0,0,78,79,
	5,68,0,0,79,80,3,16,8,0,80,84,5,12,0,0,81,83,3,14,7,0,82,81,1,0,0,0,83,
	86,1,0,0,0,84,82,1,0,0,0,84,85,1,0,0,0,85,87,1,0,0,0,86,84,1,0,0,0,87,88,
	5,13,0,0,88,13,1,0,0,0,89,90,5,14,0,0,90,91,5,68,0,0,91,92,3,16,8,0,92,
	96,5,12,0,0,93,95,3,22,11,0,94,93,1,0,0,0,95,98,1,0,0,0,96,94,1,0,0,0,96,
	97,1,0,0,0,97,99,1,0,0,0,98,96,1,0,0,0,99,100,5,13,0,0,100,15,1,0,0,0,101,
	113,5,15,0,0,102,107,3,18,9,0,103,104,5,16,0,0,104,106,3,18,9,0,105,103,
	1,0,0,0,106,109,1,0,0,0,107,105,1,0,0,0,107,108,1,0,0,0,108,111,1,0,0,0,
	109,107,1,0,0,0,110,112,5,16,0,0,111,110,1,0,0,0,111,112,1,0,0,0,112,114,
	1,0,0,0,113,102,1,0,0,0,113,114,1,0,0,0,114,115,1,0,0,0,115,116,5,17,0,
	0,116,17,1,0,0,0,117,118,3,48,24,0,118,119,5,68,0,0,119,19,1,0,0,0,120,
	124,5,12,0,0,121,123,3,22,11,0,122,121,1,0,0,0,123,126,1,0,0,0,124,122,
	1,0,0,0,124,125,1,0,0,0,125,127,1,0,0,0,126,124,1,0,0,0,127,130,5,13,0,
	0,128,130,3,22,11,0,129,120,1,0,0,0,129,128,1,0,0,0,130,21,1,0,0,0,131,
	138,3,24,12,0,132,138,3,26,13,0,133,138,3,28,14,0,134,138,3,30,15,0,135,
	138,3,32,16,0,136,138,3,34,17,0,137,131,1,0,0,0,137,132,1,0,0,0,137,133,
	1,0,0,0,137,134,1,0,0,0,137,135,1,0,0,0,137,136,1,0,0,0,138,23,1,0,0,0,
	139,143,3,48,24,0,140,142,3,42,21,0,141,140,1,0,0,0,142,145,1,0,0,0,143,
	141,1,0,0,0,143,144,1,0,0,0,144,146,1,0,0,0,145,143,1,0,0,0,146,147,5,68,
	0,0,147,148,5,10,0,0,148,149,3,40,20,0,149,150,5,2,0,0,150,25,1,0,0,0,151,
	152,3,48,24,0,152,153,5,68,0,0,153,154,5,16,0,0,154,155,3,48,24,0,155,156,
	5,68,0,0,156,157,5,10,0,0,157,158,3,40,20,0,158,159,5,2,0,0,159,27,1,0,
	0,0,160,161,5,68,0,0,161,162,5,10,0,0,162,163,3,40,20,0,163,164,5,2,0,0,
	164,29,1,0,0,0,165,166,5,18,0,0,166,167,5,15,0,0,167,168,5,66,0,0,168,169,
	5,6,0,0,169,170,3,40,20,0,170,171,5,17,0,0,171,172,5,2,0,0,172,31,1,0,0,
	0,173,174,5,18,0,0,174,175,5,15,0,0,175,176,3,40,20,0,176,177,5,17,0,0,
	177,178,5,2,0,0,178,33,1,0,0,0,179,180,5,19,0,0,180,181,5,15,0,0,181,182,
	3,40,20,0,182,183,5,17,0,0,183,186,3,20,10,0,184,185,5,20,0,0,185,187,3,
	20,10,0,186,184,1,0,0,0,186,187,1,0,0,0,187,35,1,0,0,0,188,189,5,68,0,0,
	189,190,3,38,19,0,190,37,1,0,0,0,191,203,5,15,0,0,192,197,3,40,20,0,193,
	194,5,16,0,0,194,196,3,40,20,0,195,193,1,0,0,0,196,199,1,0,0,0,197,195,
	1,0,0,0,197,198,1,0,0,0,198,201,1,0,0,0,199,197,1,0,0,0,200,202,5,16,0,
	0,201,200,1,0,0,0,201,202,1,0,0,0,202,204,1,0,0,0,203,192,1,0,0,0,203,204,
	1,0,0,0,204,205,1,0,0,0,205,206,5,17,0,0,206,39,1,0,0,0,207,208,6,20,-1,
	0,208,209,5,15,0,0,209,210,3,40,20,0,210,211,5,17,0,0,211,261,1,0,0,0,212,
	213,3,48,24,0,213,214,5,15,0,0,214,217,3,40,20,0,215,216,5,16,0,0,216,218,
	3,40,20,0,217,215,1,0,0,0,217,218,1,0,0,0,218,220,1,0,0,0,219,221,5,16,
	0,0,220,219,1,0,0,0,220,221,1,0,0,0,221,222,1,0,0,0,222,223,5,17,0,0,223,
	261,1,0,0,0,224,261,3,36,18,0,225,226,5,21,0,0,226,227,5,68,0,0,227,261,
	3,38,19,0,228,229,5,24,0,0,229,230,5,22,0,0,230,231,3,40,20,0,231,232,5,
	23,0,0,232,233,7,1,0,0,233,261,1,0,0,0,234,235,5,30,0,0,235,236,5,22,0,
	0,236,237,3,40,20,0,237,238,5,23,0,0,238,239,7,2,0,0,239,261,1,0,0,0,240,
	241,7,3,0,0,241,261,3,40,20,14,242,254,5,22,0,0,243,248,3,40,20,0,244,245,
	5,16,0,0,245,247,3,40,20,0,246,244,1,0,0,0,247,250,1,0,0,0,248,246,1,0,
	0,0,248,249,1,0,0,0,249,252,1,0,0,0,250,248,1,0,0,0,251,253,5,16,0,0,252,
	251,1,0,0,0,252,253,1,0,0,0,253,255,1,0,0,0,254,243,1,0,0,0,254,255,1,0,
	0,0,255,256,1,0,0,0,256,261,5,23,0,0,257,261,5,67,0,0,258,261,5,68,0,0,
	259,261,3,44,22,0,260,207,1,0,0,0,260,212,1,0,0,0,260,224,1,0,0,0,260,225,
	1,0,0,0,260,228,1,0,0,0,260,234,1,0,0,0,260,240,1,0,0,0,260,242,1,0,0,0,
	260,257,1,0,0,0,260,258,1,0,0,0,260,259,1,0,0,0,261,303,1,0,0,0,262,263,
	10,13,0,0,263,264,7,4,0,0,264,302,3,40,20,14,265,266,10,12,0,0,266,267,
	7,5,0,0,267,302,3,40,20,13,268,269,10,11,0,0,269,270,7,6,0,0,270,302,3,
	40,20,12,271,272,10,10,0,0,272,273,7,7,0,0,273,302,3,40,20,11,274,275,10,
	9,0,0,275,276,5,46,0,0,276,302,3,40,20,10,277,278,10,8,0,0,278,279,5,4,
	0,0,279,302,3,40,20,9,280,281,10,7,0,0,281,282,5,47,0,0,282,302,3,40,20,
	8,283,284,10,6,0,0,284,285,5,48,0,0,285,302,3,40,20,7,286,287,10,5,0,0,
	287,288,5,49,0,0,288,302,3,40,20,6,289,290,10,19,0,0,290,291,5,22,0,0,291,
	292,5,60,0,0,292,302,5,23,0,0,293,294,10,16,0,0,294,302,7,8,0,0,295,296,
	10,15,0,0,296,297,5,37,0,0,297,298,5,15,0,0,298,299,3,40,20,0,299,300,5,
	17,0,0,300,302,1,0,0,0,301,262,1,0,0,0,301,265,1,0,0,0,301,268,1,0,0,0,
	301,271,1,0,0,0,301,274,1,0,0,0,301,277,1,0,0,0,301,280,1,0,0,0,301,283,
	1,0,0,0,301,286,1,0,0,0,301,289,1,0,0,0,301,293,1,0,0,0,301,295,1,0,0,0,
	302,305,1,0,0,0,303,301,1,0,0,0,303,304,1,0,0,0,304,41,1,0,0,0,305,303,
	1,0,0,0,306,307,5,50,0,0,307,43,1,0,0,0,308,314,5,58,0,0,309,314,3,46,23,
	0,310,314,5,63,0,0,311,314,5,64,0,0,312,314,5,65,0,0,313,308,1,0,0,0,313,
	309,1,0,0,0,313,310,1,0,0,0,313,311,1,0,0,0,313,312,1,0,0,0,314,45,1,0,
	0,0,315,317,5,60,0,0,316,318,5,59,0,0,317,316,1,0,0,0,317,318,1,0,0,0,318,
	47,1,0,0,0,319,320,7,9,0,0,320,49,1,0,0,0,26,53,68,71,84,96,107,111,113,
	124,129,137,143,186,197,201,203,217,220,248,252,254,260,301,303,313,317];

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
