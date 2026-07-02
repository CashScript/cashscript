import { compileString } from '../src/index.js';

describe('Top-level constants', () => {
  it('inlines a constant as a literal push at each use site', () => {
    const code = `
      int constant FEE = 1000;
      contract C() { function spend(int x) { require(x - FEE >= FEE); } }`;
    const { bytecode } = compileString(code);
    // 1000 = 0xe803 as a minimally-encoded script number, pushed at both use sites
    expect([...bytecode.matchAll(/e803/g)]).toHaveLength(2);
  });

  it('folds constant arithmetic and references to earlier constants', () => {
    const withConstants = `
      int constant BASE = 40;
      int constant DERIVED = BASE + 2;
      contract C() { function spend(int x) { require(x == DERIVED); } }`;
    const literal = `
      contract C() { function spend(int x) { require(x == 42); } }`;
    expect(compileString(withConstants).bytecode).toEqual(compileString(literal).bytecode);
  });

  it('substitutes constants inside global function bodies', () => {
    const code = `
      int constant PRIME = 7919;
      function modP(int x) returns (int) { return x % PRIME; }
      contract C() { function spend(int n) { require(modP(n) >= 0); } }`;
    const { bytecode } = compileString(code);
    // 7919 = 0xef1e as a minimally-encoded script number
    expect(bytecode).toContain('ef1e');
  });

  it('compiles bytes and bool constants with matching declared types', () => {
    const code = `
      bytes2 constant TAG = 0xbeef;
      bool constant ENABLED = true;
      contract C() { function spend(bytes2 tag) { require(ENABLED); require(tag == TAG); } }`;
    expect(() => compileString(code)).not.toThrow();
  });

  it('allows a constant that is never used', () => {
    const code = `
      int constant UNUSED = 123456789;
      contract C() { function spend() { require(true); } }`;
    const { bytecode } = compileString(code);
    // The folded literal never reaches the bytecode
    expect(bytecode).not.toContain('15cd5b07');
  });
});
