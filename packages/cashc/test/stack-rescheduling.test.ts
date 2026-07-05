import {
  createTestAuthenticationProgramBch,
  createVirtualMachineBch2026,
  hexToBin,
} from '@bitauth/libauth';
import { asmToBytecode, bytecodeToScript, encodeInt, scriptToBytecode } from '@cashscript/utils';
import { compileString } from '../src/index.js';

const vm = createVirtualMachineBch2026(false);

// evaluate a compiled contract (no constructor args) directly against pushed spend args
function evaluate(bytecodeAsm: string, args: bigint[]): boolean {
  // spend args are pushed in reverse declaration order (first parameter on top)
  const unlocking = scriptToBytecode([...args].reverse().map((arg) => encodeInt(arg)));
  const state = vm.evaluate(createTestAuthenticationProgramBch({
    lockingBytecode: asmToBytecode(bytecodeAsm),
    unlockingBytecode: unlocking,
    valueSatoshis: 1000n,
  }));
  const top = state.stack[state.stack.length - 1];
  return state.error === undefined && state.stack.length === 1 && top !== undefined && top.length === 1 && top[0] === 1;
}

// slot-heavy single-function contract: many locals with interleaved, repeated reads
// (the access pattern the rescheduler exists to improve), plus a user function that
// stays OP_DEFINE'd, a loop, and a branch
const CONTRACT = `
  function mulmod(int a, int b, int m) returns (int) {
    int p = (a * b) % m;
    return p;
  }
  contract Sched() {
    function spend(int x, int y, int z, int w) {
      int a = x + y;
      int b = y + z;
      int c = z + w;
      int d = a * b + b * c + c * a;
      int e = mulmod(a, b, 1000000007) + mulmod(b, c, 1000000007);
      int acc = 0;
      for (int i = 0; i < 3; i = i + 1) {
        acc = acc + d + e;
      }
      if (acc > 0) {
        require(acc >= d);
      }
      require(a + b + c + d + e + acc > 0);
    }
  }`;

describe('stack rescheduling (rescheduleStacks)', () => {
  it('is off by default and leaves the bytecode unchanged', () => {
    expect(compileString(CONTRACT).bytecode).toEqual(compileString(CONTRACT, {}).bytecode);
  });

  it.each([['opcost'], ['size']] as const)(
    'preserves accept/reject behaviour under the %s objective',
    (optimizeFor) => {
      const plain = compileString(CONTRACT, { optimizeFor });
      const rescheduled = compileString(CONTRACT, { optimizeFor, rescheduleStacks: true });

      const accepts: bigint[][] = [
        [3n, 5n, 7n, 11n],
        [1000n, 2000n, 3000n, 4000n],
        [123456789n, 987654321n, 555555n, 42n],
      ];
      accepts.forEach((args) => {
        expect(evaluate(plain.bytecode, args)).toBe(true);
        expect(evaluate(rescheduled.bytecode, args)).toBe(true);
      });

      // all-zero inputs fail the final require in both compiles
      expect(evaluate(plain.bytecode, [0n, 0n, 0n, 0n])).toBe(false);
      expect(evaluate(rescheduled.bytecode, [0n, 0n, 0n, 0n])).toBe(false);
    },
  );

  it('keeps the debug source map aligned with the script', () => {
    const artifact = compileString(CONTRACT, { rescheduleStacks: true });
    const scriptLength = hexToBin(artifact.debug!.bytecode).length;
    expect(scriptLength).toBeGreaterThan(0);
    // one source-map entry per script element: entries are separated by ';'
    const elementCount = artifact.debug!.sourceMap.split(';').length;
    expect(elementCount).toEqual(bytecodeToScript(hexToBin(artifact.debug!.bytecode)).length);
  });

  it('skips multi-function contracts', () => {
    const multi = `
      contract Multi() {
        function a(int x) { require(x > 0); }
        function b(int y) { require(y > 1); }
      }`;
    expect(compileString(multi, { rescheduleStacks: true }).bytecode)
      .toEqual(compileString(multi).bytecode);
  });
});

// Dead computation: a value that never reaches its block's exit still executes for its
// failure behaviour — rejecting the spend is its only observable effect, so eliminating
// it would ACCEPT witnesses the plain compile rejects (see hasDeadComputation).
describe('dead computation is never eliminated', () => {
  // a void guard function is a zero-output invoke node at the call site — dead by
  // construction; disableInlining pins the OP_DEFINE/OP_INVOKE shape that exercises it
  const VOID_GUARD = `
    function check(int x) { require(x > 500); }
    contract Guard() {
      function spend(int a, int b) {
        check(a);
        check(b);
        require(a + b > 0);
      }
    }`;

  it.each([['opcost'], ['size']] as const)(
    'keeps void guard calls under the %s objective',
    (optimizeFor) => {
      const plain = compileString(VOID_GUARD, { optimizeFor, disableInlining: true });
      const rescheduled = compileString(VOID_GUARD, { optimizeFor, disableInlining: true, rescheduleStacks: true });

      // both call sites survive rescheduling
      const invokeCount = (asm: string): number => [...asm.matchAll(/OP_INVOKE/g)].length;
      expect(invokeCount(rescheduled.bytecode)).toEqual(invokeCount(plain.bytecode));

      expect(evaluate(plain.bytecode, [501n, 1000n])).toBe(true);
      expect(evaluate(rescheduled.bytecode, [501n, 1000n])).toBe(true);

      // each guard must still reject independently
      expect(evaluate(plain.bytecode, [1n, 1000n])).toBe(false);
      expect(evaluate(rescheduled.bytecode, [1n, 1000n])).toBe(false);
      expect(evaluate(plain.bytecode, [1000n, 1n])).toBe(false);
      expect(evaluate(rescheduled.bytecode, [1000n, 1n])).toBe(false);
    },
  );

  it('keeps void guard calls with inlining enabled (default)', () => {
    const plain = compileString(VOID_GUARD);
    const rescheduled = compileString(VOID_GUARD, { rescheduleStacks: true });
    expect(evaluate(plain.bytecode, [501n, 1000n])).toBe(true);
    expect(evaluate(rescheduled.bytecode, [501n, 1000n])).toBe(true);
    expect(evaluate(rescheduled.bytecode, [1n, 1000n])).toBe(false);
    expect(evaluate(rescheduled.bytecode, [1000n, 1n])).toBe(false);
  });

  it.each([['opcost'], ['size']] as const)(
    "keeps an 'unused' variable's failure-capable initializer under the %s objective",
    (optimizeFor) => {
      const UNUSED_DIV = `
        contract DivGuard() {
          function spend(int a) {
            int unused x = 500 / a;
            require(a < 100);
          }
        }`;
      const plain = compileString(UNUSED_DIV, { optimizeFor });
      const rescheduled = compileString(UNUSED_DIV, { optimizeFor, rescheduleStacks: true });

      expect(rescheduled.bytecode).toContain('OP_DIV');

      expect(evaluate(plain.bytecode, [5n])).toBe(true);
      expect(evaluate(rescheduled.bytecode, [5n])).toBe(true);

      // division by zero aborts the script in both compiles
      expect(evaluate(plain.bytecode, [0n])).toBe(false);
      expect(evaluate(rescheduled.bytecode, [0n])).toBe(false);
    },
  );
});
