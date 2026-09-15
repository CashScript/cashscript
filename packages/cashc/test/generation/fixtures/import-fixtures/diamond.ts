import fs from 'fs';
import { URL } from 'url';
import { Fixture } from '../../fixture-utils.js';

export const fixtures: Fixture[] = [
  {
    artifact: {
      contractName: 'Diamond',
      constructorInputs: [],
      abi: [{ name: 'spend', inputs: [{ name: 'x', type: 'int' }] }],
      bytecode:
        // require(m1(x) + m2(x) == 18);
        'OP_DUP OP_1ADD OP_2 OP_MUL OP_SWAP OP_1ADD OP_3 OP_ADD OP_ADD 12 OP_NUMEQUAL',
      fingerprint: '0467d6dd3d6e156739eece6d6d2111816622b43d31469b7fe7cbbcc59272759b',
      debug: {
        bytecode: '768b52957c8b53939301129c',
        sourceMap: '6:19:6:20;:16::21:1;;;:27::28:0;:24::29:1;;;:16;:33::35:0;:8::37:1',
        logs: [],
        requires: [{ ip: 11, line: 6 }],
        functions: [
          {
            name: 'leaf',
            inputs: [{ name: 'a', type: 'int' }],
            bytecode: '8b',
            sourceMap: '2:11:2:16:1',
            source: fs.readFileSync(new URL('../../../import-fixtures/leaf.cash', import.meta.url), { encoding: 'utf-8' }),
            sourceFile: 'leaf.cash',
            logs: [],
            requires: [],
          },
          {
            name: 'm1',
            inputs: [{ name: 'a', type: 'int' }],
            bytecode: '8b5295',
            sourceMap: '3:11:3:18:1;:21::22:0;:11:::1',
            source: fs.readFileSync(new URL('../../../import-fixtures/mid1.cash', import.meta.url), { encoding: 'utf-8' }),
            sourceFile: 'mid1.cash',
            logs: [],
            requires: [],
            inlineRanges: '0:0:leaf',
          },
          {
            name: 'm2',
            inputs: [{ name: 'a', type: 'int' }],
            bytecode: '8b5393',
            sourceMap: '3:11:3:18:1;:21::22:0;:11:::1',
            source: fs.readFileSync(new URL('../../../import-fixtures/mid2.cash', import.meta.url), { encoding: 'utf-8' }),
            sourceFile: 'mid2.cash',
            logs: [],
            requires: [],
            inlineRanges: '0:0:leaf',
          },
        ],
        inlineRanges: '1:3:m1;5:7:m2',
      },
    },
  },
  {
    // Imports resolved across a diamond (mid1 and mid2 both import leaf): leaf is defined once, and
    // m1/m2 invoke it transitively.
    compilerOptions: { disableInlining: true },
    artifact: {
      contractName: 'Diamond',
      constructorInputs: [],
      abi: [{ name: 'spend', inputs: [{ name: 'x', type: 'int' }] }],
      bytecode:
        // Functions are defined in callee-first order (leaf before its callers), so leaf is id 0,
        // m1 id 1, m2 id 2.
        // OP_DEFINE leaf (id 0): return a + 1
        '8b OP_0 OP_DEFINE '
        // OP_DEFINE m1 (id 1): return leaf(a) * 2
        + '008a5295 OP_1 OP_DEFINE '
        // OP_DEFINE m2 (id 2): return leaf(a) + 3
        + '008a5393 OP_2 OP_DEFINE '
        // require(m1(x) + m2(x) == 18)
        + 'OP_DUP OP_1 OP_INVOKE OP_SWAP OP_2 OP_INVOKE OP_ADD 12 OP_NUMEQUAL',
      debug: {
        bytecode: '018b008904008a5295518904008a5393528976518a7c528a9301129c',
        logs: [],
        requires: [
          { ip: 18, line: 6 },
        ],
        sourceMap: '1::3:1;;::::1;2::4::0;;::::1;::::0;;::::1;6:19:6:20:0;:16::21:1;;:27::28:0;:24::29:1;;:16;:33::35:0;:8::37:1',
        functions: [
          {
            id: 0,
            name: 'leaf',
            inputs: [{ name: 'a', type: 'int' }],
            bytecode: '8b',
            sourceMap: '2:11:2:16:1',
            logs: [],
            requires: [],
            source: fs.readFileSync(new URL('../../../import-fixtures/leaf.cash', import.meta.url), { encoding: 'utf-8' }),
            sourceFile: 'leaf.cash',
          },
          {
            id: 1,
            name: 'm1',
            inputs: [{ name: 'a', type: 'int' }],
            bytecode: '008a5295',
            sourceMap: '3:11:3:18:1;;:21::22:0;:11:::1',
            logs: [],
            requires: [],
            source: fs.readFileSync(new URL('../../../import-fixtures/mid1.cash', import.meta.url), { encoding: 'utf-8' }),
            sourceFile: 'mid1.cash',
          },
          {
            id: 2,
            name: 'm2',
            inputs: [{ name: 'a', type: 'int' }],
            bytecode: '008a5393',
            sourceMap: '3:11:3:18:1;;:21::22:0;:11:::1',
            logs: [],
            requires: [],
            source: fs.readFileSync(new URL('../../../import-fixtures/mid2.cash', import.meta.url), { encoding: 'utf-8' }),
            sourceFile: 'mid2.cash',
          },
        ],
      },
      fingerprint: '316a3305152ec0695bf80303736c79dd1f9cc2f1dbccf57d9965094401363307',
    },
  },
];
