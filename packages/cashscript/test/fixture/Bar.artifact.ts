export default {
  contractName: 'Bar',
  constructorInputs: [
    {
      name: 'pkh_bar',
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
  source: 'pragma cashscript >=0.10.2;\n\ncontract Bar(bytes20 pkh_bar) {\n    function funcA() {\n        require(2==2);\n    }\n\n    function funcB() {\n        require(2==2);\n    }\n\n    function execute(pubkey pk, sig s) {\n        console.log("Bar \'execute\' function called.");\n        require(hash160(pk) == pkh_bar);\n        require(checkSig(s, pk));\n    }\n}\n',
  debug: {
    bytecode: '78009c6352529c77776778519c6352529c7777677c529d78a988ac6868',
    sourceMap: '4:4:6:5;;;;5:16:5:17;:19::20;:8::22:1;4:4:6:5;;;8::10::0;;;;9:16:9:17;:19::20;:8::22:1;8:4:10:5;;;12::16::0;;;14:24:14:26;:16::27:1;:8::40;15::15:33;3:0:17:1;',
    logs: [
      {
        ip: 24,
        line: 13,
        data: [
          'Bar \'execute\' function called.',
        ],
      },
    ],
    requires: [
      {
        ip: 8,
        line: 5,
      },
      {
        ip: 18,
        line: 9,
      },
      {
        ip: 26,
        line: 14,
      },
      {
        ip: 28,
        line: 15,
      },
    ],
  },
  compiler: {
    name: 'cashc',
    version: '0.11.0',
  },
  updatedAt: '2025-06-16T15:05:54.204Z',
} as const;
