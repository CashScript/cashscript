import { Fixture } from '../../fixture-utils.js';

export const fixtures: Fixture[] = [
  {
    artifact: {
      contractName: 'Test',
      constructorInputs: [{ name: 'x', type: 'int' }],
      abi: [{ name: 'hello', inputs: [{ name: 's', type: 'sig' }, { name: 'pk', type: 'pubkey' }] }],
      bytecode:
        // int i = 400 + x;
        '9001 OP_OVER OP_ADD '
        // bytes b = 0x07364897987fe87 + bytes(x);
        + '07364897987fe807 OP_2 OP_PICK OP_CAT '
        // int myVariable = 10 - 4; // they can go at the end of the line
        + 'OP_10 OP_4 OP_SUB '
        // int myOtherVariable = i + myVariable % 2;
        + 'OP_2 OP_PICK OP_SWAP OP_2 OP_MOD OP_ADD '
        // require(myOtherVariable /* And comments can be included within lines */ > i);
        + 'OP_2 OP_PICK OP_GREATERTHAN OP_VERIFY '
        // if (x > 10) {
        + 'OP_ROT OP_10 OP_GREATERTHAN OP_IF '
        // require(i < 20);
        + 'OP_OVER 14 OP_LESSTHAN OP_VERIFY '
        // require(checkSig(s, pk));
        + 'OP_2OVER OP_SWAP OP_CHECKSIGVERIFY '
        // require(b == 0x01);
        + 'OP_ELSE OP_DUP OP_1 OP_EQUALVERIFY OP_ENDIF '
        // }
        + 'OP_2DROP OP_2DROP OP_1',
      fingerprint: '63ee25992293cf9dd8752923c17b8a78840ecea53d75e814643cbb2ac914c751',
      debug: {
        bytecode: '02900178930807364897987fe80752797e5a549452797c5297935279a0697b5aa0637801149f69707cad67765188686d6d51',
        sourceMap: '9:16:9:19;:22::23;:16:::1;10:18:10:35:0;:44::45;;:18::46:1;12:25:12:27:0;:30::31;:25:::1;13:30:13::0;;:34::44;:47::48;:34:::1;:30;14:82:14:83:0;;:16:::1;:8::85;16:12:16:13:0;:16::18;:12:::1;:20:19:9:0;17::17:21;:24::26;:20:::1;:12::28;18:29:18:34:0;;:12::37:1;20::20:31:0;:20::21;:25::29;:12::31:1;;8:37:21:5;;',
        logs: [],
        requires: [{ ip: 20, line: 14 }, { ip: 28, line: 17 }, { ip: 31, line: 18 }, { ip: 35, line: 20 }],
      },
    },
  },
];
