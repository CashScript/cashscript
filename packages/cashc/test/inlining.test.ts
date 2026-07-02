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

  it('disableInlining keeps a single-use function shared via OP_DEFINE', () => {
    const code = `
      function triple(int x) returns (int) { return x * 3; }
      contract C() { function spend(int n) { require(triple(n) == 12); } }`;
    const { bytecode } = compileString(code, { disableInlining: true });
    expect(hasDefine(bytecode)).toBe(true);
    expect(hasInvoke(bytecode)).toBe(true);
  });
});
