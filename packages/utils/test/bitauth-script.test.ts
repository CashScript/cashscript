import { asmToScript } from '../src/script.js';
import { buildLineToOpcodesMap, buildLineToAsmMap, formatBitAuthScript } from '../src/bitauth-script.js';
import { fixtures } from './fixtures/bitauth-script.fixture.js';
import { compileString } from 'cashc';

describe('Libauth Script formatting', () => {
  fixtures.forEach((fixture) => {
    describe(fixture.name, () => {
      const scriptBytecode = asmToScript(fixture.asmBytecode);

      // Note: this also tests the compiler (but the compiler is tested much more thoroughly in its own test suite)
      it('should generate a correct source map and bytecode from freshly compiled source code', () => {
        const artifact = compileString(fixture.sourceCode);
        expect(artifact.debug?.sourceMap).toEqual(fixture.sourceMap);
        expect(artifact.bytecode).toEqual(fixture.asmBytecode);
      });

      it('should build a line-to-opcodes map', () => {
        expect(buildLineToOpcodesMap(scriptBytecode, fixture.sourceMap)).toEqual(fixture.expectedLineToOpcodeMap);
      });

      it('should build a line-to-asm map', () => {
        expect(buildLineToAsmMap(scriptBytecode, fixture.sourceMap)).toEqual(fixture.expectedLineToAsmMap);
      });

      it('should format script as debugging output for BitAuth IDE', () => {
        const expectedBitAuthScript = fixture.expectedBitAuthScript.replace(/^\n+/, '').replace(/\n+$/, '');
        expect(formatBitAuthScript(scriptBytecode, fixture.sourceMap, fixture.sourceCode)).toBe(expectedBitAuthScript);
      });
    });
  });
});
