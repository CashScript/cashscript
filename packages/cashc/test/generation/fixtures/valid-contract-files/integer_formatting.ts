import { Fixture } from '../../fixture-utils.js';

export const fixtures: Fixture[] = [
  {
    artifact: {
      contractName: 'IntegerFormatting',
      constructorInputs: [],
      abi: [
        { name: 'test', inputs: [] },
      ],
      bytecode: '0010a5d4e800 0010a5d4e800 0010a5d4e800 0010a5d4e800 0010a5d4e800 OP_4 OP_ROLL OP_OVER OP_NUMEQUALVERIFY OP_3 OP_ROLL OP_OVER OP_NUMEQUALVERIFY OP_ROT OP_OVER OP_NUMEQUALVERIFY OP_NUMEQUAL',
      debug: {
        bytecode: '060010a5d4e800060010a5d4e800060010a5d4e800060010a5d4e800060010a5d4e800547a789d537a789d7b789d9c',
        logs: [],
        requires: [{ ip: 8, line: 10 }, { ip: 12, line: 11 }, { ip: 15, line: 12 }, { ip: 17, line: 13 }],
        sourceMap: '3:26:3:30;4::4;5::5:43;6:23:6:30;8:22:8:35;10:16:10:27;;:31::38;:8::40:1;11:16:11:27:0;;:31::38;:8::40:1;12:16:12:27:0;:31::38;:8::40:1;13::13:37',
      },
      fingerprint: '0b4ca541ca3bfd698bda9798bc6ce5565513848fe325360248ec00266d84c874',
    },
  },
];
