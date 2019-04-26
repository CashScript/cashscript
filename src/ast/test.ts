import { SourceFileNode } from './SourceFileNode';
import { CashScriptParser } from './../grammar/CashScriptParser';
import { CashScriptLexer } from './../grammar/CashScriptLexer';
import { ANTLRInputStream, CommonTokenStream } from 'antlr4ts';
import { ASTBuilder } from './ASTBuilder';
import * as fs from 'fs';
import * as path from 'path';
import * as util from 'util';

const contents = fs.readFileSync(path.join('..', '..', 'test', 'syntax', 'success', 'comments.cash'), { encoding: 'utf-8' })

let inputStream = new ANTLRInputStream(contents);
let lexer = new CashScriptLexer(inputStream);
let tokenStream = new CommonTokenStream(lexer);
let parser = new CashScriptParser(tokenStream);
const ast = new ASTBuilder(parser.sourceFile()).build() as SourceFileNode;
console.log(util.inspect(ast, false, null, true));
// let f = ast.contract.functions[0];
// f && f.location && console.log(f.location.text(contents));
