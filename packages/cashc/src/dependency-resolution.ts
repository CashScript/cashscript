import fs from 'fs';
import path from 'path';
import { SourceFileNode, FunctionDefinitionNode, ImportNode } from './ast/AST.js';
import type { CashScriptErrorListener } from './ast/error-listeners.js';
import { ImportResolutionError } from './Errors.js';
import { parseCode } from './parser.js';

// A minimal virtual filesystem used to resolve import directives. Canonical paths are opaque keys:
// absolute filesystem paths for the disk resolver, normalised POSIX paths relative to the main
// source for the in-memory resolver.
export interface ImportResolver {
  rootDir: string;
  resolve(fromDir: string, importPath: string): string;
  read(canonicalPath: string): string | undefined;
  dirname(canonicalPath: string): string;
  sourceName(canonicalPath: string): string;
}

export function createDiskResolver(rootDir: string): ImportResolver {
  return {
    rootDir,
    resolve: (fromDir, importPath) => path.resolve(fromDir, importPath),
    read: (canonicalPath) => {
      try {
        return fs.readFileSync(canonicalPath, { encoding: 'utf-8' });
      } catch {
        return undefined;
      }
    },
    dirname: (canonicalPath) => path.dirname(canonicalPath),
    sourceName: (canonicalPath) => path.relative(rootDir, canonicalPath).split(path.sep).join(path.posix.sep),
  };
}

export function createMemoryResolver(files: Record<string, string>): ImportResolver {
  // Normalise keys so that './utils.cash' and 'utils.cash' address the same file
  const normalisedFiles = Object.fromEntries(
    Object.entries(files).map(([filePath, source]) => [path.posix.normalize(filePath), source]),
  );

  return {
    rootDir: '.',
    resolve: (fromDir, importPath) => path.posix.normalize(path.posix.join(fromDir, importPath)),
    read: (canonicalPath) => normalisedFiles[canonicalPath],
    dirname: (canonicalPath) => path.posix.dirname(canonicalPath),
    sourceName: (canonicalPath) => canonicalPath,
  };
}

export function resolveDependencies(
  ast: SourceFileNode,
  resolver: ImportResolver | undefined,
  errorListener?: CashScriptErrorListener,
): SourceFileNode {
  if (ast.imports.length === 0) return ast;

  if (resolver === undefined) {
    throw new ImportResolutionError(
      ast.imports[0],
      'Cannot resolve imports when compiling from a string, pass in the imported sources using the "files" option or compile from the filesystem using compileFile',
    );
  }

  const importedFunctions = collectImports(ast.imports, resolver, errorListener);
  ast.functions = [...importedFunctions, ...ast.functions];
  ast.imports = [];

  return ast;
}

// Depth-first walk of the import graph, returning every global function it reaches. `visitedPaths` is
// internal bookkeeping that de-duplicates files by canonical path — collapsing diamonds (a file reached
// through two paths is read once) and guaranteeing termination for mutual or cyclic imports — so this
// function stays pure with respect to its arguments.
function collectImports(
  imports: ImportNode[],
  resolver: ImportResolver,
  errorListener?: CashScriptErrorListener,
): FunctionDefinitionNode[] {
  const visitedPaths = new Set<string>();

  const collect = (currentImports: ImportNode[], currentDir: string): FunctionDefinitionNode[] =>
    currentImports.flatMap((importNode) => {
      const canonicalPath = resolver.resolve(currentDir, importNode.path);
      if (visitedPaths.has(canonicalPath)) return [];
      visitedPaths.add(canonicalPath);

      const importedSource = resolver.read(canonicalPath);
      if (importedSource === undefined) {
        throw new ImportResolutionError(
          importNode,
          `Could not read imported file '${importNode.path}' (resolved to '${canonicalPath}')`,
        );
      }

      const importedAst = parseCode(importedSource, errorListener);

      // Record source provenance so debug frames can attribute to the imported file
      importedAst.functions.forEach((func) => {
        func.sourceCode = importedSource;
        func.sourceFile = resolver.sourceName(canonicalPath);
      });

      return [...collect(importedAst.imports, resolver.dirname(canonicalPath)), ...importedAst.functions];
    });

  return collect(imports, resolver.rootDir);
}
