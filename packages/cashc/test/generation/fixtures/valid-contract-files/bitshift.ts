import { Fixture } from '../../fixture-utils.js';

export const fixtures: Fixture[] = [
  {
    artifact: {
      contractName: 'Bitshift',
      constructorInputs: [],
      abi: [{ name: 'spend', inputs: [] }],
      bytecode: '1122334455667788 OP_4 OP_LSHIFTBIN OP_4 OP_RSHIFTBIN 0000000055667788 OP_EQUALVERIFY OP_8 OP_2 OP_RSHIFTNUM OP_1 OP_LSHIFTNUM OP_4 OP_NUMEQUAL',
      debug: {
        bytecode: '081122334455667788549854990800000000556677888858528e518d549c',
        sourceMap: '3:19:3:37;4:24:4:25;:19:::1;:29::30:0;:19:::1;6:21:6:39:0;:8::41:1;8:16:8:17:0;9:21:9:22;:16:::1;:26::27:0;:16:::1;11:22:11:23:0;:8::25:1',
        logs: [],
        requires: [
          { ip: 6, line: 6 },
          { ip: 14, line: 11 },
        ],
      },
      fingerprint: '2c9d2ddcd53c6f4e28320acf336260ece7958753802381a2528ddfa1840eb88a',
    },
  },
];
