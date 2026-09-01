import { Fixture } from '../../fixture-utils.js';

export const fixtures: Fixture[] = [
  {
    artifact: {
      contractName: 'GlobalFunctionMultiParam',
      constructorInputs: [],
      abi: [{ name: 'spend', inputs: [{ name: 'x', type: 'int' }, { name: 'y', type: 'int' }] }],
      bytecode:
        // require(sub(x, y) == 7);
        'OP_SWAP OP_SUB OP_7 OP_NUMEQUAL',
      fingerprint: 'e2fc400768dc40234ade786da44ad2a623d43f73ee5b70af21da0647616b162f',
      debug: {
        bytecode: '7c94579c',
        sourceMap: '7:23:7:24;:16::25:1;:29::30:0;:8::32:1',
        logs: [],
        requires: [{ ip: 4, line: 7 }],
        functions: [
          {
            name: 'sub',
            inputs: [{ name: 'a', type: 'int' }, { name: 'b', type: 'int' }],
            bytecode: '94',
            sourceMap: '2:11:2:16:1',
            logs: [],
            requires: [],
          },
        ],
        inlineRanges: '1:1:sub',
      },
    },
  },
  {
    // A multi-parameter global function — locks in the parameter stack-seeding and argument order
    // (the contract OP_SWAPs x and y into place; the body computes a - b directly).
    compilerOptions: { disableInlining: true },
    artifact: {
      contractName: 'GlobalFunctionMultiParam',
      constructorInputs: [],
      abi: [{ name: 'spend', inputs: [{ name: 'x', type: 'int' }, { name: 'y', type: 'int' }] }],
      bytecode:
        // OP_DEFINE sub (id 0): return a - b
        '94 OP_0 OP_DEFINE '
        // require(sub(x, y) == 7)
        + 'OP_SWAP OP_0 OP_INVOKE OP_7 OP_NUMEQUAL',
      debug: {
        bytecode: '019400897c008a579c',
        logs: [],
        requires: [
          { ip: 8, line: 7 },
        ],
        sourceMap: '1::3:1;;::::1;7:23:7:24:0;:16::25:1;;:29::30:0;:8::32:1',
        functions: [
          {
            id: 0,
            name: 'sub',
            inputs: [{ name: 'a', type: 'int' }, { name: 'b', type: 'int' }],
            bytecode: '94',
            sourceMap: '2:11:2:16:1',
            logs: [],
            requires: [],
          },
        ],
      },
      fingerprint: '8fc72a3f89ee3238266d6dd9ad3919f7238c8d6a31296cc8925968a31c78c7dc',
    },
  },
];
