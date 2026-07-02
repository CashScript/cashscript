import { binToHex, createCompilerBch } from '@bitauth/libauth';
import { Artifact } from '../src/artifact.js';
import { asmToScript, scriptToBytecode } from '../src/script.js';
import { buildLineToAsmMap, formatBitAuthScript } from '../src/bitauth-script.js';
import { FunctionFixture, fixtures, functionFixtures } from './fixtures/bitauth-script.fixture.js';
import { compileFile, compileString } from 'cashc';

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
        const debugInformation = {
          bytecode: binToHex(scriptToBytecode(scriptBytecode)),
          sourceMap: fixture.sourceMap,
          logs: [],
          requires: [],
          ...(fixture.sourceTags ? { sourceTags: fixture.sourceTags } : {}),
        };
        const formattedBitAuthScript = formatBitAuthScript(debugInformation, fixture.sourceCode);
        expect(formattedBitAuthScript).toBe(expectedBitAuthScript);
        expectBitAuthScriptToCompileTo(formattedBitAuthScript, debugInformation.bytecode);
      });
    });
  });

  describe('Bytecode order preservation', () => {
    it('should emit opcodes in bytecode order even for non-monotonic source maps', () => {
      // OP_3 maps back to line 3 after line-4 opcodes — grouping by source line would reorder execution.
      // The formatted output is executed, so bytecode order must win over source-line grouping.
      const scriptBytecode = asmToScript('OP_1 OP_2 OP_ADD OP_3 OP_NUMEQUAL');
      const debugInformation = {
        bytecode: binToHex(scriptToBytecode(scriptBytecode)),
        sourceMap: '3:8:3:9;4:8:4:9;:12::13;3:12:3:13;5:8:5:9',
        logs: [],
        requires: [],
      };
      const sourceCode = 'line 1\nline 2\nline 3\nline 4\nline 5';

      const formattedBitAuthScript = formatBitAuthScript(debugInformation, sourceCode);
      expectBitAuthScriptToCompileTo(formattedBitAuthScript, debugInformation.bytecode);
    });
  });

  describe('User-defined function formatting', () => {
    const compileFixture = (fixture: FunctionFixture): Artifact => (fixture.file
      ? compileFile(new URL(`./fixtures/${fixture.file}`, import.meta.url))
      : compileString(fixture.sourceCode!));

    functionFixtures.forEach((fixture) => {
      describe(fixture.name, () => {
        it('should format function definitions as source-mapped push groups', () => {
          const artifact = compileFixture(fixture);
          const expectedBitAuthScript = fixture.expectedBitAuthScript.replace(/^\n+/, '').replace(/\n+$/, '');
          expect(formatBitAuthScript(artifact.debug!, artifact.source)).toBe(expectedBitAuthScript);
        });

        it('should compile back to the exact original bytecode', () => {
          const artifact = compileFixture(fixture);
          const formattedBitAuthScript = formatBitAuthScript(artifact.debug!, artifact.source);
          expectBitAuthScriptToCompileTo(formattedBitAuthScript, artifact.debug!.bytecode);
        });
      });
    });
  });
});

// The formatted output is executed by the BitAuth IDE (and hashed into the P2SH address), so it must
// compile back to the exact bytecode it was generated from
function expectBitAuthScriptToCompileTo(bitAuthScript: string, expectedBytecodeHex: string): void {
  const compiler = createCompilerBch({ scripts: { formatted: bitAuthScript } });
  const result = compiler.generateBytecode({ scriptId: 'formatted', data: {} });
  if (!result.success) throw new Error(`BitAuth Script failed to compile: ${JSON.stringify(result.errors)}`);
  expect(binToHex(result.bytecode)).toBe(expectedBytecodeHex);
}
