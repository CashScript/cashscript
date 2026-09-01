import { Fixture } from '../../fixture-utils.js';

export const fixtures: Fixture[] = [
  {
    artifact: {
      contractName: 'GlobalFunctionMultiReturnThree',
      constructorInputs: [],
      abi: [{ name: 'spend', inputs: [{ name: 'x', type: 'int' }] }],
      bytecode:
        // int p, int q, int r = spread(x);
        'OP_DUP OP_DUP OP_1ADD OP_ROT OP_2 OP_ADD '
        // require(p == 5);
        + 'OP_ROT OP_5 OP_NUMEQUALVERIFY '
        // require(q == 6);
        + 'OP_SWAP OP_6 OP_NUMEQUALVERIFY '
        // require(r == 7);
        + 'OP_7 OP_NUMEQUAL',
      fingerprint: 'aa5e498180e729156632201aff442d09e0c613298bf26169ff93956605eb2cfb',
      debug: {
        bytecode: '76768b7b52937b559d7c569d579c',
        sourceMap: '7:30:7:39:1;;;;;;8:16:8:17:0;:21::22;:8::24:1;9:16:9:17:0;:21::22;:8::24:1;10:21:10:22:0;:8::24:1',
        logs: [],
        requires: [{ ip: 8, line: 8 }, { ip: 11, line: 9 }, { ip: 14, line: 10 }],
        functions: [
          {
            name: 'spread',
            inputs: [{ name: 'a', type: 'int' }],
            bytecode: '76768b7b5293',
            sourceMap: '2:11:2:15;;:14::19:1;:21::22:0;:25::26;:21:::1',
            logs: [],
            requires: [],
          },
        ],
        inlineRanges: '0:5:spread',
      },
    },
  },
];
