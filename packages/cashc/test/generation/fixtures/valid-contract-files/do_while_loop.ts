import { Fixture } from '../../fixture-utils.js';

export const fixtures: Fixture[] = [
  {
    artifact: {
      contractName: 'Loopy',
      constructorInputs: [],
      abi: [{ name: 'doLoop', inputs: [] }],
      bytecode:
        // int i = 0;
        'OP_0 '
        // do {
        + 'OP_BEGIN '
        // i = i + 1;
        + 'OP_DUP OP_1ADD OP_NIP '
        // } while (i < tx.inputs.length);
        + 'OP_DUP OP_TXINPUTCOUNT OP_GREATERTHANOREQUAL OP_UNTIL '
        // require(i > 2);
        + 'OP_2 OP_GREATERTHAN',
      fingerprint: '45d5cf43034d482df71ca54496793bff3f932d37dd77e95367edeb22a98a9154',
      debug: {
        bytecode: '0065768b7776c3a26652a0',
        sourceMap: '3:16:3:17;5:8:7:39;6:16:6:17;:::21:1;:12::22;7:17:7:18:0;:21::37;5:8::39:1;;10:20:10:21:0;:8::23:1',
        logs: [{ ip: 9, line: 9, data: [{ stackIndex: 0, type: 'int', ip: 9 }] }],
        requires: [{ ip: 11, line: 10 }],
      },
    },
  },
];
