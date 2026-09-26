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

// A minimal virtual filesystem used to locate and read imported files. Imported files are identified by their
// logical path (see below), while their location is where a resolver reads them from: their real (symlink-resolved)
// path on disk, or their logical path in memory. `locate` returns undefined when a package import cannot be found.
export interface ImportResolver {
  // Locates an import from the file at `importerLocation` (undefined for the main source)
  locate(importerLocation: string | undefined, importPath: string): string | undefined;
  read(location: string): string | undefined;
}

export function createDiskResolver(rootDir: string): ImportResolver {
  const realRootDir = toRealPath(rootDir);

  return {
    locate: (importerLocation, importPath) => {
      const fromDir = importerLocation === undefined ? realRootDir : path.dirname(importerLocation);
      const filePath = isPackageImport(importPath)
        ? resolveFromNodeModules(fromDir, importPath)
        : path.resolve(fromDir, importPath);

      return filePath === undefined ? undefined : toRealPath(filePath);
    },
    read: (location) => {
      try {
        return fs.readFileSync(location, { encoding: 'utf-8' });
      } catch {
        return undefined;
      }
    },
  };
}

function toRealPath(filePath: string): string {
  try {
    return fs.realpathSync(filePath);
  } catch {
    return filePath;
  }
}

export function createMemoryResolver(files: Record<string, string>): ImportResolver {
  // Normalise keys so that './utils.cash' and 'utils.cash' address the same file
  const normalisedFiles = Object.fromEntries(
    Object.entries(files).map(([filePath, source]) => [normaliseLogicalPath(filePath), source]),
  );

  return {
    locate: resolveLogicalPath,
    read: (logicalPath) => normalisedFiles[logicalPath],
  };
}

const PACKAGE_PREFIX = 'package:';

function resolveLogicalPath(importerLogicalPath: string | undefined, importPath: string): string {
  if (isPackageImport(importPath)) return normaliseLogicalPath(`${PACKAGE_PREFIX}${importPath}`);

  const importerDir = importerLogicalPath === undefined ? '.' : mapLogicalPath(importerLogicalPath, path.posix.dirname);
  return mapLogicalPath(importerDir, (dir) => path.posix.join(dir, importPath));
}

function normaliseLogicalPath(logicalPath: string): string {
  return mapLogicalPath(logicalPath, path.posix.normalize);
}

function mapLogicalPath(logicalPath: string, operation: (filePath: string) => string): string {
  if (!logicalPath.startsWith(PACKAGE_PREFIX)) return operation(logicalPath);
  return `${PACKAGE_PREFIX}${operation(logicalPath.slice(PACKAGE_PREFIX.length))}`;
}

export function resolveDependencies(
  ast: SourceFileNode,
  resolver: ImportResolver | undefined,
  errorListener?: CashScriptErrorListener,
): Record<string, string> {
  if (ast.imports.length === 0) return {};

  if (resolver === undefined) {
    throw new ImportResolutionError(
      ast.imports[0],
      'Cannot resolve imports when compiling from a string, pass in the imported sources using the "files" option or compile from the filesystem using compileFile',
    );
  }

  const { functions, constants, sources } = collectImports(ast.imports, resolver, errorListener);
  ast.functions = [...functions, ...ast.functions];
  ast.constants = [...constants, ...ast.constants];
  ast.imports = [];

  return sources;
}

interface ImportedDefinitions {
  functions: FunctionDefinitionNode[];
  constants: ConstantDefinitionNode[];
}

interface CollectedImports extends ImportedDefinitions {
  sources: Record<string, string>;
}

interface ImportedFile {
  logicalPath: string;
  location: string;
}

// Depth-first walk of the import graph, returning every global definition it reaches and every imported file's source
// code. Files are de-duplicated by logical path so a diamond's shared leaf is read once, while `activePaths` tracks
// the files currently being resolved so cyclic imports are rejected.
function collectImports(
  imports: ImportNode[],
  resolver: ImportResolver,
  errorListener?: CashScriptErrorListener,
): CollectedImports {
  const sources: Record<string, string> = {};
  const locations = new Map<string, string>();
  const activePaths = new Set<string>();

  // A logical path must always refer to the same file, so that the imported sources can be used to recompile the
  // contract. This is not the case when different copies of a package are imported (e.g. nested in node_modules).
  const locateImport = (importNode: ImportNode, importer?: ImportedFile): ImportedFile => {
    // Absolute paths only work on a single machine, and would end up in the artifact's `debug.sources`
    if (importNode.path.startsWith('/')) {
      throw new ImportResolutionError(
        importNode,
        `Absolute import paths are not supported, use a relative path or a package import instead of '${importNode.path}'`,
      );
    }

    const logicalPath = resolveLogicalPath(importer?.logicalPath, importNode.path);
    const location = resolver.locate(importer?.location, importNode.path);
    if (location === undefined) {
      throw new ImportResolutionError(
        importNode,
        `Could not find imported file '${importNode.path}' in any node_modules directory`,
      );
    }

    const knownLocation = locations.get(logicalPath);
    if (knownLocation !== undefined && knownLocation !== location) {
      throw new ImportResolutionError(
        importNode,
        `Imported file '${importNode.path}' resolves to '${location}', but '${logicalPath}' was already imported from '${knownLocation}'. Importing multiple copies of a package is not supported`,
      );
    }

    locations.set(logicalPath, location);
    return { logicalPath, location };
  };

  const collect = (currentImports: ImportNode[], importer?: ImportedFile): ImportedDefinitions[] =>
    currentImports.flatMap((importNode) => {
      const file = locateImport(importNode, importer);
      if (activePaths.has(file.logicalPath)) {
        throw new ImportResolutionError(importNode, `Cyclic import of '${importNode.path}'`);
      }
      if (sources[file.logicalPath] !== undefined) return [];

      const importedSource = resolver.read(file.location);
      if (importedSource === undefined) {
        throw new ImportResolutionError(
          importNode,
          `Could not read imported file '${importNode.path}' (resolved to '${file.location}')`,
        );
      }
      sources[file.logicalPath] = importedSource;

      const importedAst = parseCode(importedSource, errorListener);
      checkVersionConstraints(importedAst.pragmas, file.logicalPath);

      // Record source provenance so debug frames can attribute to the imported file
      [...importedAst.functions, ...importedAst.constants].forEach((definition) => {
        definition.sourceFile = file.logicalPath;
      });

      activePaths.add(file.logicalPath);
      const transitiveDefinitions = collect(importedAst.imports, file);
      activePaths.delete(file.logicalPath);

      return [
        ...transitiveDefinitions,
        { functions: importedAst.functions, constants: importedAst.constants },
      ];
    });

  const collected = collect(imports);
  return {
    functions: collected.flatMap((definitions) => definitions.functions),
    constants: collected.flatMap((definitions) => definitions.constants),
    sources,
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
