import { ErrorListener, Recognizer } from 'antlr4';
import { ParseError } from '../Errors.js';
import { Point } from './Location.js';

export interface CashScriptErrorListener {
  syntaxError(
    recognizer: unknown,
    offendingSymbol: unknown,
    line: number,
    charPositionInLine: number,
    message: string,
    e?: unknown,
  ): void;
}

/**
 * Error listener that forwards syntax errors to another listener and stores the first error.
 */
export class ForwardingErrorListener extends ErrorListener<unknown> implements CashScriptErrorListener {
  private firstError?: ParseError;

  constructor(private readonly errorListener: CashScriptErrorListener) {
    super();
  }

  syntaxError(
    recognizer: unknown,
    offendingSymbol: unknown,
    line: number,
    charPositionInLine: number,
    message: string,
    e?: unknown,
  ): void {
    this.firstError ??= createParseError(line, charPositionInLine, message);
    this.errorListener.syntaxError(recognizer, offendingSymbol, line, charPositionInLine, message, e);
  }

  throwFirstError(): void {
    if (this.firstError) throw this.firstError;
  }
}

/**
 * ANTLR Error Listener that immediately throws on error. This is used so that
 * ANTLR doesn't attempt any error recovery during lexing/parsing and fails early.
 */
export class ThrowingErrorListener<TSymbol> extends ErrorListener<TSymbol> {
  static readonly INSTANCE = new ThrowingErrorListener();

  syntaxError(
    _recognizer: Recognizer<TSymbol>,
    _offendingSymbol: TSymbol,
    line: number,
    charPositionInLine: number,
    message: string,
  ): void {
    throw createParseError(line, charPositionInLine, message);
  }
}

function createParseError(line: number, charPositionInLine: number, message: string): ParseError {
  const capitalisedMessage = message.charAt(0).toUpperCase() + message.slice(1);
  return new ParseError(capitalisedMessage, new Point(line, charPositionInLine));
}
