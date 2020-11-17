/* eslint-disable @typescript-eslint/no-unused-vars */
import { ANTLRErrorListener, RecognitionException, Recognizer } from 'antlr4ts';
import { ParseError } from '../Errors';

/**
 * ANTLR Error Listener that immediately throws on error. This is used so that
 */
export default class ThrowingErrorListener implements ANTLRErrorListener<any> {
  static readonly INSTANCE = new ThrowingErrorListener();

  syntaxError<T>(
    recognizer: Recognizer<T, any>,
    offendingSymbol: T,
    line: number,
    charPositionInLine: number,
    msg: string,
    e?: RecognitionException,
  ): void {
    throw new ParseError(`line ${line}:${charPositionInLine} ${msg}`);
  }
}
