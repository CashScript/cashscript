import './TestExtensions.js';

// The type parameters have to match the ones of Vitest's own Matchers interface for the declarations to merge
declare module 'vitest' {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface Matchers<R extends void | Promise<void> = void | Promise<void>, T = unknown> {
    toLog(value?: RegExp | string): R;
    toFailRequireWith(value: RegExp | string): R;
    toFailRequire(): R;
  }
}
