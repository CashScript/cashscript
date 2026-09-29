import { Fixture } from '../../fixture-utils.js';

export const fixtures: Fixture[] = [
  {
    artifact: {
      contractName: 'Loopy',
      constructorInputs: [],
      abi: [{ name: 'doLoop', inputs: [] }],
      bytecode:
        // int sum = 0;
        'OP_0 '
        // int i = 0;
        + 'OP_0 '
        // do {
        + 'OP_BEGIN '
        // sum = tx.inputs[i].value;
        + 'OP_DUP OP_UTXOVALUE OP_ROT OP_DROP OP_SWAP '
        // i = i + 1;
        + 'OP_1ADD '
        // } while (i < tx.inputs.length);
        + 'OP_DUP OP_TXINPUTCOUNT OP_GREATERTHANOREQUAL OP_UNTIL '
        // require(sum > 2000);
        + 'OP_SWAP d007 OP_GREATERTHAN '
        // Cleanup
        + 'OP_NIP',
      fingerprint: '46abccb7ef0a81c35e6f20ae62afd904d9e72e7bca703798a6726d7434ab7ad1',
      debug: {
        bytecode: '00006576c67b757c8b76c3a2667c02d007a077',
        sourceMap: '3:18:3:19;4:16:4:17;6:8:9:39;7:28:7:29;:18::36:1;:12::37;;;8::8:22;9:17:9:18:0;:21::37;6:8::39:1;;12:16:12:19:0;:22::26;:8::28:1;2:22:13:5',
        logs: [{ ip: 13, line: 11, data: [{ stackIndex: 1, type: 'int', ip: 13 }] }],
        requires: [{ ip: 16, line: 12 }],
        sourceTags: '16:16:sc',
      },
    },
  },
];
