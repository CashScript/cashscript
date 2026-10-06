import { Fixture } from '../../fixture-utils.js';

export const fixtures: Fixture[] = [
  {
    artifact: {
      contractName: 'Test',
      constructorInputs: [],
      abi: [
        { name: 'hello', inputs: [{ name: 's', type: 'sig' }, { name: 'pk', type: 'pubkey' }] },
        { name: 'world', inputs: [{ name: 'a', type: 'int' }] },
      ],
      bytecode:
        // function hello(sig s, pubkey pk) {
        'OP_DUP OP_0 OP_NUMEQUAL OP_IF '
        // require(checkSig(s, pk));
        + 'OP_SWAP OP_ROT OP_CHECKSIG '
        // Cleanup
        + 'OP_NIP '
        // }
        + 'OP_ELSE '
        // function world(int a) {
        + 'OP_1 OP_NUMEQUALVERIFY '
        // require(a + 5 == 10);
        + 'OP_5 OP_ADD OP_10 OP_NUMEQUAL '
        // }
        + 'OP_ENDIF',
      fingerprint: '88a901256f34c8c655657f1efad4389dc3465a1980090f817f5d1a7df7ffd701',
      debug: {
        bytecode: '76009c637c7bac7767519d55935a9c68',
        sourceMap: '4:4:6:5;;;;5:25:5:26;:28::30;:8::33:1;4:37:6:5;:4;8::10::0;;9:20:9:21;:16:::1;:25::27:0;:8::29:1;3:0:11:1',
        logs: [],
        requires: [{ ip: 7, line: 5 }, { ip: 15, line: 9 }],
        sourceTags: '7:7:sc',
      },
    },
  },
];
