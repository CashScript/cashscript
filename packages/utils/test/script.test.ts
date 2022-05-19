import { hexToBin, utf8ToBin } from '@bitauth/libauth';
import {
  asmToBytecode,
  asmToScript,
  bytecodeToAsm,
  bytecodeToScript,
  calculateBytesize,
  countOpcodes,
  encodeNullDataScript,
  scriptToAsm,
  scriptToBytecode,
} from '../dist/main/index.js';
import { fixtures } from './script.fixture';

describe('script utils', () => {
  describe('scriptToAsm()', () => {
    fixtures.forEach(({ name, script, asm }) => {
      it(`should convert script to asm for "${name}"`, () => {
        expect(scriptToAsm(script)).toEqual(asm);
      });
    });
  });

  describe('asmToScript()', () => {
    fixtures.forEach(({ name, script, asm }) => {
      it(`should convert asm to script for "${name}"`, () => {
        expect(asmToScript(asm)).toEqual(script);
      });
    });
  });

  describe('scriptToBytecode()', () => {
    fixtures.forEach(({ name, script, bytecode }) => {
      it(`should convert script to bytecode for "${name}"`, () => {
        expect(scriptToBytecode(script)).toEqual(bytecode);
      });
    });
  });

  describe('bytecodeToScript()', () => {
    fixtures.forEach(({ name, script, bytecode }) => {
      it(`should convert bytecode to script for "${name}"`, () => {
        expect(bytecodeToScript(bytecode)).toEqual(script);
      });
    });
  });

  describe('asmToBytecode()', () => {
    fixtures.forEach(({ name, asm, bytecode }) => {
      it(`should convert asm to bytecode for "${name}"`, () => {
        expect(asmToBytecode(asm)).toEqual(bytecode);
      });
    });
  });

  describe('bytecodeToAsm()', () => {
    fixtures.forEach(({ name, asm, bytecode }) => {
      it(`should convert bytecode to asm for "${name}"`, () => {
        expect(bytecodeToAsm(bytecode)).toEqual(asm);
      });
    });
  });

  describe('countOpcodes()', () => {
    fixtures.forEach(({ name, script, opcount }) => {
      it(`should count opcodes for "${name}"`, () => {
        expect(countOpcodes(script)).toEqual(opcount);
      });
    });
  });

  describe('calculateBytesize()', () => {
    fixtures.forEach(({ name, script, bytesize }) => {
      it(`should count opcodes for "${name}"`, () => {
        expect(calculateBytesize(script)).toEqual(bytesize);
      });
    });
  });

  describe('encodeNullDataScript()', () => {
    it('should encode an SLP genesis', () => {
      const input = [
        hexToBin('534c5000'),
        hexToBin('01'),
        utf8ToBin('GENESIS'),
        utf8ToBin('CSS'),
        utf8ToBin('CashScriptSLP'),
        utf8ToBin('https://cashscript.org/'),
        utf8ToBin(''),
        hexToBin('08'),
        hexToBin('02'),
        hexToBin('0000000000000001'),
      ];

      const output = hexToBin('04534c500001010747454e45534953034353530d43617368536372697074534c501768747470733a2f2f636173687363726970742e6f72672f4c0001080102080000000000000001');

      expect(encodeNullDataScript(input)).toEqual(output);
    });
  });

  describe.skip('TODO: replaceBytecodeNop()', () => {
  });

  describe.skip('TODO: generateRedeemScript()', () => {
  });

  describe.skip('TODO: optimiseBytecode()', () => {
  });
});
