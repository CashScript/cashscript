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
      new Get(1), Op.SHA256, new Get(1), Op.EQUAL, Op.VERIFY,
      new Get(2), new Get(2), Op.CHECKSIG, Op.VERIFY,
    ],
    stack: ['pkh', 'pk', 's'],
    script: '{01} PICK SHA256 {01} PICK EQUAL VERIFY {02} PICK {02} PICK CHECKSIG',
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
    script: '{0a} {04} SUB {14} {01} PICK {02} MOD ADD {} PICK {03} PICK GREATERTHAN VERIFY '
          + '{48656c6c6f20576f726c64} {} PICK {05} PICK CAT {06} PICK RIPEMD160 {01} PICK '
          + 'RIPEMD160 EQUAL VERIFY {07} PICK {07} PICK CHECKSIG',
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
    script: '{02} PICK {04} PICK ADD {} PICK {04} PICK SUB {} PICK {03} PICK {02} SUB NUMEQUAL IF '
          + '{} PICK {06} PICK ADD {05} PICK {01} PICK ADD {02} ROLL DROP SWAP {} PICK {02} PICK '
          + 'GREATERTHAN VERIFY DROP ELSE {} PICK {05} PICK NUMEQUAL VERIFY ENDIF '
          + '{} PICK {05} PICK ADD {} PICK {05} PICK NUMEQUAL',
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
    script: '{03} PICK {} NUMEQUAL IF {04} PICK {02} PICK CHECKSIG VERIFY ELSE '
          + '{03} PICK {01} NUMEQUAL IF {04} PICK {01} PICK CHECKSIG VERIFY '
          + '{02} PICK CHECKLOCKTIMEVERIFY DROP ENDIF ENDIF {01}',
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
    script: '{02} PICK {} NUMEQUAL IF {03} PICK {05} PICK ADD {} PICK {05} PICK SUB '
          + '{} PICK {03} PICK NUMEQUAL IF {} PICK {07} PICK ADD {06} PICK {01} PICK ADD '
          + '{02} ROLL DROP SWAP {} PICK {02} PICK GREATERTHAN VERIFY DROP ELSE '
          + '{05} PICK {01} ROLL DROP ENDIF {} PICK {06} PICK ADD {} PICK {05} PICK NUMEQUAL VERIFY '
          + 'ELSE {02} PICK {01} NUMEQUAL IF {03} PICK {} PICK {02} ADD {} PICK '
          + '{03} PICK NUMEQUAL IF {} PICK {06} PICK ADD {} PICK {02} PICK ADD {02} ROLL DROP SWAP '
          + '{} PICK {02} PICK GREATERTHAN VERIFY DROP ENDIF {05} PICK {} PICK {05} PICK '
          + 'NUMEQUAL VERIFY ENDIF ENDIF {01}',
  },
  {
    fn: '2_of_3_multisig.cash',
    ir: [
      new Get(3), new Get(5), new PushInt(2),
      new Get(3), new Get(5), new Get(7), new PushInt(3),
      Op.CHECKMULTISIG, Op.VERIFY,
    ],
    stack: ['pk1', 'pk2', 'pk3', 's1', 's2'],
    script: '{03} PICK {05} PICK {02} {03} PICK {05} PICK {07} PICK {03} CHECKMULTISIG',
  },
  {
    fn: 'splice_size.cash',
    ir: [
      new Get(0), new Get(1), Op.SIZE, Op.NIP, new PushInt(2), Op.DIV, Op.SPLIT, Op.NIP,
      new Get(0), new Get(2), Op.EQUAL, Op.NOT, Op.VERIFY,
      new Get(1), new PushInt(4), Op.SPLIT, Op.DROP, new Get(1), Op.EQUAL, Op.NOT, Op.VERIFY,
    ],
    stack: ['x', 'b'],
    script: '{} PICK {01} PICK SIZE NIP {02} DIV SPLIT NIP {} PICK {02} PICK EQUAL NOT VERIFY '
          + '{01} PICK {04} SPLIT DROP {01} PICK EQUAL NOT',
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
    script: '{} PICK RIPEMD160 {} RIPEMD160 EQUAL {01} NOT EQUAL VERIFY {01} PICK {01} PICK CHECKSIG',
  },
  {
    fn: 'checkdatasig.cash',
    ir: [
      new Get(1), new Get(1), Op.CHECKSIG, Op.VERIFY,
      new Get(1), Op.SIZE, new PushInt(1), Op.SUB, Op.SPLIT, Op.DROP,
      new Get(3), new Get(2), Op.CHECKDATASIG, Op.VERIFY,
    ],
    stack: ['pk', 's', 'data'],
    script: '{01} PICK {01} PICK CHECKSIG VERIFY {01} PICK SIZE {01} SUB SPLIT DROP '
          + '{03} PICK {02} PICK CHECKDATASIG',
  },
];

export const targetFixtures: Fixture[] = [
  {
    fn: 'deep_replace',
    ir: [
      new Replace(6),
    ],
    script: '{06} ROLL DROP SWAP TOALTSTACK SWAP TOALTSTACK SWAP TOALTSTACK SWAP TOALTSTACK SWAP '
          + 'FROMALTSTACK FROMALTSTACK FROMALTSTACK FROMALTSTACK {01}',
  },
];
