import { CashScriptParser } from '../../src/grammar/CashScriptParser';
import { CashScriptLexer } from '../../src/grammar/CashScriptLexer';
import { ANTLRInputStream, CommonTokenStream, BailErrorStrategy } from 'antlr4ts';
import { assert } from 'chai';
import * as path from 'path';
import { readCashFiles } from '../test-util';

interface TestSetup {
    lexer: CashScriptLexer,
    tokenStream: CommonTokenStream,
    parser: CashScriptParser
}

const setup = (input: string): TestSetup => {
    let inputStream = new ANTLRInputStream(input);
    let lexer = new CashScriptLexer(inputStream);
    let tokenStream = new CommonTokenStream(lexer);
    let parser = new CashScriptParser(tokenStream);
    parser.errorHandler = new BailErrorStrategy();

    return { lexer, tokenStream, parser };
}

/* Only tests grammar (scanning + parsing) */

describe('Grammar', () => {
    describe('Fail', () => {
        const testCases = readCashFiles(path.join(__dirname, 'fail'));
        testCases.forEach(f => {
            it(`${f.fn} should fail`, () => {
                const { parser } = setup(f.contents);
                assert.throws(() => {
                    parser.sourceFile();
                });
            });
        });
    });

    describe('Success', () => {
        const testCases = readCashFiles(path.join(__dirname, 'success'));
        testCases.forEach(f => {
            it(`${f.fn} should succeed`, () => {
                const { parser } = setup(f.contents);
                assert.doesNotThrow(() => {
                    parser.sourceFile();
                });
            });
        });
    });
});
