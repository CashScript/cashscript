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
        // } while (i < tx.inputs.length);
        + 'OP_DUP OP_TXINPUTCOUNT OP_GREATERTHANOREQUAL OP_UNTIL '
        // require(i > 2);
        + 'OP_2 OP_GREATERTHAN',
      fingerprint: 'a1926f6964606192bb765db69639d46975507c021b233c1456d344398fa5b8f5',
      debug: {
        bytecode: '00658b76c3a26652a0',
        sourceMap: '3:16:3:17;5:8:7:39;6:12:6:22:1;7:17:7:18:0;:21::37;5:8::39:1;;10:20:10:21:0;:8::23:1',
        logs: [{ ip: 7, line: 9, data: [{ stackIndex: 0, type: 'int', ip: 7 }] }],
        requires: [{ ip: 9, line: 10 }],
      },
    },
  },
];
