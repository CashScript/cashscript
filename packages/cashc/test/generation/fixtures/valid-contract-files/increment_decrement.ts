import { Fixture } from '../../fixture-utils.js';

export const fixtures: Fixture[] = [
  {
    artifact: {
      contractName: 'IncrementDecrement',
      constructorInputs: [],
      abi: [{ name: 'spend', inputs: [] }],
      bytecode:
        // int x = 5;
        'OP_5 '
        // x++;
        + 'OP_DUP OP_1ADD '
        // require(x == 6);
        + 'OP_DUP OP_6 OP_NUMEQUALVERIFY '
        // x--;
        + 'OP_DUP OP_1SUB '
        // require(x == 5);
        + 'OP_5 OP_NUMEQUAL '
        // Cleanup
        + 'OP_NIP OP_NIP',
      fingerprint: '5ccf48b6901709f59aaa5fab621021cf8598fb6fdd591f7f714902070c84bb85',
      debug: {
        bytecode: '55768b76569d768c559c7777',
        sourceMap: '3:16:3:17;4:8:4:9;:::11:1;5:16:5:17:0;:21::22;:8::24:1;7::7:9:0;:::11:1;8:21:8:22:0;:8::24:1;2:21:9:5;',
        logs: [],
        requires: [{ ip: 5, line: 5 }, { ip: 10, line: 8 }],
        sourceTags: '10:11:sc',
      },
    },
  },
];
