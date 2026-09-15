import { Fixture } from '../../fixture-utils.js';

export const fixtures: Fixture[] = [
  {
    artifact: {
      contractName: 'SplitTyped',
      constructorInputs: [{ name: 'b', type: 'bytes' }],
      abi: [{ name: 'spend', inputs: [] }],
      bytecode:
        // bytes4 x = b.split(4)[0];
        'OP_DUP OP_4 OP_SPLIT OP_DROP '
        // require(x != b);
        + 'OP_EQUAL OP_NOT',
      fingerprint: 'f7275cb70302001a89ebddc0a65f7ead064a0f0a8887a7b8317a912696d96654',
      debug: {
        bytecode: '76547f758791',
        sourceMap: '3:19:3:20;:27::28;:19::29:1;:::32;4:16:4:22;:8::24',
        logs: [],
        requires: [{ ip: 7, line: 4 }],
      },
    },
  },
];
