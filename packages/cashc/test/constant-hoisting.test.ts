import { compileString } from '../src/index.js';

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

  it('composes with folded top-level constants', () => {
    const code = `
      int constant PRIME = ${P};
      contract C() {
        function spend(int x, int y) {
          require((x - y + PRIME) % PRIME == 1);
        }
      }`;
    expect(count(asm(code, false), PRIME_ASM)).toBe(2);
    expect(count(asm(code, true), PRIME_ASM)).toBe(1);
  });

  it('produces the same ABI either way', () => {
    const a = compileString(doubleUse, { optimizeFor: 'size' });
    const b = compileString(doubleUse, { optimizeFor: 'opcost' });
    expect(a.abi).toEqual(b.abi);
  });
});
