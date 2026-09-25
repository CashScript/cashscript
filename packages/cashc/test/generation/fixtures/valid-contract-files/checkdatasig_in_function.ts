import { Fixture } from '../../fixture-utils.js';

export const fixtures: Fixture[] = [
  {
    artifact: {
      contractName: 'Test',
      constructorInputs: [],
      abi: [
        {
          name: 'spend',
          inputs: [{ name: 's', type: 'datasig' }, { name: 'message', type: 'bytes' }, { name: 'pk', type: 'pubkey' }],
        },
      ],
      bytecode:
        // require(verifyData(s, message, pk));
        'OP_SWAP OP_ROT OP_CHECKDATASIG',
      fingerprint: '1a1dd563b4b81503ce471252e609976731a2946d4466485eac35594ff2cc47f8',
      debug: {
        bytecode: '7c7bba',
        sourceMap: '7:30:7:37;:39::41;:8::44:1',
        logs: [],
        requires: [{ ip: 3, line: 7 }],
        functions: [
          {
            name: 'verifyData',
            inputs: [
              { name: 's', type: 'datasig' },
              { name: 'message', type: 'bytes' },
              { name: 'pk', type: 'pubkey' },
            ],
            bytecode: 'ba',
            sourceMap: '2:11:2:39:1',
            logs: [],
            requires: [],
          },
        ],
        inlineRanges: '2:2:verifyData',
      },
    },
  },
];
