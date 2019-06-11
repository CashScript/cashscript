import * as pjson from 'pjson';
import * as fs from 'fs';
import * as path from 'path';
import { Artifact } from '../../../src/artifact/Artifact';

interface Fixture {
  fn: string,
  artifact: Artifact,
}

export const fixtures: Fixture[] = [
  {
    fn: 'p2pkh.cash',
    artifact: {
      contractName: 'P2PKH',
      constructorInputs: [{ name: 'pkh', type: 'bytes20' }],
      abi: [{ name: 'spend', inputs: [{ name: 'pk', type: 'pubkey' }, { name: 's', type: 'sig' }] }],
      bytecode:
        'OP_1 OP_PICK OP_SHA256 OP_1 OP_PICK OP_EQUAL OP_VERIFY '
        + 'OP_2 OP_PICK OP_2 OP_PICK OP_CHECKSIG OP_VERIFY '
        + 'OP_DROP OP_DROP OP_DROP OP_1',
      source: fs.readFileSync(path.join(__dirname, 'p2pkh.cash'), { encoding: 'utf-8' }),
      networks: {},
      compiler: {
        name: 'cashc',
        version: `v${pjson.version}`,
      },
      updatedAt: undefined,
    },
  },
  {
    fn: 'reassignment.cash',
    artifact: {
      contractName: 'Reassignment',
      constructorInputs: [{ name: 'x', type: 'int' }, { name: 'y', type: 'string' }],
      abi: [{ name: 'hello', inputs: [{ name: 'pk', type: 'pubkey' }, { name: 's', type: 'sig' }] }],
      bytecode:
        'OP_10 OP_4 OP_SUB '
        + '14 OP_1 OP_PICK OP_2 OP_MOD OP_ADD '
        + 'OP_0 OP_PICK OP_3 OP_PICK OP_GREATERTHAN OP_VERIFY '
        + '48656c6c6f20576f726c64 '
        + 'OP_0 OP_PICK OP_5 OP_PICK OP_CAT '
        + 'OP_6 OP_PICK OP_RIPEMD160 OP_1 OP_PICK OP_RIPEMD160 OP_EQUAL OP_VERIFY '
        + 'OP_7 OP_PICK OP_7 OP_PICK OP_CHECKSIG OP_VERIFY '
        + 'OP_DROP OP_DROP OP_DROP OP_DROP OP_DROP OP_DROP OP_DROP OP_DROP OP_1',
      source: fs.readFileSync(path.join(__dirname, 'reassignment.cash'), { encoding: 'utf-8' }),
      networks: {},
      compiler: {
        name: 'cashc',
        version: `v${pjson.version}`,
      },
      updatedAt: undefined,
    },
  },
  {
    fn: 'if_statement.cash',
    artifact: {
      contractName: 'IfStatement',
      constructorInputs: [{ name: 'x', type: 'int' }, { name: 'y', type: 'int' }],
      abi: [{ name: 'hello', inputs: [{ name: 'a', type: 'int' }, { name: 'b', type: 'int' }] }],
      bytecode:
        'OP_2 OP_PICK OP_4 OP_PICK OP_ADD '
        + 'OP_0 OP_PICK OP_4 OP_PICK OP_SUB '
        + 'OP_0 OP_PICK OP_3 OP_PICK OP_2 OP_SUB OP_NUMEQUAL OP_IF '
        + 'OP_0 OP_PICK OP_6 OP_PICK OP_ADD '
        + 'OP_5 OP_PICK OP_1 OP_PICK OP_ADD OP_2 OP_ROLL OP_DROP OP_SWAP '
        + 'OP_0 OP_PICK OP_2 OP_PICK OP_GREATERTHAN OP_VERIFY '
        + 'OP_DROP OP_ELSE '
        + 'OP_0 OP_PICK OP_5 OP_PICK OP_NUMEQUAL OP_VERIFY OP_ENDIF '
        + 'OP_0 OP_PICK OP_5 OP_PICK OP_ADD '
        + 'OP_0 OP_PICK OP_5 OP_PICK OP_NUMEQUAL OP_VERIFY '
        + 'OP_DROP OP_DROP OP_DROP OP_DROP OP_DROP OP_DROP OP_DROP OP_1',
      source: fs.readFileSync(path.join(__dirname, 'if_statement.cash'), { encoding: 'utf-8' }),
      networks: {},
      compiler: {
        name: 'cashc',
        version: `v${pjson.version}`,
      },
      updatedAt: undefined,
    },
  },
  {
    fn: 'multifunction.cash',
    artifact: {
      contractName: 'MultiFunction',
      constructorInputs: [{ name: 'sender', type: 'pubkey' }, { name: 'recipient', type: 'pubkey' }, { name: 'timeout', type: 'int' }],
      abi: [{ name: 'transfer', inputs: [{ name: 'recipientSig', type: 'sig' }] }, { name: 'timeout', inputs: [{ name: 'senderSig', type: 'sig' }] }],
      bytecode:
        'OP_3 OP_PICK OP_0 OP_NUMEQUAL OP_IF '
        + 'OP_4 OP_PICK OP_2 OP_PICK OP_CHECKSIG OP_VERIFY '
        + 'OP_DROP OP_DROP OP_DROP OP_DROP OP_DROP OP_1 OP_ELSE '
        + 'OP_3 OP_PICK OP_1 OP_NUMEQUAL OP_IF '
        + 'OP_4 OP_PICK OP_1 OP_PICK OP_CHECKSIG OP_VERIFY '
        + 'OP_2 OP_PICK OP_CHECKLOCKTIMEVERIFY '
        + 'OP_DROP OP_DROP OP_DROP OP_DROP OP_DROP OP_DROP OP_1 OP_ENDIF OP_ENDIF',
      source: fs.readFileSync(path.join(__dirname, 'multifunction.cash'), { encoding: 'utf-8' }),
      networks: {},
      compiler: {
        name: 'cashc',
        version: `v${pjson.version}`,
      },
      updatedAt: undefined,
    },
  },
  {
    fn: 'multifunction_if_statements.cash',
    artifact: {
      contractName: 'MultiFunctionIfStatements',
      constructorInputs: [{ name: 'x', type: 'int' }, { name: 'y', type: 'int' }],
      abi: [{ name: 'transfer', inputs: [{ name: 'a', type: 'int' }, { name: 'b', type: 'int' }] }, { name: 'timeout', inputs: [{ name: 'b', type: 'int' }] }],
      bytecode:
        'OP_2 OP_PICK OP_0 OP_NUMEQUAL OP_IF '
        + 'OP_3 OP_PICK OP_5 OP_PICK OP_ADD '
        + 'OP_0 OP_PICK OP_5 OP_PICK OP_SUB '
        + 'OP_0 OP_PICK OP_3 OP_PICK OP_NUMEQUAL OP_IF '
        + 'OP_0 OP_PICK OP_7 OP_PICK OP_ADD '
        + 'OP_6 OP_PICK OP_1 OP_PICK OP_ADD OP_2 OP_ROLL OP_DROP OP_SWAP '
        + 'OP_0 OP_PICK OP_2 OP_PICK OP_GREATERTHAN OP_VERIFY '
        + 'OP_DROP OP_ELSE '
        + 'OP_5 OP_PICK OP_1 OP_ROLL OP_DROP OP_ENDIF '
        + 'OP_0 OP_PICK OP_6 OP_PICK OP_ADD '
        + 'OP_0 OP_PICK OP_5 OP_PICK OP_NUMEQUAL OP_VERIFY '
        + 'OP_DROP OP_DROP OP_DROP OP_DROP OP_DROP OP_DROP OP_DROP OP_DROP OP_1 OP_ELSE '
        + 'OP_2 OP_PICK OP_1 OP_NUMEQUAL OP_IF '
        + 'OP_3 OP_PICK OP_0 OP_PICK OP_2 OP_ADD '
        + 'OP_0 OP_PICK OP_3 OP_PICK OP_NUMEQUAL OP_IF '
        + 'OP_0 OP_PICK OP_6 OP_PICK OP_ADD '
        + 'OP_0 OP_PICK OP_2 OP_PICK OP_ADD OP_2 OP_ROLL OP_DROP OP_SWAP '
        + 'OP_0 OP_PICK OP_2 OP_PICK OP_GREATERTHAN OP_VERIFY '
        + 'OP_DROP OP_ENDIF '
        + 'OP_5 OP_PICK OP_0 OP_PICK OP_5 OP_PICK OP_NUMEQUAL OP_VERIFY '
        + 'OP_DROP OP_DROP OP_DROP OP_DROP OP_DROP OP_DROP OP_DROP OP_1 OP_ENDIF OP_ENDIF',
      source: fs.readFileSync(path.join(__dirname, 'multifunction_if_statements.cash'), { encoding: 'utf-8' }),
      networks: {},
      compiler: {
        name: 'cashc',
        version: `v${pjson.version}`,
      },
      updatedAt: undefined,
    },
  },
  {
    fn: '2_of_3_multisig.cash',
    artifact: {
      contractName: 'MultiSig',
      constructorInputs: [{ name: 'pk1', type: 'pubkey' }, { name: 'pk2', type: 'pubkey' }, { name: 'pk3', type: 'pubkey' }],
      abi: [{ name: 'spend', inputs: [{ name: 's1', type: 'sig' }, { name: 's2', type: 'sig' }] }],
      bytecode:
        'OP_0 OP_3 OP_PICK OP_5 OP_PICK OP_2 '
        + 'OP_3 OP_PICK OP_5 OP_PICK OP_7 OP_PICK OP_3 OP_CHECKMULTISIG OP_VERIFY '
        + 'OP_DROP OP_DROP OP_DROP OP_DROP OP_DROP OP_1',
      source: fs.readFileSync(path.join(__dirname, '2_of_3_multisig.cash'), { encoding: 'utf-8' }),
      networks: {},
      compiler: {
        name: 'cashc',
        version: `v${pjson.version}`,
      },
      updatedAt: undefined,
    },
  },
  {
    fn: 'split_size.cash',
    artifact: {
      contractName: 'SplitSize',
      constructorInputs: [{ name: 'b', type: 'bytes' }],
      abi: [{ name: 'spend', inputs: [] }],
      bytecode:
        'OP_0 OP_PICK OP_1 OP_PICK OP_SIZE OP_NIP OP_2 OP_DIV OP_SPLIT OP_NIP '
        + 'OP_0 OP_PICK OP_2 OP_PICK OP_EQUAL OP_NOT OP_VERIFY '
        + 'OP_1 OP_PICK OP_4 OP_SPLIT OP_DROP OP_1 OP_PICK OP_EQUAL OP_NOT OP_VERIFY '
        + 'OP_DROP OP_DROP OP_1',
      source: fs.readFileSync(path.join(__dirname, 'split_size.cash'), { encoding: 'utf-8' }),
      networks: {},
      compiler: {
        name: 'cashc',
        version: `v${pjson.version}`,
      },
      updatedAt: undefined,
    },
  },
  {
    fn: 'cast_hash_checksig.cash',
    artifact: {
      contractName: 'CastHashChecksig',
      constructorInputs: [],
      abi: [{ name: 'hello', inputs: [{ name: 'pk', type: 'pubkey' }, { name: 's', type: 'sig' }] }],
      bytecode:
        'OP_0 OP_PICK OP_RIPEMD160 OP_0 OP_HASH160 OP_EQUAL OP_1 OP_NOT OP_EQUAL OP_VERIFY '
        + 'OP_1 OP_PICK OP_1 OP_PICK OP_CHECKSIG OP_VERIFY '
        + 'OP_DROP OP_DROP OP_1',
      source: fs.readFileSync(path.join(__dirname, 'cast_hash_checksig.cash'), { encoding: 'utf-8' }),
      networks: {},
      compiler: {
        name: 'cashc',
        version: `v${pjson.version}`,
      },
      updatedAt: undefined,
    },
  },
  {
    fn: 'checkdatasig.cash',
    artifact: {
      contractName: 'CheckDataSig',
      constructorInputs: [],
      abi: [{ name: 'hello', inputs: [{ name: 'pk', type: 'pubkey' }, { name: 's', type: 'sig' }, { name: 'data', type: 'bytes' }] }],
      bytecode:
        'OP_1 OP_PICK OP_1 OP_PICK OP_CHECKSIG OP_VERIFY '
        + 'OP_1 OP_PICK OP_SIZE OP_1 OP_SUB OP_SPLIT OP_DROP '
        + 'OP_3 OP_PICK OP_2 OP_PICK OP_CHECKDATASIG OP_VERIFY '
        + 'OP_DROP OP_DROP OP_DROP OP_1',
      source: fs.readFileSync(path.join(__dirname, 'checkdatasig.cash'), { encoding: 'utf-8' }),
      networks: {},
      compiler: {
        name: 'cashc',
        version: `v${pjson.version}`,
      },
      updatedAt: undefined,
    },
  },
  {
    fn: 'deep_replace.cash',
    artifact: {
      contractName: 'DeepReplace',
      constructorInputs: [],
      abi: [{ name: 'hello', inputs: [] }],
      bytecode:
        'OP_1 OP_2 OP_3 OP_4 OP_5 OP_6 '
        + 'OP_5 OP_PICK OP_3 OP_LESSTHAN OP_IF '
        + 'OP_3 OP_6 OP_ROLL OP_DROP OP_SWAP OP_TOALTSTACK OP_SWAP OP_TOALTSTACK OP_SWAP '
        + 'OP_TOALTSTACK OP_SWAP OP_TOALTSTACK OP_SWAP OP_FROMALTSTACK OP_FROMALTSTACK '
        + 'OP_FROMALTSTACK OP_FROMALTSTACK OP_ENDIF '
        + 'OP_5 OP_PICK OP_5 OP_PICK OP_5 OP_PICK OP_ADD OP_4 OP_PICK OP_ADD '
        + 'OP_3 OP_PICK OP_ADD OP_2 OP_PICK OP_ADD OP_GREATERTHAN OP_VERIFY '
        + 'OP_DROP OP_DROP OP_DROP OP_DROP OP_DROP OP_DROP OP_1',
      source: fs.readFileSync(path.join(__dirname, 'deep_replace.cash'), { encoding: 'utf-8' }),
      networks: {},
      compiler: {
        name: 'cashc',
        version: `v${pjson.version}`,
      },
      updatedAt: undefined,
    },
  },
];
