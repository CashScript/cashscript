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
    it('emits OP_DEFINE once and OP_INVOKE per call site', () => {
      const artifact = compileString(`
        contract Test() {
          function square(int a) returns (int) { return a * a; }
          function spend(int x) {
            int y = square(x) + square(x);
            require(y == 18);
          }
        }`);

      const opcodes = artifact.bytecode.split(' ');
      expect(opcodes.filter((op) => op === 'OP_DEFINE')).toHaveLength(1);
      expect(opcodes.filter((op) => op === 'OP_INVOKE')).toHaveLength(2);
    });

    it('emits one OP_DEFINE per declared user function', () => {
      const artifact = compileString(`
        contract Test() {
          function increment(int a) returns (int) { return a + 1; }
          function quadruple(int a) returns (int) { return a * 4; }
          function spend(int x) {
            int y = quadruple(increment(x));
            require(y == 8);
          }
        }`);

      const opcodes = artifact.bytecode.split(' ');
      expect(opcodes.filter((op) => op === 'OP_DEFINE')).toHaveLength(2);
      expect(opcodes.filter((op) => op === 'OP_INVOKE')).toHaveLength(2);
    });
  });

  describe('Size win over inlining', () => {
    // For a function called N >= 3 times, sharing the body via OP_DEFINE/OP_INVOKE produces smaller
    // bytecode than the equivalent fully-inlined contract (the previous inlining behaviour).
    it('is smaller than the hand-inlined equivalent for a function called 4 times', () => {
      const withFunction = `
        contract Test() {
          function poly(int a) returns (int) {
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
          function square(int a) returns (int) { return a * a; }
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
          function poly(int a) returns (int) { int t = a * a + a; return t * 2 + 7; }
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
          function increment(int a) returns (int) { return a + 1; }
          function quadruple(int a) returns (int) { return a * 4; }
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
          function addThem(int a, int b) returns (int) { return a + b * 2; }
          function spend(int x) { require(addThem(x, 3) == 10); }
        }`;
      // x + 3 * 2 == 10 -> x == 4
      expect(evaluateSpend(source, [encodeInt(4n)]).accepted).toBe(true);
      expect(evaluateSpend(source, [encodeInt(5n)]).accepted).toBe(false);
    });

    it('a call inside an if-statement evaluates correctly', () => {
      const source = `
        contract Test() {
          function increment(int a) returns (int) { return a + 1; }
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
          function increment(int a) returns (int) { return a + 1; }
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
          function dbl(int a) returns (int) { return a * 2; }
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
          function double(int a) returns (int) { return a * 2; }
          function spend(int x) {
            require(double(x) == 4);
          }
        }`);

      expect(artifact.abi).toHaveLength(1);
      expect(artifact.abi[0].name).toEqual('spend');
    });
  });

  describe('Errors', () => {
    it('throws RecursiveFunctionError on direct recursion', () => {
      // Recursion stays banned for now. OP_INVOKE technically permits bounded recursion within the
      // 100-deep control-stack limit; supporting it is deferred.
      expect(() => compileString(`
        contract Test() {
          function f(int a) returns (int) { int b = f(a); return b; }
          function spend(int x) { require(f(x) == 1); }
        }`)).toThrow(RecursiveFunctionError);
    });

    it('throws RecursiveFunctionError on mutual recursion', () => {
      expect(() => compileString(`
        contract Test() {
          function f(int a) returns (int) { return g(a); }
          function g(int a) returns (int) { return f(a); }
          function spend(int x) { require(f(x) == 1); }
        }`)).toThrow(RecursiveFunctionError);
    });

    it('throws ReturnTypeError when the return expression type mismatches', () => {
      expect(() => compileString(`
        contract Test() {
          function f(int a) returns (bytes) { return a; }
          function spend(int x) { require(f(x) == 0x00); }
        }`)).toThrow(ReturnTypeError);
    });

    it('throws MissingReturnStatementError when a value-returning function does not return', () => {
      expect(() => compileString(`
        contract Test() {
          function f(int a) returns (int) { int b = a + 1; require(b > 0); }
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
});
