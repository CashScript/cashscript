/*   Pragma.test.ts
 *
 * - This file is used to test the functioning of the pragma directives.
 */

import * as path from 'path';
import { readCashFiles } from '../test-util';
import { parseCode } from '../../src/util';
import { VersionError } from '../../src';

describe('Pragma version', () => {
  readCashFiles(path.join(__dirname, 'version')).forEach((f) => {
    it(`${f.fn} should throw VersionError`, () => {
      expect(() => parseCode(f.contents)).toThrow(VersionError);
    });
  });
});
