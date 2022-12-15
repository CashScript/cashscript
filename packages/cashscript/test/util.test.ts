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
import { alicePk, alicePkh } from './fixture/vars.js';

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
      const args = [alicePk, placeholder(1)];

      const inputScript = createInputScript(redeemScript, args);

      const expectedInputScriptAsm = `00 ${binToHex(alicePk)} ${binToHex(asmToBytecode(asm))}`;
      expect(bytecodeToAsm(inputScript)).toEqual(expectedInputScriptAsm);
    });

    it('should create an input script with selector and preimage', () => {
      const asm = `${binToHex(alicePkh)} OP_OVER OP_HASH160 OP_EQUALVERIFY OP_CHECKSIG`;
      const redeemScript = asmToScript(asm);
      const args = [alicePk, placeholder(1)];
      const selector = 1;
      const preimage = placeholder(1);

      const inputScript = createInputScript(redeemScript, args, selector, preimage);

      const expectedInputScriptAsm = `00 ${binToHex(alicePk)} 00 OP_1 ${binToHex(asmToBytecode(asm))}`;
      expect(bytecodeToAsm(inputScript)).toEqual(expectedInputScriptAsm);
    });
  });

  describe('scriptToAddress', () => {
    it('should convert a redeem script to a cashaddress', () => {
      const asm = `${binToHex(alicePkh)} OP_OVER OP_HASH160 OP_EQUALVERIFY OP_CHECKSIG`;
      const redeemScript = asmToScript(asm);

      const mainnetAddress = scriptToAddress(redeemScript, Network.MAINNET);
      const testnetAddress = scriptToAddress(redeemScript, Network.TESTNET3);
      const regtestAddress = scriptToAddress(redeemScript, Network.REGTEST);

      const expectedMainnetAddress = 'bitcoincash:pz0z7u9p96h2p6hfychxdrmwgdlzpk5luc5yks2wxq';
      const expectedTestnetAddress = 'bchtest:pz0z7u9p96h2p6hfychxdrmwgdlzpk5lucskjhgepu';
      const expectedRegtestAddress = 'bchreg:pz0z7u9p96h2p6hfychxdrmwgdlzpk5luc22ykt2z6';

      expect(mainnetAddress).toEqual(expectedMainnetAddress);
      expect(testnetAddress).toEqual(expectedTestnetAddress);
      expect(regtestAddress).toEqual(expectedRegtestAddress);
    });
  });
});
