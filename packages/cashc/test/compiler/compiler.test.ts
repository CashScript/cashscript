/*   Compiler.test.ts
 *
 * - This file is used to test the overall functioning of the compiler.
 * - It tests successful compilation using fixture .cash files in ../valid-contract-files.
 * - It tests compile errors using fixture .cash files in respective Error directories.
 */

import path from 'path';
import { getSubdirectories, readCashFiles } from '../test-utils.js';
import * as Errors from '../../src/Errors.js';
import { compileString } from '../../src/index.js';

describe('Compiler', () => {
  describe('Successful compilation', () => {
    readCashFiles(path.join(__dirname, '..', 'valid-contract-files')).forEach((file) => {
      it(`${file.fn} should succeed`, () => {
        expect(() => compileString(file.contents)).not.toThrow();
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

            if (!expectedError) throw new Error(`Invalid test configuration: error ${errorType} does not exist`);

            expect(() => compileString(file.contents)).toThrow(expectedError);
          });
        });
      });
    });
  });
});
