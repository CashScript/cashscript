import { Fixture } from '../../fixture-utils.js';

export const fixtures: Fixture[] = [
  {
    // Tuple destructuring into existing variables: top-level renames (with the small helpers
    // inlined at the call sites), pure and mixed reassignment in loops, and the interleaved
    // order that parks a declaration value on the altstack mid-fold.
    artifact: {
      contractName: 'TupleReassignment',
      constructorInputs: [],
      abi: [{ name: 'spend', inputs: [{ name: 'seed', type: 'int' }] }],
      bytecode: 'OP_DUP OP_1ADD OP_2DUP OP_SWAP OP_2DUP OP_SWAP OP_0 OP_BEGIN OP_DUP OP_4 OP_LESSTHAN OP_DUP OP_TOALTSTACK OP_IF OP_OVER OP_4 OP_PICK OP_SWAP OP_5 OP_ROLL OP_DROP OP_SWAP OP_TOALTSTACK OP_SWAP OP_TOALTSTACK OP_SWAP OP_TOALTSTACK OP_SWAP OP_FROMALTSTACK OP_FROMALTSTACK OP_FROMALTSTACK OP_ROT OP_DROP OP_SWAP OP_DUP OP_1ADD OP_NIP OP_ENDIF OP_FROMALTSTACK OP_NOT OP_UNTIL OP_DROP OP_0 OP_BEGIN OP_DUP OP_4 OP_LESSTHAN OP_DUP OP_TOALTSTACK OP_IF OP_OVER OP_4 OP_PICK OP_OVER OP_2 OP_PICK OP_MUL OP_1ADD OP_SWAP OP_ROT OP_6 OP_ROLL OP_DROP OP_SWAP OP_TOALTSTACK OP_SWAP OP_TOALTSTACK OP_SWAP OP_TOALTSTACK OP_SWAP OP_TOALTSTACK OP_SWAP OP_FROMALTSTACK OP_FROMALTSTACK OP_FROMALTSTACK OP_FROMALTSTACK OP_3 OP_ROLL OP_DROP OP_SWAP OP_TOALTSTACK OP_SWAP OP_FROMALTSTACK OP_DUP OP_0 OP_GREATERTHANOREQUAL OP_VERIFY OP_OVER OP_1ADD OP_ROT OP_DROP OP_NIP OP_ENDIF OP_FROMALTSTACK OP_NOT OP_UNTIL OP_DROP OP_0 OP_BEGIN OP_DUP OP_2 OP_LESSTHAN OP_DUP OP_TOALTSTACK OP_IF OP_OVER OP_4 OP_PICK OP_OVER OP_2 OP_PICK OP_MUL OP_1ADD OP_SWAP OP_ROT OP_6 OP_ROLL OP_DROP OP_SWAP OP_TOALTSTACK OP_SWAP OP_TOALTSTACK OP_SWAP OP_TOALTSTACK OP_SWAP OP_TOALTSTACK OP_SWAP OP_FROMALTSTACK OP_FROMALTSTACK OP_FROMALTSTACK OP_FROMALTSTACK OP_TOALTSTACK OP_ROT OP_DROP OP_SWAP OP_FROMALTSTACK OP_DUP OP_0 OP_GREATERTHANOREQUAL OP_VERIFY OP_OVER OP_1ADD OP_ROT OP_DROP OP_NIP OP_ENDIF OP_FROMALTSTACK OP_NOT OP_UNTIL OP_DROP OP_2DUP OP_ROT OP_ROT OP_ADD OP_ROT OP_ADD OP_ADD OP_0 OP_GREATERTHANOREQUAL OP_VERIFY OP_2DROP OP_2DROP OP_1',
      debug: {
        bytecode: '768b6e7c6e7c006576549f766b637854797c557a757c6b7c6b7c6b7c6c6c6c7b757c768b77686c916675006576549f766b63785479785279958b7c7b567a757c6b7c6b7c6b7c6b7c6c6c6c6c537a757c6b7c6c7600a269788b7b7577686c916675006576529f766b63785479785279958b7c7b567a757c6b7c6b7c6b7c6b7c6c6c6c6c6b7b757c6c7600a269788b7b7577686c9166756e7b7b937b939300a2696d6d51',
        sourceMap: '17:16:18:20;18:::24:1;21:22:21:26:0;:17::27:1;24:26:24:30:0;:21::31:1;27::27:22:0;:8:29:9;:24:27:25;:28::29;:24:::1;;;:42:29:9:0;28:26:28:27;:29::30;;:21::31:1;:12::32;;;;;;;;;;;;;;;;27:35:27:36:0;:::40:1;:31;:42:29:9;;:8;;;33:21:33:22:0;:8:36:9;:24:33:25;:28::29;:24:::1;;;:42:36:9:0;34:34:34:35;:37::38;;:29::39:1;;;;;;;:12::40;;;;;;;;;;;;;;;;;;;;;;;35:20:35:22:0;:26::27;:20:::1;:12::29;33:35:33:36:0;:::40:1;:31;;::36:9;:42;;:8;;;40:21:40:22:0;:8:43:9;:24:40:25;:28::29;:24:::1;;;:42:43:9:0;41:34:41:35;:37::38;;:29::39:1;;;;;;;:12::40;;;;;;;;;;;;;;;;;;;;;42:20:42:22:0;:26::27;:20:::1;:12::29;40:35:40:36:0;:::40:1;:31;;::43:9;:42;;:8;;;46:24:46:28:0;48:16:48:17;:20::21;:16:::1;:24::25:0;:16:::1;:::29;:33::34:0;:16:::1;:8::36;16:29:49:5;;',
        logs: [],
        requires: [
          { ip: 86, line: 35 },
          { ip: 139, line: 42 },
          { ip: 159, line: 48 },
        ],
        sourceTags: '34:36:fu;37:40:lc;41:41:sc;87:91:fu;92:95:lc;96:96:sc;140:144:fu;145:148:lc;149:149:sc',
        functions: [
          {
            name: 'swap',
            inputs: [{ name: 'x', type: 'int' }, { name: 'y', type: 'int' }],
            bytecode: '7c',
            sourceMap: '7:14:7:15',
            logs: [],
            requires: [],
          },
          {
            name: 'step',
            inputs: [{ name: 'x', type: 'int' }, { name: 'y', type: 'int' }],
            bytecode: '785279958b7c7b',
            sourceMap: '12:11:12:12;:15::16;;:11:::1;:::20;:22::23:0;:25::26',
            logs: [],
            requires: [],
          },
        ],
        inlineRanges: '3:3:swap;5:5:swap;17:17:swap;53:59:step;108:114:step;151:151:swap',
      },
      fingerprint: '3ab69a954ec4bf9ceeb58eceb8ead206195032edf6627155eb82f528403c94dd',
    },
  },
];
