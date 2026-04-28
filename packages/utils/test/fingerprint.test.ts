import { binToHex, flattenBinArray } from '@bitauth/libauth';
import {
  computeBytecodeFingerprint,
  computeBytecodePattern,
  isPushOpcode,
  Op,
  sha256,
} from '../src/index.js';

const concat = (...parts: Array<Uint8Array | number>): Uint8Array => (
  flattenBinArray(parts.map((part) => (typeof part === 'number' ? Uint8Array.of(part) : part)))
);

const zeroes = (length: number): Uint8Array => new Uint8Array(length);

describe('fingerprint utils', () => {
  describe('isPushOpcode()', () => {
    it('treats OP_0 as a push', () => {
      expect(isPushOpcode(Op.OP_0)).toBe(true);
    });

    it('treats OP_PUSHBYTES_* as a push', () => {
      expect(isPushOpcode(Op.OP_PUSHBYTES_1)).toBe(true);
      expect(isPushOpcode(Op.OP_PUSHBYTES_75)).toBe(true);
    });

    it('treats OP_PUSHDATA_1/2/4 as a push', () => {
      expect(isPushOpcode(Op.OP_PUSHDATA_1)).toBe(true);
      expect(isPushOpcode(Op.OP_PUSHDATA_2)).toBe(true);
      expect(isPushOpcode(Op.OP_PUSHDATA_4)).toBe(true);
    });

    it('treats OP_1NEGATE as a push', () => {
      expect(isPushOpcode(Op.OP_1NEGATE)).toBe(true);
    });

    it('does not treat OP_RESERVED as a push', () => {
      expect(isPushOpcode(Op.OP_RESERVED)).toBe(false);
    });

    it('treats OP_1 through OP_16 as pushes', () => {
      for (let opcode = Op.OP_1; opcode <= Op.OP_16; opcode += 1) {
        expect(isPushOpcode(opcode)).toBe(true);
      }
    });

    it('does not treat non-push opcodes as pushes', () => {
      expect(isPushOpcode(Op.OP_NOP)).toBe(false);
      expect(isPushOpcode(Op.OP_DUP)).toBe(false);
      expect(isPushOpcode(Op.OP_CHECKSIG)).toBe(false);
    });
  });

  describe('computeBytecodePattern()', () => {
    it('returns an empty pattern for empty bytecode', () => {
      expect(computeBytecodePattern(new Uint8Array())).toEqual(new Uint8Array());
    });

    it('preserves bytecode that contains no pushes', () => {
      const bytecode = concat(Op.OP_DUP, Op.OP_HASH160, Op.OP_EQUAL, Op.OP_CHECKSIG);
      expect(computeBytecodePattern(bytecode)).toEqual(bytecode);
    });

    it('replaces a P2PKH push with OP_1', () => {
      // OP_DUP OP_HASH160 <20 zero bytes> OP_EQUALVERIFY OP_CHECKSIG
      const bytecode = concat(Op.OP_DUP, Op.OP_HASH160, Op.OP_PUSHBYTES_20, zeroes(20), Op.OP_EQUALVERIFY, Op.OP_CHECKSIG);
      const expected = concat(Op.OP_DUP, Op.OP_HASH160, Op.OP_1, Op.OP_EQUALVERIFY, Op.OP_CHECKSIG);
      expect(computeBytecodePattern(bytecode)).toEqual(expected);
    });

    it('collapses consecutive pushes in a 2-of-3 multisig', () => {
      // OP_2 <33 bytes> <33 bytes> <33 bytes> OP_3 OP_CHECKMULTISIG
      const pubkeyPush = concat(Op.OP_PUSHBYTES_33, zeroes(33));
      const bytecode = concat(Op.OP_2, pubkeyPush, pubkeyPush, pubkeyPush, Op.OP_3, Op.OP_CHECKMULTISIG);
      // 5 consecutive pushes → OP_5; followed by OP_CHECKMULTISIG
      expect(computeBytecodePattern(bytecode)).toEqual(concat(Op.OP_5, Op.OP_CHECKMULTISIG));
    });

    it('encodes push counts above 16 as a minimally encoded VM number push', () => {
      // 17 consecutive OP_0 pushes → push of value 17 = OP_PUSHBYTES_1 0x11
      const bytecode = zeroes(17);
      expect(computeBytecodePattern(bytecode)).toEqual(concat(Op.OP_PUSHBYTES_1, 0x11));
    });

    it('treats OP_1NEGATE and OP_0 as pushes when adjacent', () => {
      // OP_0 OP_1NEGATE OP_DUP → OP_2 OP_DUP
      const bytecode = concat(Op.OP_0, Op.OP_1NEGATE, Op.OP_DUP);
      expect(computeBytecodePattern(bytecode)).toEqual(concat(Op.OP_2, Op.OP_DUP));
    });

    it('does not collapse a non-push opcode that sits between pushes', () => {
      // OP_1 OP_DUP OP_2 → OP_1 OP_DUP OP_1
      const bytecode = concat(Op.OP_1, Op.OP_DUP, Op.OP_2);
      expect(computeBytecodePattern(bytecode)).toEqual(concat(Op.OP_1, Op.OP_DUP, Op.OP_1));
    });
  });

  describe('computeBytecodeFingerprint()', () => {
    it('returns the SHA256 hex of the pattern', () => {
      const bytecode = concat(Op.OP_DUP, Op.OP_HASH160, Op.OP_PUSHBYTES_20, zeroes(20), Op.OP_EQUALVERIFY, Op.OP_CHECKSIG);
      const expectedPattern = concat(Op.OP_DUP, Op.OP_HASH160, Op.OP_1, Op.OP_EQUALVERIFY, Op.OP_CHECKSIG);
      expect(computeBytecodeFingerprint(bytecode)).toBe(binToHex(sha256(expectedPattern)));
    });

    it('is invariant to the values of pushed data', () => {
      const p2pkh = (pkh: Uint8Array): Uint8Array => (
        concat(Op.OP_DUP, Op.OP_HASH160, Op.OP_PUSHBYTES_20, pkh, Op.OP_EQUALVERIFY, Op.OP_CHECKSIG)
      );
      const bytecodeA = p2pkh(new Uint8Array(20).fill(0xaa));
      const bytecodeB = p2pkh(new Uint8Array(20).fill(0xbb));
      expect(computeBytecodeFingerprint(bytecodeA)).toBe(computeBytecodeFingerprint(bytecodeB));
    });

    it('distinguishes contracts that differ in non-push structure', () => {
      const p2pkhLike = concat(Op.OP_DUP, Op.OP_HASH160, Op.OP_PUSHBYTES_20, zeroes(20), Op.OP_EQUALVERIFY, Op.OP_CHECKSIG);
      const pubkeyPush = concat(Op.OP_PUSHBYTES_33, zeroes(33));
      const multisigLike = concat(Op.OP_2, pubkeyPush, pubkeyPush, pubkeyPush, Op.OP_3, Op.OP_CHECKMULTISIG);
      expect(computeBytecodeFingerprint(p2pkhLike)).not.toBe(computeBytecodeFingerprint(multisigLike));
    });
  });
});
