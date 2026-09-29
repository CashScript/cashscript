import { Fixture } from '../../fixture-utils.js';

export const fixtures: Fixture[] = [
  {
    artifact: {
      contractName: 'Test',
      constructorInputs: [],
      abi: [{ name: 'split', inputs: [{ name: 'b', type: 'bytes32' }] }],
      bytecode:
        // Implicit parameter type enforcement
        'OP_SIZE 20 OP_EQUALVERIFY '
        // bytes16 x, bytes16 y =  b.split(16);
        + 'OP_16 OP_SPLIT '
        // require(x == y);
        + 'OP_EQUAL',
      fingerprint: 'a99422ca4eb162381e18295a9ac1ff2aca6f511a7e72d12342ef4f61904a3094',
      debug: {
        bytecode: '82012088607f87',
        sourceMap: '2:19:2:28;;;3:40:3:42;:32::43:1;4:8:4:24',
        logs: [],
        requires: [{ ip: 6, line: 4 }],
        sourceTags: '0:2:pv',
      },
    },
  },
];
