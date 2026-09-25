import { Fixture } from '../../fixture-utils.js';

export const fixtures: Fixture[] = [
  {
    artifact: {
      contractName: 'Loopy',
      constructorInputs: [],
      abi: [{ name: 'doLoop', inputs: [] }],
      bytecode: 'OP_0 OP_BEGIN OP_DUP OP_TXINPUTCOUNT OP_LESSTHAN OP_DUP OP_TOALTSTACK OP_IF OP_1ADD OP_ENDIF OP_FROMALTSTACK OP_NOT OP_UNTIL OP_2 OP_GREATERTHAN',
      debug: {
        bytecode: '006576c39f766b638b686c916652a0',
        sourceMap: '3:16:3:17;5:8:7:9;:15:5:16;:19::35;:15:::1;;;:37:7:9:0;6:12:6:22:1;5:37:7:9;;:8;;10:20:10:21:0;:8::23:1',
        logs: [
          { ip: 13, line: 9, data: [{ stackIndex: 0, type: 'int', ip: 13 }] },
        ],
        requires: [
          { ip: 15, line: 10 },
        ],
        sourceTags: '9:12:lc',
      },
      fingerprint: 'baa407724b9c7e497eec65233682d98b661de3e82d4d3447964b64b6a2929b09',
    },
  },
];
