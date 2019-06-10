/*   TypeCheck.test.ts
 *
 * - This file is used to test the functioning of the symbol table.
 * - It has three different test categories: success, undefined and redefinition.
 */

import { assert } from 'chai';
import * as path from 'path';
import { readCashFiles } from '../../test-util';
import SymbolTableTraversal from '../../../src/compiler/semantic/SymbolTableTraversal';
import { Node, Ast } from '../../../src/compiler/ast/AST';
import {
  InvalidParameterTypeError,
  UnsupportedTypeError,
  UnequalTypeError,
  CastTypeError,
  AssignTypeError,
  ArrayElementError,
  IndexOutOfBoundsError,
  PrimitiveTypeError,
  TypeError,
} from '../../../src/Errors';
import TypeCheckTraversal from '../../../src/compiler/semantic/TypeCheckTraversal';
import { parseCode } from '../../../src/util';

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
        assert.throws(() => {
          ast.accept(traversal);
        }, InvalidParameterTypeError);
      });
    });
  });

  describe('AssignTypeError', () => {
    const testCases = readCashFiles(path.join(__dirname, 'AssignTypeError'));
    testCases.forEach((f) => {
      it(`${f.fn} should throw AssignTypeError`, () => {
        const { ast, traversal } = setup(f.contents);
        assert.throws(() => {
          ast.accept(traversal);
        }, AssignTypeError);
      });
    });
  });

  describe('CastTypeError', () => {
    const testCases = readCashFiles(path.join(__dirname, 'CastTypeError'));
    testCases.forEach((f) => {
      it(`${f.fn} should throw CastTypeError`, () => {
        const { ast, traversal } = setup(f.contents);
        assert.throws(() => {
          ast.accept(traversal);
        }, CastTypeError);
      });
    });
  });

  describe('UnequalTypeError', () => {
    const testCases = readCashFiles(path.join(__dirname, 'UnequalTypeError'));
    testCases.forEach((f) => {
      it(`${f.fn} should throw UnequalTypeError`, () => {
        const { ast, traversal } = setup(f.contents);
        assert.throws(() => {
          ast.accept(traversal);
        }, UnequalTypeError);
      });
    });
  });

  describe('UnsupportedTypeError', () => {
    const testCases = readCashFiles(path.join(__dirname, 'UnsupportedTypeError'));
    testCases.forEach((f) => {
      it(`${f.fn} should throw UnsupportedTypeError`, () => {
        const { ast, traversal } = setup(f.contents);
        assert.throws(() => {
          ast.accept(traversal);
        }, UnsupportedTypeError);
      });
    });
  });

  describe('ArrayElementError', () => {
    const testCases = readCashFiles(path.join(__dirname, 'ArrayElementError'));
    testCases.forEach((f) => {
      it(`${f.fn} should throw ArrayElementError`, () => {
        const { ast, traversal } = setup(f.contents);
        assert.throws(() => {
          ast.accept(traversal);
        }, ArrayElementError);
      });
    });
  });

  describe('IndexOutOfBoundsError', () => {
    const testCases = readCashFiles(path.join(__dirname, 'IndexOutOfBoundsError'));
    testCases.forEach((f) => {
      it(`${f.fn} should throw IndexOutOfBoundsError`, () => {
        const { ast, traversal } = setup(f.contents);
        assert.throws(() => {
          ast.accept(traversal);
        }, IndexOutOfBoundsError);
      });
    });
  });

  describe('PrimitiveTypeError', () => {
    const testCases = readCashFiles(path.join(__dirname, 'PrimitiveTypeError'));
    testCases.forEach((f) => {
      it(`${f.fn} should throw PrimitiveTypeError`, () => {
        const { ast, traversal } = setup(f.contents);
        assert.throws(() => {
          ast.accept(traversal);
        }, PrimitiveTypeError);
      });
    });
  });

  describe('TypeError', () => {
    const testCases = readCashFiles(path.join(__dirname, 'TypeError'));
    testCases.forEach((f) => {
      it(`${f.fn} should throw TypeError`, () => {
        const { ast, traversal } = setup(f.contents);
        assert.throws(() => {
          ast.accept(traversal);
        }, TypeError);
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
    describe('Correct result type', () => {
      // TODO
    });
  });
});
