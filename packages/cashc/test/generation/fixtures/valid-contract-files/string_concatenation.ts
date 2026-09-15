import { Fixture } from '../../fixture-utils.js';

export const fixtures: Fixture[] = [
  {
    artifact: {
      contractName: 'Test',
      constructorInputs: [],
      abi: [{ name: 'hello', inputs: [{ name: 'who', type: 'string' }] }],
      bytecode:
        // require(("hello " + who).length + 2 > 5);
        '68656c6c6f20 OP_SWAP OP_CAT OP_SIZE OP_NIP OP_2 OP_ADD OP_5 OP_GREATERTHAN',
      fingerprint: '142914f037f5f8f71cb7a5cad4be959f39db80fc6411fd1c0ddd02b14a620eb4',
      debug: {
        bytecode: '0668656c6c6f207c7e8277529355a0',
        sourceMap: '3:17:3:25;:28::31;:17:::1;:16::39;;:42::43:0;:16:::1;:46::47:0;:8::49:1',
        logs: [],
        requires: [{ ip: 9, line: 3 }],
      },
    },
  },
];
