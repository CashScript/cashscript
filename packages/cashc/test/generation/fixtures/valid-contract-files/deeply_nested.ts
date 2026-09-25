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
        sourceMap: '9:4:11:5;;;;;10:25:10:37;;:39::48;:8::51:1;9:40:11:5;;;:4;14::25::0;;;;15:25:15:34;;:36::42;:8::45:1;16:12:16:19:0;:22::23;:12:::1;:25:22:9:0;17:16:17:23;:26::28;:16:::1;:30:19:13:0;18:24:18:31;:35::36;:16::38:1;19:19:21:13:0;20:24:20:31;:35::37;:16::39:1;19:19:21:13;22:15:24:9:0;23:20:23:27;:31::32;:12::34:1;22:15:24:9;14:36:25:5;;3:0:26:1',
        logs: [],
        requires: [
          { ip: 12, line: 10 },
          { ip: 23, line: 15 },
          { ip: 34, line: 18 },
          { ip: 38, line: 20 },
          { ip: 43, line: 23 },
        ],
        sourceTags: '9:11:sc',
      },
    },
  },
];
