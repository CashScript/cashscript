import './TestExtensions.js';

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
