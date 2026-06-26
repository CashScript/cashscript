import { fileURLToPath } from 'url';
import { compileString } from '../src/index.js';

const fixtureDir = fileURLToPath(new URL('./import-fixtures/', import.meta.url));
const countOpDefines = (bytecode: string): number => [...bytecode.matchAll(/OP_DEFINE/g)].length;

describe('Dead-code elimination', () => {
  it('does not define a global function that is never invoked', () => {
    const code = `
      function used(int a) returns (int) { return a + 1; }
      function unused(int a) returns (int) { return a * 2; }

      contract Test() {
        function spend(int x) {
          require(used(x) == 6);
        }
      }`;

    const artifact = compileString(code);
    expect(countOpDefines(artifact.bytecode)).toEqual(1);
    expect(artifact.bytecode).toContain('OP_INVOKE');
  });

  it('eliminates functions that are only reachable through other dead functions', () => {
    const code = `
      function used(int a) returns (int) { return a + 1; }
      function deadCaller(int a) returns (int) { return deadLeaf(a); }
      function deadLeaf(int a) returns (int) { return a * 2; }

      contract Test() {
        function spend(int x) {
          require(used(x) == 6);
        }
      }`;

    // Only `used` is reachable; both `deadCaller` and the function it calls (`deadLeaf`) are dropped.
    const artifact = compileString(code);
    expect(countOpDefines(artifact.bytecode)).toEqual(1);
  });

  it('keeps a function that is only reachable transitively', () => {
    const code = `
      function outer(int a) returns (int) { return inner(a) + 1; }
      function inner(int a) returns (int) { return a * 2; }

      contract Test() {
        function spend(int x) {
          require(outer(x) == 7);
        }
      }`;

    // `outer` is called directly and `inner` only through `outer` — both must be defined.
    const artifact = compileString(code);
    expect(countOpDefines(artifact.bytecode)).toEqual(2);
  });

  it('keeps a recursive function without looping forever', () => {
    const code = `
      function f(int n) returns (int) { return f(n); }

      contract Test() {
        function spend(int x) {
          require(f(x) == 0);
        }
      }`;

    const artifact = compileString(code);
    expect(countOpDefines(artifact.bytecode)).toEqual(1);
  });

  it('keeps mutually recursive functions that are reachable', () => {
    const code = `
      function a(int n) returns (int) { return b(n); }
      function b(int n) returns (int) { return a(n); }

      contract Test() {
        function spend(int x) {
          require(a(x) == 0);
        }
      }`;

    const artifact = compileString(code);
    expect(countOpDefines(artifact.bytecode)).toEqual(2);
  });

  it('eliminates a mutually recursive cycle that is never reached', () => {
    const code = `
      function used(int n) returns (int) { return n + 1; }
      function deadA(int n) returns (int) { return deadB(n); }
      function deadB(int n) returns (int) { return deadA(n); }

      contract Test() {
        function spend(int x) {
          require(used(x) == 1);
        }
      }`;

    // deadA <-> deadB form a cycle but neither is reachable, so both are dropped.
    const artifact = compileString(code);
    expect(countOpDefines(artifact.bytecode)).toEqual(1);
  });

  it('eliminates an unused imported function', () => {
    // math.cash exports both `addOne` and `double`; only `double` is used here, so `addOne` is dropped.
    const code = 'import "./math.cash";\ncontract Test() { function spend(int x) { require(double(x) == 8); } }';

    const artifact = compileString(code, { basePath: fixtureDir });
    expect(countOpDefines(artifact.bytecode)).toEqual(1);
  });
});

describe('Stable function id assignment', () => {
  it('reordering function declarations does not change the bytecode', () => {
    const ordered = `
      function a(int n) returns (int) { return n + 1; }
      function b(int n) returns (int) { return n * 2; }

      contract Test() {
        function spend(int x) {
          require(b(x) + a(x) == 10);
        }
      }`;

    const reordered = `
      function b(int n) returns (int) { return n * 2; }
      function a(int n) returns (int) { return n + 1; }

      contract Test() {
        function spend(int x) {
          require(b(x) + a(x) == 10);
        }
      }`;

    // functionIds follow call order (b, then a) rather than declaration order, so swapping the two
    // declarations produces byte-identical output.
    expect(compileString(reordered).bytecode).toEqual(compileString(ordered).bytecode);
  });

  it('renaming a function does not change the bytecode', () => {
    const original = `
      function apple(int n) returns (int) { return n + 1; }
      function mango(int n) returns (int) { return n * 2; }

      contract Test() {
        function spend(int x) {
          require(mango(x) + apple(x) == 10);
        }
      }`;

    const renamed = `
      function zebra(int n) returns (int) { return n + 1; }
      function mango(int n) returns (int) { return n * 2; }

      contract Test() {
        function spend(int x) {
          require(mango(x) + zebra(x) == 10);
        }
      }`;

    expect(compileString(renamed).bytecode).toEqual(compileString(original).bytecode);
  });
});
