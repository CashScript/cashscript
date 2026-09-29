import { Fixture } from '../../fixture-utils.js';

export const fixtures: Fixture[] = [
  {
    artifact: {
      contractName: 'Test',
      constructorInputs: [],
      abi: [{ name: 'spend', inputs: [] }],
      bytecode:
        // bytes4 x = 0x00000000;
        '00000000 '
        // bytes4 y = ~x;
        + 'OP_INVERT '
        // require(y == 0xffffffff);
        + 'ffffffff OP_EQUAL',
      fingerprint: '75fe92c7557ba121b07d4d7bf705fdcdb925d98a7ccd669e499eadeacba041a9',
      debug: {
        bytecode: '04000000008304ffffffff87',
        sourceMap: '3:19:3:29;4::4:21:1;6:21:6:31:0;:8::33:1',
        logs: [],
        requires: [{ ip: 4, line: 6 }],
      },
    },
  },
];
