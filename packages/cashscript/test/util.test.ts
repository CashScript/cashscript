import { binToHex } from '@bitauth/libauth';
import {
  asmToBytecode,
  asmToScript,
  bytecodeToAsm,
  placeholder,
} from '@cashscript/utils';
import {
  scriptToP2sh32Address,
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

  describe('scriptToP2sh32Address', () => {
    it('should convert a redeem script to a cashaddress', () => {
      const asm = `${binToHex(alicePkh)} OP_OVER OP_HASH160 OP_EQUALVERIFY OP_CHECKSIG`;
      const redeemScript = asmToScript(asm);

      const mainnetAddress = scriptToP2sh32Address(redeemScript, Network.MAINNET);
      const testnetAddress = scriptToP2sh32Address(redeemScript, Network.TESTNET3);
      const regtestAddress = scriptToP2sh32Address(redeemScript, Network.REGTEST);

      const expectedMainnetAddress = 'bitcoincash:pr4wzdh0h9d7fpu890lq8xz0c84cpv3nvyc27hzc7y';
      const expectedTestnetAddress = 'bchtest:pr4wzdh0h9d7fpu890lq8xz0c84cpv3nvyuc6sq0ec';
      const expectedRegtestAddress = 'bchreg:pr4wzdh0h9d7fpu890lq8xz0c84cpv3nvyxyv3ru67';

      expect(mainnetAddress).toEqual(expectedMainnetAddress);
      expect(testnetAddress).toEqual(expectedTestnetAddress);
      expect(regtestAddress).toEqual(expectedRegtestAddress);
    });
  });
});
