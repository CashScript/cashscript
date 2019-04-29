import { SampleTraversal } from './traversals/SampleTraversal';
import { SourceFileNode } from './ast/AST';
import { CashScriptParser } from './grammar/CashScriptParser';
import { CashScriptLexer } from './grammar/CashScriptLexer';
import { ANTLRInputStream, CommonTokenStream } from 'antlr4ts';
import { AstBuilder } from './ast/AstBuilder';
import * as fs from 'fs';
import * as path from 'path';
import * as util from 'util';

const contents = fs.readFileSync(path.join('..', 'test', 'syntax', 'success', 'comments.cash'), { encoding: 'utf-8' })

let inputStream = new ANTLRInputStream(contents);
let lexer = new CashScriptLexer(inputStream);
let tokenStream = new CommonTokenStream(lexer);
let parser = new CashScriptParser(tokenStream);
const ast = new AstBuilder(parser.sourceFile()).build() as SourceFileNode;
const sampleTraversal = new SampleTraversal();

// console.log(util.inspect(ast, false, null, true));
const astAfterTraversal = ast.accept(sampleTraversal);
console.log(util.inspect(astAfterTraversal, false, null, true));
