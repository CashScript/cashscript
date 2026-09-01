import { Fixture } from '../../fixture-utils.js';

export const fixtures: Fixture[] = [
  {
    artifact: {
      contractName: 'BigInt',
      constructorInputs: [],
      abi: [{ name: 'proofOfBigInt', inputs: [{ name: 'x', type: 'int' }, { name: 'y', type: 'int' }] }],
      bytecode:
        // int maxInt32PlusOne = 2147483648;
        '0000008000 '
        // require(x >= maxInt32PlusOne);
        + 'OP_2DUP OP_GREATERTHANOREQUAL OP_VERIFY '
        // require(x * y >= maxInt32PlusOne);
        + 'OP_SWAP OP_ROT OP_MUL OP_LESSTHANOREQUAL',
      fingerprint: 'f14ce38215a2c251b9851e2e8d60b1faf88093ace31621cca1d7cacbe38442a7',
      debug: {
        bytecode: '0500000080006ea2697c7b95a1',
        sourceMap: '3:30:3:40;4:16:4:36;::::1;:8::38;5:16:5:17:0;:20::21;:16:::1;:8::42',
        logs: [],
        requires: [{ ip: 3, line: 4 }, { ip: 8, line: 5 }],
      },
    },
  },
];
