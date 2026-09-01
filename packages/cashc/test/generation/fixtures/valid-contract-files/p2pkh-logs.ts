import { Fixture } from '../../fixture-utils.js';

export const fixtures: Fixture[] = [
  {
    artifact: {
      contractName: 'P2PKH',
      constructorInputs: [{ name: 'pkh', type: 'bytes20' }],
      abi: [{ name: 'spend', inputs: [{ name: 'pk', type: 'pubkey' }, { name: 's', type: 'sig' }] }],
      bytecode:
        // require(hash160(pk) == pkh);
        'OP_OVER OP_HASH160 OP_EQUALVERIFY '
        // require(checkSig(s, pk));
        + 'OP_CHECKSIG',
      fingerprint: '07f5c2c2cf10439f063f3b92b9420b110614fb57b5c5015120bfca2688fedcc7',
      debug: {
        bytecode: '78a988ac',
        sourceMap: '3:24:3:26;:16::27:1;:8::36;5::5:33',
        logs: [
          {
            ip: 4,
            line: 4,
            data: [
              { stackIndex: 0, type: 'pubkey', ip: 4 },
              { type: 'bytes20', stackIndex: 1, ip: 3 },
              { stackIndex: 1, type: 'sig', ip: 4 },
            ],
          },
        ],
        requires: [{ ip: 3, line: 3 }, { ip: 5, line: 5 }],
      },
    },
  },
];
