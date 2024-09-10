import { jest } from '@jest/globals';
import { inspect } from 'util';
inspect.defaultOptions.depth = 10;

jest.setTimeout(50000);

globalThis.jest = jest;

