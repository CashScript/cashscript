import { Artifact, optimiseBytecode } from '@cashscript/utils';
import { ANTLRInputStream, CommonTokenStream } from 'antlr4ts';
import fs from 'fs';
import { generateArtifact } from './artifact/Artifact';
import { Ast } from './ast/AST';
import AstBuilder from './ast/AstBuilder';
import ThrowingErrorListener from './ast/ThrowingErrorListener';
import GenerateTargetTraversal from './generation/GenerateTargetTraversal';
import { CashScriptLexer } from './grammar/CashScriptLexer';
import { CashScriptParser } from './grammar/CashScriptParser';
import SymbolTableTraversal from './semantic/SymbolTableTraversal';
import TypeCheckTraversal from './semantic/TypeCheckTraversal';
import EnsureFinalRequireTraversal from './semantic/EnsureFinalRequireTraversal';
import VerifyCovenantTraversal from './semantic/VerifyCovenantTraversal';

export function compileString(code: string): Artifact {
  // Lexing + parsing
  let ast = parseCode(code);

  // Semantic analysis
  ast = ast.accept(new SymbolTableTraversal()) as Ast;
  ast = ast.accept(new TypeCheckTraversal()) as Ast;
  ast = ast.accept(new EnsureFinalRequireTraversal()) as Ast;
  ast = ast.accept(new VerifyCovenantTraversal()) as Ast;

  // Code generation
  const traversal = new GenerateTargetTraversal();
  ast = ast.accept(traversal) as Ast;
  const bytecode = traversal.output;

  // Bytecode optimisation
  const optimisedBytecode = optimiseBytecode(bytecode);

  return generateArtifact(ast, optimisedBytecode, code);
}

export function compileFile(codeFile: string): Artifact {
  const code = fs.readFileSync(codeFile, { encoding: 'utf-8' });
  return compileString(code);
}

export function parseCode(code: string): Ast {
  // Lexing (throwing on errors)
  const inputStream = new ANTLRInputStream(code);
  const lexer = new CashScriptLexer(inputStream);
  lexer.removeErrorListeners();
  lexer.addErrorListener(ThrowingErrorListener.INSTANCE);
  const tokenStream = new CommonTokenStream(lexer);

  // Parsing (throwing on errors)
  const parser = new CashScriptParser(tokenStream);
  parser.removeErrorListeners();
  parser.addErrorListener(ThrowingErrorListener.INSTANCE);
  const parseTree = parser.sourceFile();

  // AST building
  const ast = new AstBuilder(parseTree).build() as Ast;

  return ast;
}
