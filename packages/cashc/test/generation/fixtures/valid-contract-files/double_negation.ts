import { Fixture } from '../../fixture-utils.js';

export const fixtures: Fixture[] = [
  {
    artifact: {
      contractName: 'DoubleNegation',
      constructorInputs: [{ name: 'flag', type: 'bool' }],
      abi: [{ name: 'spend', inputs: [{ name: 'target', type: 'int' }] }],
      bytecode:
        // require(!!flag) - OP_NOT OP_NOT OP_VERIFY is optimised to OP_VERIFY
        'OP_DUP OP_VERIFY '
        // int i = 0; bool done = false;
        + 'OP_0 OP_0 '
        // do { i = i + 1;
        + 'OP_BEGIN OP_OVER OP_1ADD OP_ROT OP_DROP OP_SWAP '
        // done = i >= target;
        + 'OP_OVER OP_4 OP_PICK OP_GREATERTHANOREQUAL OP_NIP '
        // } while (!done) - OP_NOT OP_NOT OP_UNTIL is optimised to OP_UNTIL
        + 'OP_DUP OP_UNTIL '
        // if (!!flag) - OP_NOT OP_NOT OP_IF becomes OP_NOT OP_NOTIF, which is optimised to OP_IF
        + 'OP_ROT OP_IF '
        // require(i == target); }
        + 'OP_OVER OP_3 OP_PICK OP_NUMEQUALVERIFY OP_ENDIF '
        // require(i > 0)
        + 'OP_SWAP OP_0 OP_GREATERTHAN '
        // clean up i and done
        + 'OP_NIP OP_NIP',
      debug: {
        bytecode: '7669000065788b7b757c785479a27776667b637853799d687c00a07777',
        sourceMap: '4:18:4:22;:8::24:1;6:16:6:17:0;7:20:7:25;9:8:13:24;10:16:10:17;:::21:1;:12::22;;;11:19:11:20:0;:24::30;;:19:::1;:12::31;13:18:13:22:0;9:8::24:1;16:14:16:18:0;:12:18:9;17:20:17:21;:25::31;;:12::33:1;16:20:18:9;20:16:20:17:0;:20::21;:8::23:1;2:31:21:5;',
        logs: [],
        requires: [
          { ip: 2, line: 4 },
          { ip: 23, line: 17 },
          { ip: 28, line: 20 },
        ],
        sourceTags: '27:28:sc',
      },
      fingerprint: 'ed0b5bc35f0130fa04d1fce813fbd7c183bb5346006d10c0808f0d9872712ded',
    },
  },
];
