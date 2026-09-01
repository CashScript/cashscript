import { Fixture } from '../../fixture-utils.js';

export const fixtures: Fixture[] = [
  {
    artifact: {
      contractName: 'GlobalFunctionSimple',
      constructorInputs: [],
      abi: [{ name: 'spend', inputs: [{ name: 'x', type: 'int' }] }],
      bytecode:
        // require(double(x) == 6);
        'OP_2 OP_MUL OP_6 OP_NUMEQUAL',
      fingerprint: '36698e75d5530f81a95354d9c1c11e7de7c8867595b28ca69cad14e24647ccf3',
      debug: {
        bytecode: '5295569c',
        sourceMap: '7:16:7:25:1;;:29::30:0;:8::32:1',
        logs: [],
        requires: [{ ip: 4, line: 7 }],
        functions: [
          {
            name: 'double',
            inputs: [{ name: 'a', type: 'int' }],
            bytecode: '5295',
            sourceMap: '2:15:2:16;:11:::1',
            logs: [],
            requires: [],
          },
        ],
        inlineRanges: '0:1:double',
      },
    },
  },
  {
    // A single global function — the basic OP_DEFINE / OP_INVOKE calling convention.
    compilerOptions: { disableInlining: true },
    artifact: {
      contractName: 'GlobalFunctionSimple',
      constructorInputs: [],
      abi: [{ name: 'spend', inputs: [{ name: 'x', type: 'int' }] }],
      bytecode:
        // OP_DEFINE double (id 0): return a * 2
        '5295 OP_0 OP_DEFINE '
        // require(double(x) == 6)
        + 'OP_0 OP_INVOKE OP_6 OP_NUMEQUAL',
      debug: {
        bytecode: '0252950089008a569c',
        logs: [],
        requires: [
          { ip: 7, line: 7 },
        ],
        sourceMap: '1::3:1;;::::1;7:16:7:25;;:29::30:0;:8::32:1',
        functions: [
          {
            id: 0,
            name: 'double',
            inputs: [{ name: 'a', type: 'int' }],
            bytecode: '5295',
            sourceMap: '2:15:2:16;:11:::1',
            logs: [],
            requires: [],
          },
        ],
      },
      fingerprint: 'ef6dd7819e66a430286fe16f3d6dad7e026cf1970eda6bc620be7e7a3bdd2a4d',
    },
  },
];
