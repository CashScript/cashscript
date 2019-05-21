import {
  Get,
  PushInt,
  PushString,
  Replace,
  PushBool,
  PushBytes,
  IrOp,
} from '../../../src/generation/IR';
import { Op } from '../../../src/generation/Script';

interface Fixture {
  fn: string,
  ir: IrOp[],
  stack: string[],
}

const fixtures: Fixture[] = [
  {
    fn: 'p2pkh.cash',
    ir: [
      new Get(1), Op.SHA256, new Get(1), Op.EQUAL, Op.VERIFY,
      new Get(2), new Get(2), Op.CHECKSIG, Op.VERIFY,
    ],
    stack: ['pkh', 'pk', 's'],
  },
  {
    fn: 'reassignment.cash',
    ir: [
      new PushInt(10), new PushInt(4), Op.SUB,
      new PushInt(20), new Get(1), new PushInt(2), Op.MOD, Op.ADD,
      new Get(0), new Get(3), Op.GREATERTHAN, Op.VERIFY,
      new PushString('Hello World'),
      new Get(0), new Get(5), Op.CAT,
      new Get(6), Op.RIPEMD160, new Get(1), Op.RIPEMD160, Op.EQUAL, Op.VERIFY,
      new Get(7), new Get(7), Op.CHECKSIG, Op.VERIFY,
    ],
    stack: ['hw', 'hw', 'myOtherVariable', 'myVariable', 'x', 'y', 'pk', 's'],
  },
  {
    fn: 'if_statement.cash',
    ir: [
      new Get(2), new Get(4), Op.ADD,
      new Get(0), new Get(4), Op.SUB,
      new Get(0), new Get(3), new PushInt(2), Op.SUB, Op.NUMEQUAL, Op.IF,
      new Get(0), new Get(6), Op.ADD,
      new Get(5), new Get(1), Op.ADD, new Replace(2),
      new Get(0), new Get(2), Op.GREATERTHAN, Op.VERIFY,
      Op.DROP, Op.ELSE,
      new Get(0), new Get(5), Op.NUMEQUAL, Op.VERIFY,
      Op.ENDIF,
      new Get(0), new Get(5), Op.ADD,
      new Get(0), new Get(5), Op.NUMEQUAL, Op.VERIFY,
    ],
    stack: ['d', 'd', 'd', 'x', 'y', 'a', 'b'],
  },
  {
    fn: 'multifunction.cash',
    ir: [
      new Get(3), new PushInt(0), Op.NUMEQUAL, Op.IF,
      new Get(4), new Get(2), Op.CHECKSIG, Op.VERIFY,
      Op.ELSE, new Get(3), new PushInt(1), Op.NUMEQUAL, Op.IF,
      new Get(4), new Get(1), Op.CHECKSIG, Op.VERIFY,
      new Get(2), Op.CHECKLOCKTIMEVERIFY, Op.DROP,
      Op.ENDIF, Op.ENDIF,
    ],
    stack: ['sender', 'recipient', 'timeout', '$$', 'senderSig'],
  },
  {
    fn: 'multifunction_if_statements.cash',
    ir: [
      new Get(2), new PushInt(0), Op.NUMEQUAL, Op.IF,
      new Get(3), new Get(5), Op.ADD,
      new Get(0), new Get(5), Op.SUB,
      new Get(0), new Get(3), Op.NUMEQUAL, Op.IF,
      new Get(0), new Get(7), Op.ADD,
      new Get(6), new Get(1), Op.ADD, new Replace(2),
      new Get(0), new Get(2), Op.GREATERTHAN, Op.VERIFY,
      Op.DROP, Op.ELSE,
      new Get(5), new Replace(1),
      Op.ENDIF,
      new Get(0), new Get(6), Op.ADD,
      new Get(0), new Get(5), Op.NUMEQUAL, Op.VERIFY,
      Op.ELSE, new Get(2), new PushInt(1), Op.NUMEQUAL, Op.IF,
      new Get(3),
      new Get(0), new PushInt(2), Op.ADD,
      new Get(0), new Get(3), Op.NUMEQUAL, Op.IF,
      new Get(0), new Get(6), Op.ADD,
      new Get(0), new Get(2), Op.ADD, new Replace(2),
      new Get(0), new Get(2), Op.GREATERTHAN, Op.VERIFY,
      Op.DROP, Op.ENDIF,
      new Get(5),
      new Get(0), new Get(5), Op.NUMEQUAL, Op.VERIFY,
      Op.ENDIF, Op.ENDIF,
    ],
    stack: ['d', 'd', 'd', 'x', 'y', '$$', 'b'],
  },
  {
    fn: '2_of_3_multisig.cash',
    ir: [
      new Get(3), new Get(5), new PushInt(2),
      new Get(3), new Get(5), new Get(7), new PushInt(3),
      Op.CHECKMULTISIG, Op.VERIFY,
    ],
    stack: ['pk1', 'pk2', 'pk3', 's1', 's2'],
  },
  {
    fn: 'splice_size.cash',
    ir: [
      new Get(0), new Get(1), Op.SIZE, Op.NIP, new PushInt(2), Op.DIV, Op.SPLIT, Op.NIP,
      new Get(0), new Get(2), Op.EQUAL, Op.NOT, Op.VERIFY,
      new Get(1), new PushInt(4), Op.SPLIT, Op.DROP, new Get(1), Op.EQUAL, Op.NOT, Op.VERIFY,
    ],
    stack: ['x', 'b'],
  },
  {
    fn: 'cast_hash_checksig.cash',
    ir: [
      new Get(0), Op.RIPEMD160,
      new PushBytes(Buffer.from('0', 'hex')), Op.RIPEMD160,
      Op.EQUAL, new PushBool(true), Op.NOT, Op.EQUAL, Op.VERIFY,
      new Get(1), new Get(1), Op.CHECKSIG, Op.VERIFY,
    ],
    stack: ['pk', 's'],
  },
];

export default fixtures;
