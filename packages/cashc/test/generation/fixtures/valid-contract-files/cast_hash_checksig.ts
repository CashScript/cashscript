import { Fixture } from '../../fixture-utils.js';

export const fixtures: Fixture[] = [
  {
    artifact: {
      contractName: 'CastHashChecksig',
      constructorInputs: [],
      abi: [{ name: 'hello', inputs: [{ name: 'pk', type: 'pubkey' }, { name: 's', type: 'sig' }] }],
      bytecode:
        // require((ripemd160(bytes(pk)) == hash160(0x0) == !true));
        'OP_DUP OP_RIPEMD160 OP_0 OP_HASH160 OP_EQUAL OP_1 OP_NOT OP_NUMEQUALVERIFY '
        // require(checkSig(s, pk));
        + 'OP_CHECKSIG',
      debug: {
        bytecode: '76a600a98751919dac',
        logs: [],
        requires: [
          { ip: 7, line: 3 },
          { ip: 9, line: 4 },
        ],
        sourceMap: '3:33:3:35;:17::37:1;:49::51:0;:41::52:1;:17;:57::61:0;:56:::1;:8::64;4::4:33',
      },
      fingerprint: 'bbf25f5a4cfbc9380707afca6d1f14a29c7971f589949d284859225508f4bad6',
    },
  },
];
