import { Fixture } from '../../fixture-utils.js';

export const fixtures: Fixture[] = [
  {
    artifact: {
      contractName: 'Test',
      constructorInputs: [{ name: 'b', type: 'bytes' }],
      abi: [{ name: 'spend', inputs: [] }],
      bytecode:
        // bytes x = b.split(5)[1];
        'OP_DUP OP_5 OP_SPLIT OP_NIP '
        // require(x != b);
        + 'OP_2DUP OP_EQUAL OP_NOT OP_VERIFY '
        // require (b.split(4)[0] != x);
        + 'OP_SWAP OP_4 OP_SPLIT OP_DROP OP_EQUAL OP_NOT',
      fingerprint: '02695f7d89ef8e5ca54c56e0b66c9313a0108f34fa5b0c4cebcfa2969f662cc4',
      debug: {
        bytecode: '76557f776e8791697c547f758791',
        sourceMap: '3:18:3:19;:26::27;:18::28:1;:::31;4:16:4:22:0;::::1;;:8::24;5:17:5:18:0;:25::26;:17::27:1;:::30;:::35;:8::37',
        logs: [],
        requires: [{ ip: 8, line: 4 }, { ip: 15, line: 5 }],
      },
    },
  },
];
