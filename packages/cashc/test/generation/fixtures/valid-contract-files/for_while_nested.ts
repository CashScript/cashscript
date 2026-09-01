import { Fixture } from '../../fixture-utils.js';

export const fixtures: Fixture[] = [
  {
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
      fingerprint: '9eb2ec48e103cb2b0d75a326b533756d8f5edb49b2ea43a5578f5ceebde8c2ce',
    },
  },
];
