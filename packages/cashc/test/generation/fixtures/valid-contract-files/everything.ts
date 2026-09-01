import { Fixture } from '../../fixture-utils.js';

export const fixtures: Fixture[] = [
  {
    artifact: {
      contractName: 'Test',
      constructorInputs: [{ name: 'x', type: 'int' }, { name: 'y', type: 'string' }],
      abi: [{ name: 'hello', inputs: [{ name: 's', type: 'sig' }, { name: 'pk', type: 'pubkey' }] }],
      bytecode:
        // int i = 400 + x;
        '9001 OP_OVER OP_ADD '
        // bytes b = 0x07364897987fe87 + bytes(y);
        + '07364897987fe807 OP_3 OP_PICK OP_CAT '
        // int myVariable = 10 - int(false); // they can go at the end of the line
        + 'OP_10 OP_0 OP_SUB '
        // int myOtherVariable = (i + myVariable) % 2;
        + 'OP_2 OP_PICK OP_OVER OP_ADD OP_2 OP_MOD '
        // require(myOtherVariable /* And comments can be included within lines */ > i);
        + 'OP_DUP OP_4 OP_PICK OP_GREATERTHAN OP_VERIFY '
        // myOtherVariable = i;
        + 'OP_3 OP_PICK '
        // myVariable = 10;
        + 'OP_10 '
        // require(ripemd160(b) == ripemd160(bytes(myVariable)));
        + 'OP_4 OP_ROLL OP_RIPEMD160 OP_OVER OP_RIPEMD160 OP_EQUALVERIFY '
        // require(this.age >= 500);
        + 'f401 OP_CHECKSEQUENCEVERIFY OP_DROP '
        // require(y.length < -10);
        + 'OP_6 OP_ROLL OP_SIZE OP_NIP 8a OP_LESSTHAN OP_VERIFY '
        // if (i > 400) {
        + 'OP_4 OP_PICK 9001 OP_GREATERTHAN OP_IF '
        // i = 400;
        + '9001 OP_5 OP_ROLL OP_DROP OP_SWAP OP_TOALTSTACK OP_SWAP OP_TOALTSTACK OP_SWAP OP_TOALTSTACK OP_SWAP OP_FROMALTSTACK OP_FROMALTSTACK OP_FROMALTSTACK '
        // }
        + 'OP_ENDIF '
        // if (x > 10) {
        + 'OP_5 OP_PICK OP_10 OP_GREATERTHAN OP_IF '
        // require(i < 20);
        + 'OP_4 OP_PICK 14 OP_LESSTHAN OP_VERIFY '
        // require(checkSig(s, pk));
        + 'OP_6 OP_PICK OP_8 OP_PICK OP_CHECKSIGVERIFY '
        // } else if (x < 5) {
        + 'OP_ELSE OP_5 OP_PICK OP_5 OP_LESSTHAN OP_IF '
        // require(false);
        + 'OP_0 OP_VERIFY '
        // require(myVariable == 1);
        + 'OP_ELSE OP_DUP OP_1 OP_NUMEQUALVERIFY OP_ENDIF OP_ENDIF '
        // }
        + 'OP_2DROP OP_2DROP OP_2DROP OP_2DROP OP_1',
      fingerprint: '5c83820f08cc787eb0078463cbf16b3b8c605a21bf42464bf9d4f9f31f254569',
      debug: {
        bytecode: '02900178930807364897987fe80753797e5a0094527978935297765479a06953795a547aa678a68802f401b275567a8277018a9f695479029001a063029001557a757c6b7c6b7c6b7c6c6c6c6855795aa063547901149f6956795879ad675579559f6300696776519d68686d6d6d6d51',
        sourceMap: '9:16:9:19;:22::23;:16:::1;10:18:10:35:0;:44::45;;:18::46:1;12:25:12:27:0;:34::39;:25::40:1;13:31:13:32:0;;:35::45;:31:::1;:49::50:0;:30:::1;14:16:14:31:0;:82::83;;:16:::1;:8::85;16:26:16:27:0;;17:21:17:23;19:26:19:27;;:16::28:1;:48::58:0;:32::60:1;:8::62;20:28:20:31:0;:8::33:1;;21:16:21:17:0;;:::24:1;;:27::30:0;:16:::1;:8::32;23:12:23:13:0;;:16::19;:12:::1;:21:25:9:0;24:16:24:19;:12::20:1;;;;;;;;;;;;;23:21:25:9;27:12:27:13:0;;:16::18;:12:::1;:20:30:9:0;28::28:21;;:24::26;:20:::1;:12::28;29:29:29:30:0;;:32::34;;:12::37:1;30:15:33::0;:19:30:20;;:23::24;:19:::1;:26:32:9:0;31:20:31:25;:12::27:1;33::33:37:0;:20::30;:34::35;:12::37:1;;30:15;8:37:34:5;;;;',
        logs: [],
        requires: [
          { ip: 22, line: 14 },
          { ip: 31, line: 19 },
          { ip: 33, line: 20 },
          { ip: 41, line: 21 },
          { ip: 71, line: 28 },
          { ip: 76, line: 29 },
          { ip: 84, line: 31 },
          { ip: 88, line: 33 },
        ],
      },
    },
  },
];
