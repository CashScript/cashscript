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
        + 'OP_DUP OP_3 OP_SUB '
        // require(x == 12);
        + 'OP_12 OP_NUMEQUAL '
        // Cleanup
        + 'OP_NIP OP_NIP',
      fingerprint: '3e67ebf63dbbf278589d0fffe8dd94663758334a8bf7858ea9c3613cd472b190',
      debug: {
        bytecode: '5a765593765f9d7653945c9c7777',
        sourceMap: '3:16:3:18;4:8:4:9;:13::14;:8:::1;5:16:5:17:0;:21::23;:8::25:1;7::7:9:0;:13::14;:8:::1;8:21:8:23:0;:8::25:1;2:21:9:5;',
        logs: [],
        requires: [{ ip: 6, line: 5 }, { ip: 12, line: 8 }],
        sourceTags: '12:13:sc',
      },
    },
  },
];
