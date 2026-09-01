import { Fixture } from '../../fixture-utils.js';

export const fixtures: Fixture[] = [
  {
    artifact: {
      contractName: 'Num2Bin',
      constructorInputs: [],
      abi: [
        { name: 'spend', inputs: [{ name: 'size', type: 'int' }] },
      ],
      bytecode: 'OP_10 OP_SWAP OP_NUM2BIN OP_BIN2NUM OP_10 OP_NUMEQUAL',
      debug: {
        bytecode: '5a7c80815a9c',
        logs: [],
        requires: [{ ip: 6, line: 4 }],
        sourceMap: '3:36:3:38;:40::44;:22::45:1;4:16:4:26;:30::32:0;:8::34:1',
      },
      fingerprint: '7ebb008689b080dce1061a508173a617c58b68202899cfd17a32f1a5decd4bb6',
    },
  },
];
