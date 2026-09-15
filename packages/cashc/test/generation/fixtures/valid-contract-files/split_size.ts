import { Fixture } from '../../fixture-utils.js';

export const fixtures: Fixture[] = [
  {
    artifact: {
      contractName: 'SplitSize',
      constructorInputs: [{ name: 'b', type: 'bytes' }],
      abi: [{ name: 'spend', inputs: [] }],
      bytecode:
        // bytes x = b.split(b.length / 2)[1]
        'OP_DUP OP_DUP OP_SIZE OP_NIP OP_2 OP_DIV OP_SPLIT OP_NIP '
        // require(x != b)
        + 'OP_2DUP OP_EQUAL OP_NOT OP_VERIFY '
        // bytes x = b.split(b.length / 2)[1]
        + 'OP_SWAP OP_4 OP_SPLIT OP_DROP OP_EQUAL OP_NOT',
      debug: {
        bytecode: '7676827752967f776e8791697c547f758791',
        logs: [],
        requires: [
          { ip: 12, line: 4 },
          { ip: 19, line: 5 },
        ],
        sourceMap: '3:18:3:27;;:26::34:1;;:37::38:0;:26:::1;:18::39;:::42;4:16:4:22:0;::::1;;:8::24;5:16:5:17:0;:24::25;:16::26:1;:::29;:::34;:8::36',
      },
      fingerprint: '49d50376d8aa76534f29c049b987238d577ce332202a2f0da0cb74d94a027b79',
    },
  },
];
