import { binToHex } from '@bitauth/libauth';
import {
  asmToBytecode,
  asmToScript,
  bytecodeToAsm,
  placeholder,
} from '@cashscript/utils';
import {
  scriptToAddress,
  createInputScript,
  getInputSize,
  getPreimageSize,
} from '../src/utils.js';
import { Network } from '../src/interfaces.js';
import { alicePkh, alicePub } from './fixture/vars.js';

describe('utils', () => {
  describe('getInputSize', () => {
    it('should calculate input size for small script', () => {
      const inputScript = new Uint8Array(100).fill(0);

      const size = getInputSize(inputScript);

      const expectedSize = 100 + 40 + 1;
      expect(size).toEqual(expectedSize);
    });

    it('should calculate input size for large script', () => {
      const inputScript = new Uint8Array(255).fill(0);

      const size = getInputSize(inputScript);

      const expectedSize = 255 + 40 + 3;
      expect(size).toEqual(expectedSize);
    });
  });

  describe('getPreimageSize', () => {
    it('should calculate preimage size for small script', () => {
      const inputScript = new Uint8Array(100).fill(0);

      const size = getPreimageSize(inputScript);

      const expectedSize = 100 + 156 + 1;
      expect(size).toEqual(expectedSize);
    });

    it('should calculate preimage size for large script', () => {
      const inputScript = new Uint8Array(255).fill(0);

      const size = getPreimageSize(inputScript);

      const expectedSize = 255 + 156 + 3;
      expect(size).toEqual(expectedSize);
    });
  });

  describe('createInputScript', () => {
    it('should create an input script without selector or preimage', () => {
      const asm = `${binToHex(alicePkh)} OP_OVER OP_HASH160 OP_EQUALVERIFY OP_CHECKSIG`;
      const redeemScript = asmToScript(asm);
      const args = [alicePub, placeholder(1)];

      const inputScript = createInputScript(redeemScript, args);

      const expectedInputScriptAsm = `00 ${binToHex(alicePub)} ${binToHex(asmToBytecode(asm))}`;
      expect(bytecodeToAsm(inputScript)).toEqual(expectedInputScriptAsm);
    });

    it('should create an input script with selector and preimage', () => {
      const asm = `${binToHex(alicePkh)} OP_OVER OP_HASH160 OP_EQUALVERIFY OP_CHECKSIG`;
      const redeemScript = asmToScript(asm);
      const args = [alicePub, placeholder(1)];
      const selector = 1;
      const preimage = placeholder(1);

      const inputScript = createInputScript(redeemScript, args, selector, preimage);

      const expectedInputScriptAsm = `00 ${binToHex(alicePub)} 00 OP_1 ${binToHex(asmToBytecode(asm))}`;
      expect(bytecodeToAsm(inputScript)).toEqual(expectedInputScriptAsm);
    });
  });

  describe('scriptToAddress', () => {
    it('should convert a redeem script to a cashaddress', () => {
      const asm = `${binToHex(alicePkh)} OP_OVER OP_HASH160 OP_EQUALVERIFY OP_CHECKSIG`;
      const redeemScript = asmToScript(asm);

      const mainnetAddressP2sh32 = scriptToAddress(redeemScript, Network.MAINNET, 'p2sh32', false);
      const testnetAddressP2sh32 = scriptToAddress(redeemScript, Network.TESTNET4, 'p2sh32', false);
      const regtestAddressP2sh32 = scriptToAddress(redeemScript, Network.REGTEST, 'p2sh32', false);
      const mainnetAddressP2sh20 = scriptToAddress(redeemScript, Network.MAINNET, 'p2sh20', false);
      const testnetAddressP2sh20 = scriptToAddress(redeemScript, Network.TESTNET4, 'p2sh20', false);
      const regtestAddressP2sh20 = scriptToAddress(redeemScript, Network.REGTEST, 'p2sh20', false);
      const mainnetAddressP2sh32Tokens = scriptToAddress(redeemScript, Network.MAINNET, 'p2sh32', true);
      const testnetAddressP2sh32Tokens = scriptToAddress(redeemScript, Network.TESTNET4, 'p2sh32', true);
      const regtestAddressP2sh32Tokens = scriptToAddress(redeemScript, Network.REGTEST, 'p2sh32', true);
      const mainnetAddressP2sh20Tokens = scriptToAddress(redeemScript, Network.MAINNET, 'p2sh20', true);
      const testnetAddressP2sh20Tokens = scriptToAddress(redeemScript, Network.TESTNET4, 'p2sh20', true);
      const regtestAddressP2sh20Tokens = scriptToAddress(redeemScript, Network.REGTEST, 'p2sh20', true);

      const expectedMainnetAddressP2sh32 = 'bitcoincash:pv6dnl7ws66dzdk2wn5akmmyx0f4fztx56lqvszjuu52fsw3d23629h20jd0s';
      const expectedTestnetAddressP2sh32 = 'bchtest:pv6dnl7ws66dzdk2wn5akmmyx0f4fztx56lqvszjuu52fsw3d2362xsm3276z';
      const expectedRegtestAddressP2sh32 = 'bchreg:pv6dnl7ws66dzdk2wn5akmmyx0f4fztx56lqvszjuu52fsw3d2362n6fmdfd2';
      const expectedMainnetAddressP2sh20 = 'bitcoincash:pr4wzdh0h9d7fpu890lq8xz0c84cpv3nvyc27hzc7y';
      const expectedTestnetAddressP2sh20 = 'bchtest:pr4wzdh0h9d7fpu890lq8xz0c84cpv3nvyuc6sq0ec';
      const expectedRegtestAddressP2sh20 = 'bchreg:pr4wzdh0h9d7fpu890lq8xz0c84cpv3nvyxyv3ru67';
      const expectedMainnetAddressP2sh32Tokens = 'bitcoincash:rv6dnl7ws66dzdk2wn5akmmyx0f4fztx56lqvszjuu52fsw3d2362hykwtvkm';
      const expectedTestnetAddressP2sh32Tokens = 'bchtest:rv6dnl7ws66dzdk2wn5akmmyx0f4fztx56lqvszjuu52fsw3d23625r8snlrf';
      const expectedRegtestAddressP2sh32Tokens = 'bchreg:rv6dnl7ws66dzdk2wn5akmmyx0f4fztx56lqvszjuu52fsw3d2362pf465g5p';
      const expectedMainnetAddressP2sh20Tokens = 'bitcoincash:rr4wzdh0h9d7fpu890lq8xz0c84cpv3nvylqdfv7ph';
      const expectedTestnetAddressP2sh20Tokens = 'bchtest:rr4wzdh0h9d7fpu890lq8xz0c84cpv3nvymjfwwfxt';
      const expectedRegtestAddressP2sh20Tokens = 'bchreg:rr4wzdh0h9d7fpu890lq8xz0c84cpv3nvypwl0d69d';

      expect(mainnetAddressP2sh32).toEqual(expectedMainnetAddressP2sh32);
      expect(testnetAddressP2sh32).toEqual(expectedTestnetAddressP2sh32);
      expect(regtestAddressP2sh32).toEqual(expectedRegtestAddressP2sh32);
      expect(mainnetAddressP2sh20).toEqual(expectedMainnetAddressP2sh20);
      expect(testnetAddressP2sh20).toEqual(expectedTestnetAddressP2sh20);
      expect(regtestAddressP2sh20).toEqual(expectedRegtestAddressP2sh20);
      expect(mainnetAddressP2sh32Tokens).toEqual(expectedMainnetAddressP2sh32Tokens);
      expect(testnetAddressP2sh32Tokens).toEqual(expectedTestnetAddressP2sh32Tokens);
      expect(regtestAddressP2sh32Tokens).toEqual(expectedRegtestAddressP2sh32Tokens);
      expect(mainnetAddressP2sh20Tokens).toEqual(expectedMainnetAddressP2sh20Tokens);
      expect(testnetAddressP2sh20Tokens).toEqual(expectedTestnetAddressP2sh20Tokens);
      expect(regtestAddressP2sh20Tokens).toEqual(expectedRegtestAddressP2sh20Tokens);
    });
  });
});
