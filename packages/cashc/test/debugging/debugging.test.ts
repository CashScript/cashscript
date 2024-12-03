/*   debugging.test.ts
 *
 * - This file is used to test the debugging functionality (console.log and require messages)
 */

import { URL } from 'url';
import { compileFile } from '../../src/index.js';
import { fixtures } from './fixtures.js';

describe('Debugging', () => {
  fixtures.forEach((fixture) => {
    it(`should compile ${fixture.fn} to the same bytecode as ${fixture.fnWithLogs}`, () => {
      const artifact = compileFile(new URL(`../valid-contract-files/${fixture.fn}`, import.meta.url));
      const artifactWithLogs = compileFile(new URL(`../valid-contract-files/${fixture.fnWithLogs}`, import.meta.url));
      expect(artifactWithLogs.bytecode).toEqual(artifact.bytecode);
    });
  });
});
