/*   global-definitions.test.ts
 *
 * - This file tests the compilation behaviour of user-defined global functions and constants:
 *   dead-code elimination of unreachable definitions, the byte-size-driven decisions to inline
 *   definitions at their call sites or to share them as OP_DEFINE / OP_INVOKE definitions, the
 *   lowering of constants to zero-argument functions, and stable VM function-ID assignment.
 * - Compile errors are tested with the fixture files in ./compiler, and the exact compiled output
 *   is locked in by the fixtures in generation/fixtures.ts.
 */

import { compileString } from '../src/internal.js';

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

    const artifact = compileString(code, { disableInlining: true });
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
    const artifact = compileString(code, { disableInlining: true });
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
    const artifact = compileString(code, { disableInlining: true });
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

    const artifact = compileString(code, { disableInlining: true });
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

    const artifact = compileString(code, { disableInlining: true });
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
    const artifact = compileString(code, { disableInlining: true });
    expect(countOp(artifact.bytecode, 'OP_DEFINE')).toEqual(1);
  });

  it('eliminates an unused imported function', () => {
    // math.cash exports both `addOne` and `double`; only `double` is used here, so `addOne` is dropped.
    const code = 'import "./math.cash";\ncontract Test() { function spend(int x) { require(double(x) == 8); } }';
    const mathSource = `
      function addOne(int a) returns (int) { return a + 1; }
      function double(int a) returns (int) { return a * 2; }
    `;

    const artifact = compileString(code, { files: { './math.cash': mathSource }, disableInlining: true });
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

describe('Inlining and shared definitions', () => {
  it('inlines a single-use function', () => {
    const code = `
      function triple(int x) returns (int) { return x * 3; }
      contract C() { function spend(int n) { require(triple(n) == 12); } }`;

    const { bytecode } = compileString(code);
    expect(bytecode).not.toContain('OP_DEFINE');
    expect(bytecode).not.toContain('OP_INVOKE');
  });

  it('inlines a small multi-use function when that is no larger', () => {
    const code = `
      function identity(int x) returns (int) { return x; }
      contract C() { function spend(int n) { require(identity(n) + identity(n) == 12); } }`;

    expect(compileString(code).bytecode).not.toContain('OP_DEFINE');
  });

  it('shares a large multi-use function with OP_DEFINE and OP_INVOKE', () => {
    const code = `
      function big(int x) returns (int) { return (x * 7 + 3) * (x + 11) - 5; }
      contract C() { function spend(int n) { require(big(n) + big(n + 1) > 0); } }`;

    const { bytecode } = compileString(code);
    expect(bytecode).toContain('OP_DEFINE');
    expect(bytecode).toContain('OP_INVOKE');
  });

  it('ignores call sites inside eliminated functions when deciding to inline', () => {
    const code = `
      function big(int x) returns (int) { return (x * 7 + 3) * (x + 11) - 5; }
      function unused(int x) returns (int) { return big(x) + big(x + 1) + big(x + 2); }
      contract C() { function spend(int n) { require(big(n) > 0); } }`;

    // big is multi-use on paper, but all extra call sites live in the eliminated function
    // unused — only the single reachable call counts, so big is inlined
    const { bytecode } = compileString(code);
    expect(bytecode).not.toContain('OP_DEFINE');
    expect(bytecode).not.toContain('OP_INVOKE');
  });

  it('inlines nested single-use functions in callee-first order', () => {
    const code = `
      function outer(int x) returns (int) { return inner(x) + 1; }
      function inner(int x) returns (int) { return x * 2; }
      contract C() { function spend(int n) { require(outer(n) == 7); } }`;

    const { bytecode } = compileString(code);
    expect(bytecode).not.toContain('OP_DEFINE');
    expect(bytecode).not.toContain('OP_INVOKE');
  });

  it('keeps every member of a mutually recursive component defined', () => {
    const code = `
      function even(int n) returns (bool) { return odd(n); }
      function odd(int n) returns (bool) { return even(n); }
      contract C() { function spend(int n) { require(even(n)); } }`;

    const { bytecode } = compileString(code);
    expect(countOp(bytecode, 'OP_DEFINE')).toBe(2);
    expect(bytecode).toContain('OP_INVOKE');
  });

  it('inlines a large constant when it is used once', () => {
    const contract = (value: string): string => `
      contract OneUse(bytes32 candidate) {
        function spend() {
          require(candidate == ${value});
        }
      }`;

    const artifact = compileString(`bytes32 constant HASH = ${longHex('22')};\n${contract('HASH')}`);
    expect(artifact.bytecode).toEqual(compileString(contract(longHex('22'))).bytecode);
    expect(artifact.bytecode).not.toContain('OP_DEFINE');
  });

  it('lists inlined functions as id-less frames after the defined ones', () => {
    const code = `
      function wrapper(int x) returns (int) { return shared(x) + shared(x + 1); }
      function shared(int x) returns (int) { return (x * 7 + 3) * (x + 11) - 5; }
      contract C() {
        function spend(int n) { require(wrapper(n) > 0); }
      }`;

    // wrapper is single-use and inlined: it keeps a debug frame documenting its compiled body,
    // but no id or define site
    const artifact = compileString(code);
    expect(artifact.debug?.functions?.map(({ name, id }) => ({ name, id }))).toEqual([
      { name: 'shared', id: 0 },
      { name: 'wrapper', id: undefined },
    ]);
    expect(countOp(artifact.bytecode, 'OP_0 OP_INVOKE')).toBe(2);
  });

  it('attributes merged debug info to the call site and keeps own lines on the frame', () => {
    const code = `
      function checkSmall(int x) {
        require(x < 100, "too big");
      }
      contract C() {
        function spend(int n) {
          checkSmall(n);
          require(n > 0);
        }
      }`;

    // Merged entries uniformly take the call-site line (like the source map); the function's
    // own line is retained on its frame for future source attribution
    const artifact = compileString(code);
    expect(artifact.bytecode).not.toContain('OP_DEFINE');
    expect(artifact.debug?.requires).toContainEqual(expect.objectContaining({
      line: 7,
      message: 'too big',
    }));
    expect(artifact.debug?.functions?.[0].requires).toContainEqual(expect.objectContaining({
      line: 3,
      message: 'too big',
    }));
  });

  it('attributes debug info of an inlined imported function to the call site', () => {
    const importedSource = 'function assertPositive(int value) {\n    require(value > 0, "must be positive");\n}';
    const source = `
      import "./helpers.cash";
      contract C() {
        function spend(int n) {
          assertPositive(n);
          require(n < 100);
        }
      }`;

    // Lines from another file cannot appear in the contract's source map, so the merged require
    // is attributed to the call-site line; the function's frame retains its source provenance
    const artifact = compileString(source, { files: { './helpers.cash': importedSource } });
    expect(artifact.bytecode).not.toContain('OP_DEFINE');
    expect(artifact.debug?.requires).toContainEqual(expect.objectContaining({
      line: 5,
      message: 'must be positive',
    }));
    expect(artifact.debug?.functions).toContainEqual(expect.objectContaining({
      name: 'assertPositive',
      sourceFile: 'helpers.cash',
      source: importedSource,
      requires: [expect.objectContaining({ line: 2, message: 'must be positive' })],
    }));
    expect(artifact.debug?.functions?.[0].id).toBeUndefined();
    expect(artifact.debug?.inlineRanges).toMatch(/^\d+:\d+:assertPositive$/);
  });

  it('attributes debug info spliced into a defined body to the call site within that body', () => {
    const importedSource = 'function assertSmall(int value) {\n    require(value < 1000, "value too large");\n}';
    const source = `
      import "./helpers.cash";
      contract C() {
        function spend(int n) { require(big(n) + big(n + 1) > 0); }
      }
      function big(int x) returns (int) {
        assertSmall(x);
        require(x > 0, "must be positive");
        return (x * 7 + 3) * (x + 11) - 5;
      }`;

    // assertSmall is inlined into the shared function big, so its require joins big's
    // frame-local requires, attributed to the call-site line inside big
    const artifact = compileString(source, { files: { './helpers.cash': importedSource } });
    expect(artifact.debug?.functions?.map(({ name, id }) => ({ name, id }))).toEqual([
      { name: 'big', id: 0 },
      { name: 'assertSmall', id: undefined },
    ]);
    expect(artifact.debug?.functions?.[0].requires).toContainEqual(expect.objectContaining({
      line: 7,
      message: 'value too large',
    }));
    expect(artifact.debug?.functions?.[0].inlineRanges).toMatch(/^\d+:\d+:assertSmall$/);
  });

  it('can disable inlining for callers that need the shared-definition form', () => {
    const code = `
      function triple(int x) returns (int) { return x * 3; }
      contract C() { function spend(int n) { require(triple(n) == 12); } }`;

    const { bytecode } = compileString(code, { disableInlining: true });
    expect(bytecode).toContain('OP_DEFINE');
    expect(bytecode).toContain('OP_INVOKE');
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
    expect(compileString(reordered, { disableInlining: true }).bytecode)
      .toEqual(compileString(ordered, { disableInlining: true }).bytecode);
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

    expect(compileString(renamed, { disableInlining: true }).bytecode)
      .toEqual(compileString(original, { disableInlining: true }).bytecode);
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

    const original = compileString(source('FIRST', 'SECOND', 'value', [0, 1, 2]), { disableInlining: true });
    const renamedAndReordered = compileString(source('ALPHA', 'OMEGA', 'renamed', [2, 0, 1]), { disableInlining: true });

    expect(renamedAndReordered.bytecode).toEqual(original.bytecode);
    expect(original.debug?.functions?.map(({ name, id }) => ({ name, id }))).toEqual([
      { name: 'FIRST', id: 0 },
      { name: 'value', id: 1 },
      { name: 'SECOND', id: 2 },
    ]);
  });

  it('keeps bytecode identical under renaming and reordering while inlining is active', () => {
    const source = (first: string, second: string, fn: string, order: number[]): string => {
      const definitions = [
        `bytes32 constant ${first} = ${longHex('aa')};`,
        `function ${fn}() returns (bytes32) { return ${longHex('cc')}; }`,
        `bytes32 constant ${second} = ${longHex('bb')};`,
      ];

      return `
        ${order.map((index) => definitions[index]).join('\n')}
        contract Stable(bytes32 a, bytes32 b, bytes32 c, bytes32 d, bytes32 e, bytes32 f) {
          function spend() {
            require(a == ${first} && b == ${first});
            require(c == ${fn}() && d == ${fn}());
            require(e == ${second} && f == ${second});
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

  it('assigns dense IDs when an inlined definition sits between shared ones', () => {
    const source = `
      bytes32 constant FIRST = ${longHex('aa')};
      function identity(bytes32 value) returns (bytes32) { return value; }
      bytes32 constant SECOND = ${longHex('bb')};
      contract Contiguous(bytes32 a, bytes32 b, bytes32 c, bytes32 d, bytes32 e) {
        function spend() {
          require(a == FIRST && b == FIRST);
          require(identity(c) == c);
          require(d == SECOND && e == SECOND);
        }
      }`;

    const artifact = compileString(source);
    expect(artifact.debug?.functions?.map(({ name, id }) => ({ name, id }))).toEqual([
      { name: 'FIRST', id: 0 },
      { name: 'SECOND', id: 1 },
      { name: 'identity', id: undefined },
    ]);
  });
});
