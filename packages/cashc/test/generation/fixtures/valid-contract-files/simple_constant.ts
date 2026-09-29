import { Fixture } from '../../fixture-utils.js';

export const fixtures: Fixture[] = [
  {
    artifact: {
      contractName: 'Test',
      constructorInputs: [],
      abi: [{ name: 'hello', inputs: [] }],
      bytecode:
        // string constant m = "hello";
        '68656c6c6f '
        // require(m == "hello");
        + '68656c6c6f OP_EQUAL',
      fingerprint: '96cc3caea92277647f1a513b9ca649fe93845566c0a29e69583a1e4bf67dbd71',
      debug: {
        bytecode: '0568656c6c6f0568656c6c6f87',
        sourceMap: '3:28:3:35;4:21:4:28;:8::30:1',
        logs: [],
        requires: [{ ip: 3, line: 4 }],
      },
    },
  },
];
