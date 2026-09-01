import { Fixture } from '../../fixture-utils.js';

export const fixtures: Fixture[] = [
  {
    artifact: {
      contractName: 'Test',
      constructorInputs: [],
      abi: [{ name: 'covenant', inputs: [] }],
      bytecode:
        // require(tx.version == 2);
        'OP_TXVERSION OP_2 OP_NUMEQUAL',
      fingerprint: '23acf2123933daf216d03e942aa31471f3a3e07987eeb591b5a3892c5a443579',
      debug: {
        bytecode: 'c2529c',
        sourceMap: '3:16:3:26;:30::31;:8::33:1',
        logs: [],
        requires: [{ ip: 3, line: 3 }],
      },
    },
  },
];
