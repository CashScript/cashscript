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
  bytecode: 'OP_3 OP_PICK OP_0 OP_NUMEQUAL OP_IF OP_TXINPUTCOUNT OP_1 OP_NUMEQUALVERIFY OP_0 OP_OUTPUTBYTECODE 76a914 OP_ROT OP_CAT 88ac OP_CAT OP_EQUALVERIFY e803 OP_INPUTINDEX OP_UTXOVALUE OP_DUP OP_4 OP_PICK OP_SUB OP_2 OP_PICK OP_SUB OP_DUP OP_5 OP_PICK OP_4 OP_PICK OP_ADD OP_LESSTHANOREQUAL OP_IF OP_0 OP_OUTPUTVALUE OP_2OVER OP_SWAP OP_SUB OP_NUMEQUALVERIFY OP_ELSE OP_0 OP_OUTPUTVALUE OP_5 OP_PICK OP_NUMEQUALVERIFY OP_1 OP_OUTPUTBYTECODE OP_INPUTINDEX OP_UTXOBYTECODE OP_EQUALVERIFY OP_1 OP_OUTPUTVALUE OP_OVER OP_NUMEQUALVERIFY OP_ENDIF OP_2DROP OP_2DROP OP_2DROP OP_1 OP_ELSE OP_3 OP_ROLL OP_1 OP_NUMEQUALVERIFY OP_3 OP_PICK OP_HASH160 OP_ROT OP_EQUALVERIFY OP_2SWAP OP_CHECKSIG OP_NIP OP_NIP OP_ENDIF',
  source: 'pragma cashscript >=0.8.0;\n\n/* This is an unofficial CashScript port of Licho\'s Mecenas contract. It is\n * not compatible with Licho\'s EC plugin, but rather meant as a demonstration\n * of covenants in CashScript.\n * The time checking has been removed so it can be tested without time requirements.\n */\ncontract Mecenas(bytes20 recipient, bytes20 funder, int pledge/*, int period */) {\n    function receive() {\n        // require(this.age >= period);\n\n        // Require that there is only a single contract input to prevent\n        // multiple contract UTXOs being claimed in a single transaction\n        require(tx.inputs.length == 1);\n\n        // Check that the first output sends to the recipient\n        require(tx.outputs[0].lockingBytecode == new LockingBytecodeP2PKH(recipient));\n\n        int minerFee = 1000;\n        int currentValue = tx.inputs[this.activeInputIndex].value;\n        int changeValue = currentValue - pledge - minerFee;\n\n        // If there is not enough left for *another* pledge after this one, we send the remainder to the recipient\n        // Otherwise we send the remainder to the recipient and the change back to the contract\n        if (changeValue <= pledge + minerFee) {\n            require(tx.outputs[0].value == currentValue - minerFee);\n        } else {\n            require(tx.outputs[0].value == pledge);\n            require(tx.outputs[1].lockingBytecode == tx.inputs[this.activeInputIndex].lockingBytecode);\n            require(tx.outputs[1].value == changeValue);\n        }\n    }\n\n    function reclaim(pubkey pk, sig s) {\n        require(hash160(pk) == funder);\n        require(checkSig(s, pk));\n    }\n}\n',
  debug: {
    bytecode: '5379009c63c3519d00cd0376a9147b7e0288ac7e8802e803c0c676547994527994765579547993a16300cc707c949d6700cc55799d51cdc0c78851cc789d686d6d6d5167537a519d5379a97b8872ac777768',
    sourceMap: '9:4:32:5;;;;;14:16:14:32;:36::37;:8::39:1;17:27:17:28:0;:16::45:1;:49::84:0;:74::83;:49::84:1;;;:8::86;19:23:19:27:0;20:37:20:58;:27::65:1;21:26:21:38:0;:41::47;;:26:::1;:50::58:0;;:26:::1;25:12:25:23:0;:27::33;;:36::44;;:27:::1;:12;:46:27:9:0;26:31:26:32;:20::39:1;:43::66:0;;::::1;:12::68;27:15:31:9:0;28:31:28:32;:20::39:1;:43::49:0;;:12::51:1;29:31:29:32:0;:20::49:1;:63::84:0;:53::101:1;:12::103;30:31:30:32:0;:20::39:1;:43::54:0;:12::56:1;27:15:31:9;9:4:32:5;;;;;34::37::0;;;;35:24:35:26;;:16::27:1;:31::37:0;:8::39:1;36:25:36:30:0;:8::33:1;34:4:37:5;;8:0:38:1',
    logs: [],
    requires: [
      {
        ip: 10,
        line: 14,
      },
      {
        ip: 18,
        line: 17,
      },
      {
        ip: 42,
        line: 26,
      },
      {
        ip: 48,
        line: 28,
      },
      {
        ip: 53,
        line: 29,
      },
      {
        ip: 57,
        line: 30,
      },
      {
        ip: 72,
        line: 35,
      },
      {
        ip: 75,
        line: 36,
      },
    ],
  },
  compiler: {
    name: 'cashc',
    version: '0.13.0',
    options: {
      enforceFunctionParameterTypes: true,
      enforceLocktimeGuard: true,
    },
  },
  updatedAt: '2026-05-16T11:22:42.910Z',
  fingerprint: '722746c8f8618cbea72ea2dba8d95a34dacd773fe96b8aa3753a2a55aab1c4d4',
} as const;
