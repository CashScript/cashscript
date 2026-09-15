import { Fixture } from '../../fixture-utils.js';

export const fixtures: Fixture[] = [
  {
    artifact: {
      contractName: 'LogIntermediateResults',
      constructorInputs: [{ name: 'owner', type: 'pubkey' }],
      abi: [{ name: 'test_log_intermediate_result', inputs: [] }],
      bytecode: 'OP_HASH256 OP_SIZE OP_NIP 20 OP_NUMEQUAL',
      debug: {
        bytecode: 'aa827701209c',
        sourceMap: '3:29:5:47:1;6:16:6:33;;:37::39:0;:8::74:1',
        logs: [
          {
            ip: 1,
            line: 4,
            data: [
              {
                stackIndex: 0,
                type: 'bytes32',
                ip: 1,
                transformations: 'OP_SHA256',
              },
            ],
          },
        ],
        requires: [
          {
            ip: 6,
            line: 6,
            message: 'doubleHash should be 32 bytes',
          },
        ],
      },
      fingerprint: '47bb8f4ee4f62d7ecefc7f43fd7b61d2da71767df35d3dfd90149719287a0860',
    },
  },
];
