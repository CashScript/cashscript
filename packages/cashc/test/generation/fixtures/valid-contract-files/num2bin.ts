import { Fixture } from '../../fixture-utils.js';

export const fixtures: Fixture[] = [
  {
    artifact: {
      contractName: 'Test',
      constructorInputs: [],
      abi: [{ name: 'hello', inputs: [] }],
      bytecode:
        // bytes2 byte_ = toPaddedBytes(10, 2);
        'OP_10 OP_2 OP_NUM2BIN '
        // require(int(byte_) == 10);
        + 'OP_BIN2NUM OP_10 OP_NUMEQUAL',
      fingerprint: 'df5031d5e4eae8bc40921091e25734aeee6cb7e35b9f40103770e7394e721f63',
      debug: {
        bytecode: '5a5280815a9c',
        sourceMap: '3:37:3:39;:41::42;:23::43:1;4:16:4:26;:30::32:0;:8::34:1',
        logs: [],
        requires: [{ ip: 6, line: 4 }],
      },
    },
  },
];
