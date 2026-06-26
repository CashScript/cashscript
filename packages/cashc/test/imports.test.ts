import { fileURLToPath } from 'url';
import { compileFile, compileString } from '../src/index.js';
import { ImportResolutionError, FunctionRedefinitionError } from '../src/Errors.js';

const fixture = (name: string): string => fileURLToPath(new URL(`./import-fixtures/${name}`, import.meta.url));

describe('Imports', () => {
  it('merges global functions from an imported file', () => {
    const artifact = compileFile(fixture('main.cash'));
    expect(artifact.contractName).toEqual('Main');
    expect(artifact.bytecode).toContain('OP_INVOKE');
    // both imported functions are defined (one OP_DEFINE each)
    expect([...artifact.bytecode.matchAll(/OP_DEFINE/g)]).toHaveLength(2);
  });

  it('de-duplicates a diamond import so a shared leaf is defined once', () => {
    // Diamond imports mid1 and mid2, which both import leaf. The leaf function must be merged once
    // (otherwise it would be a redefinition): leaf, m1, m2 = 3 OP_DEFINEs.
    const artifact = compileFile(fixture('diamond.cash'));
    expect(artifact.contractName).toEqual('Diamond');
    expect([...artifact.bytecode.matchAll(/OP_DEFINE/g)]).toHaveLength(3);
  });

  it('throws when compiling a string with imports but no base path', () => {
    const code = 'import "./math.cash";\ncontract C() { function spend() { require(true); } }';
    expect(() => compileString(code)).toThrow(ImportResolutionError);
  });

  it('throws when an imported file cannot be found', () => {
    const code = 'import "./does-not-exist.cash";\ncontract C() { function spend() { require(true); } }';
    expect(() => compileString(code, { basePath: fixture('') })).toThrow(ImportResolutionError);
  });

  it('throws when an imported function collides with a local function of the same name', () => {
    // duplicate_import_main defines `shared` and imports a file that also defines `shared`.
    expect(() => compileFile(fixture('duplicate_import_main.cash'))).toThrow(FunctionRedefinitionError);
  });

  it('resolves a cyclic import without infinite looping', () => {
    // cycle_a imports cycle_b which imports cycle_a back; de-duplication by absolute path breaks the
    // cycle, and both functions (a and b) end up defined exactly once.
    const artifact = compileFile(fixture('cycle_main.cash'));
    expect(artifact.contractName).toEqual('Cycle');
    expect([...artifact.bytecode.matchAll(/OP_DEFINE/g)]).toHaveLength(2);
  });
});
