import { Fixture } from '../../fixture-utils.js';

export const fixtures: Fixture[] = [
  {
    artifact: {
      contractName: 'Loopy',
      constructorInputs: [],
      abi: [{ name: 'doLoop', inputs: [] }],
      bytecode: 'OP_0 OP_2 OP_BEGIN OP_OVER OP_1ADD OP_ROT OP_DROP OP_SWAP OP_2DUP OP_ADD OP_10 OP_LESSTHAN OP_VERIFY OP_OVER OP_10 OP_GREATERTHANOREQUAL OP_UNTIL OP_2DROP OP_1',
      debug: {
        bytecode: '005265788b7b757c6e935a9f69785aa2666d51',
        sourceMap: '3:16:3:17;4::4;6:8:10:25;7:16:7:17;:::21:1;:12::22;;;9:20:9:25:0;::::1;:28::30:0;:20:::1;:12::32;10:17:10:18:0;:21::23;6:8::25:1;;2:22:11:5;',
        logs: [
          { ip: 8, line: 8, data: [{ stackIndex: 1, type: 'int', ip: 8 }] },
        ],
        requires: [
          { ip: 12, line: 9 },
        ],
      },
      fingerprint: '39b67bb19440620390b83e3bc1e638ea6827998f4a14c2d6e29c2afa9815b2fd',
    },
  },
];
