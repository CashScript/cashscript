/*   generation.test.ts
 *
 * - This file is used to test the IR and target code generation
 */

import path from 'path';
import { compileFile } from '../../src/index.js';
import { fixtures } from './fixtures.js';

describe('Code generation & target code optimisation', () => {
  fixtures.forEach((fixture) => {
    it(`should compile ${fixture.fn} to correct Script and artifact`, () => {
      const artifact = compileFile(path.join(__dirname, '..', 'valid-contract-files', fixture.fn));
      expect(artifact).toEqual({ ...fixture.artifact, updatedAt: expect.any(String) });
    });
  });
});
