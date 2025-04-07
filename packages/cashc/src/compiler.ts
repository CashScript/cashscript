import { CharStream, CommonTokenStream } from 'antlr4';
import { Artifact, optimiseBytecode, optimiseSourceMap } from '@cashscript/utils';
import fs, { PathLike } from 'fs';
import { generateArtifact } from './artifact/Artifact.js';
import { Ast } from './ast/AST.js';
import AstBuilder from './ast/AstBuilder.js';
import ThrowingErrorListener from './ast/ThrowingErrorListener.js';
import GenerateTargetTraversal from './generation/GenerateTargetTraversal.js';
import CashScriptLexer from './grammar/CashScriptLexer.js';
import CashScriptParser from './grammar/CashScriptParser.js';
import SymbolTableTraversal from './semantic/SymbolTableTraversal.js';
import TypeCheckTraversal from './semantic/TypeCheckTraversal.js';
import EnsureFinalRequireTraversal from './semantic/EnsureFinalRequireTraversal.js';
import { remapIps } from './generation/utils.js';

export function compileString(code: string): Artifact {
  // Lexing + parsing
  let ast = parseCode(code);

  // Semantic analysis
  ast = ast.accept(new SymbolTableTraversal()) as Ast;
  ast = ast.accept(new TypeCheckTraversal()) as Ast;
  ast = ast.accept(new EnsureFinalRequireTraversal()) as Ast;

  // Code generation
  const traversal = new GenerateTargetTraversal();
  ast = ast.accept(traversal) as Ast;

  // Bytecode optimisation
  const unoptimizedSourceMap = traversal.sourceMap;
  const { oldToNewIpMap, optimisedBytecode } = optimiseBytecode(traversal.output);
  const sourceMap = optimiseSourceMap(unoptimizedSourceMap, oldToNewIpMap);

  // Remap instruction pointers in debug info
  const logsInfo = remapIps(traversal.consoleLogs, oldToNewIpMap);
  const requiresInfo = remapIps(traversal.requires, oldToNewIpMap);

  // Attach debug information
  const debug = {
    sourceMap: sourceMap,
    logs: logsInfo,
    requires: requiresInfo,
  };

  return generateArtifact(ast, optimisedBytecode, code, debug);
}

export function compileFile(codeFile: PathLike): Artifact {
  const code = fs.readFileSync(codeFile, { encoding: 'utf-8' });
  return compileString(code);
}

export function parseCode(code: string): Ast {
  // Lexing (throwing on errors)
  const inputStream = new CharStream(code);
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
