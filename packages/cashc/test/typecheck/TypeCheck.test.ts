/*   TypeCheck.test.ts
 *
 * - This file is used to test the functioning of the symbol table.
 * - It has three different test categories: success, undefined and redefinition.
 */

import * as path from 'path';
import { readCashFiles } from '../test-util';
import SymbolTableTraversal from '../../src/semantic/SymbolTableTraversal';
import { Node, Ast } from '../../src/ast/AST';
import {
  InvalidParameterTypeError,
  UnsupportedTypeError,
  UnequalTypeError,
  CastTypeError,
  AssignTypeError,
  ArrayElementError,
  IndexOutOfBoundsError,
  TypeError,
} from '../../src/Errors';
import TypeCheckTraversal from '../../src/semantic/TypeCheckTraversal';
import { parseCode } from '../../src/util';

interface TestSetup {
  ast: Node,
  traversal: TypeCheckTraversal,
}

function setup(input: string): TestSetup {
  let ast = parseCode(input);
  ast = ast.accept(new SymbolTableTraversal()) as Ast;
  const traversal = new TypeCheckTraversal();

  return { ast, traversal };
}

describe('Type Check', () => {
  describe('InvalidParameterTypeError', () => {
    const testCases = readCashFiles(path.join(__dirname, 'InvalidParameterTypeError'));
    testCases.forEach((f) => {
      it(`${f.fn} should throw InvalidParameterTypeError`, () => {
        const { ast, traversal } = setup(f.contents);
        expect(() => ast.accept(traversal)).toThrow(InvalidParameterTypeError);
      });
    });
  });

  describe('AssignTypeError', () => {
    const testCases = readCashFiles(path.join(__dirname, 'AssignTypeError'));
    testCases.forEach((f) => {
      it(`${f.fn} should throw AssignTypeError`, () => {
        const { ast, traversal } = setup(f.contents);
        expect(() => ast.accept(traversal)).toThrow(AssignTypeError);
      });
    });
  });

  describe('CastTypeError', () => {
    const testCases = readCashFiles(path.join(__dirname, 'CastTypeError'));
    testCases.forEach((f) => {
      it(`${f.fn} should throw CastTypeError`, () => {
        const { ast, traversal } = setup(f.contents);
        expect(() => ast.accept(traversal)).toThrow(CastTypeError);
      });
    });
  });

  describe('UnequalTypeError', () => {
    const testCases = readCashFiles(path.join(__dirname, 'UnequalTypeError'));
    testCases.forEach((f) => {
      it(`${f.fn} should throw UnequalTypeError`, () => {
        const { ast, traversal } = setup(f.contents);
        expect(() => ast.accept(traversal)).toThrow(UnequalTypeError);
      });
    });
  });

  describe('UnsupportedTypeError', () => {
    const testCases = readCashFiles(path.join(__dirname, 'UnsupportedTypeError'));
    testCases.forEach((f) => {
      it(`${f.fn} should throw UnsupportedTypeError`, () => {
        const { ast, traversal } = setup(f.contents);
        expect(() => ast.accept(traversal)).toThrow(UnsupportedTypeError);
      });
    });
  });

  describe('ArrayElementError', () => {
    const testCases = readCashFiles(path.join(__dirname, 'ArrayElementError'));
    testCases.forEach((f) => {
      it(`${f.fn} should throw ArrayElementError`, () => {
        const { ast, traversal } = setup(f.contents);
        expect(() => ast.accept(traversal)).toThrow(ArrayElementError);
      });
    });
  });

  describe('IndexOutOfBoundsError', () => {
    const testCases = readCashFiles(path.join(__dirname, 'IndexOutOfBoundsError'));
    testCases.forEach((f) => {
      it(`${f.fn} should throw IndexOutOfBoundsError`, () => {
        const { ast, traversal } = setup(f.contents);
        expect(() => ast.accept(traversal)).toThrow(IndexOutOfBoundsError);
      });
    });
  });

  describe('TypeError', () => {
    const testCases = readCashFiles(path.join(__dirname, 'TypeError'));
    testCases.forEach((f) => {
      it(`${f.fn} should throw TypeError`, () => {
        const { ast, traversal } = setup(f.contents);
        expect(() => ast.accept(traversal)).toThrow(TypeError);
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
    describe('Correct result type', () => {
      // TODO
    });
  });
});
