import { Fixture } from '../../fixture-utils.js';

export const fixtures: Fixture[] = [
  {
    artifact: {
      contractName: 'HodlVault',
      constructorInputs: [
        { name: 'ownerPk', type: 'pubkey' },
        { name: 'oraclePk', type: 'pubkey' },
        { name: 'minBlock', type: 'int' },
        { name: 'priceTarget', type: 'int' },
      ],
      abi: [
        {
          name: 'spend',
          inputs: [
            { name: 'ownerSig', type: 'sig' },
            { name: 'oracleSig', type: 'datasig' },
            { name: 'oracleMessage', type: 'bytes8' },
          ],
        },
      ],
      bytecode:
        // Implicit type enforcement for oracleMessage: require(oracleMessage.length == 8)
        'OP_6 OP_ROLL OP_SIZE OP_8 OP_EQUALVERIFY '
        // bytes4 blockHeightBin, bytes4 priceBin = oracleMessage.split(4);
        + 'OP_DUP OP_4 OP_SPLIT '
        // int blockHeight = int(blockHeightBin);
        + 'OP_SWAP OP_BIN2NUM '
        // int price = int(priceBin);
        + 'OP_SWAP OP_BIN2NUM '
        // require(blockHeight >= minBlock);
        + 'OP_OVER OP_6 OP_ROLL OP_GREATERTHANOREQUAL OP_VERIFY '
        // require(tx.time >= blockHeight);
        + 'OP_SWAP OP_CHECKLOCKTIMEVERIFY OP_DROP '
        // require(price >= priceTarget);
        + 'OP_4 OP_ROLL OP_GREATERTHANOREQUAL OP_VERIFY '
        // require(checkDataSig(oracleSig, oracleMessage, oraclePk));
        + 'OP_4 OP_ROLL OP_SWAP OP_3 OP_ROLL OP_CHECKDATASIGVERIFY '
        // require(checkSig(ownerSig, ownerPk));
        + 'OP_CHECKSIG',
      debug: {
        bytecode: '567a82588876547f7c817c8178567aa2697cb175547aa269547a7c537abbac',
        logs: [],
        requires: [
          { ip: 20, line: 23 },
          { ip: 22, line: 24 },
          { ip: 27, line: 27 },
          { ip: 33, line: 30 },
          { ip: 35, line: 35 },
        ],
        sourceMap: '15:8:15:28;;;;;18:49:18:62;:69::70;:49::71:1;19:30:19:44:0;:26::45:1;20:24:20:32:0;:20::33:1;23:16:23:27:0;:31::39;;:16:::1;:8::41;24:27:24:38:0;:8::40:1;;27:25:27:36:0;;:16:::1;:8::38;31:12:31:21:0;;32::32:25;33::33:20;;30:8:34:11:1;35::35:45',
        sourceTags: '0:4:pv',
      },
      fingerprint: 'd87449bc71344f12ed3c9ce3f69f844cd1699df29553ec3884c1fcc92a2cfccf',
    },
  },
];
