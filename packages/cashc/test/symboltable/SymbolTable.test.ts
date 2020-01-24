/*   SymbolTable.test.ts
 *
 * - This file is used to test the functioning of the symbol table.
 */

import * as path from 'path';
import { readCashFiles } from '../test-util';
import SymbolTableTraversal from '../../src/semantic/SymbolTableTraversal';
import { Ast } from '../../src/ast/AST';
import {
  UndefinedReferenceError,
  RedefinitionError,
  UnusedVariableError,
  InvalidSymbolTypeError,
} from '../../src/Errors';
import { parseCode } from '../../src/util';

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
  describe('InvalidSymbolTypeError', () => {
    readCashFiles(path.join(__dirname, 'InvalidSymbolTypeError')).forEach((f) => {
      it(`${f.fn} should throw InvalidSymbolTypeError`, () => {
        const { ast, traversal } = setup(f.contents);
        expect(() => ast.accept(traversal)).toThrow(InvalidSymbolTypeError);
      });
    });
  });

  describe('RedefinitionError', () => {
    readCashFiles(path.join(__dirname, 'RedefinitionError')).forEach((f) => {
      it(`${f.fn} should throw RedefinitionError`, () => {
        const { ast, traversal } = setup(f.contents);
        expect(() => ast.accept(traversal)).toThrow(RedefinitionError);
      });
    });
  });

  describe('UndefinedReferenceError', () => {
    readCashFiles(path.join(__dirname, 'UndefinedReferenceError')).forEach((f) => {
      it(`${f.fn} should throw UndefinedReferenceError`, () => {
        const { ast, traversal } = setup(f.contents);
        expect(() => ast.accept(traversal)).toThrow(UndefinedReferenceError);
      });
    });
  });

  describe('UnusedVariableError', () => {
    const testCases = readCashFiles(path.join(__dirname, 'UnusedVariableError'));
    testCases.forEach((f) => {
      it(`${f.fn} should throw UnusedVariableError`, () => {
        const { ast, traversal } = setup(f.contents);
        expect(() => ast.accept(traversal)).toThrow(UnusedVariableError);
      });
    });
  });

  describe('Success', () => {
    const testCases = readCashFiles(path.join(__dirname, '..', 'syntax', 'success'));
    testCases.forEach((f) => {
      it(`${f.fn} should succeed`, () => {
        const { ast, traversal } = setup(f.contents);
        expect(() => ast.accept(traversal)).not.toThrow();
      });
    });
  });

  describe('Handwritten tests', () => {
    describe('Reference/definition registration', () => {
      // TODO
    });
  });
});
