import { Fixture } from '../../fixture-utils.js';

export const fixtures: Fixture[] = [
  {
    artifact: {
      contractName: 'Slice',
      constructorInputs: [{ name: 'pkh', type: 'bytes20' }],
      abi: [{ name: 'spend', inputs: [] }],
      bytecode: 'OP_INPUTINDEX OP_UTXOBYTECODE 17 OP_SPLIT OP_DROP OP_3 OP_SPLIT OP_NIP OP_EQUAL',
      debug: {
        bytecode: 'c0c701177f75537f7787',
        sourceMap: '3:36:3:57;:26::74:1;:84::86:0;:26::87:1;;:81::82:0;:26::87:1;;4:8:4:34',
        logs: [],
        requires: [
          {
            ip: 10,
            line: 4,
            message: undefined,
          },
        ],
      },
      fingerprint: 'd8574d80ab674df33841526cf2767c09a9dc02d2faea91746465e22e3b81ae3a',
    },
  },
];
