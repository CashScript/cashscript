import { compileString } from '../src/index.js';
import { IndexOutOfBoundsError } from '../src/Errors.js';

const P = '21888242871839275222246405745257275088696311157297823662689037894645226208583';

const asm = (code: string, hoist: boolean): string => (
  compileString(code, { optimizeFor: hoist ? 'size' : 'opcost' }).bytecode
);
const count = (haystack: string, needle: string): number => haystack.split(needle).length - 1;

// The prime's minimal VM-number encoding as it appears in ASM (64 hex chars), derived
// from a single-use compile so the tests don't hardcode the encoding.
const PRIME_ASM = asm(`contract C() { function spend(int x) { require(x == ${P}); } }`, false)
  .match(/[0-9a-f]{64}/)![0];

describe("Repeated-constant hoisting (optimizeFor: 'size')", () => {
  const doubleUse = `
    contract C() {
      function spend(int x, int y) {
        require((x - y + ${P}) % ${P} == 1);
      }
    }`;

  it('is off by default: the duplicate literal is pushed twice', () => {
    expect(count(asm(doubleUse, false), PRIME_ASM)).toBe(2);
  });

  it("defaults to the 'opcost' objective when the option is unset", () => {
    expect(compileString(doubleUse).bytecode).toBe(asm(doubleUse, false));
  });

  it('binds a duplicated big literal to a local under the flag', () => {
    expect(count(asm(doubleUse, true), PRIME_ASM)).toBe(1);
  });

  it('shrinks the bytecode under the flag', () => {
    expect(asm(doubleUse, true).length).toBeLessThan(asm(doubleUse, false).length);
  });

  it('hoists inside global function bodies too', () => {
    const code = `
      function subFp(int x, int y) returns (int) { return (x - y + ${P}) % ${P}; }
      contract C() {
        function spend(int x, int y) { require(subFp(x, y) == 1); }
      }`;
    expect(count(asm(code, false), PRIME_ASM)).toBe(2);
    expect(count(asm(code, true), PRIME_ASM)).toBe(1);
  });

  it('hoists a duplicated big hex literal', () => {
    const blob = 'aa'.repeat(32);
    const code = `
      contract C() {
        function spend(bytes b) {
          require(b.split(32)[0] == 0x${blob} || b.split(32)[1] == 0x${blob});
        }
      }`;
    expect(count(asm(code, false), blob)).toBe(2);
    expect(count(asm(code, true), blob)).toBe(1);
  });

  it('leaves small repeated literals alone (hoisting would cost bytes)', () => {
    const code = `
      contract C() {
        function spend(int x) { require((x + 3) % 3 == 1); }
      }`;
    expect(asm(code, true)).toBe(asm(code, false));
  });

  it('avoids colliding with existing names', () => {
    const code = `
      contract C() {
        function spend(int hc0, int y) {
          require((hc0 - y + ${P}) % ${P} == 1);
        }
      }`;
    expect(count(asm(code, true), PRIME_ASM)).toBe(1); // compiles (no shadowing), still hoisted
  });

  it('composes with named top-level constants', () => {
    // A multi-use named constant is already deduplicated by the shared-definition mechanism
    // (it compiles like a zero-argument function), so hoisting has nothing left to do — the
    // prime appears once under either objective, and 'size' must not duplicate or break it.
    const code = `
      int constant PRIME = ${P};
      contract C() {
        function spend(int x, int y) {
          require((x - y + PRIME) % PRIME == 1);
        }
      }`;
    expect(count(asm(code, false), PRIME_ASM)).toBe(1);
    expect(count(asm(code, true), PRIME_ASM)).toBe(1);
  });

  it('produces the same ABI either way', () => {
    const a = compileString(doubleUse, { optimizeFor: 'size' });
    const b = compileString(doubleUse, { optimizeFor: 'opcost' });
    expect(a.abi).toEqual(b.abi);
  });
});

describe('Literal-sensitive positions are never hoisted', () => {
  it('keeps split bounds literal so bounded-type inference survives', () => {
    // Pre-exclusion, the repeated 500 was hoisted, split() lost its literal bound, the tuple
    // degraded to (bytes, bytes) and the bytes500 assignment threw AssignTypeError.
    const code = `
      contract C() {
        function spend(bytes b, int i) {
          require(i == 500);
          require(i + 500 == 1000);
          bytes500 x = b.split(500)[0];
          require(x.length == 500);
        }
      }`;
    expect(() => asm(code, true)).not.toThrow();
  });

  it("raises IndexOutOfBoundsError under 'size' exactly as under 'opcost'", () => {
    // Pre-exclusion, hoisting the repeated 500 suppressed the static bounds check and the
    // contract compiled into a script whose OP_SPLIT always fails at runtime.
    const code = `
      contract C() {
        function spend(bytes32 b, int i) {
          require(i == 500);
          require(i + 500 == 1000);
          require(b.split(500)[0] != 0x00);
        }
      }`;
    expect(() => asm(code, false)).toThrow(IndexOutOfBoundsError);
    expect(() => asm(code, true)).toThrow(IndexOutOfBoundsError);
  });

  it('does not hoist literals that only appear in console.log statements', () => {
    // Console logs are stripped from the real bytecode, so hoisting their literals would
    // materialise debug-only data as live stack values and inflate the script.
    const withConsole = `
      contract C() {
        function spend(int x) {
          console.log(${P}, ${P});
          require(x == 1);
        }
      }`;
    const withoutConsole = `
      contract C() {
        function spend(int x) {
          require(x == 1);
        }
      }`;
    expect(asm(withConsole, true)).toBe(asm(withoutConsole, true));
  });

  it('keeps time-op operands literal so the locktime-guard heuristic still recognises them', () => {
    // A require(this.age >= <literal>) covers the tx.locktime read; hoisting the literal made
    // the check unrecognisable and a synthetic guard (OP_CHECKLOCKTIMEVERIFY) was injected.
    const code = `
      contract C() {
        function spend(int x) {
          require(this.age >= 100000);
          require(x == 100000);
          require(tx.locktime <= 100000 + x);
        }
      }`;
    expect(count(asm(code, true), 'OP_CHECKLOCKTIMEVERIFY')).toBe(0);
  });
});

describe('Hoisting guardrail (compile-both-keep-smaller)', () => {
  // LockingBytecodeNullData elements get cheaper codegen when they stay literals (the VarInt
  // size prefix is computed at compile time), so hoisting the repeated element inflates the
  // script — engineered inflation that the guardrail must reject.
  const nulldata = `
    contract C() {
      function spend() {
        require(new LockingBytecodeNullData([0xaabbcc, 0xaabbcc]) != 0x00);
      }
    }`;

  it("never produces a 'size' artifact larger than the unhoisted compile", () => {
    const unhoisted = compileString(nulldata, { optimizeFor: 'size', disableConstantHoisting: true }).bytecode;
    expect(asm(nulldata, true).length).toBeLessThanOrEqual(unhoisted.length);
  });

  it('keeps the literal-shaped codegen when hoisting would inflate the script', () => {
    expect(count(asm(nulldata, true), 'aabbcc')).toBe(2); // both stay literal element pushes
  });
});
