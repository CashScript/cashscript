import { Fixture } from '../../fixture-utils.js';

export const fixtures: Fixture[] = [
  {
    artifact: {
      contractName: 'GlobalFunctionMultiReturn',
      constructorInputs: [],
      abi: [{ name: 'spend', inputs: [{ name: 'x', type: 'int' }] }],
      bytecode:
        // int q, int r = divmod(x, 3);
        'OP_3 OP_2DUP OP_DIV OP_ROT OP_ROT OP_MOD '
        // require(q == 4);
        + 'OP_SWAP OP_4 OP_NUMEQUALVERIFY '
        // require(r == 1);
        + 'OP_1 OP_NUMEQUAL',
      fingerprint: '04958e32271966d1b4d4365481f1d3210fde12595fa9261b454f430bf8afe521',
      debug: {
        bytecode: '536e967b7b977c549d519c',
        sourceMap: '7:33:7:34;:23::35:1;;;;;8:16:8:17:0;:21::22;:8::24:1;9:21:9:22:0;:8::24:1',
        logs: [],
        requires: [{ ip: 8, line: 8 }, { ip: 11, line: 9 }],
        functions: [
          {
            name: 'divmod',
            inputs: [{ name: 'a', type: 'int' }, { name: 'b', type: 'int' }],
            bytecode: '6e967b7b97',
            sourceMap: '2:11:2:16;::::1;:18::19:0;:22::23;:18:::1',
            logs: [],
            requires: [],
          },
        ],
        inlineRanges: '1:5:divmod',
      },
    },
  },
  {
    // A multi-return function — locks in the calling convention: return values are left on the stack
    // in declared order (last value on top) and bound by an N-ary tuple destructuring at the call site.
    compilerOptions: { disableInlining: true },
    artifact: {
      contractName: 'GlobalFunctionMultiReturn',
      constructorInputs: [],
      abi: [{ name: 'spend', inputs: [{ name: 'x', type: 'int' }] }],
      bytecode:
        // OP_DEFINE divmod (id 0): return a / b, a % b — leaves [quotient, remainder], remainder on top
        '6e967b7b97 OP_0 OP_DEFINE '
        // int q, int r = divmod(x, 3); require(q == 4); require(r == 1)
        + 'OP_3 OP_0 OP_INVOKE OP_SWAP OP_4 OP_NUMEQUALVERIFY OP_1 OP_NUMEQUAL',
      debug: {
        bytecode: '056e967b7b97008953008a7c549d519c',
        logs: [],
        requires: [
          { ip: 8, line: 8 },
          { ip: 11, line: 9 },
        ],
        sourceMap: '1::3:1;;::::1;7:33:7:34:0;:23::35:1;;8:16:8:17:0;:21::22;:8::24:1;9:21:9:22:0;:8::24:1',
        functions: [
          {
            id: 0,
            name: 'divmod',
            inputs: [{ name: 'a', type: 'int' }, { name: 'b', type: 'int' }],
            bytecode: '6e967b7b97',
            sourceMap: '2:11:2:16;::::1;:18::19:0;:22::23;:18:::1',
            logs: [],
            requires: [],
          },
        ],
      },
      fingerprint: 'f747468c9408ec52949a22dc2f271a944ee5793eabaa913c9c2b1b4c3fbd0a56',
    },
  },
];
