import { ANTLRInputStream, CommonTokenStream } from 'antlr4ts';
import * as fs from 'fs';
import * as path from 'path';
// import * as util from 'util';
import OutputSourceCodeTraversal from './traversals/OutputSourceCodeTraversal';
import { SourceFileNode } from './ast/AST';
import { CashScriptParser } from './grammar/CashScriptParser';
import { CashScriptLexer } from './grammar/CashScriptLexer';
import AstBuilder from './ast/AstBuilder';
import SymbolTableTraversal from './traversals/SymbolTableTraversal';

const contents = fs.readFileSync(path.join(__dirname, '..', 'test', 'syntax', 'success', 'everything.cash'), { encoding: 'utf-8' });

const inputStream = new ANTLRInputStream(contents);
const lexer = new CashScriptLexer(inputStream);
const tokenStream = new CommonTokenStream(lexer);
const parser = new CashScriptParser(tokenStream);
const ast = new AstBuilder(parser.sourceFile()).build() as SourceFileNode;
const traversal = new OutputSourceCodeTraversal();
const st = new SymbolTableTraversal();

// console.log(util.inspect(ast, false, null, true));
ast.accept(st);
ast.accept(traversal);
console.log(traversal.output);
// console.log(util.inspect(astAfterTraversal, false, null, true));
