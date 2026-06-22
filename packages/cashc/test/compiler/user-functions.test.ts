/*   user-functions.test.ts
 *
 * Tests user-defined (value-returning) functions, which are lowered to the CHIP-2025-05 function
 * opcodes OP_DEFINE (0x89) / OP_INVOKE (0x8a) rather than inlined. Each function body is compiled
 * ONCE as a standalone stack-based routine, stored in the VM function table via OP_DEFINE, and
 * every call site emits OP_INVOKE. This shares the body bytecode across all call sites (a size win
 * over inlining) and is verified to execute correctly on libauth's real BCH 2026 VM.
 */

import {
  createTestAuthenticationProgramBch,
  createVirtualMachineBch2026,
} from '@bitauth/libauth';
import { asmToScript, encodeInt, scriptToBytecode } from '@cashscript/utils';
import { compileString } from '../../src/index.js';
import {
  RecursiveFunctionError,
  ReturnTypeError,
  MissingReturnStatementError,
  ReturnStatementError,
} from '../../src/Errors.js';

const vm = createVirtualMachineBch2026(false);

// Compile a contract and execute its (single-spending-function) artifact on the real BCH 2026 VM
// against the provided unlocking-script items. Returns whether the spend is strictly accepted.
function evaluateSpend(source: string, unlockingItems: Uint8Array[]): { accepted: boolean, error?: string } {
  const artifact = compileString(source);
  const lockingBytecode = scriptToBytecode(asmToScript(artifact.bytecode));
  const unlockingBytecode = scriptToBytecode(unlockingItems);
  const program = createTestAuthenticationProgramBch({ lockingBytecode, unlockingBytecode, valueSatoshis: 1000n });
  const state = vm.evaluate(program);
  const top = state.stack[state.stack.length - 1];
  const accepted = state.error === undefined
    && state.stack.length === 1
    && top !== undefined
    && top.length === 1
    && top[0] === 1;
  return { accepted, error: state.error };
}

const byteSize = (asm: string): number => scriptToBytecode(asmToScript(asm)).byteLength;

describe('User-defined functions (OP_DEFINE / OP_INVOKE)', () => {
  describe('Code generation emits the function opcodes', () => {
    // A function whose optimised body exceeds INLINE_MAX_BODY_OPS stays shared via OP_DEFINE/OP_INVOKE.
    it('emits OP_DEFINE once and OP_INVOKE per call site for an above-threshold function', () => {
      const artifact = compileString(`
        contract Test() {
          internal function poly(int a) returns (int) { return (a * a + a * 7 + 13) % 2147483647; }
          function spend(int x) {
            int y = poly(x) + poly(x);
            require(y == 0);
          }
        }`);

      const opcodes = artifact.bytecode.split(' ');
      expect(opcodes.filter((op) => op === 'OP_DEFINE')).toHaveLength(1);
      expect(opcodes.filter((op) => op === 'OP_INVOKE')).toHaveLength(2);
    });

    it('emits one OP_DEFINE per declared above-threshold user function', () => {
      const artifact = compileString(`
        contract Test() {
          internal function f(int a) returns (int) { return (a * a + a + 1) % 2147483647; }
          internal function g(int a) returns (int) { return (a * 4 + a * a + 9) % 2147483647; }
          function spend(int x) {
            int y = g(f(x));
            require(y == 8);
          }
        }`);

      const opcodes = artifact.bytecode.split(' ');
      expect(opcodes.filter((op) => op === 'OP_DEFINE')).toHaveLength(2);
      expect(opcodes.filter((op) => op === 'OP_INVOKE')).toHaveLength(2);
    });

    // A tiny body is spliced at its call sites (no OP_DEFINE / OP_INVOKE), since the per-call
    // funcid-push + OP_INVOKE overhead would exceed the body itself.
    it('inlines a tiny function instead of emitting OP_DEFINE/OP_INVOKE', () => {
      const artifact = compileString(`
        contract Test() {
          internal function square(int a) returns (int) { return a * a; }
          function spend(int x) {
            int y = square(x) + square(x);
            require(y == 18);
          }
        }`);

      const opcodes = artifact.bytecode.split(' ');
      expect(opcodes.filter((op) => op === 'OP_DEFINE')).toHaveLength(0);
      expect(opcodes.filter((op) => op === 'OP_INVOKE')).toHaveLength(0);
      // the inlined body's multiply appears once per call site
      expect(opcodes.filter((op) => op === 'OP_MUL')).toHaveLength(2);
    });
  });

  describe('Size win over inlining', () => {
    // For a function called N >= 3 times, sharing the body via OP_DEFINE/OP_INVOKE produces smaller
    // bytecode than the equivalent fully-inlined contract (the previous inlining behaviour).
    it('is smaller than the hand-inlined equivalent for a function called 4 times', () => {
      const withFunction = `
        contract Test() {
          internal function poly(int a) returns (int) {
            int t = a * a + a;
            return t * 2 + 7;
          }
          function spend(int x) {
            int y = poly(x) + poly(x) + poly(x) + poly(x);
            require(y == 76);
          }
        }`;

      // Mirrors the previous inlining lowering: bind each argument, inline the body, assign the
      // result, for every call site.
      const handInlined = `
        contract Test() {
          function spend(int x) {
            int a1 = x; int t1 = a1 * a1 + a1; int r1 = t1 * 2 + 7;
            int a2 = x; int t2 = a2 * a2 + a2; int r2 = t2 * 2 + 7;
            int a3 = x; int t3 = a3 * a3 + a3; int r3 = t3 * 2 + 7;
            int a4 = x; int t4 = a4 * a4 + a4; int r4 = t4 * 2 + 7;
            int y = r1 + r2 + r3 + r4;
            require(y == 76);
          }
        }`;

      const functionSize = byteSize(compileString(withFunction).bytecode);
      const inlinedSize = byteSize(compileString(handInlined).bytecode);

      expect(functionSize).toBeLessThan(inlinedSize);
    });
  });

  describe('Execution on the real BCH 2026 VM', () => {
    it('a function called twice evaluates correctly', () => {
      const source = `
        contract Test() {
          internal function square(int a) returns (int) { return a * a; }
          function spend(int x) {
            int y = square(x) + square(x);
            require(y == 18);
          }
        }`;
      // 2 * x^2 == 18 -> x == 3
      expect(evaluateSpend(source, [encodeInt(3n)]).accepted).toBe(true);
      expect(evaluateSpend(source, [encodeInt(4n)]).accepted).toBe(false);
    });

    it('a function called four times evaluates correctly (size-win contract)', () => {
      const source = `
        contract Test() {
          internal function poly(int a) returns (int) { int t = a * a + a; return t * 2 + 7; }
          function spend(int x) {
            int y = poly(x) + poly(x) + poly(x) + poly(x);
            require(y == 76);
          }
        }`;
      // poly(2) = 2*(4+2)+7 = 19, 4 * 19 = 76
      expect(evaluateSpend(source, [encodeInt(2n)]).accepted).toBe(true);
      expect(evaluateSpend(source, [encodeInt(5n)]).accepted).toBe(false);
    });

    it('nested calls evaluate correctly', () => {
      const source = `
        contract Test() {
          internal function increment(int a) returns (int) { return a + 1; }
          internal function quadruple(int a) returns (int) { return a * 4; }
          function spend(int x) {
            int y = quadruple(increment(x));
            require(y == 8);
          }
        }`;
      // (x + 1) * 4 == 8 -> x == 1
      expect(evaluateSpend(source, [encodeInt(1n)]).accepted).toBe(true);
      expect(evaluateSpend(source, [encodeInt(2n)]).accepted).toBe(false);
    });

    it('a two-argument function preserves argument order', () => {
      const source = `
        contract Test() {
          internal function addThem(int a, int b) returns (int) { return a + b * 2; }
          function spend(int x) { require(addThem(x, 3) == 10); }
        }`;
      // x + 3 * 2 == 10 -> x == 4
      expect(evaluateSpend(source, [encodeInt(4n)]).accepted).toBe(true);
      expect(evaluateSpend(source, [encodeInt(5n)]).accepted).toBe(false);
    });

    it('a call inside an if-statement evaluates correctly', () => {
      const source = `
        contract Test() {
          internal function increment(int a) returns (int) { return a + 1; }
          function spend(int x) {
            if (x > 0) { int y = increment(x); require(y == 6); }
            require(x >= 0);
          }
        }`;
      // x > 0 and x + 1 == 6 -> x == 5
      expect(evaluateSpend(source, [encodeInt(5n)]).accepted).toBe(true);
      expect(evaluateSpend(source, [encodeInt(4n)]).accepted).toBe(false);
    });

    it('a call inside a loop body evaluates correctly', () => {
      const source = `
        contract Test() {
          internal function increment(int a) returns (int) { return a + 1; }
          function spend(int x) {
            int sum = x;
            for (int i = 0; i < 3; i = i + 1) { sum = sum + increment(i); }
            require(sum == x + 6);
          }
        }`;
      // increment(0)+increment(1)+increment(2) = 1+2+3 = 6, so sum == x + 6 always
      expect(evaluateSpend(source, [encodeInt(10n)]).accepted).toBe(true);
    });

    it('OP_DEFINE/OP_INVOKE coexist with the multi-spending-function selector', () => {
      const source = `
        contract Test() {
          internal function dbl(int a) returns (int) { return a * 2; }
          function first(int x) { require(dbl(x) == 4); }
          function second(int x) { require(dbl(x) == 6); }
        }`;
      // selector 1 -> second: dbl(3) == 6. Unlocking items: <arg> <selector>
      expect(evaluateSpend(source, [encodeInt(3n), encodeInt(1n)]).accepted).toBe(true);
      // selector 0 -> first: dbl(2) == 4
      expect(evaluateSpend(source, [encodeInt(2n), encodeInt(0n)]).accepted).toBe(true);
      // selector 1 -> second with wrong arg
      expect(evaluateSpend(source, [encodeInt(2n), encodeInt(1n)]).accepted).toBe(false);
    });
  });

  describe('ABI excludes user-defined functions', () => {
    it('only exposes contract spending functions in the ABI', () => {
      const artifact = compileString(`
        contract Test() {
          internal function double(int a) returns (int) { return a * 2; }
          function spend(int x) {
            require(double(x) == 4);
          }
        }`);

      expect(artifact.abi).toHaveLength(1);
      expect(artifact.abi[0].name).toEqual('spend');
    });
  });

  describe('Multi-value (tuple) returns', () => {
    it('emits OP_DEFINE/OP_INVOKE for a multi-return function', () => {
      const artifact = compileString(`
        contract Test() {
          internal function tri(int x, int y, int z) returns (int, int, int) {
            int nx = x * 2; int ny = y * 3; int nz = z + 1;
            return nx, ny, nz;
          }
          function spend(int a) {
            (int ax, int ay, int az) = tri(a, a, a);
            require(ax == a * 2);
            require(ay == a * 3);
            require(az == a + 1);
          }
        }`);
      const opcodes = artifact.bytecode.split(' ');
      expect(opcodes.filter((op) => op === 'OP_DEFINE')).toHaveLength(1);
      expect(opcodes.filter((op) => op === 'OP_INVOKE')).toHaveLength(1);
    });

    it('a 3-return (Jacobian-double-like) function evaluates correctly on the BCH 2026 VM', () => {
      // nx = x*2, ny = y*3, nz = z+1 — exercises a 3-coordinate (curve-point-like) return.
      const source = `
        contract Test() {
          internal function jacDouble(int x, int y, int z) returns (int, int, int) {
            int nx = x * 2; int ny = y * 3; int nz = z + 1;
            return nx, ny, nz;
          }
          function spend(int a) {
            (int ax, int ay, int az) = jacDouble(a, a, a);
            require(ax == a * 2);
            require(ay == a * 3);
            require(az == a + 1);
          }
        }`;
      expect(evaluateSpend(source, [encodeInt(5n)]).accepted).toBe(true);
      expect(evaluateSpend(source, [encodeInt(0n)]).accepted).toBe(true);
      // Tamper: a contract that asserts wrong results must fail.
      const wrong = `
        contract Test() {
          internal function jacDouble(int x, int y, int z) returns (int, int, int) {
            int nx = x * 2; int ny = y * 3; int nz = z + 1;
            return nx, ny, nz;
          }
          function spend(int a) {
            (int ax, int ay, int az) = jacDouble(a, a, a);
            require(ax == a);
            require(ay == a * 3);
            require(az == a + 1);
          }
        }`;
      expect(evaluateSpend(wrong, [encodeInt(5n)]).accepted).toBe(false);
    });

    it('the bare (no-parentheses) destructuring form also works', () => {
      const source = `
        contract Test() {
          internal function tri(int x) returns (int, int, int) { return x, x + 1, x + 2; }
          function spend(int a) {
            int p, int q, int r = tri(a);
            require(p == a);
            require(q == a + 1);
            require(r == a + 2);
          }
        }`;
      expect(evaluateSpend(source, [encodeInt(9n)]).accepted).toBe(true);
    });

    it('a 2-return function evaluates correctly', () => {
      // Concrete assertions on the destructured values so a wrong unlocking arg is rejected.
      const source = `
        contract Test() {
          internal function pair(int x, int y) returns (int, int) { return x + y, x - y; }
          function spend(int a, int b) {
            (int s, int d) = pair(a, b);
            require(s == 10);
            require(d == 4);
          }
        }`;
      // a + b == 10 and a - b == 4 -> a == 7, b == 3. Unlocking items map to parameters in reverse
      // (the last parameter's argument is pushed first), so [b, a] == [3, 7].
      expect(evaluateSpend(source, [encodeInt(3n), encodeInt(7n)]).accepted).toBe(true);
      expect(evaluateSpend(source, [encodeInt(4n), encodeInt(7n)]).accepted).toBe(false);
    });

    it('a destructured result can feed another call', () => {
      const source = `
        contract Test() {
          internal function tri(int x) returns (int, int, int) { return x, x + 1, x + 2; }
          internal function add(int a, int b) returns (int) { return a + b; }
          function spend(int a) {
            (int p, int q, int r) = tri(a);
            require(add(p, q) == 2 * a + 1);
            require(r == a + 2);
          }
        }`;
      expect(evaluateSpend(source, [encodeInt(4n)]).accepted).toBe(true);
      expect(evaluateSpend(source, [encodeInt(5n)]).accepted).toBe(true);
    });

    it('a tiny multi-return function called twice (inlined) evaluates correctly', () => {
      const source = `
        contract Test() {
          internal function pair(int x) returns (int, int) { return x * 2, x * 3; }
          function spend(int a) {
            (int p1, int q1) = pair(a);
            (int p2, int q2) = pair(a + 1);
            require(p1 == a * 2);
            require(q1 == a * 3);
            require(p2 == (a + 1) * 2);
            require(q2 == (a + 1) * 3);
          }
        }`;
      const artifact = compileString(source);
      const opcodes = artifact.bytecode.split(' ');
      // `pair` is below the inline threshold, so it is spliced at both call sites (no OP_DEFINE).
      expect(opcodes.filter((op) => op === 'OP_DEFINE')).toHaveLength(0);
      expect(opcodes.filter((op) => op === 'OP_INVOKE')).toHaveLength(0);
      // inlining preserves multi-return semantics across both call sites
      expect(evaluateSpend(source, [encodeInt(6n)]).accepted).toBe(true);
    });

    it('a 3-return function defined once + invoked is far smaller than the inlined equivalent', () => {
      const withFunction = `
        contract Test() {
          internal function tri(int x) returns (int, int, int) {
            int nx = x * 2; int ny = x * 3 + 1; int nz = x + 7;
            return nx, ny, nz;
          }
          function spend(int x) {
            (int a1, int b1, int c1) = tri(x);
            (int a2, int b2, int c2) = tri(a1);
            (int a3, int b3, int c3) = tri(a2);
            (int a4, int b4, int c4) = tri(a3);
            require(a4 + b4 + c4 + b1 + b2 + b3 + c1 + c2 + c3 > 0);
          }
        }`;
      const handInlined = `
        contract Test() {
          function spend(int x) {
            int a1 = x * 2; int b1 = x * 3 + 1; int c1 = x + 7;
            int a2 = a1 * 2; int b2 = a1 * 3 + 1; int c2 = a1 + 7;
            int a3 = a2 * 2; int b3 = a2 * 3 + 1; int c3 = a2 + 7;
            int a4 = a3 * 2; int b4 = a3 * 3 + 1; int c4 = a3 + 7;
            require(a4 + b4 + c4 + b1 + b2 + b3 + c1 + c2 + c3 > 0);
          }
        }`;
      expect(byteSize(compileString(withFunction).bytecode))
        .toBeLessThan(byteSize(compileString(handInlined).bytecode));
    });

    it('throws when the number of returned values is fewer than declared', () => {
      expect(() => compileString(`
        contract Test() {
          internal function f(int x) returns (int, int, int) { return x, x; }
          function spend(int a) { (int p, int q, int r) = f(a); require(p == 1); require(q == 1); require(r == 1); }
        }`)).toThrow(ReturnStatementError);
    });

    it('throws when the number of returned values is more than declared', () => {
      expect(() => compileString(`
        contract Test() {
          internal function f(int x) returns (int, int) { return x, x, x; }
          function spend(int a) { (int p, int q) = f(a); require(p == 1); require(q == 1); }
        }`)).toThrow(ReturnStatementError);
    });

    it('throws on destructuring-arity mismatch (too few targets)', () => {
      expect(() => compileString(`
        contract Test() {
          internal function f(int x) returns (int, int, int) { return x, x, x; }
          function spend(int a) { (int p, int q) = f(a); require(p == 1); require(q == 1); }
        }`)).toThrow(ReturnStatementError);
    });

    it('throws when a multi-return function is used as a single value', () => {
      expect(() => compileString(`
        contract Test() {
          internal function f(int x) returns (int, int) { return x, x; }
          function spend(int a) { require(f(a) == 1); }
        }`)).toThrow(ReturnStatementError);
    });

    it('throws ReturnTypeError when a returned value type mismatches its declared type', () => {
      expect(() => compileString(`
        contract Test() {
          internal function f(int x) returns (int, bytes) { return x, x; }
          function spend(int a) { (int p, bytes q) = f(a); require(p == 1); require(q == 0x00); }
        }`)).toThrow(ReturnTypeError);
    });
  });

  describe('Errors', () => {
    it('throws RecursiveFunctionError on direct recursion', () => {
      // Recursion stays banned for now. OP_INVOKE technically permits bounded recursion within the
      // 100-deep control-stack limit; supporting it is deferred.
      expect(() => compileString(`
        contract Test() {
          internal function f(int a) returns (int) { int b = f(a); return b; }
          function spend(int x) { require(f(x) == 1); }
        }`)).toThrow(RecursiveFunctionError);
    });

    it('throws RecursiveFunctionError on mutual recursion', () => {
      expect(() => compileString(`
        contract Test() {
          internal function f(int a) returns (int) { return g(a); }
          internal function g(int a) returns (int) { return f(a); }
          function spend(int x) { require(f(x) == 1); }
        }`)).toThrow(RecursiveFunctionError);
    });

    it('throws ReturnTypeError when the return expression type mismatches', () => {
      expect(() => compileString(`
        contract Test() {
          internal function f(int a) returns (bytes) { return a; }
          function spend(int x) { require(f(x) == 0x00); }
        }`)).toThrow(ReturnTypeError);
    });

    it('throws MissingReturnStatementError when a value-returning function does not return', () => {
      expect(() => compileString(`
        contract Test() {
          internal function f(int a) returns (int) { int b = a + 1; require(b > 0); }
          function spend(int x) { require(f(x) == 2); }
        }`)).toThrow(MissingReturnStatementError);
    });

    it('throws ReturnStatementError when return is used outside a value-returning function', () => {
      expect(() => compileString(`
        contract Test() {
          function spend(int x) { return x; }
        }`)).toThrow(ReturnStatementError);
    });
  });

  describe('Internal functions: the internal keyword', () => {
    it('throws ReturnStatementError when a non-internal function declares a return type', () => {
      // Reusable (OP_DEFINE/OP_INVOKE) functions must be marked `internal`; a top-level spending
      // function may not declare a return type.
      expect(() => compileString(`
        contract Test() {
          function notInternal(int a) returns (int) { return a + 1; }
          function spend(int x) { require(x == 1); }
        }`)).toThrow(ReturnStatementError);
    });

    it('a value-returning function works when marked internal', () => {
      const source = `
        contract Test() {
          internal function increment(int a) returns (int) { return a + 1; }
          function spend(int x) { require(increment(x) == 6); }
        }`;
      expect(evaluateSpend(source, [encodeInt(5n)]).accepted).toBe(true);
      expect(evaluateSpend(source, [encodeInt(4n)]).accepted).toBe(false);
    });

    it('lowers a no-return internal function called as a statement (tiny body inlined)', () => {
      const tiny = compileString(`
        contract Test() {
          internal function assertEq(int a, int b) { require(a == b); }
          function spend(int x, int y) {
            assertEq(x, y);
            require(x + y == 10);
          }
        }`).bytecode.split(' ');
      // tiny body -> spliced (no OP_DEFINE / OP_INVOKE), the require's verify runs inline
      expect(tiny.filter((op) => op === 'OP_DEFINE')).toHaveLength(0);
      expect(tiny.filter((op) => op === 'OP_INVOKE')).toHaveLength(0);

      // an above-threshold no-return internal function stays shared and is invoked as a statement
      const shared = compileString(`
        contract Test() {
          internal function checkRange(int a, int b) {
            require(a >= 0); require(b >= 0); require(a + b < 1000000); require(a * b >= 0);
          }
          function spend(int x, int y) {
            checkRange(x, y);
            require(x + y == 10);
          }
        }`).bytecode.split(' ');
      expect(shared.filter((op) => op === 'OP_DEFINE')).toHaveLength(1);
      expect(shared.filter((op) => op === 'OP_INVOKE')).toHaveLength(1);
    });

    it('executes correctly: accepts when the internal requires pass', () => {
      const source = `
        contract Test() {
          internal function assertEq(int a, int b) { require(a == b); }
          function spend(int x, int y) {
            assertEq(x, y);
            require(x + y == 10);
          }
        }`;
      expect(evaluateSpend(source, [encodeInt(5n), encodeInt(5n)]).accepted).toBe(true);
    });

    it('executes correctly: rejects when an internal require fails', () => {
      const source = `
        contract Test() {
          internal function assertEq(int a, int b) { require(a == b); }
          function spend(int x, int y) {
            assertEq(x, y);
            require(x + y == 10);
          }
        }`;
      // a != b makes the internal require fail (4 + 6 == 10 still holds, so only assertEq can reject).
      expect(evaluateSpend(source, [encodeInt(4n), encodeInt(6n)]).accepted).toBe(false);
    });

    it('supports an internal function calling another internal function', () => {
      const source = `
        contract Test() {
          internal function notZero(int a) { require(a != 0); }
          internal function bothPositive(int a, int b) { notZero(a); notZero(b); require(a > 0); require(b > 0); }
          function spend(int x, int y) {
            bothPositive(x, y);
            require(x * y == 12);
          }
        }`;
      expect(evaluateSpend(source, [encodeInt(3n), encodeInt(4n)]).accepted).toBe(true);
      expect(evaluateSpend(source, [encodeInt(0n), encodeInt(4n)]).accepted).toBe(false);
    });

    it('throws ReturnStatementError when an internal (no-return) function contains a return', () => {
      expect(() => compileString(`
        contract Test() {
          internal function f(int a) { require(a > 0); return a; }
          function spend(int x) { f(x); require(x == 1); }
        }`)).toThrow(ReturnStatementError);
    });

    it('throws ReturnStatementError when a no-return function is used as an expression', () => {
      expect(() => compileString(`
        contract Test() {
          internal function f(int a) { require(a > 0); }
          function spend(int x) { int y = f(x); require(y == 1); }
        }`)).toThrow(ReturnStatementError);
    });

    it('throws ReturnStatementError when a value-returning function is called as a statement', () => {
      expect(() => compileString(`
        contract Test() {
          internal function f(int a) returns (int) { return a + 1; }
          function spend(int x) { f(x); require(x == 1); }
        }`)).toThrow(ReturnStatementError);
    });
  });
});
