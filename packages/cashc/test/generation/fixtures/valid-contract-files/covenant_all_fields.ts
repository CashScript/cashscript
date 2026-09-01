import { Fixture } from '../../fixture-utils.js';

export const fixtures: Fixture[] = [
  {
    artifact: {
      contractName: 'Covenant',
      constructorInputs: [],
      abi: [{ name: 'spend', inputs: [] }],
      bytecode:
        // injected by InjectLocktimeGuardTraversal because tx.locktime is used
        'OP_TXLOCKTIME OP_CHECKLOCKTIMEVERIFY OP_DROP '
        // require(tx.version == 2)
        + 'OP_TXVERSION OP_2 OP_NUMEQUALVERIFY '
        // require(tx.locktime == 0)
        + 'OP_TXLOCKTIME OP_0 OP_NUMEQUALVERIFY '
        // require(tx.inputs.length == 1)
        + 'OP_TXINPUTCOUNT OP_1 OP_NUMEQUALVERIFY '
        // require(tx.outputs.length == 1)
        + 'OP_TXOUTPUTCOUNT OP_1 OP_NUMEQUALVERIFY '
        // require(this.activeInputIndex == 0)
        + 'OP_INPUTINDEX OP_0 OP_NUMEQUALVERIFY '
        // require(this.activeBytecode.length == 300)
        + 'OP_ACTIVEBYTECODE OP_SIZE OP_NIP 2c01 OP_NUMEQUALVERIFY '
        // require(tx.inputs[0].value == 10000)
        + 'OP_0 OP_UTXOVALUE 1027 OP_NUMEQUALVERIFY '
        // require(tx.inputs[0].lockingBytecode.length == 10000)
        + 'OP_0 OP_UTXOBYTECODE OP_SIZE OP_NIP 1027 OP_NUMEQUALVERIFY '
        // require(tx.inputs[0].outpointTransactionHash == 0x00...00)
        + 'OP_0 OP_OUTPOINTTXHASH 0000000000000000000000000000000000000000000000000000000000000000 OP_EQUALVERIFY '
        // require(tx.inputs[0].outpointIndex == 0)
        + 'OP_0 OP_OUTPOINTINDEX OP_0 OP_NUMEQUALVERIFY '
        // require(tx.inputs[0].unlockingBytecode.length == 100)
        + 'OP_0 OP_INPUTBYTECODE OP_SIZE OP_NIP 64 OP_NUMEQUALVERIFY '
        // require(tx.inputs[0].sequenceNumber == 0)
        + 'OP_0 OP_INPUTSEQUENCENUMBER OP_0 OP_NUMEQUALVERIFY '
        // require(tx.outputs[0].value == 10000)
        + 'OP_0 OP_OUTPUTVALUE 1027 OP_NUMEQUALVERIFY '
        // require(tx.outputs[0].lockingBytecode.length == 100)
        + 'OP_0 OP_OUTPUTBYTECODE OP_SIZE OP_NIP 64 OP_NUMEQUALVERIFY '
        // require(tx.inputs[0].tokenCategory == 0x000000000000000000000000000000000000000000000000000000000000000)
        + 'OP_0 OP_UTXOTOKENCATEGORY 0000000000000000000000000000000000000000000000000000000000000000 OP_EQUALVERIFY '
        // require(tx.inputs[0].nftCommitment == 0x00);
        + 'OP_0 OP_UTXOTOKENCOMMITMENT 00 OP_EQUALVERIFY '
        // require(tx.inputs[0].tokenAmount == 100);
        + 'OP_0 OP_UTXOTOKENAMOUNT 64 OP_NUMEQUALVERIFY '
        // require(tx.outputs[0].tokenCategory == 0x000000000000000000000000000000000000000000000000000000000000000)
        + 'OP_0 OP_OUTPUTTOKENCATEGORY 0000000000000000000000000000000000000000000000000000000000000000 OP_EQUALVERIFY '
        // require(tx.outputs[0].nftCommitment == 0x00);
        + 'OP_0 OP_OUTPUTTOKENCOMMITMENT 00 OP_EQUALVERIFY '
        // require(tx.outputs[0].tokenAmount == 100);
        + 'OP_0 OP_OUTPUTTOKENAMOUNT 64 OP_NUMEQUAL',
      debug: {
        bytecode: 'c5b175c2529dc5009dc3519dc4519dc0009dc18277022c019d00c60210279d00c782770210279d00c82000000000000000000000000000000000000000000000000000000000000000008800c9009d00ca827701649d00cb009d00cc0210279d00cd827701649d00ce2000000000000000000000000000000000000000000000000000000000000000008800cf01008800d001649d00d12000000000000000000000000000000000000000000000000000000000000000008800d201008800d301649c',
        logs: [],
        requires: [
          {
            ip: 1,
            line: 2,
            message: 'Using tx.locktime requires a non-final sequence number on the spending input',
          },
          { ip: 5, line: 3 },
          { ip: 8, line: 4 },
          { ip: 11, line: 5 },
          { ip: 14, line: 6 },
          { ip: 17, line: 7 },
          { ip: 22, line: 8 },
          { ip: 26, line: 9 },
          { ip: 32, line: 10 },
          { ip: 36, line: 11 },
          { ip: 40, line: 12 },
          { ip: 46, line: 13 },
          { ip: 50, line: 14 },
          { ip: 54, line: 15 },
          { ip: 60, line: 16 },
          { ip: 64, line: 17 },
          { ip: 68, line: 18 },
          { ip: 72, line: 19 },
          { ip: 76, line: 20 },
          { ip: 80, line: 21 },
          { ip: 85, line: 22 },
        ],
        sourceMap: '2:21:2:21;::::1;;3:16:3:26:0;:30::31;:8::33:1;4:16:4:27:0;:31::32;:8::34:1;5:16:5:32:0;:36::37;:8::39:1;6:16:6:33:0;:37::38;:8::40:1;7:16:7:37:0;:41::42;:8::44:1;8:16:8:35:0;:::42:1;;:46::49:0;:8::51:1;9:26:9:27:0;:16::34:1;:38::43:0;:8::45:1;10:26:10:27:0;:16::44:1;:::51;;:55::60:0;:8::62:1;11:26:11:27:0;:16::52:1;:56::121:0;:8::123:1;12:26:12:27:0;:16::42:1;:46::47:0;:8::49:1;13:26:13:27:0;:16::46:1;:::53;;:57::60:0;:8::62:1;14:26:14:27:0;:16::43:1;:47::48:0;:8::50:1;15:27:15:28:0;:16::35:1;:39::44:0;:8::46:1;16:27:16:28:0;:16::45:1;:::52;;:56::59:0;:8::61:1;17:26:17:27:0;:16::42:1;:46::111:0;:8::113:1;18:26:18:27:0;:16::42:1;:46::50:0;:8::52:1;19:26:19:27:0;:16::40:1;:44::47:0;:8::49:1;20:27:20:28:0;:16::43:1;:47::112:0;:8::114:1;21:27:21:28:0;:16::43:1;:47::51:0;:8::53:1;22:27:22:28:0;:16::41:1;:45::48:0;:8::50:1',
        sourceTags: '0:2:lg',
      },
      fingerprint: '371d30dbd28672395a164baee67b27ad86454fa53daccdb7a770a7916902f607',
    },
  },
];
