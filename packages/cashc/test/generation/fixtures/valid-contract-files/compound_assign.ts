import { Fixture } from '../../fixture-utils.js';

export const fixtures: Fixture[] = [
  {
    artifact: {
      contractName: 'CompoundAssign',
      constructorInputs: [],
      abi: [{ name: 'spend', inputs: [] }],
      bytecode:
        // int x = 10;
        'OP_10 '
        // x += 5;
        + 'OP_DUP OP_5 OP_ADD '
        // require(x == 15);
        + 'OP_DUP OP_15 OP_NUMEQUALVERIFY '
        // x -= 3;
        + 'OP_3 OP_SUB '
        // require(x == 12);
        + 'OP_12 OP_NUMEQUAL '
        // Cleanup
        + 'OP_NIP',
      fingerprint: 'c67fdea7bf9a5f18f19e1940adefc1f4b9add4f1957c1c0f2d45ae7e2e8eb1e6',
      debug: {
        bytecode: '5a765593765f9d53945c9c77',
        sourceMap: '3:16:3:18;4:8:4:9;:13::14;:8:::1;5:16:5:17:0;:21::23;:8::25:1;7:13:7:14:0;:8:::1;8:21:8:23:0;:8::25:1;2:21:9:5',
        logs: [],
        requires: [{ ip: 6, line: 5 }, { ip: 11, line: 8 }],
        sourceTags: '11:11:sc',
      },
    },
  },
];
