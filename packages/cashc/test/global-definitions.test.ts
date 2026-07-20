/*   global-definitions.test.ts
 *
 * - This file tests the compilation behaviour of user-defined global functions and constants:
 *   dead-code elimination of unreachable definitions, stable VM function-ID assignment, and the
 *   lowering of constants to zero-argument functions.
 * - Compile errors are tested with the fixture files in ./compiler, and the exact compiled output
 *   is locked in by the fixtures in generation/fixtures.ts.
 */

import { compileString } from '../src/index.js';

const countOp = (bytecode: string, opcode: string): number => [...bytecode.matchAll(new RegExp(opcode, 'g'))].length;

const longHex = (byte: string): string => `0x${byte.repeat(32)}`;

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
    expect(countOp(artifact.bytecode, 'OP_DEFINE')).toEqual(1);
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
    expect(countOp(artifact.bytecode, 'OP_DEFINE')).toEqual(1);
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
    expect(countOp(artifact.bytecode, 'OP_DEFINE')).toEqual(2);
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
    expect(countOp(artifact.bytecode, 'OP_DEFINE')).toEqual(1);
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
    expect(countOp(artifact.bytecode, 'OP_DEFINE')).toEqual(2);
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
    expect(countOp(artifact.bytecode, 'OP_DEFINE')).toEqual(1);
  });

  it('eliminates an unused imported function', () => {
    // math.cash exports both `addOne` and `double`; only `double` is used here, so `addOne` is dropped.
    const code = 'import "./math.cash";\ncontract Test() { function spend(int x) { require(double(x) == 8); } }';
    const mathSource = `
      function addOne(int a) returns (int) { return a + 1; }
      function double(int a) returns (int) { return a * 2; }
    `;

    const artifact = compileString(code, { files: { './math.cash': mathSource } });
    expect(countOp(artifact.bytecode, 'OP_DEFINE')).toEqual(1);
  });

  it('does not define an unused constant', () => {
    const contract = `
      contract Unused() {
        function spend() {
          require(true);
        }
      }`;

    const withConstant = compileString(`bytes32 constant UNUSED = ${longHex('11')};\n${contract}`);
    expect(withConstant.bytecode).toEqual(compileString(contract).bytecode);
  });

  it('does not define a constant referenced only by console.log', () => {
    const contract = (message: string): string => `
      contract ConsoleOnly() {
        function spend() {
          console.log(${message});
          require(true);
        }
      }`;

    const withConstant = compileString(`string constant MESSAGE = "debug only";\n${contract('MESSAGE')}`);
    expect(withConstant.bytecode).toEqual(compileString(contract('"debug only"')).bytecode);
  });
});

describe('Global constants', () => {
  it('compiles a constant identically to an equivalent zero-argument function', () => {
    const contract = (reference: string): string => `
      contract Repeated(bytes32 first, bytes32 second) {
        function spend() {
          require(first == ${reference} && second == ${reference});
        }
      }`;

    const constant = compileString(`bytes32 constant HASH = ${longHex('33')};\n${contract('HASH')}`);
    const fn = compileString(`function HASH() returns (bytes32) { return ${longHex('33')}; }\n${contract('HASH()')}`);

    expect(countOp(constant.bytecode, 'OP_DEFINE')).toBe(1);
    expect(countOp(constant.bytecode, 'OP_INVOKE')).toBe(2);
    expect(constant.bytecode).toEqual(fn.bytecode);
  });

  it('retains debug source provenance for imported constants', () => {
    const importedSource = `bytes32 constant IMPORTED_HASH = ${longHex('44')};`;
    const source = `
      import "./constants.cash";
      contract Imported(bytes32 first, bytes32 second) {
        function spend() {
          require(first == IMPORTED_HASH && second == IMPORTED_HASH);
        }
      }`;

    const artifact = compileString(source, { files: { './constants.cash': importedSource } });
    expect(countOp(artifact.bytecode, 'OP_DEFINE')).toBe(1);
    expect(artifact.debug?.functions?.[0]).toMatchObject({
      name: 'IMPORTED_HASH',
      kind: 'constant',
      source: importedSource,
      sourceFile: 'constants.cash',
    });
  });
});

describe('Stable function ID assignment', () => {
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

  it('assigns IDs by first use across functions and constants', () => {
    const source = (first: string, second: string, fn: string, order: number[]): string => {
      const definitions = [
        `bytes32 constant ${first} = ${longHex('aa')};`,
        `function ${fn}() returns (bytes32) { return ${longHex('cc')}; }`,
        `bytes32 constant ${second} = ${longHex('bb')};`,
      ];

      return `
        ${order.map((index) => definitions[index]).join('\n')}
        contract Stable(bytes32 a, bytes32 b, bytes32 c) {
          function spend() {
            require(a == ${first} && b == ${fn}() && c == ${second});
          }
        }`;
    };

    const original = compileString(source('FIRST', 'SECOND', 'value', [0, 1, 2]));
    const renamedAndReordered = compileString(source('ALPHA', 'OMEGA', 'renamed', [2, 0, 1]));

    expect(renamedAndReordered.bytecode).toEqual(original.bytecode);
    expect(original.debug?.functions?.map(({ name, id }) => ({ name, id }))).toEqual([
      { name: 'FIRST', id: 0 },
      { name: 'value', id: 1 },
      { name: 'SECOND', id: 2 },
    ]);
  });
});
