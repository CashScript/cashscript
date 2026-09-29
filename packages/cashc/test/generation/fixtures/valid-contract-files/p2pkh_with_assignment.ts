import { Fixture } from '../../fixture-utils.js';

export const fixtures: Fixture[] = [
  {
    artifact: {
      contractName: 'P2PKH',
      constructorInputs: [{ name: 'pkh', type: 'bytes20' }],
      abi: [{ name: 'spend', inputs: [{ name: 'pk', type: 'pubkey' }, { name: 's', type: 'sig' }] }],
      bytecode:
        // bytes20 passedPkh = hash160(pk);
        'OP_OVER OP_HASH160 '
        // require(passedPkh == pkh);
        + 'OP_EQUALVERIFY '
        // require(checkSig(s, pk));
        + 'OP_CHECKSIG',
      fingerprint: '07f5c2c2cf10439f063f3b92b9420b110614fb57b5c5015120bfca2688fedcc7',
      debug: {
        bytecode: '78a988ac',
        sourceMap: '5:36:5:38;:28::39:1;6:8:6:34;7::7:33',
        logs: [],
        requires: [{ ip: 3, line: 6 }, { ip: 5, line: 7 }],
      },
    },
  },
];
