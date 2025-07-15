import { Artifact } from '@cashscript/utils';
import fs from 'fs';
import { URL } from 'url';
import { version } from '../../src/index.js';

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
        // require(hash160(pk) == pkh)
        'OP_OVER OP_HASH160 OP_EQUALVERIFY '
        // require(checkSig(s, pk))
        + 'OP_CHECKSIG',
      debug: {
        bytecode: '78a988ac',
        logs: [],
        requires: [
          { ip: 3, line: 3 },
          { ip: 5, line: 4 },
        ],
        sourceMap: '3:24:3:26;:16::27:1;:8::36;4::4:33',
      },
      source: fs.readFileSync(new URL('../valid-contract-files/p2pkh.cash', import.meta.url), { encoding: 'utf-8' }),
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
      abi: [{ name: 'hello', inputs: [{ name: 'pk', type: 'pubkey' }, { name: 's', type: 'sig' }] }],
      bytecode:
        // int myVariable = 10 - 4
        'OP_10 OP_4 OP_SUB '
        // int myOtherVariable = 20 + myVariable % 2
        + '14 OP_SWAP OP_2 OP_MOD OP_ADD '
        // require(myOtherVariable > x)
        + 'OP_LESSTHAN OP_VERIFY '
        // string hw = "Hello World"
        + '48656c6c6f20576f726c64 '
        // hw = hw + y
        + 'OP_DUP OP_ROT OP_CAT '
        // require(ripemd160(pk) == ripemd160(hw))
        + 'OP_2 OP_PICK OP_RIPEMD160 OP_SWAP OP_RIPEMD160 OP_EQUALVERIFY '
        // require(checkSig(s, pk))
        + 'OP_ROT OP_ROT OP_CHECKSIG '
        + 'OP_NIP',
      debug: {
        bytecode: '5a549401147c5297939f690b48656c6c6f20576f726c64767b7e5279a67ca6887b7bac77',
        logs: [],
        requires: [
          { ip: 11, line: 5 },
          { ip: 21, line: 10 },
          { ip: 25, line: 11 },
        ],
        sourceMap: '3:25:3:27;:30::31;:25:::1;4:30:4:32:0;:35::45;:48::49;:35:::1;:30;5:16:5:35;:8::37;7:20:7:33:0;8:13:8:15;:18::19;:13:::1;10:26:10:28:0;;:16::29:1;:43::45:0;:33::46:1;:8::48;11:25:11:26:0;:28::30;:8::33:1;2:4:12:5',
      },
      source: fs.readFileSync(new URL('../valid-contract-files/reassignment.cash', import.meta.url), { encoding: 'utf-8' }),
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
      abi: [{ name: 'hello', inputs: [{ name: 'a', type: 'int' }, { name: 'b', type: 'int' }] }],
      bytecode:
        // int d = a + b
        'OP_2OVER OP_ADD '
        // d = d - a
        + 'OP_DUP OP_4 OP_PICK OP_SUB '
        // if (d == x - 2) {
        + 'OP_DUP OP_3 OP_ROLL OP_2 OP_SUB OP_NUMEQUAL OP_IF '
        // int c = d + b
        + 'OP_DUP OP_5 OP_PICK OP_ADD '
        // d = a + c
        + 'OP_4 OP_PICK OP_OVER OP_ADD OP_ROT OP_DROP OP_SWAP '
        // require(c > d)
        + 'OP_2DUP OP_LESSTHAN OP_VERIFY '
        // } else {
        + 'OP_DROP OP_ELSE '
        // require(d == a) }
        + 'OP_DUP OP_4 OP_PICK OP_NUMEQUALVERIFY OP_ENDIF '
        // d = d + a
        + 'OP_DUP OP_4 OP_ROLL OP_ADD '
        // require(d == y)
        + 'OP_3 OP_ROLL OP_NUMEQUAL '
        + 'OP_NIP OP_NIP OP_NIP',
      debug: {
        bytecode: '70937654799476537a52949c6376557993547978937b757c6e9f6975677654799d6876547a93537a9c777777',
        logs: [],
        requires: [
          { ip: 28, line: 8 },
          { ip: 34, line: 10 },
          { ip: 43, line: 13 },
        ],
        sourceMap: '3:16:3:21;::::1;4:12:4:13:0;:16::17;;:12:::1;5::5:13:0;:17::18;;:21::22;:17:::1;:12;:24:9:9:0;6:20:6:21;:24::25;;:20:::1;7:16:7:17:0;;:20::21;:16:::1;:12::22;;;8:20:8:25:0;::::1;:12::27;5:24:9:9;9:15:11::0;10:20:10:21;:25::26;;:12::28:1;9:15:11:9;12:12:12:13:0;:16::17;;:12:::1;13:21:13:22:0;;:8::24:1;2:4:14:5;;',
      },
      source: fs.readFileSync(new URL('../valid-contract-files/if_statement.cash', import.meta.url), { encoding: 'utf-8' }),
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
        { name: 'transfer', inputs: [{ name: 'recipientSig', type: 'sig' }] },
        { name: 'timeout', inputs: [{ name: 'senderSig', type: 'sig' }] },
      ],
      bytecode:
        // function transfer
        'OP_3 OP_PICK OP_0 OP_NUMEQUAL OP_IF '
        // require(checkSig(recipientSig, recipient))
        + 'OP_4 OP_ROLL OP_ROT OP_CHECKSIG '
        + 'OP_NIP OP_NIP OP_NIP OP_ELSE '
        // function timeout
        + 'OP_3 OP_ROLL OP_1 OP_NUMEQUALVERIFY '
        // require(checkSig(senderSig, sender))
        + 'OP_3 OP_ROLL OP_SWAP OP_CHECKSIGVERIFY '
        // require(tx.time >= timeout)
        + 'OP_SWAP OP_CHECKLOCKTIMEVERIFY OP_2DROP OP_1 '
        + 'OP_ENDIF',
      debug: {
        bytecode: '5379009c63547a7bac77777767537a519d537a7cad7cb16d5168',
        logs: [],
        requires: [
          { ip: 12, line: 7 },
          { ip: 23, line: 11 },
          { ip: 25, line: 12 },
        ],
        sourceMap: '6:4:8:5;;;;;7:25:7:37;;:39::48;:8::51:1;6:4:8:5;;;;10::13::0;;;;11:25:11:34;;:36::42;:8::45:1;12:27:12:34:0;:8::36:1;10:4:13:5;;1:0:14:1',
      },
      source: fs.readFileSync(new URL('../valid-contract-files/multifunction.cash', import.meta.url), { encoding: 'utf-8' }),
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
        { name: 'transfer', inputs: [{ name: 'a', type: 'int' }, { name: 'b', type: 'int' }] },
        { name: 'timeout', inputs: [{ name: 'b', type: 'int' }] },
      ],
      bytecode:
        // function transfer
        'OP_2 OP_PICK OP_0 OP_NUMEQUAL OP_IF '
        // int d = a + b
        + 'OP_3 OP_PICK OP_5 OP_PICK OP_ADD '
        // d = d - a
        + 'OP_DUP OP_5 OP_PICK OP_SUB '
        // if (d == x) {
        + 'OP_DUP OP_3 OP_ROLL OP_NUMEQUAL OP_IF '
        // int c = d + b
        + 'OP_DUP OP_6 OP_PICK OP_ADD '
        // d = a + c
        + 'OP_5 OP_PICK OP_OVER OP_ADD OP_ROT OP_DROP OP_SWAP '
        // require(c > d)
        + 'OP_2DUP OP_LESSTHAN OP_VERIFY '
        // } else {
        + 'OP_DROP OP_ELSE '
        // d = a }
        + 'OP_4 OP_PICK OP_NIP OP_ENDIF '
        // d = d + a
        + 'OP_DUP OP_5 OP_ROLL OP_ADD '
        // require(d == y)
        + 'OP_3 OP_ROLL OP_NUMEQUALVERIFY '
        + 'OP_2DROP OP_2DROP OP_1 OP_ELSE '
        // function timeout
        + 'OP_ROT OP_1 OP_NUMEQUALVERIFY '
        // int d = b
        + 'OP_2 OP_PICK '
        // d = d + 2
        + 'OP_DUP OP_2 OP_ADD '
        // if (d == x) {
        + 'OP_DUP OP_3 OP_ROLL OP_NUMEQUAL OP_IF '
        // int c = d + b
        + 'OP_DUP OP_4 OP_PICK OP_ADD '
        // d = c + d
        + 'OP_2DUP OP_ADD OP_ROT OP_DROP OP_SWAP '
        // require(c > d) }
        + 'OP_2DUP OP_LESSTHAN OP_VERIFY '
        + 'OP_DROP OP_ENDIF '
        // d = b
        + ''
        // require(d == y)
        + 'OP_2SWAP OP_NUMEQUAL '
        + 'OP_NIP OP_NIP OP_ENDIF',
      debug: {
        bytecode: '5279009c6353795579937655799476537a9c6376567993557978937b757c6e9f6975675479776876557a93537a9d6d6d51677b519d527976529376537a9c63765479936e937b757c6e9f697568729c777768',
        logs: [],
        requires: [
          { ip: 34, line: 8 },
          { ip: 47, line: 13 },
          { ip: 76, line: 22 },
          { ip: 81, line: 25 },
        ],
        sourceMap: '2:4:14:5;;;;;3:16:3:17;;:20::21;;:16:::1;4:12:4:13:0;:16::17;;:12:::1;5::5:13:0;:17::18;;:12:::1;:20:9:9:0;6::6:21;:24::25;;:20:::1;7:16:7:17:0;;:20::21;:16:::1;:12::22;;;8:20:8:25:0;::::1;:12::27;5:20:9:9;9:15:11::0;10:16:10:17;;:12::18:1;9:15:11:9;12:12:12:13:0;:16::17;;:12:::1;13:21:13:22:0;;:8::24:1;2:4:14:5;;;;16::26::0;;;17:16:17:17;;18:12:18:13;:16::17;:12:::1;19::19:13:0;:17::18;;:12:::1;:20:23:9:0;20::20:21;:24::25;;:20:::1;21:16:21:21:0;::::1;:12::22;;;22:20:22:25:0;::::1;:12::27;19:20:23:9;;24:12:25:22:0;25:8::24:1;16:4:26:5;;1:0:27:1',
      },
      source: fs.readFileSync(new URL('../valid-contract-files/multifunction_if_statements.cash', import.meta.url), { encoding: 'utf-8' }),
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
      abi: [{ name: 'spend', inputs: [{ name: 's1', type: 'sig' }, { name: 's2', type: 'sig' }] }],
      bytecode:
        // require(checkMultiSig([s1, s2], [pk1, pk2, pk3]))
        'OP_0 OP_2ROT OP_SWAP OP_2 OP_2ROT OP_SWAP OP_6 OP_ROLL OP_3 OP_CHECKMULTISIG',
      debug: {
        bytecode: '00717c52717c567a53ae',
        logs: [],
        requires: [{ ip: 13, line: 3 }],
        sourceMap: '3:12:3:52;:27::33;;:26::34:1;:37::45:0;;:47::50;;:36::51:1;:4::54',
      },
      source: fs.readFileSync(new URL('../valid-contract-files/2_of_3_multisig.cash', import.meta.url), { encoding: 'utf-8' }),
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
      abi: [{ name: 'spend', inputs: [] }],
      bytecode:
        // bytes x = b.split(b.length / 2)[1]
        'OP_DUP OP_DUP OP_SIZE OP_NIP OP_2 OP_DIV OP_SPLIT OP_NIP '
        // require(x != b)
        + 'OP_2DUP OP_EQUAL OP_NOT OP_VERIFY '
        // bytes x = b.split(b.length / 2)[1]
        + 'OP_SWAP OP_4 OP_SPLIT OP_DROP OP_EQUAL OP_NOT',
      debug: {
        bytecode: '7676827752967f776e8791697c547f758791',
        logs: [],
        requires: [
          { ip: 12, line: 4 },
          { ip: 19, line: 5 },
        ],
        sourceMap: '3:18:3:27;;:26::34:1;;:37::38:0;:26:::1;:18::39;:::42;4:16:4:22:0;::::1;;:8::24;5:16:5:17:0;:24::25;:16::26:1;:::29;:::34;:8::36',
      },
      source: fs.readFileSync(new URL('../valid-contract-files/split_size.cash', import.meta.url), { encoding: 'utf-8' }),
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
      abi: [{ name: 'hello', inputs: [{ name: 'pk', type: 'pubkey' }, { name: 's', type: 'sig' }] }],
      bytecode:
        // require((ripemd160(bytes(pk)) == hash160(0x0) == !true));
        'OP_DUP OP_RIPEMD160 OP_0 OP_HASH160 OP_EQUAL OP_1 OP_NOT OP_EQUALVERIFY '
        // require(checkSig(s, pk));
        + 'OP_CHECKSIG',
      debug: {
        bytecode: '76a600a987519188ac',
        logs: [],
        requires: [
          { ip: 7, line: 3 },
          { ip: 9, line: 4 },
        ],
        sourceMap: '3:33:3:35;:17::37:1;:49::51:0;:41::52:1;:17;:57::61:0;:56:::1;:8::64;4::4:33',
      },
      source: fs.readFileSync(new URL('../valid-contract-files/cast_hash_checksig.cash', import.meta.url), { encoding: 'utf-8' }),
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
          inputs: [
            { name: 'ownerSig', type: 'sig' },
            { name: 'oracleSig', type: 'datasig' },
            { name: 'oracleMessage', type: 'bytes8' },
          ],
        },
      ],
      bytecode:
        // bytes4 blockHeightBin, bytes4 priceBin = oracleMessage.split(4);
        'OP_6 OP_PICK OP_4 OP_SPLIT '
        // int blockHeight = int(blockHeightBin);
        + 'OP_SWAP OP_BIN2NUM '
        // int price = int(priceBin);
        + 'OP_SWAP OP_BIN2NUM '
        // require(blockHeight >= minBlock);
        + 'OP_OVER OP_5 OP_ROLL OP_GREATERTHANOREQUAL OP_VERIFY '
        // require(tx.time >= blockHeight);
        + 'OP_SWAP OP_CHECKLOCKTIMEVERIFY OP_DROP '
        // require(price >= priceTarget);
        + 'OP_3 OP_ROLL OP_GREATERTHANOREQUAL OP_VERIFY '
        // require(checkDataSig(oracleSig, oracleMessage, oraclePk));
        + 'OP_3 OP_ROLL OP_4 OP_ROLL OP_3 OP_ROLL OP_CHECKDATASIGVERIFY '
        // require(checkSig(ownerSig, ownerPk));
        + 'OP_CHECKSIG',
      debug: {
        bytecode: '5679547f7c817c8178557aa2697cb175537aa269537a547a537abbac',
        logs: [],
        requires: [
          { ip: 16, line: 19 },
          { ip: 18, line: 20 },
          { ip: 23, line: 23 },
          { ip: 30, line: 26 },
          { ip: 32, line: 31 },
        ],
        sourceMap: '14:49:14:62;;:69::70;:49::71:1;15:30:15:44:0;:26::45:1;16:24:16:32:0;:20::33:1;19:16:19:27:0;:31::39;;:16:::1;:8::41;20:27:20:38:0;:8::40:1;;23:25:23:36:0;;:16:::1;:8::38;27:12:27:21:0;;28::28:25;;29::29:20;;26:8:30:11:1;31::31:45',
      },
      source: fs.readFileSync(new URL('../valid-contract-files/hodl_vault.cash', import.meta.url), { encoding: 'utf-8' }),
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
      abi: [{ name: 'hello', inputs: [] }],
      bytecode:
        // int a = 1; int b = 2; int c = 3; int d = 4; int e = 5; int f = 6;
        'OP_1 OP_2 OP_3 OP_4 OP_5 OP_6 '
        // if (a < 3) {
        + 'OP_5 OP_PICK OP_3 OP_LESSTHAN OP_IF '
        // a = 3 }
        + 'OP_3 OP_6 OP_ROLL OP_DROP OP_SWAP OP_TOALTSTACK OP_SWAP OP_TOALTSTACK OP_SWAP '
        + 'OP_TOALTSTACK OP_SWAP OP_TOALTSTACK OP_SWAP OP_FROMALTSTACK OP_FROMALTSTACK '
        + 'OP_FROMALTSTACK OP_FROMALTSTACK OP_ENDIF '
        // require(a > b + c + d + e + f);
        + 'OP_2ROT OP_5 OP_ROLL OP_ADD OP_4 OP_ROLL OP_ADD '
        + 'OP_3 OP_ROLL OP_ADD OP_ROT OP_ADD OP_GREATERTHAN',
      debug: {
        bytecode: '5152535455565579539f6353567a757c6b7c6b7c6b7c6b7c6c6c6c6c6871557a93547a93537a937b93a0',
        logs: [],
        requires: [{ ip: 42, line: 14 }],
        sourceMap: '3:16:3:17;4::4;5::5;6::6;7::7;8::8;10:12:10:13;;:16::17;:12:::1;:19:12:9:0;11:16:11:17;:12::18:1;;;;;;;;;;;;;;;;10:19:12:9;14:16:14:21:0;:24::25;;:20:::1;:28::29:0;;:20:::1;:32::33:0;;:20:::1;:36::37:0;:20:::1;:8::39',
      },
      source: fs.readFileSync(new URL('../valid-contract-files/deep_replace.cash', import.meta.url), { encoding: 'utf-8' }),
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
      abi: [{ name: 'spend', inputs: [{ name: 'b', type: 'bytes4' }, { name: 'i', type: 'int' }] }],
      bytecode: 'OP_SWAP OP_4 OP_NUM2BIN OP_EQUAL', // require(b == bytes4(i))
      debug: {
        bytecode: '7c548087',
        logs: [],
        requires: [{ ip: 4, line: 3 }],
        sourceMap: '3:28:3:29;:21::30:1;;:8::32',
      },
      source: fs.readFileSync(new URL('../valid-contract-files/bounded_bytes.cash', import.meta.url), { encoding: 'utf-8' }),
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
          type: 'int',
        },
      ],
      abi: [{ name: 'spend', inputs: [] }],
      bytecode:
        // require(tx.version == requiredVersion)
        'OP_TXVERSION OP_NUMEQUALVERIFY '
        // require(tx.bytecode == 0x00)
        + 'OP_ACTIVEBYTECODE 00 OP_EQUAL',
      debug: {
        bytecode: 'c29dc1010087',
        logs: [],
        requires: [
          { ip: 2, line: 3 },
          { ip: 6, line: 4 },
        ],
        sourceMap: '3:16:3:26;:8::47:1;4:16:4:35:0;:39::43;:8::45:1',
      },
      source: fs.readFileSync(new URL('../valid-contract-files/covenant.cash', import.meta.url), { encoding: 'utf-8' }),
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
      abi: [{ name: 'spend', inputs: [] }],
      bytecode:
        // require(tx.version == 2)
        'OP_TXVERSION OP_2 OP_NUMEQUALVERIFY '
        // require(tx.locktime == 0)
        + 'OP_TXLOCKTIME OP_0 OP_NUMEQUALVERIFY '
        // require(tx.inputs.length == 1)
        + 'OP_TXINPUTCOUNT OP_1 OP_NUMEQUALVERIFY '
        // require(tx.outputs.length == 1)
        + 'OP_TXOUTPUTCOUNT OP_1 OP_NUMEQUALVERIFY '
        // require(this.activeInputIndex == 0)
        + 'OP_INPUTINDEX OP_0 OP_NUMEQUALVERIFY '
        // require(this.activeBytecode.length == 300)
        + 'OP_ACTIVEBYTECODE OP_SIZE OP_NIP 2c01 OP_NUMEQUALVERIFY '
        // require(tx.inputs[0].value == 10000)
        + 'OP_0 OP_UTXOVALUE 1027 OP_NUMEQUALVERIFY '
        // require(tx.inputs[0].lockingBytecode.length == 10000)
        + 'OP_0 OP_UTXOBYTECODE OP_SIZE OP_NIP 1027 OP_NUMEQUALVERIFY '
        // require(tx.inputs[0].outpointTransactionHash == 0x00...00)
        + 'OP_0 OP_OUTPOINTTXHASH 0000000000000000000000000000000000000000000000000000000000000000 OP_EQUALVERIFY '
        // require(tx.inputs[0].outpointIndex == 0)
        + 'OP_0 OP_OUTPOINTINDEX OP_0 OP_NUMEQUALVERIFY '
        // require(tx.inputs[0].unlockingBytecode.length == 100)
        + 'OP_0 OP_INPUTBYTECODE OP_SIZE OP_NIP 64 OP_NUMEQUALVERIFY '
        // require(tx.inputs[0].sequenceNumber == 0)
        + 'OP_0 OP_INPUTSEQUENCENUMBER OP_0 OP_NUMEQUALVERIFY '
        // require(tx.outputs[0].value == 10000)
        + 'OP_0 OP_OUTPUTVALUE 1027 OP_NUMEQUALVERIFY '
        // require(tx.outputs[0].lockingBytecode.length == 100)
        + 'OP_0 OP_OUTPUTBYTECODE OP_SIZE OP_NIP 64 OP_NUMEQUALVERIFY '
        // require(tx.inputs[0].tokenCategory == 0x000000000000000000000000000000000000000000000000000000000000000)
        + 'OP_0 OP_UTXOTOKENCATEGORY 0000000000000000000000000000000000000000000000000000000000000000 OP_EQUALVERIFY '
        // require(tx.inputs[0].nftCommitment == 0x00);
        + 'OP_0 OP_UTXOTOKENCOMMITMENT 00 OP_EQUALVERIFY '
        // require(tx.inputs[0].tokenAmount == 100);
        + 'OP_0 OP_UTXOTOKENAMOUNT 64 OP_NUMEQUALVERIFY '
        // require(tx.outputs[0].tokenCategory == 0x000000000000000000000000000000000000000000000000000000000000000)
        + 'OP_0 OP_OUTPUTTOKENCATEGORY 0000000000000000000000000000000000000000000000000000000000000000 OP_EQUALVERIFY '
        // require(tx.outputs[0].nftCommitment == 0x00);
        + 'OP_0 OP_OUTPUTTOKENCOMMITMENT 00 OP_EQUALVERIFY '
        // require(tx.outputs[0].tokenAmount == 100);
        + 'OP_0 OP_OUTPUTTOKENAMOUNT 64 OP_NUMEQUAL',
      debug: {
        bytecode: 'c2529dc5009dc3519dc4519dc0009dc18277022c019d00c60210279d00c782770210279d00c82000000000000000000000000000000000000000000000000000000000000000008800c9009d00ca827701649d00cb009d00cc0210279d00cd827701649d00ce2000000000000000000000000000000000000000000000000000000000000000008800cf01008800d001649d00d12000000000000000000000000000000000000000000000000000000000000000008800d201008800d301649c',
        logs: [],
        requires: [
          { ip: 2, line: 3 },
          { ip: 5, line: 4 },
          { ip: 8, line: 5 },
          { ip: 11, line: 6 },
          { ip: 14, line: 7 },
          { ip: 19, line: 8 },
          { ip: 23, line: 9 },
          { ip: 29, line: 10 },
          { ip: 33, line: 11 },
          { ip: 37, line: 12 },
          { ip: 43, line: 13 },
          { ip: 47, line: 14 },
          { ip: 51, line: 15 },
          { ip: 57, line: 16 },
          { ip: 61, line: 17 },
          { ip: 65, line: 18 },
          { ip: 69, line: 19 },
          { ip: 73, line: 20 },
          { ip: 77, line: 21 },
          { ip: 82, line: 22 },
        ],
        sourceMap: '3:16:3:26;:30::31;:8::33:1;4:16:4:27:0;:31::32;:8::34:1;5:16:5:32:0;:36::37;:8::39:1;6:16:6:33:0;:37::38;:8::40:1;7:16:7:37:0;:41::42;:8::44:1;8:16:8:35:0;:::42:1;;:46::49:0;:8::51:1;9:26:9:27:0;:16::34:1;:38::43:0;:8::45:1;10:26:10:27:0;:16::44:1;:::51;;:55::60:0;:8::62:1;11:26:11:27:0;:16::52:1;:56::121:0;:8::123:1;12:26:12:27:0;:16::42:1;:46::47:0;:8::49:1;13:26:13:27:0;:16::46:1;:::53;;:57::60:0;:8::62:1;14:26:14:27:0;:16::43:1;:47::48:0;:8::50:1;15:27:15:28:0;:16::35:1;:39::44:0;:8::46:1;16:27:16:28:0;:16::45:1;:::52;;:56::59:0;:8::61:1;17:26:17:27:0;:16::42:1;:46::111:0;:8::113:1;18:26:18:27:0;:16::42:1;:46::50:0;:8::52:1;19:26:19:27:0;:16::40:1;:44::47:0;:8::49:1;20:27:20:28:0;:16::43:1;:47::112:0;:8::114:1;21:27:21:28:0;:16::43:1;:47::51:0;:8::53:1;22:27:22:28:0;:16::41:1;:45::48:0;:8::50:1',
      },
      source: fs.readFileSync(new URL('../valid-contract-files/covenant_all_fields.cash', import.meta.url), { encoding: 'utf-8' }),
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
        { name: 'receive', inputs: [] },
        { name: 'reclaim', inputs: [{ name: 'pk', type: 'pubkey' }, { name: 's', type: 'sig' }] },
      ],
      bytecode:
        // function receive
        'OP_4 OP_PICK OP_0 OP_NUMEQUAL OP_IF '
        // require(this.age >= period)
        + 'OP_3 OP_ROLL OP_CHECKSEQUENCEVERIFY OP_DROP '
        // require(tx.outputs[0].lockingBytecode == new LockingBytecodeP2PKH(recipient))
        + 'OP_0 OP_OUTPUTBYTECODE 76a914 OP_ROT OP_CAT 88ac OP_CAT OP_EQUALVERIFY '
        // int minerFee = 1000
        + 'e803 '
        // int currentValue = tx.inputs[this.activeInputIndex].value
        + 'OP_INPUTINDEX OP_UTXOVALUE '
        // int changeValue = currentValue - pledge - minerFee
        + 'OP_DUP OP_4 OP_PICK OP_SUB OP_2 OP_PICK OP_SUB '
        // if (changeValue <= pledge + minerFee) {
        + 'OP_DUP OP_5 OP_PICK OP_4 OP_PICK OP_ADD OP_LESSTHANOREQUAL OP_IF '
        // require(tx.outputs[0].value == currentValue - minerFee)
        + 'OP_0 OP_OUTPUTVALUE OP_2OVER OP_SWAP OP_SUB OP_NUMEQUALVERIFY '
        // } else {
        + 'OP_ELSE '
        // require(tx.outputs[0].value == pledge)
        + 'OP_0 OP_OUTPUTVALUE OP_5 OP_PICK OP_NUMEQUALVERIFY '
        // require(
        //   tx.outputs[1].lockingBytecode == tx.inputs[this.activeInputIndex].lockingBytecode
        // )
        + 'OP_1 OP_OUTPUTBYTECODE OP_INPUTINDEX OP_UTXOBYTECODE OP_EQUALVERIFY '
        // require(tx.outputs[1].value == changeValue) }
        + 'OP_1 OP_OUTPUTVALUE OP_OVER OP_NUMEQUALVERIFY '
        // Cleanup
        + 'OP_ENDIF OP_2DROP OP_2DROP OP_2DROP OP_1 OP_ELSE '
        // function reclaim
        + 'OP_4 OP_ROLL OP_1 OP_NUMEQUALVERIFY '
        // require(hash160(pk) == funder)
        + 'OP_4 OP_PICK OP_HASH160 OP_ROT OP_EQUALVERIFY '
        // require(checkSig(s, pk))
        + 'OP_4 OP_ROLL OP_4 OP_ROLL OP_CHECKSIG '
        // Cleanup
        + 'OP_NIP OP_NIP OP_NIP OP_ENDIF',
      debug: {
        bytecode: '5479009c63537ab27500cd0376a9147b7e0288ac7e8802e803c0c676547994527994765579547993a16300cc707c949d6700cc55799d51cdc0c78851cc789d686d6d6d5167547a519d5479a97b88547a547aac77777768',
        logs: [],
        requires: [
          { ip: 11, line: 3 },
          { ip: 20, line: 6 },
          { ip: 44, line: 15 },
          { ip: 50, line: 17 },
          { ip: 55, line: 18 },
          { ip: 59, line: 19 },
          { ip: 74, line: 24 },
          { ip: 80, line: 25 },
        ],
        sourceMap: '2:4:21:5;;;;;3:28:3:34;;:8::36:1;;6:27:6:28:0;:16::45:1;:49::84:0;:74::83;:49::84:1;;;:8::86;8:23:8:27:0;9:37:9:58;:27::65:1;10:26:10:38:0;:41::47;;:26:::1;:50::58:0;;:26:::1;14:12:14:23:0;:27::33;;:36::44;;:27:::1;:12;:46:16:9:0;15:31:15:32;:20::39:1;:43::66:0;;::::1;:12::68;16:15:20:9:0;17:31:17:32;:20::39:1;:43::49:0;;:12::51:1;18:31:18:32:0;:20::49:1;:63::84:0;:53::101:1;:12::103;19:31:19:32:0;:20::39:1;:43::54:0;:12::56:1;16:15:20:9;2:4:21:5;;;;;23::26::0;;;;24:24:24:26;;:16::27:1;:31::37:0;:8::39:1;25:25:25:26:0;;:28::30;;:8::33:1;23:4:26:5;;;1:0:27:1',
      },
      source: fs.readFileSync(new URL('../valid-contract-files/mecenas.cash', import.meta.url), { encoding: 'utf-8' }),
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
      abi: [{ name: 'announce', inputs: [] }],
      bytecode:
        // bytes announcement = new LockingBytecodeNullData(...)
        '6a 6d02 OP_SIZE OP_SWAP OP_CAT OP_CAT '
        + '4120636f6e7472616374206d6179206e6f7420696e6a75726520612068756d616e20626'
        + '5696e67206f722c207468726f75676820696e616374696f6e2c20616c6c6f77206120687'
        + '56d616e206265696e6720746f20636f6d6520746f206861726d2e '
        + 'OP_SIZE OP_DUP 4b OP_GREATERTHAN OP_IF 4c OP_SWAP OP_CAT OP_ENDIF OP_SWAP OP_CAT OP_CAT '
        // require(tx.outputs[0].value == 0)
        + 'OP_0 OP_OUTPUTVALUE OP_0 OP_NUMEQUALVERIFY '
        // require(tx.outputs[0].lockingBytecode == announcement)
        + 'OP_0 OP_OUTPUTBYTECODE OP_EQUALVERIFY '
        // int minerFee = 1000
        + 'e803 '
        // int changeAmount = tx.inputs[this.activeInputIndex].value - minerFee
        + 'OP_INPUTINDEX OP_UTXOVALUE OP_OVER OP_SUB '
        // if (changeAmount >= minerFee)
        + 'OP_DUP OP_ROT OP_GREATERTHANOREQUAL OP_IF '
        // require(
        //  tx.outputs[1].lockingBytecode == tx.inputs[this.activeInputIndex].lockingBytecode
        // )
        + 'OP_1 OP_OUTPUTBYTECODE OP_INPUTINDEX OP_UTXOBYTECODE OP_EQUALVERIFY '
        // require(tx.outputs[1].value == changeAmount) }
        + 'OP_1 OP_OUTPUTVALUE OP_OVER OP_NUMEQUALVERIFY OP_ENDIF '
        // Stack clean-up
        + 'OP_DROP OP_1',
      debug: {
        bytecode: '016a026d02827c7e7e4c624120636f6e7472616374206d6179206e6f7420696e6a75726520612068756d616e206265696e67206f722c207468726f75676820696e616374696f6e2c20616c6c6f7720612068756d616e206265696e6720746f20636f6d6520746f206861726d2e8276014ba063014c7c7e687c7e7e00cc009d00cd8802e803c0c67894767ba26351cdc0c78851cc789d687551',
        logs: [],
        requires: [
          { ip: 22, line: 16 },
          { ip: 25, line: 17 },
          { ip: 39, line: 24 },
          { ip: 43, line: 25 },
        ],
        sourceMap: '10:29:13:10;11:12:11:18;::::1;;;;12:18:12:118:0;:12::119:1;;;;;;;;;;;;16:27:16:28:0;:16::35:1;:39::40:0;:8::42:1;17:27:17:28:0;:16::45:1;:8::63;21:23:21:27:0;22:37:22:58;:27::65:1;:68::76:0;:27:::1;23:12:23:24:0;:28::36;:12:::1;:38:26:9:0;24:31:24:32;:20::49:1;:63::84:0;:53::101:1;:12::103;25:31:25:32:0;:20::39:1;:43::55:0;:12::57:1;23:38:26:9;8:4:27:5;',
      },
      source: fs.readFileSync(new URL('../valid-contract-files/announcement.cash', import.meta.url), { encoding: 'utf-8' }),
      compiler: {
        name: 'cashc',
        version,
      },
      updatedAt: '',
    },
  },
  {
    fn: 'p2palindrome.cash',
    artifact: {
      contractName: 'P2Palindrome',
      constructorInputs: [],
      abi: [
        { name: 'spend', inputs: [{ name: 'palindrome', type: 'string' }] },
      ],
      bytecode: 'OP_DUP OP_REVERSEBYTES OP_EQUAL',
      debug: {
        bytecode: '76bc87',
        logs: [],
        requires: [{ ip: 3, line: 3 }],
        sourceMap: '3:16:3:26;:::36:1;:8::52',
      },
      source: fs.readFileSync(new URL('../valid-contract-files/p2palindrome.cash', import.meta.url), { encoding: 'utf-8' }),
      compiler: {
        name: 'cashc',
        version,
      },
      updatedAt: '',
    },
  },
  {
    fn: 'num2bin_variable.cash',
    artifact: {
      contractName: 'Num2Bin',
      constructorInputs: [],
      abi: [
        { name: 'spend', inputs: [{ name: 'size', type: 'int' }] },
      ],
      bytecode: 'OP_10 OP_SWAP OP_NUM2BIN OP_BIN2NUM OP_10 OP_NUMEQUAL',
      debug: {
        bytecode: '5a7c80815a9c',
        logs: [],
        requires: [{ ip: 6, line: 4 }],
        sourceMap: '3:28:3:30;:32::36;:22::37:1;4:16:4:26;:30::32:0;:8::34:1',
      },
      source: fs.readFileSync(new URL('../valid-contract-files/num2bin_variable.cash', import.meta.url), { encoding: 'utf-8' }),
      compiler: {
        name: 'cashc',
        version,
      },
      updatedAt: '',
    },
  },
  {
    fn: 'debug_messages.cash',
    artifact: {
      contractName: 'DebugMessages',
      constructorInputs: [],
      abi: [
        { name: 'spend', inputs: [{ name: 'value', type: 'int' }] },
      ],
      bytecode: 'OP_DUP OP_1 OP_NUMEQUALVERIFY OP_1ADD OP_2 OP_NUMEQUAL',
      debug: {
        bytecode: '76519d8b529c',
        logs: [
          { data: [{ stackIndex: 0, type: 'int', ip: 3 }, 'test'], ip: 3, line: 4 },
          { data: [{ stackIndex: 0, type: 'int', ip: 3 }, 'test2'], ip: 3, line: 5 },
        ],
        requires: [{ ip: 2, line: 3, message: 'Wrong value passed' }, { ip: 6, line: 6, message: 'Sum doesn\'t work' }],
        sourceMap: '3:12:3:17;:21::22;:4::46:1;6:12:6:21;:25::26:0;:4::48:1',
      },
      source: fs.readFileSync(new URL('../valid-contract-files/debug_messages.cash', import.meta.url), { encoding: 'utf-8' }),
      compiler: {
        name: 'cashc',
        version,
      },
      updatedAt: '',
    },
  },
  {
    fn: 'integer_formatting.cash',
    artifact: {
      contractName: 'IntegerFormatting',
      constructorInputs: [],
      abi: [
        { name: 'test', inputs: [] },
      ],
      bytecode: '0010a5d4e800 0010a5d4e800 0010a5d4e800 0010a5d4e800 0010a5d4e800 OP_4 OP_ROLL OP_OVER OP_NUMEQUALVERIFY OP_3 OP_ROLL OP_OVER OP_NUMEQUALVERIFY OP_ROT OP_OVER OP_NUMEQUALVERIFY OP_NUMEQUAL',
      debug: {
        bytecode: '060010a5d4e800060010a5d4e800060010a5d4e800060010a5d4e800060010a5d4e800547a789d537a789d7b789d9c',
        logs: [],
        requires: [{ ip: 8, line: 10 }, { ip: 12, line: 11 }, { ip: 15, line: 12 }, { ip: 17, line: 13 }],
        sourceMap: '3:26:3:30;4::4;5::5:43;6:23:6:30;8:22:8:35;10:16:10:27;;:31::38;:8::40:1;11:16:11:27:0;;:31::38;:8::40:1;12:16:12:27:0;:31::38;:8::40:1;13::13:37',
      },
      source: fs.readFileSync(new URL('../valid-contract-files/integer_formatting.cash', import.meta.url), { encoding: 'utf-8' }),
      compiler: {
        name: 'cashc',
        version,
      },
      updatedAt: '',
    },
  },
  {
    fn: 'multiline_statements.cash',
    artifact: {
      contractName: 'MultilineStatements',
      constructorInputs: [{ name: 'x', type: 'int' }, { name: 'y', type: 'string' }],
      abi: [{ name: 'spend', inputs: [{ name: 'a', type: 'int' }, { name: 'b', type: 'string' }] }],
      bytecode: 'OP_ROT OP_SWAP OP_2 OP_SUB OP_NUMEQUAL OP_2 OP_PICK OP_2 OP_PICK OP_EQUAL OP_BOOLAND OP_IF OP_0 OP_VERIFY OP_ELSE OP_OVER 48656c6c6f20 OP_2 OP_PICK OP_CAT OP_EQUAL OP_IF OP_DUP 576f726c64 OP_EQUALVERIFY OP_ELSE OP_1 OP_0 OP_NOT OP_NOT OP_NOT OP_EQUALVERIFY OP_ENDIF OP_ENDIF OP_2DROP OP_1',
      debug: {
        bytecode: '7b7c52949c52795279879a63006967780648656c6c6f2052797e87637605576f726c64886751009191918868686d51',
        logs: [],
        requires: [
          { ip: 15, line: 11 },
          { ip: 26, line: 14 },
          { ip: 33, line: 18 },
        ],
        sourceMap: '9:12:9:13;:17::18;:21::22;:17:::1;:12;10::10:13:0;;:17::18;;:12:::1;9;10:20:12:9:0;11::11:25;:12::27:1;12:15:19:9:0;:19:12:20;:24::32;13:10:13:11;;12:24:::1;:19;13:13:17:9:0;15:16:15:17;:21::28;14:12:16:14:1;17:15:19:9:0;18:20:18:24;:31::36;:30:::1;:29;:28;:12::38;17:15:19:9;12;5:4:20:5;',
      },
      source: fs.readFileSync(new URL('../valid-contract-files/multiline_statements.cash', import.meta.url), { encoding: 'utf-8' }),
      compiler: {
        name: 'cashc',
        version,
      },
      updatedAt: '',
    },
  },
  {
    fn: 'log_intermediate_results.cash',
    artifact: {
      contractName: 'LogIntermediateResults',
      constructorInputs: [{ name: 'owner', type: 'pubkey' }],
      abi: [{ name: 'test_log_intermediate_result', inputs: [] }],
      bytecode: 'OP_HASH256 OP_SIZE OP_NIP 20 OP_NUMEQUAL',
      debug: {
        bytecode: 'aa827701209c',
        sourceMap: '3:29:5:47:1;6:16:6:33;;:37::39:0;:8::74:1',
        logs: [
          {
            ip: 1,
            line: 4,
            data: [
              {
                stackIndex: 0,
                type: 'bytes32',
                ip: 1,
                transformations: 'OP_SHA256',
              },
            ],
          },
        ],
        requires: [
          {
            ip: 6,
            line: 6,
            message: 'doubleHash should be 32 bytes',
          },
        ],
      },
      source: fs.readFileSync(new URL('../valid-contract-files/log_intermediate_results.cash', import.meta.url), { encoding: 'utf-8' }),
      compiler: {
        name: 'cashc',
        version,
      },
      updatedAt: '',
    },
  },
  {
    fn: 'double_split.cash',
    artifact: {
      contractName: 'DoubleSplit',
      constructorInputs: [{ name: 'pkh', type: 'bytes20' }],
      abi: [{ name: 'spend', inputs: [] }],
      bytecode: 'OP_INPUTINDEX OP_UTXOBYTECODE 17 OP_SPLIT OP_DROP OP_3 OP_SPLIT OP_NIP OP_EQUAL',
      debug: {
        bytecode: 'c0c701177f75537f7787',
        sourceMap: '3:36:3:57;:26::74:1;:81::83:0;:26::84:1;:::87;:94::95:0;:26::96:1;:::99;4:8:4:34',
        logs: [],
        requires: [
          {
            ip: 10,
            line: 4,
          },
        ],
      },
      source: fs.readFileSync(new URL('../valid-contract-files/double_split.cash', import.meta.url), { encoding: 'utf-8' }),
      compiler: {
        name: 'cashc',
        version,
      },
      updatedAt: '',
    },
  },
  {
    fn: 'slice.cash',
    artifact: {
      contractName: 'Slice',
      constructorInputs: [{ name: 'pkh', type: 'bytes20' }],
      abi: [{ name: 'spend', inputs: [] }],
      bytecode: 'OP_INPUTINDEX OP_UTXOBYTECODE 17 OP_SPLIT OP_DROP OP_3 OP_SPLIT OP_NIP OP_EQUAL',
      debug: {
        bytecode: 'c0c701177f75537f7787',
        sourceMap: '3:36:3:57;:26::74:1;:84::86:0;:26::87:1;;:81::82:0;:26::87:1;;4:8:4:34',
        logs: [],
        requires: [
          {
            ip: 10,
            line: 4,
            message: undefined,
          },
        ],
      },
      source: fs.readFileSync(new URL('../valid-contract-files/slice.cash', import.meta.url), { encoding: 'utf-8' }),
      compiler: {
        name: 'cashc',
        version,
      },
      updatedAt: '',
    },
  },
];
