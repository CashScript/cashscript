// Generated from src/grammar/CashScript.g4 by ANTLR 4.13.2
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
	public static readonly T__62 = 63;
	public static readonly VersionLiteral = 64;
	public static readonly BooleanLiteral = 65;
	public static readonly NumberUnit = 66;
	public static readonly NumberLiteral = 67;
	public static readonly NumberPart = 68;
	public static readonly ExponentPart = 69;
	public static readonly PrimitiveType = 70;
	public static readonly UnboundedBytes = 71;
	public static readonly BoundedBytes = 72;
	public static readonly Bound = 73;
	public static readonly StringLiteral = 74;
	public static readonly DateLiteral = 75;
	public static readonly HexLiteral = 76;
	public static readonly TxVar = 77;
	public static readonly UnsafeCast = 78;
	public static readonly NullaryOp = 79;
	public static readonly Identifier = 80;
	public static readonly WHITESPACE = 81;
	public static readonly COMMENT = 82;
	public static readonly LINE_COMMENT = 83;
	public static override readonly EOF = Token.EOF;
	public static readonly RULE_sourceFile = 0;
	public static readonly RULE_pragmaDirective = 1;
	public static readonly RULE_pragmaName = 2;
	public static readonly RULE_pragmaValue = 3;
	public static readonly RULE_versionConstraint = 4;
	public static readonly RULE_versionOperator = 5;
	public static readonly RULE_contractDefinition = 6;
	public static readonly RULE_functionDefinition = 7;
	public static readonly RULE_functionBody = 8;
	public static readonly RULE_parameterList = 9;
	public static readonly RULE_parameter = 10;
	public static readonly RULE_block = 11;
	public static readonly RULE_statement = 12;
	public static readonly RULE_nonControlStatement = 13;
	public static readonly RULE_returnStatement = 14;
	public static readonly RULE_controlStatement = 15;
	public static readonly RULE_variableDefinition = 16;
	public static readonly RULE_tupleAssignment = 17;
	public static readonly RULE_assignStatement = 18;
	public static readonly RULE_timeOpStatement = 19;
	public static readonly RULE_requireStatement = 20;
	public static readonly RULE_consoleStatement = 21;
	public static readonly RULE_ifStatement = 22;
	public static readonly RULE_loopStatement = 23;
	public static readonly RULE_doWhileStatement = 24;
	public static readonly RULE_whileStatement = 25;
	public static readonly RULE_forStatement = 26;
	public static readonly RULE_forInit = 27;
	public static readonly RULE_requireMessage = 28;
	public static readonly RULE_consoleParameter = 29;
	public static readonly RULE_consoleParameterList = 30;
	public static readonly RULE_functionCall = 31;
	public static readonly RULE_expressionList = 32;
	public static readonly RULE_expression = 33;
	public static readonly RULE_modifier = 34;
	public static readonly RULE_literal = 35;
	public static readonly RULE_numberLiteral = 36;
	public static readonly RULE_typeName = 37;
	public static readonly RULE_typeCast = 38;
	public static readonly literalNames: (string | null)[] = [ null, "'pragma'", 
                                                            "';'", "'cashscript'", 
                                                            "'^'", "'~'", 
                                                            "'>='", "'>'", 
                                                            "'<'", "'<='", 
                                                            "'='", "'contract'", 
                                                            "'{'", "'}'", 
                                                            "'function'", 
                                                            "'returns'", 
                                                            "'('", "','", 
                                                            "')'", "'return'", 
                                                            "'+='", "'-='", 
                                                            "'++'", "'--'", 
                                                            "'require'", 
                                                            "'console.log'", 
                                                            "'if'", "'else'", 
                                                            "'do'", "'while'", 
                                                            "'for'", "'new'", 
                                                            "'['", "']'", 
                                                            "'tx.outputs'", 
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
                                                            null, null, 
                                                            null, null, 
                                                            null, null, 
                                                            null, "'bytes'" ];
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
                                                             null, null, 
                                                             "VersionLiteral", 
                                                             "BooleanLiteral", 
                                                             "NumberUnit", 
                                                             "NumberLiteral", 
                                                             "NumberPart", 
                                                             "ExponentPart", 
                                                             "PrimitiveType", 
                                                             "UnboundedBytes", 
                                                             "BoundedBytes", 
                                                             "Bound", "StringLiteral", 
                                                             "DateLiteral", 
                                                             "HexLiteral", 
                                                             "TxVar", "UnsafeCast", 
                                                             "NullaryOp", 
                                                             "Identifier", 
                                                             "WHITESPACE", 
                                                             "COMMENT", 
                                                             "LINE_COMMENT" ];
	// tslint:disable:no-trailing-whitespace
	public static readonly ruleNames: string[] = [
		"sourceFile", "pragmaDirective", "pragmaName", "pragmaValue", "versionConstraint", 
		"versionOperator", "contractDefinition", "functionDefinition", "functionBody", 
		"parameterList", "parameter", "block", "statement", "nonControlStatement", 
		"returnStatement", "controlStatement", "variableDefinition", "tupleAssignment", 
		"assignStatement", "timeOpStatement", "requireStatement", "consoleStatement", 
		"ifStatement", "loopStatement", "doWhileStatement", "whileStatement", 
		"forStatement", "forInit", "requireMessage", "consoleParameter", "consoleParameterList", 
		"functionCall", "expressionList", "expression", "modifier", "literal", 
		"numberLiteral", "typeName", "typeCast",
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
			this.state = 81;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while (_la===1) {
				{
				{
				this.state = 78;
				this.pragmaDirective();
				}
				}
				this.state = 83;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			}
			this.state = 84;
			this.contractDefinition();
			this.state = 85;
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
			this.state = 87;
			this.match(CashScriptParser.T__0);
			this.state = 88;
			this.pragmaName();
			this.state = 89;
			this.pragmaValue();
			this.state = 90;
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
			this.state = 92;
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
			this.state = 94;
			this.versionConstraint();
			this.state = 96;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if ((((_la) & ~0x1F) === 0 && ((1 << _la) & 2032) !== 0) || _la===64) {
				{
				this.state = 95;
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
			this.state = 99;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if ((((_la) & ~0x1F) === 0 && ((1 << _la) & 2032) !== 0)) {
				{
				this.state = 98;
				this.versionOperator();
				}
			}

			this.state = 101;
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
			this.state = 103;
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
			this.state = 105;
			this.match(CashScriptParser.T__10);
			this.state = 106;
			this.match(CashScriptParser.Identifier);
			this.state = 107;
			this.parameterList();
			this.state = 108;
			this.match(CashScriptParser.T__11);
			this.state = 112;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while (_la===14) {
				{
				{
				this.state = 109;
				this.functionDefinition();
				}
				}
				this.state = 114;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			}
			this.state = 115;
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
			this.state = 117;
			this.match(CashScriptParser.T__13);
			this.state = 118;
			this.match(CashScriptParser.Identifier);
			this.state = 119;
			this.parameterList();
			this.state = 132;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la===15) {
				{
				this.state = 120;
				this.match(CashScriptParser.T__14);
				this.state = 121;
				this.match(CashScriptParser.T__15);
				this.state = 122;
				this.typeName();
				this.state = 127;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				while (_la===17) {
					{
					{
					this.state = 123;
					this.match(CashScriptParser.T__16);
					this.state = 124;
					this.typeName();
					}
					}
					this.state = 129;
					this._errHandler.sync(this);
					_la = this._input.LA(1);
				}
				this.state = 130;
				this.match(CashScriptParser.T__17);
				}
			}

			this.state = 134;
			this.functionBody();
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
	public functionBody(): FunctionBodyContext {
		let localctx: FunctionBodyContext = new FunctionBodyContext(this, this._ctx, this.state);
		this.enterRule(localctx, 16, CashScriptParser.RULE_functionBody);
		let _la: number;
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 136;
			this.match(CashScriptParser.T__11);
			this.state = 140;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while ((((_la) & ~0x1F) === 0 && ((1 << _la) & 1997078528) !== 0) || ((((_la - 70)) & ~0x1F) === 0 && ((1 << (_la - 70)) & 1031) !== 0)) {
				{
				{
				this.state = 137;
				this.statement();
				}
				}
				this.state = 142;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			}
			this.state = 143;
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
		this.enterRule(localctx, 18, CashScriptParser.RULE_parameterList);
		let _la: number;
		try {
			let _alt: number;
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 145;
			this.match(CashScriptParser.T__15);
			this.state = 157;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (((((_la - 70)) & ~0x1F) === 0 && ((1 << (_la - 70)) & 7) !== 0)) {
				{
				this.state = 146;
				this.parameter();
				this.state = 151;
				this._errHandler.sync(this);
				_alt = this._interp.adaptivePredict(this._input, 7, this._ctx);
				while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
					if (_alt === 1) {
						{
						{
						this.state = 147;
						this.match(CashScriptParser.T__16);
						this.state = 148;
						this.parameter();
						}
						}
					}
					this.state = 153;
					this._errHandler.sync(this);
					_alt = this._interp.adaptivePredict(this._input, 7, this._ctx);
				}
				this.state = 155;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la===17) {
					{
					this.state = 154;
					this.match(CashScriptParser.T__16);
					}
				}

				}
			}

			this.state = 159;
			this.match(CashScriptParser.T__17);
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
		this.enterRule(localctx, 20, CashScriptParser.RULE_parameter);
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 161;
			this.typeName();
			this.state = 162;
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
		this.enterRule(localctx, 22, CashScriptParser.RULE_block);
		let _la: number;
		try {
			this.state = 173;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case 12:
				this.enterOuterAlt(localctx, 1);
				{
				this.state = 164;
				this.match(CashScriptParser.T__11);
				this.state = 168;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				while ((((_la) & ~0x1F) === 0 && ((1 << _la) & 1997078528) !== 0) || ((((_la - 70)) & ~0x1F) === 0 && ((1 << (_la - 70)) & 1031) !== 0)) {
					{
					{
					this.state = 165;
					this.statement();
					}
					}
					this.state = 170;
					this._errHandler.sync(this);
					_la = this._input.LA(1);
				}
				this.state = 171;
				this.match(CashScriptParser.T__12);
				}
				break;
			case 16:
			case 19:
			case 24:
			case 25:
			case 26:
			case 28:
			case 29:
			case 30:
			case 70:
			case 71:
			case 72:
			case 80:
				this.enterOuterAlt(localctx, 2);
				{
				this.state = 172;
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
		this.enterRule(localctx, 24, CashScriptParser.RULE_statement);
		try {
			this.state = 179;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case 26:
			case 28:
			case 29:
			case 30:
				this.enterOuterAlt(localctx, 1);
				{
				this.state = 175;
				this.controlStatement();
				}
				break;
			case 16:
			case 19:
			case 24:
			case 25:
			case 70:
			case 71:
			case 72:
			case 80:
				this.enterOuterAlt(localctx, 2);
				{
				this.state = 176;
				this.nonControlStatement();
				this.state = 177;
				this.match(CashScriptParser.T__1);
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
	public nonControlStatement(): NonControlStatementContext {
		let localctx: NonControlStatementContext = new NonControlStatementContext(this, this._ctx, this.state);
		this.enterRule(localctx, 26, CashScriptParser.RULE_nonControlStatement);
		try {
			this.state = 188;
			this._errHandler.sync(this);
			switch ( this._interp.adaptivePredict(this._input, 13, this._ctx) ) {
			case 1:
				this.enterOuterAlt(localctx, 1);
				{
				this.state = 181;
				this.variableDefinition();
				}
				break;
			case 2:
				this.enterOuterAlt(localctx, 2);
				{
				this.state = 182;
				this.tupleAssignment();
				}
				break;
			case 3:
				this.enterOuterAlt(localctx, 3);
				{
				this.state = 183;
				this.assignStatement();
				}
				break;
			case 4:
				this.enterOuterAlt(localctx, 4);
				{
				this.state = 184;
				this.timeOpStatement();
				}
				break;
			case 5:
				this.enterOuterAlt(localctx, 5);
				{
				this.state = 185;
				this.requireStatement();
				}
				break;
			case 6:
				this.enterOuterAlt(localctx, 6);
				{
				this.state = 186;
				this.consoleStatement();
				}
				break;
			case 7:
				this.enterOuterAlt(localctx, 7);
				{
				this.state = 187;
				this.returnStatement();
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
	public returnStatement(): ReturnStatementContext {
		let localctx: ReturnStatementContext = new ReturnStatementContext(this, this._ctx, this.state);
		this.enterRule(localctx, 28, CashScriptParser.RULE_returnStatement);
		let _la: number;
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 190;
			this.match(CashScriptParser.T__18);
			this.state = 191;
			this.expression(0);
			this.state = 196;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while (_la===17) {
				{
				{
				this.state = 192;
				this.match(CashScriptParser.T__16);
				this.state = 193;
				this.expression(0);
				}
				}
				this.state = 198;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
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
	public controlStatement(): ControlStatementContext {
		let localctx: ControlStatementContext = new ControlStatementContext(this, this._ctx, this.state);
		this.enterRule(localctx, 30, CashScriptParser.RULE_controlStatement);
		try {
			this.state = 201;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case 26:
				this.enterOuterAlt(localctx, 1);
				{
				this.state = 199;
				this.ifStatement();
				}
				break;
			case 28:
			case 29:
			case 30:
				this.enterOuterAlt(localctx, 2);
				{
				this.state = 200;
				this.loopStatement();
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
	public variableDefinition(): VariableDefinitionContext {
		let localctx: VariableDefinitionContext = new VariableDefinitionContext(this, this._ctx, this.state);
		this.enterRule(localctx, 32, CashScriptParser.RULE_variableDefinition);
		let _la: number;
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 203;
			this.typeName();
			this.state = 207;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while (_la===63) {
				{
				{
				this.state = 204;
				this.modifier();
				}
				}
				this.state = 209;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			}
			this.state = 210;
			this.match(CashScriptParser.Identifier);
			this.state = 211;
			this.match(CashScriptParser.T__9);
			this.state = 212;
			this.expression(0);
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
		this.enterRule(localctx, 34, CashScriptParser.RULE_tupleAssignment);
		let _la: number;
		try {
			this.state = 242;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case 70:
			case 71:
			case 72:
				this.enterOuterAlt(localctx, 1);
				{
				this.state = 214;
				this.typeName();
				this.state = 215;
				this.match(CashScriptParser.Identifier);
				this.state = 220;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				do {
					{
					{
					this.state = 216;
					this.match(CashScriptParser.T__16);
					this.state = 217;
					this.typeName();
					this.state = 218;
					this.match(CashScriptParser.Identifier);
					}
					}
					this.state = 222;
					this._errHandler.sync(this);
					_la = this._input.LA(1);
				} while (_la===17);
				this.state = 224;
				this.match(CashScriptParser.T__9);
				this.state = 225;
				this.expression(0);
				}
				break;
			case 16:
				this.enterOuterAlt(localctx, 2);
				{
				this.state = 227;
				this.match(CashScriptParser.T__15);
				this.state = 228;
				this.typeName();
				this.state = 229;
				this.match(CashScriptParser.Identifier);
				this.state = 234;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				do {
					{
					{
					this.state = 230;
					this.match(CashScriptParser.T__16);
					this.state = 231;
					this.typeName();
					this.state = 232;
					this.match(CashScriptParser.Identifier);
					}
					}
					this.state = 236;
					this._errHandler.sync(this);
					_la = this._input.LA(1);
				} while (_la===17);
				this.state = 238;
				this.match(CashScriptParser.T__17);
				this.state = 239;
				this.match(CashScriptParser.T__9);
				this.state = 240;
				this.expression(0);
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
	public assignStatement(): AssignStatementContext {
		let localctx: AssignStatementContext = new AssignStatementContext(this, this._ctx, this.state);
		this.enterRule(localctx, 36, CashScriptParser.RULE_assignStatement);
		let _la: number;
		try {
			this.state = 249;
			this._errHandler.sync(this);
			switch ( this._interp.adaptivePredict(this._input, 20, this._ctx) ) {
			case 1:
				this.enterOuterAlt(localctx, 1);
				{
				this.state = 244;
				this.match(CashScriptParser.Identifier);
				this.state = 245;
				localctx._op = this._input.LT(1);
				_la = this._input.LA(1);
				if(!((((_la) & ~0x1F) === 0 && ((1 << _la) & 3146752) !== 0))) {
				    localctx._op = this._errHandler.recoverInline(this);
				}
				else {
					this._errHandler.reportMatch(this);
				    this.consume();
				}
				this.state = 246;
				this.expression(0);
				}
				break;
			case 2:
				this.enterOuterAlt(localctx, 2);
				{
				this.state = 247;
				this.match(CashScriptParser.Identifier);
				this.state = 248;
				localctx._op = this._input.LT(1);
				_la = this._input.LA(1);
				if(!(_la===22 || _la===23)) {
				    localctx._op = this._errHandler.recoverInline(this);
				}
				else {
					this._errHandler.reportMatch(this);
				    this.consume();
				}
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
	public timeOpStatement(): TimeOpStatementContext {
		let localctx: TimeOpStatementContext = new TimeOpStatementContext(this, this._ctx, this.state);
		this.enterRule(localctx, 38, CashScriptParser.RULE_timeOpStatement);
		let _la: number;
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 251;
			this.match(CashScriptParser.T__23);
			this.state = 252;
			this.match(CashScriptParser.T__15);
			this.state = 253;
			this.match(CashScriptParser.TxVar);
			this.state = 254;
			this.match(CashScriptParser.T__5);
			this.state = 255;
			this.expression(0);
			this.state = 258;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la===17) {
				{
				this.state = 256;
				this.match(CashScriptParser.T__16);
				this.state = 257;
				this.requireMessage();
				}
			}

			this.state = 260;
			this.match(CashScriptParser.T__17);
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
		this.enterRule(localctx, 40, CashScriptParser.RULE_requireStatement);
		let _la: number;
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 262;
			this.match(CashScriptParser.T__23);
			this.state = 263;
			this.match(CashScriptParser.T__15);
			this.state = 264;
			this.expression(0);
			this.state = 267;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la===17) {
				{
				this.state = 265;
				this.match(CashScriptParser.T__16);
				this.state = 266;
				this.requireMessage();
				}
			}

			this.state = 269;
			this.match(CashScriptParser.T__17);
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
		this.enterRule(localctx, 42, CashScriptParser.RULE_consoleStatement);
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 271;
			this.match(CashScriptParser.T__24);
			this.state = 272;
			this.consoleParameterList();
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
		this.enterRule(localctx, 44, CashScriptParser.RULE_ifStatement);
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 274;
			this.match(CashScriptParser.T__25);
			this.state = 275;
			this.match(CashScriptParser.T__15);
			this.state = 276;
			this.expression(0);
			this.state = 277;
			this.match(CashScriptParser.T__17);
			this.state = 278;
			localctx._ifBlock = this.block();
			this.state = 281;
			this._errHandler.sync(this);
			switch ( this._interp.adaptivePredict(this._input, 23, this._ctx) ) {
			case 1:
				{
				this.state = 279;
				this.match(CashScriptParser.T__26);
				this.state = 280;
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
		this.enterRule(localctx, 46, CashScriptParser.RULE_loopStatement);
		try {
			this.state = 286;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case 28:
				this.enterOuterAlt(localctx, 1);
				{
				this.state = 283;
				this.doWhileStatement();
				}
				break;
			case 29:
				this.enterOuterAlt(localctx, 2);
				{
				this.state = 284;
				this.whileStatement();
				}
				break;
			case 30:
				this.enterOuterAlt(localctx, 3);
				{
				this.state = 285;
				this.forStatement();
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
	public doWhileStatement(): DoWhileStatementContext {
		let localctx: DoWhileStatementContext = new DoWhileStatementContext(this, this._ctx, this.state);
		this.enterRule(localctx, 48, CashScriptParser.RULE_doWhileStatement);
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 288;
			this.match(CashScriptParser.T__27);
			this.state = 289;
			this.block();
			this.state = 290;
			this.match(CashScriptParser.T__28);
			this.state = 291;
			this.match(CashScriptParser.T__15);
			this.state = 292;
			this.expression(0);
			this.state = 293;
			this.match(CashScriptParser.T__17);
			this.state = 294;
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
	public whileStatement(): WhileStatementContext {
		let localctx: WhileStatementContext = new WhileStatementContext(this, this._ctx, this.state);
		this.enterRule(localctx, 50, CashScriptParser.RULE_whileStatement);
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 296;
			this.match(CashScriptParser.T__28);
			this.state = 297;
			this.match(CashScriptParser.T__15);
			this.state = 298;
			this.expression(0);
			this.state = 299;
			this.match(CashScriptParser.T__17);
			this.state = 300;
			this.block();
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
	public forStatement(): ForStatementContext {
		let localctx: ForStatementContext = new ForStatementContext(this, this._ctx, this.state);
		this.enterRule(localctx, 52, CashScriptParser.RULE_forStatement);
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 302;
			this.match(CashScriptParser.T__29);
			this.state = 303;
			this.match(CashScriptParser.T__15);
			this.state = 304;
			this.forInit();
			this.state = 305;
			this.match(CashScriptParser.T__1);
			this.state = 306;
			this.expression(0);
			this.state = 307;
			this.match(CashScriptParser.T__1);
			this.state = 308;
			this.assignStatement();
			this.state = 309;
			this.match(CashScriptParser.T__17);
			this.state = 310;
			this.block();
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
	public forInit(): ForInitContext {
		let localctx: ForInitContext = new ForInitContext(this, this._ctx, this.state);
		this.enterRule(localctx, 54, CashScriptParser.RULE_forInit);
		try {
			this.state = 314;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case 70:
			case 71:
			case 72:
				this.enterOuterAlt(localctx, 1);
				{
				this.state = 312;
				this.variableDefinition();
				}
				break;
			case 80:
				this.enterOuterAlt(localctx, 2);
				{
				this.state = 313;
				this.assignStatement();
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
	public requireMessage(): RequireMessageContext {
		let localctx: RequireMessageContext = new RequireMessageContext(this, this._ctx, this.state);
		this.enterRule(localctx, 56, CashScriptParser.RULE_requireMessage);
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 316;
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
		this.enterRule(localctx, 58, CashScriptParser.RULE_consoleParameter);
		try {
			this.state = 320;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case 80:
				this.enterOuterAlt(localctx, 1);
				{
				this.state = 318;
				this.match(CashScriptParser.Identifier);
				}
				break;
			case 65:
			case 67:
			case 74:
			case 75:
			case 76:
				this.enterOuterAlt(localctx, 2);
				{
				this.state = 319;
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
		this.enterRule(localctx, 60, CashScriptParser.RULE_consoleParameterList);
		let _la: number;
		try {
			let _alt: number;
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 322;
			this.match(CashScriptParser.T__15);
			this.state = 334;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (((((_la - 65)) & ~0x1F) === 0 && ((1 << (_la - 65)) & 36357) !== 0)) {
				{
				this.state = 323;
				this.consoleParameter();
				this.state = 328;
				this._errHandler.sync(this);
				_alt = this._interp.adaptivePredict(this._input, 27, this._ctx);
				while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
					if (_alt === 1) {
						{
						{
						this.state = 324;
						this.match(CashScriptParser.T__16);
						this.state = 325;
						this.consoleParameter();
						}
						}
					}
					this.state = 330;
					this._errHandler.sync(this);
					_alt = this._interp.adaptivePredict(this._input, 27, this._ctx);
				}
				this.state = 332;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la===17) {
					{
					this.state = 331;
					this.match(CashScriptParser.T__16);
					}
				}

				}
			}

			this.state = 336;
			this.match(CashScriptParser.T__17);
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
		this.enterRule(localctx, 62, CashScriptParser.RULE_functionCall);
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 338;
			this.match(CashScriptParser.Identifier);
			this.state = 339;
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
		this.enterRule(localctx, 64, CashScriptParser.RULE_expressionList);
		let _la: number;
		try {
			let _alt: number;
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 341;
			this.match(CashScriptParser.T__15);
			this.state = 353;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if ((((_la) & ~0x1F) === 0 && ((1 << _la) & 2147549216) !== 0) || ((((_la - 32)) & ~0x1F) === 0 && ((1 << (_la - 32)) & 393477) !== 0) || ((((_la - 65)) & ~0x1F) === 0 && ((1 << (_la - 65)) & 61029) !== 0)) {
				{
				this.state = 342;
				this.expression(0);
				this.state = 347;
				this._errHandler.sync(this);
				_alt = this._interp.adaptivePredict(this._input, 30, this._ctx);
				while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
					if (_alt === 1) {
						{
						{
						this.state = 343;
						this.match(CashScriptParser.T__16);
						this.state = 344;
						this.expression(0);
						}
						}
					}
					this.state = 349;
					this._errHandler.sync(this);
					_alt = this._interp.adaptivePredict(this._input, 30, this._ctx);
				}
				this.state = 351;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la===17) {
					{
					this.state = 350;
					this.match(CashScriptParser.T__16);
					}
				}

				}
			}

			this.state = 355;
			this.match(CashScriptParser.T__17);
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
		let _startState: number = 66;
		this.enterRecursionRule(localctx, 66, CashScriptParser.RULE_expression, _p);
		let _la: number;
		try {
			let _alt: number;
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 406;
			this._errHandler.sync(this);
			switch ( this._interp.adaptivePredict(this._input, 37, this._ctx) ) {
			case 1:
				{
				localctx = new ParenthesisedContext(this, localctx);
				this._ctx = localctx;
				_prevctx = localctx;

				this.state = 358;
				this.match(CashScriptParser.T__15);
				this.state = 359;
				this.expression(0);
				this.state = 360;
				this.match(CashScriptParser.T__17);
				}
				break;
			case 2:
				{
				localctx = new CastContext(this, localctx);
				this._ctx = localctx;
				_prevctx = localctx;
				this.state = 362;
				this.typeCast();
				this.state = 363;
				this.match(CashScriptParser.T__15);
				this.state = 364;
				(localctx as CastContext)._castable = this.expression(0);
				this.state = 366;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la===17) {
					{
					this.state = 365;
					this.match(CashScriptParser.T__16);
					}
				}

				this.state = 368;
				this.match(CashScriptParser.T__17);
				}
				break;
			case 3:
				{
				localctx = new FunctionCallExpressionContext(this, localctx);
				this._ctx = localctx;
				_prevctx = localctx;
				this.state = 370;
				this.functionCall();
				}
				break;
			case 4:
				{
				localctx = new InstantiationContext(this, localctx);
				this._ctx = localctx;
				_prevctx = localctx;
				this.state = 371;
				this.match(CashScriptParser.T__30);
				this.state = 372;
				this.match(CashScriptParser.Identifier);
				this.state = 373;
				this.expressionList();
				}
				break;
			case 5:
				{
				localctx = new UnaryIntrospectionOpContext(this, localctx);
				this._ctx = localctx;
				_prevctx = localctx;
				this.state = 374;
				(localctx as UnaryIntrospectionOpContext)._scope = this.match(CashScriptParser.T__33);
				this.state = 375;
				this.match(CashScriptParser.T__31);
				this.state = 376;
				this.expression(0);
				this.state = 377;
				this.match(CashScriptParser.T__32);
				this.state = 378;
				(localctx as UnaryIntrospectionOpContext)._op = this._input.LT(1);
				_la = this._input.LA(1);
				if(!(((((_la - 35)) & ~0x1F) === 0 && ((1 << (_la - 35)) & 31) !== 0))) {
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
				this.state = 380;
				(localctx as UnaryIntrospectionOpContext)._scope = this.match(CashScriptParser.T__39);
				this.state = 381;
				this.match(CashScriptParser.T__31);
				this.state = 382;
				this.expression(0);
				this.state = 383;
				this.match(CashScriptParser.T__32);
				this.state = 384;
				(localctx as UnaryIntrospectionOpContext)._op = this._input.LT(1);
				_la = this._input.LA(1);
				if(!(((((_la - 35)) & ~0x1F) === 0 && ((1 << (_la - 35)) & 991) !== 0))) {
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
				this.state = 386;
				(localctx as UnaryOpContext)._op = this._input.LT(1);
				_la = this._input.LA(1);
				if(!(_la===5 || _la===49 || _la===50)) {
				    (localctx as UnaryOpContext)._op = this._errHandler.recoverInline(this);
				}
				else {
					this._errHandler.reportMatch(this);
				    this.consume();
				}
				this.state = 387;
				this.expression(15);
				}
				break;
			case 8:
				{
				localctx = new ArrayContext(this, localctx);
				this._ctx = localctx;
				_prevctx = localctx;
				this.state = 388;
				this.match(CashScriptParser.T__31);
				this.state = 400;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if ((((_la) & ~0x1F) === 0 && ((1 << _la) & 2147549216) !== 0) || ((((_la - 32)) & ~0x1F) === 0 && ((1 << (_la - 32)) & 393477) !== 0) || ((((_la - 65)) & ~0x1F) === 0 && ((1 << (_la - 65)) & 61029) !== 0)) {
					{
					this.state = 389;
					this.expression(0);
					this.state = 394;
					this._errHandler.sync(this);
					_alt = this._interp.adaptivePredict(this._input, 34, this._ctx);
					while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
						if (_alt === 1) {
							{
							{
							this.state = 390;
							this.match(CashScriptParser.T__16);
							this.state = 391;
							this.expression(0);
							}
							}
						}
						this.state = 396;
						this._errHandler.sync(this);
						_alt = this._interp.adaptivePredict(this._input, 34, this._ctx);
					}
					this.state = 398;
					this._errHandler.sync(this);
					_la = this._input.LA(1);
					if (_la===17) {
						{
						this.state = 397;
						this.match(CashScriptParser.T__16);
						}
					}

					}
				}

				this.state = 402;
				this.match(CashScriptParser.T__32);
				}
				break;
			case 9:
				{
				localctx = new NullaryOpContext(this, localctx);
				this._ctx = localctx;
				_prevctx = localctx;
				this.state = 403;
				this.match(CashScriptParser.NullaryOp);
				}
				break;
			case 10:
				{
				localctx = new IdentifierContext(this, localctx);
				this._ctx = localctx;
				_prevctx = localctx;
				this.state = 404;
				this.match(CashScriptParser.Identifier);
				}
				break;
			case 11:
				{
				localctx = new LiteralExpressionContext(this, localctx);
				this._ctx = localctx;
				_prevctx = localctx;
				this.state = 405;
				this.literal();
				}
				break;
			}
			this._ctx.stop = this._input.LT(-1);
			this.state = 460;
			this._errHandler.sync(this);
			_alt = this._interp.adaptivePredict(this._input, 39, this._ctx);
			while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
				if (_alt === 1) {
					if (this._parseListeners != null) {
						this.triggerExitRuleEvent();
					}
					_prevctx = localctx;
					{
					this.state = 458;
					this._errHandler.sync(this);
					switch ( this._interp.adaptivePredict(this._input, 38, this._ctx) ) {
					case 1:
						{
						localctx = new BinaryOpContext(this, new ExpressionContext(this, _parentctx, _parentState));
						(localctx as BinaryOpContext)._left = _prevctx;
						this.pushNewRecursionContext(localctx, _startState, CashScriptParser.RULE_expression);
						this.state = 408;
						if (!(this.precpred(this._ctx, 14))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 14)");
						}
						this.state = 409;
						(localctx as BinaryOpContext)._op = this._input.LT(1);
						_la = this._input.LA(1);
						if(!(((((_la - 51)) & ~0x1F) === 0 && ((1 << (_la - 51)) & 7) !== 0))) {
						    (localctx as BinaryOpContext)._op = this._errHandler.recoverInline(this);
						}
						else {
							this._errHandler.reportMatch(this);
						    this.consume();
						}
						this.state = 410;
						(localctx as BinaryOpContext)._right = this.expression(15);
						}
						break;
					case 2:
						{
						localctx = new BinaryOpContext(this, new ExpressionContext(this, _parentctx, _parentState));
						(localctx as BinaryOpContext)._left = _prevctx;
						this.pushNewRecursionContext(localctx, _startState, CashScriptParser.RULE_expression);
						this.state = 411;
						if (!(this.precpred(this._ctx, 13))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 13)");
						}
						this.state = 412;
						(localctx as BinaryOpContext)._op = this._input.LT(1);
						_la = this._input.LA(1);
						if(!(_la===50 || _la===54)) {
						    (localctx as BinaryOpContext)._op = this._errHandler.recoverInline(this);
						}
						else {
							this._errHandler.reportMatch(this);
						    this.consume();
						}
						this.state = 413;
						(localctx as BinaryOpContext)._right = this.expression(14);
						}
						break;
					case 3:
						{
						localctx = new BinaryOpContext(this, new ExpressionContext(this, _parentctx, _parentState));
						(localctx as BinaryOpContext)._left = _prevctx;
						this.pushNewRecursionContext(localctx, _startState, CashScriptParser.RULE_expression);
						this.state = 414;
						if (!(this.precpred(this._ctx, 12))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 12)");
						}
						this.state = 415;
						(localctx as BinaryOpContext)._op = this._input.LT(1);
						_la = this._input.LA(1);
						if(!(_la===55 || _la===56)) {
						    (localctx as BinaryOpContext)._op = this._errHandler.recoverInline(this);
						}
						else {
							this._errHandler.reportMatch(this);
						    this.consume();
						}
						this.state = 416;
						(localctx as BinaryOpContext)._right = this.expression(13);
						}
						break;
					case 4:
						{
						localctx = new BinaryOpContext(this, new ExpressionContext(this, _parentctx, _parentState));
						(localctx as BinaryOpContext)._left = _prevctx;
						this.pushNewRecursionContext(localctx, _startState, CashScriptParser.RULE_expression);
						this.state = 417;
						if (!(this.precpred(this._ctx, 11))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 11)");
						}
						this.state = 418;
						(localctx as BinaryOpContext)._op = this._input.LT(1);
						_la = this._input.LA(1);
						if(!((((_la) & ~0x1F) === 0 && ((1 << _la) & 960) !== 0))) {
						    (localctx as BinaryOpContext)._op = this._errHandler.recoverInline(this);
						}
						else {
							this._errHandler.reportMatch(this);
						    this.consume();
						}
						this.state = 419;
						(localctx as BinaryOpContext)._right = this.expression(12);
						}
						break;
					case 5:
						{
						localctx = new BinaryOpContext(this, new ExpressionContext(this, _parentctx, _parentState));
						(localctx as BinaryOpContext)._left = _prevctx;
						this.pushNewRecursionContext(localctx, _startState, CashScriptParser.RULE_expression);
						this.state = 420;
						if (!(this.precpred(this._ctx, 10))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 10)");
						}
						this.state = 421;
						(localctx as BinaryOpContext)._op = this._input.LT(1);
						_la = this._input.LA(1);
						if(!(_la===57 || _la===58)) {
						    (localctx as BinaryOpContext)._op = this._errHandler.recoverInline(this);
						}
						else {
							this._errHandler.reportMatch(this);
						    this.consume();
						}
						this.state = 422;
						(localctx as BinaryOpContext)._right = this.expression(11);
						}
						break;
					case 6:
						{
						localctx = new BinaryOpContext(this, new ExpressionContext(this, _parentctx, _parentState));
						(localctx as BinaryOpContext)._left = _prevctx;
						this.pushNewRecursionContext(localctx, _startState, CashScriptParser.RULE_expression);
						this.state = 423;
						if (!(this.precpred(this._ctx, 9))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 9)");
						}
						this.state = 424;
						(localctx as BinaryOpContext)._op = this.match(CashScriptParser.T__58);
						this.state = 425;
						(localctx as BinaryOpContext)._right = this.expression(10);
						}
						break;
					case 7:
						{
						localctx = new BinaryOpContext(this, new ExpressionContext(this, _parentctx, _parentState));
						(localctx as BinaryOpContext)._left = _prevctx;
						this.pushNewRecursionContext(localctx, _startState, CashScriptParser.RULE_expression);
						this.state = 426;
						if (!(this.precpred(this._ctx, 8))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 8)");
						}
						this.state = 427;
						(localctx as BinaryOpContext)._op = this.match(CashScriptParser.T__3);
						this.state = 428;
						(localctx as BinaryOpContext)._right = this.expression(9);
						}
						break;
					case 8:
						{
						localctx = new BinaryOpContext(this, new ExpressionContext(this, _parentctx, _parentState));
						(localctx as BinaryOpContext)._left = _prevctx;
						this.pushNewRecursionContext(localctx, _startState, CashScriptParser.RULE_expression);
						this.state = 429;
						if (!(this.precpred(this._ctx, 7))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 7)");
						}
						this.state = 430;
						(localctx as BinaryOpContext)._op = this.match(CashScriptParser.T__59);
						this.state = 431;
						(localctx as BinaryOpContext)._right = this.expression(8);
						}
						break;
					case 9:
						{
						localctx = new BinaryOpContext(this, new ExpressionContext(this, _parentctx, _parentState));
						(localctx as BinaryOpContext)._left = _prevctx;
						this.pushNewRecursionContext(localctx, _startState, CashScriptParser.RULE_expression);
						this.state = 432;
						if (!(this.precpred(this._ctx, 6))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 6)");
						}
						this.state = 433;
						(localctx as BinaryOpContext)._op = this.match(CashScriptParser.T__60);
						this.state = 434;
						(localctx as BinaryOpContext)._right = this.expression(7);
						}
						break;
					case 10:
						{
						localctx = new BinaryOpContext(this, new ExpressionContext(this, _parentctx, _parentState));
						(localctx as BinaryOpContext)._left = _prevctx;
						this.pushNewRecursionContext(localctx, _startState, CashScriptParser.RULE_expression);
						this.state = 435;
						if (!(this.precpred(this._ctx, 5))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 5)");
						}
						this.state = 436;
						(localctx as BinaryOpContext)._op = this.match(CashScriptParser.T__61);
						this.state = 437;
						(localctx as BinaryOpContext)._right = this.expression(6);
						}
						break;
					case 11:
						{
						localctx = new TupleIndexOpContext(this, new ExpressionContext(this, _parentctx, _parentState));
						this.pushNewRecursionContext(localctx, _startState, CashScriptParser.RULE_expression);
						this.state = 438;
						if (!(this.precpred(this._ctx, 21))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 21)");
						}
						this.state = 439;
						this.match(CashScriptParser.T__31);
						this.state = 440;
						(localctx as TupleIndexOpContext)._index = this.match(CashScriptParser.NumberLiteral);
						this.state = 441;
						this.match(CashScriptParser.T__32);
						}
						break;
					case 12:
						{
						localctx = new UnaryOpContext(this, new ExpressionContext(this, _parentctx, _parentState));
						this.pushNewRecursionContext(localctx, _startState, CashScriptParser.RULE_expression);
						this.state = 442;
						if (!(this.precpred(this._ctx, 18))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 18)");
						}
						this.state = 443;
						(localctx as UnaryOpContext)._op = this._input.LT(1);
						_la = this._input.LA(1);
						if(!(_la===45 || _la===46)) {
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
						this.state = 444;
						if (!(this.precpred(this._ctx, 17))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 17)");
						}
						this.state = 445;
						(localctx as BinaryOpContext)._op = this.match(CashScriptParser.T__46);
						this.state = 446;
						this.match(CashScriptParser.T__15);
						this.state = 447;
						(localctx as BinaryOpContext)._right = this.expression(0);
						this.state = 448;
						this.match(CashScriptParser.T__17);
						}
						break;
					case 14:
						{
						localctx = new SliceContext(this, new ExpressionContext(this, _parentctx, _parentState));
						(localctx as SliceContext)._element = _prevctx;
						this.pushNewRecursionContext(localctx, _startState, CashScriptParser.RULE_expression);
						this.state = 450;
						if (!(this.precpred(this._ctx, 16))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 16)");
						}
						this.state = 451;
						this.match(CashScriptParser.T__47);
						this.state = 452;
						this.match(CashScriptParser.T__15);
						this.state = 453;
						(localctx as SliceContext)._start = this.expression(0);
						this.state = 454;
						this.match(CashScriptParser.T__16);
						this.state = 455;
						(localctx as SliceContext)._end = this.expression(0);
						this.state = 456;
						this.match(CashScriptParser.T__17);
						}
						break;
					}
					}
				}
				this.state = 462;
				this._errHandler.sync(this);
				_alt = this._interp.adaptivePredict(this._input, 39, this._ctx);
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
		this.enterRule(localctx, 68, CashScriptParser.RULE_modifier);
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 463;
			this.match(CashScriptParser.T__62);
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
		this.enterRule(localctx, 70, CashScriptParser.RULE_literal);
		try {
			this.state = 470;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case 65:
				this.enterOuterAlt(localctx, 1);
				{
				this.state = 465;
				this.match(CashScriptParser.BooleanLiteral);
				}
				break;
			case 67:
				this.enterOuterAlt(localctx, 2);
				{
				this.state = 466;
				this.numberLiteral();
				}
				break;
			case 74:
				this.enterOuterAlt(localctx, 3);
				{
				this.state = 467;
				this.match(CashScriptParser.StringLiteral);
				}
				break;
			case 75:
				this.enterOuterAlt(localctx, 4);
				{
				this.state = 468;
				this.match(CashScriptParser.DateLiteral);
				}
				break;
			case 76:
				this.enterOuterAlt(localctx, 5);
				{
				this.state = 469;
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
		this.enterRule(localctx, 72, CashScriptParser.RULE_numberLiteral);
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 472;
			this.match(CashScriptParser.NumberLiteral);
			this.state = 474;
			this._errHandler.sync(this);
			switch ( this._interp.adaptivePredict(this._input, 41, this._ctx) ) {
			case 1:
				{
				this.state = 473;
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
		this.enterRule(localctx, 74, CashScriptParser.RULE_typeName);
		let _la: number;
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 476;
			_la = this._input.LA(1);
			if(!(((((_la - 70)) & ~0x1F) === 0 && ((1 << (_la - 70)) & 7) !== 0))) {
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
	public typeCast(): TypeCastContext {
		let localctx: TypeCastContext = new TypeCastContext(this, this._ctx, this.state);
		this.enterRule(localctx, 76, CashScriptParser.RULE_typeCast);
		let _la: number;
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 478;
			_la = this._input.LA(1);
			if(!(((((_la - 70)) & ~0x1F) === 0 && ((1 << (_la - 70)) & 259) !== 0))) {
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
		case 33:
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

	public static readonly _serializedATN: number[] = [4,1,83,481,2,0,7,0,2,
	1,7,1,2,2,7,2,2,3,7,3,2,4,7,4,2,5,7,5,2,6,7,6,2,7,7,7,2,8,7,8,2,9,7,9,2,
	10,7,10,2,11,7,11,2,12,7,12,2,13,7,13,2,14,7,14,2,15,7,15,2,16,7,16,2,17,
	7,17,2,18,7,18,2,19,7,19,2,20,7,20,2,21,7,21,2,22,7,22,2,23,7,23,2,24,7,
	24,2,25,7,25,2,26,7,26,2,27,7,27,2,28,7,28,2,29,7,29,2,30,7,30,2,31,7,31,
	2,32,7,32,2,33,7,33,2,34,7,34,2,35,7,35,2,36,7,36,2,37,7,37,2,38,7,38,1,
	0,5,0,80,8,0,10,0,12,0,83,9,0,1,0,1,0,1,0,1,1,1,1,1,1,1,1,1,1,1,2,1,2,1,
	3,1,3,3,3,97,8,3,1,4,3,4,100,8,4,1,4,1,4,1,5,1,5,1,6,1,6,1,6,1,6,1,6,5,
	6,111,8,6,10,6,12,6,114,9,6,1,6,1,6,1,7,1,7,1,7,1,7,1,7,1,7,1,7,1,7,5,7,
	126,8,7,10,7,12,7,129,9,7,1,7,1,7,3,7,133,8,7,1,7,1,7,1,8,1,8,5,8,139,8,
	8,10,8,12,8,142,9,8,1,8,1,8,1,9,1,9,1,9,1,9,5,9,150,8,9,10,9,12,9,153,9,
	9,1,9,3,9,156,8,9,3,9,158,8,9,1,9,1,9,1,10,1,10,1,10,1,11,1,11,5,11,167,
	8,11,10,11,12,11,170,9,11,1,11,1,11,3,11,174,8,11,1,12,1,12,1,12,1,12,3,
	12,180,8,12,1,13,1,13,1,13,1,13,1,13,1,13,1,13,3,13,189,8,13,1,14,1,14,
	1,14,1,14,5,14,195,8,14,10,14,12,14,198,9,14,1,15,1,15,3,15,202,8,15,1,
	16,1,16,5,16,206,8,16,10,16,12,16,209,9,16,1,16,1,16,1,16,1,16,1,17,1,17,
	1,17,1,17,1,17,1,17,4,17,221,8,17,11,17,12,17,222,1,17,1,17,1,17,1,17,1,
	17,1,17,1,17,1,17,1,17,1,17,4,17,235,8,17,11,17,12,17,236,1,17,1,17,1,17,
	1,17,3,17,243,8,17,1,18,1,18,1,18,1,18,1,18,3,18,250,8,18,1,19,1,19,1,19,
	1,19,1,19,1,19,1,19,3,19,259,8,19,1,19,1,19,1,20,1,20,1,20,1,20,1,20,3,
	20,268,8,20,1,20,1,20,1,21,1,21,1,21,1,22,1,22,1,22,1,22,1,22,1,22,1,22,
	3,22,282,8,22,1,23,1,23,1,23,3,23,287,8,23,1,24,1,24,1,24,1,24,1,24,1,24,
	1,24,1,24,1,25,1,25,1,25,1,25,1,25,1,25,1,26,1,26,1,26,1,26,1,26,1,26,1,
	26,1,26,1,26,1,26,1,27,1,27,3,27,315,8,27,1,28,1,28,1,29,1,29,3,29,321,
	8,29,1,30,1,30,1,30,1,30,5,30,327,8,30,10,30,12,30,330,9,30,1,30,3,30,333,
	8,30,3,30,335,8,30,1,30,1,30,1,31,1,31,1,31,1,32,1,32,1,32,1,32,5,32,346,
	8,32,10,32,12,32,349,9,32,1,32,3,32,352,8,32,3,32,354,8,32,1,32,1,32,1,
	33,1,33,1,33,1,33,1,33,1,33,1,33,1,33,1,33,3,33,367,8,33,1,33,1,33,1,33,
	1,33,1,33,1,33,1,33,1,33,1,33,1,33,1,33,1,33,1,33,1,33,1,33,1,33,1,33,1,
	33,1,33,1,33,1,33,1,33,1,33,1,33,5,33,393,8,33,10,33,12,33,396,9,33,1,33,
	3,33,399,8,33,3,33,401,8,33,1,33,1,33,1,33,1,33,3,33,407,8,33,1,33,1,33,
	1,33,1,33,1,33,1,33,1,33,1,33,1,33,1,33,1,33,1,33,1,33,1,33,1,33,1,33,1,
	33,1,33,1,33,1,33,1,33,1,33,1,33,1,33,1,33,1,33,1,33,1,33,1,33,1,33,1,33,
	1,33,1,33,1,33,1,33,1,33,1,33,1,33,1,33,1,33,1,33,1,33,1,33,1,33,1,33,1,
	33,1,33,1,33,1,33,1,33,5,33,459,8,33,10,33,12,33,462,9,33,1,34,1,34,1,35,
	1,35,1,35,1,35,1,35,3,35,471,8,35,1,36,1,36,3,36,475,8,36,1,37,1,37,1,38,
	1,38,1,38,0,1,66,39,0,2,4,6,8,10,12,14,16,18,20,22,24,26,28,30,32,34,36,
	38,40,42,44,46,48,50,52,54,56,58,60,62,64,66,68,70,72,74,76,0,14,1,0,4,
	10,2,0,10,10,20,21,1,0,22,23,1,0,35,39,2,0,35,39,41,44,2,0,5,5,49,50,1,
	0,51,53,2,0,50,50,54,54,1,0,55,56,1,0,6,9,1,0,57,58,1,0,45,46,1,0,70,72,
	2,0,70,71,78,78,513,0,81,1,0,0,0,2,87,1,0,0,0,4,92,1,0,0,0,6,94,1,0,0,0,
	8,99,1,0,0,0,10,103,1,0,0,0,12,105,1,0,0,0,14,117,1,0,0,0,16,136,1,0,0,
	0,18,145,1,0,0,0,20,161,1,0,0,0,22,173,1,0,0,0,24,179,1,0,0,0,26,188,1,
	0,0,0,28,190,1,0,0,0,30,201,1,0,0,0,32,203,1,0,0,0,34,242,1,0,0,0,36,249,
	1,0,0,0,38,251,1,0,0,0,40,262,1,0,0,0,42,271,1,0,0,0,44,274,1,0,0,0,46,
	286,1,0,0,0,48,288,1,0,0,0,50,296,1,0,0,0,52,302,1,0,0,0,54,314,1,0,0,0,
	56,316,1,0,0,0,58,320,1,0,0,0,60,322,1,0,0,0,62,338,1,0,0,0,64,341,1,0,
	0,0,66,406,1,0,0,0,68,463,1,0,0,0,70,470,1,0,0,0,72,472,1,0,0,0,74,476,
	1,0,0,0,76,478,1,0,0,0,78,80,3,2,1,0,79,78,1,0,0,0,80,83,1,0,0,0,81,79,
	1,0,0,0,81,82,1,0,0,0,82,84,1,0,0,0,83,81,1,0,0,0,84,85,3,12,6,0,85,86,
	5,0,0,1,86,1,1,0,0,0,87,88,5,1,0,0,88,89,3,4,2,0,89,90,3,6,3,0,90,91,5,
	2,0,0,91,3,1,0,0,0,92,93,5,3,0,0,93,5,1,0,0,0,94,96,3,8,4,0,95,97,3,8,4,
	0,96,95,1,0,0,0,96,97,1,0,0,0,97,7,1,0,0,0,98,100,3,10,5,0,99,98,1,0,0,
	0,99,100,1,0,0,0,100,101,1,0,0,0,101,102,5,64,0,0,102,9,1,0,0,0,103,104,
	7,0,0,0,104,11,1,0,0,0,105,106,5,11,0,0,106,107,5,80,0,0,107,108,3,18,9,
	0,108,112,5,12,0,0,109,111,3,14,7,0,110,109,1,0,0,0,111,114,1,0,0,0,112,
	110,1,0,0,0,112,113,1,0,0,0,113,115,1,0,0,0,114,112,1,0,0,0,115,116,5,13,
	0,0,116,13,1,0,0,0,117,118,5,14,0,0,118,119,5,80,0,0,119,132,3,18,9,0,120,
	121,5,15,0,0,121,122,5,16,0,0,122,127,3,74,37,0,123,124,5,17,0,0,124,126,
	3,74,37,0,125,123,1,0,0,0,126,129,1,0,0,0,127,125,1,0,0,0,127,128,1,0,0,
	0,128,130,1,0,0,0,129,127,1,0,0,0,130,131,5,18,0,0,131,133,1,0,0,0,132,
	120,1,0,0,0,132,133,1,0,0,0,133,134,1,0,0,0,134,135,3,16,8,0,135,15,1,0,
	0,0,136,140,5,12,0,0,137,139,3,24,12,0,138,137,1,0,0,0,139,142,1,0,0,0,
	140,138,1,0,0,0,140,141,1,0,0,0,141,143,1,0,0,0,142,140,1,0,0,0,143,144,
	5,13,0,0,144,17,1,0,0,0,145,157,5,16,0,0,146,151,3,20,10,0,147,148,5,17,
	0,0,148,150,3,20,10,0,149,147,1,0,0,0,150,153,1,0,0,0,151,149,1,0,0,0,151,
	152,1,0,0,0,152,155,1,0,0,0,153,151,1,0,0,0,154,156,5,17,0,0,155,154,1,
	0,0,0,155,156,1,0,0,0,156,158,1,0,0,0,157,146,1,0,0,0,157,158,1,0,0,0,158,
	159,1,0,0,0,159,160,5,18,0,0,160,19,1,0,0,0,161,162,3,74,37,0,162,163,5,
	80,0,0,163,21,1,0,0,0,164,168,5,12,0,0,165,167,3,24,12,0,166,165,1,0,0,
	0,167,170,1,0,0,0,168,166,1,0,0,0,168,169,1,0,0,0,169,171,1,0,0,0,170,168,
	1,0,0,0,171,174,5,13,0,0,172,174,3,24,12,0,173,164,1,0,0,0,173,172,1,0,
	0,0,174,23,1,0,0,0,175,180,3,30,15,0,176,177,3,26,13,0,177,178,5,2,0,0,
	178,180,1,0,0,0,179,175,1,0,0,0,179,176,1,0,0,0,180,25,1,0,0,0,181,189,
	3,32,16,0,182,189,3,34,17,0,183,189,3,36,18,0,184,189,3,38,19,0,185,189,
	3,40,20,0,186,189,3,42,21,0,187,189,3,28,14,0,188,181,1,0,0,0,188,182,1,
	0,0,0,188,183,1,0,0,0,188,184,1,0,0,0,188,185,1,0,0,0,188,186,1,0,0,0,188,
	187,1,0,0,0,189,27,1,0,0,0,190,191,5,19,0,0,191,196,3,66,33,0,192,193,5,
	17,0,0,193,195,3,66,33,0,194,192,1,0,0,0,195,198,1,0,0,0,196,194,1,0,0,
	0,196,197,1,0,0,0,197,29,1,0,0,0,198,196,1,0,0,0,199,202,3,44,22,0,200,
	202,3,46,23,0,201,199,1,0,0,0,201,200,1,0,0,0,202,31,1,0,0,0,203,207,3,
	74,37,0,204,206,3,68,34,0,205,204,1,0,0,0,206,209,1,0,0,0,207,205,1,0,0,
	0,207,208,1,0,0,0,208,210,1,0,0,0,209,207,1,0,0,0,210,211,5,80,0,0,211,
	212,5,10,0,0,212,213,3,66,33,0,213,33,1,0,0,0,214,215,3,74,37,0,215,220,
	5,80,0,0,216,217,5,17,0,0,217,218,3,74,37,0,218,219,5,80,0,0,219,221,1,
	0,0,0,220,216,1,0,0,0,221,222,1,0,0,0,222,220,1,0,0,0,222,223,1,0,0,0,223,
	224,1,0,0,0,224,225,5,10,0,0,225,226,3,66,33,0,226,243,1,0,0,0,227,228,
	5,16,0,0,228,229,3,74,37,0,229,234,5,80,0,0,230,231,5,17,0,0,231,232,3,
	74,37,0,232,233,5,80,0,0,233,235,1,0,0,0,234,230,1,0,0,0,235,236,1,0,0,
	0,236,234,1,0,0,0,236,237,1,0,0,0,237,238,1,0,0,0,238,239,5,18,0,0,239,
	240,5,10,0,0,240,241,3,66,33,0,241,243,1,0,0,0,242,214,1,0,0,0,242,227,
	1,0,0,0,243,35,1,0,0,0,244,245,5,80,0,0,245,246,7,1,0,0,246,250,3,66,33,
	0,247,248,5,80,0,0,248,250,7,2,0,0,249,244,1,0,0,0,249,247,1,0,0,0,250,
	37,1,0,0,0,251,252,5,24,0,0,252,253,5,16,0,0,253,254,5,77,0,0,254,255,5,
	6,0,0,255,258,3,66,33,0,256,257,5,17,0,0,257,259,3,56,28,0,258,256,1,0,
	0,0,258,259,1,0,0,0,259,260,1,0,0,0,260,261,5,18,0,0,261,39,1,0,0,0,262,
	263,5,24,0,0,263,264,5,16,0,0,264,267,3,66,33,0,265,266,5,17,0,0,266,268,
	3,56,28,0,267,265,1,0,0,0,267,268,1,0,0,0,268,269,1,0,0,0,269,270,5,18,
	0,0,270,41,1,0,0,0,271,272,5,25,0,0,272,273,3,60,30,0,273,43,1,0,0,0,274,
	275,5,26,0,0,275,276,5,16,0,0,276,277,3,66,33,0,277,278,5,18,0,0,278,281,
	3,22,11,0,279,280,5,27,0,0,280,282,3,22,11,0,281,279,1,0,0,0,281,282,1,
	0,0,0,282,45,1,0,0,0,283,287,3,48,24,0,284,287,3,50,25,0,285,287,3,52,26,
	0,286,283,1,0,0,0,286,284,1,0,0,0,286,285,1,0,0,0,287,47,1,0,0,0,288,289,
	5,28,0,0,289,290,3,22,11,0,290,291,5,29,0,0,291,292,5,16,0,0,292,293,3,
	66,33,0,293,294,5,18,0,0,294,295,5,2,0,0,295,49,1,0,0,0,296,297,5,29,0,
	0,297,298,5,16,0,0,298,299,3,66,33,0,299,300,5,18,0,0,300,301,3,22,11,0,
	301,51,1,0,0,0,302,303,5,30,0,0,303,304,5,16,0,0,304,305,3,54,27,0,305,
	306,5,2,0,0,306,307,3,66,33,0,307,308,5,2,0,0,308,309,3,36,18,0,309,310,
	5,18,0,0,310,311,3,22,11,0,311,53,1,0,0,0,312,315,3,32,16,0,313,315,3,36,
	18,0,314,312,1,0,0,0,314,313,1,0,0,0,315,55,1,0,0,0,316,317,5,74,0,0,317,
	57,1,0,0,0,318,321,5,80,0,0,319,321,3,70,35,0,320,318,1,0,0,0,320,319,1,
	0,0,0,321,59,1,0,0,0,322,334,5,16,0,0,323,328,3,58,29,0,324,325,5,17,0,
	0,325,327,3,58,29,0,326,324,1,0,0,0,327,330,1,0,0,0,328,326,1,0,0,0,328,
	329,1,0,0,0,329,332,1,0,0,0,330,328,1,0,0,0,331,333,5,17,0,0,332,331,1,
	0,0,0,332,333,1,0,0,0,333,335,1,0,0,0,334,323,1,0,0,0,334,335,1,0,0,0,335,
	336,1,0,0,0,336,337,5,18,0,0,337,61,1,0,0,0,338,339,5,80,0,0,339,340,3,
	64,32,0,340,63,1,0,0,0,341,353,5,16,0,0,342,347,3,66,33,0,343,344,5,17,
	0,0,344,346,3,66,33,0,345,343,1,0,0,0,346,349,1,0,0,0,347,345,1,0,0,0,347,
	348,1,0,0,0,348,351,1,0,0,0,349,347,1,0,0,0,350,352,5,17,0,0,351,350,1,
	0,0,0,351,352,1,0,0,0,352,354,1,0,0,0,353,342,1,0,0,0,353,354,1,0,0,0,354,
	355,1,0,0,0,355,356,5,18,0,0,356,65,1,0,0,0,357,358,6,33,-1,0,358,359,5,
	16,0,0,359,360,3,66,33,0,360,361,5,18,0,0,361,407,1,0,0,0,362,363,3,76,
	38,0,363,364,5,16,0,0,364,366,3,66,33,0,365,367,5,17,0,0,366,365,1,0,0,
	0,366,367,1,0,0,0,367,368,1,0,0,0,368,369,5,18,0,0,369,407,1,0,0,0,370,
	407,3,62,31,0,371,372,5,31,0,0,372,373,5,80,0,0,373,407,3,64,32,0,374,375,
	5,34,0,0,375,376,5,32,0,0,376,377,3,66,33,0,377,378,5,33,0,0,378,379,7,
	3,0,0,379,407,1,0,0,0,380,381,5,40,0,0,381,382,5,32,0,0,382,383,3,66,33,
	0,383,384,5,33,0,0,384,385,7,4,0,0,385,407,1,0,0,0,386,387,7,5,0,0,387,
	407,3,66,33,15,388,400,5,32,0,0,389,394,3,66,33,0,390,391,5,17,0,0,391,
	393,3,66,33,0,392,390,1,0,0,0,393,396,1,0,0,0,394,392,1,0,0,0,394,395,1,
	0,0,0,395,398,1,0,0,0,396,394,1,0,0,0,397,399,5,17,0,0,398,397,1,0,0,0,
	398,399,1,0,0,0,399,401,1,0,0,0,400,389,1,0,0,0,400,401,1,0,0,0,401,402,
	1,0,0,0,402,407,5,33,0,0,403,407,5,79,0,0,404,407,5,80,0,0,405,407,3,70,
	35,0,406,357,1,0,0,0,406,362,1,0,0,0,406,370,1,0,0,0,406,371,1,0,0,0,406,
	374,1,0,0,0,406,380,1,0,0,0,406,386,1,0,0,0,406,388,1,0,0,0,406,403,1,0,
	0,0,406,404,1,0,0,0,406,405,1,0,0,0,407,460,1,0,0,0,408,409,10,14,0,0,409,
	410,7,6,0,0,410,459,3,66,33,15,411,412,10,13,0,0,412,413,7,7,0,0,413,459,
	3,66,33,14,414,415,10,12,0,0,415,416,7,8,0,0,416,459,3,66,33,13,417,418,
	10,11,0,0,418,419,7,9,0,0,419,459,3,66,33,12,420,421,10,10,0,0,421,422,
	7,10,0,0,422,459,3,66,33,11,423,424,10,9,0,0,424,425,5,59,0,0,425,459,3,
	66,33,10,426,427,10,8,0,0,427,428,5,4,0,0,428,459,3,66,33,9,429,430,10,
	7,0,0,430,431,5,60,0,0,431,459,3,66,33,8,432,433,10,6,0,0,433,434,5,61,
	0,0,434,459,3,66,33,7,435,436,10,5,0,0,436,437,5,62,0,0,437,459,3,66,33,
	6,438,439,10,21,0,0,439,440,5,32,0,0,440,441,5,67,0,0,441,459,5,33,0,0,
	442,443,10,18,0,0,443,459,7,11,0,0,444,445,10,17,0,0,445,446,5,47,0,0,446,
	447,5,16,0,0,447,448,3,66,33,0,448,449,5,18,0,0,449,459,1,0,0,0,450,451,
	10,16,0,0,451,452,5,48,0,0,452,453,5,16,0,0,453,454,3,66,33,0,454,455,5,
	17,0,0,455,456,3,66,33,0,456,457,5,18,0,0,457,459,1,0,0,0,458,408,1,0,0,
	0,458,411,1,0,0,0,458,414,1,0,0,0,458,417,1,0,0,0,458,420,1,0,0,0,458,423,
	1,0,0,0,458,426,1,0,0,0,458,429,1,0,0,0,458,432,1,0,0,0,458,435,1,0,0,0,
	458,438,1,0,0,0,458,442,1,0,0,0,458,444,1,0,0,0,458,450,1,0,0,0,459,462,
	1,0,0,0,460,458,1,0,0,0,460,461,1,0,0,0,461,67,1,0,0,0,462,460,1,0,0,0,
	463,464,5,63,0,0,464,69,1,0,0,0,465,471,5,65,0,0,466,471,3,72,36,0,467,
	471,5,74,0,0,468,471,5,75,0,0,469,471,5,76,0,0,470,465,1,0,0,0,470,466,
	1,0,0,0,470,467,1,0,0,0,470,468,1,0,0,0,470,469,1,0,0,0,471,71,1,0,0,0,
	472,474,5,67,0,0,473,475,5,66,0,0,474,473,1,0,0,0,474,475,1,0,0,0,475,73,
	1,0,0,0,476,477,7,12,0,0,477,75,1,0,0,0,478,479,7,13,0,0,479,77,1,0,0,0,
	42,81,96,99,112,127,132,140,151,155,157,168,173,179,188,196,201,207,222,
	236,242,249,258,267,281,286,314,320,328,332,334,347,351,353,366,394,398,
	400,406,458,460,470,474];

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
	public functionBody(): FunctionBodyContext {
		return this.getTypedRuleContext(FunctionBodyContext, 0) as FunctionBodyContext;
	}
	public typeName_list(): TypeNameContext[] {
		return this.getTypedRuleContexts(TypeNameContext) as TypeNameContext[];
	}
	public typeName(i: number): TypeNameContext {
		return this.getTypedRuleContext(TypeNameContext, i) as TypeNameContext;
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


export class FunctionBodyContext extends ParserRuleContext {
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
    	return CashScriptParser.RULE_functionBody;
	}
	// @Override
	public accept<Result>(visitor: CashScriptVisitor<Result>): Result {
		if (visitor.visitFunctionBody) {
			return visitor.visitFunctionBody(this);
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
	public controlStatement(): ControlStatementContext {
		return this.getTypedRuleContext(ControlStatementContext, 0) as ControlStatementContext;
	}
	public nonControlStatement(): NonControlStatementContext {
		return this.getTypedRuleContext(NonControlStatementContext, 0) as NonControlStatementContext;
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


export class NonControlStatementContext extends ParserRuleContext {
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
	public consoleStatement(): ConsoleStatementContext {
		return this.getTypedRuleContext(ConsoleStatementContext, 0) as ConsoleStatementContext;
	}
	public returnStatement(): ReturnStatementContext {
		return this.getTypedRuleContext(ReturnStatementContext, 0) as ReturnStatementContext;
	}
    public get ruleIndex(): number {
    	return CashScriptParser.RULE_nonControlStatement;
	}
	// @Override
	public accept<Result>(visitor: CashScriptVisitor<Result>): Result {
		if (visitor.visitNonControlStatement) {
			return visitor.visitNonControlStatement(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class ReturnStatementContext extends ParserRuleContext {
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
    	return CashScriptParser.RULE_returnStatement;
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


export class ControlStatementContext extends ParserRuleContext {
	constructor(parser?: CashScriptParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public ifStatement(): IfStatementContext {
		return this.getTypedRuleContext(IfStatementContext, 0) as IfStatementContext;
	}
	public loopStatement(): LoopStatementContext {
		return this.getTypedRuleContext(LoopStatementContext, 0) as LoopStatementContext;
	}
    public get ruleIndex(): number {
    	return CashScriptParser.RULE_controlStatement;
	}
	// @Override
	public accept<Result>(visitor: CashScriptVisitor<Result>): Result {
		if (visitor.visitControlStatement) {
			return visitor.visitControlStatement(this);
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
	public _op!: Token;
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
	public whileStatement(): WhileStatementContext {
		return this.getTypedRuleContext(WhileStatementContext, 0) as WhileStatementContext;
	}
	public forStatement(): ForStatementContext {
		return this.getTypedRuleContext(ForStatementContext, 0) as ForStatementContext;
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


export class WhileStatementContext extends ParserRuleContext {
	constructor(parser?: CashScriptParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public expression(): ExpressionContext {
		return this.getTypedRuleContext(ExpressionContext, 0) as ExpressionContext;
	}
	public block(): BlockContext {
		return this.getTypedRuleContext(BlockContext, 0) as BlockContext;
	}
    public get ruleIndex(): number {
    	return CashScriptParser.RULE_whileStatement;
	}
	// @Override
	public accept<Result>(visitor: CashScriptVisitor<Result>): Result {
		if (visitor.visitWhileStatement) {
			return visitor.visitWhileStatement(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class ForStatementContext extends ParserRuleContext {
	constructor(parser?: CashScriptParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public forInit(): ForInitContext {
		return this.getTypedRuleContext(ForInitContext, 0) as ForInitContext;
	}
	public expression(): ExpressionContext {
		return this.getTypedRuleContext(ExpressionContext, 0) as ExpressionContext;
	}
	public assignStatement(): AssignStatementContext {
		return this.getTypedRuleContext(AssignStatementContext, 0) as AssignStatementContext;
	}
	public block(): BlockContext {
		return this.getTypedRuleContext(BlockContext, 0) as BlockContext;
	}
    public get ruleIndex(): number {
    	return CashScriptParser.RULE_forStatement;
	}
	// @Override
	public accept<Result>(visitor: CashScriptVisitor<Result>): Result {
		if (visitor.visitForStatement) {
			return visitor.visitForStatement(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class ForInitContext extends ParserRuleContext {
	constructor(parser?: CashScriptParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public variableDefinition(): VariableDefinitionContext {
		return this.getTypedRuleContext(VariableDefinitionContext, 0) as VariableDefinitionContext;
	}
	public assignStatement(): AssignStatementContext {
		return this.getTypedRuleContext(AssignStatementContext, 0) as AssignStatementContext;
	}
    public get ruleIndex(): number {
    	return CashScriptParser.RULE_forInit;
	}
	// @Override
	public accept<Result>(visitor: CashScriptVisitor<Result>): Result {
		if (visitor.visitForInit) {
			return visitor.visitForInit(this);
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
	public override copyFrom(ctx: ExpressionContext): void {
		super.copyFrom(ctx);
	}
}
export class CastContext extends ExpressionContext {
	public _castable!: ExpressionContext;
	constructor(parser: CashScriptParser, ctx: ExpressionContext) {
		super(parser, ctx.parentCtx, ctx.invokingState);
		super.copyFrom(ctx);
	}
	public typeCast(): TypeCastContext {
		return this.getTypedRuleContext(TypeCastContext, 0) as TypeCastContext;
	}
	public expression(): ExpressionContext {
		return this.getTypedRuleContext(ExpressionContext, 0) as ExpressionContext;
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
	public PrimitiveType(): TerminalNode {
		return this.getToken(CashScriptParser.PrimitiveType, 0);
	}
	public BoundedBytes(): TerminalNode {
		return this.getToken(CashScriptParser.BoundedBytes, 0);
	}
	public UnboundedBytes(): TerminalNode {
		return this.getToken(CashScriptParser.UnboundedBytes, 0);
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


export class TypeCastContext extends ParserRuleContext {
	constructor(parser?: CashScriptParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public PrimitiveType(): TerminalNode {
		return this.getToken(CashScriptParser.PrimitiveType, 0);
	}
	public UnboundedBytes(): TerminalNode {
		return this.getToken(CashScriptParser.UnboundedBytes, 0);
	}
	public UnsafeCast(): TerminalNode {
		return this.getToken(CashScriptParser.UnsafeCast, 0);
	}
    public get ruleIndex(): number {
    	return CashScriptParser.RULE_typeCast;
	}
	// @Override
	public accept<Result>(visitor: CashScriptVisitor<Result>): Result {
		if (visitor.visitTypeCast) {
			return visitor.visitTypeCast(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
