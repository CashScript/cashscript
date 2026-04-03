import { CharStream, CommonTokenStream, Token } from 'antlr4';
import { binToHex } from '@bitauth/libauth';
import { Artifact, CompilerOptions, generateSourceMap, generateSourceTags, optimiseBytecode, optimiseBytecodeOld, scriptToAsm, scriptToBytecode, sourceMapToLocationData } from '@cashscript/utils';
import fs, { PathLike } from 'fs';
import { fileURLToPath } from 'url';
import { generateArtifact } from './artifact/Artifact.js';
import { Ast, ContractNode, FunctionDefinitionNode, Node } from './ast/AST.js';
import AstBuilder from './ast/AstBuilder.js';
import AstTraversal from './ast/AstTraversal.js';
import ThrowingErrorListener from './ast/ThrowingErrorListener.js';
import GenerateTargetTraversal from './generation/GenerateTargetTraversal.js';
import CashScriptLexer from './grammar/CashScriptLexer.js';
import CashScriptParser from './grammar/CashScriptParser.js';
import SymbolTableTraversal from './semantic/SymbolTableTraversal.js';
import TypeCheckTraversal from './semantic/TypeCheckTraversal.js';
import EnsureFinalRequireTraversal from './semantic/EnsureFinalRequireTraversal.js';
import EnsureInvokedFunctionsSafeTraversal from './semantic/EnsureInvokedFunctionsSafeTraversal.js';
import EnsureContainerSemanticsTraversal from './semantic/EnsureContainerSemanticsTraversal.js';
import { FunctionVisibility } from './ast/Globals.js';
import { Point } from './ast/Location.js';
import { NonSpendableCompilationError, ParseError } from './Errors.js';
import { ImportResolver, ImportedFunctionProvenance, preprocessImports } from './imports.js';

export const DEFAULT_COMPILER_OPTIONS: CompilerOptions = {
  enforceFunctionParameterTypes: true,
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
  const preprocessed = preprocessFunctionVisibility(importedCode.code, mergedCompilerOptions);
  emitVisibilityWarnings(preprocessed.omittedPublicFunctions);

  // Lexing + parsing
  let ast = parseCodeFromPreprocessed(preprocessed);
  ast = applySourceProvenance(ast, importedCode.functionProvenance, {
    source: code,
    ...(sourcePath ? { sourceFile: normaliseSourcePath(sourcePath) } : {}),
  });

  // Semantic analysis
  ast = ast.accept(new SymbolTableTraversal()) as Ast;
  ast = ast.accept(new TypeCheckTraversal()) as Ast;
  ast = ast.accept(new EnsureContainerSemanticsTraversal()) as Ast;
  ast = ast.accept(new EnsureFinalRequireTraversal()) as Ast;
  ast = ast.accept(new EnsureInvokedFunctionsSafeTraversal()) as Ast;

  if (ast.contract.kind === 'library') {
    throw new NonSpendableCompilationError(ast.contract);
  }

  // Code generation
  const traversal = new GenerateTargetTraversal(mergedCompilerOptions);
  ast = ast.accept(traversal) as Ast;
  assertDistinctHelperFrameBytecode(traversal);

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
      frameId: log.frameId ?? '__root__',
      sourceFile: log.sourceFile ?? ast.contract.sourceFile,
      data: log.data.map((entry) => (
        typeof entry === 'string'
          ? entry
          : {
            ...entry,
            frameBytecode: entry.frameBytecode ?? log.frameBytecode ?? rootFrameBytecode,
            frameId: entry.frameId ?? log.frameId ?? '__root__',
          }
      )),
    })),
    requires: optimisationResult.requires.map((require) => ({
      ...require,
      frameBytecode: require.frameBytecode ?? rootFrameBytecode,
      frameId: require.frameId ?? '__root__',
      sourceFile: require.sourceFile ?? ast.contract.sourceFile,
    })),
    frames: [
      {
        id: '__root__',
        bytecode: rootFrameBytecode,
        sourceMap: generateSourceMap(optimisationResult.locationData),
        source: ast.contract.sourceCode ?? code,
        ...(ast.contract.sourceFile ? { sourceFile: ast.contract.sourceFile } : {}),
      },
      ...traversal.frames,
    ],
    ...(sourceTags ? { sourceTags } : {}),
  };

  return generateArtifact(ast, optimisationResult.script, importedCode.code, debug, mergedCompilerOptions);
}

export function compileFile(codeFile: PathLike, compilerOptions: CompileOptions = {}): Artifact {
  const code = fs.readFileSync(codeFile, { encoding: 'utf-8' });
  return compileString(code, { ...compilerOptions, sourcePath: normaliseSourcePath(codeFile) });
}

export function parseCode(code: string, compilerOptions: Pick<CompileOptions, 'sourcePath' | 'resolveImport'> = {}): Ast {
  const importedCode = preprocessImports(code, compilerOptions);
  const preprocessed = preprocessFunctionVisibility(importedCode.code);
  return applySourceProvenance(parseCodeFromPreprocessed(preprocessed), importedCode.functionProvenance, {
    source: code,
    ...(compilerOptions.sourcePath ? { sourceFile: normaliseSourcePath(compilerOptions.sourcePath) } : {}),
  });
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

function preprocessFunctionVisibility(code: string, compilerOptions: CompilerOptions = {}): PreprocessedVisibilityResult {
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
      if (containerKind === 'library' && visibilityToken.text === FunctionVisibility.PUBLIC) {
        throw new ParseError(
          `Library function '${functionNameToken.text}' must declare internal visibility`,
          new Point(visibilityToken.line, visibilityToken.column),
        );
      }

      functionVisibilities.push(visibilityToken.text as FunctionVisibility);
      for (let index = visibilityToken.start; index <= visibilityToken.stop; index += 1) {
        mutableCode[index] = ' ';
      }
      continue;
    }

    if (containerKind === 'library') {
      throw new ParseError(
        `Library function '${functionNameToken.text}' must declare internal visibility`,
        new Point(functionNameToken.line, functionNameToken.column),
      );
    }

    if (compilerOptions.requireExplicitFunctionVisibility) {
      throw new ParseError(
        `Function '${functionNameToken.text}' must declare explicit visibility (public or internal)`,
        new Point(functionNameToken.line, functionNameToken.column),
      );
    }

    const defaultVisibility = FunctionVisibility.PUBLIC;
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

class SourceProvenanceTraversal extends AstTraversal {
  private currentSource = this.rootSource;
  private currentLineDelta = 0;
  private currentColumnDelta = 0;

  constructor(
    private functionProvenance: Map<string, ImportedFunctionProvenance>,
    private rootSource: { source: string; sourceFile?: string },
  ) {
    super();
  }

  visit(node: Node): Node {
    if (node.location) {
      node.location.start.line += this.currentLineDelta;
      node.location.end.line += this.currentLineDelta;
      node.location.start.column += this.currentColumnDelta;
      node.location.end.column += this.currentColumnDelta;
      node.location.sourceFile = this.currentSource.sourceFile;
    }

    return super.visit(node);
  }

  visitContract(node: ContractNode): Node {
    node.sourceCode = this.rootSource.source;
    node.sourceFile = this.rootSource.sourceFile;
    return super.visitContract(node);
  }

  visitFunctionDefinition(node: FunctionDefinitionNode): Node {
    const previousSource = this.currentSource;
    const previousLineDelta = this.currentLineDelta;
    const previousColumnDelta = this.currentColumnDelta;
    const provenance = this.functionProvenance.get(node.name);

    this.currentSource = provenance
      ? { source: provenance.source, sourceFile: provenance.sourceFile }
      : this.rootSource;
    this.currentLineDelta = provenance ? provenance.originalStartLine - node.location.start.line : 0;
    this.currentColumnDelta = provenance ? provenance.originalStartColumn - provenance.generatedStartColumn : 0;
    node.sourceCode = this.currentSource.source;
    node.sourceFile = this.currentSource.sourceFile;

    const result = super.visitFunctionDefinition(node);

    this.currentSource = previousSource;
    this.currentLineDelta = previousLineDelta;
    this.currentColumnDelta = previousColumnDelta;
    return result;
  }
}

function applySourceProvenance(
  ast: Ast,
  functionProvenance: ImportedFunctionProvenance[],
  rootSource: { source: string; sourceFile?: string },
): Ast {
  const provenanceMap = new Map(functionProvenance.map((entry) => [entry.mangledName, entry]));
  return ast.accept(new SourceProvenanceTraversal(provenanceMap, rootSource)) as Ast;
}

function assertDistinctHelperFrameBytecode(traversal: GenerateTargetTraversal): void {
  const frameIdsByBytecode = new Map<string, string>();

  traversal.frames.forEach((frame) => {
    const previousFrameId = frameIdsByBytecode.get(frame.bytecode);
    if (previousFrameId && previousFrameId !== frame.id) {
      throw new Error(
        `Cannot compile helper functions '${previousFrameId}' and '${frame.id}' because they produce identical helper bytecode, which would make runtime debugging ambiguous.`,
      );
    }

    frameIdsByBytecode.set(frame.bytecode, frame.id);
  });
}

function getVisibleTokens(code: string): Token[] {
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
