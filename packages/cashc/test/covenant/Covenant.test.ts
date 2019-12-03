/*   Covenant.test.ts
 *
 * - This file is used to test the functioning of covenant verification.
 * - It tests whether covenant contracts throw an UnverifiedCovenantError if
 *   they don't include any require(checkSig(...)) calls.
 */

import { assert } from 'chai';
import * as path from 'path';
import { readCashFiles } from '../test-util';
import { Ast } from '../../src/ast/AST';
import { UnverifiedCovenantError } from '../../src/Errors';
import { parseCode } from '../../src/util';
import SymbolTableTraversal from '../../src/semantic/SymbolTableTraversal';
import TypeCheckTraversal from '../../src/semantic/TypeCheckTraversal';
import VerifyCovenantTraversal from '../../src/semantic/VerifyCovenantTraversal';

interface TestSetup {
  ast: Ast,
  traversal: VerifyCovenantTraversal,
}

function setup(input: string): TestSetup {
  let ast = parseCode(input);
  ast = ast.accept(new SymbolTableTraversal()) as Ast;
  ast = ast.accept(new TypeCheckTraversal()) as Ast;
  const traversal = new VerifyCovenantTraversal();

  return { ast, traversal };
}

describe('Covenant Check', () => {
  describe('UnverifiedCovenantError', () => {
    const testCases = readCashFiles(path.join(__dirname, 'UnverifiedCovenantError'));
    testCases.forEach((f) => {
      it(`${f.fn} should throw UnverifiedCovenantError`, () => {
        const { ast, traversal } = setup(f.contents);
        assert.throws(() => {
          ast.accept(traversal);
        }, UnverifiedCovenantError);
      });
    });
  });
});
