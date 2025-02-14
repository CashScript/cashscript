import { MatcherContext } from '@jest/expect';
import { SyncExpectationResult } from 'expect';
import { DebugResult } from '../debugging.js';

export { };

declare global {
  namespace jest {
    // eslint-disable-next-line
    interface Matchers<R> {
      toLog(value?: RegExp | string): Promise<void>;
      toFailRequireWith(value: RegExp | string): Promise<void>;
      toFailRequire(): Promise<void>;
    }
  }
}

interface Debuggable {
  debug(): Promise<DebugResult[]>;
}

expect.extend({
  async toLog(
    this: MatcherContext,
    transaction: Debuggable,
    match?: RegExp | string,
  ): Promise<SyncExpectationResult> {
    const loggerSpy = jest.spyOn(console, 'log');

    // silence actual stdout output
    loggerSpy.mockImplementation(() => { });
    try { await transaction.debug(); } catch { }

    // We concatenate all the logs into a single string - if no logs are present, we set received to undefined
    const receivedBase = loggerSpy.mock.calls.reduce((acc, [log]) => `${acc}\n${log}`, '').trim();
    const received = receivedBase === '' ? undefined : receivedBase;

    const matcherHint = this.utils.matcherHint('toLog', 'received', 'expected', { isNot: this.isNot });
    const expectedText = `Expected: ${this.isNot ? 'not ' : ''}${this.utils.printExpected(match)}`;
    const receivedText = `Received: ${this.utils.printReceived(received)}`;
    const message = (): string => `${matcherHint}\n\n${expectedText}\n${receivedText}`;

    try {
      expect(loggerSpy).toBeCalledWith(match ? expect.stringMatching(match) : expect.anything());
    } catch (e) {
      return { message, pass: false };
    }

    loggerSpy.mockClear();

    return { message, pass: true };
  },
});

expect.extend({
  async toFailRequireWith(
    this: MatcherContext,
    transaction: Debuggable,
    match: RegExp | string,
  ): Promise<SyncExpectationResult> {
    try {
      await transaction.debug();

      const matcherHint = this.utils.matcherHint('.toFailRequireWith', undefined, match.toString(), { isNot: this.isNot });
      const message = (): string => `${matcherHint}\n\nContract function did not fail a require statement.`;
      return { message, pass: false };
    } catch (transactionError: any) {
      const matcherHint = this.utils.matcherHint('toFailRequireWith', 'received', 'expected', { isNot: this.isNot });
      const expectedText = `Expected pattern: ${this.isNot ? 'not ' : ''}${this.utils.printExpected(match)}`;
      const receivedText = `Received string: ${this.utils.printReceived(transactionError?.message ?? '')}`;
      const message = (): string => `${matcherHint}\n\n${expectedText}\n${receivedText}`;

      try {
        expect(transactionError?.message ?? '').toMatch(match);
        return { message, pass: true };
      } catch {
        return { message, pass: false };
      }
    }
  },
  async toFailRequire(
    this: MatcherContext,
    transaction: Debuggable,
  ): Promise<SyncExpectationResult> {
    try {
      await transaction.debug();
      const message = (): string => 'Contract function did not fail a require statement.';
      return { message, pass: false };
    } catch (transactionError: any) {
      const receivedText = `Received string: ${this.utils.printReceived(transactionError?.message ?? '')}`;
      const message = (): string => `Contract function failed a require statement.\n${receivedText}`;
      return { message, pass: true };
    }
  },
});
