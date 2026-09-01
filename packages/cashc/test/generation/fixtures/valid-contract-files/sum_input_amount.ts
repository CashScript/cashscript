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
        + 'OP_DUP OP_1ADD OP_NIP '
        // } while (i < tx.inputs.length);
        + 'OP_DUP OP_TXINPUTCOUNT OP_GREATERTHANOREQUAL OP_UNTIL '
        // require(sum > 2000);
        + 'OP_SWAP d007 OP_GREATERTHAN '
        // Cleanup
        + 'OP_NIP',
      fingerprint: '8c4abe3e5702b4328f4d4c094e77bb69228aba3e7f7a2b51a84f9e5f119fd68d',
      debug: {
        bytecode: '00006576c67b757c768b7776c3a2667c02d007a077',
        sourceMap: '3:18:3:19;4:16:4:17;6:8:9:39;7:28:7:29;:18::36:1;:12::37;;;8:16:8:17:0;:::21:1;:12::22;9:17:9:18:0;:21::37;6:8::39:1;;12:16:12:19:0;:22::26;:8::28:1;2:22:13:5',
        logs: [{ ip: 15, line: 11, data: [{ stackIndex: 1, type: 'int', ip: 15 }] }],
        requires: [{ ip: 18, line: 12 }],
        sourceTags: '18:18:sc',
      },
    },
  },
];
