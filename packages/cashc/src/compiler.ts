import { binToHex } from '@bitauth/libauth';
import {
  Artifact,
  CompilerOptions,
  computeBytecodeFingerprintWithConstructorArgs,
  generateSourceMap,
  generateSourceTags,
  generateInlineRanges,
  optimiseBytecode,
  optimiseBytecodeOld,
  scriptToAsm,
  scriptToBytecode,
  sourceMapToLocationData,
} from '@cashscript/utils';
import fs, { PathLike } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { generateArtifact } from './artifact/Artifact.js';
import { Ast } from './ast/AST.js';
import { checkVersionConstraints } from './ast/Pragma.js';
import { CashScriptErrorListener } from './ast/error-listeners.js';
import { MissingContractError } from './Errors.js';
import { parseCode } from './parser.js';
import {
  createDiskResolver,
  createMemoryResolver,
  ImportResolver,
  resolveDependencies,
} from './dependency-resolution.js';
import GenerateTargetTraversal from './generation/GenerateTargetTraversal.js';
import SymbolTableTraversal from './semantic/SymbolTableTraversal.js';
import TypeCheckTraversal from './semantic/TypeCheckTraversal.js';
import EnsureFinalRequireTraversal from './semantic/EnsureFinalRequireTraversal.js';
import EnsureFunctionsSafeTraversal from './semantic/EnsureFunctionsSafeTraversal.js';
import InjectLocktimeGuardTraversal from './semantic/InjectLocktimeGuardTraversal.js';
import DeadCodeEliminationTraversal from './semantic/DeadCodeEliminationTraversal.js';
import { LowerGlobalConstantsTraversal } from './semantic/LowerGlobalConstantsTraversal.js';

export const DEFAULT_COMPILER_OPTIONS: CompilerOptions = {
  enforceFunctionParameterTypes: true,
  enforceLocktimeGuard: true,
};

export interface CompileOptions extends CompilerOptions {
  errorListener?: CashScriptErrorListener;
}

export interface CompileStringOptions extends CompileOptions {
  files?: Record<string, string>;
}

/**
 * Compile a CashScript source string to an {@link Artifact}.
 *
 * @param code - The CashScript source code to compile.
 * @param compilerOptions - Optional compiler options that override the defaults.
 * @returns The compiled CashScript artifact, including ABI, bytecode and debug information.
 * @throws If the source code contains a syntax, semantic, or type error, or an import cannot be resolved.
 */
export const compileString: (code: string, compilerOptions?: CompileStringOptions) => Artifact =
  compileStringInternal;

/**
 * Read a `.cash` source file from disk and compile it to an `Artifact`.
 *
 * Import directives are resolved from the filesystem, relative to the importing file's directory.
 *
 * @param codeFile - The path to the `.cash` source file.
 * @param compilerOptions - Optional compiler options that override the defaults.
 * @returns The compiled CashScript artifact.
 * @throws If the file cannot be read, or if the source contains a compilation error.
 */
export const compileFile: (codeFile: PathLike, compilerOptions?: CompileOptions) => Artifact =
  compileFileInternal;


export interface InternalCompilerOptions extends CompilerOptions {
  disableInlining?: boolean;
}

export function compileStringInternal(
  code: string,
  compilerOptions: CompileStringOptions & InternalCompilerOptions = {},
): Artifact {
  const { files, ...remainingOptions } = compilerOptions;
  const resolver = createMemoryResolver(files ?? {});
  return compileCode(code, resolver, remainingOptions);
}

export function compileFileInternal(
  codeFile: PathLike,
  compilerOptions: CompileOptions & InternalCompilerOptions = {},
): Artifact {
  const filePath = codeFile instanceof URL ? fileURLToPath(codeFile) : codeFile.toString();
  const code = fs.readFileSync(filePath, { encoding: 'utf-8' });
  const resolver = createDiskResolver(path.dirname(filePath));
  return compileCode(code, resolver, compilerOptions);
}

function compileCode(
  code: string,
  resolver: ImportResolver,
  compilerOptions: CompileOptions & InternalCompilerOptions,
): Artifact {
  const { errorListener, disableInlining, ...artifactCompilerOptions } = compilerOptions;
  const mergedCompilerOptions = { ...DEFAULT_COMPILER_OPTIONS, ...artifactCompilerOptions };

  // Lexing + parsing
  let ast = parseCode(code, errorListener);
  checkVersionConstraints(ast.pragmas);

  ast = resolveDependencies(ast, resolver, errorListener) as Ast;
  if (!ast.contract) throw new MissingContractError();

  const constructorParamLength = ast.contract.parameters.length;

  // Semantic analysis
  ast = ast.accept(new SymbolTableTraversal()) as Ast;
  ast = ast.accept(new TypeCheckTraversal()) as Ast;
  ast = ast.accept(new EnsureFunctionsSafeTraversal()) as Ast;
  ast = ast.accept(new EnsureFinalRequireTraversal()) as Ast;
  if (mergedCompilerOptions.enforceLocktimeGuard) {
    ast = ast.accept(new InjectLocktimeGuardTraversal()) as Ast;
  }

  // Turn global constants into synthetic zero-argument functions, so they can share reachability analysis,
  // inlining, and VM function-ID assignment with user-defined functions
  ast = ast.accept(new LowerGlobalConstantsTraversal()) as Ast;

  // Dead-code elimination: drop global functions that are never invoked before code generation
  ast = ast.accept(new DeadCodeEliminationTraversal()) as Ast;

  // Code generation
  const traversal = new GenerateTargetTraversal({ ...mergedCompilerOptions, disableInlining });
  ast = ast.accept(traversal) as Ast;

  // Bytecode optimisation
  const optimisedBytecodeOld = optimiseBytecodeOld(traversal.output);
  const optimisationResult = optimiseBytecode(
    traversal.output,
    sourceMapToLocationData(traversal.sourceMap),
    traversal.consoleLogs,
    traversal.requires,
    traversal.sourceTags,
    traversal.inlineRanges,
    constructorParamLength,
  );

  if (scriptToAsm(optimisedBytecodeOld) !== scriptToAsm(optimisationResult.script)) {
    console.error(scriptToAsm(optimisedBytecodeOld));
    console.error(scriptToAsm(optimisationResult.script));
    throw new Error('New bytecode optimisation is not backwards compatible, please report this issue to the CashScript team');
  }

  // Attach debug information (optional fields may be set to undefined; they are removed when the
  // artifact is serialised)
  const debug = {
    bytecode: binToHex(scriptToBytecode(optimisationResult.script)),
    sourceMap: generateSourceMap(optimisationResult.locationData),
    logs: optimisationResult.logs,
    requires: optimisationResult.requires,
    sourceTags: generateSourceTags(optimisationResult.sourceTags) || undefined,
    functions: traversal.frames.length > 0 ? traversal.frames : undefined,
    inlineRanges: generateInlineRanges(optimisationResult.inlineRanges) || undefined,
  };

  const fingerprint = computeBytecodeFingerprintWithConstructorArgs(optimisationResult.script, constructorParamLength);

  return generateArtifact(ast, optimisationResult.script, code, debug, mergedCompilerOptions, fingerprint);
}
