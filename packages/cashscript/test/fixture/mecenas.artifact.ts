export default {
  contractName: 'Mecenas',
  constructorInputs: [
    {
      name: 'recipient',
      type: 'bytes20',
    },
    {
      name: 'funder',
      type: 'bytes20',
    },
    {
      name: 'pledge',
      type: 'int',
    },
  ],
  abi: [
    {
      name: 'receive',
      inputs: [],
    },
    {
      name: 'reclaim',
      inputs: [
        {
          name: 'pk',
          type: 'pubkey',
        },
        {
          name: 's',
          type: 'sig',
        },
      ],
    },
  ],
  bytecode: 'OP_3 OP_PICK OP_0 OP_NUMEQUAL OP_IF OP_0 OP_OUTPUTBYTECODE 76a914 OP_ROT OP_CAT 88ac OP_CAT OP_EQUALVERIFY e803 OP_INPUTINDEX OP_UTXOVALUE OP_DUP OP_4 OP_PICK OP_SUB OP_2 OP_PICK OP_SUB OP_DUP OP_5 OP_PICK OP_4 OP_PICK OP_ADD OP_LESSTHANOREQUAL OP_IF OP_0 OP_OUTPUTVALUE OP_2OVER OP_SWAP OP_SUB OP_NUMEQUALVERIFY OP_ELSE OP_0 OP_OUTPUTVALUE OP_5 OP_PICK OP_NUMEQUALVERIFY OP_1 OP_OUTPUTBYTECODE OP_INPUTINDEX OP_UTXOBYTECODE OP_EQUALVERIFY OP_1 OP_OUTPUTVALUE OP_OVER OP_NUMEQUALVERIFY OP_ENDIF OP_2DROP OP_2DROP OP_2DROP OP_1 OP_ELSE OP_3 OP_ROLL OP_1 OP_NUMEQUALVERIFY OP_3 OP_PICK OP_HASH160 OP_ROT OP_EQUALVERIFY OP_2SWAP OP_CHECKSIG OP_NIP OP_NIP OP_ENDIF',
  source: 'pragma cashscript >=0.8.0;\n\n/* This is an unofficial CashScript port of Licho\'s Mecenas contract. It is\n * not compatible with Licho\'s EC plugin, but rather meant as a demonstration\n * of covenants in CashScript.\n * The time checking has been removed so it can be tested without time requirements.\n */\ncontract Mecenas(bytes20 recipient, bytes20 funder, int pledge/*, int period */) {\n    function receive() {\n        // require(this.age >= period);\n\n        // Check that the first output sends to the recipient\n        require(tx.outputs[0].lockingBytecode == new LockingBytecodeP2PKH(recipient));\n\n        int minerFee = 1000;\n        int currentValue = tx.inputs[this.activeInputIndex].value;\n        int changeValue = currentValue - pledge - minerFee;\n\n        // If there is not enough left for *another* pledge after this one, we send the remainder to the recipient\n        // Otherwise we send the remainder to the recipient and the change back to the contract\n        if (changeValue <= pledge + minerFee) {\n            require(tx.outputs[0].value == currentValue - minerFee);\n        } else {\n            require(tx.outputs[0].value == pledge);\n            require(tx.outputs[1].lockingBytecode == tx.inputs[this.activeInputIndex].lockingBytecode);\n            require(tx.outputs[1].value == changeValue);\n        }\n    }\n\n    function reclaim(pubkey pk, sig s) {\n        require(hash160(pk) == funder);\n        require(checkSig(s, pk));\n    }\n}\n',
  debug: {
    bytecode: '5379009c6300cd0376a9147b7e0288ac7e8802e803c0c676547994527994765579547993a16300cc707c949d6700cc55799d51cdc0c78851cc789d686d6d6d5167537a519d5379a97b8872ac777768',
    sourceMap: '9:4:28:5;;;;;13:27:13:28;:16::45:1;:49::84:0;:74::83;:49::84:1;;;:8::86;15:23:15:27:0;16:37:16:58;:27::65:1;17:26:17:38:0;:41::47;;:26:::1;:50::58:0;;:26:::1;21:12:21:23:0;:27::33;;:36::44;;:27:::1;:12;:46:23:9:0;22:31:22:32;:20::39:1;:43::66:0;;::::1;:12::68;23:15:27:9:0;24:31:24:32;:20::39:1;:43::49:0;;:12::51:1;25:31:25:32:0;:20::49:1;:63::84:0;:53::101:1;:12::103;26:31:26:32:0;:20::39:1;:43::54:0;:12::56:1;23:15:27:9;9:4:28:5;;;;;30::33::0;;;;31:24:31:26;;:16::27:1;:31::37:0;:8::39:1;32:25:32:30:0;:8::33:1;30:4:33:5;;8:0:34:1',
    logs: [],
    requires: [
      {
        ip: 15,
        line: 13,
      },
      {
        ip: 39,
        line: 22,
      },
      {
        ip: 45,
        line: 24,
      },
      {
        ip: 50,
        line: 25,
      },
      {
        ip: 54,
        line: 26,
      },
      {
        ip: 69,
        line: 31,
      },
      {
        ip: 72,
        line: 32,
      },
    ],
  },
  compiler: {
    name: 'cashc',
    version: '0.11.0',
  },
  updatedAt: '2025-06-16T15:05:58.336Z',
} as const;
