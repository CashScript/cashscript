import { Fixture } from '../../fixture-utils.js';

export const fixtures: Fixture[] = [
  {
    artifact: {
      contractName: 'Loopy',
      constructorInputs: [],
      abi: [{ name: 'doLoop', inputs: [] }],
      bytecode: 'OP_0 OP_BEGIN OP_DUP OP_TXINPUTCOUNT OP_LESSTHAN OP_DUP OP_TOALTSTACK OP_IF OP_DUP OP_1ADD OP_NIP OP_ENDIF OP_FROMALTSTACK OP_NOT OP_UNTIL OP_2 OP_GREATERTHAN',
      debug: {
        bytecode: '006576c39f766b63768b77686c916652a0',
        sourceMap: '3:16:3:17;5:8:7:9;:15:5:16;:19::35;:15:::1;;;:37:7:9:0;6:16:6:17;:::21:1;:12::22;5:37:7:9;;:8;;10:20:10:21:0;:8::23:1',
        logs: [
          { ip: 15, line: 9, data: [{ stackIndex: 0, type: 'int', ip: 15 }] },
        ],
        requires: [
          { ip: 17, line: 10 },
        ],
        sourceTags: '11:14:lc',
      },
      fingerprint: '00fc9253e439b8a2f39ba60d1d173ff4d19f557802b40b750eb6df5f92b1001e',
    },
  },
];
