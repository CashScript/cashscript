import { Fixture } from '../../fixture-utils.js';

export const fixtures: Fixture[] = [
  {
    artifact: {
      contractName: 'MultiSig',
      constructorInputs: [{ name: 'pk1', type: 'pubkey' }, { name: 'pk2', type: 'pubkey' }, { name: 'pk3', type: 'pubkey' }],
      abi: [{ name: 'spend', inputs: [{ name: 's1', type: 'sig' }, { name: 's2', type: 'sig' }] }],
      bytecode:
        // require(checkMultiSig([s1, s2], [pk1, pk2, pk3]))
        'OP_0 OP_2ROT OP_SWAP OP_2 OP_2ROT OP_SWAP OP_6 OP_ROLL OP_3 OP_CHECKMULTISIG',
      debug: {
        bytecode: '00717c52717c567a53ae',
        logs: [],
        requires: [{ ip: 13, line: 3 }],
        sourceMap: '3:12:3:52;:27::33;;:26::34:1;:37::45:0;;:47::50;;:36::51:1;:4::54',
      },
      fingerprint: 'd06a42627510906395fa927195c1aa420b9adf7da407d71b793fc5d550b57a39',
    },
  },
];
