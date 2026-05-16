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
    sourceMap: '7:24:7:26;:16::27:1;:8::40;8::8:33',
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
    version: '0.13.0',
    options: {
      enforceFunctionParameterTypes: true,
      enforceLocktimeGuard: true,
    },
  },
  updatedAt: '2026-05-16T11:22:38.243Z',
  fingerprint: '07f5c2c2cf10439f063f3b92b9420b110614fb57b5c5015120bfca2688fedcc7',
} as const;
