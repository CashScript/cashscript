import { Fixture } from '../../fixture-utils.js';

export const fixtures: Fixture[] = [
  {
    artifact: {
      contractName: 'Test',
      constructorInputs: [],
      abi: [{ name: 'send', inputs: [] }],
      bytecode:
        // require(tx.inputs[1].tokenCategory == 0x);
        'OP_1 OP_UTXOTOKENCATEGORY OP_0 OP_EQUAL',
      fingerprint: '40bc2bb628f3d2be50aa34a77c44dafd73f3a8a826bf32ef747bd77a583ea187',
      debug: {
        bytecode: '51ce0087',
        sourceMap: '3:26:3:27;:16::42:1;:46::48:0;:8::50:1',
        logs: [],
        requires: [{ ip: 4, line: 3 }],
      },
    },
  },
];
