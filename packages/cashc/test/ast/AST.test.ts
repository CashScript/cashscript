/*   generation.test.ts
 *
 * - This file is used to test the AST building
 */

import * as chai from 'chai';
import chaiExclude from 'chai-exclude';
import * as path from 'path';
import * as fs from 'fs';
import { fixtures } from './fixtures';
import { parseCode } from '../../src/util';

chai.use(chaiExclude);

const { assert } = chai;

describe('AST Builder', () => {
  fixtures.forEach((fixture) => {
    it(`should build correct AST for ${fixture.fn}`, () => {
      const code = fs.readFileSync(path.join(__dirname, '..', 'fixture', fixture.fn), { encoding: 'utf-8' });
      const ast = parseCode(code);
      assert.deepEqualExcludingEvery(ast, fixture.ast, 'location');
    });
  });
});
