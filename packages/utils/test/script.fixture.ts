import { hexToBin } from '@bitauth/libauth';
import { Op, Script } from '../src/index.js';

export interface Fixture {
  name: string;
  script: Script;
  asm: string;
  bytecode: Uint8Array;
  bytesize: number;
  opcount: number;
}

export const fixtures: Fixture[] = [
  {
    name: 'simple addition',
    script: [Op.OP_1, Op.OP_1, Op.OP_ADD],
    asm: 'OP_1 OP_1 OP_ADD',
    bytecode: hexToBin('515193'),
    bytesize: 3,
    opcount: 1,
  },
  {
    name: 'P2PKH',
    script: [Op.OP_DUP, Op.OP_HASH160, hexToBin('d627b2c3ede2aa85ca5869328873be1d8400bbcb'), Op.OP_EQUALVERIFY, Op.OP_CHECKSIG],
    asm: 'OP_DUP OP_HASH160 d627b2c3ede2aa85ca5869328873be1d8400bbcb OP_EQUALVERIFY OP_CHECKSIG',
    bytecode: hexToBin('76a914d627b2c3ede2aa85ca5869328873be1d8400bbcb88ac'),
    bytesize: 25,
    opcount: 4,
  },
  {
    name: 'simple covenant',
    script: [Op.OP_TXVERSION, Op.OP_NUMEQUALVERIFY, Op.OP_ACTIVEBYTECODE, hexToBin('00'), Op.OP_EQUAL],
    asm: 'OP_TXVERSION OP_NUMEQUALVERIFY OP_ACTIVEBYTECODE 00 OP_EQUAL',
    bytecode: hexToBin('c29dc1010087'),
    bytesize: 6,
    opcount: 4,
  },
];
