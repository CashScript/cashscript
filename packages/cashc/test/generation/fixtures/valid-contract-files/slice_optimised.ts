import { Fixture } from '../../fixture-utils.js';

export const fixtures: Fixture[] = [
  {
    artifact: {
      contractName: 'Slice',
      constructorInputs: [{ name: 'data', type: 'bytes32' }],
      abi: [{ name: 'spend', inputs: [] }],
      bytecode: '14 OP_SPLIT OP_DROP OP_0 14 OP_NUM2BIN OP_EQUAL',
      debug: {
        bytecode: '01147f750001148087',
        sourceMap: '3:36:3:38;:22::39:1;;4:37:4:38:0;:40::42;:23::43:1;:8::45',
        logs: [],
        requires: [
          {
            ip: 8,
            line: 4,
            message: undefined,
          },
        ],
      },
      fingerprint: '779b8278e2831727686ad5c96b85bb01bab5f2692edd34d703b9d437da77ac03',
    },
  },
];
