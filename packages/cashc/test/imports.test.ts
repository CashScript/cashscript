import fs from 'fs';
import os from 'os';
import path from 'path';
import { fileURLToPath } from 'url';
import { Artifact } from '@cashscript/utils';
import { compileFile, compileString } from '../src/internal.js';
import { ImportResolutionError, RedefinitionError, VersionError } from '../src/Errors.js';

const fixture = (name: string): string => fileURLToPath(new URL(`./import-fixtures/${name}`, import.meta.url));

const readFixture = (name: string): string => fs.readFileSync(fixture(name), { encoding: 'utf-8' });

const countOpDefines = (bytecode: string): number => [...bytecode.matchAll(/OP_DEFINE/g)].length;

// An artifact stores the source code of every imported file, so it can be recompiled from itself
const recompile = (artifact: Artifact): Artifact => (
  compileString(artifact.source, { ...artifact.compiler.options, files: artifact.debug?.sources })
);

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

  it('throws on absolute import paths', () => {
    expect(() => compileFile(fixture('absolute_import_main.cash'))).toThrow(ImportResolutionError);
    expect(() => compileFile(fixture('absolute_import_main.cash'))).toThrow(/Absolute import paths are not supported/);
  });

  it('throws when an imported function collides with a local function of the same name', () => {
    // duplicate_import_main defines `shared` and imports a file that also defines `shared`.
    expect(() => compileFile(fixture('duplicate_import_main.cash'))).toThrow(RedefinitionError);
  });

  it('throws on cyclic imports', () => {
    // cycle_a imports cycle_b which imports cycle_a back
    expect(() => compileFile(fixture('cycle_main.cash'))).toThrow(ImportResolutionError);
    expect(() => compileFile(fixture('cycle_main.cash'))).toThrow(/Cyclic import of '\.\/cycle_a\.cash'/);
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

  it('stores every imported file in debug.sources, including files without used definitions', () => {
    const code = 'import "./forwarding.cash";\ncontract C() { function spend(int x) { require(add(x, 3) == 8); } }';
    const files = {
      'forwarding.cash': 'import "./lib/math.cash";\nimport "./lib/unused.cash";',
      'lib/math.cash': 'function add(int a, int b) returns (int) { return a + b; }',
      'lib/unused.cash': 'int constant UNUSED = 1;',
    };

    const artifact = compileString(code, { files, warningListener: () => {} });
    expect(artifact.debug?.sources).toEqual(files);
  });

  it('does not store debug.sources when nothing is imported', () => {
    const artifact = compileString('contract C() { function spend(int x) { require(x == 1); } }');
    expect(artifact.debug?.sources).toBeUndefined();
  });

  it('throws on absolute import paths', () => {
    const code = 'import "/lib/math.cash";\ncontract C() { function spend(int x) { require(add(x, 3) == 8); } }';
    const files = { '/lib/math.cash': 'function add(int a, int b) returns (int) { return a + b; }' };

    expect(() => compileString(code, { files })).toThrow(ImportResolutionError);
    expect(() => compileString(code, { files })).toThrow(/Absolute import paths are not supported/);
  });
});

describe('Imports from node_modules (package imports)', () => {
  it('resolves a package import from the nearest node_modules directory', () => {
    const artifact = compileFile(fixture('nm_main.cash'), { disableInlining: true });
    expect(artifact.contractName).toEqual('NodeModulesMain');
    expect(artifact.bytecode).toContain('OP_INVOKE');
    expect(countOpDefines(artifact.bytecode)).toEqual(1);
  });

  it('walks up parent directories to find node_modules', () => {
    // nested/nm_nested_main.cash has no nested/node_modules, so resolution walks up to
    // import-fixtures/node_modules
    const artifact = compileFile(fixture('nested/nm_nested_main.cash'), { disableInlining: true });
    expect(artifact.contractName).toEqual('NodeModulesNested');
    expect(countOpDefines(artifact.bytecode)).toEqual(1);
  });

  it('prefers the nearest node_modules over an ancestor one', () => {
    // shadow/node_modules/mathlib/math.cash defines nmNearest, the ancestor copy defines nmAdd.
    // The contract calls nmNearest, so it only compiles if the nearest copy is resolved.
    const artifact = compileFile(fixture('shadow/nm_shadow_main.cash'), { disableInlining: true });
    expect(artifact.contractName).toEqual('NodeModulesShadow');
    expect(countOpDefines(artifact.bytecode)).toEqual(1);
  });

  it('resolves relative imports inside an imported package relative to the package file', () => {
    // mathlib/main.cash imports './helper.cash', which lives inside the package
    const artifact = compileFile(fixture('nm_transitive_main.cash'), { disableInlining: true });
    expect(countOpDefines(artifact.bytecode)).toEqual(2);
  });

  it('resolves package imports inside an imported package (transitive dependencies)', () => {
    // mathlib/combined.cash itself contains a package import of @cashlibs/utils/util.cash, which is
    // resolved by walking up from mathlib's own directory to the shared node_modules
    const artifact = compileFile(fixture('nm_package_deps_main.cash'), { disableInlining: true });
    expect(artifact.contractName).toEqual('NodeModulesPackageDeps');
    expect(countOpDefines(artifact.bytecode)).toEqual(2);
    expect(artifact.debug?.functions?.map((func) => func.sourceFile).sort())
      .toEqual(['package:@cashlibs/utils/util.cash', 'package:mathlib/combined.cash']);
  });

  it('resolves scoped package imports', () => {
    const artifact = compileFile(fixture('nm_scoped_main.cash'), { disableInlining: true });
    expect(artifact.contractName).toEqual('NodeModulesScoped');
    expect(countOpDefines(artifact.bytecode)).toEqual(1);
  });

  it('records provenance as the logical package path rather than a filesystem path', () => {
    const artifact = compileFile(fixture('nm_transitive_main.cash'), { disableInlining: true });
    expect(artifact.debug?.functions?.map((func) => func.sourceFile).sort())
      .toEqual(['package:mathlib/helper.cash', 'package:mathlib/main.cash']);
  });

  it('throws when different copies of a package are imported', () => {
    // copies/main.cash imports foo/x.cash, and bar/y.cash imports bar's own nested copy of foo/x.cash
    expect(() => compileFile(fixture('copies/main.cash'))).toThrow(ImportResolutionError);
    expect(() => compileFile(fixture('copies/main.cash'))).toThrow(/Importing multiple copies of a package is not supported/);
  });

  it('throws when a package import cannot be found in any node_modules directory', () => {
    expect(() => compileFile(fixture('nm_missing_main.cash'))).toThrow(ImportResolutionError);
    expect(() => compileFile(fixture('nm_missing_main.cash'))).toThrow(
      /Could not find imported file 'nonexistent-cashscript-pkg\/foo\.cash' in any node_modules directory/,
    );
  });

  it('resolves package imports from package: keys in the files option when compiling from a string', () => {
    const code = 'import "mathlib/math.cash";\n'
      + 'contract C() { function spend(int x) { require(nmAdd(x, 3) == 8); } }';
    const files = { 'package:mathlib/math.cash': readFixture('node_modules/mathlib/math.cash') };

    const artifact = compileString(code, { files, disableInlining: true });
    expect(countOpDefines(artifact.bytecode)).toEqual(1);
    expect(artifact.debug?.functions?.map((func) => func.sourceFile)).toEqual(['package:mathlib/math.cash']);
  });

  it('does not resolve package imports from local files in the files option', () => {
    // A package import that is missing its './' must fail like it does in compileFile
    const code = 'import "lib/math.cash";\n'
      + 'contract C() { function spend(int x) { require(nmAdd(x, 3) == 8); } }';
    const files = { 'lib/math.cash': readFixture('node_modules/mathlib/math.cash') };

    expect(() => compileString(code, { files })).toThrow(ImportResolutionError);
    expect(() => compileString(code, { files })).toThrow(/resolved to 'package:lib\/math\.cash'/);
  });

  it('keeps in-memory package files separate from local files with the same path', () => {
    const code = 'import "pkg/math.cash";\nimport "./pkg/math.cash";\n'
      + 'contract C() { function spend(int x) { require(fromPackage(x) + fromLocal(x) == 3); } }';
    const files = {
      'package:pkg/math.cash': 'function fromPackage(int n) returns (int) { return n + 1; }',
      'pkg/math.cash': 'function fromLocal(int n) returns (int) { return n + 2; }',
    };

    const artifact = compileString(code, { files, disableInlining: true });
    expect(countOpDefines(artifact.bytecode)).toEqual(2);
  });

  it('resolves relative imports inside an in-memory package relative to the package file', () => {
    const code = 'import "pkg/main.cash";\n'
      + 'contract C() { function spend(int x) { require(pkgMain(x) == 12); } }';
    const files = {
      'package:pkg/main.cash': 'import "./helper.cash";\nfunction pkgMain(int n) returns (int) { return pkgHelper(n) * 2; }',
      'package:pkg/helper.cash': 'function pkgHelper(int n) returns (int) { return n + 1; }',
    };

    const artifact = compileString(code, { files, disableInlining: true });
    expect(countOpDefines(artifact.bytecode)).toEqual(2);
  });

  it('compiles a node_modules import to the exact same artifact from disk and from memory', () => {
    const fromDisk = compileFile(fixture('nm_transitive_main.cash'), { disableInlining: true });

    const files = {
      'package:mathlib/main.cash': readFixture('node_modules/mathlib/main.cash'),
      'package:mathlib/helper.cash': readFixture('node_modules/mathlib/helper.cash'),
    };
    const fromString = compileString(readFixture('nm_transitive_main.cash'), { files, disableInlining: true });

    expect(fromString).toEqual({ ...fromDisk, updatedAt: expect.any(String) });
  });

  it('compiles transitive package dependencies to the exact same artifact from disk and from memory', () => {
    const fromDisk = compileFile(fixture('nm_package_deps_main.cash'), { disableInlining: true });

    const files = {
      'package:mathlib/combined.cash': readFixture('node_modules/mathlib/combined.cash'),
      'package:@cashlibs/utils/util.cash': readFixture('node_modules/@cashlibs/utils/util.cash'),
    };
    const fromString = compileString(readFixture('nm_package_deps_main.cash'), { files, disableInlining: true });

    expect(fromString).toEqual({ ...fromDisk, updatedAt: expect.any(String) });
  });
});

describe('Imports through symlinked packages (pnpm, npm link)', () => {
  const PACKAGE_SOURCES = {
    'util.cash': 'function innerDouble(int x) returns (int) { return x * 2; }',
    'lib.cash': 'import "inner-lib/util.cash";\nfunction outerFn(int x) returns (int) { return innerDouble(x) + 1; }',
    'main.cash': 'import "./sub/helper.cash";\nfunction linkedFn(int x) returns (int) { return linkedHelper(x) + 1; }',
    'helper.cash': 'function linkedHelper(int x) returns (int) { return x * 3; }',
  };

  let tempDir: string;
  const write = (filePath: string, source: string): void => {
    fs.mkdirSync(path.dirname(path.join(tempDir, filePath)), { recursive: true });
    fs.writeFileSync(path.join(tempDir, filePath), source);
  };
  // Junctions are used on Windows, so the tests do not require symlink permissions
  const link = (target: string, linkPath: string): void => {
    fs.mkdirSync(path.dirname(path.join(tempDir, linkPath)), { recursive: true });
    fs.symlinkSync(path.join(tempDir, target), path.join(tempDir, linkPath), 'junction');
  };
  const compileTemp = (filePath: string): Artifact => (
    compileFile(path.join(tempDir, filePath), { disableInlining: true })
  );
  const sourceFiles = (artifact: Artifact): string[] => artifact.debug!.functions!.map((func) => func.sourceFile!).sort();

  beforeAll(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'cashc-symlinks-'));

    // pnpm: only direct dependencies are linked into node_modules, and a package's own dependencies are linked next
    // to the package in node_modules/.pnpm/<package>@<version>/node_modules
    write('pnpm/node_modules/.pnpm/inner-lib@1.0.0/node_modules/inner-lib/util.cash', PACKAGE_SOURCES['util.cash']);
    write('pnpm/node_modules/.pnpm/outer-lib@1.0.0/node_modules/outer-lib/lib.cash', PACKAGE_SOURCES['lib.cash']);
    link('pnpm/node_modules/.pnpm/inner-lib@1.0.0/node_modules/inner-lib', 'pnpm/node_modules/.pnpm/outer-lib@1.0.0/node_modules/inner-lib');
    link('pnpm/node_modules/.pnpm/outer-lib@1.0.0/node_modules/outer-lib', 'pnpm/node_modules/outer-lib');
    write('pnpm/transitive.cash', 'import "outer-lib/lib.cash";\n'
      + 'contract Transitive() { function spend(int x) { require(outerFn(x) == 5); } }');

    // A project that depends on both outer-lib and inner-lib (which outer-lib also depends on)
    link('pnpm/node_modules/.pnpm/outer-lib@1.0.0/node_modules/outer-lib', 'pnpm-shared/node_modules/outer-lib');
    link('pnpm/node_modules/.pnpm/inner-lib@1.0.0/node_modules/inner-lib', 'pnpm-shared/node_modules/inner-lib');
    write('pnpm-shared/shared.cash', 'import "outer-lib/lib.cash";\nimport "inner-lib/util.cash";\n'
      + 'contract Shared() { function spend(int x) { require(outerFn(x) + innerDouble(x) == 9); } }');

    // npm link / workspaces: the package is linked from outside of node_modules
    write('workspace/packages/linked/main.cash', PACKAGE_SOURCES['main.cash']);
    write('workspace/packages/linked/sub/helper.cash', PACKAGE_SOURCES['helper.cash']);
    link('workspace/packages/linked', 'workspace/app/node_modules/linked');
    write('workspace/app/main.cash', 'import "linked/main.cash";\n'
      + 'contract Linked() { function spend(int x) { require(linkedFn(x) == 7); } }');

    // A project that imports a local file through a symlinked directory
    write('shared-code/helper.cash', PACKAGE_SOURCES['helper.cash']);
    link('shared-code', 'linked-dir/shared');
    write('linked-dir/main.cash', 'import "./shared/helper.cash";\n'
      + 'contract LinkedDir() { function spend(int x) { require(linkedHelper(x) == 6); } }');

    // A project that is itself reached through a symlink
    write('project/lib.cash', 'function localFn(int x) returns (int) { return x + 2; }');
    write('project/main.cash', 'import "./lib.cash";\ncontract Project() { function spend(int x) { require(localFn(x) == 4); } }');
    link('project', 'project-link');
  });

  afterAll(() => {
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  it('resolves a package\'s own dependencies from where the package is installed', () => {
    const artifact = compileTemp('pnpm/transitive.cash');
    expect(sourceFiles(artifact)).toEqual(['package:inner-lib/util.cash', 'package:outer-lib/lib.cash']);
  });

  it('imports a package once when it is reached through different symlinks', () => {
    const artifact = compileTemp('pnpm-shared/shared.cash');
    expect(countOpDefines(artifact.bytecode)).toEqual(2);
  });

  it('names files of a linked package by their logical package path', () => {
    const artifact = compileTemp('workspace/app/main.cash');
    expect(sourceFiles(artifact)).toEqual(['package:linked/main.cash', 'package:linked/sub/helper.cash']);
  });

  it('compiles a linked package to the exact same artifact from disk and from memory', () => {
    const files = {
      'package:linked/main.cash': PACKAGE_SOURCES['main.cash'],
      'package:linked/sub/helper.cash': PACKAGE_SOURCES['helper.cash'],
    };
    const code = fs.readFileSync(path.join(tempDir, 'workspace/app/main.cash'), 'utf-8');

    const fromString = compileString(code, { files, disableInlining: true });
    expect(fromString).toEqual({ ...compileTemp('workspace/app/main.cash'), updatedAt: expect.any(String) });
  });

  it('names local files in a symlinked directory by their import path, like compileString does', () => {
    const files = { 'shared/helper.cash': PACKAGE_SOURCES['helper.cash'] };
    const code = fs.readFileSync(path.join(tempDir, 'linked-dir/main.cash'), 'utf-8');
    const fromDisk = compileTemp('linked-dir/main.cash');

    expect(sourceFiles(fromDisk)).toEqual(['shared/helper.cash']);
    expect(compileString(code, { files, disableInlining: true })).toEqual({ ...fromDisk, updatedAt: expect.any(String) });
  });

  it('recompiles every symlinked layout from the sources in its own artifact', () => {
    const mainFiles = ['pnpm/transitive.cash', 'pnpm-shared/shared.cash', 'workspace/app/main.cash', 'linked-dir/main.cash'];
    mainFiles.forEach((mainFile) => {
      const artifact = compileFile(path.join(tempDir, mainFile));
      expect(recompile(artifact)).toEqual({ ...artifact, updatedAt: expect.any(String) });
    });
  });

  it('names local imports relative to a main file that is reached through a symlink', () => {
    const artifact = compileTemp('project-link/main.cash');
    expect(sourceFiles(artifact)).toEqual(['lib.cash']);
  });
});

describe('compileFile / compileString equivalence', () => {
  const RECOMPILABLE_FIXTURES = [
    'main.cash', 'diamond.cash', 'multi_return_main.cash', 'nested_main.cash', 'complex/main.cash', 'nm_main.cash',
    'nm_transitive_main.cash', 'nm_package_deps_main.cash', 'nm_scoped_main.cash', 'nested/nm_nested_main.cash',
    'shadow/nm_shadow_main.cash',
  ];

  RECOMPILABLE_FIXTURES.forEach((file) => {
    it(`recompiles ${file} from the sources in its own artifact`, () => {
      const artifact = compileFile(fixture(file));
      expect(recompile(artifact)).toEqual({ ...artifact, updatedAt: expect.any(String) });
    });
  });

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
