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

import fs from 'fs';
import { URL } from 'url';
import urlJoin from 'url-join';
import { fixtures } from './fixtures.js';
import { parseCode } from '../../src/compiler.js';
import { readCashFiles } from '../test-utils.js';
import { Ast } from '../../src/ast/AST.js';
import OutputSourceCodeTraversal from '../../src/print/OutputSourceCodeTraversal.js';


const VALID_CONTRACT_FILES = new URL('../valid-contract-files', import.meta.url);

describe('AST Builder', () => {
  describe('AST correctness', () => {
    fixtures.forEach((fixture) => {
      it(`should build correct AST for ${fixture.fn}`, () => {
        const url = new URL(urlJoin(VALID_CONTRACT_FILES.toString(), fixture.fn));
        const code = fs.readFileSync(url, { encoding: 'utf-8' });
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

    readCashFiles(VALID_CONTRACT_FILES).forEach((f) => {
      it(`rebuilt AST should match initial AST for ${f.fn}`, () => {
        const { sourceOutput: initialOutput } = setup(f.contents);
        const { sourceOutput: rerunOutput } = setup(initialOutput);
        expect(rerunOutput).toEqual(initialOutput);
      });
    });
  });
});
