import { URL } from 'url';
import { getSubdirectories, readCashFiles } from '../test-utils.js';
import * as Errors from '../../src/Errors.js';
import * as Warnings from '../../src/Warnings.js';
import { compileString } from '../../src/index.js';
import type { CashScriptErrorListener } from '../../src/index.js';

const VALID_SOURCE = `
contract Test() {
  function unlock() {
    require(true);
  }
}
`;
const INVALID_SOURCE = 'contract Test() { function unlock() { require(true) } }';
const UNUSED_VARIABLE_SOURCE = `
contract Test() {
    function hello(sig s, pubkey pk) {
        string x = 'Hello';
        require(checkSig(s, pk));
    }
}
`;

describe('Compiler', () => {
  describe('Compilation errors', () => {
    const errorTypes = getSubdirectories(new URL('.', import.meta.url));

    errorTypes.forEach((errorType) => {
      describe(errorType.toString(), () => {
        readCashFiles(new URL(errorType, import.meta.url)).forEach((file) => {
          it(`${file.fn} should throw ${errorType}`, () => {
            // Retrieve the correct Error constructor from the Errors.ts file
            const expectedError = Errors[errorType as keyof typeof Errors];
            if (!expectedError) throw new Error(`Invalid test configuration: error ${errorType} does not exist`);

            expect(() => compileString(file.contents)).toThrow(expectedError);
          });
        });
      });
    });
  });

  describe('Compilation warnings', () => {
    const warningTypes = getSubdirectories(new URL('../warnings/', import.meta.url));

    warningTypes.forEach((warningType) => {
      describe(warningType.toString(), () => {
        readCashFiles(new URL(`../warnings/${warningType}`, import.meta.url)).forEach((file) => {
          it(`${file.fn} should report ${warningType}`, () => {
            // Retrieve the correct Warning constructor from the Warnings.ts file
            const expectedWarning = Warnings[warningType as keyof typeof Warnings];
            if (!expectedWarning) throw new Error(`Invalid test configuration: warning ${warningType} does not exist`);

            let warnings: Warnings.CashScriptWarning[] = [];
            try {
              compileString(file.contents, { warningListener: (reported) => { warnings = reported; } });
            } catch {
              // ignore compilation errors from later phases
            }

            expect(warnings).toContainEqual(expect.any(expectedWarning));
          });
        });
      });
    });
  });

  describe('Custom error listener', () => {
    it('uses the custom error listener for parse errors', () => {
      const errors: string[] = [];
      const errorListener: CashScriptErrorListener = {
        syntaxError(_recognizer, _offendingSymbol, line, charPositionInLine, message): void {
          errors.push(`${line}:${charPositionInLine}:${message}`);
          throw new Error('Custom parse error');
        },
      };

      expect(() => compileString(INVALID_SOURCE, { errorListener })).toThrow('Custom parse error');
      expect(errors).toHaveLength(1);
    });

    it('throws a ParseError after reporting to a non-throwing custom error listener', () => {
      const errors: string[] = [];
      const errorListener: CashScriptErrorListener = {
        syntaxError(_recognizer, _offendingSymbol, line, charPositionInLine, message): void {
          errors.push(`${line}:${charPositionInLine}:${message}`);
        },
      };

      expect(() => compileString(INVALID_SOURCE, { errorListener })).toThrow(Errors.ParseError);
      expect(errors).toHaveLength(1);
    });

    it('does not include custom error or warning listeners in compiler artifact options', () => {
      const errorListener: CashScriptErrorListener = {
        syntaxError(): void {
          throw new Error('Unexpected parse error');
        },
      };

      const compileOptions = { enforceLocktimeGuard: false, errorListener, warningListener: () => {} };
      const artifact = compileString(VALID_SOURCE, compileOptions);

      expect(artifact.compiler.options).toEqual({
        enforceFunctionParameterTypes: true,
        enforceLocktimeGuard: false,
      });
    });
  });

  describe('Custom warning listener', () => {
    it('uses the custom warning listener for compilation warnings', () => {
      const warnings: Warnings.CashScriptWarning[] = [];
      compileString(UNUSED_VARIABLE_SOURCE, { warningListener: (reported) => { warnings.push(...reported); } });

      expect(warnings).toHaveLength(1);
      expect(warnings[0]).toBeInstanceOf(Warnings.UnusedVariableWarning);
      expect(warnings[0].message).toEqual("Unused variable 'x' at Line 4, Column 8");
    });

    it('prints warnings with console.warn when no warning listener is provided', () => {
      const consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {});

      try {
        compileString(UNUSED_VARIABLE_SOURCE);
        expect(consoleWarn).toHaveBeenCalledTimes(1);
        expect(consoleWarn).toHaveBeenCalledWith("Warning: Unused variable 'x' at Line 4, Column 8");
      } finally {
        consoleWarn.mockRestore();
      }
    });
  });
});
