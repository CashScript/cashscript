import { Fixture } from '../../fixture-utils.js';

export const fixtures: Fixture[] = [
  {
    artifact: {
      contractName: 'TransferWithTimeout',
      constructorInputs: [
        { name: 'sender', type: 'pubkey' },
        { name: 'recipient', type: 'pubkey' },
        { name: 'timeout', type: 'int' },
      ],
      abi: [
        { name: 'transfer', inputs: [{ name: 'recipientSig', type: 'sig' }] },
        { name: 'timeout', inputs: [{ name: 'senderSig', type: 'sig' }] },
      ],
      bytecode:
        // function transfer(sig recipientSig) {
        'OP_3 OP_PICK OP_0 OP_NUMEQUAL OP_IF '
        // require(checkSig(recipientSig, recipient));
        + 'OP_4 OP_ROLL OP_ROT OP_CHECKSIG '
        // Cleanup
        + 'OP_NIP OP_NIP OP_NIP '
        // }
        + 'OP_ELSE '
        // function timeout(sig senderSig) {
        + 'OP_3 OP_ROLL OP_1 OP_NUMEQUALVERIFY '
        // require(checkSig(senderSig, sender));
        + 'OP_3 OP_ROLL OP_SWAP OP_CHECKSIGVERIFY '
        // if (timeout > 0) {
        + 'OP_OVER OP_0 OP_GREATERTHAN OP_IF '
        // if (timeout < 10) {
        + 'OP_OVER OP_10 OP_LESSTHAN OP_IF '
        // require(timeout == 5);
        + 'OP_OVER OP_5 OP_NUMEQUALVERIFY '
        // } else {
        + 'OP_ELSE '
        // require(timeout == 15);
        + 'OP_OVER OP_15 OP_NUMEQUALVERIFY '
        // }
        + 'OP_ENDIF '
        // } else {
        + 'OP_ELSE '
        // require(timeout == 0);
        + 'OP_OVER OP_0 OP_NUMEQUALVERIFY '
        // }
        + 'OP_ENDIF OP_2DROP OP_1 OP_ENDIF',
      fingerprint: '8c0754826497834b06b82f8e040f49613e1bc193b8b1bb8ab171f8538ddfb47e',
      debug: {
        bytecode: '5379009c63547a7bac77777767537a519d537a7cad7800a063785a9f6378559d67785f9d686778009d686d5168',
        sourceMap: '9:4:12:5;;;;;10:25:10:37;;:39::48;:8::51:1;9:40:12:5;;;:4;15::32::0;;;;16:25:16:34;;:36::42;:8::45:1;17:12:17:19:0;:22::23;:12:::1;:25:26:9:0;18:16:18:23;:26::28;:16:::1;:30:22:13:0;19:24:19:31;:35::36;:16::38:1;22:19:25:13:0;24:24:24:31;:35::37;:16::39:1;22:19:25:13;26:15:29:9:0;27:20:27:27;:31::32;:12::34:1;26:15:29:9;15:36:32:5;;3:0:33:1',
        logs: [
          { ip: 12, line: 11, data: ['recipientSig is', { type: 'sig', stackIndex: 4, ip: 8 }] },
          { ip: 35, line: 20, data: ['timeout is', { stackIndex: 1, type: 'int', ip: 35 }] },
          { ip: 35, line: 21, data: ['senderSig is', { type: 'sig', stackIndex: 3, ip: 20 }] },
          { ip: 36, line: 23, data: ['timeout is', { stackIndex: 1, type: 'int', ip: 36 }] },
          { ip: 44, line: 28, data: ['timeout is', { stackIndex: 1, type: 'int', ip: 44 }] },
          {
            ip: 45,
            line: 31,
            data: [
              'timeout is',
              { stackIndex: 1, type: 'int', ip: 45 },
              'and senderSig is',
              { type: 'sig', stackIndex: 3, ip: 20 },
            ],
          },
        ],
        requires: [
          { ip: 12, line: 10 },
          { ip: 23, line: 16 },
          { ip: 34, line: 19 },
          { ip: 38, line: 24 },
          { ip: 43, line: 27 },
        ],
        sourceTags: '9:11:sc',
      },
    },
  },
];
