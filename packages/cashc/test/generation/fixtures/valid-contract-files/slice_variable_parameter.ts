import { Fixture } from '../../fixture-utils.js';

export const fixtures: Fixture[] = [
  {
    artifact: {
      contractName: 'Slice',
      constructorInputs: [{ name: 'pkh', type: 'bytes20' }],
      abi: [{ name: 'spend', inputs: [] }],
      bytecode:
        // int x = 3;
        'OP_3 '
        // bytes actualPkh = tx.inputs[this.activeInputIndex].lockingBytecode.slice(x, 23);
        + 'OP_INPUTINDEX OP_UTXOBYTECODE 17 OP_SPLIT OP_DROP OP_SWAP OP_SPLIT OP_NIP '
        // require(pkh == actualPkh);
        + 'OP_EQUAL',
      fingerprint: '44e982ad69fd5e934e67da5c478f09dcfd07e925b6817e033c3ac2c1a379be56',
      debug: {
        bytecode: '53c0c701177f757c7f7787',
        sourceMap: '3:16:3:17;4:36:4:57;:26::74:1;:84::86:0;:26::87:1;;:81::82:0;:26::87:1;;5:8:5:34',
        logs: [],
        requires: [{ ip: 11, line: 5 }],
      },
    },
  },
];
