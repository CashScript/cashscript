import { describe, it, expect } from 'vitest';
import { compileString } from '../../src/compiler.js';

const GUARD_PREFIX = 'OP_TXLOCKTIME OP_CHECKLOCKTIMEVERIFY OP_DROP';

describe('InjectLocktimeGuardTraversal', () => {
  it('injects guard when tx.locktime is used without a tx.time check', () => {
    const src = `
      contract T() {
        function spend() {
          int x = tx.locktime;
          require(x >= 100);
        }
      }`;
    expect(compileString(src).bytecode.startsWith(GUARD_PREFIX)).toBe(true);
  });

  it('does not inject when a top-level require(tx.time >= ...) is already present', () => {
    const src = `
      contract T() {
        function spend() {
          require(tx.time >= 100);
          int x = tx.locktime;
          require(x >= 100);
        }
      }`;
    expect(compileString(src).bytecode.startsWith(GUARD_PREFIX)).toBe(false);
  });

  it('does not inject when a top-level require(tx.time >= ...) is already present, even if the check is after tx.locktime access', () => {
    const src = `
      contract T() {
        function spend() {
          int x = tx.locktime;
          require(x >= 100);
          require(tx.time >= 100);
        }
      }`;
    expect(compileString(src).bytecode.startsWith(GUARD_PREFIX)).toBe(false);
  });

  it('does not inject when the function does not reference tx.locktime', () => {
    const src = `
      contract T() {
        function spend(int x) {
          require(x >= 1);
        }
      }`;
    expect(compileString(src).bytecode.startsWith(GUARD_PREFIX)).toBe(false);
  });

  it('injects guard when tx.locktime is used only inside a branch body', () => {
    const src = `
      contract T() {
        function spend(int x) {
          if (x > 0) {
            int y = tx.locktime;
            require(y >= 100);
          } else {
            require(x == 0);
          }
        }
      }`;
    expect(compileString(src).bytecode.startsWith(GUARD_PREFIX)).toBe(true);
  });

  it('injects guard when tx.locktime is used only in a branch condition', () => {
    const src = `
      contract T() {
        function spend() {
          if (tx.locktime > 100) {
            require(true);
          } else {
            require(true);
          }
        }
      }`;
    expect(compileString(src).bytecode.startsWith(GUARD_PREFIX)).toBe(true);
  });

  it('does not inject guard when tx.locktime is used in a branch body and tx.time check is already present', () => {
    const src = `
      contract T() {
        function spend(int x) {
          if (x > 0) {
            require(tx.time >= x);
            int y = tx.locktime;
            require(y >= 100);
          } else {
            require(x == 0);
          }
        }
      }`;
    expect(compileString(src).bytecode.startsWith(GUARD_PREFIX)).toBe(false);
  });

  it('does not inject guard when tx.locktime is used in a branch body and tx.time check is already present, even if the check is after tx.locktime access', () => {
    const src = `
      contract T() {
        function spend(int x) {
          if (x > 0) {
            int y = tx.locktime;
            require(y >= 100);
            require(tx.time >= x);
          } else {
            require(x == 0);
          }
        }
      }`;
    expect(compileString(src).bytecode.startsWith(GUARD_PREFIX)).toBe(false);
  });

  it('does not inject guard when tx.locktime is used in a branch body and tx.time check is already present, even if the check is after tx.locktime access in upper scope', () => {
    const src = `
      contract T() {
        function spend(int x) {
          if (x > 0) {
            int y = tx.locktime;
            require(y >= 100);
            } else {
              require(x == 0);
          }
          require(tx.time >= x);
        }
      }`;
    expect(compileString(src).bytecode.startsWith(GUARD_PREFIX)).toBe(false);
  });

  it('injects guard when tx.locktime is used inside a loop body', () => {
    const src = `
      contract T() {
        function spend() {
          int sum = 0;
          for (int i = 0; i < 3; i = i + 1) {
            sum = sum + tx.locktime;
          }
          require(sum >= 0);
        }
      }`;
    expect(compileString(src).bytecode.startsWith(GUARD_PREFIX)).toBe(true);
  });


  it('does not inject when tx.locktime appears only inside a tx.time check expression', () => {
    const src = `
      contract T() {
        function spend() {
          require(tx.time >= tx.locktime - 10);
        }
      }`;
    expect(compileString(src).bytecode.startsWith(GUARD_PREFIX)).toBe(false);
  });

  it('only injects in functions that use tx.locktime', () => {
    const src = `
      contract T() {
        function withLocktime() {
          int x = tx.locktime;
          require(x >= 100);
        }
        function withoutLocktime(int y) {
          require(y >= 1);
        }
      }`;
    const bytecode = compileString(src).bytecode;
    expect([...bytecode.matchAll(new RegExp(GUARD_PREFIX, 'g'))]).toHaveLength(1);
  });

  it('uses tx.locktime as the threshold (not a literal) for type-safety with timestamp locktimes', () => {
    const src = `
      contract T() {
        function spend() {
          int x = tx.locktime;
          require(x >= 0);
        }
      }`;
    const bytecode = compileString(src).bytecode;
    expect(bytecode.startsWith(GUARD_PREFIX)).toBe(true);
  });

  it('does not inject when require(this.age >= LITERAL) uses a literal below 2^31', () => {
    const src = `
      contract T() {
        function spend() {
          require(this.age >= 100);
          int x = tx.locktime;
          require(x >= 100);
        }
      }`;
    expect(compileString(src).bytecode.startsWith(GUARD_PREFIX)).toBe(false);
  });

  it('still injects when require(this.age >= ...) uses a non-literal operand', () => {
    const src = `
      contract T() {
        function spend(int minAge) {
          require(this.age >= minAge);
          int x = tx.locktime;
          require(x >= 100);
        }
      }`;
    expect(compileString(src).bytecode.startsWith(GUARD_PREFIX)).toBe(true);
  });

  it('does not inject when enforceLocktimeGuard is disabled', () => {
    const src = `
      contract T() {
        function spend() {
          int x = tx.locktime;
          require(x >= 100);
        }
      }`;
    expect(compileString(src, { enforceLocktimeGuard: false }).bytecode.startsWith(GUARD_PREFIX)).toBe(false);
  });
});

// The guard is only injected into contract spending functions, never into global functions (non-finality
// is a transaction-wide property, so a single guard on the spending path covers any tx.locktime accessed
// inside invoked global functions). Whether a contract function needs the guard is therefore decided by
// looking through the global functions it (transitively) invokes. The injected guard is a require with a
// distinctive message, which is detectable even when the OP_DEFINE prologue precedes the contract body.
describe('InjectLocktimeGuardTraversal — global functions', () => {
  const GUARD_MESSAGE = 'non-final sequence number';
  const guardInjected = (src: string): boolean => (compileString(src).debug?.requires ?? [])
    .some((statement) => statement.message?.includes(GUARD_MESSAGE));

  it('injects guard in the contract when an invoked global uses tx.locktime', () => {
    const src = `
      function usesLocktime() returns (int) { return tx.locktime; }
      contract T() {
        function spend() {
          require(usesLocktime() >= 100);
        }
      }`;
    expect(guardInjected(src)).toBe(true);
  });

  it('does not inject when the contract has a tx.time check before invoking the global', () => {
    const src = `
      function usesLocktime() returns (int) { return tx.locktime; }
      contract T() {
        function spend() {
          require(tx.time >= 100);
          require(usesLocktime() >= 100);
        }
      }`;
    expect(guardInjected(src)).toBe(false);
  });

  it('does not inject when the invoked global covers its own tx.locktime with a tx.time check', () => {
    const src = `
      function usesLocktime() returns (int) { require(tx.time >= 100); return tx.locktime; }
      contract T() {
        function spend() {
          require(usesLocktime() >= 0);
        }
      }`;
    expect(guardInjected(src)).toBe(false);
  });

  it('injects guard for tx.locktime reached transitively through nested global invocations', () => {
    const src = `
      function inner() returns (int) { return tx.locktime; }
      function outer() returns (int) { return inner(); }
      contract T() {
        function spend() {
          require(outer() >= 100);
        }
      }`;
    expect(guardInjected(src)).toBe(true);
  });

  it('does not inject when a caller global covers the callee with its own tx.time check', () => {
    const src = `
      function inner() returns (int) { return tx.locktime; }
      function outer() returns (int) { require(tx.time >= 100); return inner(); }
      contract T() {
        function spend() {
          require(outer() >= 0);
        }
      }`;
    expect(guardInjected(src)).toBe(false);
  });

  it('injects guard when an invoked global only uses tx.locktime inside a branch', () => {
    const src = `
      function maybeLocktime(int a) {
        if (a > 0) {
          int x = tx.locktime;
          require(x >= 100);
        } else {
          require(a == 0);
        }
      }
      contract T() {
        function spend(int x) {
          maybeLocktime(x);
          require(x >= 0);
        }
      }`;
    expect(guardInjected(src)).toBe(true);
  });

  it('does not inject when an invoked global does not use tx.locktime', () => {
    const src = `
      function double(int a) returns (int) { return a * 2; }
      contract T() {
        function spend(int x) {
          require(double(x) >= 2);
        }
      }`;
    expect(guardInjected(src)).toBe(false);
  });
});
