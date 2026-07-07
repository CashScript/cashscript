import fs from 'fs';
import path from 'path';
import { SourceFileNode, FunctionDefinitionNode, ImportNode } from './ast/AST.js';
import type { CompileOptions } from './compiler.js';
import { ImportResolutionError } from './Errors.js';
import { parseCode } from './parser.js';

export function resolveDependencies(ast: SourceFileNode, options: CompileOptions): SourceFileNode {
  if (ast.imports.length === 0) return ast;

  const importedFunctions = collectImports(ast.imports, options.basePath, options);
  ast.functions = [...importedFunctions, ...ast.functions];
  ast.imports = [];

  return ast;
}

// Depth-first walk of the import graph, returning every global function it reaches. `visitedPaths` is
// internal bookkeeping that de-duplicates files by absolute path — collapsing diamonds (a file reached
// through two paths is read once) and guaranteeing termination for mutual or cyclic imports — so this
// function stays pure with respect to its arguments.
function collectImports(
  imports: ImportNode[],
  fileDir: string | undefined,
  options: CompileOptions,
): FunctionDefinitionNode[] {
  const visitedPaths = new Set<string>();

  const collect = (currentImports: ImportNode[], currentDir: string | undefined): FunctionDefinitionNode[] =>
    currentImports.flatMap((importNode) => {
      if (currentDir === undefined) {
        throw new ImportResolutionError(importNode, 'Cannot resolve imports without a base path (compile from a file)');
      }

      const absolutePath = path.resolve(currentDir, importNode.path);
      if (visitedPaths.has(absolutePath)) return [];
      visitedPaths.add(absolutePath);

      const importedSource = readImportedFile(importNode, absolutePath);
      const importedAst = parseCode(importedSource, options.errorListener);

      // Record source provenance so debug frames can attribute to the imported file
      importedAst.functions.forEach((func) => {
        func.sourceCode = importedSource;
        func.sourceFile = path.basename(absolutePath);
      });

      return [...collect(importedAst.imports, path.dirname(absolutePath)), ...importedAst.functions];
    });

  return collect(imports, fileDir);
}

function readImportedFile(importNode: ImportNode, absolutePath: string): string {
  try {
    return fs.readFileSync(absolutePath, { encoding: 'utf-8' });
  } catch {
    throw new ImportResolutionError(
      importNode,
      `Could not read imported file '${importNode.path}' (resolved to ${absolutePath})`,
    );
  }
}
