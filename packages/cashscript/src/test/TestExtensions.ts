import { DebugResults } from '../debugging.js';

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
  debug(): DebugResults;
}

type TestFramework = typeof vi;
const testFramework: TestFramework = (globalThis as any).vi ?? (globalThis as any).jest;

// Extend Vitest with the custom matchers, this file needs to be imported in the vitest.setup.ts file or the test file
expect.extend({
  toLog(
    transaction: Debuggable,
    match?: RegExp | string,
  ) {
    const loggerSpy = testFramework.spyOn(console, 'log');

    // Clear any previous calls (if spy reused accidentally)
    loggerSpy.mockClear();

    // silence actual stdout output
    loggerSpy.mockImplementation(() => { });

    // Run debug, ignoring any errors because we only care about the logs, even if the transaction fails
    try {
      transaction.debug();
    } catch (error) { }

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
  toFailRequire(
    transaction: Debuggable,
  ) {
    try {
      transaction.debug();
      const message = (): string => 'Contract function did not fail a require statement.';
      return { message, pass: false };
    } catch (transactionError: any) {
      const receivedText = `Received string: ${this.utils.printReceived(transactionError?.message ?? '')}`;
      const message = (): string => `Contract function failed a require statement.\n${receivedText}`;
      return { message, pass: true };
    }
  },
  toFailRequireWith(
    transaction: Debuggable,
    match: RegExp | string,
  ) {
    try {
      transaction.debug();
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
});

export { };
