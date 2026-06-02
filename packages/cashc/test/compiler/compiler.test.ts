/*   Compiler.test.ts
 *
 * - This file is used to test the overall functioning of the compiler.
 * - It tests successful compilation using fixture .cash files in ../valid-contract-files.
 * - It tests compile errors using fixture .cash files in respective Error directories.
 */

import { URL } from 'url';
import { getSubdirectories, readCashFiles } from '../test-utils.js';
import * as Errors from '../../src/Errors.js';
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

describe('Compiler', () => {
  describe('Successful compilation', () => {
    readCashFiles(new URL('../valid-contract-files', import.meta.url)).forEach((file) => {
      it(`${file.fn} should succeed`, () => {
        expect(() => compileString(file.contents)).not.toThrow();
      });
    });
  });

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

    it('does not include custom error listeners in compiler artifact metadata', () => {
      const errorListener: CashScriptErrorListener = {
        syntaxError(): void {
          throw new Error('Unexpected parse error');
        },
      };

      const artifact = compileString(VALID_SOURCE, { errorListener });

      expect(artifact.compiler).not.toHaveProperty('errorListener');
      expect(artifact.compiler).not.toHaveProperty('options');
    });
  });
});
