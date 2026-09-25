import { Fixture } from '../../fixture-utils.js';

export const fixtures: Fixture[] = [
  {
    artifact: {
      contractName: 'ForWhileNested',
      constructorInputs: [],
      abi: [{ name: 'spend', inputs: [] }],
      bytecode: 'OP_0 OP_0 OP_BEGIN OP_DUP OP_2 OP_LESSTHAN OP_DUP OP_TOALTSTACK OP_IF OP_0 OP_BEGIN OP_DUP OP_2 OP_LESSTHAN OP_DUP OP_TOALTSTACK OP_IF OP_2 OP_PICK OP_2 OP_PICK OP_ADD OP_OVER OP_ADD OP_3 OP_ROLL OP_DROP OP_ROT OP_ROT OP_1ADD OP_ENDIF OP_FROMALTSTACK OP_NOT OP_UNTIL OP_OVER OP_1ADD OP_ROT OP_DROP OP_NIP OP_ENDIF OP_FROMALTSTACK OP_NOT OP_UNTIL OP_DROP OP_4 OP_NUMEQUAL',
      debug: {
        bytecode: '00006576529f766b63006576529f766b6352795279937893537a757b7b8b686c9166788b7b7577686c916675549c',
        sourceMap: '3:18:3:19;5:21:5:22;:8:13:9;:24:5:25;:28::29;:24:::1;;;:42:13:9:0;6:20:6:21;8:12:12:13;:19:8:20;:23::24;:19:::1;;;:26:12:13:0;9:22:9:25;;:28::29;;:22:::1;:32::33:0;:22:::1;:16::34;;;;;10::10:26;8:26:12:13;;:12;;5:35:5:36:0;:::40:1;:31;;::13:9;:42;;:8;;;15:23:15:24:0;:8::26:1',
        logs: [
          {
            ip: 30,
            line: 11,
            data: [
              'sum:',
              { stackIndex: 2, type: 'int', ip: 30 },
              'i:',
              { stackIndex: 1, type: 'int', ip: 30 },
              'j:',
              { stackIndex: 0, type: 'int', ip: 30 },
            ],
          },
        ],
        requires: [
          { ip: 46, line: 15 },
        ],
        sourceTags: '30:33:lc;34:38:fu;39:42:lc;43:43:sc',
      },
      fingerprint: '6e3242d4469324cf4c6a1b2186dce828984c74bbdc05c8a5abd1917142b4c5e9',
    },
  },
];
