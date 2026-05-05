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
