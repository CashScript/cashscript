/*
 * Internal entry point for this repo's own test suites. The compile functions exported here also
 * accept internal-only compiler options (e.g. `disableInlining`), which are deliberately absent
 * from the package's public API. This module is not re-exported from the package index and
 * carries no stability guarantees.
 */
export { compileFileInternal as compileFile, compileStringInternal as compileString } from './compiler.js';
export type { InternalCompilerOptions } from './compiler.js';
