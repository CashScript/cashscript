import { Fixture } from '../../fixture-utils.js';

export const fixtures: Fixture[] = [
  {
    // A global function returning a variable that a for-loop init reassigned returns the loop's final value
    artifact: {
      contractName: 'GlobalFunctionForLoopReassignedInit',
      constructorInputs: [],
      abi: [{ name: 'spend', inputs: [{ name: 'n', type: 'int' }] }],
      bytecode:
        // require(count(n) == n), with count(n) spliced in:
        'OP_DUP '
        // int i = 0;
        + 'OP_0 '
        // for (i = 0; i < n; i++) {
        + 'OP_DROP OP_0 OP_BEGIN OP_2DUP OP_GREATERTHAN OP_DUP OP_TOALTSTACK OP_IF '
        // require(i < 10);
        + 'OP_DUP OP_10 OP_LESSTHAN OP_VERIFY '
        // For loop update
        + 'OP_1ADD '
        // Loop condition
        + 'OP_ENDIF OP_FROMALTSTACK OP_NOT OP_UNTIL '
        // return i;
        + 'OP_NIP '
        // == n
        + 'OP_NUMEQUAL',
      fingerprint: '9643acfe0e75c3bfacc39e2ff86267dc6d707f341818b2c3a83795038141d11e',
      debug: {
        bytecode: '76007500656ea0766b63765a9f698b686c9166779c',
        sourceMap: '13:22:13:23;:16::24:1;;;;;;;;;;;;;;;;;;;:8::31',
        logs: [],
        requires: [
          { ip: 13, line: 13 },
          { ip: 21, line: 13 },
        ],
        sourceTags: '14:14:fu;15:18:lc;19:19:sc',
        functions: [
          {
            name: 'count',
            inputs: [{ name: 'n', type: 'int' }],
            bytecode: '007500656ea0766b63765a9f698b686c916677',
            sourceMap: '2:12:2:13;4:9:4:14:1;;:4:6:5:0;:16:4:21;::::1;;;:28:6:5:0;5:16:5:17;:20::22;:16:::1;:8::24;4:23:4:26;:28:6:5;;:4;;1:36:9:1',
            sourceTags: '13:13:fu;14:17:lc;18:18:sc',
            logs: [],
            requires: [
              { ip: 12, line: 5 },
            ],
          },
        ],
        inlineRanges: '1:19:count',
      },
    },
  },
  {
    compilerOptions: { disableInlining: true },
    artifact: {
      contractName: 'GlobalFunctionForLoopReassignedInit',
      constructorInputs: [],
      abi: [{ name: 'spend', inputs: [{ name: 'n', type: 'int' }] }],
      bytecode:
        // OP_DEFINE count (id 0): the same body as the inlined variant, ending in return i (OP_NIP)
        '007500656ea0766b63765a9f698b686c916677 OP_0 OP_DEFINE '
        // require(count(n) == n)
        + 'OP_DUP OP_0 OP_INVOKE OP_NUMEQUAL',
      fingerprint: '33bcf111dab3f5359532cf1f0d54027b49f5f7a708614569d905143b953894f4',
      debug: {
        bytecode: '13007500656ea0766b63765a9f698b686c916677008976008a9c',
        sourceMap: '1::9:1;;::::1;13:22:13:23:0;:16::24:1;;:8::31',
        logs: [],
        requires: [
          { ip: 7, line: 13 },
        ],
        functions: [
          {
            id: 0,
            name: 'count',
            inputs: [{ name: 'n', type: 'int' }],
            bytecode: '007500656ea0766b63765a9f698b686c916677',
            sourceMap: '2:12:2:13;4:9:4:14:1;;:4:6:5:0;:16:4:21;::::1;;;:28:6:5:0;5:16:5:17;:20::22;:16:::1;:8::24;4:23:4:26;:28:6:5;;:4;;1:36:9:1',
            sourceTags: '13:13:fu;14:17:lc;18:18:sc',
            logs: [],
            requires: [
              { ip: 12, line: 5 },
            ],
          },
        ],
      },
    },
  },
];
