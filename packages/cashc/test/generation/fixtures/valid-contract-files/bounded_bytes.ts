import { Fixture } from '../../fixture-utils.js';

export const fixtures: Fixture[] = [
  {
    artifact: {
      contractName: 'BoundedBytes',
      constructorInputs: [],
      abi: [{ name: 'spend', inputs: [{ name: 'b', type: 'bytes4' }, { name: 'i', type: 'int' }] }],
      bytecode:
        // Implicit type enforcement for b: require(b.length == 4)
        'OP_SIZE OP_4 OP_EQUALVERIFY '
        // require(b == toPaddedBytes(i, 4))
        + 'OP_SWAP OP_4 OP_NUM2BIN OP_EQUAL',
      debug: {
        bytecode: '8254887c548087',
        logs: [],
        requires: [{ ip: 7, line: 3 }],
        sourceMap: '2:19:2:27;;;3:35:3:36;:38::39;:21::40:1;:8::42',
        sourceTags: '0:2:pv',
      },
      fingerprint: 'b6381ead9be56fd0f9aa43b986ae8c3ba6aae2276596cdbd8268628397391064',
    },
  },
];
