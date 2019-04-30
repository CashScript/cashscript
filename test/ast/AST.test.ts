/*   AST.test.ts
 *
 * - This file is used to test the functioning of the AST Builder
 * - It creates an AST from test files, then outputs the source code for the AST,
 *   then creates an AST from that and outputs the source again. The outputs
 *   are asserted for equality.
 * - This only tests the consistency of the AST Builder, but not necessarily the
 *   correctness, which needs to be done in a different file. This could be done
 *   by storing the expected AST in JSON under the same name as the .cash file.
 */

import { AstBuilder } from './../../src/ast/AstBuilder';
import { CashScriptParser } from '../../src/grammar/CashScriptParser';
import { CashScriptLexer } from '../../src/grammar/CashScriptLexer';
import { ANTLRInputStream, CommonTokenStream, BailErrorStrategy } from 'antlr4ts';
import { assert } from 'chai';
import * as path from 'path';
import { readCashFiles, prettyPrintTokenStream } from '../test-util';
import { Node, SourceFileNode } from '../../src/ast/AST';
import { OutputSourceCodeTraversal } from '../../src/traversals/OutputSourceCodeTraversal';

interface TestSetup {
    ast: Node,
    sourceOutput: string,
}

function setup(input: string): TestSetup {
    const inputStream = new ANTLRInputStream(input);
    const lexer = new CashScriptLexer(inputStream);
    const tokenStream = new CommonTokenStream(lexer);
    const parser = new CashScriptParser(tokenStream);
    const ast = new AstBuilder(parser.sourceFile()).build() as SourceFileNode;
    const traversal = new OutputSourceCodeTraversal();
    ast.accept(traversal);

    return { ast, sourceOutput: traversal.output };
}

describe('AST Builder', () => {
    const testCases = readCashFiles(path.join(__dirname, '..', 'syntax', 'success'));
    testCases.forEach(f => {
        it(`${f.fn} should succeed`, () => {
            const { sourceOutput: initialOutput } = setup(f.contents);
            const { sourceOutput: rerunOutput } = setup(initialOutput);
            assert.equal(initialOutput, rerunOutput);
        });
    });
});
