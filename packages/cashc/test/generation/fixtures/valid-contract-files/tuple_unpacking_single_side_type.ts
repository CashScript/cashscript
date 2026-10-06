import { Fixture } from '../../fixture-utils.js';

export const fixtures: Fixture[] = [
  {
    artifact: {
      contractName: 'Test',
      constructorInputs: [],
      abi: [{ name: 'split', inputs: [{ name: 'b', type: 'bytes' }] }],
      bytecode:
        // bytes16 x, bytes y = b.split(16);
        'OP_16 OP_SPLIT '
        // require(x == y);
        + 'OP_EQUAL',
      fingerprint: '470f52cf7c1f819e3a5492c7964c2b737a9c3586aba1e257e7bb8b65d341fa48',
      debug: {
        bytecode: '607f87',
        sourceMap: '3:37:3:39;:29::40:1;4:8:4:24',
        logs: [],
        requires: [{ ip: 3, line: 4 }],
      },
    },
  },
];
