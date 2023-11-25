import { MatcherContext  } from '@jest/expect';
import { Transaction } from '../src/index.js';
import { ExpectationResult, SyncExpectationResult } from 'expect';
import { printExpected, printReceived, matcherHint } from "jest-matcher-utils"

export {};

declare global {
  namespace jest {
    interface Matchers<R> {
      toLog(value: RegExp | string): Promise<void>;
      toFailRequireWith(value: RegExp | string): Promise<void>;
    }
  }
}

expect.extend({ async toLog(
  this: MatcherContext,
  transaction: Transaction,
  match: RegExp | string
): Promise<SyncExpectationResult> {
  const spyOnLoggerError = jest.spyOn(console, 'log');

  // silence actual stdout output
  spyOnLoggerError.mockImplementation(() => {});
  await transaction.debug();
  let message: string = "";

  const failMessage = (received: string, expected: RegExp | string) => () => `${matcherHint(
".toLog",
"received",
"expected"
)}

Expected: ${printExpected(expected)}
Received: ${printReceived(received)}`;

  try {
    expect(spyOnLoggerError).toBeCalledWith(expect.stringMatching(match));
  } catch (error) {
    message = error as any;
  }

  const received = spyOnLoggerError.mock.calls[0][0];
  spyOnLoggerError.mockClear();

  return {
    message: failMessage(received, match),
    pass: !message
  }
 }
});

expect.extend({ async toFailRequireWith(
  this: MatcherContext,
  transaction: Transaction,
  match: RegExp | string
): Promise<SyncExpectationResult> {
  let message: string = "";
  let failMessage: any = () => {};

  try {
    await transaction.debug();
    failMessage = (_received: string, _expected: RegExp | string) => () => `${matcherHint(
".toFailRequireWith",
undefined,
""
)}

Contract function did not fail a require statement`;
  } catch (error) {
    message = error as any;
  }

  // // should not have failed
  if (this.isNot) {
    return {
      message: () => `${matcherHint(
".toFailRequireWith",
"received",
"",
{isNot: true}
)}`,
      pass: false
    }
  }

  if (message) {
    try {
      expect(message).toMatch(match);
      message = "";
    } catch (error: any) {
      message = error.message;
      failMessage = (_received: string, _expected: RegExp | string) => () => message.replace('.toMatch', '.toFailRequireWith');
    }
  }

  return {
    message: failMessage(message, match),
    pass: !message
  }
 }
});

// revertedWith