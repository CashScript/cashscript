import { Fixture } from '../../fixture-utils.js';

export const fixtures: Fixture[] = [
  {
    artifact: {
      contractName: 'ForWhileNested',
      constructorInputs: [],
      abi: [{ name: 'spend', inputs: [] }],
      bytecode: 'OP_0 OP_0 OP_BEGIN OP_DUP OP_2 OP_LESSTHAN OP_DUP OP_TOALTSTACK OP_IF OP_0 OP_BEGIN OP_DUP OP_2 OP_LESSTHAN OP_DUP OP_TOALTSTACK OP_IF OP_3DUP OP_DROP OP_ADD OP_OVER OP_ADD OP_2SWAP OP_NIP OP_ROT OP_1ADD OP_ENDIF OP_FROMALTSTACK OP_NOT OP_UNTIL OP_SWAP OP_1ADD OP_NIP OP_ENDIF OP_FROMALTSTACK OP_NOT OP_UNTIL OP_DROP OP_4 OP_NUMEQUAL',
      debug: {
        bytecode: '00006576529f766b63006576529f766b636f7593789372777b8b686c91667c8b77686c916675549c',
        sourceMap: '3:18:3:19;5:21:5:22;:8:13:9;:24:5:25;:28::29;:24:::1;;;:42:13:9:0;6:20:6:21;8:12:12:13;:19:8:20;:23::24;:19:::1;;;:26:12:13:0;9:22:9:29;;::::1;:32::33:0;:22:::1;:16::34;;;10:20:10:25;8:26:12:13;;:12;;5:35:5:36:0;:::40:1;:31:13:9;:42;;:8;;;15:23:15:24:0;:8::26:1',
        logs: [
          {
            ip: 26,
            line: 11,
            data: [
              'sum:',
              { stackIndex: 2, type: 'int', ip: 26 },
              'i:',
              { stackIndex: 1, type: 'int', ip: 26 },
              'j:',
              { stackIndex: 0, type: 'int', ip: 26 },
            ],
          },
        ],
        requires: [
          { ip: 40, line: 15 },
        ],
        sourceTags: '26:29:lc;30:32:fu;33:36:lc;37:37:sc',
      },
      fingerprint: '12f233fbd4c8ffef111e10c2a36ed6b3ef3a83baa5a692665392ad9b2021a56f',
    },
  },
];
