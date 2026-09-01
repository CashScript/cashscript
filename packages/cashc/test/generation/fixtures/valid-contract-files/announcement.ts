import { Fixture } from '../../fixture-utils.js';

export const fixtures: Fixture[] = [
  {
    artifact: {
      contractName: 'Announcement',
      constructorInputs: [],
      abi: [{ name: 'announce', inputs: [] }],
      bytecode:
        // bytes announcement = new LockingBytecodeNullData(...)
        '6a 6d02 OP_SIZE OP_SWAP OP_CAT OP_CAT '
        + '4120636f6e7472616374206d6179206e6f7420696e6a75726520612068756d616e20626'
        + '5696e67206f722c207468726f75676820696e616374696f6e2c20616c6c6f77206120687'
        + '56d616e206265696e6720746f20636f6d6520746f206861726d2e '
        + 'OP_SIZE OP_DUP 4b OP_GREATERTHAN OP_IF 4c OP_SWAP OP_CAT OP_ENDIF OP_SWAP OP_CAT OP_CAT '
        // require(tx.outputs[0].value == 0)
        + 'OP_0 OP_OUTPUTVALUE OP_0 OP_NUMEQUALVERIFY '
        // require(tx.outputs[0].lockingBytecode == announcement)
        + 'OP_0 OP_OUTPUTBYTECODE OP_EQUALVERIFY '
        // int minerFee = 1000
        + 'e803 '
        // int changeAmount = tx.inputs[this.activeInputIndex].value - minerFee
        + 'OP_INPUTINDEX OP_UTXOVALUE OP_OVER OP_SUB '
        // if (changeAmount >= minerFee)
        + 'OP_DUP OP_ROT OP_GREATERTHANOREQUAL OP_IF '
        // require(
        //  tx.outputs[1].lockingBytecode == tx.inputs[this.activeInputIndex].lockingBytecode
        // )
        + 'OP_1 OP_OUTPUTBYTECODE OP_INPUTINDEX OP_UTXOBYTECODE OP_EQUALVERIFY '
        // require(tx.outputs[1].value == changeAmount) }
        + 'OP_1 OP_OUTPUTVALUE OP_OVER OP_NUMEQUALVERIFY OP_ENDIF '
        // Stack clean-up
        + 'OP_DROP OP_1',
      debug: {
        bytecode: '016a026d02827c7e7e4c624120636f6e7472616374206d6179206e6f7420696e6a75726520612068756d616e206265696e67206f722c207468726f75676820696e616374696f6e2c20616c6c6f7720612068756d616e206265696e6720746f20636f6d6520746f206861726d2e8276014ba063014c7c7e687c7e7e00cc009d00cd8802e803c0c67894767ba26351cdc0c78851cc789d687551',
        logs: [],
        requires: [
          { ip: 22, line: 16 },
          { ip: 25, line: 17 },
          { ip: 39, line: 24 },
          { ip: 43, line: 25 },
        ],
        sourceMap: '10:29:13:10;11:12:11:18;::::1;;;;12:18:12:118:0;:12::119:1;;;;;;;;;;;;16:27:16:28:0;:16::35:1;:39::40:0;:8::42:1;17:27:17:28:0;:16::45:1;:8::63;21:23:21:27:0;22:37:22:58;:27::65:1;:68::76:0;:27:::1;23:12:23:24:0;:28::36;:12:::1;:38:26:9:0;24:31:24:32;:20::49:1;:63::84:0;:53::101:1;:12::103;25:31:25:32:0;:20::39:1;:43::55:0;:12::57:1;23:38:26:9;8:24:27:5;',
      },
      fingerprint: '542596767034cea0f3a5933a1efa49bb9aa569ec70c5f0261afd36ea845fa746',
    },
  },
];
