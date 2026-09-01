import { Fixture } from '../../fixture-utils.js';

export const fixtures: Fixture[] = [
  {
    artifact: {
      contractName: 'GlobalFunctionAltStackCleanup',
      constructorInputs: [],
      abi: [{ name: 'spend', inputs: [{ name: 'x', type: 'int' }] }],
      bytecode:
        // int lo, int hi = orderedPair(1, 2, x);
        'OP_1 OP_2 OP_ROT OP_0 OP_0 OP_ROT OP_0 OP_GREATERTHAN OP_IF OP_3 OP_PICK OP_ROT OP_DROP OP_SWAP OP_2 OP_PICK OP_NIP OP_ELSE OP_NIP OP_OVER OP_SWAP OP_3 OP_PICK OP_NIP OP_ENDIF OP_ROT OP_DROP OP_ROT OP_DROP '
        // require(lo == 1, "lo should be 1");
        + 'OP_SWAP OP_1 OP_NUMEQUALVERIFY '
        // require(hi == 2, "hi should be 2");
        + 'OP_2 OP_NUMEQUAL',
      fingerprint: '641437fc5e376f92f1da865a9a0e8a1cc1a48fe845b38ea10afa9ba4ce4e5908',
      debug: {
        bytecode: '51527b00007b00a06353797b757c5279776777787c537977687b757b757c519d529c',
        sourceMap: '16:37:16:38;:40::41;:43::44;:25::45:1;;;;;;;;;;;;;;;;;;;;;;;;;;17:16:17:18:0;:22::23;:8::43:1;18:22:18:23:0;:8::43:1',
        logs: [],
        requires: [{ ip: 31, line: 17, message: 'lo should be 1' }, { ip: 34, line: 18, message: 'hi should be 2' }],
        functions: [
          {
            name: 'orderedPair',
            inputs: [{ name: 'a', type: 'int' }, { name: 'b', type: 'int' }, { name: 'c', type: 'int' }],
            bytecode: '00007b00a06353797b757c5279776777787c537977687b757b75',
            sourceMap: '2:13:2:14;3::3;4:8:4:9;:12::13;:8:::1;:15:7:5:0;5:13:5:14;;:8::15:1;;;6:13:6:14:0;;:8::15:1;7:11:10:5:0;8:8:8:15:1;;;9:13:9:14:0;;:8::15:1;7:11:10:5;1:61:12:1;;;',
            logs: [],
            requires: [],
          },
        ],
        inlineRanges: '3:28:orderedPair',
      },
    },
  },
];
