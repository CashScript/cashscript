import { Fixture } from '../../fixture-utils.js';

export const fixtures: Fixture[] = [
  {
    artifact: {
      contractName: 'LockingBytecodeNullDataChunks',
      constructorInputs: [],
      abi: [
        { name: 'spend', inputs: [{ name: 'pkh', type: 'bytes20' }, { name: 'data', type: 'bytes' }] },
      ],
      bytecode:
        // (parameter validation for bytes20 pkh)
        'OP_SIZE 14 OP_EQUALVERIFY '
        // require(tx.outputs[0].lockingBytecode == new LockingBytecodeNullData([
        + 'OP_0 OP_OUTPUTBYTECODE 6a '
        //   0x6d02 (known value)
        + '026d02 OP_CAT '
        //   bytes('memo') (known value)
        + '046d656d6f OP_CAT '
        //   pkh (known length)
        + '14 OP_3 OP_ROLL OP_CAT OP_CAT '
        //   data (unknown length)
        + 'OP_ROT OP_SIZE OP_DUP OP_1 4c OP_WITHIN OP_NOTIF OP_2 OP_NUM2BIN OP_1 OP_SPLIT OP_DROP 4c OP_SWAP OP_CAT OP_ENDIF '
        + 'OP_SWAP OP_CAT OP_CAT '
        // ]));
        + 'OP_EQUAL',
      debug: {
        bytecode: '8201148800cd016a03026d027e05046d656d6f7e0114537a7e7e7b827651014ca5645280517f75014c7c7e687c7e7e87',
        sourceMap: '2:19:2:30;;;4:27:4:28;:16::45:1;:49::112:0;:78::84;::::1;:86::99:0;::::1;:101::104:0;;;::::1;;:106::110:0;::::1;;;;;;;;;;;;;;;;;;:8::114',
        logs: [],
        requires: [
          { ip: 35, line: 4 },
        ],
        sourceTags: '0:2:pv',
      },
      fingerprint: '334d3b680b5a80af6ff0a2158f339b6edfd530828669f34b06e7c9aa41556126',
    },
  },
];
