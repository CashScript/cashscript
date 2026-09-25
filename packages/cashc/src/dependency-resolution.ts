import fs from 'fs';
import path from 'path';
import {
  SourceFileNode,
  FunctionDefinitionNode,
  ConstantDefinitionNode,
  ImportNode,
} from './ast/AST.js';
import { checkVersionConstraints } from './ast/Pragma.js';
import type { CashScriptErrorListener } from './ast/error-listeners.js';
import { ImportResolutionError } from './Errors.js';
import { parseCode } from './parser.js';

// A minimal virtual filesystem used to resolve import directives. Canonical paths are opaque keys:
// absolute filesystem paths for the disk resolver, normalised POSIX paths relative to the main
// source for the in-memory resolver. `resolve` returns undefined when a package import
// cannot be located.
export interface ImportResolver {
  rootDir: string;
  resolve(fromDir: string, importPath: string): string | undefined;
  read(canonicalPath: string): string | undefined;
  dirname(canonicalPath: string): string;
  sourceName(canonicalPath: string): string;
}

export function createDiskResolver(rootDir: string): ImportResolver {
  return {
    rootDir,
    resolve: (fromDir, importPath) => (isPackageImport(importPath)
      ? resolveFromNodeModules(fromDir, importPath)
      : path.resolve(fromDir, importPath)),
    read: (canonicalPath) => {
      try {
        return fs.readFileSync(canonicalPath, { encoding: 'utf-8' });
      } catch {
        return undefined;
      }
    },
    dirname: (canonicalPath) => path.dirname(canonicalPath),
    sourceName: (canonicalPath) => {
      const relativePath = getPackageImportPath(canonicalPath) ?? path.relative(rootDir, canonicalPath);
      return relativePath.split(path.sep).join(path.posix.sep);
    },
  };
}

export function createMemoryResolver(files: Record<string, string>): ImportResolver {
  // Normalise keys so that './utils.cash' and 'utils.cash' address the same file
  const normalisedFiles = Object.fromEntries(
    Object.entries(files).map(([filePath, source]) => [path.posix.normalize(filePath), source]),
  );

  return {
    rootDir: '.',
    // Package imports are looked up verbatim ('pkg/math.cash'), regardless of the importing file
    resolve: (fromDir, importPath) => (isPackageImport(importPath)
      ? path.posix.normalize(importPath)
      : path.posix.normalize(path.posix.join(fromDir, importPath))),
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

  const importedDefinitions = collectImports(ast.imports, resolver, errorListener);
  ast.functions = [...importedDefinitions.functions, ...ast.functions];
  ast.constants = [...importedDefinitions.constants, ...ast.constants];
  ast.imports = [];

  return ast;
}

interface ImportedDefinitions {
  functions: FunctionDefinitionNode[];
  constants: ConstantDefinitionNode[];
}

// Depth-first walk of the import graph, returning every global definition it reaches. `visitedPaths`
// de-duplicates files by canonical path so a diamond's shared leaf is read once, while `activePaths`
// tracks the files currently being resolved so cyclic imports are rejected.
function collectImports(
  imports: ImportNode[],
  resolver: ImportResolver,
  errorListener?: CashScriptErrorListener,
): ImportedDefinitions {
  const visitedPaths = new Set<string>();
  const activePaths = new Set<string>();

  const collect = (currentImports: ImportNode[], currentDir: string): ImportedDefinitions[] =>
    currentImports.flatMap((importNode) => {
      const canonicalPath = resolver.resolve(currentDir, importNode.path);
      if (canonicalPath === undefined) {
        throw new ImportResolutionError(
          importNode,
          `Could not find imported file '${importNode.path}' in any node_modules directory`,
        );
      }
      if (activePaths.has(canonicalPath)) {
        throw new ImportResolutionError(importNode, `Cyclic import of '${importNode.path}'`);
      }
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
      checkVersionConstraints(importedAst.pragmas, resolver.sourceName(canonicalPath));

      // Record source provenance so debug frames can attribute to the imported file
      importedAst.functions.forEach((func) => {
        func.sourceCode = importedSource;
        func.sourceFile = resolver.sourceName(canonicalPath);
      });
      importedAst.constants.forEach((constant) => {
        constant.sourceCode = importedSource;
        constant.sourceFile = resolver.sourceName(canonicalPath);
      });

      activePaths.add(canonicalPath);
      const transitiveDefinitions = collect(importedAst.imports, resolver.dirname(canonicalPath));
      activePaths.delete(canonicalPath);

      return [
        ...transitiveDefinitions,
        { functions: importedAst.functions, constants: importedAst.constants },
      ];
    });

  const collected = collect(imports, resolver.rootDir);
  return {
    functions: collected.flatMap((definitions) => definitions.functions),
    constants: collected.flatMap((definitions) => definitions.constants),
  };
}


function isPackageImport(importPath: string): boolean {
  return !importPath.startsWith('./') && !importPath.startsWith('../') && !importPath.startsWith('/');
}

// Walk up from the importing file's directory looking for node_modules/<importPath>, so
// contract libraries can be installed and imported as regular npm packages
function resolveFromNodeModules(fromDir: string, importPath: string): string | undefined {
  const currentDir = path.resolve(fromDir);
  const nodeModulesDir = path.join(currentDir, 'node_modules');
  const candidate = path.join(nodeModulesDir, importPath);

  if (isValidCandidate(nodeModulesDir, candidate)) return candidate;

  const parentDir = path.dirname(currentDir);
  if (parentDir === currentDir) return undefined;

  return resolveFromNodeModules(parentDir, importPath);
}

function isValidCandidate(nodeModulesDir: string, candidate: string): boolean {
  // The prefix check stops '..' segments in a specifier from escaping the node_modules directory
  if (!candidate.startsWith(nodeModulesDir + path.sep)) return false;
  const stats = fs.statSync(candidate, { throwIfNoEntry: false });
  return stats?.isFile() ?? false;
}

// A file inside node_modules is named by its package import path ('pkg/math.cash')
function getPackageImportPath(canonicalPath: string): string | undefined {
  const nodeModulesSegment = `${path.sep}node_modules${path.sep}`;
  const nodeModulesIndex = canonicalPath.lastIndexOf(nodeModulesSegment);
  if (nodeModulesIndex === -1) return undefined;
  return canonicalPath.slice(nodeModulesIndex + nodeModulesSegment.length);
}
