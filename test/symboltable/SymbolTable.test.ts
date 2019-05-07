/*   SymbolTable.test.ts
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
import SymbolTableTraversal from '../../src/traversals/SymbolTableTraversal';
import AstBuilder from '../../src/ast/AstBuilder';
import { SourceFileNode, Node } from '../../src/ast/AST';
import { UndefinedReferenceError, RedefinitionError } from '../../src/Errors';

interface TestSetup {
  ast: Node,
  traversal: SymbolTableTraversal,
}

function setup(input: string): TestSetup {
  const inputStream = new ANTLRInputStream(input);
  const lexer = new CashScriptLexer(inputStream);
  const tokenStream = new CommonTokenStream(lexer);
  const parser = new CashScriptParser(tokenStream);
  const ast = new AstBuilder(parser.sourceFile()).build() as SourceFileNode;
  const traversal = new SymbolTableTraversal();

  return { ast, traversal };
}

describe('Symbol Table', () => {
  describe('Redefinition', () => {
    const testCases = readCashFiles(path.join(__dirname, 'redefinition'));
    testCases.forEach((f) => {
      it(`${f.fn} should throw RedefinitionError`, () => {
        const { ast, traversal } = setup(f.contents);
        assert.throws(() => {
          ast.accept(traversal);
        }, RedefinitionError);
      });
    });
  });

  describe('Undefined', () => {
    const testCases = readCashFiles(path.join(__dirname, 'undefined'));
    testCases.forEach((f) => {
      it(`${f.fn} should throw UndefinedReferenceError`, () => {
        const { ast, traversal } = setup(f.contents);
        assert.throws(() => {
          ast.accept(traversal);
        }, UndefinedReferenceError);
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
