import { Fixture } from '../../fixture-utils.js';

export const fixtures: Fixture[] = [
  {
    artifact: {
      contractName: 'Test',
      constructorInputs: [{ name: 'x', type: 'int' }, { name: 'y', type: 'string' }],
      abi: [{ name: 'hello', inputs: [{ name: 's', type: 'sig' }, { name: 'pk', type: 'pubkey' }] }],
      bytecode:
        // int myVariable = 10 - int(true);
        'OP_10 OP_1SUB '
        // int myOtherVariable = 20 + myVariable % 2;
        + '14 OP_SWAP OP_2 OP_MOD OP_ADD '
        // require(myOtherVariable > x);
        + 'OP_LESSTHAN OP_VERIFY '
        // string hw = "Hello World";
        + '48656c6c6f20576f726c64 '
        // hw = hw + y;
        + 'OP_DUP OP_ROT OP_CAT '
        // require(ripemd160(pk) == ripemd160(bytes(hw) + bytes(pk)));
        + 'OP_3 OP_PICK OP_RIPEMD160 OP_SWAP OP_4 OP_PICK OP_CAT OP_RIPEMD160 OP_EQUALVERIFY '
        // require(checkSig(s, pk));
        + 'OP_SWAP OP_ROT OP_CHECKSIG '
        // Cleanup
        + 'OP_NIP',
      fingerprint: '31251ad758a9a5e8869e01e1e32d8df2ff1e9ed9b26d3dc3cc07280d437bdac2',
      debug: {
        bytecode: '5a8c01147c5297939f690b48656c6c6f20576f726c64767b7e5379a67c54797ea6887c7bac77',
        sourceMap: '3:25:3:27;:::39:1;4:30:4:32:0;:35::45;:48::49;:35:::1;:30;5:16:5:35;:8::37;7:20:7:33:0;8:13:8:15;:18::19;:13:::1;10:26:10:28:0;;:16::29:1;:49::51:0;:61::63;;:43::64:1;:33::65;:8::67;11:25:11:26:0;:28::30;:8::33:1;2:37:12:5',
        logs: [],
        requires: [{ ip: 10, line: 5 }, { ip: 23, line: 10 }, { ip: 27, line: 11 }],
        sourceTags: '25:25:sc',
      },
    },
  },
];
