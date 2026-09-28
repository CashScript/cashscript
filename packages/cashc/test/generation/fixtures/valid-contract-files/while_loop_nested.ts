import { Fixture } from '../../fixture-utils.js';

export const fixtures: Fixture[] = [
  {
    artifact: {
      contractName: 'WhileLoopNested',
      constructorInputs: [],
      abi: [{ name: 'spend', inputs: [] }],
      bytecode:
        // int i = 0;
        'OP_0 '
        // int total = 0;
        + 'OP_0 '
        // while (i < 2) {
        + 'OP_BEGIN OP_OVER OP_2 OP_LESSTHAN OP_DUP OP_TOALTSTACK OP_IF '
        // int j = 0;
        + 'OP_0 '
        // while (j < 2) {
        + 'OP_BEGIN OP_DUP OP_2 OP_LESSTHAN OP_DUP OP_TOALTSTACK OP_IF '
        // total = total + 1;
        + 'OP_SWAP OP_1ADD OP_SWAP '
        // j = j + 1;
        + 'OP_1ADD '
        // Loop condition
        + 'OP_ENDIF OP_FROMALTSTACK OP_NOT OP_UNTIL '
        // i = i + 1;
        + 'OP_ROT OP_1ADD '
        // Cleanup
        + 'OP_NIP OP_SWAP '
        // Loop condition
        + 'OP_ENDIF OP_FROMALTSTACK OP_NOT OP_UNTIL '
        // require(i == 2);
        + 'OP_SWAP OP_2 OP_NUMEQUALVERIFY '
        // require(total == 4);
        + 'OP_4 OP_NUMEQUAL',
      fingerprint: 'd50bb71e353bc7c4b2acd4d9c858760aaf37f88fa10e263dc85002bfed2bbfc2',
      debug: {
        bytecode: '00006578529f766b63006576529f766b637c8b7c8b686c91667b8b777c686c91667c529d549c',
        sourceMap: '3:16:3:17;4:20:4:21;6:8:15:9;:15:6:16;:19::20;:15:::1;;;:22:15:9:0;7:20:7:21;9:12:12:13;:19:9:20;:23::24;:19:::1;;;:26:12:13:0;10:16:10:34:1;;;11::11:26;9:26:12:13;;:12;;14::14:22;;6:22:15:9;;;;:8;;17:16:17:17:0;:21::22;:8::24:1;18:25:18:26:0;:8::28:1',
        logs: [],
        requires: [{ ip: 35, line: 17 }, { ip: 38, line: 18 }],
        sourceTags: '21:24:lc;29:32:lc',
      },
    },
  },
];
