import { Fixture } from '../../fixture-utils.js';

export const fixtures: Fixture[] = [
  {
    artifact: {
      contractName: 'ReassignAfterFinalRead',
      constructorInputs: [],
      abi: [
        { name: 'ifBranch', inputs: [{ name: 'x', type: 'int' }] },
        { name: 'whileLoop', inputs: [{ name: 'x', type: 'int' }] },
      ],
      bytecode:
        // function ifBranch(int x) {
        'OP_DUP OP_0 OP_NUMEQUAL OP_IF '
        // int p = 10;
        + 'OP_10 '
        // int q = 0;
        + 'OP_0 '
        // require(p == 10);
        + 'OP_OVER OP_10 OP_NUMEQUALVERIFY '
        // if (x == 1) {
        + 'OP_3 OP_PICK OP_1 OP_NUMEQUAL OP_IF '
        // (p, q) = pair(x);
        + 'OP_3 OP_PICK OP_DUP OP_2 OP_MUL OP_SWAP OP_1ADD OP_ROT OP_DROP OP_SWAP OP_ROT OP_DROP OP_SWAP '
        // }
        + 'OP_ENDIF '
        // require(q == 0 || q == 2);
        + 'OP_DUP OP_0 OP_NUMEQUAL OP_SWAP OP_2 OP_NUMEQUAL OP_BOOLOR '
        // Cleanup
        + 'OP_NIP OP_NIP OP_NIP '
        // }
        + 'OP_ELSE '
        // function whileLoop(int x) {
        + 'OP_1 OP_NUMEQUALVERIFY '
        // int p = 10;
        + 'OP_10 '
        // int q = 0;
        + 'OP_0 '
        // require(p == 10);
        + 'OP_OVER OP_10 OP_NUMEQUALVERIFY '
        // while (x == 1) {
        + 'OP_BEGIN OP_2 OP_PICK OP_1 OP_NUMEQUAL OP_DUP OP_TOALTSTACK OP_IF '
        // (p, q) = pair(x);
        + 'OP_2 OP_PICK OP_DUP OP_2 OP_MUL OP_SWAP OP_1ADD OP_ROT OP_DROP OP_SWAP OP_ROT OP_DROP OP_SWAP '
        // x = x + 1;
        + 'OP_2 OP_PICK OP_1ADD OP_3 OP_ROLL OP_DROP OP_SWAP OP_TOALTSTACK OP_SWAP OP_FROMALTSTACK '
        // Loop condition
        + 'OP_ENDIF OP_FROMALTSTACK OP_NOT OP_UNTIL '
        // require(q == 0 || q == 2);
        + 'OP_DUP OP_0 OP_NUMEQUAL OP_SWAP OP_2 OP_NUMEQUAL OP_BOOLOR '
        // Cleanup
        + 'OP_NIP OP_NIP '
        // }
        + 'OP_ENDIF',
      fingerprint: '510ff239ab3ec7cc5d4301e1ef31a179c01bc4b6e73e800f03bd2674c9996ae3',
      debug: {
        bytecode: '76009c635a00785a9d5379519c6353797652957c8b7b757c7b757c6876009c7c529c9b77777767519d5a00785a9d655279519c766b6352797652957c8b7b757c7b757c52798b537a757c6b7c6c686c916676009c7c529c9b777768',
        sourceMap: '11:4:19:5;;;;12:16:12:18;13::13:17;14::14;:21::23;:8::25:1;15:12:15:13:0;;:17::18;:12:::1;:20:17:9:0;16:26:16:27;;:21::28:1;;;;;:12::29;;;;;;15:20:17:9;18:16:18:17:0;:21::22;:16:::1;:26::27:0;:31::32;:26:::1;:8::34;11:29:19:5;;;:4;21::30::0;;22:16:22:18;23::23:17;24::24;:21::23;:8::25:1;25::28:9:0;:15:25:16;;:20::21;:15:::1;;;:23:28:9:0;26:26:26:27;;:21::28:1;;;;;:12::29;;;;;;27:16:27:17:0;;:::21:1;:12::22;;;;;;;25:23:28:9;;:8;;29:16:29:17:0;:21::22;:16:::1;:26::27:0;:31::32;:26:::1;:8::34;21:30:30:5;;10:0:31:1',
        logs: [],
        requires: [{ ip: 8, line: 14 }, { ip: 35, line: 18 }, { ip: 45, line: 24 }, { ip: 88, line: 29 }],
        sourceTags: '35:37:sc;77:80:lc;88:89:sc',
        functions: [
          {
            name: 'pair',
            inputs: [{ name: 'n', type: 'int' }],
            bytecode: '7652957c8b',
            sourceMap: '7:11:7:12;:15::16;:11:::1;:18::19:0;:::23:1',
            logs: [],
            requires: [],
          },
        ],
        inlineRanges: '16:20:pair;56:60:pair',
      },
    },
  },
];
