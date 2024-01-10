/* eslint-disable @typescript-eslint/no-unused-vars */
import { ErrorListener, RecognitionException, Recognizer } from 'antlr4';
import { ParseError } from '../Errors.js';
import { Point } from './Location.js';

/**
 * ANTLR Error Listener that immediately throws on error. This is used so that
 * ANTLR doesn't attempt any error recovery during lexing/parsing and fails early.
 */
export default class ThrowingErrorListener<TSymbol> extends ErrorListener<TSymbol> {
  static readonly INSTANCE = new ThrowingErrorListener();

  syntaxError(
    recognizer: Recognizer<TSymbol>,
    offendingSymbol: TSymbol,
    line: number,
    charPositionInLine: number,
    message: string,
    e?: RecognitionException,
  ): void {
    const capitalisedMessage = message.charAt(0).toUpperCase() + message.slice(1);
    throw new ParseError(capitalisedMessage, new Point(line, charPositionInLine));
  }
}
