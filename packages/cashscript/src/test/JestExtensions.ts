import { vi } from 'vitest';
import { Transaction } from '../index.js';

export {};

declare global {
  namespace Vi {
    interface Assertion {
      toLog(value?: RegExp | string): Promise<void>;
      toFailRequireWith(value: RegExp | string): Promise<void>;
      toFailRequire(): Promise<void>;
    }
  }
}

expect.extend({
  async toLog(
    transaction: Transaction,
    match?: RegExp | string,
  ) {
    const loggerSpy = vi.spyOn(console, 'log');

    // Silence actual stdout output
    loggerSpy.mockImplementation(() => {});
    try { await transaction.debug(); } catch {}

    // Concatenate all logs into a single string - if no logs are present, set received to undefined
    const receivedBase = loggerSpy.mock.calls.reduce((acc: string, call: any[]) => {
      const log = typeof call[0] === 'string' ? call[0] : '';
      return `${acc}\n${log}`;
    }, '').trim();
    
    const received = receivedBase === '' ? undefined : receivedBase;

    const matcherHint = this.utils.matcherHint('toLog', 'received', 'expected', { isNot: this.isNot });
    const expectedText = `Expected: ${this.isNot ? 'not ' : ''}${this.utils.printExpected(match)}`;
    const receivedText = `Received: ${this.utils.printReceived(received)}`;
    const message = (): string => `${matcherHint}\n\n${expectedText}\n${receivedText}`;

    const pass = loggerSpy.mock.calls.some((call: any[]) => {
      const log = typeof call[0] === 'string' ? call[0] : '';
      return match ? expect.stringMatching(match).asymmetricMatch(log) : true;
    });    

    loggerSpy.mockClear();

    return { message, pass };
  },
  async toFailRequireWith(
    transaction: Transaction,
    match: RegExp | string,
  ) {
    // Normalize multiline strings by replacing all whitespace and line breaks with single spaces
    const normalizeMultiline = (str: string): string => str.replace(/\s+/g, ' ').trim();

    try {
      await transaction.debug();
      
      // If no error is thrown, test fails as the require statement did not trigger
      const matcherHint = this.utils.matcherHint('.toFailRequireWith', undefined, match.toString(), { isNot: this.isNot });
      const message = (): string => `${matcherHint}\n\nContract function did not fail a require statement.`;
      return { message, pass: false };
    } catch (transactionError: any) {
      const matcherHint = this.utils.matcherHint('toFailRequireWith', 'received', 'expected', { isNot: this.isNot });
      
      // Normalize both expected and received strings to avoid issues from line breaks and extra spaces
      const normalizedExpected = normalizeMultiline(typeof match === 'string' ? match : match.toString());
      const normalizedReceived = normalizeMultiline(transactionError?.message ?? '');

      const expectedText = `Expected pattern: ${this.isNot ? 'not ' : ''}${this.utils.printExpected(normalizedExpected)}`;
      const receivedText = `Received string: ${this.utils.printReceived(normalizedReceived)}`;
      const message = (): string => `${matcherHint}\n\n${expectedText}\n${receivedText}`;

      // Check if the normalized expected string is included in the normalized received string
      const pass = normalizedReceived.includes(normalizedExpected);

      return { message, pass };
    }
  },
  async toFailRequire(
    transaction: Transaction,
  ) {
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
