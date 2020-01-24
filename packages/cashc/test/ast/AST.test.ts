/*   AST.test.ts
 *
 * - This file is used to test the functioning of the AST Builder
 * - It creates an AST from test files, then outputs the source code for the AST,
 *   then creates an AST from that and outputs the source again. The outputs
 *   are asserted for equality.
 * - This only tests the consistency of the AST Builder, but not necessarily the
 *   correctness. Therefore, some correctness testing is also done with hardcoded
 *   fixtures.
 */

import * as path from 'path';
import * as fs from 'fs';
import { fixtures } from './fixtures';
import { parseCode } from '../../src/util';
import { readCashFiles } from '../test-util';
import { Ast } from '../../src/ast/AST';
import OutputSourceCodeTraversal from '../../src/print/OutputSourceCodeTraversal';

describe('AST Builder', () => {
  describe('AST correctness', () => {
    fixtures.forEach((fixture) => {
      it(`should build correct AST for ${fixture.fn}`, () => {
        const code = fs.readFileSync(path.join(__dirname, '..', 'fixture', fixture.fn), { encoding: 'utf-8' });
        const ast = parseCode(code);
        expect(ast).toMatchObject(fixture.ast);
      });
    });
  });

  describe('AST consistency', () => {
    interface TestSetup {
      ast: Ast,
      sourceOutput: string
    }

    function setup(input: string): TestSetup {
      const ast = parseCode(input);
      const traversal = new OutputSourceCodeTraversal();
      ast.accept(traversal);

      return { ast, sourceOutput: traversal.output };
    }

    readCashFiles(path.join(__dirname, '..', 'syntax', 'success')).forEach((f) => {
      it(`rebuilt AST should match initial AST for ${f.fn}`, () => {
        const { sourceOutput: initialOutput } = setup(f.contents);
        const { sourceOutput: rerunOutput } = setup(initialOutput);
        expect(rerunOutput).toEqual(initialOutput);
      });
    });
  });
});
