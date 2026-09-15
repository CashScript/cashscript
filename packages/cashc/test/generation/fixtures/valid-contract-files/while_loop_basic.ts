import { Fixture } from '../../fixture-utils.js';

export const fixtures: Fixture[] = [
  {
    artifact: {
      contractName: 'WhileLoopBasic',
      constructorInputs: [],
      abi: [{ name: 'spend', inputs: [] }],
      bytecode: 'OP_0 OP_BEGIN OP_DUP OP_3 OP_LESSTHAN OP_DUP OP_TOALTSTACK OP_IF OP_DUP OP_1ADD OP_NIP OP_ENDIF OP_FROMALTSTACK OP_NOT OP_UNTIL OP_3 OP_NUMEQUAL',
      debug: {
        bytecode: '006576539f766b63768b77686c9166539c',
        sourceMap: '3:16:3:17;5:8:7:9;:15:5:16;:19::20;:15:::1;;;:22:7:9:0;6:16:6:17;:::21:1;:12::22;5:22:7:9;;:8;;9:21:9:22:0;:8::24:1',
        logs: [],
        requires: [
          { ip: 17, line: 9 },
        ],
        sourceTags: '11:14:lc',
      },
      fingerprint: '5a456e72142ae6beb6f64a3af7edfe9e14295b17724c4dfec0d84940c545d457',
    },
  },
];
