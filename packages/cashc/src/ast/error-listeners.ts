import { ErrorListener, RecognitionException, Recognizer, Token } from 'antlr4';
import { ParseError } from '../Errors.js';
import { Location, Point } from './Location.js';

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
    const normalisedMessage = normaliseSyntaxErrorMessage(message, offendingSymbol);

    this.firstError ??= createParseError(line, charPositionInLine, normalisedMessage, offendingSymbol);
    this.errorListener.syntaxError(recognizer, offendingSymbol, line, charPositionInLine, normalisedMessage, e);
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
    offendingSymbol: TSymbol,
    line: number,
    charPositionInLine: number,
    message: string,
    _e?: RecognitionException,
  ): void {
    const normalisedMessage = normaliseSyntaxErrorMessage(message, offendingSymbol);
    throw createParseError(line, charPositionInLine, normalisedMessage, offendingSymbol);
  }
}

function createParseError(
  line: number,
  charPositionInLine: number,
  message: string,
  offendingSymbol?: unknown,
): ParseError {
  const capitalisedMessage = message.charAt(0).toUpperCase() + message.slice(1);
  const token = getToken(offendingSymbol);
  const location = getTokenLocation(token) ?? createEmptyLocation(line, charPositionInLine);

  return new ParseError(capitalisedMessage, location);
}

function normaliseSyntaxErrorMessage(
  message: string,
  offendingSymbol: unknown,
): string {
  const token = getToken(offendingSymbol);
  const tokenText = getTokenText(token);
  if (!tokenText) return message;

  // There are 2 common error messages that we need to normalise:
  const noViableAlternativeInput = getNoViableAlternativeInput(message);
  const extraneousInput = isExtraneousInput(message, tokenText);

  if (isBoundedBytesExpressionError(message, tokenText, noViableAlternativeInput)) {
    return boundedBytesCastMessage(tokenText);
  }

  if (noViableAlternativeInput !== undefined || extraneousInput) {
    return `Unexpected token '${tokenText}'`;
  }

  return message;
}

function isBoundedBytesExpressionError(
  message: string,
  tokenText: string,
  noViableAlternativeInput: string | undefined,
): boolean {
  if (!isBoundedBytesToken(tokenText)) return false;

  return noViableAlternativeInput?.includes(`(${tokenText}`) || isExtraneousInput(message, tokenText);
}

function isBoundedBytesToken(tokenText: string): boolean {
  return tokenText === 'byte' || /^bytes[1-9][0-9]*$/.test(tokenText);
}

function boundedBytesCastMessage(typeName: string): string {
  const bound = typeName === 'byte' ? 1 : Number(typeName.slice('bytes'.length));
  const unsafeCast = typeName === 'byte' ? 'unsafe_byte' : `unsafe_${typeName}`;

  return `Invalid bounded bytes cast '${typeName}(...)'. Use 'toPaddedBytes(value, ${bound})' to convert an int or '${unsafeCast}(value)' for semantic bytes casts`;
}

function getNoViableAlternativeInput(message: string): string | undefined {
  return message.match(/^no viable alternative at input '([\s\S]*)'$/)?.[1];
}

function isExtraneousInput(message: string, tokenText: string): boolean {
  return message.startsWith(`extraneous input '${tokenText}'`);
}

function getToken(offendingSymbol: unknown): Token | undefined {
  return offendingSymbol instanceof Token ? offendingSymbol : undefined;
}

function getTokenText(token?: Token): string | undefined {
  if (!token || token.type === Token.EOF || typeof token.text !== 'string' || token.text === '<EOF>') {
    return undefined;
  }
  return token.text;
}

function getTokenLocation(token: Token | undefined): Location | undefined {
  if (!token || !getTokenText(token)) return undefined;

  return Location.fromToken(token);
}

function createEmptyLocation(line: number, column: number): Location {
  return new Location(new Point(line, column), new Point(line, column));
}
