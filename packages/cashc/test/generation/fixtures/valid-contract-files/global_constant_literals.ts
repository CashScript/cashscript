import { Fixture } from '../../fixture-utils.js';

export const fixtures: Fixture[] = [
  {
    artifact: {
      contractName: 'GlobalConstantLiterals',
      constructorInputs: [],
      abi: [
        {
          name: 'spend',
          inputs: [
            { name: 'enabled', type: 'bool' },
            { name: 'negative', type: 'int' },
            { name: 'interval', type: 'int' },
            { name: 'deadline', type: 'int' },
            { name: 'greeting', type: 'string' },
            { name: 'magic', type: 'bytes4' },
          ],
        },
      ],
      bytecode:
        // Implicit parameter type enforcement
        'OP_0NOTEQUAL OP_5 OP_ROLL OP_SIZE OP_4 OP_EQUALVERIFY '
        // require(enabled == ENABLED);
        + 'OP_SWAP OP_1 OP_NUMEQUALVERIFY '
        // require(negative == NEGATIVE);
        + 'OP_SWAP 87 OP_NUMEQUALVERIFY '
        // require(interval == INTERVAL);
        + 'OP_SWAP 201c OP_NUMEQUALVERIFY '
        // require(deadline == DEADLINE);
        + 'OP_SWAP 98712c60 OP_NUMEQUALVERIFY '
        // require(greeting == GREETING);
        + 'OP_SWAP 68656c6c6f OP_EQUALVERIFY '
        // require(magic == MAGIC);
        + '01020304 OP_EQUAL',
      fingerprint: '74578f6eb254c7cb367434c6754d27e684bd1b3c7362fac7a0024397c9f73331',
      debug: {
        bytecode: '92557a8254887c519d7c01879d7c02201c9d7c0498712c609d7c0568656c6c6f88040102030487',
        sourceMap: '9:19:9:31;:92::104;;;;;10:16:10:23;:27::34:1;:8::36;11:16:11:24:0;:28::36:1;:8::38;12:16:12:24:0;:28::36:1;:8::38;13:16:13:24:0;:28::36:1;:8::38;14:16:14:24:0;:28::36:1;:8::38;15:25:15:30;:8::32',
        logs: [],
        requires: [
          { ip: 8, line: 10 },
          { ip: 11, line: 11 },
          { ip: 14, line: 12 },
          { ip: 17, line: 13 },
          { ip: 20, line: 14 },
          { ip: 23, line: 15 },
        ],
        sourceTags: '0:0:pv;1:5:pv',
        functions: [
          {
            name: 'ENABLED',
            kind: 'constant',
            inputs: [],
            bytecode: '51',
            sourceMap: '1:24:1:28',
            logs: [],
            requires: [],
          },
          {
            name: 'NEGATIVE',
            kind: 'constant',
            inputs: [],
            bytecode: '0187',
            sourceMap: '2:24:2:26',
            logs: [],
            requires: [],
          },
          {
            name: 'INTERVAL',
            kind: 'constant',
            inputs: [],
            bytecode: '02201c',
            sourceMap: '3:24:3:31',
            logs: [],
            requires: [],
          },
          {
            name: 'DEADLINE',
            kind: 'constant',
            inputs: [],
            bytecode: '0498712c60',
            sourceMap: '4:24:4:51',
            logs: [],
            requires: [],
          },
          {
            name: 'GREETING',
            kind: 'constant',
            inputs: [],
            bytecode: '0568656c6c6f',
            sourceMap: '5:27:5:34',
            logs: [],
            requires: [],
          },
          {
            name: 'MAGIC',
            kind: 'constant',
            inputs: [],
            bytecode: '0401020304',
            sourceMap: '6:24:6:34',
            logs: [],
            requires: [],
          },
        ],
        inlineRanges: '7:7:ENABLED;10:10:NEGATIVE;13:13:INTERVAL;16:16:DEADLINE;19:19:GREETING;21:21:MAGIC',
      },
    },
  },
];
