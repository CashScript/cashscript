import { Fixture } from '../../fixture-utils.js';

export const fixtures: Fixture[] = [
  {
    artifact: {
      contractName: 'Test',
      constructorInputs: [],
      abi: [{ name: 'hello', inputs: [] }],
      bytecode:
        // bytes3 byte_ = unsafe_bytes3(bytes(0x1234));
        '1234 '
        // require(byte_.length == 1);
        + 'OP_SIZE OP_NIP OP_1 OP_NUMEQUAL',
      fingerprint: '07359fa5600dcaa0a9c582b428cdad5a3a9c63ac13f44b3503eaf31b540edc8e',
      debug: {
        bytecode: '0212348277519c',
        sourceMap: '4:43:4:49;5:16:5:28:1;;:32::33:0;:8::35:1',
        logs: [],
        requires: [{ ip: 5, line: 5 }],
      },
    },
  },
];
