import { compileString } from 'cashc';
import { Contract, MockNetworkProvider, TransactionBuilder } from '../../src/index.js';
import { randomUtxo } from '../../src/utils.js';

// These tests compile small contracts that exercise the ternary operator (`condition ? consequent : alternative`)
// and run them on the mock VM, asserting that the correct branch is taken for a range of inputs. This proves the
// generated OP_IF/OP_ELSE/OP_ENDIF bytecode keeps the stack balanced across both branches.
describe('Ternary operator', () => {
  const provider = new MockNetworkProvider();

  // Builds and debug-evaluates a transaction spending a fresh UTXO of `contract` via `unlock[fn](...args)`.
  // `transaction.debug()` runs the contract on the VM and throws if a require statement fails.
  const evaluate = (contract: Contract, fn: string, args: unknown[]): void => {
    const utxo = randomUtxo();
    provider.addUtxo(contract.address, utxo);
    new TransactionBuilder({ provider })
      .addInput(utxo, contract.unlock[fn](...args))
      .addOutput({ to: contract.address, amount: utxo.satoshis - 2000n })
      .debug();
  };

  describe('basic int ternary', () => {
    const artifact = compileString(`
      contract Ternary(int threshold) {
        function spend(int x, int expected) {
          int result = x > threshold ? x + 1 : x - 1;
          require(result == expected);
        }
      }
    `);
    const contract = new Contract(artifact, [3n], { provider });

    it('takes the consequent branch when the condition is true', () => {
      expect(() => evaluate(contract, 'spend', [5n, 6n])).not.toThrow();
    });

    it('takes the alternative branch when the condition is false', () => {
      expect(() => evaluate(contract, 'spend', [2n, 1n])).not.toThrow();
    });

    it('fails when the consequent branch result is wrong', () => {
      expect(() => evaluate(contract, 'spend', [5n, 4n])).toThrow();
    });

    it('fails when the alternative branch result is wrong', () => {
      expect(() => evaluate(contract, 'spend', [2n, 9n])).toThrow();
    });
  });

  describe('nested (right-associative) ternary', () => {
    const artifact = compileString(`
      contract Ternary() {
        function spend(int a, int expected) {
          int result = a == 0 ? 10 : a == 1 ? 20 : 30;
          require(result == expected);
        }
      }
    `);
    const contract = new Contract(artifact, [], { provider });

    it('resolves the first arm', () => {
      expect(() => evaluate(contract, 'spend', [0n, 10n])).not.toThrow();
    });

    it('resolves the middle arm', () => {
      expect(() => evaluate(contract, 'spend', [1n, 20n])).not.toThrow();
    });

    it('resolves the final arm', () => {
      expect(() => evaluate(contract, 'spend', [2n, 30n])).not.toThrow();
    });

    it('fails for a mismatched arm', () => {
      expect(() => evaluate(contract, 'spend', [1n, 30n])).toThrow();
    });
  });

  describe('bytes-typed ternary', () => {
    const artifact = compileString(`
      contract Ternary() {
        function spend(bool flag, bytes2 expected) {
          bytes2 result = flag ? 0x1122 : 0x3344;
          require(result == expected);
        }
      }
    `);
    const contract = new Contract(artifact, [], { provider });

    it('selects the consequent value', () => {
      expect(() => evaluate(contract, 'spend', [true, Uint8Array.from([0x11, 0x22])])).not.toThrow();
    });

    it('selects the alternative value', () => {
      expect(() => evaluate(contract, 'spend', [false, Uint8Array.from([0x33, 0x44])])).not.toThrow();
    });

    it('fails when the selected value is wrong', () => {
      expect(() => evaluate(contract, 'spend', [true, Uint8Array.from([0x33, 0x44])])).toThrow();
    });
  });

  describe('pubkey-typed ternary', () => {
    const artifact = compileString(`
      contract Ternary() {
        function spend(bool useFirst, pubkey a, pubkey b, pubkey expected) {
          pubkey result = useFirst ? a : b;
          require(result == expected);
        }
      }
    `);
    const contract = new Contract(artifact, [], { provider });
    const pkA = Uint8Array.from(Array(33).fill(0xaa));
    const pkB = Uint8Array.from(Array(33).fill(0xbb));

    it('selects the consequent pubkey', () => {
      expect(() => evaluate(contract, 'spend', [true, pkA, pkB, pkA])).not.toThrow();
    });

    it('selects the alternative pubkey', () => {
      expect(() => evaluate(contract, 'spend', [false, pkA, pkB, pkB])).not.toThrow();
    });

    it('fails when the selected pubkey is wrong', () => {
      expect(() => evaluate(contract, 'spend', [true, pkA, pkB, pkB])).toThrow();
    });
  });

  describe('bytes narrowing in the ternary consequent', () => {
    // `result` is declared bytes2, so the consequent `x` (an unbounded bytes parameter) only type-checks
    // because the `x.length == 2` condition narrows it to bytes2 — the same narrowing applied to if-branches.
    const artifact = compileString(`
      contract Ternary() {
        function spend(bytes x) {
          bytes2 result = x.length == 2 ? x : 0x1122;
          require(result == 0x1122);
        }
      }
    `);
    const contract = new Contract(artifact, [], { provider });

    it('uses the narrowed consequent when the length matches', () => {
      expect(() => evaluate(contract, 'spend', [Uint8Array.from([0x11, 0x22])])).not.toThrow();
    });

    it('falls through to the alternative when the length differs', () => {
      expect(() => evaluate(contract, 'spend', [Uint8Array.from([0x99])])).not.toThrow();
    });

    it('fails when the narrowed consequent does not match', () => {
      expect(() => evaluate(contract, 'spend', [Uint8Array.from([0x33, 0x44])])).toThrow();
    });
  });

  describe('ternary as a user-defined function return value', () => {
    const artifact = compileString(`
      function pick(bool b, int x, int y) returns (int) {
        return b ? x : y;
      }

      contract Ternary() {
        function spend(bool b, int expected) {
          require(pick(b, 7, 9) == expected);
        }
      }
    `);
    const contract = new Contract(artifact, [], { provider });

    it('returns the consequent', () => {
      expect(() => evaluate(contract, 'spend', [true, 7n])).not.toThrow();
    });

    it('returns the alternative', () => {
      expect(() => evaluate(contract, 'spend', [false, 9n])).not.toThrow();
    });
  });

  describe('ternary nested inside an if-statement', () => {
    const artifact = compileString(`
      contract Ternary() {
        function spend(int a, bool flag, int expected) {
          if (a > 0) {
            int r = flag ? a * 2 : a * 3;
            require(r == expected);
          } else {
            require(a == expected);
          }
        }
      }
    `);
    const contract = new Contract(artifact, [], { provider });

    it('takes the consequent inside the taken if-branch', () => {
      expect(() => evaluate(contract, 'spend', [5n, true, 10n])).not.toThrow();
    });

    it('takes the alternative inside the taken if-branch', () => {
      expect(() => evaluate(contract, 'spend', [5n, false, 15n])).not.toThrow();
    });

    it('takes the else-branch (ternary not evaluated)', () => {
      expect(() => evaluate(contract, 'spend', [-3n, true, -3n])).not.toThrow();
    });

    it('fails for a wrong result in the ternary branch', () => {
      expect(() => evaluate(contract, 'spend', [5n, true, 15n])).toThrow();
    });
  });
});
