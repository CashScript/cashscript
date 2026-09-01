import { Fixture } from '../../fixture-utils.js';

export const fixtures: Fixture[] = [
  {
    artifact: {
      contractName: 'P2PKH',
      constructorInputs: [{ name: 'pkh', type: 'bytes20' }],
      abi: [{ name: 'spend', inputs: [{ name: 'pk', type: 'pubkey' }, { name: 's', type: 'bytes65' }] }],
      bytecode:
        // Implicit parameter type enforcement
        'OP_ROT OP_SIZE 41 OP_EQUALVERIFY '
        // require(hash160(pk) == pkh);
        + 'OP_2 OP_PICK OP_HASH160 OP_ROT OP_EQUALVERIFY '
        // require(checkSig(sig(s), pk));
        + 'OP_SWAP OP_CHECKSIG',
      fingerprint: '3493678eec6aa5f1faf62552956f93d338eabc655157679978c406971658eaba',
      debug: {
        bytecode: '7b820141885279a97b887cac',
        sourceMap: '4:30:4:39;;;;5:24:5:26;;:16::27:1;:31::34:0;:8::36:1;6:33:6:35:0;:8::38:1',
        logs: [],
        requires: [{ ip: 9, line: 5 }, { ip: 12, line: 6 }],
        sourceTags: '0:3:pv',
      },
    },
  },
];
