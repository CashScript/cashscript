import { asmToScript, bytecodeToScript, scriptToAsm } from '../src/script.js';
import { buildLineToAsmMap, formatBitAuthScript } from '../src/bitauth-script.js';
import { fixtures } from './fixtures/bitauth-script.fixture.js';
import { compileString } from 'cashc';
import { hexToBin } from '@bitauth/libauth';

describe('Libauth Script formatting', () => {
  fixtures.forEach((fixture) => {
    describe(fixture.name, () => {
      const scriptBytecode = asmToScript(fixture.asmBytecode);

      // Note: this also tests the compiler (but the compiler is tested much more thoroughly in its own test suite)
      it('should generate a correct source map and bytecode from freshly compiled source code', () => {
        const artifact = compileString(fixture.sourceCode);
        expect(artifact.debug?.sourceMap).toEqual(fixture.sourceMap);
        expect(artifact.debug?.sourceTags).toEqual(fixture.sourceTags);
        expect(artifact.bytecode).toEqual(fixture.asmBytecode);
      });

      it('should build a line-to-asm map', () => {
        expect(buildLineToAsmMap(scriptBytecode, fixture.sourceMap)).toEqual(fixture.expectedLineToAsmMap);
      });

      it('should format script as debugging output for BitAuth IDE', () => {
        const expectedBitAuthScript = fixture.expectedBitAuthScript.replace(/^\n+/, '').replace(/\n+$/, '');
        const formattedBitAuthScript = formatBitAuthScript(
          scriptBytecode, fixture.sourceMap, fixture.sourceCode, fixture.sourceTags,
        );
        expect(formattedBitAuthScript).toBe(expectedBitAuthScript);
      });
    });
  });

  // The debugging VM executes the ASM column of formatBitAuthScript's output (grouped by display line), so it must
  // equal the real bytecode in order. This used to break for single-line contracts (and any source where an epilogue
  // annotation shares the body's line), producing a reordered script and spurious "empty stack" failures.
  describe('preserves bytecode order in the executed output', () => {
    // The ASM tokens that the debugging VM actually executes: the part of each line before the `/* source */` comment.
    const reconstructExecutedAsm = (formatted: string): string => formatted
      .split('\n')
      .map((line) => line.split('/*')[0].trim())
      .filter(Boolean)
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim();

    const cases = {
      'single-line ternary': 'contract C(){ function f(int a, int b, int e){ int r = a == 0 ? b : 3; require(r == e); } }',
      'single-line if-statement': 'contract C(){ function f(int a, int b, int e){ int r = b; if (a == 0) { r = b; } require(r == e); } }',
      'multi-line ternary': 'contract C() {\n  function f(int a, int b, int e) {\n    int r = a == 0 ? b : 3;\n    require(r == e);\n  }\n}',
      'for-loop': 'contract C() {\n  function f(int n, int e) {\n    int sum = 0;\n    for (int i = 0; i < n; i = i + 1) {\n      sum = sum + i;\n    }\n    require(sum == e);\n  }\n}',
    };

    Object.entries(cases).forEach(([name, sourceCode]) => {
      it(`keeps the executed ASM equal to the real bytecode for a ${name}`, () => {
        const artifact = compileString(sourceCode);
        const script = bytecodeToScript(hexToBin(artifact.debug!.bytecode));
        const realAsm = scriptToAsm(script);
        const formatted = formatBitAuthScript(
          script, artifact.debug!.sourceMap, artifact.source, artifact.debug!.sourceTags,
        );
        expect(reconstructExecutedAsm(formatted)).toBe(realAsm);
      });
    });
  });
});
