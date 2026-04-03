import { CharStream, CommonTokenStream } from 'antlr4';
import { binToHex } from '@bitauth/libauth';
import { Artifact, CompilerOptions, computeBytecodeFingerprintWithConstructorArgs, generateSourceMap, generateSourceTags, optimiseBytecode, optimiseBytecodeOld, scriptToAsm, scriptToBytecode, sourceMapToLocationData } from '@cashscript/utils';
import fs, { PathLike } from 'fs';
import { fileURLToPath } from 'url';
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
import EnsureInvokedFunctionsSafeTraversal from './semantic/EnsureInvokedFunctionsSafeTraversal.js';
import InjectLocktimeGuardTraversal from './semantic/InjectLocktimeGuardTraversal.js';
import EnsureContainerSemanticsTraversal from './semantic/EnsureContainerSemanticsTraversal.js';
import { FunctionVisibility } from './ast/Globals.js';
import { ParseError } from './Errors.js';
import { ImportResolver, preprocessImports } from './imports.js';

export const DEFAULT_COMPILER_OPTIONS: CompilerOptions = {
  enforceFunctionParameterTypes: true,
  enforceLocktimeGuard: true,
};

export interface CompileOptions extends CompilerOptions {
  sourcePath?: string;
  resolveImport?: ImportResolver;
}

type ContainerKind = 'contract' | 'library';

type PreprocessedVisibilityResult = {
  code: string;
  containerKind: ContainerKind;
  functionVisibilities: FunctionVisibility[];
  omittedPublicFunctions: Array<{ name: string; line: number; column: number }>;
};

export function compileString(code: string, compilerOptions: CompileOptions = {}): Artifact {
  const { sourcePath, resolveImport, ...serialisableCompilerOptions } = compilerOptions;
  const mergedCompilerOptions = { ...DEFAULT_COMPILER_OPTIONS, ...serialisableCompilerOptions };
  const importedCode = preprocessImports(code, { sourcePath, resolveImport });
  const preprocessed = preprocessFunctionVisibility(importedCode.code);
  emitVisibilityWarnings(preprocessed.omittedPublicFunctions);

  // Lexing + parsing
  let ast = parseCodeFromPreprocessed(preprocessed);

  // Semantic analysis
  ast = ast.accept(new SymbolTableTraversal()) as Ast;
  ast = ast.accept(new TypeCheckTraversal()) as Ast;
  ast = ast.accept(new EnsureContainerSemanticsTraversal()) as Ast;
  ast = ast.accept(new EnsureFinalRequireTraversal()) as Ast;
  ast = ast.accept(new EnsureInvokedFunctionsSafeTraversal()) as Ast;
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
  const rootFrameBytecode = binToHex(scriptToBytecode(optimisationResult.script));
  const debug = {
    bytecode: rootFrameBytecode,
    sourceMap: generateSourceMap(optimisationResult.locationData),
    logs: optimisationResult.logs.map((log) => ({
      ...log,
      frameBytecode: log.frameBytecode ?? rootFrameBytecode,
      data: log.data.map((entry) => (
        typeof entry === 'string'
          ? entry
          : { ...entry, frameBytecode: entry.frameBytecode ?? log.frameBytecode ?? rootFrameBytecode }
      )),
    })),
    requires: optimisationResult.requires.map((require) => ({
      ...require,
      frameBytecode: require.frameBytecode ?? rootFrameBytecode,
    })),
    ...(sourceTags ? { sourceTags } : {}),
  };

  const fingerprint = computeBytecodeFingerprintWithConstructorArgs(optimisationResult.script, constructorParamLength);

  return generateArtifact(ast, optimisationResult.script, importedCode.code, debug, mergedCompilerOptions, fingerprint);
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
  return compileString(code, { ...compilerOptions, sourcePath: normaliseSourcePath(codeFile) });
}

export function parseCode(code: string, compilerOptions: Pick<CompileOptions, 'sourcePath' | 'resolveImport'> = {}): Ast {
  const importedCode = preprocessImports(code, compilerOptions);
  const preprocessed = preprocessFunctionVisibility(importedCode.code);
  return parseCodeFromPreprocessed(preprocessed);
}

function parseCodeFromPreprocessed(preprocessed: PreprocessedVisibilityResult): Ast {
  // Lexing (throwing on errors)
  const inputStream = new CharStream(preprocessed.code);
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
  const ast = new AstBuilder(parseTree, preprocessed.functionVisibilities).build() as Ast;

  return ast;
}

function preprocessFunctionVisibility(code: string): PreprocessedVisibilityResult {
  const containerKind = getTopLevelContainerKind(code);
  const inputStream = new CharStream(code);
  const lexer = new CashScriptLexer(inputStream);
  const tokenStream = new CommonTokenStream(lexer);
  tokenStream.fill();

  const visibleTokens = tokenStream.tokens.filter((token) => token.channel === 0 && token.type !== -1);
  const mutableCode = code.split('');
  const functionVisibilities: FunctionVisibility[] = [];
  const omittedPublicFunctions: Array<{ name: string; line: number; column: number }> = [];

  for (let i = 0; i < visibleTokens.length; i += 1) {
    if (visibleTokens[i].text !== 'function') continue;

    let cursor = i + 1;
    if (!visibleTokens[cursor] || !visibleTokens[cursor + 1] || visibleTokens[cursor + 1].text !== '(') continue;
    const functionNameToken = visibleTokens[cursor];

    cursor += 2;
    let depth = 1;
    while (cursor < visibleTokens.length && depth > 0) {
      if (visibleTokens[cursor].text === '(') depth += 1;
      if (visibleTokens[cursor].text === ')') depth -= 1;
      cursor += 1;
    }

    const visibilityToken = visibleTokens[cursor];
    if (visibilityToken?.text === FunctionVisibility.INTERNAL || visibilityToken?.text === FunctionVisibility.PUBLIC) {
      functionVisibilities.push(visibilityToken.text as FunctionVisibility);
      for (let index = visibilityToken.start; index <= visibilityToken.stop; index += 1) {
        mutableCode[index] = ' ';
      }
      continue;
    }

    const defaultVisibility = containerKind === 'library' ? FunctionVisibility.INTERNAL : FunctionVisibility.PUBLIC;
    functionVisibilities.push(defaultVisibility);
    if (defaultVisibility === FunctionVisibility.PUBLIC) {
      omittedPublicFunctions.push({
        name: functionNameToken.text!,
        line: functionNameToken.line,
        column: functionNameToken.column,
      });
    }
  }

  return { code: mutableCode.join(''), containerKind, functionVisibilities, omittedPublicFunctions };
}

function getTopLevelContainerKind(code: string): ContainerKind {
  const tokens = getVisibleTokens(code);
  let cursor = 0;

  while (cursor < tokens.length && tokens[cursor].text === 'pragma') {
    cursor = advanceToSemicolon(tokens, cursor + 1);
  }

  while (cursor < tokens.length && tokens[cursor].text === 'import') {
    cursor = advanceToSemicolon(tokens, cursor + 1);
  }

  const rootToken = tokens[cursor];
  if (!rootToken) {
    throw new ParseError('Expected a root contract or library definition');
  }

  if (rootToken.text === 'contract' || rootToken.text === 'library') {
    return rootToken.text;
  }

  throw new ParseError(`Expected a root contract or library definition, found '${rootToken.text}'`);
}

function emitVisibilityWarnings(omittedPublicFunctions: Array<{ name: string; line: number; column: number }>): void {
  if (omittedPublicFunctions.length === 0) return;

  const summary = omittedPublicFunctions
    .map(({ name, line, column }) => `${name} (Line ${line}, Column ${column})`)
    .join(', ');

  console.warn(
    `Warning: ${omittedPublicFunctions.length} function(s) omit visibility and default to public: ${summary}.`,
  );
}

function getVisibleTokens(code: string) {
  const inputStream = new CharStream(code);
  const lexer = new CashScriptLexer(inputStream);
  const tokenStream = new CommonTokenStream(lexer);
  tokenStream.fill();

  return tokenStream.tokens.filter((token) => token.channel === 0 && token.type !== -1);
}

function advanceToSemicolon(tokens: ReturnType<typeof getVisibleTokens>, cursor: number): number {
  while (cursor < tokens.length && tokens[cursor].text !== ';') {
    cursor += 1;
  }

  if (tokens[cursor]?.text !== ';') {
    throw new ParseError('Expected semicolon while parsing pragmas');
  }

  return cursor + 1;
}

function normaliseSourcePath(codeFile: PathLike): string {
  if (codeFile instanceof URL) {
    return fileURLToPath(codeFile);
  }

  const sourcePath = String(codeFile);
  if (sourcePath.startsWith('file://')) {
    return fileURLToPath(sourcePath);
  }

  return sourcePath;
}
