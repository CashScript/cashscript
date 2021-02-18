/* eslint-disable @typescript-eslint/no-unused-vars */
import { ANTLRErrorListener, RecognitionException, Recognizer } from 'antlr4ts';
import { ParseError } from '../Errors';
import { Point } from './Location';

/**
 * ANTLR Error Listener that immediately throws on error. This is used so that
 * ANTLR doesn't attempt any error recovery during lexing/parsing and fails early.
 */
export default class ThrowingErrorListener implements ANTLRErrorListener<any> {
  static readonly INSTANCE = new ThrowingErrorListener();

  syntaxError<T>(
    recognizer: Recognizer<T, any>,
    offendingSymbol: T,
    line: number,
    charPositionInLine: number,
    message: string,
    e?: RecognitionException,
  ): void {
    const capitalisedMessage = message.charAt(0).toUpperCase() + message.slice(1);
    throw new ParseError(capitalisedMessage, new Point(line, charPositionInLine));
  }
}
