import fs from 'fs';
import { fileURLToPath } from 'url';
import { compileFile, compileString } from '../src/internal.js';
import { ImportResolutionError, RedefinitionError, VersionError } from '../src/Errors.js';

const fixture = (name: string): string => fileURLToPath(new URL(`./import-fixtures/${name}`, import.meta.url));

const readFixture = (name: string): string => fs.readFileSync(fixture(name), { encoding: 'utf-8' });

const countOpDefines = (bytecode: string): number => [...bytecode.matchAll(/OP_DEFINE/g)].length;

describe('Imports from the filesystem (compileFile)', () => {
  it('merges global functions from an imported file', () => {
    const artifact = compileFile(fixture('main.cash'), { disableInlining: true });
    expect(artifact.contractName).toEqual('Main');
    expect(artifact.bytecode).toContain('OP_INVOKE');
    // both imported functions are defined (one OP_DEFINE each)
    expect(countOpDefines(artifact.bytecode)).toEqual(2);
  });

  it('de-duplicates a diamond import so a shared leaf is defined once', () => {
    // Diamond imports mid1 and mid2, which both import leaf. The leaf function must be merged once
    // (otherwise it would be a redefinition): leaf, m1, m2 = 3 OP_DEFINEs.
    const artifact = compileFile(fixture('diamond.cash'), { disableInlining: true });
    expect(artifact.contractName).toEqual('Diamond');
    expect(countOpDefines(artifact.bytecode)).toEqual(3);
  });

  it('destructures a multi-return function imported from another file', () => {
    // The multi-return function is defined in an imported file and destructured in the contract,
    // proving multi-return composes with the import/module system.
    const artifact = compileFile(fixture('multi_return_main.cash'), { disableInlining: true });
    expect(artifact.contractName).toEqual('MultiReturnMain');
    expect(artifact.bytecode).toContain('OP_INVOKE');
    expect(countOpDefines(artifact.bytecode)).toEqual(1);
  });

  it('throws when an imported file cannot be found', () => {
    expect(() => compileFile(fixture('missing_import_main.cash'))).toThrow(ImportResolutionError);
  });

  it('throws when an imported function collides with a local function of the same name', () => {
    // duplicate_import_main defines `shared` and imports a file that also defines `shared`.
    expect(() => compileFile(fixture('duplicate_import_main.cash'))).toThrow(RedefinitionError);
  });

  it('resolves a cyclic import without infinite looping', () => {
    // cycle_a imports cycle_b which imports cycle_a back; de-duplication by canonical path breaks the
    // cycle, and both functions (a and b) end up defined exactly once.
    const artifact = compileFile(fixture('cycle_main.cash'), { disableInlining: true });
    expect(artifact.contractName).toEqual('Cycle');
    expect(countOpDefines(artifact.bytecode)).toEqual(2);
  });

  it('records provenance as the path relative to the main file', () => {
    const artifact = compileFile(fixture('nested_main.cash'), { disableInlining: true });
    expect(artifact.debug?.functions?.map((func) => func.sourceFile)).toEqual(['nested/helper.cash']);
  });

  it('throws when an imported file has a pragma that the compiler version does not satisfy', () => {
    expect(() => compileFile(fixture('bad_pragma_main.cash'))).toThrow(VersionError);
    expect(() => compileFile(fixture('bad_pragma_main.cash'))).toThrow(/bad_pragma_helper\.cash/);
  });
});

describe('Imports from in-memory files (compileString)', () => {
  const mathSource = `
    function addOne(int a) returns (int) { return a + 1; }
    function double(int a) returns (int) { return a * 2; }
  `;

  const mainCode = 'import "./math.cash";\ncontract Main() { function spend(int x) { require(double(addOne(x)) == 8); } }';

  it('merges global functions from a provided file', () => {
    const artifact = compileString(mainCode, { files: { './math.cash': mathSource }, disableInlining: true });
    expect(artifact.contractName).toEqual('Main');
    expect(artifact.bytecode).toContain('OP_INVOKE');
    expect(countOpDefines(artifact.bytecode)).toEqual(2);
  });

  it('normalises file keys so they match regardless of a leading ./', () => {
    const artifact = compileString(mainCode, { files: { 'math.cash': mathSource }, disableInlining: true });
    expect(countOpDefines(artifact.bytecode)).toEqual(2);
  });

  it('resolves transitive imports relative to the importing file', () => {
    // lib/a.cash imports './b.cash', which is relative to lib/ — so its key is 'lib/b.cash'
    const code = 'import "./lib/a.cash";\ncontract C() { function spend(int x) { require(a(x) == 7); } }';
    const files = {
      'lib/a.cash': 'import "./b.cash";\nfunction a(int n) returns (int) { return b(n) + 1; }',
      'lib/b.cash': 'function b(int n) returns (int) { return n * 3; }',
    };

    const artifact = compileString(code, { files, disableInlining: true });
    expect(countOpDefines(artifact.bytecode)).toEqual(2);
    expect(artifact.debug?.functions?.map((func) => func.sourceFile).sort()).toEqual(['lib/a.cash', 'lib/b.cash']);
  });

  it('supports files with the same basename in different directories', () => {
    const code = 'import "./a/helper.cash";\nimport "./b/helper.cash";\n'
      + 'contract C() { function spend(int x) { require(helperA(x) + helperB(x) == 10); } }';
    const files = {
      'a/helper.cash': 'function helperA(int n) returns (int) { return n + 1; }',
      'b/helper.cash': 'function helperB(int n) returns (int) { return n * 2; }',
    };

    const artifact = compileString(code, { files, disableInlining: true });
    expect(countOpDefines(artifact.bytecode)).toEqual(2);
  });

  it('de-duplicates a diamond import so a shared leaf is defined once', () => {
    const code = 'import "./mid1.cash";\nimport "./mid2.cash";\n'
      + 'contract Diamond() { function spend(int x) { require(m1(x) + m2(x) == 18); } }';
    const files = {
      'mid1.cash': 'import "./leaf.cash";\nfunction m1(int a) returns (int) { return leaf(a) * 2; }',
      'mid2.cash': 'import "./leaf.cash";\nfunction m2(int a) returns (int) { return leaf(a) + 3; }',
      'leaf.cash': 'function leaf(int a) returns (int) { return a + 1; }',
    };

    const artifact = compileString(code, { files, disableInlining: true });
    expect(countOpDefines(artifact.bytecode)).toEqual(3);
  });

  it('resolves parent-directory imports', () => {
    const code = 'import "../shared.cash";\ncontract C() { function spend(int x) { require(shared(x) == 4); } }';
    const files = { '../shared.cash': 'function shared(int n) returns (int) { return n + 1; }' };

    const artifact = compileString(code, { files, disableInlining: true });
    expect(countOpDefines(artifact.bytecode)).toEqual(1);
  });

  it('throws when compiling a string with imports without providing files', () => {
    expect(() => compileString(mainCode)).toThrow(ImportResolutionError);
  });

  it('throws when an import is missing from the provided files', () => {
    expect(() => compileString(mainCode, { files: {} })).toThrow(ImportResolutionError);
  });

  it('compiles when the pragmas of all imported files are satisfied', () => {
    const files = { './math.cash': `pragma cashscript >=0.14.0;\n${mathSource}` };
    const artifact = compileString(mainCode, { files, disableInlining: true });
    expect(countOpDefines(artifact.bytecode)).toEqual(2);
  });

  it('throws a VersionError naming the imported file when its pragma is not satisfied', () => {
    const files = { './math.cash': `pragma cashscript >=999.0.0;\n${mathSource}` };
    expect(() => compileString(mainCode, { files })).toThrow(VersionError);
    expect(() => compileString(mainCode, { files })).toThrow(
      /cashc version .* does not satisfy version constraint >=999\.0\.0 \(from pragma in imported file 'math\.cash'\)/,
    );
  });

  it('enforces the pragma of a transitively imported file', () => {
    const code = 'import "./lib/a.cash";\ncontract C() { function spend(int x) { require(a(x) == 7); } }';
    const files = {
      'lib/a.cash': 'import "./b.cash";\nfunction a(int n) returns (int) { return b(n) + 1; }',
      'lib/b.cash': 'pragma cashscript >=999.0.0;\nfunction b(int n) returns (int) { return n * 3; }',
    };

    expect(() => compileString(code, { files })).toThrow(VersionError);
    expect(() => compileString(code, { files })).toThrow(/lib\/b\.cash/);
  });
});

describe('compileFile / compileString equivalence', () => {
  it('compiles a complex import graph to the exact same artifact from disk and from memory', () => {
    // complex/main.cash exercises nested directories, a diamond (a and b both import util/leaf),
    // and a parent-directory import reached through two different routes (main imports
    // '../shared.cash' and lib/a.cash imports '../../shared.cash' — both must de-duplicate to the
    // same file).
    const fromDisk = compileFile(fixture('complex/main.cash'), { disableInlining: true });

    const files = {
      'lib/a.cash': readFixture('complex/lib/a.cash'),
      'lib/b.cash': readFixture('complex/lib/b.cash'),
      'lib/util/leaf.cash': readFixture('complex/lib/util/leaf.cash'),
      '../shared.cash': readFixture('shared.cash'),
    };
    const fromString = compileString(readFixture('complex/main.cash'), { files, disableInlining: true });

    // sanity-check the fixture actually pulls in all four imported functions
    expect(countOpDefines(fromDisk.bytecode)).toEqual(4);

    expect(fromString).toEqual({ ...fromDisk, updatedAt: expect.any(String) });
  });
});
