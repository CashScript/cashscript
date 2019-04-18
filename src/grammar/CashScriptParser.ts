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
	public static readonly NUMBER = 7;
	public static readonly WHITESPACE = 8;
	public static readonly RULE_eval = 0;
	public static readonly RULE_additionExp = 1;
	public static readonly RULE_multiplyExp = 2;
	public static readonly RULE_atomExp = 3;
	// tslint:disable:no-trailing-whitespace
	public static readonly ruleNames: string[] = [
		"eval", "additionExp", "multiplyExp", "atomExp",
	];

	private static readonly _LITERAL_NAMES: Array<string | undefined> = [
		undefined, "'+'", "'-'", "'*'", "'/'", "'('", "')'",
	];
	private static readonly _SYMBOLIC_NAMES: Array<string | undefined> = [
		undefined, undefined, undefined, undefined, undefined, undefined, undefined, 
		"NUMBER", "WHITESPACE",
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
	public eval(): EvalContext {
		let _localctx: EvalContext = new EvalContext(this._ctx, this.state);
		this.enterRule(_localctx, 0, CashScriptParser.RULE_eval);
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 8;
			this.additionExp();
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
	public additionExp(): AdditionExpContext {
		let _localctx: AdditionExpContext = new AdditionExpContext(this._ctx, this.state);
		this.enterRule(_localctx, 2, CashScriptParser.RULE_additionExp);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 10;
			this.multiplyExp();
			this.state = 17;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while (_la === CashScriptParser.T__0 || _la === CashScriptParser.T__1) {
				{
				this.state = 15;
				this._errHandler.sync(this);
				switch (this._input.LA(1)) {
				case CashScriptParser.T__0:
					{
					this.state = 11;
					this.match(CashScriptParser.T__0);
					this.state = 12;
					this.multiplyExp();
					}
					break;
				case CashScriptParser.T__1:
					{
					this.state = 13;
					this.match(CashScriptParser.T__1);
					this.state = 14;
					this.multiplyExp();
					}
					break;
				default:
					throw new NoViableAltException(this);
				}
				}
				this.state = 19;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
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
	public multiplyExp(): MultiplyExpContext {
		let _localctx: MultiplyExpContext = new MultiplyExpContext(this._ctx, this.state);
		this.enterRule(_localctx, 4, CashScriptParser.RULE_multiplyExp);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 20;
			this.atomExp();
			this.state = 27;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while (_la === CashScriptParser.T__2 || _la === CashScriptParser.T__3) {
				{
				this.state = 25;
				this._errHandler.sync(this);
				switch (this._input.LA(1)) {
				case CashScriptParser.T__2:
					{
					this.state = 21;
					this.match(CashScriptParser.T__2);
					this.state = 22;
					this.atomExp();
					}
					break;
				case CashScriptParser.T__3:
					{
					this.state = 23;
					this.match(CashScriptParser.T__3);
					this.state = 24;
					this.atomExp();
					}
					break;
				default:
					throw new NoViableAltException(this);
				}
				}
				this.state = 29;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
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
	public atomExp(): AtomExpContext {
		let _localctx: AtomExpContext = new AtomExpContext(this._ctx, this.state);
		this.enterRule(_localctx, 6, CashScriptParser.RULE_atomExp);
		try {
			this.state = 35;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case CashScriptParser.NUMBER:
				this.enterOuterAlt(_localctx, 1);
				{
				this.state = 30;
				this.match(CashScriptParser.NUMBER);
				}
				break;
			case CashScriptParser.T__4:
				this.enterOuterAlt(_localctx, 2);
				{
				this.state = 31;
				this.match(CashScriptParser.T__4);
				this.state = 32;
				this.additionExp();
				this.state = 33;
				this.match(CashScriptParser.T__5);
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

	public static readonly _serializedATN: string =
		"\x03\uC91D\uCABA\u058D\uAFBA\u4F53\u0607\uEA8B\uC241\x03\n(\x04\x02\t" +
		"\x02\x04\x03\t\x03\x04\x04\t\x04\x04\x05\t\x05\x03\x02\x03\x02\x03\x03" +
		"\x03\x03\x03\x03\x03\x03\x03\x03\x07\x03\x12\n\x03\f\x03\x0E\x03\x15\v" +
		"\x03\x03\x04\x03\x04\x03\x04\x03\x04\x03\x04\x07\x04\x1C\n\x04\f\x04\x0E" +
		"\x04\x1F\v\x04\x03\x05\x03\x05\x03\x05\x03\x05\x03\x05\x05\x05&\n\x05" +
		"\x03\x05\x02\x02\x02\x06\x02\x02\x04\x02\x06\x02\b\x02\x02\x02\x02(\x02" +
		"\n\x03\x02\x02\x02\x04\f\x03\x02\x02\x02\x06\x16\x03\x02\x02\x02\b%\x03" +
		"\x02\x02\x02\n\v\x05\x04\x03\x02\v\x03\x03\x02\x02\x02\f\x13\x05\x06\x04" +
		"\x02\r\x0E\x07\x03\x02\x02\x0E\x12\x05\x06\x04\x02\x0F\x10\x07\x04\x02" +
		"\x02\x10\x12\x05\x06\x04\x02\x11\r\x03\x02\x02\x02\x11\x0F\x03\x02\x02" +
		"\x02\x12\x15\x03\x02\x02\x02\x13\x11\x03\x02\x02\x02\x13\x14\x03\x02\x02" +
		"\x02\x14\x05\x03\x02\x02\x02\x15\x13\x03\x02\x02\x02\x16\x1D\x05\b\x05" +
		"\x02\x17\x18\x07\x05\x02\x02\x18\x1C\x05\b\x05\x02\x19\x1A\x07\x06\x02" +
		"\x02\x1A\x1C\x05\b\x05\x02\x1B\x17\x03\x02\x02\x02\x1B\x19\x03\x02\x02" +
		"\x02\x1C\x1F\x03\x02\x02\x02\x1D\x1B\x03\x02\x02\x02\x1D\x1E\x03\x02\x02" +
		"\x02\x1E\x07\x03\x02\x02\x02\x1F\x1D\x03\x02\x02\x02 &\x07\t\x02\x02!" +
		"\"\x07\x07\x02\x02\"#\x05\x04\x03\x02#$\x07\b\x02\x02$&\x03\x02\x02\x02" +
		"% \x03\x02\x02\x02%!\x03\x02\x02\x02&\t\x03\x02\x02\x02\x07\x11\x13\x1B" +
		"\x1D%";
	public static __ATN: ATN;
	public static get _ATN(): ATN {
		if (!CashScriptParser.__ATN) {
			CashScriptParser.__ATN = new ATNDeserializer().deserialize(Utils.toCharArray(CashScriptParser._serializedATN));
		}

		return CashScriptParser.__ATN;
	}

}

export class EvalContext extends ParserRuleContext {
	public additionExp(): AdditionExpContext {
		return this.getRuleContext(0, AdditionExpContext);
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return CashScriptParser.RULE_eval; }
	// @Override
	public enterRule(listener: CashScriptListener): void {
		if (listener.enterEval) {
			listener.enterEval(this);
		}
	}
	// @Override
	public exitRule(listener: CashScriptListener): void {
		if (listener.exitEval) {
			listener.exitEval(this);
		}
	}
	// @Override
	public accept<Result>(visitor: CashScriptVisitor<Result>): Result {
		if (visitor.visitEval) {
			return visitor.visitEval(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class AdditionExpContext extends ParserRuleContext {
	public multiplyExp(): MultiplyExpContext[];
	public multiplyExp(i: number): MultiplyExpContext;
	public multiplyExp(i?: number): MultiplyExpContext | MultiplyExpContext[] {
		if (i === undefined) {
			return this.getRuleContexts(MultiplyExpContext);
		} else {
			return this.getRuleContext(i, MultiplyExpContext);
		}
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return CashScriptParser.RULE_additionExp; }
	// @Override
	public enterRule(listener: CashScriptListener): void {
		if (listener.enterAdditionExp) {
			listener.enterAdditionExp(this);
		}
	}
	// @Override
	public exitRule(listener: CashScriptListener): void {
		if (listener.exitAdditionExp) {
			listener.exitAdditionExp(this);
		}
	}
	// @Override
	public accept<Result>(visitor: CashScriptVisitor<Result>): Result {
		if (visitor.visitAdditionExp) {
			return visitor.visitAdditionExp(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class MultiplyExpContext extends ParserRuleContext {
	public atomExp(): AtomExpContext[];
	public atomExp(i: number): AtomExpContext;
	public atomExp(i?: number): AtomExpContext | AtomExpContext[] {
		if (i === undefined) {
			return this.getRuleContexts(AtomExpContext);
		} else {
			return this.getRuleContext(i, AtomExpContext);
		}
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return CashScriptParser.RULE_multiplyExp; }
	// @Override
	public enterRule(listener: CashScriptListener): void {
		if (listener.enterMultiplyExp) {
			listener.enterMultiplyExp(this);
		}
	}
	// @Override
	public exitRule(listener: CashScriptListener): void {
		if (listener.exitMultiplyExp) {
			listener.exitMultiplyExp(this);
		}
	}
	// @Override
	public accept<Result>(visitor: CashScriptVisitor<Result>): Result {
		if (visitor.visitMultiplyExp) {
			return visitor.visitMultiplyExp(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class AtomExpContext extends ParserRuleContext {
	public NUMBER(): TerminalNode | undefined { return this.tryGetToken(CashScriptParser.NUMBER, 0); }
	public additionExp(): AdditionExpContext | undefined {
		return this.tryGetRuleContext(0, AdditionExpContext);
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return CashScriptParser.RULE_atomExp; }
	// @Override
	public enterRule(listener: CashScriptListener): void {
		if (listener.enterAtomExp) {
			listener.enterAtomExp(this);
		}
	}
	// @Override
	public exitRule(listener: CashScriptListener): void {
		if (listener.exitAtomExp) {
			listener.exitAtomExp(this);
		}
	}
	// @Override
	public accept<Result>(visitor: CashScriptVisitor<Result>): Result {
		if (visitor.visitAtomExp) {
			return visitor.visitAtomExp(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


