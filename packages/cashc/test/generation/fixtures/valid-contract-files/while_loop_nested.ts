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
        + 'OP_1ADD '
        // Loop condition
        + 'OP_ENDIF OP_FROMALTSTACK OP_NOT OP_UNTIL '
        // i = i + 1;
        + 'OP_2 OP_PICK OP_1ADD OP_3 OP_ROLL OP_DROP OP_ROT OP_ROT '
        // Cleanup
        + 'OP_DROP '
        // Loop condition
        + 'OP_ENDIF OP_FROMALTSTACK OP_NOT OP_UNTIL '
        // require(i == 2);
        + 'OP_SWAP OP_2 OP_NUMEQUALVERIFY '
        // require(total == 4);
        + 'OP_4 OP_NUMEQUAL',
      fingerprint: '1994bca592984b848eb3fba2915fe03e0ef2fbd13e0e6e5f6efb60849cec54aa',
      debug: {
        bytecode: '00006578529f766b63006576529f766b63788b7b757c8b686c916652798b537a757b7b75686c91667c529d549c',
        sourceMap: '3:16:3:17;4:20:4:21;6:8:15:9;:15:6:16;:19::20;:15:::1;;;:22:15:9:0;7:20:7:21;9:12:12:13;:19:9:20;:23::24;:19:::1;;;:26:12:13:0;10:24:10:29;:::33:1;:16::34;;;11::11:26;9:26:12:13;;:12;;14:16:14:17:0;;:::21:1;:12::22;;;;;6:22:15:9;;;:8;;17:16:17:17:0;:21::22;:8::24:1;18:25:18:26:0;:8::28:1',
        logs: [],
        requires: [{ ip: 42, line: 17 }, { ip: 45, line: 18 }],
        sourceTags: '23:26:lc;35:35:sc;36:39:lc',
      },
    },
  },
];
