import { Fixture } from '../../fixture-utils.js';

export const fixtures: Fixture[] = [
  {
    artifact: {
      contractName: 'DeepIncrementDecrement',
      constructorInputs: [],
      abi: [
        { name: 'loop', inputs: [{ name: 'budget', type: 'int' }] },
        {
          name: 'branch',
          inputs: [{ name: 'x', type: 'int' }, { name: 'y', type: 'int' }, { name: 'z', type: 'int' }],
        },
      ],
      bytecode:
        // function loop(int budget) {
        'OP_DUP OP_0 OP_NUMEQUAL OP_IF '
        // int remaining = budget;
        + 'OP_OVER '
        // int steps = 0;
        + 'OP_0 '
        // int a = 1;
        + 'OP_1 '
        // int b = 2;
        + 'OP_2 '
        // int c = 3;
        + 'OP_3 '
        // for (int i = 0; i < 3; i++) {
        + 'OP_0 OP_BEGIN OP_DUP OP_3 OP_LESSTHAN OP_DUP OP_TOALTSTACK OP_IF '
        // remaining = remaining - 1;
        + 'OP_5 OP_ROLL OP_1SUB OP_SWAP OP_TOALTSTACK OP_SWAP OP_TOALTSTACK OP_SWAP OP_2SWAP OP_ROT OP_FROMALTSTACK OP_FROMALTSTACK '
        // steps = steps + 1;
        + 'OP_4 OP_ROLL OP_1ADD OP_SWAP OP_TOALTSTACK OP_SWAP OP_2SWAP OP_ROT OP_FROMALTSTACK '
        // i++
        + 'OP_1ADD '
        // Loop condition
        + 'OP_ENDIF OP_FROMALTSTACK OP_NOT OP_UNTIL '
        // Cleanup
        + 'OP_DROP '
        // require(a + b + c == 6);
        + 'OP_ROT OP_ROT OP_ADD OP_ADD OP_6 OP_NUMEQUALVERIFY '
        // require(remaining + steps == budget);
        + 'OP_ADD OP_ROT OP_NUMEQUAL '
        // Cleanup
        + 'OP_NIP '
        // }
        + 'OP_ELSE '
        // function branch(int x, int y, int z) {
        + 'OP_1 OP_NUMEQUALVERIFY '
        // if (x > y) {
        + 'OP_2DUP OP_LESSTHAN OP_IF '
        // x = x - 1;
        + 'OP_1SUB '
        // y = y - 1;
        + 'OP_SWAP OP_1SUB OP_SWAP '
        // z = z - 1;
        + 'OP_ROT OP_1SUB OP_ROT OP_ROT '
        // }
        + 'OP_ENDIF '
        // require(x + y + z > 0);
        + 'OP_ADD OP_ADD OP_0 OP_GREATERTHAN '
        // }
        + 'OP_ENDIF',
      debug: {
        bytecode: '76009c637800515253006576539f766b63557a8c7c6b7c6b7c727b6c6c547a8b7c6b7c727b6c8b686c9166757b7b9393569d937b9c7767519d6e9f638c7c8c7c7b8c7b7b68939300a068',
        sourceMap: '2:4:16:5;;;;3:24:3:30;4:20:4:21;5:16:5:17;6::6;7::7;9:21:9:22;:8:12:9;:24:9:25;:28::29;:24:::1;;;:36:12:9:0;10:24:10:33;;:::37:1;:12::38;;;;;;;;;11:20:11:25:0;;:::29:1;:12::30;;;;;;9:31:9:34;:36:12:9;;:8;;;14:16:14:17:0;:20::21;:16:::1;:::25;:29::30:0;:8::32:1;15:16:15:33;:37::43:0;:8::45:1;2:30:16:5;:4;18::26::0;;19:12:19:17;::::1;:19:23:9:0;20:16:20:21:1;21::21:17:0;:::21:1;:12::22;22:16:22:17:0;:::21:1;:12::22;;19:19:23:9;25:16:25:21;:::25;:28::29:0;:8::31:1;1:0:27:1',
        logs: [],
        requires: [
          { ip: 49, line: 14 },
          { ip: 53, line: 15 },
          { ip: 73, line: 25 },
        ],
        sourceTags: '38:38:fu;39:42:lc;43:43:sc;53:53:sc',
      },
      fingerprint: '98cc2394f050f139ea1b4e5816109403122c1381f60fb2379833fd772283fcbd',
    },
  },
];
