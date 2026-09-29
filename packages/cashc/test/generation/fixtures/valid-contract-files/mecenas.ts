import { Fixture } from '../../fixture-utils.js';

export const fixtures: Fixture[] = [
  {
    artifact: {
      contractName: 'Mecenas',
      constructorInputs: [
        { name: 'recipient', type: 'bytes20' },
        { name: 'funder', type: 'bytes20' },
        { name: 'pledge', type: 'int' },
        { name: 'period', type: 'int' },
      ],
      abi: [
        { name: 'receive', inputs: [] },
        { name: 'reclaim', inputs: [{ name: 'pk', type: 'pubkey' }, { name: 's', type: 'sig' }] },
      ],
      bytecode:
        // function receive
        'OP_4 OP_PICK OP_0 OP_NUMEQUAL OP_IF '
        // require(this.age >= period)
        + 'OP_3 OP_ROLL OP_CHECKSEQUENCEVERIFY OP_DROP '
        // require(tx.inputs.length == 1)
        + 'OP_TXINPUTCOUNT OP_1 OP_NUMEQUALVERIFY '
        // require(tx.outputs[0].lockingBytecode == new LockingBytecodeP2PKH(recipient))
        + 'OP_0 OP_OUTPUTBYTECODE 76a914 OP_ROT OP_CAT 88ac OP_CAT OP_EQUALVERIFY '
        // int minerFee = 1000
        + 'e803 '
        // int currentValue = tx.inputs[this.activeInputIndex].value
        + 'OP_INPUTINDEX OP_UTXOVALUE '
        // int changeValue = currentValue - pledge - minerFee
        + 'OP_DUP OP_4 OP_PICK OP_SUB OP_2 OP_PICK OP_SUB '
        // if (changeValue <= pledge + minerFee) {
        + 'OP_DUP OP_5 OP_PICK OP_4 OP_PICK OP_ADD OP_LESSTHANOREQUAL OP_IF '
        // require(tx.outputs[0].value == currentValue - minerFee)
        + 'OP_0 OP_OUTPUTVALUE OP_2OVER OP_SWAP OP_SUB OP_NUMEQUALVERIFY '
        // } else {
        + 'OP_ELSE '
        // require(tx.outputs[0].value == pledge)
        + 'OP_0 OP_OUTPUTVALUE OP_5 OP_PICK OP_NUMEQUALVERIFY '
        // require(
        //   tx.outputs[1].lockingBytecode == tx.inputs[this.activeInputIndex].lockingBytecode
        // )
        + 'OP_1 OP_OUTPUTBYTECODE OP_INPUTINDEX OP_UTXOBYTECODE OP_EQUALVERIFY '
        // require(tx.outputs[1].value == changeValue) }
        + 'OP_1 OP_OUTPUTVALUE OP_OVER OP_NUMEQUALVERIFY '
        // Cleanup
        + 'OP_ENDIF OP_2DROP OP_2DROP OP_2DROP OP_1 OP_ELSE '
        // function reclaim
        + 'OP_4 OP_ROLL OP_1 OP_NUMEQUALVERIFY '
        // require(hash160(pk) == funder)
        + 'OP_4 OP_PICK OP_HASH160 OP_ROT OP_EQUALVERIFY '
        // require(checkSig(s, pk))
        + 'OP_4 OP_ROLL OP_4 OP_ROLL OP_CHECKSIG '
        // Cleanup
        + 'OP_NIP OP_NIP OP_NIP OP_ENDIF',
      debug: {
        bytecode: '5479009c63537ab275c3519d00cd0376a9147b7e0288ac7e8802e803c0c676547994527994765579547993a16300cc707c949d6700cc55799d51cdc0c78851cc789d686d6d6d5167547a519d5479a97b88547a547aac77777768',
        logs: [],
        requires: [
          { ip: 11, line: 3 },
          { ip: 15, line: 7 },
          { ip: 23, line: 10 },
          { ip: 47, line: 19 },
          { ip: 53, line: 21 },
          { ip: 58, line: 22 },
          { ip: 62, line: 23 },
          { ip: 77, line: 28 },
          { ip: 83, line: 29 },
        ],
        sourceMap: '2:4:25:5;;;;;3:28:3:34;;:8::36:1;;7:16:7:32:0;:36::37;:8::39:1;10:27:10:28:0;:16::45:1;:49::84:0;:74::83;:49::84:1;;;:8::86;12:23:12:27:0;13:37:13:58;:27::65:1;14:26:14:38:0;:41::47;;:26:::1;:50::58:0;;:26:::1;18:12:18:23:0;:27::33;;:36::44;;:27:::1;:12;:46:20:9:0;19:31:19:32;:20::39:1;:43::66:0;;::::1;:12::68;20:15:24:9:0;21:31:21:32;:20::39:1;:43::49:0;;:12::51:1;22:31:22:32:0;:20::49:1;:63::84:0;:53::101:1;:12::103;23:31:23:32:0;:20::39:1;:43::54:0;:12::56:1;20:15:24:9;2:23:25:5;;;;:4;27::30::0;;;;28:24:28:26;;:16::27:1;:31::37:0;:8::39:1;29:25:29:26:0;;:28::30;;:8::33:1;27:39:30:5;;;1:0:31:1',
        sourceTags: '79:81:sc',
      },
      fingerprint: '82af4e70abe6257185f9fa2b9b65377949794a7f3f862a65eb3c61ec6bbff28a',
    },
  },
];
