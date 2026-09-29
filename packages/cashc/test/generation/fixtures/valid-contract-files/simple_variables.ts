import { Fixture } from '../../fixture-utils.js';

export const fixtures: Fixture[] = [
  {
    artifact: {
      contractName: 'Test',
      constructorInputs: [{ name: 'x', type: 'int' }, { name: 'y', type: 'string' }],
      abi: [{ name: 'hello', inputs: [{ name: 's', type: 'sig' }, { name: 'pk', type: 'pubkey' }] }],
      bytecode:
        // int myVariable = 10 - 4;
        'OP_10 OP_4 OP_SUB '
        // int myOtherVariable = 20 + myVariable % 2;
        + '14 OP_SWAP OP_2 OP_MOD OP_ADD '
        // require(myOtherVariable > x);
        + 'OP_LESSTHAN OP_VERIFY '
        // string hw = "Hello World";
        + '48656c6c6f20576f726c64 '
        // hw = hw + y;
        + 'OP_DUP OP_ROT OP_CAT '
        // require(ripemd160(pk) == ripemd160(hw));
        + 'OP_3 OP_PICK OP_RIPEMD160 OP_SWAP OP_RIPEMD160 OP_EQUALVERIFY '
        // require(checkSig(s, pk));
        + 'OP_SWAP OP_ROT OP_CHECKSIG '
        // Cleanup
        + 'OP_NIP',
      fingerprint: '020af19263094d41bde5bc002db29a858c512709a15b7df1319bb75cbeacb289',
      debug: {
        bytecode: '5a549401147c5297939f690b48656c6c6f20576f726c64767b7e5379a67ca6887c7bac77',
        sourceMap: '3:25:3:27;:30::31;:25:::1;4:30:4:32:0;:35::45;:48::49;:35:::1;:30;5:16:5:35;:8::37;7:20:7:33:0;8:13:8:15;:18::19;:13:::1;10:26:10:28:0;;:16::29:1;:43::45:0;:33::46:1;:8::48;11:25:11:26:0;:28::30;:8::33:1;2:37:12:5',
        logs: [],
        requires: [{ ip: 11, line: 5 }, { ip: 21, line: 10 }, { ip: 25, line: 11 }],
        sourceTags: '23:23:sc',
      },
    },
  },
];
