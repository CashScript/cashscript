import { Fixture } from '../../fixture-utils.js';

export const fixtures: Fixture[] = [
  {
    artifact: {
      contractName: 'Reassignment',
      constructorInputs: [{ name: 'x', type: 'int' }, { name: 'y', type: 'string' }],
      abi: [{ name: 'hello', inputs: [{ name: 'pk', type: 'pubkey' }, { name: 's', type: 'sig' }] }],
      bytecode:
        // int myVariable = 10 - 4
        'OP_10 OP_4 OP_SUB '
        // int myOtherVariable = 20 + myVariable % 2
        + '14 OP_SWAP OP_2 OP_MOD OP_ADD '
        // require(myOtherVariable > x)
        + 'OP_LESSTHAN OP_VERIFY '
        // string hw = "Hello World"
        + '48656c6c6f20576f726c64 '
        // hw = hw + y
        + 'OP_DUP OP_ROT OP_CAT '
        // require(ripemd160(pk) == ripemd160(hw))
        + 'OP_2 OP_PICK OP_RIPEMD160 OP_SWAP OP_RIPEMD160 OP_EQUALVERIFY '
        // require(checkSig(s, pk))
        + 'OP_ROT OP_ROT OP_CHECKSIG '
        + 'OP_NIP',
      debug: {
        bytecode: '5a549401147c5297939f690b48656c6c6f20576f726c64767b7e5279a67ca6887b7bac77',
        logs: [],
        requires: [
          { ip: 11, line: 5 },
          { ip: 21, line: 10 },
          { ip: 25, line: 11 },
        ],
        sourceMap: '3:25:3:27;:30::31;:25:::1;4:30:4:32:0;:35::45;:48::49;:35:::1;:30;5:16:5:35;:8::37;7:20:7:33:0;8:13:8:15;:18::19;:13:::1;10:26:10:28:0;;:16::29:1;:43::45:0;:33::46:1;:8::48;11:25:11:26:0;:28::30;:8::33:1;2:37:12:5',
        sourceTags: '23:23:sc',
      },
      fingerprint: '7dfcd01f0ecb5e1dec3d2fb363b5af79eb84a15395e1b57fe9c383cb3861d634',
    },
  },
];
