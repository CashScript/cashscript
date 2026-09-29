import { Fixture } from '../../fixture-utils.js';

export const fixtures: Fixture[] = [
  {
    artifact: {
      contractName: 'SplitSize',
      constructorInputs: [{ name: 'b', type: 'bytes' }],
      abi: [{ name: 'spend', inputs: [] }],
      bytecode:
        // bytes x = b.split(b.length / 2)[1]
        'OP_DUP OP_SIZE OP_2 OP_DIV OP_SPLIT OP_NIP '
        // require(x != b)
        + 'OP_2DUP OP_EQUAL OP_NOT OP_VERIFY '
        // bytes x = b.split(b.length / 2)[1]
        + 'OP_SWAP OP_4 OP_SPLIT OP_DROP OP_EQUAL OP_NOT',
      debug: {
        bytecode: '768252967f776e8791697c547f758791',
        logs: [],
        requires: [
          { ip: 10, line: 4 },
          { ip: 17, line: 5 },
        ],
        sourceMap: '3:18:3:27;:::34:1;:37::38:0;:26:::1;:18::39;:::42;4:16:4:22:0;::::1;;:8::24;5:16:5:17:0;:24::25;:16::26:1;:::29;:::34;:8::36',
      },
      fingerprint: '2df4a139558bd0eac768c9361f8fc16781906f7dcb42f8c2ff6b0459da0bbcfd',
    },
  },
];
