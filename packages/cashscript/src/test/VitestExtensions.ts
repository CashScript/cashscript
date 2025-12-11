import { DebugResults } from '../debugging.js';
import type { MatcherState } from '@vitest/expect';

interface Debuggable {
  debug(): DebugResults | Promise<DebugResults>;
}

interface ExpectationResult {
  pass: boolean
  message: () => string
  // If you pass these, they will automatically appear inside a diff when
  // the matcher does not pass, so you don't need to print the diff yourself
  actual?: unknown
  expected?: unknown
}

export function toLog(
  this: MatcherState,
  transaction: Debuggable,
  match?: RegExp | string,
): ExpectationResult {
  const loggerSpy = vi.spyOn(console, 'log');
  const { utils, isNot } = this;

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

  const matcherHint = utils.matcherHint('toLog', 'received', 'expected', { isNot: isNot });
  const expectedText = `Expected: ${isNot ? 'not ' : ''}${utils.printExpected(match)}`;
  const receivedText = `Received: ${utils.printReceived(received)}`;
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
}

export function toFailRequireWith(
  this: MatcherState,
  transaction: Debuggable,
  match: RegExp | string,
): ExpectationResult {
  const { utils, isNot } = this;
  try {
    transaction.debug();
    const matcherHint = utils.matcherHint('.toFailRequireWith', undefined, match.toString(), { isNot: isNot });
    const message = (): string => `${matcherHint}\n\nContract function did not fail a require statement.`;
    return { message, pass: false };
  } catch (transactionError: any) {
    const matcherHint = utils.matcherHint('toFailRequireWith', 'received', 'expected', { isNot: isNot });
    const expectedText = `Expected pattern: ${isNot ? 'not ' : ''}${utils.printExpected(match)}`;
    const receivedText = `Received string: ${utils.printReceived(transactionError?.message ?? '')}`;
    const message = (): string => `${matcherHint}\n\n${expectedText}\n${receivedText}`;

    try {
      expect(transactionError?.message ?? '').toMatch(match);
      return { message, pass: true };
    } catch {
      return { message, pass: false };
    }
  }
}

export function toFailRequire(
  this: MatcherState,
  transaction: Debuggable,
): ExpectationResult {
  const { utils } = this;
  try {
    transaction.debug();
    const message = (): string => 'Contract function did not fail a require statement.';
    return { message, pass: false };
  } catch (transactionError: any) {
    const receivedText = `Received string: ${utils.printReceived(transactionError?.message ?? '')}`;
    const message = (): string => `Contract function failed a require statement.\n${receivedText}`;
    return { message, pass: true };
  }
}

// Extend Vitest with the custom matchers, this file needs to be imported in the vitest.setup.ts file or the test file
expect.extend({
  toLog,
  toFailRequire,
  toFailRequireWith,
});
