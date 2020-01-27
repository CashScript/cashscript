import * as fs from 'fs';
import * as path from 'path';
import { version } from '../../src';
import { Artifact } from '../../src/artifact/Artifact';

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
      abi: [{ name: 'spend', covenant: false, inputs: [{ name: 'pk', type: 'pubkey' }, { name: 's', type: 'sig' }] }],
      bytecode:
        'OP_OVER OP_HASH160 OP_EQUALVERIFY '
        + 'OP_CHECKSIG',
      source: fs.readFileSync(path.join(__dirname, '..', 'fixture', 'p2pkh.cash'), { encoding: 'utf-8' }),
      networks: {},
      compiler: {
        name: 'cashc',
        version,
      },
      updatedAt: '',
    },
  },
  {
    fn: 'reassignment.cash',
    artifact: {
      contractName: 'Reassignment',
      constructorInputs: [{ name: 'x', type: 'int' }, { name: 'y', type: 'string' }],
      abi: [{ name: 'hello', covenant: false, inputs: [{ name: 'pk', type: 'pubkey' }, { name: 's', type: 'sig' }] }],
      bytecode:
        'OP_10 OP_4 OP_SUB '
        + '14 OP_SWAP OP_2 OP_MOD OP_ADD '
        + 'OP_LESSTHAN OP_VERIFY '
        + '48656c6c6f20576f726c64 '
        + 'OP_DUP OP_ROT OP_CAT '
        + 'OP_2 OP_PICK OP_RIPEMD160 OP_SWAP OP_RIPEMD160 OP_EQUALVERIFY '
        + 'OP_ROT OP_ROT OP_CHECKSIG '
        + 'OP_NIP',
      source: fs.readFileSync(path.join(__dirname, '..', 'fixture', 'reassignment.cash'), { encoding: 'utf-8' }),
      networks: {},
      compiler: {
        name: 'cashc',
        version,
      },
      updatedAt: '',
    },
  },
  {
    fn: 'if_statement.cash',
    artifact: {
      contractName: 'IfStatement',
      constructorInputs: [{ name: 'x', type: 'int' }, { name: 'y', type: 'int' }],
      abi: [{ name: 'hello', covenant: false, inputs: [{ name: 'a', type: 'int' }, { name: 'b', type: 'int' }] }],
      bytecode:
        'OP_2OVER OP_ADD '
        + 'OP_DUP OP_4 OP_PICK OP_SUB '
        + 'OP_DUP OP_3 OP_ROLL OP_2 OP_SUB OP_NUMEQUAL OP_IF '
        + 'OP_DUP OP_5 OP_PICK OP_ADD '
        + 'OP_4 OP_PICK OP_OVER OP_ADD OP_ROT OP_DROP OP_SWAP '
        + 'OP_2DUP OP_LESSTHAN OP_VERIFY '
        + 'OP_DROP OP_ELSE '
        + 'OP_DUP OP_4 OP_PICK OP_NUMEQUALVERIFY OP_ENDIF '
        + 'OP_DUP OP_4 OP_ROLL OP_ADD '
        + 'OP_3 OP_ROLL OP_NUMEQUAL '
        + 'OP_NIP OP_NIP OP_NIP',
      source: fs.readFileSync(path.join(__dirname, '..', 'fixture', 'if_statement.cash'), { encoding: 'utf-8' }),
      networks: {},
      compiler: {
        name: 'cashc',
        version,
      },
      updatedAt: '',
    },
  },
  {
    fn: 'multifunction.cash',
    artifact: {
      contractName: 'MultiFunction',
      constructorInputs: [{ name: 'sender', type: 'pubkey' }, { name: 'recipient', type: 'pubkey' }, { name: 'timeout', type: 'int' }],
      abi: [
        { name: 'transfer', covenant: false, inputs: [{ name: 'recipientSig', type: 'sig' }] },
        { name: 'timeout', covenant: false, inputs: [{ name: 'senderSig', type: 'sig' }] },
      ],
      bytecode:
        'OP_3 OP_PICK OP_0 OP_NUMEQUAL OP_IF '
        + 'OP_4 OP_ROLL OP_ROT OP_CHECKSIG '
        + 'OP_NIP OP_NIP OP_NIP OP_ELSE '
        + 'OP_3 OP_ROLL OP_1 OP_NUMEQUAL OP_IF '
        + 'OP_3 OP_ROLL OP_SWAP OP_CHECKSIGVERIFY '
        + 'OP_SWAP OP_CHECKLOCKTIMEVERIFY OP_2DROP OP_1 '
        + 'OP_ELSE OP_0 OP_ENDIF OP_ENDIF',
      source: fs.readFileSync(path.join(__dirname, '..', 'fixture', 'multifunction.cash'), { encoding: 'utf-8' }),
      networks: {},
      compiler: {
        name: 'cashc',
        version,
      },
      updatedAt: '',
    },
  },
  {
    fn: 'multifunction_if_statements.cash',
    artifact: {
      contractName: 'MultiFunctionIfStatements',
      constructorInputs: [{ name: 'x', type: 'int' }, { name: 'y', type: 'int' }],
      abi: [
        { name: 'transfer', covenant: false, inputs: [{ name: 'a', type: 'int' }, { name: 'b', type: 'int' }] },
        { name: 'timeout', covenant: false, inputs: [{ name: 'b', type: 'int' }] },
      ],
      bytecode:
        'OP_2 OP_PICK OP_0 OP_NUMEQUAL OP_IF '
        + 'OP_3 OP_PICK OP_5 OP_PICK OP_ADD '
        + 'OP_DUP OP_5 OP_PICK OP_SUB '
        + 'OP_DUP OP_3 OP_ROLL OP_NUMEQUAL OP_IF '
        + 'OP_DUP OP_6 OP_PICK OP_ADD '
        + 'OP_5 OP_PICK OP_OVER OP_ADD OP_ROT OP_DROP OP_SWAP '
        + 'OP_2DUP OP_LESSTHAN OP_VERIFY '
        + 'OP_DROP OP_ELSE '
        + 'OP_4 OP_PICK OP_NIP OP_ENDIF '
        + 'OP_DUP OP_5 OP_ROLL OP_ADD '
        + 'OP_3 OP_ROLL OP_NUMEQUAL '
        + 'OP_NIP OP_NIP OP_NIP OP_NIP OP_ELSE '
        + 'OP_ROT OP_1 OP_NUMEQUAL OP_IF '
        + 'OP_2 OP_PICK OP_DUP OP_2 OP_ADD '
        + 'OP_DUP OP_3 OP_ROLL OP_NUMEQUAL OP_IF '
        + 'OP_DUP OP_4 OP_PICK OP_ADD '
        + 'OP_2DUP OP_ADD OP_ROT OP_DROP OP_SWAP '
        + 'OP_2DUP OP_LESSTHAN OP_VERIFY '
        + 'OP_DROP OP_ENDIF '
        + ''
        + 'OP_2SWAP OP_NUMEQUAL '
        + 'OP_NIP OP_NIP OP_ELSE OP_0 OP_ENDIF OP_ENDIF',
      source: fs.readFileSync(path.join(__dirname, '..', 'fixture', 'multifunction_if_statements.cash'), { encoding: 'utf-8' }),
      networks: {},
      compiler: {
        name: 'cashc',
        version,
      },
      updatedAt: '',
    },
  },
  {
    fn: '2_of_3_multisig.cash',
    artifact: {
      contractName: 'MultiSig',
      constructorInputs: [{ name: 'pk1', type: 'pubkey' }, { name: 'pk2', type: 'pubkey' }, { name: 'pk3', type: 'pubkey' }],
      abi: [{ name: 'spend', covenant: false, inputs: [{ name: 's1', type: 'sig' }, { name: 's2', type: 'sig' }] }],
      bytecode:
        'OP_0 OP_3 OP_ROLL OP_4 OP_ROLL OP_2 '
        + 'OP_3 OP_ROLL OP_2ROT OP_SWAP OP_3 OP_CHECKMULTISIG',
      source: fs.readFileSync(path.join(__dirname, '..', 'fixture', '2_of_3_multisig.cash'), { encoding: 'utf-8' }),
      networks: {},
      compiler: {
        name: 'cashc',
        version,
      },
      updatedAt: '',
    },
  },
  {
    fn: 'split_size.cash',
    artifact: {
      contractName: 'SplitSize',
      constructorInputs: [{ name: 'b', type: 'bytes' }],
      abi: [{ name: 'spend', covenant: false, inputs: [] }],
      bytecode:
        'OP_DUP OP_DUP OP_SIZE OP_NIP OP_2 OP_DIV OP_SPLIT OP_NIP '
        + 'OP_2DUP OP_EQUAL OP_NOT OP_VERIFY '
        + 'OP_SWAP OP_4 OP_SPLIT OP_DROP OP_EQUAL OP_NOT',
      source: fs.readFileSync(path.join(__dirname, '..', 'fixture', 'split_size.cash'), { encoding: 'utf-8' }),
      networks: {},
      compiler: {
        name: 'cashc',
        version,
      },
      updatedAt: '',
    },
  },
  {
    fn: 'cast_hash_checksig.cash',
    artifact: {
      contractName: 'CastHashChecksig',
      constructorInputs: [],
      abi: [{ name: 'hello', covenant: false, inputs: [{ name: 'pk', type: 'pubkey' }, { name: 's', type: 'sig' }] }],
      bytecode:
        'OP_DUP OP_RIPEMD160 OP_0 OP_HASH160 OP_EQUAL OP_1 OP_NOT OP_EQUALVERIFY '
        + 'OP_CHECKSIG',
      source: fs.readFileSync(path.join(__dirname, '..', 'fixture', 'cast_hash_checksig.cash'), { encoding: 'utf-8' }),
      networks: {},
      compiler: {
        name: 'cashc',
        version,
      },
      updatedAt: '',
    },
  },
  {
    fn: 'checkdatasig.cash',
    artifact: {
      contractName: 'CheckDataSig',
      constructorInputs: [],
      abi: [{ name: 'hello', covenant: false, inputs: [{ name: 'pk', type: 'pubkey' }, { name: 's', type: 'sig' }, { name: 'data', type: 'bytes' }] }],
      bytecode:
        'OP_2DUP OP_CHECKSIGVERIFY '
        + 'OP_SWAP OP_SIZE OP_1SUB OP_SPLIT OP_DROP '
        + 'OP_ROT OP_ROT OP_CHECKDATASIG',
      source: fs.readFileSync(path.join(__dirname, '..', 'fixture', 'checkdatasig.cash'), { encoding: 'utf-8' }),
      networks: {},
      compiler: {
        name: 'cashc',
        version,
      },
      updatedAt: '',
    },
  },
  {
    fn: 'hodl_vault.cash',
    artifact: {
      contractName: 'HodlVault',
      constructorInputs: [
        { name: 'ownerPk', type: 'pubkey' },
        { name: 'oraclePk', type: 'pubkey' },
        { name: 'minBlock', type: 'int' },
        { name: 'priceTarget', type: 'int' },
      ],
      abi: [
        {
          name: 'spend',
          covenant: false,
          inputs: [
            { name: 'ownerSig', type: 'sig' },
            { name: 'oracleSig', type: 'datasig' },
            { name: 'oracleMessage', type: 'bytes8' },
          ],
        },
      ],
      bytecode:
        'OP_6 OP_PICK OP_4 OP_SPLIT OP_DROP OP_BIN2NUM '
        + 'OP_7 OP_PICK OP_4 OP_SPLIT OP_NIP OP_BIN2NUM '
        + 'OP_OVER OP_5 OP_ROLL OP_GREATERTHANOREQUAL OP_VERIFY '
        + 'OP_SWAP OP_CHECKLOCKTIMEVERIFY OP_DROP '
        + 'OP_3 OP_ROLL OP_GREATERTHANOREQUAL OP_VERIFY '
        + 'OP_3 OP_ROLL OP_4 OP_ROLL OP_3 OP_ROLL OP_CHECKDATASIGVERIFY '
        + 'OP_CHECKSIG',
      source: fs.readFileSync(path.join(__dirname, '..', 'fixture', 'hodl_vault.cash'), { encoding: 'utf-8' }),
      networks: {},
      compiler: {
        name: 'cashc',
        version,
      },
      updatedAt: '',
    },
  },
  {
    fn: 'deep_replace.cash',
    artifact: {
      contractName: 'DeepReplace',
      constructorInputs: [],
      abi: [{ name: 'hello', covenant: false, inputs: [] }],
      bytecode:
        'OP_1 OP_2 OP_3 OP_4 OP_5 OP_6 '
        + 'OP_5 OP_PICK OP_3 OP_LESSTHAN OP_IF '
        + 'OP_3 OP_6 OP_ROLL OP_DROP OP_SWAP OP_TOALTSTACK OP_SWAP OP_TOALTSTACK OP_SWAP '
        + 'OP_TOALTSTACK OP_SWAP OP_TOALTSTACK OP_SWAP OP_FROMALTSTACK OP_FROMALTSTACK '
        + 'OP_FROMALTSTACK OP_FROMALTSTACK OP_ENDIF '
        + 'OP_2ROT OP_5 OP_ROLL OP_ADD OP_4 OP_ROLL OP_ADD '
        + 'OP_3 OP_ROLL OP_ADD OP_ROT OP_ADD OP_GREATERTHAN',
      source: fs.readFileSync(path.join(__dirname, '..', 'fixture', 'deep_replace.cash'), { encoding: 'utf-8' }),
      networks: {},
      compiler: {
        name: 'cashc',
        version,
      },
      updatedAt: '',
    },
  },
  {
    fn: 'bounded_bytes.cash',
    artifact: {
      contractName: 'BoundedBytes',
      constructorInputs: [],
      abi: [{ name: 'spend', covenant: false, inputs: [{ name: 'b', type: 'bytes4' }, { name: 'i', type: 'int' }] }],
      bytecode: 'OP_SWAP OP_4 OP_NUM2BIN OP_EQUAL',
      source: fs.readFileSync(path.join(__dirname, '..', 'fixture', 'bounded_bytes.cash'), { encoding: 'utf-8' }),
      networks: {},
      compiler: {
        name: 'cashc',
        version,
      },
      updatedAt: '',
    },
  },
  {
    fn: 'covenant.cash',
    artifact: {
      contractName: 'Covenant',
      constructorInputs: [
        {
          name: 'requiredVersion',
          type: 'bytes4',
        },
      ],
      abi: [{ name: 'spend', covenant: true, inputs: [{ name: 'pk', type: 'pubkey' }, { name: 's', type: 'sig' }] }],
      bytecode:
        'OP_OVER OP_4 OP_SPLIT 65 OP_SPLIT OP_NIP OP_SIZE 34 OP_SUB OP_SPLIT OP_DROP '
        + 'OP_SWAP OP_ROT OP_EQUALVERIFY 00 OP_EQUALVERIFY '
        + 'OP_ROT OP_ROT OP_2DUP OP_SWAP OP_SIZE OP_1SUB OP_SPLIT OP_DROP '
        + 'OP_4 OP_ROLL OP_SHA256 OP_ROT OP_CHECKDATASIGVERIFY OP_CHECKSIG',
      source: fs.readFileSync(path.join(__dirname, '..', 'fixture', 'covenant.cash'), { encoding: 'utf-8' }),
      networks: {},
      compiler: {
        name: 'cashc',
        version,
      },
      updatedAt: '',
    },
  },
  {
    fn: 'covenant_multiple_checksig.cash',
    artifact: {
      contractName: 'Covenant',
      constructorInputs: [
        {
          name: 'requiredHS',
          type: 'bytes32',
        },
      ],
      abi: [{ name: 'spend', covenant: true, inputs: [{ name: 'pk', type: 'pubkey' }, { name: 's', type: 'sig' }] }],
      bytecode:
        'OP_OVER 24 OP_SPLIT OP_NIP 20 OP_SPLIT 25 OP_SPLIT OP_NIP OP_SIZE 34 OP_SUB OP_SPLIT OP_DROP '
        + 'OP_5 OP_PICK OP_5 OP_PICK OP_CHECKSIG OP_NOT OP_VERIFY '
        + 'OP_SWAP OP_ROT OP_EQUALVERIFY 00 OP_EQUALVERIFY '
        + 'OP_2 OP_PICK OP_2 OP_PICK OP_2DUP OP_SWAP OP_SIZE OP_1SUB OP_SPLIT OP_DROP '
        + 'OP_4 OP_ROLL OP_SHA256 OP_ROT OP_CHECKDATASIGVERIFY OP_CHECKSIGVERIFY '
        + 'OP_CHECKSIG',
      source: fs.readFileSync(path.join(__dirname, '..', 'fixture', 'covenant_multiple_checksig.cash'), { encoding: 'utf-8' }),
      networks: {},
      compiler: {
        name: 'cashc',
        version,
      },
      updatedAt: '',
    },
  },
  {
    fn: 'covenant_only_hashtype.cash',
    artifact: {
      contractName: 'Covenant',
      constructorInputs: [],
      abi: [{ name: 'spend', covenant: true, inputs: [{ name: 'pk', type: 'pubkey' }, { name: 's', type: 'sig' }] }],
      bytecode:
        'OP_DUP OP_SIZE OP_4 OP_SUB OP_SPLIT OP_NIP OP_1 OP_EQUALVERIFY '
        + 'OP_ROT OP_ROT OP_2DUP OP_SWAP OP_SIZE OP_1SUB OP_SPLIT OP_DROP '
        + 'OP_4 OP_ROLL OP_SHA256 OP_ROT OP_CHECKDATASIGVERIFY OP_CHECKSIG',
      source: fs.readFileSync(path.join(__dirname, '..', 'fixture', 'covenant_only_hashtype.cash'), { encoding: 'utf-8' }),
      networks: {},
      compiler: {
        name: 'cashc',
        version,
      },
      updatedAt: '',
    },
  },
  {
    fn: 'covenant_only_version.cash',
    artifact: {
      contractName: 'Covenant',
      constructorInputs: [],
      abi: [{ name: 'spend', covenant: true, inputs: [{ name: 'pk', type: 'pubkey' }, { name: 's', type: 'sig' }] }],
      bytecode:
        'OP_DUP OP_4 OP_SPLIT OP_DROP OP_1 OP_EQUALVERIFY '
        + 'OP_ROT OP_ROT OP_2DUP OP_SWAP OP_SIZE OP_1SUB OP_SPLIT OP_DROP '
        + 'OP_4 OP_ROLL OP_SHA256 OP_ROT OP_CHECKDATASIGVERIFY OP_CHECKSIG',
      source: fs.readFileSync(path.join(__dirname, '..', 'fixture', 'covenant_only_version.cash'), { encoding: 'utf-8' }),
      networks: {},
      compiler: {
        name: 'cashc',
        version,
      },
      updatedAt: '',
    },
  },
  {
    fn: 'covenant_all_fields.cash',
    artifact: {
      contractName: 'Covenant',
      constructorInputs: [],
      abi: [{ name: 'spend', covenant: true, inputs: [{ name: 'pk', type: 'pubkey' }, { name: 's', type: 'sig' }] }],
      bytecode:
        'OP_DUP OP_4 OP_SPLIT 20 OP_SPLIT 20 OP_SPLIT 24 OP_SPLIT OP_1 OP_SPLIT OP_NIP OP_SIZE 34 OP_SUB OP_SPLIT '
        + 'OP_8 OP_SPLIT OP_4 OP_SPLIT 20 OP_SPLIT OP_4 OP_SPLIT '
        + 'OP_9 OP_ROLL OP_1 OP_EQUALVERIFY OP_8 OP_ROLL OP_1 OP_EQUALVERIFY '
        + 'OP_7 OP_ROLL OP_1 OP_EQUALVERIFY OP_6 OP_ROLL OP_1 OP_EQUALVERIFY '
        + 'OP_5 OP_ROLL OP_1 OP_EQUALVERIFY OP_4 OP_ROLL OP_1 OP_EQUALVERIFY '
        + 'OP_3 OP_ROLL OP_1 OP_EQUALVERIFY OP_ROT OP_1 OP_EQUALVERIFY '
        + 'OP_SWAP OP_1 OP_EQUALVERIFY OP_1 OP_EQUALVERIFY '
        + 'OP_ROT OP_ROT OP_2DUP OP_SWAP OP_SIZE OP_1SUB OP_SPLIT OP_DROP '
        + 'OP_4 OP_ROLL OP_SHA256 OP_ROT OP_CHECKDATASIGVERIFY OP_CHECKSIG',
      source: fs.readFileSync(path.join(__dirname, '..', 'fixture', 'covenant_all_fields.cash'), { encoding: 'utf-8' }),
      networks: {},
      compiler: {
        name: 'cashc',
        version,
      },
      updatedAt: '',
    },
  },
  {
    fn: 'covenant_shuffled_fields.cash',
    artifact: {
      contractName: 'Covenant',
      constructorInputs: [],
      abi: [{ name: 'spend', covenant: true, inputs: [{ name: 'pk', type: 'pubkey' }, { name: 's', type: 'sig' }] }],
      bytecode:
        'OP_DUP OP_4 OP_SPLIT 20 OP_SPLIT 20 OP_SPLIT 24 OP_SPLIT OP_1 OP_SPLIT OP_NIP OP_SIZE 34 OP_SUB OP_SPLIT '
        + 'OP_8 OP_SPLIT OP_4 OP_SPLIT 20 OP_SPLIT OP_4 OP_SPLIT '
        + 'OP_1 OP_EQUALVERIFY OP_4 OP_ROLL OP_1 OP_EQUALVERIFY '
        + 'OP_6 OP_ROLL OP_1 OP_EQUALVERIFY OP_6 OP_ROLL OP_1 OP_EQUALVERIFY '
        + 'OP_3 OP_ROLL OP_1 OP_EQUALVERIFY OP_1 OP_EQUALVERIFY '
        + 'OP_3 OP_ROLL OP_1 OP_EQUALVERIFY OP_SWAP OP_1 OP_EQUALVERIFY '
        + 'OP_SWAP OP_1 OP_EQUALVERIFY OP_1 OP_EQUALVERIFY '
        + 'OP_ROT OP_ROT OP_2DUP OP_SWAP OP_SIZE OP_1SUB OP_SPLIT OP_DROP '
        + 'OP_4 OP_ROLL OP_SHA256 OP_ROT OP_CHECKDATASIGVERIFY OP_CHECKSIG',
      source: fs.readFileSync(path.join(__dirname, '..', 'fixture', 'covenant_shuffled_fields.cash'), { encoding: 'utf-8' }),
      networks: {},
      compiler: {
        name: 'cashc',
        version,
      },
      updatedAt: '',
    },
  },
  {
    fn: 'mecenas_v1.cash',
    artifact: {
      contractName: 'Mecenas',
      constructorInputs: [
        { name: 'recipient', type: 'bytes20' },
        { name: 'funder', type: 'bytes20' },
        { name: 'pledge', type: 'int' },
      ],
      abi: [
        { name: 'receive', covenant: true, inputs: [{ name: 'pk', type: 'pubkey' }, { name: 's', type: 'sig' }] },
        { name: 'reclaim', covenant: false, inputs: [{ name: 'pk', type: 'pubkey' }, { name: 's', type: 'sig' }] },
      ],
      bytecode:
        'OP_3 OP_PICK OP_0 OP_NUMEQUAL OP_IF '
        + 'OP_4 OP_PICK 69 OP_SPLIT OP_NIP OP_SIZE 34 OP_SUB OP_SPLIT '
        + 'OP_8 OP_SPLIT OP_4 OP_SPLIT OP_NIP 20 OP_SPLIT OP_DROP '
        + 'OP_9 OP_ROLL OP_9 OP_ROLL OP_2DUP OP_SWAP OP_SIZE OP_1SUB OP_SPLIT OP_DROP '
        + 'OP_11 OP_ROLL OP_SHA256 OP_ROT OP_CHECKDATASIGVERIFY OP_CHECKSIGVERIFY '
        + '008d27 OP_CHECKSEQUENCEVERIFY OP_DROP '
        + 'e803 '
        + 'OP_6 OP_PICK OP_8 OP_NUM2BIN '
        + 'OP_3 OP_ROLL OP_BIN2NUM OP_7 OP_ROLL OP_SUB OP_ROT OP_SUB OP_8 OP_NUM2BIN '
        + 'OP_SWAP 1976a914 OP_CAT OP_4 OP_ROLL OP_CAT 88ac OP_CAT '
        + 'OP_SWAP 17a914 OP_CAT OP_3 OP_ROLL OP_HASH160 OP_CAT 87 OP_CAT '
        + 'OP_CAT OP_HASH256 OP_EQUAL OP_NIP OP_NIP '
        + 'OP_ELSE OP_3 OP_ROLL OP_1 OP_NUMEQUAL OP_IF '
        + 'OP_3 OP_PICK OP_HASH160 OP_ROT OP_EQUALVERIFY '
        + 'OP_2SWAP OP_CHECKSIG OP_NIP OP_NIP '
        + 'OP_ELSE OP_0 OP_ENDIF OP_ENDIF',
      source: fs.readFileSync(path.join(__dirname, '..', 'fixture', 'mecenas_v1.cash'), { encoding: 'utf-8' }),
      networks: {},
      compiler: {
        name: 'cashc',
        version,
      },
      updatedAt: '',
    },
  },
  {
    fn: 'mecenas.cash',
    artifact: {
      contractName: 'Mecenas',
      constructorInputs: [
        { name: 'recipient', type: 'bytes20' },
        { name: 'funder', type: 'bytes20' },
        { name: 'pledge', type: 'int' },
        { name: 'period', type: 'int' },
      ],
      abi: [
        { name: 'receive', covenant: true, inputs: [{ name: 'pk', type: 'pubkey' }, { name: 's', type: 'sig' }] },
        { name: 'reclaim', covenant: false, inputs: [{ name: 'pk', type: 'pubkey' }, { name: 's', type: 'sig' }] },
      ],
      bytecode:
        'OP_4 OP_PICK OP_0 OP_NUMEQUAL OP_IF '
        + 'OP_5 OP_PICK 69 OP_SPLIT OP_NIP OP_SIZE 34 OP_SUB OP_SPLIT '
        + 'OP_8 OP_SPLIT OP_4 OP_SPLIT OP_NIP 20 OP_SPLIT OP_DROP '
        + 'OP_10 OP_ROLL OP_10 OP_ROLL OP_2DUP OP_SWAP OP_SIZE OP_1SUB OP_SPLIT OP_DROP '
        + 'OP_12 OP_ROLL OP_SHA256 OP_ROT OP_CHECKDATASIGVERIFY OP_CHECKSIGVERIFY '
        + 'OP_6 OP_ROLL OP_CHECKSEQUENCEVERIFY OP_DROP '
        + 'e803 '
        + 'OP_ROT OP_BIN2NUM '
        + 'OP_DUP OP_7 OP_PICK OP_3 OP_PICK OP_ADD OP_LESSTHANOREQUAL OP_IF '
        + 'OP_2DUP OP_SWAP OP_SUB OP_8 OP_NUM2BIN '
        + 'OP_DUP 1976a914 OP_CAT OP_6 OP_PICK OP_CAT 88ac OP_CAT '
        + 'OP_DUP OP_HASH256 OP_5 OP_PICK OP_EQUALVERIFY OP_2DROP '
        + 'OP_ELSE '
        + 'OP_6 OP_PICK OP_8 OP_NUM2BIN '
        + 'OP_OVER OP_8 OP_PICK OP_SUB OP_3 OP_PICK OP_SUB OP_8 OP_NUM2BIN '
        + 'OP_OVER 1976a914 OP_CAT OP_7 OP_PICK OP_CAT 88ac OP_CAT '
        + 'OP_OVER 17a914 OP_CAT OP_7 OP_PICK OP_HASH160 OP_CAT 87 OP_CAT '
        + 'OP_2DUP OP_CAT OP_HASH256 OP_7 OP_PICK OP_EQUALVERIFY OP_2DROP OP_2DROP OP_ENDIF '
        + 'OP_2DROP OP_2DROP OP_2DROP OP_2DROP OP_1 '
        + 'OP_ELSE OP_4 OP_ROLL OP_1 OP_NUMEQUAL OP_IF '
        + 'OP_4 OP_PICK OP_HASH160 OP_ROT OP_EQUALVERIFY '
        + 'OP_4 OP_ROLL OP_4 OP_ROLL OP_CHECKSIG OP_NIP OP_NIP OP_NIP '
        + 'OP_ELSE OP_0 OP_ENDIF OP_ENDIF',
      source: fs.readFileSync(path.join(__dirname, '..', 'fixture', 'mecenas.cash'), { encoding: 'utf-8' }),
      networks: {},
      compiler: {
        name: 'cashc',
        version,
      },
      updatedAt: '',
    },
  },
  {
    fn: 'announcement.cash',
    artifact: {
      contractName: 'Announcement',
      constructorInputs: [],
      abi: [
        { name: 'announce', covenant: true, inputs: [{ name: 'pk', type: 'pubkey' }, { name: 's', type: 'sig' }] },
      ],
      bytecode:
        // Preimage deserialisation
        'OP_DUP 69 OP_SPLIT OP_NIP OP_SIZE 34 OP_SUB OP_SPLIT '
        + 'OP_8 OP_SPLIT OP_4 OP_SPLIT OP_NIP 20 OP_SPLIT OP_DROP '
        // require(checkSig(s, pk)) + covenant verification
        + 'OP_2ROT OP_2DUP OP_SWAP OP_SIZE OP_1SUB OP_SPLIT OP_DROP '
        + 'OP_7 OP_ROLL OP_SHA256 OP_ROT OP_CHECKDATASIGVERIFY OP_CHECKSIGVERIFY '
        // bytes announcement = new OutputNullData(...)
        + '0000000000000000 6a 6d02 OP_SIZE OP_DUP 4b OP_GREATERTHAN OP_IF '
        + '4c OP_SWAP OP_CAT OP_ENDIF OP_SWAP OP_CAT OP_CAT '
        + '4120636f6e7472616374206d6179206e6f7420696e6a75726520612068756d616e20626'
        + '5696e67206f722c207468726f75676820696e616374696f6e2c20616c6c6f77206120687'
        + '56d616e206265696e6720746f20636f6d6520746f206861726d2e '
        + 'OP_SIZE OP_DUP 4b OP_GREATERTHAN OP_IF 4c OP_SWAP OP_CAT OP_ENDIF OP_SWAP OP_CAT OP_CAT '
        + 'OP_SIZE OP_SWAP OP_CAT OP_CAT '
        // int minerFee = 1000
        + 'e803 '
        // int changeAmount = int(tx.value) - minerFee
        + 'OP_3 OP_ROLL OP_BIN2NUM OP_OVER OP_SUB '
        // if (changeAmount >= minerFee)
        + 'OP_DUP OP_ROT OP_GREATERTHANOREQUAL OP_IF '
        // bytes32 change = new OutputP2SH(...)
        + 'OP_DUP OP_8 OP_NUM2BIN 17a914 OP_CAT OP_4 OP_PICK OP_HASH160 OP_CAT 87 OP_CAT '
        // require(tx.hashOutputs == hash256(announcement + change))
        + 'OP_2OVER OP_2 OP_PICK OP_CAT OP_HASH256 OP_EQUALVERIFY OP_DROP '
        + 'OP_ELSE '
        // require(tx.hashOutputs == hash256(announcement))
        + 'OP_2 OP_PICK OP_2 OP_PICK OP_HASH256 OP_EQUALVERIFY '
        // Stack cleanup
        + 'OP_ENDIF OP_2DROP OP_2DROP OP_1',
      source: fs.readFileSync(path.join(__dirname, '..', 'fixture', 'announcement.cash'), { encoding: 'utf-8' }),
      networks: {},
      compiler: {
        name: 'cashc',
        version,
      },
      updatedAt: '',
    },
  },
];
