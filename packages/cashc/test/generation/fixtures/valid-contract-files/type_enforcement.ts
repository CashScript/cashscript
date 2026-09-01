import { Fixture } from '../../fixture-utils.js';

export const fixtures: Fixture[] = [
  {
    artifact: {
      contractName: 'TypeEnforcement',
      constructorInputs: [],
      abi: [{
        name: 'spend', inputs: [
          { name: 'nonEnforcedInt', type: 'int' },
          { name: 'enforcedBool', type: 'bool' },
          { name: 'enforcedBytes', type: 'bytes4' },
          { name: 'nonEnforcedBytes', type: 'bytes' },
        ],
      }],
      bytecode:
        // Implicit type enforcement for enforcedBool: enforcedBool = bool(enforcedBool)
        'OP_SWAP OP_0NOTEQUAL '
        // Implicit type enforcement for enforcedBytes: require(enforcedBytes.length == 4)
        + 'OP_ROT OP_SIZE OP_4 OP_EQUALVERIFY '
        // if(enforcedBool == true) )
        + 'OP_OVER OP_1 OP_NUMEQUAL OP_IF '
        // require(nonEnforcedInt > 6)
        + 'OP_2 OP_PICK OP_6 OP_GREATERTHAN OP_VERIFY '
        // Cleanup
        + 'OP_ENDIF '
        // if(enforcedBool == false) {
        + 'OP_SWAP OP_0 OP_NUMEQUAL OP_IF '
        // require(enforcedBytes == nonEnforcedBytes)
        + 'OP_DUP OP_3 OP_PICK OP_EQUALVERIFY '
        // Cleanup
        + 'OP_ENDIF OP_2DROP OP_DROP OP_1',
      debug: {
        bytecode: '7c927b82548878519c63527956a069687c009c6376537988686d7551',
        sourceMap: '4:8:4:25;;5::5:28;;;;8:12:8:24;:28::32;:12:::1;:34:10:9:0;9:20:9:34;;:37::38;:20:::1;:12::40;8:34:10:9;12:12:12:24:0;:28::33;:12:::1;:35:14:9:0;13:20:13:33;:37::53;;:12::55:1;12:35:14:9;7:6:15:5;;',
        sourceTags: '0:1:pv;2:5:pv',
        logs: [],
        requires: [
          { ip: 14, line: 9 },
          { ip: 23, line: 13 },
        ],
      },
      fingerprint: 'afc9b61abaaef4b60d435309b83b2cbd5750e2c1755ca903cfd3f438f7dc6126',
    },
  },
  {
    compilerOptions: {
      enforceFunctionParameterTypes: false,
    },
    artifact: {
      contractName: 'TypeEnforcement',
      constructorInputs: [],
      abi: [{
        name: 'spend', inputs: [
          { name: 'nonEnforcedInt', type: 'int' },
          { name: 'enforcedBool', type: 'bool' },
          { name: 'enforcedBytes', type: 'bytes4' },
          { name: 'nonEnforcedBytes', type: 'bytes' },
        ],
      }],
      bytecode:
        // if(enforcedBool == true)
        'OP_OVER OP_1 OP_NUMEQUAL OP_IF '
        // require(nonEnforcedInt > 6)
        + 'OP_DUP OP_6 OP_GREATERTHAN OP_VERIFY '
        // Cleanup
        + 'OP_ENDIF '
        // if(enforcedBool == false) {
        + 'OP_SWAP OP_0 OP_NUMEQUAL OP_IF '
        // require(enforcedBytes == nonEnforcedBytes)
        + 'OP_OVER OP_3 OP_PICK OP_EQUALVERIFY '
        // Cleanup
        + 'OP_ENDIF OP_2DROP OP_DROP OP_1',
      debug: {
        bytecode: '78519c637656a069687c009c6378537988686d7551',
        sourceMap: '8:12:8:24;:28::32;:12:::1;:34:10:9:0;9:20:9:34;:37::38;:20:::1;:12::40;8:34:10:9;12:12:12:24:0;:28::33;:12:::1;:35:14:9:0;13:20:13:33;:37::53;;:12::55:1;12:35:14:9;7:6:15:5;;',
        logs: [],
        requires: [
          { ip: 7, line: 9 },
          { ip: 16, line: 13 },
        ],
      },
      fingerprint: '606e540c38f161868964b683aeb0ddf93094dc36607397ef9b9f507f9028bc37',
    },
  },
];
