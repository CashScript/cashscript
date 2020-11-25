/*   generation.test.ts
 *
 * - This file is used to test the IR and target code generation
 */

import path from 'path';
import { CashCompiler } from '../../src/CashCompiler';
import { fixtures } from './fixtures';

describe('Code generation & target code optimisation', () => {
  fixtures.forEach((fixture) => {
    it(`should compile ${fixture.fn} to correct Script and artifact`, () => {
      const artifact = CashCompiler.compileFile(path.join(__dirname, '..', 'valid-contract-files', fixture.fn));
      expect(artifact).toEqual({ ...fixture.artifact, updatedAt: expect.any(String) });
    });
  });
});
