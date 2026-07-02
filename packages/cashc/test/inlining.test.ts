import { compileString } from '../src/index.js';

const hasDefine = (bytecode: string): boolean => /OP_DEFINE/.test(bytecode);
const hasInvoke = (bytecode: string): boolean => /OP_INVOKE/.test(bytecode);

describe('Function inlining', () => {
  it('inlines a single-use function (OP_DEFINE/OP_INVOKE would be pure overhead)', () => {
    const code = `
      function triple(int x) returns (int) { return x * 3; }
      contract C() { function spend(int n) { require(triple(n) == 12); } }`;
    const { bytecode } = compileString(code);
    expect(hasDefine(bytecode)).toBe(false);
    expect(hasInvoke(bytecode)).toBe(false);
  });

  it('inlines a small multi-use function', () => {
    const code = `
      function inc(int x) returns (int) { return x + 1; }
      contract C() { function spend(int n) { require(inc(n) + inc(n) == 12); } }`;
    expect(hasDefine(compileString(code).bytecode)).toBe(false);
  });

  it('shares a large multi-use function via OP_DEFINE/OP_INVOKE', () => {
    const code = `
      function big(int x) returns (int) { return (x * 7 + 3) * (x + 11) - 5; }
      contract C() { function spend(int n) { require(big(n) + big(n + 1) > 0); } }`;
    const { bytecode } = compileString(code);
    expect(hasDefine(bytecode)).toBe(true);
    expect(hasInvoke(bytecode)).toBe(true);
  });

  it('never inlines a recursive function (would splice a call to an undefined body)', () => {
    const code = `
      function loop(int x) returns (int) { return loop(x) + 1; }
      contract C() { function spend(int n) { require(loop(n) == 1); } }`;
    const { bytecode } = compileString(code);
    expect(hasDefine(bytecode)).toBe(true);
    expect(hasInvoke(bytecode)).toBe(true);
  });

  it('keeps a function called inside a loop shared via OP_DEFINE (skipped-branch stepping cost)', () => {
    const code = `
      function big(int x) returns (int) { return (x * 7 + 3) * (x + 11) - 5; }
      contract C() {
        function spend(int n) {
          int acc = 0;
          for (int i = 0; i < 10; i = i + 1) {
            if (n > i) { acc = big(acc + i); }
          }
          require(acc > 0);
        }
      }`;
    const { bytecode } = compileString(code);
    expect(hasDefine(bytecode)).toBe(true);
    expect(hasInvoke(bytecode)).toBe(true);
  });

  it('keeps the callees of a loop-called function shared too (they would be stepped per iteration)', () => {
    const code = `
      function inner(int x) returns (int) { return (x * 7 + 3) * (x + 11) - 5; }
      function outer(int x) returns (int) { if (x > 5) { x = inner(x); } return x; }
      contract C() {
        function spend(int n) {
          int acc = 0;
          for (int i = 0; i < 10; i = i + 1) { acc = outer(acc + n); }
          require(acc > 0);
        }
      }`;
    const { bytecode } = compileString(code);
    // both outer and inner stay defined -> two OP_DEFINEs
    expect((bytecode.match(/OP_DEFINE/g) ?? []).length).toBe(2);
    expect(hasInvoke(bytecode)).toBe(true);
  });

  it('still inlines a tiny body inside a loop (steps no more than the invoke site would)', () => {
    const code = `
      function inc(int x) returns (int) { return x + 1; }
      contract C() {
        function spend(int n) {
          int acc = 0;
          for (int i = 0; i < 10; i = i + 1) {
            if (n > i) { acc = inc(acc); }
          }
          require(acc > 0);
        }
      }`;
    const { bytecode } = compileString(code);
    expect(hasDefine(bytecode)).toBe(false);
    expect(hasInvoke(bytecode)).toBe(false);
  });

  it('disableInlining keeps a single-use function shared via OP_DEFINE', () => {
    const code = `
      function triple(int x) returns (int) { return x * 3; }
      contract C() { function spend(int n) { require(triple(n) == 12); } }`;
    const { bytecode } = compileString(code, { disableInlining: true });
    expect(hasDefine(bytecode)).toBe(true);
    expect(hasInvoke(bytecode)).toBe(true);
  });
});
