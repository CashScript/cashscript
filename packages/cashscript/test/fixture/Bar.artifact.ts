export default {
  contractName: 'Bar',
  constructorInputs: [
    {
      name: 'pkh',
      type: 'bytes20',
    },
  ],
  abi: [
    {
      name: 'funcA',
      inputs: [],
    },
    {
      name: 'funcB',
      inputs: [],
    },
    {
      name: 'execute',
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
  bytecode: 'OP_OVER OP_0 OP_NUMEQUAL OP_IF OP_2 OP_2 OP_NUMEQUAL OP_NIP OP_NIP OP_ELSE OP_OVER OP_1 OP_NUMEQUAL OP_IF OP_2 OP_2 OP_NUMEQUAL OP_NIP OP_NIP OP_ELSE OP_SWAP OP_2 OP_NUMEQUALVERIFY OP_OVER OP_HASH160 OP_EQUALVERIFY OP_CHECKSIG OP_ENDIF OP_ENDIF',
  source: 'pragma cashscript ^0.10.2;\n\ncontract Bar(bytes20 pkh) {\n    function funcA() {\n        require(2==2);\n    }\n\n    function funcB() {\n        require(2==2);\n    }\n\n    function execute(pubkey pk, sig s) {\n        console.log(\'Bar \'execute\' function called.\');\n        require(hash160(pk) == pkh);\n        require(checkSig(s, pk));\n    }\n}',
  debug: {
    bytecode: '5179009c6352529c7777675179519c6352529c777767517a529c695179a9517a8769517a517aac6868',
    sourceMap: '4:4:6:5;;;;;5:16:5:17;:19::20;:16:::1;4:4:6:5;;;8::10::0;;;;;9:16:9:17;:19::20;:16:::1;8:4:10:5;;;12::16::0;;;;;14:24:14:26;;:16::27:1;:31::34:0;;:16:::1;:8::36;15:25:15:26:0;;:28::30;;:16::31:1;3:0:17:1;',
    logs: [
      {
        ip: 28,
        line: 13,
        data: [
          'Bar \'execute\' function called.',
        ],
      },
    ],
    requires: [
      {
        ip: 9,
        line: 5,
      },
      {
        ip: 20,
        line: 9,
      },
      {
        ip: 34,
        line: 14,
      },
      {
        ip: 40,
        line: 15,
      },
    ],
  },
  compiler: {
    name: 'cashc',
    version: '0.10.5',
  },
  updatedAt: '2025-01-14T10:12:42.559Z',
} as const;
