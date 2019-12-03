/*   Pragma.test.ts
 *
 * - This file is used to test the functioning of the pragma directives.
 */

import { assert } from 'chai';
import * as path from 'path';
import { readCashFiles } from '../test-util';
import { parseCode } from '../../src/util';
import { VersionError } from '../../src';

describe('Pragma version', () => {
  const testCases = readCashFiles(path.join(__dirname, 'version'));
  testCases.forEach((f) => {
    it(`${f.fn} should throw VersionError`, () => {
      assert.throws(() => {
        parseCode(f.contents);
      }, VersionError);
    });
  });
});
