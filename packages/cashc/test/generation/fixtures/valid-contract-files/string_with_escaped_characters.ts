import { Fixture } from '../../fixture-utils.js';

export const fixtures: Fixture[] = [
  {
    artifact: {
      contractName: 'Test',
      constructorInputs: [{ name: 'x', type: 'int' }],
      abi: [{ name: 'hello', inputs: [] }],
      bytecode:
        // int myVariable = 10 - 4;
        'OP_10 OP_4 OP_SUB '
        // int myOtherVariable = 20 + myVariable % 2;
        + '14 OP_SWAP OP_2 OP_MOD OP_ADD '
        // require(myOtherVariable > x);
        + 'OP_LESSTHAN OP_VERIFY '
        // string x1 = "Hello \n \\ ' ''  \" World";
        + '48656c6c6f205c6e205c5c202720272720205c2220576f726c64 '
        // string x2 = 'Hello \n \\ " " \' World';
        + '48656c6c6f205c6e205c5c20222022205c2720576f726c64 '
        // require(ripemd160(x1) == hash160(x2));
        + 'OP_SWAP OP_RIPEMD160 OP_SWAP OP_HASH160 OP_EQUAL',
      fingerprint: '71ca7d617d2d655b8d2f6dfdd9ef77cb2b1e5ca855b85b22bf791965b02f6517',
      debug: {
        bytecode: '5a549401147c5297939f691a48656c6c6f205c6e205c5c202720272720205c2220576f726c641848656c6c6f205c6e205c5c20222022205c2720576f726c647ca67ca987',
        sourceMap: '3:25:3:27;:30::31;:25:::1;4:30:4:32:0;:35::45;:48::49;:35:::1;:30;5:16:5:35;:8::37;7:20:7:48:0;8::8:46;9:26:9:28;:16::29:1;:41::43:0;:33::44:1;:8::46',
        logs: [],
        requires: [{ ip: 10, line: 5 }, { ip: 18, line: 9 }],
      },
    },
  },
];
