import { Fixture } from '../../fixture-utils.js';

export const fixtures: Fixture[] = [
  {
    artifact: {
      contractName: 'Covenant',
      constructorInputs: [
        {
          name: 'requiredVersion',
          type: 'int',
        },
      ],
      abi: [{ name: 'spend', inputs: [] }],
      bytecode:
        // require(tx.version == requiredVersion)
        'OP_TXVERSION OP_NUMEQUALVERIFY '
        // require(tx.bytecode == 0x00)
        + 'OP_ACTIVEBYTECODE 00 OP_EQUAL',
      debug: {
        bytecode: 'c29dc1010087',
        logs: [],
        requires: [
          { ip: 2, line: 3 },
          { ip: 6, line: 4 },
        ],
        sourceMap: '3:16:3:26;:8::47:1;4:16:4:35:0;:39::43;:8::45:1',
      },
      fingerprint: '1fd180f7d78e9670d7b2ae95e7af1f7cc533fc42c3cfdc7872619ec5810487d2',
    },
  },
];
