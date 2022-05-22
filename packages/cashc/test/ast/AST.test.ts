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

import path from 'path';
import fs from 'fs';
import { fixtures } from './fixtures.js';
import { parseCode } from '../../src/compiler.js';
import { readCashFiles } from '../test-utils.js';
import { Ast } from '../../src/ast/AST.js';
import OutputSourceCodeTraversal from '../../src/print/OutputSourceCodeTraversal.js';

describe('AST Builder', () => {
  describe('AST correctness', () => {
    fixtures.forEach((fixture) => {
      it(`should build correct AST for ${fixture.fn}`, () => {
        const code = fs.readFileSync(path.join(__dirname, '..', 'valid-contract-files', fixture.fn), { encoding: 'utf-8' });
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

    readCashFiles(path.join(__dirname, '..', 'valid-contract-files')).forEach((f) => {
      it(`rebuilt AST should match initial AST for ${f.fn}`, () => {
        const { sourceOutput: initialOutput } = setup(f.contents);
        const { sourceOutput: rerunOutput } = setup(initialOutput);
        expect(rerunOutput).toEqual(initialOutput);
      });
    });
  });
});
