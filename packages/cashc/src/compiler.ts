import { CharStream, CommonTokenStream } from 'antlr4';
import { binToHex } from '@bitauth/libauth';
import {
  Artifact,
  CompilerOptions,
  computeBytecodeFingerprintWithConstructorArgs,
  generateSourceMap,
  generateSourceTags,
  optimiseBytecode,
  optimiseBytecodeOld,
  scriptToAsm,
  scriptToBytecode,
  sourceMapToLocationData,
} from '@cashscript/utils';
import fs, { PathLike } from 'fs';
import { generateArtifact } from './artifact/Artifact.js';
import { Ast } from './ast/AST.js';
import AstBuilder from './ast/AstBuilder.js';
import { ThrowingErrorListener, CashScriptErrorListener, ForwardingErrorListener } from './ast/error-listeners.js';
import GenerateTargetTraversal from './generation/GenerateTargetTraversal.js';
import CashScriptLexer from './grammar/CashScriptLexer.js';
import CashScriptParser from './grammar/CashScriptParser.js';
import SymbolTableTraversal from './semantic/SymbolTableTraversal.js';
import TypeCheckTraversal from './semantic/TypeCheckTraversal.js';
import EnsureFinalRequireTraversal from './semantic/EnsureFinalRequireTraversal.js';
import InjectLocktimeGuardTraversal from './semantic/InjectLocktimeGuardTraversal.js';

export const DEFAULT_COMPILER_OPTIONS: CompilerOptions = {
  enforceFunctionParameterTypes: true,
  enforceLocktimeGuard: true,
};

export interface CompileOptions extends CompilerOptions {
  errorListener?: CashScriptErrorListener;
}

/**
 * Compile a CashScript source string to an {@link Artifact}.
 *
 * @param code - The CashScript source code to compile.
 * @param compilerOptions - Optional compiler options that override the defaults.
 * @returns The compiled CashScript artifact, including ABI, bytecode and debug information.
 * @throws If the source code contains a syntax, semantic, or type error.
 */
export function compileString(code: string, compilerOptions: CompileOptions = {}): Artifact {
  const { errorListener, ...artifactCompilerOptions } = compilerOptions;
  const mergedCompilerOptions = { ...DEFAULT_COMPILER_OPTIONS, ...artifactCompilerOptions };

  // Lexing + parsing
  let ast = parseCode(code, errorListener);

  // Semantic analysis
  ast = ast.accept(new SymbolTableTraversal()) as Ast;
  ast = ast.accept(new TypeCheckTraversal()) as Ast;
  ast = ast.accept(new EnsureFinalRequireTraversal()) as Ast;
  if (mergedCompilerOptions.enforceLocktimeGuard) {
    ast = ast.accept(new InjectLocktimeGuardTraversal()) as Ast;
  }

  // Code generation
  const traversal = new GenerateTargetTraversal(mergedCompilerOptions);
  ast = ast.accept(traversal) as Ast;

  const constructorParamLength = ast.contract.parameters.length;

  // Bytecode optimisation
  const optimisedBytecodeOld = optimiseBytecodeOld(traversal.output);
  const optimisationResult = optimiseBytecode(
    traversal.output,
    sourceMapToLocationData(traversal.sourceMap),
    traversal.consoleLogs,
    traversal.requires,
    traversal.sourceTags,
    constructorParamLength,
  );

  if (scriptToAsm(optimisedBytecodeOld) !== scriptToAsm(optimisationResult.script)) {
    console.error(scriptToAsm(optimisedBytecodeOld));
    console.error(scriptToAsm(optimisationResult.script));
    throw new Error('New bytecode optimisation is not backwards compatible, please report this issue to the CashScript team');
  }

  // Attach debug information
  const sourceTags = generateSourceTags(optimisationResult.sourceTags);
  const debug = {
    bytecode: binToHex(scriptToBytecode(optimisationResult.script)),
    sourceMap: generateSourceMap(optimisationResult.locationData),
    logs: optimisationResult.logs,
    requires: optimisationResult.requires,
    ...(sourceTags ? { sourceTags } : {}),
  };

  const fingerprint = computeBytecodeFingerprintWithConstructorArgs(optimisationResult.script, constructorParamLength);

  return generateArtifact(ast, optimisationResult.script, code, debug, mergedCompilerOptions, fingerprint);
}

/**
 * Read a `.cash` source file from disk and compile it to an `Artifact`.
 *
 * @param codeFile - The path to the `.cash` source file.
 * @param compilerOptions - Optional compiler options that override the defaults.
 * @returns The compiled CashScript artifact.
 * @throws If the file cannot be read, or if the source contains a compilation error.
 */
export function compileFile(codeFile: PathLike, compilerOptions: CompileOptions = {}): Artifact {
  const code = fs.readFileSync(codeFile, { encoding: 'utf-8' });
  return compileString(code, compilerOptions);
}

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
  const ast = new AstBuilder(parseTree).build() as Ast;

  return ast;
}
