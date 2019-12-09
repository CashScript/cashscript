/*   generation.test.ts
 *
 * - This file is used to test the IR and target code generation
 */

import * as chai from 'chai';
import chaiExclude from 'chai-exclude';
import * as path from 'path';
import { CashCompiler } from '../../src/util';
import { fixtures } from './fixtures';

chai.use(chaiExclude);
const { assert } = chai;

describe('Code generation & target code optimisation', () => {
  fixtures.forEach((fixture) => {
    it(`should compile ${fixture.fn} to correct Script and artifact`, () => {
      const artifact = CashCompiler.compileFile(path.join(__dirname, '..', 'fixture', fixture.fn));

      assert.deepEqualExcluding(artifact, fixture.artifact, 'updatedAt');
    });
  });
});
