import { Fixture } from '../../fixture-utils.js';

export const fixtures: Fixture[] = [
  {
    artifact: {
      contractName: 'Contract',
      constructorInputs: [{ name: 'ownerPk', type: 'pubkey' }, { name: 'oraclePk', type: 'pubkey' }],
      abi: [
        {
          name: 'spend',
          inputs: [
            { name: 'ownerSig', type: 'sig' },
            { name: 'oracleMsgSig', type: 'datasig' },
            { name: 'oracleTxSig', type: 'sig' },
          ],
        },
      ],
      bytecode:
        // bytes oracleMessage = bytes('Spend') + bytes(12,);
        '5370656e64 OP_12 OP_CAT '
        // oracleMsgSig,
        + 'OP_4 OP_ROLL '
        // oracleMessage,
        + 'OP_SWAP '
        // oraclePk,
        + 'OP_3 OP_PICK '
        // ));
        + 'OP_CHECKDATASIGVERIFY '
        // require(checkMultiSig([
        + 'OP_0 '
        // ownerSig,
        + 'OP_3 OP_ROLL '
        // oracleTxSig,
        + 'OP_4 OP_ROLL '
        // ], [
        + 'OP_2 '
        // ownerPk,
        + 'OP_2ROT OP_SWAP '
        // ]));
        + 'OP_2 OP_CHECKMULTISIG',
      fingerprint: '653df414836629dae799aa48f05529eb33462214bbb29534483bc72aabb4bceb',
      debug: {
        bytecode: '055370656e645c7e547a7c5379bb00537a547a52717c52ae',
        sourceMap: '10:36:10:43;:53::55;:30::57:1;12:12:12:24:0;;13::13:25;14::14:20;;11:8:15:11:1;16:16:22:10:0;17:12:17:20;;18::18:23;;16:30:19:9:1;20:12:21:20:0;;19:11:22:9:1;16:8::12',
        logs: [],
        requires: [{ ip: 10, line: 11 }, { ip: 21, line: 16 }],
      },
    },
  },
];
