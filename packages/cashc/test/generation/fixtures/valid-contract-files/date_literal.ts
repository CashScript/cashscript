import { Fixture } from '../../fixture-utils.js';

export const fixtures: Fixture[] = [
  {
    artifact: {
      contractName: 'Test',
      constructorInputs: [],
      abi: [{ name: 'test', inputs: [] }],
      bytecode:
        // int d = date("2021-02-17T01:30:00"); //YYYY-MM-DDThh:mm:ss
        '88632c60 '
        // require(d == 0);
        + 'OP_0 OP_NUMEQUAL',
      fingerprint: '3584793ef9b31561ca87330a348b586c6352c8fa413985079b7d8ca3aca5bdf0',
      debug: {
        bytecode: '0488632c60009c',
        sourceMap: '5:16:5:43;6:21:6:22;:8::24:1',
        logs: [],
        requires: [{ ip: 3, line: 6 }],
      },
    },
  },
];
