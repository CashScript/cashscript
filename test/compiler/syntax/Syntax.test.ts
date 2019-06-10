/*   Syntax.test.ts
 *
 * - This file is used to test the functioning of the lexer and the parser.
 * - It only tests whether incorrect syntax is detected, and correct syntax
 *   is parsed, but it does not test whether the parse output is correct.
 *   This needs to be done by a different test file
 */

import { ANTLRInputStream, CommonTokenStream, BailErrorStrategy } from 'antlr4ts';
import { assert } from 'chai';
import * as path from 'path';
import { CashScriptParser } from '../../../src/compiler/grammar/CashScriptParser';
import { CashScriptLexer } from '../../../src/compiler/grammar/CashScriptLexer';
import { readCashFiles, prettyPrintTokenStream } from '../../test-util';

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
  let testSetup: TestSetup;
  describe('Fail', () => {
    const testCases = readCashFiles(path.join(__dirname, 'fail'));
    testCases.forEach((f) => {
      it(`${f.fn} should fail`, () => {
        testSetup = setup(f.contents);
        assert.throws(() => {
          testSetup.parser.sourceFile();
        });
      });
    });
  });

  describe('Success', () => {
    const testCases = readCashFiles(path.join(__dirname, 'success'));
    testCases.forEach((f) => {
      it(`${f.fn} should succeed`, () => {
        testSetup = setup(f.contents);
        assert.doesNotThrow(() => {
          testSetup.parser.sourceFile();
        });
      });
    });
  });

  afterEach(function () {
    if (this.currentTest && this.currentTest.state === 'failed') {
      prettyPrintTokenStream(testSetup.lexer, testSetup.tokenStream);
    }
  });
});
