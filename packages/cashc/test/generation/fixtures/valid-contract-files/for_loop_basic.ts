import { Fixture } from '../../fixture-utils.js';

export const fixtures: Fixture[] = [
  {
    artifact: {
      contractName: 'ForLoopBasic',
      constructorInputs: [],
      abi: [{ name: 'spend', inputs: [] }],
      bytecode: 'OP_0 OP_0 OP_BEGIN OP_DUP OP_3 OP_LESSTHAN OP_DUP OP_TOALTSTACK OP_IF OP_2DUP OP_ADD OP_ROT OP_DROP OP_SWAP OP_DUP OP_1ADD OP_NIP OP_ENDIF OP_FROMALTSTACK OP_NOT OP_UNTIL OP_DROP OP_3 OP_NUMEQUAL',
      debug: {
        bytecode: '00006576539f766b636e937b757c768b77686c916675539c',
        sourceMap: '3:18:3:19;5:21:5:22;:8:7:9;:24:5:25;:28::29;:24:::1;;;:36:7:9:0;6:18:6:25;::::1;:12::26;;;5:31:5:32:0;:::34:1;;:36:7:9;;:8;;;9:23:9:24:0;:8::26:1',
        logs: [],
        requires: [
          { ip: 24, line: 9 },
        ],
        sourceTags: '14:16:fu;17:20:lc;21:21:sc',
      },
      fingerprint: '9e52dba656b0743057d4eda76f051c8a1f4460a2becf8f372c690b1901512b4e',
    },
  },
];
