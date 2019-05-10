import { ANTLRInputStream, CommonTokenStream } from 'antlr4ts';
import * as util from 'util';
import { Ast } from './ast/AST';
import { CashScriptLexer } from './grammar/CashScriptLexer';
import { CashScriptParser } from './grammar/CashScriptParser';
import AstBuilder from './ast/AstBuilder';
import OutputSourceCodeTraversal from './print/OutputSourceCodeTraversal';

export function parseCode(code: string): Ast {
  const inputStream = new ANTLRInputStream(code);
  const lexer = new CashScriptLexer(inputStream);
  const tokenStream = new CommonTokenStream(lexer);
  const parser = new CashScriptParser(tokenStream);
  const ast = new AstBuilder(parser.sourceFile()).build() as Ast;
  return ast;
}

export function printAstAsCode(ast: Ast): void {
  const traversal = new OutputSourceCodeTraversal();
  ast.accept(traversal);
  console.log(traversal.output);
}

export function printAst(ast: Ast): void {
  console.log(util.inspect(ast, false, null, true));
}
