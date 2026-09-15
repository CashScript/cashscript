import { Fixture } from '../../fixture-utils.js';

export const fixtures: Fixture[] = [
  {
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
      fingerprint: '5ec5f2a100dc5c29c95f58ed51e4da469b74e5932b070e38f3c30c3405f40005',
    },
  },
];
