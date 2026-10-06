import { Fixture } from '../../fixture-utils.js';

export const fixtures: Fixture[] = [
  {
    artifact: {
      contractName: 'Test',
      constructorInputs: [],
      abi: [{ name: 'cms', inputs: [{ name: 's', type: 'sig' }, { name: 'pk', type: 'pubkey' }] }],
      bytecode:
        // require(checkMultiSig([s, sig(0x00)], [pk, pubkey(0x00)]));
        'OP_0 OP_SWAP 00 OP_2 OP_4 OP_ROLL 00 OP_2 OP_CHECKMULTISIG',
      fingerprint: '4a9d07771fb134fdd0b1b9ca1aa0e33a2621d9492e9d2bf9b8258fbd3f531296',
      debug: {
        bytecode: '007c010052547a010052ae',
        sourceMap: '3:16:3:65;:31::32;:38::42;:30::44:1;:47::49:0;;:58::62;:46::64:1;:8::67',
        logs: [],
        requires: [{ ip: 9, line: 3 }],
      },
    },
  },
];
