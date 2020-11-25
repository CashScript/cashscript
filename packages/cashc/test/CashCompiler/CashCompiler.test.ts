/*   CashCompiler.test.ts
 *
 * - This file is used to test the overall functioning of the compiler.
 * - It tests successful compilation using fixture .cash files in ../valid-contract-files.
 * - It tests compile errors using fixture .cash files in respective Error directories.
 */

import path from 'path';
import { getSubdirectories, readCashFiles } from '../test-util';
import * as Errors from '../../src/Errors';
import { CashCompiler } from '../../src/CashCompiler';

describe('CashCompiler', () => {
  describe('Successful compilation', () => {
    readCashFiles(path.join(__dirname, '..', 'valid-contract-files')).forEach((file) => {
      it(`${file.fn} should succeed`, () => {
        expect(() => CashCompiler.compileString(file.contents)).not.toThrow();
      });
    });
  });

  describe('Compilation errors', () => {
    const errorTypes = getSubdirectories(__dirname);

    errorTypes.forEach((errorType) => {
      describe(errorType, () => {
        readCashFiles(path.join(__dirname, errorType)).forEach((file) => {
          it(`${file.fn} should throw ${errorType}`, () => {
            // Retrieve the correct Error constructor from the Errors.ts file
            const expectedError = Errors[errorType as keyof typeof Errors];

            expect(() => CashCompiler.compileString(file.contents)).toThrow(expectedError);
          });
        });
      });
    });
  });
});
