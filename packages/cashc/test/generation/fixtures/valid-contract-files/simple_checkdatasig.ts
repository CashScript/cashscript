import { Fixture } from '../../fixture-utils.js';

export const fixtures: Fixture[] = [
  {
    artifact: {
      contractName: 'Test',
      constructorInputs: [{ name: 's', type: 'datasig' }, { name: 'pk', type: 'pubkey' }],
      abi: [{ name: 'cds', inputs: [{ name: 'data', type: 'bytes' }] }],
      bytecode:
        // require(checkDataSig(s, data, pk));
        'OP_ROT OP_ROT OP_CHECKDATASIG',
      fingerprint: 'ae21c0109dbe19b96e779f3e6d9b4dad3016ee311dfee3fce8af717c8d81bfff',
      debug: {
        bytecode: '7b7bba',
        sourceMap: '3:32:3:36;:38::40;:8::43:1',
        logs: [],
        requires: [{ ip: 5, line: 3 }],
      },
    },
  },
];
