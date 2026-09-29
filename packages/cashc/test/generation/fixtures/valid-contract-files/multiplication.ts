import { Fixture } from '../../fixture-utils.js';

export const fixtures: Fixture[] = [
  {
    artifact: {
      contractName: 'Test',
      constructorInputs: [{ name: 'x', type: 'int' }],
      abi: [{ name: 'hello', inputs: [] }],
      bytecode:
        // int myVariable = 10 - 4;
        'OP_10 OP_4 OP_SUB '
        // int myOtherVariable = 20 * myVariable % 2;
        + '14 OP_MUL OP_2 OP_MOD '
        // require(myOtherVariable > x);
        + 'OP_LESSTHAN',
      fingerprint: '74e026fb37d71dac744827708122e9b318eda1b8beca52c272c4a6f888cc1617',
      debug: {
        bytecode: '5a549401149552979f',
        sourceMap: '3:25:3:27;:30::31;:25:::1;4:30:4:32:0;:::45:1;:48::49:0;:30:::1;5:8:5:37',
        logs: [],
        requires: [{ ip: 9, line: 5 }],
      },
    },
  },
];
