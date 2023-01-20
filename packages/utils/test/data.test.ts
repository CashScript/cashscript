import { hexToBin, ScriptNumberError } from '@bitauth/libauth';
import {
  decodeBool,
  decodeInt,
  decodeString,
  encodeBool,
  encodeInt,
  encodeString,
  placeholder,
} from '../src/index.js';

describe('data utils', () => {
  describe('encodeBool()', () => {
    it('should encode true', () => {
      expect(encodeBool(true)).toEqual(new Uint8Array([1]));
    });

    it('should encode false', () => {
      expect(encodeBool(false)).toEqual(new Uint8Array([]));
    });
  });

  describe('decodeBool()', () => {
    it('should decode positive values as true', () => {
      expect(decodeBool(hexToBin('01'))).toEqual(true);
      expect(decodeBool(hexToBin('e803'))).toEqual(true);
    });

    it('should decode negative values as true', () => {
      expect(decodeBool(hexToBin('81'))).toEqual(true);
      expect(decodeBool(hexToBin('e883'))).toEqual(true);
    });

    it('should decode zero values as false', () => {
      expect(decodeBool(hexToBin(''))).toEqual(false);
      expect(decodeBool(hexToBin('00'))).toEqual(false);
      expect(decodeBool(hexToBin('80'))).toEqual(false);
      expect(decodeBool(hexToBin('000000000000'))).toEqual(false);
      expect(decodeBool(hexToBin('000000000080'))).toEqual(false);
    });
  });

  describe('encodeInt()', () => {
    it('should encode integers', () => {
      expect(encodeInt(BigInt(0))).toEqual(hexToBin(''));
      expect(encodeInt(BigInt(-0))).toEqual(hexToBin(''));
      expect(encodeInt(BigInt(1))).toEqual(hexToBin('01'));
      expect(encodeInt(BigInt(-1))).toEqual(hexToBin('81'));
      expect(encodeInt(BigInt(1000))).toEqual(hexToBin('e803'));
      expect(encodeInt(BigInt(-1000))).toEqual(hexToBin('e883'));
      expect(encodeInt(BigInt(100000000000000))).toEqual(hexToBin('00407a10f35a'));
    });
  });

  describe('decodeInt()', () => {
    it('should decode integers', () => {
      expect(decodeInt(hexToBin(''))).toEqual(BigInt(0));
      expect(decodeInt(hexToBin('01'))).toEqual(BigInt(1));
      expect(decodeInt(hexToBin('81'))).toEqual(BigInt(-1));
      expect(decodeInt(hexToBin('e803'))).toEqual(BigInt(1000));
      expect(decodeInt(hexToBin('e883'))).toEqual(BigInt(-1000));
      expect(decodeInt(hexToBin('00407a10f35a'))).toEqual(BigInt(100000000000000));
    });

    it('should throw if the integer is not minimally encoded', () => {
      const expectedError = ScriptNumberError.requiresMinimal;
      expect(() => decodeInt(hexToBin('00'))).toThrow(expectedError);
      expect(() => decodeInt(hexToBin('80'))).toThrow(expectedError);
      expect(() => decodeInt(hexToBin('e80300'))).toThrow(expectedError);
    });

    it('should throw if the integer is too large', () => {
      const expectedError = ScriptNumberError.outOfRange;
      expect(() => decodeInt(hexToBin('00000000000000000001'))).toThrow(expectedError);
      expect(() => decodeInt(hexToBin('000001'), 2)).toThrow(expectedError);
    });
  });

  describe('encodeString()', () => {
    it('should encode utf8 strings', () => {
      expect(encodeString('Hello World')).toEqual(hexToBin('48656c6c6f20576f726c64'));
    });
  });

  describe('decodeString()', () => {
    it('should decode utf8 strings', () => {
      expect(decodeString(hexToBin('48656c6c6f20576f726c64'))).toEqual('Hello World');
    });
  });

  describe('placeholder()', () => {
    it('should create a placeholder Uint8Array', () => {
      expect(placeholder(0)).toEqual(hexToBin(''));
      expect(placeholder(10)).toEqual(hexToBin('00000000000000000000'));
    });
  });
});
