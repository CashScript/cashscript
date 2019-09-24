/*   AST.test.ts
 *
 * - This file is used to test the functioning of the AST Builder
 * - It creates an AST from test files, then outputs the source code for the AST,
 *   then creates an AST from that and outputs the source again. The outputs
 *   are asserted for equality.
 * - This only tests the consistency of the AST Builder, but not necessarily the
 *   correctness, which needs to be done in a different file. This could be done
 *   by storing the expected AST in JSON under the same name as the .cash file.
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
