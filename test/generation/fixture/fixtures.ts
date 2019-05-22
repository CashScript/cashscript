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
  stack?: string[],
  script: string,
}

export const irFixtures: Fixture[] = [
  {
    fn: 'p2pkh.cash',
    ir: [
      new Get(1), Op.OP_SHA256, new Get(1), Op.OP_EQUAL, Op.OP_VERIFY,
      new Get(2), new Get(2), Op.OP_CHECKSIG, Op.OP_VERIFY,
    ],
    stack: ['pkh', 'pk', 's'],
    script: 'OP_1 OP_PICK OP_SHA256 OP_1 OP_PICK OP_EQUAL OP_VERIFY OP_2 OP_PICK OP_2 OP_PICK OP_CHECKSIG',
  },
  {
    fn: 'reassignment.cash',
    ir: [
      new PushInt(10), new PushInt(4), Op.OP_SUB,
      new PushInt(20), new Get(1), new PushInt(2), Op.OP_MOD, Op.OP_ADD,
      new Get(0), new Get(3), Op.OP_GREATERTHAN, Op.OP_VERIFY,
      new PushString('Hello World'),
      new Get(0), new Get(5), Op.OP_CAT,
      new Get(6), Op.OP_RIPEMD160, new Get(1), Op.OP_RIPEMD160, Op.OP_EQUAL, Op.OP_VERIFY,
      new Get(7), new Get(7), Op.OP_CHECKSIG, Op.OP_VERIFY,
    ],
    stack: ['hw', 'hw', 'myOtherVariable', 'myVariable', 'x', 'y', 'pk', 's'],
    script: 'OP_10 OP_4 OP_SUB 14 OP_1 OP_PICK OP_2 OP_MOD OP_ADD OP_0 OP_PICK OP_3 '
          + 'OP_PICK OP_GREATERTHAN OP_VERIFY 48656c6c6f20576f726c64 OP_0 OP_PICK OP_5 '
          + 'OP_PICK OP_CAT OP_6 OP_PICK OP_RIPEMD160 OP_1 OP_PICK OP_RIPEMD160 OP_EQUAL '
          + 'OP_VERIFY OP_7 OP_PICK OP_7 OP_PICK OP_CHECKSIG',
  },
  {
    fn: 'if_statement.cash',
    ir: [
      new Get(2), new Get(4), Op.OP_ADD,
      new Get(0), new Get(4), Op.OP_SUB,
      new Get(0), new Get(3), new PushInt(2), Op.OP_SUB, Op.OP_NUMEQUAL, Op.OP_IF,
      new Get(0), new Get(6), Op.OP_ADD,
      new Get(5), new Get(1), Op.OP_ADD, new Replace(2),
      new Get(0), new Get(2), Op.OP_GREATERTHAN, Op.OP_VERIFY,
      Op.OP_DROP, Op.OP_ELSE,
      new Get(0), new Get(5), Op.OP_NUMEQUAL, Op.OP_VERIFY,
      Op.OP_ENDIF,
      new Get(0), new Get(5), Op.OP_ADD,
      new Get(0), new Get(5), Op.OP_NUMEQUAL, Op.OP_VERIFY,
    ],
    stack: ['d', 'd', 'd', 'x', 'y', 'a', 'b'],
    script: 'OP_2 OP_PICK OP_4 OP_PICK OP_ADD OP_0 OP_PICK OP_4 OP_PICK OP_SUB OP_0 '
          + 'OP_PICK OP_3 OP_PICK OP_2 OP_SUB OP_NUMEQUAL OP_IF OP_0 OP_PICK OP_6 OP_PICK '
          + 'OP_ADD OP_5 OP_PICK OP_1 OP_PICK OP_ADD OP_2 OP_ROLL OP_DROP OP_SWAP OP_0 OP_PICK '
          + 'OP_2 OP_PICK OP_GREATERTHAN OP_VERIFY OP_DROP OP_ELSE OP_0 OP_PICK OP_5 OP_PICK '
          + 'OP_NUMEQUAL OP_VERIFY OP_ENDIF OP_0 OP_PICK OP_5 OP_PICK OP_ADD OP_0 OP_PICK OP_5 '
          + 'OP_PICK OP_NUMEQUAL',
  },
  {
    fn: 'multifunction.cash',
    ir: [
      new Get(3), new PushInt(0), Op.OP_NUMEQUAL, Op.OP_IF,
      new Get(4), new Get(2), Op.OP_CHECKSIG, Op.OP_VERIFY,
      Op.OP_ELSE, new Get(3), new PushInt(1), Op.OP_NUMEQUAL, Op.OP_IF,
      new Get(4), new Get(1), Op.OP_CHECKSIG, Op.OP_VERIFY,
      new Get(2), Op.OP_CHECKLOCKTIMEVERIFY, Op.OP_DROP,
      Op.OP_ENDIF, Op.OP_ENDIF,
    ],
    stack: ['sender', 'recipient', 'timeout', '$$', 'senderSig'],
    script: 'OP_3 OP_PICK OP_0 OP_NUMEQUAL OP_IF OP_4 OP_PICK OP_2 OP_PICK OP_CHECKSIG '
          + 'OP_VERIFY OP_ELSE OP_3 OP_PICK OP_1 OP_NUMEQUAL OP_IF OP_4 OP_PICK OP_1 '
          + 'OP_PICK OP_CHECKSIG OP_VERIFY OP_2 OP_PICK OP_CHECKLOCKTIMEVERIFY OP_DROP '
          + 'OP_ENDIF OP_ENDIF OP_1',
  },
  {
    fn: 'multifunction_if_statements.cash',
    ir: [
      new Get(2), new PushInt(0), Op.OP_NUMEQUAL, Op.OP_IF,
      new Get(3), new Get(5), Op.OP_ADD,
      new Get(0), new Get(5), Op.OP_SUB,
      new Get(0), new Get(3), Op.OP_NUMEQUAL, Op.OP_IF,
      new Get(0), new Get(7), Op.OP_ADD,
      new Get(6), new Get(1), Op.OP_ADD, new Replace(2),
      new Get(0), new Get(2), Op.OP_GREATERTHAN, Op.OP_VERIFY,
      Op.OP_DROP, Op.OP_ELSE,
      new Get(5), new Replace(1),
      Op.OP_ENDIF,
      new Get(0), new Get(6), Op.OP_ADD,
      new Get(0), new Get(5), Op.OP_NUMEQUAL, Op.OP_VERIFY,
      Op.OP_ELSE, new Get(2), new PushInt(1), Op.OP_NUMEQUAL, Op.OP_IF,
      new Get(3),
      new Get(0), new PushInt(2), Op.OP_ADD,
      new Get(0), new Get(3), Op.OP_NUMEQUAL, Op.OP_IF,
      new Get(0), new Get(6), Op.OP_ADD,
      new Get(0), new Get(2), Op.OP_ADD, new Replace(2),
      new Get(0), new Get(2), Op.OP_GREATERTHAN, Op.OP_VERIFY,
      Op.OP_DROP, Op.OP_ENDIF,
      new Get(5),
      new Get(0), new Get(5), Op.OP_NUMEQUAL, Op.OP_VERIFY,
      Op.OP_ENDIF, Op.OP_ENDIF,
    ],
    stack: ['d', 'd', 'd', 'x', 'y', '$$', 'b'],
    script: 'OP_2 OP_PICK OP_0 OP_NUMEQUAL OP_IF OP_3 OP_PICK OP_5 OP_PICK OP_ADD '
          + 'OP_0 OP_PICK OP_5 OP_PICK OP_SUB OP_0 OP_PICK OP_3 OP_PICK OP_NUMEQUAL '
          + 'OP_IF OP_0 OP_PICK OP_7 OP_PICK OP_ADD OP_6 OP_PICK OP_1 OP_PICK OP_ADD '
          + 'OP_2 OP_ROLL OP_DROP OP_SWAP OP_0 OP_PICK OP_2 OP_PICK OP_GREATERTHAN '
          + 'OP_VERIFY OP_DROP OP_ELSE OP_5 OP_PICK OP_1 OP_ROLL OP_DROP OP_ENDIF OP_0 '
          + 'OP_PICK OP_6 OP_PICK OP_ADD OP_0 OP_PICK OP_5 OP_PICK OP_NUMEQUAL OP_VERIFY '
          + 'OP_ELSE OP_2 OP_PICK OP_1 OP_NUMEQUAL OP_IF OP_3 OP_PICK OP_0 OP_PICK OP_2 '
          + 'OP_ADD OP_0 OP_PICK OP_3 OP_PICK OP_NUMEQUAL OP_IF OP_0 OP_PICK OP_6 OP_PICK '
          + 'OP_ADD OP_0 OP_PICK OP_2 OP_PICK OP_ADD OP_2 OP_ROLL OP_DROP OP_SWAP OP_0 '
          + 'OP_PICK OP_2 OP_PICK OP_GREATERTHAN OP_VERIFY OP_DROP OP_ENDIF OP_5 OP_PICK '
          + 'OP_0 OP_PICK OP_5 OP_PICK OP_NUMEQUAL OP_VERIFY OP_ENDIF OP_ENDIF OP_1',
  },
  {
    fn: '2_of_3_multisig.cash',
    ir: [
      new PushBool(false), new Get(3), new Get(5), new PushInt(2),
      new Get(3), new Get(5), new Get(7), new PushInt(3),
      Op.OP_CHECKMULTISIG, Op.OP_VERIFY,
    ],
    stack: ['pk1', 'pk2', 'pk3', 's1', 's2'],
    script: 'OP_0 OP_3 OP_PICK OP_5 OP_PICK OP_2 OP_3 OP_PICK OP_5 OP_PICK OP_7 OP_PICK '
          + 'OP_3 OP_CHECKMULTISIG',
  },
  {
    fn: 'splice_size.cash',
    ir: [
      new Get(0), new Get(1), Op.OP_SIZE, Op.OP_NIP, new PushInt(2),
      Op.OP_DIV, Op.OP_SPLIT, Op.OP_NIP,
      new Get(0), new Get(2), Op.OP_EQUAL, Op.OP_NOT, Op.OP_VERIFY,
      new Get(1), new PushInt(4), Op.OP_SPLIT, Op.OP_DROP, new Get(1),
      Op.OP_EQUAL, Op.OP_NOT, Op.OP_VERIFY,
    ],
    stack: ['x', 'b'],
    script: 'OP_0 OP_PICK OP_1 OP_PICK OP_SIZE OP_NIP OP_2 OP_DIV OP_SPLIT OP_NIP OP_0 '
          + 'OP_PICK OP_2 OP_PICK OP_EQUAL OP_NOT OP_VERIFY OP_1 OP_PICK OP_4 OP_SPLIT '
          + 'OP_DROP OP_1 OP_PICK OP_EQUAL OP_NOT',
  },
  {
    fn: 'cast_hash_checksig.cash',
    ir: [
      new Get(0), Op.OP_RIPEMD160,
      new PushBytes(Buffer.from('0', 'hex')), Op.OP_HASH160,
      Op.OP_EQUAL, new PushBool(true), Op.OP_NOT, Op.OP_EQUAL, Op.OP_VERIFY,
      new Get(1), new Get(1), Op.OP_CHECKSIG, Op.OP_VERIFY,
    ],
    stack: ['pk', 's'],
    script: 'OP_0 OP_PICK OP_RIPEMD160 OP_0 OP_HASH160 OP_EQUAL OP_1 OP_NOT OP_EQUAL '
          + 'OP_VERIFY OP_1 OP_PICK OP_1 OP_PICK OP_CHECKSIG',
  },
  {
    fn: 'checkdatasig.cash',
    ir: [
      new Get(1), new Get(1), Op.OP_CHECKSIG, Op.OP_VERIFY,
      new Get(1), Op.OP_SIZE, new PushInt(1), Op.OP_SUB, Op.OP_SPLIT, Op.OP_DROP,
      new Get(3), new Get(2), Op.OP_CHECKDATASIG, Op.OP_VERIFY,
    ],
    stack: ['pk', 's', 'data'],
    script: 'OP_1 OP_PICK OP_1 OP_PICK OP_CHECKSIG OP_VERIFY OP_1 OP_PICK OP_SIZE '
          + 'OP_1 OP_SUB OP_SPLIT OP_DROP OP_3 OP_PICK OP_2 OP_PICK OP_CHECKDATASIG',
  },
];

export const targetFixtures: Fixture[] = [
  {
    fn: 'deep_replace',
    ir: [
      new Replace(6),
    ],
    script: 'OP_6 OP_ROLL OP_DROP OP_SWAP OP_TOALTSTACK OP_SWAP OP_TOALTSTACK OP_SWAP '
          + 'OP_TOALTSTACK OP_SWAP OP_TOALTSTACK OP_SWAP OP_FROMALTSTACK OP_FROMALTSTACK '
          + 'OP_FROMALTSTACK OP_FROMALTSTACK OP_1',
  },
];
