import { decodeBip68, encodeBip68, isBip68RelativeTimelock } from '../src/index.js';

describe('BIP68', () => {
  describe('encodeBip68()', () => {
    it('should encode blocks as-is', () => {
      expect(encodeBip68({ blocks: 0 })).toBe(0);
      expect(encodeBip68({ blocks: 144 })).toBe(144);
      expect(encodeBip68({ blocks: 65535 })).toBe(65535);
    });

    it('should encode seconds as 512-second units with the type flag, rounded up', () => {
      expect(encodeBip68({ seconds: 0 })).toBe(0x400000);
      expect(encodeBip68({ seconds: 512 })).toBe(0x400001);
      expect(encodeBip68({ seconds: 513 })).toBe(0x400002);
      expect(encodeBip68({ seconds: 86400 })).toBe(0x4000a9);
      expect(encodeBip68({ seconds: 65535 * 512 })).toBe(0x40ffff);
    });

    it('should encode neither blocks nor seconds as a final sequence number', () => {
      expect(encodeBip68({})).toBe(0xffffffff);
    });

    it('should reject invalid values', () => {
      expect(() => encodeBip68({ blocks: 65536 })).toThrow('Expected blocks to be an integer between 0 and 65535');
      expect(() => encodeBip68({ blocks: -1 })).toThrow('Expected blocks to be an integer between 0 and 65535');
      expect(() => encodeBip68({ blocks: 1.5 })).toThrow('Expected blocks to be an integer between 0 and 65535');
      expect(() => encodeBip68({ seconds: 65535 * 512 + 1 })).toThrow('Expected seconds to be an integer between 0 and 33553920');
      expect(() => encodeBip68({ seconds: -1 })).toThrow('Expected seconds to be an integer between 0 and 33553920');
      expect(() => encodeBip68({ blocks: 1, seconds: 1 })).toThrow('Cannot encode blocks AND seconds');
    });

    it('should round-trip through decodeBip68()', () => {
      expect(decodeBip68(encodeBip68({ blocks: 144 }))).toEqual({ blocks: 144 });
      expect(decodeBip68(encodeBip68({ seconds: 86528 }))).toEqual({ seconds: 86528 });
    });
  });

  describe('isBip68RelativeTimelock()', () => {
    it('should accept encoded blocks and 512-second units', () => {
      expect(isBip68RelativeTimelock(0)).toBe(true);
      expect(isBip68RelativeTimelock(65535)).toBe(true);
      expect(isBip68RelativeTimelock(0x400000)).toBe(true);
      expect(isBip68RelativeTimelock(0x40ffff)).toBe(true);
    });

    it('should reject values with ignored bits, the disable flag or outside the valid range', () => {
      expect(isBip68RelativeTimelock(65536)).toBe(false);
      expect(isBip68RelativeTimelock(0x800000)).toBe(false);
      expect(isBip68RelativeTimelock(0x410000)).toBe(false);
      expect(isBip68RelativeTimelock(0x80000000)).toBe(false);
      expect(isBip68RelativeTimelock(0xfffffffe)).toBe(false);
      expect(isBip68RelativeTimelock(2 ** 32 + 1)).toBe(false);
      expect(isBip68RelativeTimelock(-1)).toBe(false);
      expect(isBip68RelativeTimelock(1.5)).toBe(false);
    });
  });
});
