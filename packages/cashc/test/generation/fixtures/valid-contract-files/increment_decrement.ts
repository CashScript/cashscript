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
        + 'OP_1SUB '
        // require(x == 5);
        + 'OP_5 OP_NUMEQUAL '
        // Cleanup
        + 'OP_NIP',
      fingerprint: '142fea5495e16cd7fd687d05c5ab810d99db4dff3c1c200e3a16e457e1c135aa',
      debug: {
        bytecode: '55768b76569d8c559c77',
        sourceMap: '3:16:3:17;4:8:4:9;:::11:1;5:16:5:17:0;:21::22;:8::24:1;7::7:11;8:21:8:22:0;:8::24:1;2:21:9:5',
        logs: [],
        requires: [{ ip: 5, line: 5 }, { ip: 9, line: 8 }],
        sourceTags: '9:9:sc',
      },
    },
  },
];
