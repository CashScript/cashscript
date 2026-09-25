import { Fixture } from '../../fixture-utils.js';

export const fixtures: Fixture[] = [
  {
    artifact: {
      contractName: 'GlobalFunctionInControlFlow',
      constructorInputs: [],
      abi: [{ name: 'spend', inputs: [{ name: 'x', type: 'int' }, { name: 'useLoop', type: 'bool' }] }],
      bytecode:
        // Implicit parameter type enforcement
        'OP_SWAP OP_0NOTEQUAL '
        // int total = 0;
        + 'OP_0 '
        // if (useLoop) {
        + 'OP_SWAP OP_IF '
        // for (int i = 0; i < 3; i = i + 1) {
        + 'OP_0 OP_BEGIN OP_DUP OP_3 OP_LESSTHAN OP_DUP OP_TOALTSTACK OP_IF '
        // total = total + triple(x);
        + 'OP_OVER OP_3 OP_PICK OP_3 OP_MUL OP_ADD OP_ROT OP_DROP OP_SWAP '
        // For loop update
        + 'OP_1ADD '
        // Loop condition
        + 'OP_ENDIF OP_FROMALTSTACK OP_NOT OP_UNTIL '
        // Cleanup
        + 'OP_DROP '
        // } else {
        + 'OP_ELSE '
        // total = triple(x);
        + 'OP_OVER OP_3 OP_MUL OP_NIP '
        // }
        + 'OP_ENDIF '
        // require(total == 9);
        + 'OP_9 OP_NUMEQUAL '
        // Cleanup
        + 'OP_NIP',
      fingerprint: 'c14759968b45b80fb6bdf19f487d3dbad06e493976633b61eeb4d1522085b5cc',
      debug: {
        bytecode: '7c92007c63006576539f766b637853795395937b757c8b686c916675677853957768599c77',
        sourceMap: '6:26:6:38;;7:20:7:21;8:12:8:19;:21:12:9;9:25:9:26;:12:11:13;:28:9:29;:32::33;:28:::1;;;:46:11:13:0;10:24:10:29;:39::40;;:32::41:1;;:24;:16::42;;;9:35:9:44;:46:11:13;;:12;;;12:15:14:9:0;13:27:13:28;:20::29:1;;:12::30;12:15:14:9;15:25:15:26:0;:8::28:1;6:40:16:5',
        logs: [],
        requires: [{ ip: 36, line: 15 }],
        sourceTags: '0:1:pv;22:22:fu;23:26:lc;27:27:sc;36:36:sc',
        functions: [
          {
            name: 'triple',
            inputs: [{ name: 'a', type: 'int' }],
            bytecode: '5395',
            sourceMap: '2:15:2:16;:11:::1',
            logs: [],
            requires: [],
          },
        ],
        inlineRanges: '16:17:triple;30:31:triple',
      },
    },
  },
];
