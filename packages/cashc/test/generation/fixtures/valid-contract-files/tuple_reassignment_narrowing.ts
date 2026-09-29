import { Fixture } from '../../fixture-utils.js';

export const fixtures: Fixture[] = [
  {
    artifact: {
      contractName: 'TupleReassignmentNarrowing',
      constructorInputs: [],
      abi: [
        { name: 'spend', inputs: [{ name: 'data', type: 'bytes' }, { name: 'other', type: 'bytes' }] },
      ],
      bytecode:
        // require(data.length == 20);
        'OP_SIZE 14 OP_NUMEQUALVERIFY '
        // data, bytes rest = other.split(20);
        + 'OP_SWAP 14 OP_SPLIT '
        // bytes20 narrowed = data;
        + 'OP_OVER '
        // require(narrowed == data && rest.length > 0);
        + 'OP_ROT OP_EQUAL OP_SWAP OP_SIZE OP_NIP OP_0 OP_GREATERTHAN OP_BOOLAND '
        // Cleanup
        + 'OP_NIP',
      debug: {
        bytecode: '8201149d7c01147f787b877c827700a09a77',
        sourceMap: '3:16:3:27:1;:31::33:0;:8::35:1;5:27:5:32:0;:39::41;:27::42:1;6::6:31:0;7:28:7:32;:16:::1;:36::40:0;:::47:1;;:50::51:0;:36:::1;:8::53;2:44:8:5',
        logs: [],
        requires: [
          { ip: 2, line: 3 },
          { ip: 15, line: 7 },
        ],
        sourceTags: '15:15:sc',
      },
      fingerprint: '74422e75c6073e2286b54220945a63fe2ff12f917d486f34e8529363ce522cf8',
    },
  },
];
