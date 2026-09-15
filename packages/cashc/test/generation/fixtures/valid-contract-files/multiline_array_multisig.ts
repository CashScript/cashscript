import { Fixture } from '../../fixture-utils.js';

export const fixtures: Fixture[] = [
  {
    artifact: {
      contractName: 'Test',
      constructorInputs: [],
      abi: [{ name: 'cms', inputs: [{ name: 's', type: 'sig' }, { name: 'pk', type: 'pubkey' }] }],
      bytecode:
        // require(checkMultiSig(
        'OP_0 '
        // s, sig(0x00)
        + 'OP_SWAP 00 '
        // ], [
        + 'OP_2 '
        // pk, pubkey(0x00)
        + 'OP_4 OP_ROLL 00 '
        // ]
        + 'OP_2 '
        // ));
        + 'OP_CHECKMULTISIG',
      fingerprint: '4a9d07771fb134fdd0b1b9ca1aa0e33a2621d9492e9d2bf9b8258fbd3f531296',
      debug: {
        bytecode: '007c010052547a010052ae',
        sourceMap: '3:16:9:9;5::5:17;:23::27;4:12:6:13:1;7:16:7:18:0;;:27::31;6:15:8:13:1;3:8:9:11',
        logs: [],
        requires: [{ ip: 9, line: 3 }],
      },
    },
  },
];
