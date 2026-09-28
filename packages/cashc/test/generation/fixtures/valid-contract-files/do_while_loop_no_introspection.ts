import { Fixture } from '../../fixture-utils.js';

export const fixtures: Fixture[] = [
  {
    artifact: {
      contractName: 'Loopy',
      constructorInputs: [],
      abi: [{ name: 'doLoop', inputs: [] }],
      bytecode: 'OP_0 OP_2 OP_BEGIN OP_SWAP OP_1ADD OP_SWAP OP_2DUP OP_ADD OP_10 OP_LESSTHAN OP_VERIFY OP_OVER OP_10 OP_GREATERTHANOREQUAL OP_UNTIL OP_2DROP OP_1',
      debug: {
        bytecode: '0052657c8b7c6e935a9f69785aa2666d51',
        sourceMap: '3:16:3:17;4::4;6:8:10:25;7:12:7:22:1;;;9:20:9:25:0;::::1;:28::30:0;:20:::1;:12::32;10:17:10:18:0;:21::23;6:8::25:1;;2:22:11:5;',
        logs: [
          { ip: 6, line: 8, data: [{ stackIndex: 1, type: 'int', ip: 6 }] },
        ],
        requires: [
          { ip: 10, line: 9 },
        ],
      },
      fingerprint: 'c593e0b3cba73663f3bb5fcbcdba620c02ce0e9dce951ff4e52b89c27a90ad6b',
    },
  },
];
