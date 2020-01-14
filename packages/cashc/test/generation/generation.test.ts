/*   generation.test.ts
 *
 * - This file is used to test the IR and target code generation
 */

import * as path from 'path';
import { CashCompiler } from '../../src/util';
import { fixtures } from './fixtures';

describe('Code generation & target code optimisation', () => {
  fixtures.forEach((fixture) => {
    it(`should compile ${fixture.fn} to correct Script and artifact`, () => {
      const artifact = CashCompiler.compileFile(path.join(__dirname, '..', 'fixture', fixture.fn));
      expect(artifact).toEqual({ ...fixture.artifact, updatedAt: expect.any(String) });
    });
  });
});
