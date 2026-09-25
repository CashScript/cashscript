import { Fixture } from '../../fixture-utils.js';

export const fixtures: Fixture[] = [
  {
    artifact: {
      contractName: 'Bytes1EqualsByte',
      constructorInputs: [],
      abi: [{ name: 'hello', inputs: [{ name: 'a', type: 'int' }, { name: 'b', type: 'bytes1' }] }],
      bytecode:
        // Implicit parameter type enforcement
        'OP_SWAP OP_SIZE OP_1 OP_EQUALVERIFY '
        // bytes1 c = toPaddedBytes(a, 1);
        + 'OP_SWAP OP_1 OP_NUM2BIN '
        // require(b == c);
        + 'OP_EQUAL',
      fingerprint: 'cbccef08f54b0452cabaf643501a4903dab79b0d676896399771131fea3a0ad1',
      debug: {
        bytecode: '7c8251887c518087',
        sourceMap: '2:26:2:32;;;;3:33:3:34;:36::37;:19::38:1;4:8:4:24',
        logs: [],
        requires: [{ ip: 8, line: 4 }],
        sourceTags: '0:3:pv',
      },
    },
  },
];
