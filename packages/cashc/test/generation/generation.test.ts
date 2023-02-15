/*   generation.test.ts
 *
 * - This file is used to test the IR and target code generation
 */

import { URL } from 'url';
import { compileFile } from '../../src/index.js';
import { fixtures } from './fixtures.js';

describe('Code generation & target code optimisation', () => {
  fixtures.forEach((fixture) => {
    it(`should compile ${fixture.fn} to correct Script and artifact`, () => {
      const artifact = compileFile(new URL(`../valid-contract-files/${fixture.fn}`, import.meta.url));
      expect(artifact).toEqual({ ...fixture.artifact, updatedAt: expect.any(String) });
    });
  });
});
