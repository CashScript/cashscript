/*   SymbolTable.test.ts
 *
 * - This file is used to test the functioning of the symbol table.
 * - It has three different test categories: success, undefined and redefinition.
 */

import { assert } from 'chai';
import * as path from 'path';
import { readCashFiles } from '../test-util';
import SymbolTableTraversal from '../../src/semantic/SymbolTableTraversal';
import { Ast } from '../../src/ast/AST';
import { UndefinedReferenceError, RedefinitionError, UnusedVariableError } from '../../src/Errors';
import { parseCode } from '../../src/sdk';

interface TestSetup {
  ast: Ast,
  traversal: SymbolTableTraversal,
}

function setup(input: string): TestSetup {
  const ast = parseCode(input);
  const traversal = new SymbolTableTraversal();

  return { ast, traversal };
}

describe('Symbol Table', () => {
  describe('RedefinitionError', () => {
    const testCases = readCashFiles(path.join(__dirname, 'RedefinitionError'));
    testCases.forEach((f) => {
      it(`${f.fn} should throw RedefinitionError`, () => {
        const { ast, traversal } = setup(f.contents);
        assert.throws(() => {
          ast.accept(traversal);
        }, RedefinitionError);
      });
    });
  });

  describe('UndefinedReferenceError', () => {
    const testCases = readCashFiles(path.join(__dirname, 'UndefinedReferenceError'));
    testCases.forEach((f) => {
      it(`${f.fn} should throw UndefinedReferenceError`, () => {
        const { ast, traversal } = setup(f.contents);
        assert.throws(() => {
          ast.accept(traversal);
        }, UndefinedReferenceError);
      });
    });
  });

  describe('UnusedVariableError', () => {
    const testCases = readCashFiles(path.join(__dirname, 'UnusedVariableError'));
    testCases.forEach((f) => {
      it(`${f.fn} should throw UnusedVariableError`, () => {
        const { ast, traversal } = setup(f.contents);
        assert.throws(() => {
          ast.accept(traversal);
        }, UnusedVariableError);
      });
    });
  });

  describe('Success', () => {
    const testCases = readCashFiles(path.join(__dirname, '..', 'syntax', 'success'));
    testCases.forEach((f) => {
      it(`${f.fn} should succeed`, () => {
        const { ast, traversal } = setup(f.contents);
        assert.doesNotThrow(() => {
          ast.accept(traversal);
        });
      });
    });
  });

  describe('Handwritten tests', () => {
    describe('Reference/definition registration', () => {
      // TODO
    });
  });
});
