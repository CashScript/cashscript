import { Fixture } from '../../fixture-utils.js';

export const fixtures: Fixture[] = [
  {
    // A for-loop init that reassigns an existing variable replaces that variable's stack slot, so the loop's
    // final value is what the require after the loop reads (the loop's cleanup does not drop it)
    artifact: {
      contractName: 'ForLoopReassignedInit',
      constructorInputs: [],
      abi: [{ name: 'spend', inputs: [{ name: 'n', type: 'int' }] }],
      bytecode:
        // int i = 0;
        'OP_0 '
        // for (i = 0; i < n; i++) {
        + 'OP_DROP OP_0 OP_BEGIN OP_2DUP OP_GREATERTHAN OP_DUP OP_TOALTSTACK OP_IF '
        // require(tx.outputs[i].value >= 1000);
        + 'OP_DUP OP_OUTPUTVALUE e803 OP_GREATERTHANOREQUAL OP_VERIFY '
        // For loop update
        + 'OP_1ADD '
        // Loop condition
        + 'OP_ENDIF OP_FROMALTSTACK OP_NOT OP_UNTIL '
        // require(i == tx.outputs.length);
        + 'OP_TXOUTPUTCOUNT OP_NUMEQUAL '
        // Cleanup
        + 'OP_NIP',
      fingerprint: 'efe2107d45ab15018a2d5a2bc2cb0311d86ec7c8ba5e01c8503f25619ecec621',
      debug: {
        bytecode: '007500656ea0766b6376cc02e803a2698b686c9166c49c77',
        sourceMap: '3:16:3:17;5:13:5:18:1;;:8:7:9:0;:20:5:25;::::1;;;:32:7:9:0;6:31:6:32;:20::39:1;:43::47:0;:20:::1;:12::49;5:27:5:30;:32:7:9;;:8;;9:21:9:38:0;:8::40:1;2:26:10:5',
        logs: [],
        requires: [
          { ip: 13, line: 6 },
          { ip: 21, line: 9 },
        ],
        sourceTags: '14:14:fu;15:18:lc;21:21:sc',
      },
    },
  },
];
