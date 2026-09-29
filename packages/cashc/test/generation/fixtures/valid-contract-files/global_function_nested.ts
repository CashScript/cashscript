import { Fixture } from '../../fixture-utils.js';

export const fixtures: Fixture[] = [
  {
    artifact: {
      contractName: 'GlobalFunctionNested',
      constructorInputs: [],
      abi: [{ name: 'spend', inputs: [{ name: 'x', type: 'int' }] }],
      bytecode:
        // require(doubleIncremented(x) == 8);
        'OP_1ADD OP_2 OP_MUL OP_8 OP_NUMEQUAL',
      fingerprint: '01c59dd1621703390bdc5e526ab56f2a37ed8cef6d3a61ff6218a80d51831703',
      debug: {
        bytecode: '8b5295589c',
        sourceMap: '11:16:11:36:1;;;:40::41:0;:8::43:1',
        logs: [],
        requires: [{ ip: 5, line: 11 }],
        functions: [
          {
            name: 'addOne',
            inputs: [{ name: 'a', type: 'int' }],
            bytecode: '8b',
            sourceMap: '2:11:2:16:1',
            logs: [],
            requires: [],
          },
          {
            name: 'doubleIncremented',
            inputs: [{ name: 'a', type: 'int' }],
            bytecode: '8b5295',
            sourceMap: '6:11:6:20:1;:23::24:0;:11:::1',
            logs: [],
            requires: [],
            inlineRanges: '0:0:addOne',
          },
        ],
        inlineRanges: '0:2:doubleIncremented',
      },
    },
  },
];
