import { MatcherContext } from '@jest/expect';
import { SyncExpectationResult } from 'expect';
import { DebugResults } from '../debugging.js';

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
  debug(): DebugResults | Promise<DebugResults>;
}

expect.extend({
  toLog(
    this: MatcherContext,
    transaction: Debuggable,
    match?: RegExp | string,
  ): SyncExpectationResult {
    const loggerSpy = jest.spyOn(console, 'log');

    // Clear any previous calls (if spy reused accidentally)
    loggerSpy.mockClear();

    // silence actual stdout output
    loggerSpy.mockImplementation(() => { });

    try {
      executeDebug(transaction);
    } catch (error) {
      if (error instanceof OldTransactionBuilderError) throw error;
    }

    // We concatenate all the logs into a single string - if no logs are present, we set received to undefined
    const receivedBase = loggerSpy.mock.calls.reduce((acc, [log]) => `${acc}\n${log}`, '').trim();
    const received = receivedBase === '' ? undefined : receivedBase;

    const matcherHint = this.utils.matcherHint('toLog', 'received', 'expected', { isNot: this.isNot });
    const expectedText = `Expected: ${this.isNot ? 'not ' : ''}${this.utils.printExpected(match)}`;
    const receivedText = `Received: ${this.utils.printReceived(received)}`;
    const message = (): string => `${matcherHint}\n\n${expectedText}\n${receivedText}`;

    try {
      // We first check if the expected string is present in any of the individual console.log calls
      expect(loggerSpy).toHaveBeenCalledWith(match ? expect.stringMatching(match) : expect.anything());
    } catch {
      try {
        // We add this extra check to allow expect().toLog() to check multiple console.log calls in a single test
        // (e.g. for log ordering), which would fail the first check because that compares the individual console.log calls
        expect(receivedBase).toMatch(match ? match : expect.anything());
      } catch {
        return { message, pass: false };
      }
    } finally {
      // Restore the original console.log implementation
      loggerSpy.mockRestore();
    }

    return { message, pass: true };
  },
});

expect.extend({
  toFailRequireWith(
    this: MatcherContext,
    transaction: Debuggable,
    match: RegExp | string,
  ): SyncExpectationResult {
    try {
      executeDebug(transaction);

      const matcherHint = this.utils.matcherHint('.toFailRequireWith', undefined, match.toString(), { isNot: this.isNot });
      const message = (): string => `${matcherHint}\n\nContract function did not fail a require statement.`;
      return { message, pass: false };
    } catch (transactionError: any) {
      if (transactionError instanceof OldTransactionBuilderError) throw transactionError;

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
  toFailRequire(
    this: MatcherContext,
    transaction: Debuggable,
  ): SyncExpectationResult {
    try {
      executeDebug(transaction);
      const message = (): string => 'Contract function did not fail a require statement.';
      return { message, pass: false };
    } catch (transactionError: any) {
      if (transactionError instanceof OldTransactionBuilderError) throw transactionError;

      const receivedText = `Received string: ${this.utils.printReceived(transactionError?.message ?? '')}`;
      const message = (): string => `Contract function failed a require statement.\n${receivedText}`;
      return { message, pass: true };
    }
  },
});


// Wrapper function with custom error in case people use it with the old transaction builder
// This is a temporary solution until we fully remove the old transaction builder from the SDK
const executeDebug = (transaction: Debuggable): void => {
  const debugResults = transaction.debug();

  if (debugResults instanceof Promise) {
    debugResults.catch(() => { });
    throw new OldTransactionBuilderError();
  }
};

class OldTransactionBuilderError extends Error {
  constructor() {
    super('The CashScript JestExtensions do not support the old transaction builder since v0.11.0. Please use the new TransactionBuilder class.');
    this.name = 'OldTransactionBuilderError';
  }
}
