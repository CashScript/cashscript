/*   generation.test.ts
 *
 * - This file is used to test the IR and target code generation
 */

import { URL } from 'url';
import fs from 'fs';
import { compileFile, compileString } from '../../src/index.js';
import { fixtures } from './fixtures.js';

describe('Code generation & target code optimisation', () => {
  fixtures.forEach((fixture) => {
    it(`should compile ${fixture.fn} to correct Script and artifact`, () => {
      const artifact = compileFile(new URL(`../valid-contract-files/${fixture.fn}`, import.meta.url), fixture.compilerOptions);
      expect(artifact).toEqual({ ...fixture.artifact, updatedAt: expect.any(String) });
    });
  });

  it('should hide internal helper functions from the ABI and emit BCH function opcodes', () => {
    const source = fs.readFileSync(
      new URL('../valid-contract-files/internal_helper_functions.cash', import.meta.url),
      { encoding: 'utf-8' },
    );

    const artifact = compileString(source);

    expect(artifact.abi).toEqual([
      { name: 'spend', inputs: [{ name: 'x', type: 'int' }] },
    ]);
    expect(artifact.bytecode).toContain('OP_DEFINE');
    expect(artifact.bytecode).toContain('OP_INVOKE');
  });

  it('should only emit OP_DEFINE for reachable internal helpers', () => {
    const artifact = compileString(`
contract ReachableHelpers() {
  function spend(int x) {
    require(doubleCheck_(x));
  }

  function fallback(int x) {
    require(isEven_(x));
  }

  function doubleCheck_(int value) {
    require(isEven_(value));
  }

  function isEven_(int value) {
    require(value % 2 == 0);
  }

  function unused_(int value) {
    require(value == 42);
  }
}
`);

    expect(artifact.abi).toEqual([
      { name: 'spend', inputs: [{ name: 'x', type: 'int' }] },
      { name: 'fallback', inputs: [{ name: 'x', type: 'int' }] },
    ]);
    expect(artifact.bytecode.match(/OP_DEFINE/g)).toHaveLength(2);
    expect(artifact.bytecode.match(/OP_INVOKE/g)).toHaveLength(2);
  });

  it('should not emit BCH function opcodes for unused internal helpers', () => {
    const artifact = compileString(`
contract UnusedHelpers() {
  function spend(int x) {
    require(x == 7);
  }

  function helper_(int value) {
    require(value == 7);
  }
}
`);

    expect(artifact.abi).toEqual([
      { name: 'spend', inputs: [{ name: 'x', type: 'int' }] },
    ]);
    expect(artifact.bytecode).not.toContain('OP_DEFINE');
    expect(artifact.bytecode).not.toContain('OP_INVOKE');
  });

  it('should support invoking a public function from another public function', () => {
    const artifact = compileString(`
contract PublicCalls() {
  function spend(int x) {
    require(validate(x));
  }

  function validate(int value) {
    require(value == 7);
  }
}
`);

    expect(artifact.abi).toEqual([
      { name: 'spend', inputs: [{ name: 'x', type: 'int' }] },
      { name: 'validate', inputs: [{ name: 'value', type: 'int' }] },
    ]);
    expect(artifact.bytecode.match(/OP_DEFINE/g)).toHaveLength(1);
    expect(artifact.bytecode.match(/OP_INVOKE/g)).toHaveLength(1);
    expect(artifact.compiler.target).toBe('BCH_2026_05');
  });

  it('should respect a custom internal function prefix when requested', () => {
    const artifact = compileString(`
contract CustomPrefix() {
  function spend(int x) {
    require(helperCheck(x));
  }

  function helperCheck(int value) {
    require(value == 11);
  }
}
`, { internalFunctionPrefix: 'helper' });

    expect(artifact.abi).toEqual([
      { name: 'spend', inputs: [{ name: 'x', type: 'int' }] },
    ]);
    expect(artifact.bytecode).toContain('OP_DEFINE');
    expect(artifact.bytecode).toContain('OP_INVOKE');
  });
});
