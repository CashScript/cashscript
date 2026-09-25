import { Fixture } from '../../fixture-utils.js';

export const fixtures: Fixture[] = [
  {
    artifact: {
      contractName: 'DebugMessages',
      constructorInputs: [],
      abi: [
        { name: 'spend', inputs: [{ name: 'value', type: 'int' }] },
      ],
      bytecode: 'OP_DUP OP_1 OP_NUMEQUALVERIFY OP_1ADD OP_2 OP_NUMEQUAL',
      debug: {
        bytecode: '76519d8b529c',
        logs: [
          { data: [{ stackIndex: 0, type: 'int', ip: 3 }, 'test'], ip: 3, line: 4 },
          { data: [{ stackIndex: 0, type: 'int', ip: 3 }, 'test2'], ip: 3, line: 5 },
        ],
        requires: [{ ip: 2, line: 3, message: 'Wrong value passed' }, { ip: 6, line: 6, message: 'Sum doesn\'t work' }],
        sourceMap: '3:12:3:17;:21::22;:4::46:1;6:12:6:21;:25::26:0;:4::48:1',
      },
      fingerprint: '2a4f5039ce0a481742e5b1712388a879ec8c5b617c4d4a8d676cc28d029c604f',
    },
  },
];
