import { hexToBin, utf8ToBin } from '@bitauth/libauth';
import {
  asmToBytecode,
  asmToScript,
  bytecodeToAsm,
  bytecodeToScript,
  calculateBytesize,
  countOpcodes,
  encodeNullDataScript,
  optimiseBytecode,
  PositionHint,
  scriptToAsm,
  scriptToBytecode,
  SingleLocationData,
} from '../src/index.js';
import { optimisationReplacements } from '../src/optimisations.js';
import { fixtures } from './script.fixture.js';

describe('script utils', () => {
  describe('scriptToAsm()', () => {
    fixtures.forEach(({ name, script, asm }) => {
      it(`should convert script to asm for "${name}"`, () => {
        expect(scriptToAsm(script)).toEqual(asm);
      });
    });
  });

  describe('asmToScript()', () => {
    fixtures.forEach(({ name, script, asm }) => {
      it(`should convert asm to script for "${name}"`, () => {
        expect(asmToScript(asm)).toEqual(script);
      });
    });
  });

  describe('scriptToBytecode()', () => {
    fixtures.forEach(({ name, script, bytecode }) => {
      it(`should convert script to bytecode for "${name}"`, () => {
        expect(scriptToBytecode(script)).toEqual(bytecode);
      });
    });
  });

  describe('bytecodeToScript()', () => {
    fixtures.forEach(({ name, script, bytecode }) => {
      it(`should convert bytecode to script for "${name}"`, () => {
        expect(bytecodeToScript(bytecode)).toEqual(script);
      });
    });
  });

  describe('asmToBytecode()', () => {
    fixtures.forEach(({ name, asm, bytecode }) => {
      it(`should convert asm to bytecode for "${name}"`, () => {
        expect(asmToBytecode(asm)).toEqual(bytecode);
      });
    });
  });

  describe('bytecodeToAsm()', () => {
    fixtures.forEach(({ name, asm, bytecode }) => {
      it(`should convert bytecode to asm for "${name}"`, () => {
        expect(bytecodeToAsm(bytecode)).toEqual(asm);
      });
    });
  });

  describe('countOpcodes()', () => {
    fixtures.forEach(({ name, script, opcount }) => {
      it(`should count opcodes for "${name}"`, () => {
        expect(countOpcodes(script)).toEqual(opcount);
      });
    });
  });

  describe('calculateBytesize()', () => {
    fixtures.forEach(({ name, script, bytesize }) => {
      it(`should count opcodes for "${name}"`, () => {
        expect(calculateBytesize(script)).toEqual(bytesize);
      });
    });
  });

  describe('encodeNullDataScript()', () => {
    it('should encode an SLP genesis', () => {
      const input = [
        hexToBin('534c5000'),
        hexToBin('01'),
        utf8ToBin('GENESIS'),
        utf8ToBin('CSS'),
        utf8ToBin('CashScriptSLP'),
        utf8ToBin('https://cashscript.org/'),
        utf8ToBin(''),
        hexToBin('08'),
        hexToBin('02'),
        hexToBin('0000000000000001'),
      ];

      const output = hexToBin('04534c500001010747454e45534953034353530d43617368536372697074534c501768747470733a2f2f636173687363726970742e6f72672f4c0001080102080000000000000001');

      expect(encodeNullDataScript(input)).toEqual(output);
    });
  });

  describe.skip('TODO: generateContractBytecodeScript()', () => {
  });

  describe('optimiseBytecode()', () => {
    const location: SingleLocationData = {
      location: { start: { line: 1, column: 0 }, end: { line: 1, column: 0 } },
      positionHint: PositionHint.START,
    };

    it('should match a token-based reference implementation on random scripts', () => {
      let seed = 1;
      const random = (max: number): number => {
        seed = (seed * 16807) % 2147483647;
        return seed % max;
      };

      for (let i = 0; i < 500; i += 1) {
        // Scripts are built from rule patterns and loose tokens, so matches are frequent, adjacent and cascading
        const segments = Array.from({ length: 12 }, () => {
          if (random(2) === 0) return optimisationReplacements[random(optimisationReplacements.length)][0];
          return REFERENCE_TOKENS[random(REFERENCE_TOKENS.length)];
        });
        const script = asmToScript(segments.join(' '));

        const result = optimiseBytecode(script, script.map(() => location), [], [], [], [], 0);

        expect(scriptToAsm(result.script)).toEqual(referenceOptimise(scriptToAsm(script)));
        expect(result.locationData).toHaveLength(result.script.length);
      }
    });
  });
});

const REFERENCE_TOKENS = [
  ...new Set(optimisationReplacements.flatMap(([pattern, replacement]) => `${pattern} ${replacement}`.split(/\s+/))),
  'beef',
  '0102',
].filter((token) => token !== '');

// Applies every optimisation left-to-right without overlap (like a global regex replace), until a fixed point
function referenceOptimise(asm: string): string {
  let tokens = asm.split(' ').filter((token) => token !== '');
  let previous: string;

  do {
    previous = tokens.join(' ');
    for (const [pattern, replacement] of optimisationReplacements) {
      tokens = replaceTokens(tokens, pattern.split(' '), replacement === '' ? [] : replacement.split(' '));
    }
  } while (tokens.join(' ') !== previous);

  return previous;
}

function replaceTokens(tokens: string[], pattern: string[], replacement: string[]): string[] {
  const result: string[] = [];

  for (let i = 0; i < tokens.length;) {
    if (pattern.every((token, j) => tokens[i + j] === token)) {
      result.push(...replacement);
      i += pattern.length;
    } else {
      result.push(tokens[i]);
      i += 1;
    }
  }

  return result;
}
