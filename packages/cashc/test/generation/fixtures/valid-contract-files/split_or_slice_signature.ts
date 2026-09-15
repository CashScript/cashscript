import { Fixture } from '../../fixture-utils.js';

export const fixtures: Fixture[] = [
  {
    artifact: {
      contractName: 'Test',
      constructorInputs: [{ name: 'signature', type: 'sig' }],
      abi: [{ name: 'spend', inputs: [] }],
      bytecode:
        // bytes hashtype1 = signature.split(64)[1];
        'OP_DUP 40 OP_SPLIT OP_NIP '
        // bytes1 hashtype2 = signature.slice(64, 65);
        + 'OP_SWAP 41 OP_SPLIT OP_DROP 40 OP_SPLIT OP_NIP '
        // require(hashtype1 == 0x01);
        + 'OP_SWAP OP_1 OP_EQUALVERIFY '
        // require(hashtype2 == 0x01);
        + 'OP_1 OP_EQUAL',
      fingerprint: '8ff426163800a551833469b6746f32eee36dda458516a3684dce740263312a1b',
      debug: {
        bytecode: '7601407f777c01417f7501407f777c51885187',
        sourceMap: '4:26:4:35;:42::44;:26::45:1;:::48;5:27:5:36:0;:47::49;:27::50:1;;:43::45:0;:27::50:1;;6:16:6:25:0;:29::33;:8::35:1;7:29:7:33:0;:8::35:1',
        logs: [],
        requires: [{ ip: 14, line: 6 }, { ip: 17, line: 7 }],
      },
    },
  },
];
