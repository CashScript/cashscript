import { Fixture } from '../../fixture-utils.js';

export const fixtures: Fixture[] = [
  {
    artifact: {
      contractName: 'WhileLoopBasic',
      constructorInputs: [],
      abi: [{ name: 'spend', inputs: [] }],
      bytecode: 'OP_0 OP_BEGIN OP_DUP OP_3 OP_LESSTHAN OP_DUP OP_TOALTSTACK OP_IF OP_1ADD OP_ENDIF OP_FROMALTSTACK OP_NOT OP_UNTIL OP_3 OP_NUMEQUAL',
      debug: {
        bytecode: '006576539f766b638b686c9166539c',
        sourceMap: '3:16:3:17;5:8:7:9;:15:5:16;:19::20;:15:::1;;;:22:7:9:0;6:12:6:22:1;5:22:7:9;;:8;;9:21:9:22:0;:8::24:1',
        logs: [],
        requires: [
          { ip: 15, line: 9 },
        ],
        sourceTags: '9:12:lc',
      },
      fingerprint: 'de46b0953afd7e2ca5b0e1c9e6c934500ddfb384061239e545d89b4848dd2384',
    },
  },
];
