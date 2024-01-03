import { asmToScript } from '../src/script.js';
import { buildLineToOpcodesMap, buildLineToAsmMap, formatBitAuthScript } from '../src/libauth.js';
import { fixtures } from './fixtures/libauth.fixture.js';

describe('Libauth Script formatting', () => {

  fixtures.forEach((fixture) => {
    describe(fixture.name, () => {
      const scriptBytecode = asmToScript(fixture.asmBytecode);

      it('should build a line-to-opcodes map', () => {
        expect(buildLineToOpcodesMap(scriptBytecode, fixture.sourceMap)).toEqual(fixture.expectedLineToOpcodeMap);
      });

      it('should build a line-to-asm map', () => {
        expect(buildLineToAsmMap(scriptBytecode, fixture.sourceMap)).toEqual(fixture.expectedLineToAsmMap);
      });

      it('should format script as debugging output for BitAuth IDE', () => {
        expect(formatBitAuthScript(scriptBytecode, fixture.sourceMap, fixture.sourceCode)).toBe(fixture.expectedBitAuthScript);
      });
    });
  });
});
