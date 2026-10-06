import { Fixture } from '../../fixture-utils.js';

// .slice(start, end) evaluates end before start, so a variable used in both arguments is picked for end and
// rolled for start (instead of being rolled for end and then missing, or read from a stale slot, for start)
export const fixtures: Fixture[] = [
  {
    artifact: {
      contractName: 'SliceVariableReuse',
      constructorInputs: [],
      abi: [{ name: 'spend', inputs: [{ name: 'data', type: 'bytes' }, { name: 'index', type: 'int' }] }],
      bytecode:
        // int next = index + 1;
        'OP_OVER OP_1ADD '
        // next = next + 1;
        + 'OP_DUP OP_1ADD '
        // require(data.slice(next, next + 1) == 0x33);
        + 'OP_2 OP_PICK OP_OVER OP_1ADD OP_SPLIT OP_DROP OP_SWAP OP_SPLIT OP_NIP 33 OP_EQUALVERIFY '
        // require(data.slice(index, index + 1) == 0x11);
        + 'OP_SWAP OP_2 OP_PICK OP_1ADD OP_SPLIT OP_DROP OP_ROT OP_SPLIT OP_NIP 11 OP_EQUAL '
        // Cleanup
        + 'OP_NIP',
      fingerprint: '0a6cc4f0f4501ccedf69cdaa12650fe3fe3db0c50ce85643d2f0b9ce5dae9b94',
      debug: {
        bytecode: '788b768b5279788b7f757c7f770133887c52798b7f757b7f7701118777',
        sourceMap: '3:19:3:24;:::28:1;4:15:4:19:0;:::23:1;5:16:5:20:0;;:33::37;:::41:1;:16::42;;:27::31:0;:16::42:1;;:46::50:0;:8::52:1;6:16:6:20:0;:34::39;;:::43:1;:16::44;;:27::32:0;:16::44:1;;:48::52:0;:8::54:1;2:42:7:5',
        logs: [],
        requires: [{ ip: 14, line: 5 }, { ip: 26, line: 6 }],
        sourceTags: '26:26:sc',
      },
    },
  },
];
