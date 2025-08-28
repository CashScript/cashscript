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
import { describe, expect, it } from 'vitest';

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
});
