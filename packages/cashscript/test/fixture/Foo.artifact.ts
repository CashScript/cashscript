export default {
  contractName: 'Foo',
  constructorInputs: [
    {
      name: 'pkh_foo',
      type: 'bytes20',
    },
  ],
  abi: [
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
  bytecode: 'OP_OVER OP_HASH160 OP_EQUALVERIFY OP_CHECKSIG',
  source: 'pragma cashscript >=0.10.2;\n\ncontract Foo(bytes20 pkh_foo) {\n    // Require pk to match stored pkh and signature to match\n    function execute(pubkey pk, sig s) {\n        console.log("Foo \'execute\' function called.");\n        require(hash160(pk) == pkh_foo);\n        require(checkSig(s, pk));\n    }\n}\n',
  debug: {
    bytecode: '78a988ac',
    sourceMap: '7:24:7:26;:16::27:1;:8::40;8:16:8:31',
    logs: [
      {
        ip: 1,
        line: 6,
        data: [
          'Foo \'execute\' function called.',
        ],
      },
    ],
    requires: [
      {
        ip: 3,
        line: 7,
      },
      {
        ip: 5,
        line: 8,
      },
    ],
  },
  compiler: {
    name: 'cashc',
    version: '0.11.0-next.4',
  },
  updatedAt: '2025-06-16T14:40:54.992Z',
} as const;
