import { Fixture } from '../../fixture-utils.js';

export const fixtures: Fixture[] = [
  {
    artifact: {
      contractName: 'Test',
      constructorInputs: [{ name: 'x', type: 'bytes4' }],
      abi: [{ name: 'test', inputs: [{ name: 'y', type: 'bytes4' }] }],
      bytecode:
        // Implicit parameter type enforcement
        'OP_SWAP OP_SIZE OP_4 OP_EQUALVERIFY '
        // require(unsafe_int(x) > unsafe_int(y));
        + 'OP_GREATERTHAN',
      fingerprint: 'f46c0c6d3ac4de281708e6abe5b28f03eb7f3878ba6554c53a102e2bca1d4676',
      debug: {
        bytecode: '7c825488a0',
        sourceMap: '2:18:2:26;;;;3:8:3:47:1',
        logs: [],
        requires: [{ ip: 6, line: 3 }],
        sourceTags: '0:3:pv',
      },
    },
  },
];
