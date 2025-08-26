// vitest.d.ts
import 'vitest';

declare module 'vitest' {
  interface CustomMatchers<T = any> extends CustomMatchers<T> {
    toLog(value?: RegExp | string): Promise<void>;
    toFailRequireWith(value: RegExp | string): Promise<void>;
    toFailRequire(): Promise<void>;
  }
}

declare module 'vitest' {
  interface Matchers<T = any> extends CustomMatchers<T> {}
}