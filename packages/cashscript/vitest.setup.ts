import { inspect } from 'util';
import { expect } from 'vitest';
import { toFailRequire, toFailRequireWith, toLog } from './src/test/VitestExtensions.js';

inspect.defaultOptions.depth = 10;

expect.extend({
  toLog,
  toFailRequire,
  toFailRequireWith,
});