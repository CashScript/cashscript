import { compileString } from '../src/index.js';

// Def-sinking moves each definition down to just before its first use. It is a byte-size
// optimisation that only runs under the 'size' objective. The primary assertion idiom:
// compiling a source with sinking must produce the same bytecode as compiling the
// hand-reordered source with sinking disabled.
const sunk = (code: string): string => compileString(code, { optimizeFor: 'size' }).bytecode;
const unsunk = (code: string): string => (
  compileString(code, { optimizeFor: 'size', disableDefSinking: true }).bytecode
);
const count = (haystack: string, needle: string): number => haystack.split(needle).length - 1;

const wrap = (body: string): string => `
  contract C() {
    function spend(int a, int b) {
      ${body}
    }
  }`;

describe('Definition sinking', () => {
  it('sinks a single-use definition to adjacency', () => {
    const original = wrap(`
      int x = a + 1;
      require(b == 2);
      require(x == 5);`);
    const reordered = wrap(`
      require(b == 2);
      int x = a + 1;
      require(x == 5);`);
    expect(sunk(original)).toBe(unsunk(reordered));
  });

  it('sinks a chain of dependent definitions together in one pass', () => {
    const original = wrap(`
      int x = a + 1;
      int y = x + 2;
      require(b == 3);
      require(y == 9);`);
    const reordered = wrap(`
      require(b == 3);
      int x = a + 1;
      int y = x + 2;
      require(y == 9);`);
    expect(sunk(original)).toBe(unsunk(reordered));
  });

  it('stops above a reassignment of an initializer input, and never sinks reassigned variables', () => {
    const original = wrap(`
      int y = a;
      int x = y + 1;
      y = b;
      require(b == 2);
      require(x + y == 3);`);
    // `y` is reassigned, so its definition stays; `x` reads `y`, so it cannot cross `y = b`.
    expect(sunk(original)).toBe(unsunk(original));
  });

  it('treats a branch as a hard barrier: a partial sink lands just above it', () => {
    const original = wrap(`
      int x = a + 1;
      require(b == 2);
      if (b == 2) {
        require(a == 1);
      }
      require(x == 5);`);
    const reordered = wrap(`
      require(b == 2);
      int x = a + 1;
      if (b == 2) {
        require(a == 1);
      }
      require(x == 5);`);
    expect(sunk(original)).toBe(unsunk(reordered));
  });

  it('sinks to a first use inside a branch, landing just above it', () => {
    const original = wrap(`
      int x = a + 1;
      require(b == 2);
      if (x == 2) {
        require(a == 1);
      } else {
        require(a == 0);
      }`);
    const reordered = wrap(`
      require(b == 2);
      int x = a + 1;
      if (x == 2) {
        require(a == 1);
      } else {
        require(a == 0);
      }`);
    expect(sunk(original)).toBe(unsunk(reordered));
  });

  it('sinks within nested blocks independently', () => {
    const original = wrap(`
      if (b == 2) {
        int x = a + 1;
        require(b == 2);
        require(x == 5);
      } else {
        require(a == 0);
      }`);
    const reordered = wrap(`
      if (b == 2) {
        require(b == 2);
        int x = a + 1;
        require(x == 5);
      } else {
        require(a == 0);
      }`);
    expect(sunk(original)).toBe(unsunk(reordered));
  });

  it('sinks a tuple destructure that declares only new variables', () => {
    const withTuple = (order: 'original' | 'reordered'): string => `
      function divmod(int x, int y) returns (int, int) {
        return x / y, x % y;
      }
      contract C() {
        function spend(int a, int b) {
          ${order === 'original'
    ? 'int q, int r = divmod(a, 3); require(b == 2);'
    : 'require(b == 2); int q, int r = divmod(a, 3);'}
          require(q + r == 5);
        }
      }`;
    expect(sunk(withTuple('original'))).toBe(unsunk(withTuple('reordered')));
  });

  it('treats a tuple reassignment as a hard barrier and never moves it', () => {
    const original = `
      function divmod(int x, int y) returns (int, int) {
        return x / y, x % y;
      }
      contract C() {
        function spend(int a, int b) {
          int q = a + 1;
          int x = b + 1;
          int r, q = divmod(a, 3);
          require(b == 2);
          require(x + q + r == 5);
        }
      }`;
    // `q` is reassigned by the destructure, so its definition stays put; `x` cannot cross the
    // mixed destructure (hard barrier) even though it does not touch `x`'s inputs.
    expect(sunk(original)).toBe(unsunk(original));
  });

  it('leaves unused-modified definitions in place', () => {
    const original = wrap(`
      int unused pad = a + 1;
      require(b == 2);
      require(a == 1);`);
    expect(sunk(original)).toBe(unsunk(original));
  });

  it('lands each of several definitions adjacent to its own require', () => {
    const original = wrap(`
      int x = a + 1;
      int y = a + 2;
      int z = a + 3;
      require(x == 1);
      require(y == 2);
      require(z == b);`);
    const reordered = wrap(`
      int x = a + 1;
      require(x == 1);
      int y = a + 2;
      require(y == 2);
      int z = a + 3;
      require(z == b);`);
    expect(sunk(original)).toBe(unsunk(reordered));
  });

  it('counts console.log parameters as uses', () => {
    const original = wrap(`
      int x = a + 1;
      console.log(x);
      require(b == 2);
      require(x == 5);`);
    // The log pins `x` in place (codegen needs the variable on the stack at the log's position).
    expect(sunk(original)).toBe(unsunk(original));
  });

  it('never sinks past the final require, even toward a trailing log', () => {
    const original = wrap(`
      int x = a + 1;
      require(b == 2);
      console.log(x);`);
    // Without the cap, `x`'s first use (the trailing log) would pull its definition past the
    // final require and trip EnsureFinalRequireTraversal.
    expect(() => compileString(original, { optimizeFor: 'size' })).not.toThrow();
    expect(sunk(original)).toBe(unsunk(original));
  });

  it('sinks inside global function bodies', () => {
    const withGlobal = (order: 'original' | 'reordered'): string => `
      function f(int v, int w) returns (int) {
        ${order === 'original'
    ? 'int t = v + 1; require(w > 0);'
    : 'require(w > 0); int t = v + 1;'}
        return t + w;
      }
      contract C() {
        function spend(int a, int b) {
          require(f(a, b) == 3);
        }
      }`;
    expect(sunk(withGlobal('original'))).toBe(unsunk(withGlobal('reordered')));
  });

  it('erases the access pair of a definition sunk to adjacency and shrinks the bytecode', () => {
    // Unsunk, `x` sits at depth 3 under p/q/r when it is read (`OP_3 OP_ROLL`). Sinking moves
    // p/q/r below `x`'s use, so `x` resolves at depth 0 and the peephole erases the access pair.
    const original = wrap(`
      int x = a + 1;
      int p = a + 2;
      int q = a + 3;
      int r = a + 4;
      require(x == 5);
      require(p + q + r == b);`);
    expect(count(unsunk(original), 'OP_ROLL')).toBeGreaterThan(0);
    expect(count(sunk(original), 'OP_ROLL')).toBeLessThan(count(unsunk(original), 'OP_ROLL'));
    expect(sunk(original).length).toBeLessThan(unsunk(original).length);
  });

  it("only runs under the 'size' objective, and produces the same ABI either way", () => {
    const original = wrap(`
      int x = a + 1;
      require(b == 2);
      require(x == 5);`);
    expect(sunk(original)).not.toBe(unsunk(original));
    // The default 'opcost' objective never sinks.
    expect(compileString(original).bytecode).toBe(compileString(original, { disableDefSinking: true }).bytecode);
    expect(compileString(original, { optimizeFor: 'size' }).abi).toEqual(compileString(original).abi);
  });

  it('still rejects use-before-definition under the size objective (no laundering by reordering)', () => {
    // Sinking `int x = later + 1;` below `int later = 2;` would make this invalid program
    // compile; definitions counting as assigns pins the sink above the redefinition.
    const original = wrap(`
      int x = later + 1;
      int later = 2;
      require(x == 3);
      require(later == 2);`);
    expect(() => compileString(original)).toThrow('Undefined reference to symbol later');
    expect(() => compileString(original, { optimizeFor: 'size' })).toThrow('Undefined reference to symbol later');
  });
});
