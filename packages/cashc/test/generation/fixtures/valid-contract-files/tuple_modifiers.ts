import { Fixture } from '../../fixture-utils.js';

export const fixtures: Fixture[] = [
  {
    artifact: {
      contractName: 'TupleModifiers',
      constructorInputs: [],
      abi: [{ name: 'spend', inputs: [{ name: 'n', type: 'int' }] }],
      bytecode:
        // int unused incremented, int constant doubled = pair(n);
        // pair is inlined; the unused first target is nipped from under `doubled`
        'OP_DUP OP_DUP OP_1ADD OP_SWAP OP_2 OP_MUL OP_NIP '
        // bytes payload, bytes unused padding = 0x1234.split(1);
        // the unused last target is dropped straight off the top of the stack
        + '1234 OP_1 OP_SPLIT OP_DROP '
        // int acc = n;
        + 'OP_ROT '
        // if (acc > 0) {
        + 'OP_DUP OP_0 OP_GREATERTHAN OP_IF '
        // (acc, int unused scratch) = pair(acc);
        // the unused declaration is dropped instead of parked, then the reassignment
        // value folds into acc's slot
        + 'OP_DUP OP_DUP OP_1ADD OP_SWAP OP_2 OP_MUL OP_DROP OP_NIP OP_ENDIF '
        // require(acc + doubled >= 0);
        + 'OP_ROT OP_ADD OP_0 OP_GREATERTHANOREQUAL OP_VERIFY '
        // require(payload == 0x12);
        + '12 OP_EQUAL',
      fingerprint: '77f06b3b6cfe6d5e97768ab4c1649870173bfaedd960771ceec13a89356867cb',
      debug: {
        bytecode: '76768b7c529577021234517f757b7600a06376768b7c52957577687b9300a269011287',
        sourceMap: '12:60:12:61;:55::62:1;;;;;:8::63;15:46:15:52:0;:59::60;:46::61:1;:8::62;19:18:19:19:0;'
          + '20:12:20:15;:18::19;:12:::1;:21:22:9:0;21:45:21:48;:40::49:1;;;;;:12::50;;20:21:22:9;'
          + '24:22:24:29:0;:16:::1;:33::34:0;:16:::1;:8::36;25:27:25:31:0;:8::33:1',
        logs: [],
        requires: [{ ip: 29, line: 24 }, { ip: 32, line: 25 }],
        functions: [
          {
            name: 'pair',
            inputs: [{ name: 'x', type: 'int' }],
            bytecode: '768b7c5295',
            sourceMap: '6:11:6:12;:::16:1;:18::19:0;:22::23;:18:::1',
            logs: [],
            requires: [],
          },
        ],
        inlineRanges: '1:5:pair;17:21:pair',
      },
    },
  },
  {
    // Same contract without inlining: the unused-target drops behave identically around the
    // OP_INVOKE call sites
    compilerOptions: { disableInlining: true },
    artifact: {
      contractName: 'TupleModifiers',
      constructorInputs: [],
      abi: [{ name: 'spend', inputs: [{ name: 'n', type: 'int' }] }],
      bytecode:
        // OP_DEFINE pair (id 0)
        '768b7c5295 OP_0 OP_DEFINE '
        // int unused incremented, int constant doubled = pair(n);
        + 'OP_DUP OP_0 OP_INVOKE OP_NIP '
        // bytes payload, bytes unused padding = 0x1234.split(1);
        + '1234 OP_1 OP_SPLIT OP_DROP '
        // int acc = n;
        + 'OP_ROT '
        // if (acc > 0) { (acc, int unused scratch) = pair(acc); }
        + 'OP_DUP OP_0 OP_GREATERTHAN OP_IF OP_DUP OP_0 OP_INVOKE OP_DROP OP_NIP OP_ENDIF '
        // require(acc + doubled >= 0);
        + 'OP_ROT OP_ADD OP_0 OP_GREATERTHANOREQUAL OP_VERIFY '
        // require(payload == 0x12);
        + '12 OP_EQUAL',
      fingerprint: '9ded2366c857eb6d3a9405021cac16d4b2b52f740c7ed24176253851727990c4',
      debug: {
        bytecode: '05768b7c5295008976008a77021234517f757b7600a06376008a7577687b9300a269011287',
        sourceMap: '5::7:1;;::::1;12:60:12:61:0;:55::62:1;;:8::63;15:46:15:52:0;:59::60;:46::61:1;:8::62;'
          + '19:18:19:19:0;20:12:20:15;:18::19;:12:::1;:21:22:9:0;21:45:21:48;:40::49:1;;:12::50;;'
          + '20:21:22:9;24:22:24:29:0;:16:::1;:33::34:0;:16:::1;:8::36;25:27:25:31:0;:8::33:1',
        logs: [],
        requires: [{ ip: 26, line: 24 }, { ip: 29, line: 25 }],
        functions: [
          {
            id: 0,
            name: 'pair',
            inputs: [{ name: 'x', type: 'int' }],
            bytecode: '768b7c5295',
            sourceMap: '6:11:6:12;:::16:1;:18::19:0;:22::23;:18:::1',
            logs: [],
            requires: [],
          },
        ],
      },
    },
  },
];
