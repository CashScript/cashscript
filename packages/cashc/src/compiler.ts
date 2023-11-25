import { Artifact, optimiseBytecode } from '@cashscript/utils';
import { ANTLRInputStream, CommonTokenStream } from 'antlr4ts';
import fs, { PathLike } from 'fs';
import { generateArtifact } from './artifact/Artifact.js';
import { Ast } from './ast/AST.js';
import AstBuilder from './ast/AstBuilder.js';
import ThrowingErrorListener from './ast/ThrowingErrorListener.js';
import GenerateTargetTraversal from './generation/GenerateTargetTraversal.js';
import { CashScriptLexer } from './grammar/CashScriptLexer.js';
import { CashScriptParser } from './grammar/CashScriptParser.js';
import SymbolTableTraversal from './semantic/SymbolTableTraversal.js';
import TypeCheckTraversal from './semantic/TypeCheckTraversal.js';
import EnsureFinalRequireTraversal from './semantic/EnsureFinalRequireTraversal.js';

export function compileString(code: string): Artifact {
  // Lexing + parsing
  let ast = parseCode(code);

  // Semantic analysis
  const symbolTableTraversal = new SymbolTableTraversal();
  ast = ast.accept(symbolTableTraversal) as Ast;
  ast = ast.accept(new TypeCheckTraversal()) as Ast;
  ast = ast.accept(new EnsureFinalRequireTraversal()) as Ast;

  // Code generation
  const traversal = new GenerateTargetTraversal(symbolTableTraversal.logSymbols);
  ast = ast.accept(traversal) as Ast;

  // Bytecode optimisation
  const optimisedBytecode = optimiseBytecode(traversal.output);

  return generateArtifact(ast, optimisedBytecode, code, {
    script: traversal.output,
    sourceMap: traversal.souceMap,
    logs: traversal.consoleLogs,
    requireMessages: traversal.requireMessages,
  });
}

export function compileFile(codeFile: PathLike): Artifact {
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
