import {
  createTestAuthenticationProgramBch,
  createVirtualMachineBch2026,
} from '@bitauth/libauth';
import { asmToBytecode, encodeInt, scriptToBytecode } from '@cashscript/utils';
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

// Execution coverage for the SCOPED destructuring fold (GenerateTargetTraversal
// visitTupleAssignment): inside a loop/branch the stack layout must be preserved, so
// reassignments are folded into the existing slots via emitReplace instead of the
// depth-0 pure-rename strategy.
describe('tuple destructuring into existing variables (scoped fold)', () => {
  it.each([[true], [false]] as const)(
    'folds pure reassignment in a loop (disableInlining: %s)',
    (disableInlining) => {
      const code = `
        function swap(int x, int y) returns (int, int) {
          return y, x;
        }
        contract LoopSwap() {
          function spend(int a, int b) {
            // odd iteration count: the net effect is one swap
            for (int i = 0; i < 3; i = i + 1) {
              (a, b) = swap(a, b);
            }
            require(a > b);
          }
        }`;
      const artifact = compileString(code, { disableInlining });

      // after the net swap, a holds the original b
      expect(evaluate(artifact.bytecode, [2n, 5n])).toBe(true);
      expect(evaluate(artifact.bytecode, [5n, 2n])).toBe(false);
    },
  );

  it('folds mixed declaration + reassignment inside a branch', () => {
    const code = `
      function pair(int n) returns (int, int) {
        return n * 2, n + 1;
      }
      contract BranchFold() {
        function spend(int a) {
          int total = 0;
          if (a > 10) {
            int d, total = pair(a);
            require(d == a * 2);
          }
          require(total > 0);
        }
      }`;
    const artifact = compileString(code);

    // branch taken: total is reassigned to a + 1 > 0
    expect(evaluate(artifact.bytecode, [11n])).toBe(true);
    // branch not taken: total stays 0 and the final require fails
    expect(evaluate(artifact.bytecode, [5n])).toBe(false);
  });

  it('folds mixed declaration + reassignment of loop-carried state', () => {
    const code = `
      function step(int x, int y) returns (int, int, int) {
        return x + y, x + y, y;
      }
      contract Fib() {
        // pad buys op-cost budget for the loop (the budget scales with unlocking bytes)
        function spend(int expected, int unused pad) {
          int a = 0;
          int b = 1;
          int last = 0;
          for (int i = 0; i < 5; i = i + 1) {
            // fresh declaration first, then the two updated accumulators
            (int next, b, a) = step(a, b);
            last = next;
          }
          require(last == expected);
        }
      }`;
    const artifact = compileString(code);
    const pad = 1n << 4000n; // ~500-byte push

    // fib recurrence (a, b = b, a + b): iterations produce 1, 2, 3, 5, 8
    expect(evaluate(artifact.bytecode, [8n, pad])).toBe(true);
    expect(evaluate(artifact.bytecode, [5n, pad])).toBe(false);
  });

  // Regression: a scoped reassignment is itself the variable's latest use, so the symbol pass must
  // move the opRolls entry to it. Before the fix, the last plain read kept the roll, codegen rolled
  // the variable off the stack model, and the reassignment crashed with a raw
  // "Expected variable ... does not exist on the stack".
  it.each([['if'], ['while']] as const)(
    'compiles a scoped reassignment after the variable\'s final plain read (%s)',
    (construct) => {
      const body = construct === 'if'
        ? 'if (x == 1) { (p, q) = pair(x); }'
        : 'while (x == 1) { (p, q) = pair(x); x = x + 1; }';
      const code = `
        function pair(int n) returns (int, int) {
          return n * 2, n + 1;
        }
        contract ReassignAfterFinalRead() {
          function spend(int x) {
            int p = 10;
            int q = 0;
            require(p == 10);
            ${body}
            require(q == 0 || q == 2);
          }
        }`;

      const artifact = compileString(code);
      expect(evaluate(artifact.bytecode, [1n])).toBe(true);
      expect(evaluate(artifact.bytecode, [2n])).toBe(true);
    },
  );
});
