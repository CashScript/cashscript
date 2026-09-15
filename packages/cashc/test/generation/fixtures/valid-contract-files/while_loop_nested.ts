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
        + 'OP_OVER OP_1ADD OP_ROT OP_DROP OP_SWAP '
        // j = j + 1;
        + 'OP_DUP OP_1ADD OP_NIP '
        // Loop condition
        + 'OP_ENDIF OP_FROMALTSTACK OP_NOT OP_UNTIL '
        // i = i + 1;
        + 'OP_2 OP_PICK OP_1ADD OP_3 OP_ROLL OP_DROP OP_SWAP OP_TOALTSTACK OP_SWAP OP_FROMALTSTACK '
        // Cleanup
        + 'OP_DROP '
        // Loop condition
        + 'OP_ENDIF OP_FROMALTSTACK OP_NOT OP_UNTIL '
        // require(i == 2);
        + 'OP_SWAP OP_2 OP_NUMEQUALVERIFY '
        // require(total == 4);
        + 'OP_4 OP_NUMEQUAL',
      fingerprint: '1305b87f8914755fb2e52934624cd80fc3bf61117d6957730845fcbc2002e8b4',
      debug: {
        bytecode: '00006578529f766b63006576529f766b63788b7b757c768b77686c916652798b537a757c6b7c6c75686c91667c529d549c',
        sourceMap: '3:16:3:17;4:20:4:21;6:8:15:9;:15:6:16;:19::20;:15:::1;;;:22:15:9:0;7:20:7:21;9:12:12:13;:19:9:20;:23::24;:19:::1;;;:26:12:13:0;10:24:10:29;:::33:1;:16::34;;;11:20:11:21:0;:::25:1;:16::26;9:26:12:13;;:12;;14:16:14:17:0;;:::21:1;:12::22;;;;;;;6:22:15:9;;;:8;;17:16:17:17:0;:21::22;:8::24:1;18:25:18:26:0;:8::28:1',
        logs: [],
        requires: [{ ip: 46, line: 17 }, { ip: 49, line: 18 }],
        sourceTags: '25:28:lc;39:39:sc;40:43:lc',
      },
    },
  },
];
