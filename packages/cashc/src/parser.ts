import { CharStream, CommonTokenStream } from 'antlr4';
import { Ast } from './ast/AST.js';
import AstBuilder from './ast/AstBuilder.js';
import { ThrowingErrorListener, CashScriptErrorListener, ForwardingErrorListener } from './ast/error-listeners.js';
import CashScriptLexer from './grammar/CashScriptLexer.js';
import CashScriptParser from './grammar/CashScriptParser.js';

export function parseCode(
  code: string,
  errorListener: CashScriptErrorListener = ThrowingErrorListener.INSTANCE,
): Ast {
  const syntaxErrorListener = new ForwardingErrorListener(errorListener);

  // Lexing (throwing on errors)
  const inputStream = new CharStream(code);
  const lexer = new CashScriptLexer(inputStream);
  lexer.removeErrorListeners();
  lexer.addErrorListener(syntaxErrorListener);
  const tokenStream = new CommonTokenStream(lexer);

  // Parsing (throwing on errors)
  const parser = new CashScriptParser(tokenStream);
  parser.removeErrorListeners();
  parser.addErrorListener(syntaxErrorListener);
  const parseTree = parser.sourceFile();
  syntaxErrorListener.throwFirstError();

  // AST building
  return new AstBuilder(parseTree).build() as Ast;
}
