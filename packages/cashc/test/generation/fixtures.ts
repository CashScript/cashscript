import { Artifact, CompilerOptions } from '@cashscript/utils';
import fs from 'fs';
import { URL } from 'url';
import { version } from '../../src/index.js';

interface Fixture {
  fn: string,
  artifact: Artifact,
  compilerOptions?: CompilerOptions,
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
        options: {
          enforceFunctionParameterTypes: true,
          enforceLocktimeGuard: true,
        },
      },
      updatedAt: '',
      fingerprint: '07f5c2c2cf10439f063f3b92b9420b110614fb57b5c5015120bfca2688fedcc7',
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
        sourceMap: '3:25:3:27;:30::31;:25:::1;4:30:4:32:0;:35::45;:48::49;:35:::1;:30;5:16:5:35;:8::37;7:20:7:33:0;8:13:8:15;:18::19;:13:::1;10:26:10:28:0;;:16::29:1;:43::45:0;:33::46:1;:8::48;11:25:11:26:0;:28::30;:8::33:1;2:37:12:5',
        sourceTags: '23:23:sc',
      },
      source: fs.readFileSync(new URL('../valid-contract-files/reassignment.cash', import.meta.url), { encoding: 'utf-8' }),
      compiler: {
        name: 'cashc',
        version,
        options: {
          enforceFunctionParameterTypes: true,
          enforceLocktimeGuard: true,
        },
      },
      updatedAt: '',
      fingerprint: '7dfcd01f0ecb5e1dec3d2fb363b5af79eb84a15395e1b57fe9c383cb3861d634',
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
        sourceMap: '3:16:3:21;::::1;4:12:4:13:0;:16::17;;:12:::1;5::5:13:0;:17::18;;:21::22;:17:::1;:12;:24:9:9:0;6:20:6:21;:24::25;;:20:::1;7:16:7:17:0;;:20::21;:16:::1;:12::22;;;8:20:8:25:0;::::1;:12::27;5:24:9:9;9:15:11::0;10:20:10:21;:25::26;;:12::28:1;9:15:11:9;12:12:12:13:0;:16::17;;:12:::1;13:21:13:22:0;;:8::24:1;2:33:14:5;;',
        sourceTags: '27:27:sc;41:43:sc',
      },
      source: fs.readFileSync(new URL('../valid-contract-files/if_statement.cash', import.meta.url), { encoding: 'utf-8' }),
      compiler: {
        name: 'cashc',
        version,
        options: {
          enforceFunctionParameterTypes: true,
          enforceLocktimeGuard: true,
        },
      },
      updatedAt: '',
      fingerprint: 'b5f6c8b6bd5a7e4bfa2a596b5639fac59338e9cbf93673abc8c32fd4565f2846',
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
        sourceMap: '6:4:8:5;;;;;7:25:7:37;;:39::48;:8::51:1;6:40:8:5;;;:4;10::13::0;;;;11:25:11:34;;:36::42;:8::45:1;12:27:12:34:0;:8::36:1;10:36:13:5;;1:0:14:1',
        sourceTags: '9:11:sc',
      },
      source: fs.readFileSync(new URL('../valid-contract-files/multifunction.cash', import.meta.url), { encoding: 'utf-8' }),
      compiler: {
        name: 'cashc',
        version,
        options: {
          enforceFunctionParameterTypes: true,
          enforceLocktimeGuard: true,
        },
      },
      updatedAt: '',
      fingerprint: '4367893ec13aecfe4624b6d5b12681b9782de30dd657d1313eed269faba937e4',
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
        // if (d == x && bool(x)) {
        + 'OP_DUP OP_3 OP_PICK OP_NUMEQUAL OP_3 OP_ROLL OP_0NOTEQUAL OP_BOOLAND OP_IF '
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
        bytecode: '5279009c635379557993765579947653799c537a929a6376567993557978937b757c6e9f6975675479776876557a93537a9d6d6d51677b519d527976529376537a9c63765479936e937b757c6e9f697568729c777768',
        logs: [],
        requires: [
          { ip: 38, line: 8 },
          { ip: 51, line: 13 },
          { ip: 80, line: 22 },
          { ip: 85, line: 25 },
        ],
        sourceMap: '2:4:14:5;;;;;3:16:3:17;;:20::21;;:16:::1;4:12:4:13:0;:16::17;;:12:::1;5::5:13:0;:17::18;;:12:::1;:27::28:0;;:22::29:1;:12;:31:9:9:0;6:20:6:21;:24::25;;:20:::1;7:16:7:17:0;;:20::21;:16:::1;:12::22;;;8:20:8:25:0;::::1;:12::27;5:31:9:9;9:15:11::0;10:16:10:17;;:12::18:1;9:15:11:9;12:12:12:13:0;:16::17;;:12:::1;13:21:13:22:0;;:8::24:1;2:36:14:5;;;:4;16::26::0;;;17:16:17:17;;18:12:18:13;:16::17;:12:::1;19::19:13:0;:17::18;;:12:::1;:20:23:9:0;20::20:21;:24::25;;:20:::1;21:16:21:21:0;::::1;:12::22;;;22:20:22:25:0;::::1;:12::27;19:20:23:9;;24:12:25:22:0;25:8::24:1;16:28:26:5;;1:0:27:1',
        sourceTags: '37:37:sc;79:79:sc;83:84:sc',
      },
      source: fs.readFileSync(new URL('../valid-contract-files/multifunction_if_statements.cash', import.meta.url), { encoding: 'utf-8' }),
      compiler: {
        name: 'cashc',
        version,
        options: {
          enforceFunctionParameterTypes: true,
          enforceLocktimeGuard: true,
        },
      },
      updatedAt: '',
      fingerprint: 'f57b39c9be272a31d1aedd678087b7dd327095fde647570149d237fb34401469',
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
        options: {
          enforceFunctionParameterTypes: true,
          enforceLocktimeGuard: true,
        },
      },
      updatedAt: '',
      fingerprint: 'd06a42627510906395fa927195c1aa420b9adf7da407d71b793fc5d550b57a39',
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
        options: {
          enforceFunctionParameterTypes: true,
          enforceLocktimeGuard: true,
        },
      },
      updatedAt: '',
      fingerprint: '49d50376d8aa76534f29c049b987238d577ce332202a2f0da0cb74d94a027b79',
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
        'OP_DUP OP_RIPEMD160 OP_0 OP_HASH160 OP_EQUAL OP_1 OP_NOT OP_NUMEQUALVERIFY '
        // require(checkSig(s, pk));
        + 'OP_CHECKSIG',
      debug: {
        bytecode: '76a600a98751919dac',
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
        options: {
          enforceFunctionParameterTypes: true,
          enforceLocktimeGuard: true,
        },
      },
      updatedAt: '',
      fingerprint: 'bbf25f5a4cfbc9380707afca6d1f14a29c7971f589949d284859225508f4bad6',
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
        // Implicit type enforcement for oracleMessage: require(oracleMessage.length == 8)
        'OP_6 OP_ROLL OP_SIZE OP_8 OP_EQUALVERIFY '
        // bytes4 blockHeightBin, bytes4 priceBin = oracleMessage.split(4);
        + 'OP_DUP OP_4 OP_SPLIT '
        // int blockHeight = int(blockHeightBin);
        + 'OP_SWAP OP_BIN2NUM '
        // int price = int(priceBin);
        + 'OP_SWAP OP_BIN2NUM '
        // require(blockHeight >= minBlock);
        + 'OP_OVER OP_6 OP_ROLL OP_GREATERTHANOREQUAL OP_VERIFY '
        // require(tx.time >= blockHeight);
        + 'OP_SWAP OP_CHECKLOCKTIMEVERIFY OP_DROP '
        // require(price >= priceTarget);
        + 'OP_4 OP_ROLL OP_GREATERTHANOREQUAL OP_VERIFY '
        // require(checkDataSig(oracleSig, oracleMessage, oraclePk));
        + 'OP_4 OP_ROLL OP_SWAP OP_3 OP_ROLL OP_CHECKDATASIGVERIFY '
        // require(checkSig(ownerSig, ownerPk));
        + 'OP_CHECKSIG',
      debug: {
        bytecode: '567a82588876547f7c817c8178567aa2697cb175547aa269547a7c537abbac',
        logs: [],
        requires: [
          { ip: 20, line: 23 },
          { ip: 22, line: 24 },
          { ip: 27, line: 27 },
          { ip: 33, line: 30 },
          { ip: 35, line: 35 },
        ],
        sourceMap: '15:8:15:28;;;;;18:49:18:62;:69::70;:49::71:1;19:30:19:44:0;:26::45:1;20:24:20:32:0;:20::33:1;23:16:23:27:0;:31::39;;:16:::1;:8::41;24:27:24:38:0;:8::40:1;;27:25:27:36:0;;:16:::1;:8::38;31:12:31:21:0;;32::32:25;33::33:20;;30:8:34:11:1;35::35:45',
        sourceTags: '0:4:pv',
      },
      source: fs.readFileSync(new URL('../valid-contract-files/hodl_vault.cash', import.meta.url), { encoding: 'utf-8' }),
      compiler: {
        name: 'cashc',
        version,
        options: {
          enforceFunctionParameterTypes: true,
          enforceLocktimeGuard: true,
        },
      },
      updatedAt: '',
      fingerprint: 'd87449bc71344f12ed3c9ce3f69f844cd1699df29553ec3884c1fcc92a2cfccf',
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
        options: {
          enforceFunctionParameterTypes: true,
          enforceLocktimeGuard: true,
        },
      },
      updatedAt: '',
      fingerprint: '5ec5f2a100dc5c29c95f58ed51e4da469b74e5932b070e38f3c30c3405f40005',
    },
  },
  {
    fn: 'bounded_bytes.cash',
    artifact: {
      contractName: 'BoundedBytes',
      constructorInputs: [],
      abi: [{ name: 'spend', inputs: [{ name: 'b', type: 'bytes4' }, { name: 'i', type: 'int' }] }],
      bytecode:
        // Implicit type enforcement for b: require(b.length == 4)
        'OP_SIZE OP_4 OP_EQUALVERIFY '
        // require(b == toPaddedBytes(i, 4))
        + 'OP_SWAP OP_4 OP_NUM2BIN OP_EQUAL',
      debug: {
        bytecode: '8254887c548087',
        logs: [],
        requires: [{ ip: 7, line: 3 }],
        sourceMap: '2:19:2:27;;;3:35:3:36;:38::39;:21::40:1;:8::42',
        sourceTags: '0:2:pv',
      },
      source: fs.readFileSync(new URL('../valid-contract-files/bounded_bytes.cash', import.meta.url), { encoding: 'utf-8' }),
      compiler: {
        name: 'cashc',
        version,
        options: {
          enforceFunctionParameterTypes: true,
          enforceLocktimeGuard: true,
        },
      },
      updatedAt: '',
      fingerprint: 'b6381ead9be56fd0f9aa43b986ae8c3ba6aae2276596cdbd8268628397391064',
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
        options: {
          enforceFunctionParameterTypes: true,
          enforceLocktimeGuard: true,
        },
      },
      updatedAt: '',
      fingerprint: '1fd180f7d78e9670d7b2ae95e7af1f7cc533fc42c3cfdc7872619ec5810487d2',
    },
  },
  {
    fn: 'covenant_all_fields.cash',
    artifact: {
      contractName: 'Covenant',
      constructorInputs: [],
      abi: [{ name: 'spend', inputs: [] }],
      bytecode:
        // injected by InjectLocktimeGuardTraversal because tx.locktime is used
        'OP_TXLOCKTIME OP_CHECKLOCKTIMEVERIFY OP_DROP '
        // require(tx.version == 2)
        + 'OP_TXVERSION OP_2 OP_NUMEQUALVERIFY '
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
        bytecode: 'c5b175c2529dc5009dc3519dc4519dc0009dc18277022c019d00c60210279d00c782770210279d00c82000000000000000000000000000000000000000000000000000000000000000008800c9009d00ca827701649d00cb009d00cc0210279d00cd827701649d00ce2000000000000000000000000000000000000000000000000000000000000000008800cf01008800d001649d00d12000000000000000000000000000000000000000000000000000000000000000008800d201008800d301649c',
        logs: [],
        requires: [
          {
            ip: 1,
            line: 2,
            message: 'Using tx.locktime requires a non-final sequence number on the spending input',
          },
          { ip: 5, line: 3 },
          { ip: 8, line: 4 },
          { ip: 11, line: 5 },
          { ip: 14, line: 6 },
          { ip: 17, line: 7 },
          { ip: 22, line: 8 },
          { ip: 26, line: 9 },
          { ip: 32, line: 10 },
          { ip: 36, line: 11 },
          { ip: 40, line: 12 },
          { ip: 46, line: 13 },
          { ip: 50, line: 14 },
          { ip: 54, line: 15 },
          { ip: 60, line: 16 },
          { ip: 64, line: 17 },
          { ip: 68, line: 18 },
          { ip: 72, line: 19 },
          { ip: 76, line: 20 },
          { ip: 80, line: 21 },
          { ip: 85, line: 22 },
        ],
        sourceMap: '2:21:2:21;::::1;;3:16:3:26:0;:30::31;:8::33:1;4:16:4:27:0;:31::32;:8::34:1;5:16:5:32:0;:36::37;:8::39:1;6:16:6:33:0;:37::38;:8::40:1;7:16:7:37:0;:41::42;:8::44:1;8:16:8:35:0;:::42:1;;:46::49:0;:8::51:1;9:26:9:27:0;:16::34:1;:38::43:0;:8::45:1;10:26:10:27:0;:16::44:1;:::51;;:55::60:0;:8::62:1;11:26:11:27:0;:16::52:1;:56::121:0;:8::123:1;12:26:12:27:0;:16::42:1;:46::47:0;:8::49:1;13:26:13:27:0;:16::46:1;:::53;;:57::60:0;:8::62:1;14:26:14:27:0;:16::43:1;:47::48:0;:8::50:1;15:27:15:28:0;:16::35:1;:39::44:0;:8::46:1;16:27:16:28:0;:16::45:1;:::52;;:56::59:0;:8::61:1;17:26:17:27:0;:16::42:1;:46::111:0;:8::113:1;18:26:18:27:0;:16::42:1;:46::50:0;:8::52:1;19:26:19:27:0;:16::40:1;:44::47:0;:8::49:1;20:27:20:28:0;:16::43:1;:47::112:0;:8::114:1;21:27:21:28:0;:16::43:1;:47::51:0;:8::53:1;22:27:22:28:0;:16::41:1;:45::48:0;:8::50:1',
        sourceTags: '0:2:lg',
      },
      source: fs.readFileSync(new URL('../valid-contract-files/covenant_all_fields.cash', import.meta.url), { encoding: 'utf-8' }),
      compiler: {
        name: 'cashc',
        version,
        options: {
          enforceFunctionParameterTypes: true,
          enforceLocktimeGuard: true,
        },
      },
      updatedAt: '',
      fingerprint: '371d30dbd28672395a164baee67b27ad86454fa53daccdb7a770a7916902f607',
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
        // require(tx.inputs.length == 1)
        + 'OP_TXINPUTCOUNT OP_1 OP_NUMEQUALVERIFY '
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
        bytecode: '5479009c63537ab275c3519d00cd0376a9147b7e0288ac7e8802e803c0c676547994527994765579547993a16300cc707c949d6700cc55799d51cdc0c78851cc789d686d6d6d5167547a519d5479a97b88547a547aac77777768',
        logs: [],
        requires: [
          { ip: 11, line: 3 },
          { ip: 15, line: 7 },
          { ip: 23, line: 10 },
          { ip: 47, line: 19 },
          { ip: 53, line: 21 },
          { ip: 58, line: 22 },
          { ip: 62, line: 23 },
          { ip: 77, line: 28 },
          { ip: 83, line: 29 },
        ],
        sourceMap: '2:4:25:5;;;;;3:28:3:34;;:8::36:1;;7:16:7:32:0;:36::37;:8::39:1;10:27:10:28:0;:16::45:1;:49::84:0;:74::83;:49::84:1;;;:8::86;12:23:12:27:0;13:37:13:58;:27::65:1;14:26:14:38:0;:41::47;;:26:::1;:50::58:0;;:26:::1;18:12:18:23:0;:27::33;;:36::44;;:27:::1;:12;:46:20:9:0;19:31:19:32;:20::39:1;:43::66:0;;::::1;:12::68;20:15:24:9:0;21:31:21:32;:20::39:1;:43::49:0;;:12::51:1;22:31:22:32:0;:20::49:1;:63::84:0;:53::101:1;:12::103;23:31:23:32:0;:20::39:1;:43::54:0;:12::56:1;20:15:24:9;2:23:25:5;;;;:4;27::30::0;;;;28:24:28:26;;:16::27:1;:31::37:0;:8::39:1;29:25:29:26:0;;:28::30;;:8::33:1;27:39:30:5;;;1:0:31:1',
        sourceTags: '79:81:sc',
      },
      source: fs.readFileSync(new URL('../valid-contract-files/mecenas.cash', import.meta.url), { encoding: 'utf-8' }),
      compiler: {
        name: 'cashc',
        version,
        options: {
          enforceFunctionParameterTypes: true,
          enforceLocktimeGuard: true,
        },
      },
      updatedAt: '',
      fingerprint: '82af4e70abe6257185f9fa2b9b65377949794a7f3f862a65eb3c61ec6bbff28a',
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
        sourceMap: '10:29:13:10;11:12:11:18;::::1;;;;12:18:12:118:0;:12::119:1;;;;;;;;;;;;16:27:16:28:0;:16::35:1;:39::40:0;:8::42:1;17:27:17:28:0;:16::45:1;:8::63;21:23:21:27:0;22:37:22:58;:27::65:1;:68::76:0;:27:::1;23:12:23:24:0;:28::36;:12:::1;:38:26:9:0;24:31:24:32;:20::49:1;:63::84:0;:53::101:1;:12::103;25:31:25:32:0;:20::39:1;:43::55:0;:12::57:1;23:38:26:9;8:24:27:5;',
      },
      source: fs.readFileSync(new URL('../valid-contract-files/announcement.cash', import.meta.url), { encoding: 'utf-8' }),
      compiler: {
        name: 'cashc',
        version,
        options: {
          enforceFunctionParameterTypes: true,
          enforceLocktimeGuard: true,
        },
      },
      updatedAt: '',
      fingerprint: '542596767034cea0f3a5933a1efa49bb9aa569ec70c5f0261afd36ea845fa746',
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
        options: {
          enforceFunctionParameterTypes: true,
          enforceLocktimeGuard: true,
        },
      },
      updatedAt: '',
      fingerprint: '4e9480ee14cf131a78be8da27e585e3d62c0e9cfa75d8338f2d51a67d84df0c7',
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
        sourceMap: '3:36:3:38;:40::44;:22::45:1;4:16:4:26;:30::32:0;:8::34:1',
      },
      source: fs.readFileSync(new URL('../valid-contract-files/num2bin_variable.cash', import.meta.url), { encoding: 'utf-8' }),
      compiler: {
        name: 'cashc',
        version,
        options: {
          enforceFunctionParameterTypes: true,
          enforceLocktimeGuard: true,
        },
      },
      updatedAt: '',
      fingerprint: '7ebb008689b080dce1061a508173a617c58b68202899cfd17a32f1a5decd4bb6',
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
        options: {
          enforceFunctionParameterTypes: true,
          enforceLocktimeGuard: true,
        },
      },
      updatedAt: '',
      fingerprint: '2a4f5039ce0a481742e5b1712388a879ec8c5b617c4d4a8d676cc28d029c604f',
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
        options: {
          enforceFunctionParameterTypes: true,
          enforceLocktimeGuard: true,
        },
      },
      updatedAt: '',
      fingerprint: '0b4ca541ca3bfd698bda9798bc6ce5565513848fe325360248ec00266d84c874',
    },
  },
  {
    fn: 'multiline_statements.cash',
    artifact: {
      contractName: 'MultilineStatements',
      constructorInputs: [{ name: 'x', type: 'int' }, { name: 'y', type: 'string' }],
      abi: [{ name: 'spend', inputs: [{ name: 'a', type: 'int' }, { name: 'b', type: 'string' }] }],
      bytecode: 'OP_ROT OP_SWAP OP_2 OP_SUB OP_NUMEQUAL OP_2 OP_PICK OP_2 OP_PICK OP_EQUAL OP_BOOLAND OP_IF OP_0 OP_VERIFY OP_ELSE OP_OVER 48656c6c6f20 OP_2 OP_PICK OP_CAT OP_EQUAL OP_IF OP_DUP 576f726c64 OP_EQUALVERIFY OP_ELSE OP_1 OP_0 OP_NOT OP_NOT OP_NOT OP_NUMEQUALVERIFY OP_ENDIF OP_ENDIF OP_2DROP OP_1',
      debug: {
        bytecode: '7b7c52949c52795279879a63006967780648656c6c6f2052797e87637605576f726c64886751009191919d68686d51',
        logs: [],
        requires: [
          { ip: 15, line: 11 },
          { ip: 26, line: 14 },
          { ip: 33, line: 18 },
        ],
        sourceMap: '9:12:9:13;:17::18;:21::22;:17:::1;:12;10::10:13:0;;:17::18;;:12:::1;9;10:20:12:9:0;11::11:25;:12::27:1;12:15:19:9:0;:19:12:20;:24::32;13:10:13:11;;12:24:::1;:19;13:13:17:9:0;15:16:15:17;:21::28;14:12:16:14:1;17:15:19:9:0;18:20:18:24;:31::36;:30:::1;:29;:28;:12::38;17:15:19:9;12;8:6:20:5;',
      },
      source: fs.readFileSync(new URL('../valid-contract-files/multiline_statements.cash', import.meta.url), { encoding: 'utf-8' }),
      compiler: {
        name: 'cashc',
        version,
        options: {
          enforceFunctionParameterTypes: true,
          enforceLocktimeGuard: true,
        },
      },
      updatedAt: '',
      fingerprint: 'd2aa37425c07883d3c7df823103f88a6a061d3efca1e6317b9e72e0ad4bd3611',
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
        options: {
          enforceFunctionParameterTypes: true,
          enforceLocktimeGuard: true,
        },
      },
      updatedAt: '',
      fingerprint: '47bb8f4ee4f62d7ecefc7f43fd7b61d2da71767df35d3dfd90149719287a0860',
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
        options: {
          enforceFunctionParameterTypes: true,
          enforceLocktimeGuard: true,
        },
      },
      updatedAt: '',
      fingerprint: 'd8574d80ab674df33841526cf2767c09a9dc02d2faea91746465e22e3b81ae3a',
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
        options: {
          enforceFunctionParameterTypes: true,
          enforceLocktimeGuard: true,
        },
      },
      updatedAt: '',
      fingerprint: 'd8574d80ab674df33841526cf2767c09a9dc02d2faea91746465e22e3b81ae3a',
    },
  },
  {
    fn: 'slice_optimised.cash',
    artifact: {
      contractName: 'Slice',
      constructorInputs: [{ name: 'data', type: 'bytes32' }],
      abi: [{ name: 'spend', inputs: [] }],
      bytecode: '14 OP_SPLIT OP_DROP OP_0 14 OP_NUM2BIN OP_EQUAL',
      debug: {
        bytecode: '01147f750001148087',
        sourceMap: '3:36:3:38;:22::39:1;;4:37:4:38:0;:40::42;:23::43:1;:8::45',
        logs: [],
        requires: [
          {
            ip: 8,
            line: 4,
            message: undefined,
          },
        ],
      },
      source: fs.readFileSync(new URL('../valid-contract-files/slice_optimised.cash', import.meta.url), { encoding: 'utf-8' }),
      compiler: {
        name: 'cashc',
        version,
        options: {
          enforceFunctionParameterTypes: true,
          enforceLocktimeGuard: true,
        },
      },
      updatedAt: '',
      fingerprint: '779b8278e2831727686ad5c96b85bb01bab5f2692edd34d703b9d437da77ac03',
    },
  },
  {
    fn: 'while_loop_basic.cash',
    artifact: {
      contractName: 'WhileLoopBasic',
      constructorInputs: [],
      abi: [{ name: 'spend', inputs: [] }],
      bytecode: 'OP_0 OP_BEGIN OP_DUP OP_3 OP_LESSTHAN OP_DUP OP_TOALTSTACK OP_IF OP_DUP OP_1ADD OP_NIP OP_ENDIF OP_FROMALTSTACK OP_NOT OP_UNTIL OP_3 OP_NUMEQUAL',
      debug: {
        bytecode: '006576539f766b63768b77686c9166539c',
        sourceMap: '3:16:3:17;5:8:7:9;:15:5:16;:19::20;:15:::1;;;:22:7:9:0;6:16:6:17;:::21:1;:12::22;5:22:7:9;;:8;;9:21:9:22:0;:8::24:1',
        logs: [],
        requires: [
          { ip: 17, line: 9 },
        ],
        sourceTags: '11:14:lc',
      },
      source: fs.readFileSync(new URL('../valid-contract-files/while_loop_basic.cash', import.meta.url), { encoding: 'utf-8' }),
      compiler: {
        name: 'cashc',
        version,
        options: {
          enforceFunctionParameterTypes: true,
          enforceLocktimeGuard: true,
        },
      },
      updatedAt: '',
      fingerprint: '5a456e72142ae6beb6f64a3af7edfe9e14295b17724c4dfec0d84940c545d457',
    },
  },
  {
    fn: 'for_loop_basic.cash',
    artifact: {
      contractName: 'ForLoopBasic',
      constructorInputs: [],
      abi: [{ name: 'spend', inputs: [] }],
      bytecode: 'OP_0 OP_0 OP_BEGIN OP_DUP OP_3 OP_LESSTHAN OP_DUP OP_TOALTSTACK OP_IF OP_2DUP OP_ADD OP_ROT OP_DROP OP_SWAP OP_DUP OP_1ADD OP_NIP OP_ENDIF OP_FROMALTSTACK OP_NOT OP_UNTIL OP_DROP OP_3 OP_NUMEQUAL',
      debug: {
        bytecode: '00006576539f766b636e937b757c768b77686c916675539c',
        sourceMap: '3:18:3:19;5:21:5:22;:8:7:9;:24:5:25;:28::29;:24:::1;;;:36:7:9:0;6:18:6:25;::::1;:12::26;;;5:31:5:32:0;:::34:1;;:36:7:9;;:8;;;9:23:9:24:0;:8::26:1',
        logs: [],
        requires: [
          { ip: 24, line: 9 },
        ],
        sourceTags: '14:16:fu;17:20:lc;21:21:sc',
      },
      source: fs.readFileSync(new URL('../valid-contract-files/for_loop_basic.cash', import.meta.url), { encoding: 'utf-8' }),
      compiler: {
        name: 'cashc',
        version,
        options: {
          enforceFunctionParameterTypes: true,
          enforceLocktimeGuard: true,
        },
      },
      updatedAt: '',
      fingerprint: '9e52dba656b0743057d4eda76f051c8a1f4460a2becf8f372c690b1901512b4e',
    },
  },
  {
    fn: 'for_loop_stack_items.cash',
    artifact: {
      contractName: 'ForLoopBasic',
      constructorInputs: [],
      abi: [{ name: 'spend', inputs: [] }],
      bytecode: 'OP_0 OP_1 OP_1 OP_0 OP_BEGIN OP_DUP OP_3 OP_LESSTHAN OP_DUP OP_TOALTSTACK OP_IF OP_3 OP_PICK OP_OVER OP_ADD OP_4 OP_ROLL OP_DROP OP_SWAP OP_TOALTSTACK OP_SWAP OP_TOALTSTACK OP_SWAP OP_FROMALTSTACK OP_FROMALTSTACK OP_DUP OP_1ADD OP_NIP OP_ENDIF OP_FROMALTSTACK OP_NOT OP_UNTIL OP_DROP OP_ROT OP_3 OP_NUMEQUALVERIFY OP_SWAP OP_1 OP_NUMEQUALVERIFY OP_1 OP_NUMEQUAL',
      debug: {
        bytecode: '005151006576539f766b6353797893547a757c6b7c6b7c6c6c768b77686c9166757b539d7c519d519c',
        sourceMap: '3:18:3:19;4:16:4:17;5::5;7:21:7:22;:8:9:9;:24:7:25;:28::29;:24:::1;;;:39:9:9:0;8:18:8:21;;:24::25;:18:::1;:12::26;;;;;;;;;;7:31:7:32:0;:::37:1;;:39:9:9;;:8;;;11:16:11:19:0;:23::24;:8::26:1;12:16:12:17:0;:21::22;:8::24:1;13:21:13:22:0;:8::24:1',
        logs: [],
        requires: [
          { ip: 35, line: 11 },
          { ip: 38, line: 12 },
          { ip: 41, line: 13 },
        ],
        sourceTags: '25:27:fu;28:31:lc;32:32:sc',
      },
      source: fs.readFileSync(new URL('../valid-contract-files/for_loop_stack_items.cash', import.meta.url), { encoding: 'utf-8' }),
      compiler: {
        name: 'cashc',
        version,
        options: {
          enforceFunctionParameterTypes: true,
          enforceLocktimeGuard: true,
        },
      },
      updatedAt: '',
      fingerprint: '05430d75d110ff5d4525f7e34bbf2c86b8d22f4e5758f2e109180b801b21b8ec',
    },
  },
  {
    fn: 'for_while_nested.cash',
    artifact: {
      contractName: 'ForWhileNested',
      constructorInputs: [],
      abi: [{ name: 'spend', inputs: [] }],
      bytecode: 'OP_0 OP_0 OP_BEGIN OP_DUP OP_2 OP_LESSTHAN OP_DUP OP_TOALTSTACK OP_IF OP_0 OP_BEGIN OP_DUP OP_2 OP_LESSTHAN OP_DUP OP_TOALTSTACK OP_IF OP_2 OP_PICK OP_2 OP_PICK OP_ADD OP_OVER OP_ADD OP_3 OP_ROLL OP_DROP OP_SWAP OP_TOALTSTACK OP_SWAP OP_FROMALTSTACK OP_DUP OP_1ADD OP_NIP OP_ENDIF OP_FROMALTSTACK OP_NOT OP_UNTIL OP_OVER OP_1ADD OP_ROT OP_DROP OP_NIP OP_ENDIF OP_FROMALTSTACK OP_NOT OP_UNTIL OP_DROP OP_4 OP_NUMEQUAL',
      debug: {
        bytecode: '00006576529f766b63006576529f766b6352795279937893537a757c6b7c6c768b77686c9166788b7b7577686c916675549c',
        sourceMap: '3:18:3:19;5:21:5:22;:8:13:9;:24:5:25;:28::29;:24:::1;;;:42:13:9:0;6:20:6:21;8:12:12:13;:19:8:20;:23::24;:19:::1;;;:26:12:13:0;9:22:9:25;;:28::29;;:22:::1;:32::33:0;:22:::1;:16::34;;;;;;;10:20:10:21:0;:::25:1;:16::26;8:26:12:13;;:12;;5:35:5:36:0;:::40:1;:31;;::13:9;:42;;:8;;;15:23:15:24:0;:8::26:1',
        logs: [
          {
            ip: 34,
            line: 11,
            data: [
              'sum:',
              { stackIndex: 2, type: 'int', ip: 34 },
              'i:',
              { stackIndex: 1, type: 'int', ip: 34 },
              'j:',
              { stackIndex: 0, type: 'int', ip: 34 },
            ],
          },
        ],
        requires: [
          { ip: 50, line: 15 },
        ],
        sourceTags: '34:37:lc;38:42:fu;43:46:lc;47:47:sc',
      },
      source: fs.readFileSync(new URL('../valid-contract-files/for_while_nested.cash', import.meta.url), { encoding: 'utf-8' }),
      compiler: {
        name: 'cashc',
        version,
        options: {
          enforceFunctionParameterTypes: true,
          enforceLocktimeGuard: true,
        },
      },
      updatedAt: '',
      fingerprint: '9eb2ec48e103cb2b0d75a326b533756d8f5edb49b2ea43a5578f5ceebde8c2ce',
    },
  },
  {
    fn: 'while_loop.cash',
    artifact: {
      contractName: 'Loopy',
      constructorInputs: [],
      abi: [{ name: 'doLoop', inputs: [] }],
      bytecode: 'OP_0 OP_BEGIN OP_DUP OP_TXINPUTCOUNT OP_LESSTHAN OP_DUP OP_TOALTSTACK OP_IF OP_DUP OP_1ADD OP_NIP OP_ENDIF OP_FROMALTSTACK OP_NOT OP_UNTIL OP_2 OP_GREATERTHAN',
      debug: {
        bytecode: '006576c39f766b63768b77686c916652a0',
        sourceMap: '3:16:3:17;5:8:7:9;:15:5:16;:19::35;:15:::1;;;:37:7:9:0;6:16:6:17;:::21:1;:12::22;5:37:7:9;;:8;;10:20:10:21:0;:8::23:1',
        logs: [
          { ip: 15, line: 9, data: [{ stackIndex: 0, type: 'int', ip: 15 }] },
        ],
        requires: [
          { ip: 17, line: 10 },
        ],
        sourceTags: '11:14:lc',
      },
      source: fs.readFileSync(new URL('../valid-contract-files/while_loop.cash', import.meta.url), { encoding: 'utf-8' }),
      compiler: {
        name: 'cashc',
        version,
        options: {
          enforceFunctionParameterTypes: true,
          enforceLocktimeGuard: true,
        },
      },
      updatedAt: '',
      fingerprint: '00fc9253e439b8a2f39ba60d1d173ff4d19f557802b40b750eb6df5f92b1001e',
    },
  },
  {
    fn: 'complex_loop.cash',
    artifact: {
      contractName: 'Loopy',
      constructorInputs: [],
      abi: [{ name: 'doLoop', inputs: [] }],
      bytecode: 'OP_0 OP_0 OP_0 OP_0 OP_BEGIN OP_DUP OP_UTXOVALUE OP_4 OP_ROLL OP_DROP OP_SWAP OP_TOALTSTACK OP_SWAP OP_TOALTSTACK OP_SWAP OP_FROMALTSTACK OP_FROMALTSTACK OP_DUP OP_1ADD OP_NIP OP_TXOUTPUTCOUNT OP_2DUP OP_LESSTHAN OP_DUP OP_IF OP_2 OP_PICK OP_OUTPUTTOKENCATEGORY OP_0 OP_EQUAL OP_NOT OP_NIP OP_DUP OP_IF OP_4 OP_PICK OP_3 OP_PICK OP_OUTPUTVALUE OP_ADD OP_5 OP_ROLL OP_DROP OP_SWAP OP_TOALTSTACK OP_SWAP OP_TOALTSTACK OP_SWAP OP_TOALTSTACK OP_SWAP OP_FROMALTSTACK OP_FROMALTSTACK OP_FROMALTSTACK OP_ELSE OP_3 OP_PICK OP_1ADD OP_4 OP_ROLL OP_DROP OP_SWAP OP_TOALTSTACK OP_SWAP OP_TOALTSTACK OP_SWAP OP_FROMALTSTACK OP_FROMALTSTACK OP_ENDIF OP_ENDIF OP_2DROP OP_DUP OP_TXINPUTCOUNT OP_GREATERTHANOREQUAL OP_UNTIL OP_2SWAP OP_GREATERTHAN OP_VERIFY OP_SWAP OP_0 OP_GREATERTHAN OP_NIP',
      debug: {
        bytecode: '000000006576c6547a757c6b7c6b7c6c6c768b77c46e9f76635279d100879177766354795379cc93557a757c6b7c6b7c6b7c6c6c6c6753798b547a757c6b7c6b7c6c6c68686d76c3a26672a0697c00a077',
        sourceMap: '3:23:3:24;4:24:4:25;5:25:5:26;6:16:6:17;8:8:26:39;9:33:9:34;:23::41:1;:12::42;;;;;;;;;;10:16:10:17:0;:::21:1;:12::22;12:20:12:37:0;13:21:13:26;::::1;15:16:15:17:0;:19:25:13;16:31:16:32;;:20::47:1;:51::53:0;:20:::1;;:16::54;18:20:18:21:0;:23:20:17;19:32:19:41;;:55::56;;:44::63:1;:32;:20::64;;;;;;;;;;;;;20:23:22:17:0;21:33:21:43;;:::47:1;:20::48;;;;;;;;;;20:23:22:17;15:19:25:13;8:11:26:9;26:17::18:0;:21::37;8:8::39:1;;28:16:28:36:0;::::1;:8::38;29:16:29:26:0;:29::30;:8::32:1;2:22:30:5',
        logs: [
          { ip: 68, line: 24, data: [{ stackIndex: 3, type: 'int', ip: 68 }] },
        ],
        requires: [
          { ip: 76, line: 28 },
          { ip: 80, line: 29 },
        ],
        sourceTags: '69:69:sc;80:80:sc',
      },
      source: fs.readFileSync(new URL('../valid-contract-files/complex_loop.cash', import.meta.url), { encoding: 'utf-8' }),
      compiler: {
        name: 'cashc',
        version,
        options: {
          enforceFunctionParameterTypes: true,
          enforceLocktimeGuard: true,
        },
      },
      updatedAt: '',
      fingerprint: 'fa36d9b24d49525e027ba3cf3accd349e9f84d0c1bbd1141e98d6894173a1a2a',
    },
  },
  {
    fn: 'do_while_loop_no_introspection.cash',
    artifact: {
      contractName: 'Loopy',
      constructorInputs: [],
      abi: [{ name: 'doLoop', inputs: [] }],
      bytecode: 'OP_0 OP_2 OP_BEGIN OP_OVER OP_1ADD OP_ROT OP_DROP OP_SWAP OP_2DUP OP_ADD OP_10 OP_LESSTHAN OP_VERIFY OP_OVER OP_10 OP_GREATERTHANOREQUAL OP_UNTIL OP_2DROP OP_1',
      debug: {
        bytecode: '005265788b7b757c6e935a9f69785aa2666d51',
        sourceMap: '3:16:3:17;4::4;6:8:10:25;7:16:7:17;:::21:1;:12::22;;;9:20:9:25:0;::::1;:28::30:0;:20:::1;:12::32;10:17:10:18:0;:21::23;6:8::25:1;;2:22:11:5;',
        logs: [
          { ip: 8, line: 8, data: [{ stackIndex: 1, type: 'int', ip: 8 }] },
        ],
        requires: [
          { ip: 12, line: 9 },
        ],
      },
      source: fs.readFileSync(new URL('../valid-contract-files/do_while_loop_no_introspection.cash', import.meta.url), { encoding: 'utf-8' }),
      compiler: {
        name: 'cashc',
        version,
        options: {
          enforceFunctionParameterTypes: true,
          enforceLocktimeGuard: true,
        },
      },
      updatedAt: '',
      fingerprint: '39b67bb19440620390b83e3bc1e638ea6827998f4a14c2d6e29c2afa9815b2fd',
    },
  },
  {
    fn: 'bitshift.cash',
    artifact: {
      contractName: 'Bitshift',
      constructorInputs: [],
      abi: [{ name: 'spend', inputs: [] }],
      bytecode: '1122334455667788 OP_4 OP_LSHIFTBIN OP_4 OP_RSHIFTBIN 0000000055667788 OP_EQUALVERIFY OP_8 OP_2 OP_RSHIFTNUM OP_1 OP_LSHIFTNUM OP_4 OP_NUMEQUAL',
      debug: {
        bytecode: '081122334455667788549854990800000000556677888858528e518d549c',
        sourceMap: '3:19:3:37;4:24:4:25;:19:::1;:29::30:0;:19:::1;6:21:6:39:0;:8::41:1;8:16:8:17:0;9:21:9:22;:16:::1;:26::27:0;:16:::1;11:22:11:23:0;:8::25:1',
        logs: [],
        requires: [
          { ip: 6, line: 6 },
          { ip: 14, line: 11 },
        ],
      },
      source: fs.readFileSync(new URL('../valid-contract-files/bitshift.cash', import.meta.url), { encoding: 'utf-8' }),
      compiler: {
        name: 'cashc',
        version,
        options: {
          enforceFunctionParameterTypes: true,
          enforceLocktimeGuard: true,
        },
      },
      updatedAt: '',
      fingerprint: '2c9d2ddcd53c6f4e28320acf336260ece7958753802381a2528ddfa1840eb88a',
    },
  },
  {
    fn: 'type_enforcement.cash',
    artifact: {
      contractName: 'TypeEnforcement',
      constructorInputs: [],
      abi: [{
        name: 'spend', inputs: [
          { name: 'nonEnforcedInt', type: 'int' },
          { name: 'enforcedBool', type: 'bool' },
          { name: 'enforcedBytes', type: 'bytes4' },
          { name: 'nonEnforcedBytes', type: 'bytes' },
        ],
      }],
      bytecode:
        // Implicit type enforcement for enforcedBool: enforcedBool = bool(enforcedBool)
        'OP_SWAP OP_0NOTEQUAL '
        // Implicit type enforcement for enforcedBytes: require(enforcedBytes.length == 4)
        + 'OP_ROT OP_SIZE OP_4 OP_EQUALVERIFY '
        // if(enforcedBool == true) )
        + 'OP_OVER OP_1 OP_NUMEQUAL OP_IF '
        // require(nonEnforcedInt > 6)
        + 'OP_2 OP_PICK OP_6 OP_GREATERTHAN OP_VERIFY '
        // Cleanup
        + 'OP_ENDIF '
        // if(enforcedBool == false) {
        + 'OP_SWAP OP_0 OP_NUMEQUAL OP_IF '
        // require(enforcedBytes == nonEnforcedBytes)
        + 'OP_DUP OP_3 OP_PICK OP_EQUALVERIFY '
        // Cleanup
        + 'OP_ENDIF OP_2DROP OP_DROP OP_1',
      debug: {
        bytecode: '7c927b82548878519c63527956a069687c009c6376537988686d7551',
        sourceMap: '4:8:4:25;;5::5:28;;;;8:12:8:24;:28::32;:12:::1;:34:10:9:0;9:20:9:34;;:37::38;:20:::1;:12::40;8:34:10:9;12:12:12:24:0;:28::33;:12:::1;:35:14:9:0;13:20:13:33;:37::53;;:12::55:1;12:35:14:9;7:6:15:5;;',
        sourceTags: '0:1:pv;2:5:pv',
        logs: [],
        requires: [
          { ip: 14, line: 9 },
          { ip: 23, line: 13 },
        ],
      },
      source: fs.readFileSync(new URL('../valid-contract-files/type_enforcement.cash', import.meta.url), { encoding: 'utf-8' }),
      compiler: {
        name: 'cashc',
        version,
        options: {
          enforceFunctionParameterTypes: true,
          enforceLocktimeGuard: true,
        },
      },
      updatedAt: '',
      fingerprint: 'afc9b61abaaef4b60d435309b83b2cbd5750e2c1755ca903cfd3f438f7dc6126',
    },
  },
  {
    // Same as the fixture above, but with enforceFunctionParameterTypes disabled
    fn: 'type_enforcement.cash',
    compilerOptions: {
      enforceFunctionParameterTypes: false,
    },
    artifact: {
      contractName: 'TypeEnforcement',
      constructorInputs: [],
      abi: [{
        name: 'spend', inputs: [
          { name: 'nonEnforcedInt', type: 'int' },
          { name: 'enforcedBool', type: 'bool' },
          { name: 'enforcedBytes', type: 'bytes4' },
          { name: 'nonEnforcedBytes', type: 'bytes' },
        ],
      }],
      bytecode:
        // if(enforcedBool == true)
        'OP_OVER OP_1 OP_NUMEQUAL OP_IF '
        // require(nonEnforcedInt > 6)
        + 'OP_DUP OP_6 OP_GREATERTHAN OP_VERIFY '
        // Cleanup
        + 'OP_ENDIF '
        // if(enforcedBool == false) {
        + 'OP_SWAP OP_0 OP_NUMEQUAL OP_IF '
        // require(enforcedBytes == nonEnforcedBytes)
        + 'OP_OVER OP_3 OP_PICK OP_EQUALVERIFY '
        // Cleanup
        + 'OP_ENDIF OP_2DROP OP_DROP OP_1',
      debug: {
        bytecode: '78519c637656a069687c009c6378537988686d7551',
        sourceMap: '8:12:8:24;:28::32;:12:::1;:34:10:9:0;9:20:9:34;:37::38;:20:::1;:12::40;8:34:10:9;12:12:12:24:0;:28::33;:12:::1;:35:14:9:0;13:20:13:33;:37::53;;:12::55:1;12:35:14:9;7:6:15:5;;',
        logs: [],
        requires: [
          { ip: 7, line: 9 },
          { ip: 16, line: 13 },
        ],
      },
      source: fs.readFileSync(new URL('../valid-contract-files/type_enforcement.cash', import.meta.url), { encoding: 'utf-8' }),
      compiler: {
        name: 'cashc',
        version,
        options: {
          enforceFunctionParameterTypes: false,
          enforceLocktimeGuard: true,
        },
      },
      updatedAt: '',
      fingerprint: '606e540c38f161868964b683aeb0ddf93094dc36607397ef9b9f507f9028bc37',
    },
  },
  {
    // A single global function — the basic OP_DEFINE / OP_INVOKE calling convention.
    fn: 'global_function_simple.cash',
    artifact: {
      contractName: 'GlobalFunctionSimple',
      constructorInputs: [],
      abi: [{ name: 'spend', inputs: [{ name: 'x', type: 'int' }] }],
      bytecode:
        // OP_DEFINE double (id 0): return a * 2
        '5295 OP_0 OP_DEFINE '
        // require(double(x) == 6)
        + 'OP_0 OP_INVOKE OP_6 OP_NUMEQUAL',
      debug: {
        bytecode: '0252950089008a569c',
        logs: [],
        requires: [
          { ip: 7, line: 7 },
        ],
        sourceMap: '1::3:1;;::::1;7:16:7:25;;:29::30:0;:8::32:1',
      },
      source: fs.readFileSync(new URL('../valid-contract-files/global_function_simple.cash', import.meta.url), { encoding: 'utf-8' }),
      compiler: {
        name: 'cashc',
        version,
        options: {
          enforceFunctionParameterTypes: true,
          enforceLocktimeGuard: true,
        },
      },
      updatedAt: '',
      fingerprint: 'ef6dd7819e66a430286fe16f3d6dad7e026cf1970eda6bc620be7e7a3bdd2a4d',
    },
  },
  {
    // A multi-parameter global function — locks in the parameter stack-seeding and argument order
    // (the contract OP_SWAPs x and y into place; the body computes a - b directly).
    fn: 'global_function_multi_param.cash',
    artifact: {
      contractName: 'GlobalFunctionMultiParam',
      constructorInputs: [],
      abi: [{ name: 'spend', inputs: [{ name: 'x', type: 'int' }, { name: 'y', type: 'int' }] }],
      bytecode:
        // OP_DEFINE sub (id 0): return a - b
        '94 OP_0 OP_DEFINE '
        // require(sub(x, y) == 7)
        + 'OP_SWAP OP_0 OP_INVOKE OP_7 OP_NUMEQUAL',
      debug: {
        bytecode: '019400897c008a579c',
        logs: [],
        requires: [
          { ip: 8, line: 7 },
        ],
        sourceMap: '1::3:1;;::::1;7:23:7:24:0;:16::25:1;;:29::30:0;:8::32:1',
      },
      source: fs.readFileSync(new URL('../valid-contract-files/global_function_multi_param.cash', import.meta.url), { encoding: 'utf-8' }),
      compiler: {
        name: 'cashc',
        version,
        options: {
          enforceFunctionParameterTypes: true,
          enforceLocktimeGuard: true,
        },
      },
      updatedAt: '',
      fingerprint: '8fc72a3f89ee3238266d6dd9ad3919f7238c8d6a31296cc8925968a31c78c7dc',
    },
  },
  {
    // A void global function called as a statement — no return value, and the void stack-cleanup path.
    fn: 'global_function_void.cash',
    artifact: {
      contractName: 'GlobalFunctionVoid',
      constructorInputs: [],
      abi: [{ name: 'spend', inputs: [{ name: 'x', type: 'int' }] }],
      bytecode:
        // OP_DEFINE requirePositive (id 0): require(a > 0)
        '00a069 OP_0 OP_DEFINE '
        // requirePositive(x); require(x < 100)
        + 'OP_DUP OP_0 OP_INVOKE 64 OP_LESSTHAN',
      debug: {
        bytecode: '0300a069008976008a01649f',
        logs: [],
        requires: [
          { ip: 8, line: 8 },
        ],
        sourceMap: '1::3:1;;::::1;7:24:7:25:0;:8::26:1;;8:20:8:23:0;:8::25:1',
      },
      source: fs.readFileSync(new URL('../valid-contract-files/global_function_void.cash', import.meta.url), { encoding: 'utf-8' }),
      compiler: {
        name: 'cashc',
        version,
        options: {
          enforceFunctionParameterTypes: true,
          enforceLocktimeGuard: true,
        },
      },
      updatedAt: '',
      fingerprint: '4d5e07b068e501eb26e61aab0d53214aa42590858253b1106d6074d494fde557',
    },
  },
  {
    // Imports resolved across a diamond (mid1 and mid2 both import leaf): leaf is defined once, and
    // m1/m2 invoke it transitively.
    fn: '../import-fixtures/diamond.cash',
    artifact: {
      contractName: 'Diamond',
      constructorInputs: [],
      abi: [{ name: 'spend', inputs: [{ name: 'x', type: 'int' }] }],
      bytecode:
        // Functions are defined in call order (DFS from the contract), so m1 is id 0, leaf id 1, m2 id 2.
        // OP_DEFINE m1 (id 0): return leaf(a) * 2
        '518a5295 OP_0 OP_DEFINE '
        // OP_DEFINE leaf (id 1): return a + 1
        + '8b OP_1 OP_DEFINE '
        // OP_DEFINE m2 (id 2): return leaf(a) + 3
        + '518a5393 OP_2 OP_DEFINE '
        // require(m1(x) + m2(x) == 18)
        + 'OP_DUP OP_0 OP_INVOKE OP_SWAP OP_2 OP_INVOKE OP_ADD 12 OP_NUMEQUAL',
      debug: {
        bytecode: '04518a52950089018b518904518a5393528976008a7c528a9301129c',
        logs: [],
        requires: [
          { ip: 18, line: 6 },
        ],
        sourceMap: '2::4:1;;::::1;1::3::0;;::::1;2::4::0;;::::1;6:19:6:20:0;:16::21:1;;:27::28:0;:24::29:1;;:16;:33::35:0;:8::37:1',
      },
      source: fs.readFileSync(new URL('../import-fixtures/diamond.cash', import.meta.url), { encoding: 'utf-8' }),
      compiler: {
        name: 'cashc',
        version,
        options: {
          enforceFunctionParameterTypes: true,
          enforceLocktimeGuard: true,
        },
      },
      updatedAt: '',
      fingerprint: '316a3305152ec0695bf80303736c79dd1f9cc2f1dbccf57d9965094401363307',
    },
  },
];
