import { Fixture } from '../../fixture-utils.js';

export const fixtures: Fixture[] = [
  {
    artifact: {
      contractName: 'GlobalConstantArithmetic',
      constructorInputs: [],
      abi: [
        {
          name: 'spend',
          inputs: [
            { name: 'base', type: 'int' },
            { name: 'derived', type: 'int' },
            { name: 'negated', type: 'int' },
            { name: 'complex', type: 'int' },
            { name: 'greeting', type: 'string' },
            { name: 'magic', type: 'bytes4' },
          ],
        },
      ],
      bytecode:
        // Implicit parameter type enforcement
        'OP_5 OP_ROLL OP_SIZE OP_4 OP_EQUALVERIFY '
        // require(base == BASE);
        + 'OP_SWAP 14 OP_NUMEQUALVERIFY '
        // require(derived == DERIVED);
        + 'OP_SWAP OP_15 OP_NUMEQUALVERIFY '
        // require(negated == NEGATED);
        + 'OP_SWAP 9e OP_NUMEQUALVERIFY '
        // require(complex == COMPLEX);
        + 'OP_SWAP 0002 OP_NUMEQUALVERIFY '
        // require(greeting == GREETING);
        + 'OP_SWAP 68656c6c6f20776f726c64 OP_EQUALVERIFY '
        // require(magic == MAGIC);
        + '01020304 OP_EQUAL',
      fingerprint: '29ddac97c055a2c032d2164877831a3ba0506b19bf20e0e3511da9dc874a21dc',
      debug: {
        bytecode: '557a8254887c01149d7c5f9d7c019e9d7c0200029d7c0b68656c6c6f20776f726c6488040102030487',
        sourceMap: '9:85:9:97;;;;;10:16:10:20;:24::28:1;:8::30;11:16:11:23:0;:27::34:1;:8::36;12:16:12:23:0;:27::34:1;:8::36;13:16:13:23:0;:27::34:1;:8::36;14:16:14:24:0;:28::36:1;:8::38;15:25:15:30;:8::32',
        logs: [],
        requires: [
          { ip: 7, line: 10 },
          { ip: 10, line: 11 },
          { ip: 13, line: 12 },
          { ip: 16, line: 13 },
          { ip: 19, line: 14 },
          { ip: 22, line: 15 },
        ],
        sourceTags: '0:4:pv',
        functions: [
          {
            name: 'BASE',
            kind: 'constant',
            inputs: [],
            bytecode: '0114',
            sourceMap: '1:20:1:27',
            logs: [],
            requires: [],
          },
          {
            name: 'DERIVED',
            kind: 'constant',
            inputs: [],
            bytecode: '5f',
            sourceMap: '2:23:2:31',
            logs: [],
            requires: [],
          },
          {
            name: 'NEGATED',
            kind: 'constant',
            inputs: [],
            bytecode: '019e',
            sourceMap: '3:23:3:35',
            logs: [],
            requires: [],
          },
          {
            name: 'COMPLEX',
            kind: 'constant',
            inputs: [],
            bytecode: '020002',
            sourceMap: '4:23:4:51',
            logs: [],
            requires: [],
          },
          {
            name: 'GREETING',
            kind: 'constant',
            inputs: [],
            bytecode: '0b68656c6c6f20776f726c64',
            sourceMap: '5:27:5:50',
            logs: [],
            requires: [],
          },
          {
            name: 'MAGIC',
            kind: 'constant',
            inputs: [],
            bytecode: '0401020304',
            sourceMap: '6:24:6:39',
            logs: [],
            requires: [],
          },
        ],
        inlineRanges: '6:6:BASE;9:9:DERIVED;12:12:NEGATED;15:15:COMPLEX;18:18:GREETING;20:20:MAGIC',
      },
    },
  },
];
