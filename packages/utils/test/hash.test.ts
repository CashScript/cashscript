import { hexToBin } from '@bitauth/libauth';
import {
  hash160,
  hash256,
  ripemd160,
  sha256,
  sha512,
} from '../src/index.js';
import { describe, it, expect } from 'vitest';

describe('hashing functions', () => {
  describe('sha512()', () => {
    it('should perform a sha512 hash', () => {
      expect(sha512(hexToBin('000000000000000000')))
        .toEqual(hexToBin('a85de39409374651002c84cba7c928eb96fb82f88acc2aeac392985def3e1389346122b82c9c47b743a5c2764bb0e3f5c309af7202dbe723e69a5193e84fcbc4'));
    });
  });

  describe('sha256()', () => {
    it('should perform a sha256 hash', () => {
      expect(sha256(hexToBin('000000000000000000')))
        .toEqual(hexToBin('3e7077fd2f66d689e0cee6a7cf5b37bf2dca7c979af356d0a31cbc5c85605c7d'));
    });
  });

  describe('ripemd160()', () => {
    it('should perform a ripemd160 hash', () => {
      expect(ripemd160(hexToBin('000000000000000000')))
        .toEqual(hexToBin('f4b7fe5e9c0898fb14bf52365feece17d5047199'));
    });
  });

  describe('hash160()', () => {
    it('should perform a sha256 hash, then a ripemd160 hash on the result', () => {
      expect(hash160(hexToBin('000000000000000000')))
        .toEqual(hexToBin('85179ad383f90555e7b98bfa4e9a560ab6eba1e6'));
    });
  });

  describe('hash256()', () => {
    it('should perform a sha256 hash, then a sha256 hash on the result', () => {
      expect(hash256(hexToBin('000000000000000000')))
        .toEqual(hexToBin('edb908054ac1409be5f77d5369c6e03490b2f6676d68d0b3370f8159e0fdadf9'));
    });
  });
});
