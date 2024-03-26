import { MatcherContext } from '@jest/expect';
import { SyncExpectationResult } from 'expect';
import { printExpected, printReceived, matcherHint } from 'jest-matcher-utils';
import { Transaction } from '../index.js';

export {};

declare global {
  namespace jest {
    // eslint-disable-next-line
    interface Matchers<R> {
      toLog(value: RegExp | string): Promise<void>;
      toFailRequireWith(value: RegExp | string): Promise<void>;
    }
  }
}

expect.extend({
  async toLog(
    this: MatcherContext,
    transaction: Transaction,
    match: RegExp | string,
  ): Promise<SyncExpectationResult> {
    const spyOnLoggerError = jest.spyOn(console, 'log');

    // silence actual stdout output
    spyOnLoggerError.mockImplementation(() => {});
    try {
      await transaction.debug();
    } catch {}
    let error: string = '';

    try {
      expect(spyOnLoggerError).toBeCalledWith(expect.stringMatching(match));
    } catch (e) {
      error = e as any;
    }

    // We concatenate all the logs into a single string - if no logs are present, we set received to undefined
    const receivedBase = spyOnLoggerError.mock.calls.reduce((acc, [log]) => `${acc}\n${log}`, '').trim();
    const received = receivedBase === '' ? undefined : receivedBase;

    spyOnLoggerError.mockClear();

    return {
      message: failMessage(received, match),
      // message: () =>'Hello',
      pass: !error,
    };
  },
});

expect.extend({
  async toFailRequireWith(
    this: MatcherContext,
    transaction: Transaction,
    match: RegExp | string,
  ): Promise<SyncExpectationResult> {
    let message: string = '';
    let failMessage: any = () => {};

    try {
      await transaction.debug();
      failMessage = () => () => `${matcherHint(
        '.toFailRequireWith',
        undefined,
        '',
      )}

Contract function did not fail a require statement`;
    } catch (error) {
      message = error as any;
    }

    // should not have failed
    if (this.isNot) {
      return {
        message: () => `${matcherHint(
          '.toFailRequireWith',
          'received',
          '',
          { isNot: true },
        )}`,
        pass: false,
      };
    }

    if (message) {
      try {
        expect(message).toMatch(match);
        message = '';
      } catch (error: any) {
        message = error.message;
        failMessage = () => () => message.replace('.toMatch', '.toFailRequireWith');
      }
    }

    return {
      message: failMessage(message, match),
      pass: !message,
    };
  },
});

// TODO: Update to have the same failMessage function for .toLog and .toFailRequireWith
const failMessage = (received?: string, expected?: RegExp | string) => () => `${matcherHint(
  '.toLog',
  'received',
  'expected',
)}

Expected: ${printExpected(expected)}
Received: ${printReceived(received)}`;
