/*   Syntax.test.ts
 *
 * - This file is used to test the functioning of the lexer and the parser.
 * - It only tests whether incorrect syntax is detected, and correct syntax
 *   is parsed, but it does not test whether the parse output is correct.
 *   This needs to be done by a different test file
 */

import { ANTLRInputStream, CommonTokenStream, BailErrorStrategy } from 'antlr4ts';
import * as path from 'path';
import { CashScriptParser } from '../../src/grammar/CashScriptParser';
import { CashScriptLexer } from '../../src/grammar/CashScriptLexer';
import { readCashFiles } from '../test-util';

interface TestSetup {
  lexer: CashScriptLexer,
  parser: CashScriptParser,
  tokenStream: CommonTokenStream
}

function setup(input: string): TestSetup {
  const inputStream = new ANTLRInputStream(input);
  const lexer = new CashScriptLexer(inputStream);
  const tokenStream = new CommonTokenStream(lexer);
  const parser = new CashScriptParser(tokenStream);
  parser.errorHandler = new BailErrorStrategy();

  return { lexer, parser, tokenStream };
}

describe('Grammar', () => {
  describe('Fail', () => {
    readCashFiles(path.join(__dirname, 'fail')).forEach((f) => {
      it(`${f.fn} should fail`, () => {
        const testSetup = setup(f.contents);
        expect(() => testSetup.parser.sourceFile()).toThrow();
      });
    });
  });

  describe('Success', () => {
    readCashFiles(path.join(__dirname, 'success')).forEach((f) => {
      it(`${f.fn} should succeed`, () => {
        const testSetup = setup(f.contents);
        expect(() => testSetup.parser.sourceFile()).not.toThrow();
      });
    });
  });
});
