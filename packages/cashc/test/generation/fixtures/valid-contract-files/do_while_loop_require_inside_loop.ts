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
        + 'OP_1ADD '
        // require(i < 10);
        + 'OP_DUP OP_10 OP_LESSTHAN OP_VERIFY '
        // } while (i < tx.inputs.length);
        + 'OP_DUP OP_TXINPUTCOUNT OP_GREATERTHANOREQUAL OP_UNTIL '
        // }
        + 'OP_DROP OP_1',
      fingerprint: '8ba3e5e6fcc79a8e3fb57ac388692ae3b49fbece9f528e547380b24338a8d8b9',
      debug: {
        bytecode: '00658b765a9f6976c3a2667551',
        sourceMap: '3:16:3:17;5:8:8:39;6:12:6:22:1;7:20:7:21:0;:24::26;:20:::1;:12::28;8:17:8:18:0;:21::37;5:8::39:1;;2:22:9:5;',
        logs: [],
        requires: [{ ip: 6, line: 7 }],
      },
    },
  },
];
