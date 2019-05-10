/*   TypeCheck.test.ts
 *
 * - This file is used to test the functioning of the symbol table.
 * - It has three different test categories: success, undefined and redefinition.
 */

import { ANTLRInputStream, CommonTokenStream } from 'antlr4ts';
import { assert } from 'chai';
import * as path from 'path';
import { CashScriptParser } from '../../src/grammar/CashScriptParser';
import { CashScriptLexer } from '../../src/grammar/CashScriptLexer';
import { readCashFiles } from '../test-util';
import SymbolTableTraversal from '../../src/semantic/SymbolTableTraversal';
import AstBuilder from '../../src/ast/AstBuilder';
import { SourceFileNode, Node } from '../../src/ast/AST';
import {
  InvalidParameterTypeError,
  UnsupportedTypeError,
  UnequalTypeError,
  CastTypeError,
  AssignTypeError,
  ArrayElementError,
} from '../../src/Errors';
import TypeCheckTraversal from '../../src/semantic/TypeCheckTraversal';

interface TestSetup {
  ast: Node,
  traversal: TypeCheckTraversal,
}

function setup(input: string): TestSetup {
  const inputStream = new ANTLRInputStream(input);
  const lexer = new CashScriptLexer(inputStream);
  const tokenStream = new CommonTokenStream(lexer);
  const parser = new CashScriptParser(tokenStream);
  let ast = new AstBuilder(parser.sourceFile()).build() as SourceFileNode;
  ast = ast.accept(new SymbolTableTraversal()) as SourceFileNode;
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
