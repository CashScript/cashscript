import { Fixture } from '../../fixture-utils.js';

export const fixtures: Fixture[] = [
  {
    artifact: {
      contractName: 'ForLoopBasic',
      constructorInputs: [],
      abi: [{ name: 'spend', inputs: [] }],
      bytecode: 'OP_0 OP_1 OP_1 OP_0 OP_BEGIN OP_DUP OP_3 OP_LESSTHAN OP_DUP OP_TOALTSTACK OP_IF OP_3 OP_PICK OP_OVER OP_ADD OP_4 OP_ROLL OP_DROP OP_SWAP OP_TOALTSTACK OP_SWAP OP_TOALTSTACK OP_SWAP OP_FROMALTSTACK OP_FROMALTSTACK OP_DUP OP_1ADD OP_NIP OP_ENDIF OP_FROMALTSTACK OP_NOT OP_UNTIL OP_DROP OP_ROT OP_3 OP_NUMEQUALVERIFY OP_SWAP OP_1 OP_NUMEQUALVERIFY OP_1 OP_NUMEQUAL',
      debug: {
        bytecode: '005151006576539f766b6353797893547a757c6b7c6b7c6c6c768b77686c9166757b539d7c519d519c',
        sourceMap: '3:18:3:19;4:16:4:17;5::5;7:21:7:22;:8:9:9;:24:7:25;:28::29;:24:::1;;;:39:9:9:0;8:18:8:21;;:24::25;:18:::1;:12::26;;;;;;;;;;7:31:7:32:0;:::37:1;;:39:9:9;;:8;;;11:16:11:19:0;:23::24;:8::26:1;12:16:12:17:0;:21::22;:8::24:1;13:21:13:22:0;:8::24:1',
        logs: [],
        requires: [
          { ip: 35, line: 11 },
          { ip: 38, line: 12 },
          { ip: 41, line: 13 },
        ],
        sourceTags: '25:27:fu;28:31:lc;32:32:sc',
      },
      fingerprint: '05430d75d110ff5d4525f7e34bbf2c86b8d22f4e5758f2e109180b801b21b8ec',
    },
  },
];
