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
        // require(i < 10);
        + 'OP_DUP OP_10 OP_LESSTHAN OP_VERIFY '
        // } while (i < tx.inputs.length);
        + 'OP_DUP OP_TXINPUTCOUNT OP_GREATERTHANOREQUAL OP_UNTIL '
        // }
        + 'OP_DROP OP_1',
      fingerprint: 'ce6d7a3b336f2b8c85a25c362635f801df5ebc31a54f6940c02df6966d7dd484',
      debug: {
        bytecode: '0065768b77765a9f6976c3a2667551',
        sourceMap: '3:16:3:17;5:8:8:39;6:16:6:17;:::21:1;:12::22;7:20:7:21:0;:24::26;:20:::1;:12::28;8:17:8:18:0;:21::37;5:8::39:1;;2:22:9:5;',
        logs: [],
        requires: [{ ip: 8, line: 7 }],
      },
    },
  },
];
