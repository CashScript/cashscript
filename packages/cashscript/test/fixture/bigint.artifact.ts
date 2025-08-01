export default {
  contractName: 'BigInt',
  constructorInputs: [],
  abi: [
    {
      name: 'proofOfBigInt',
      inputs: [
        {
          name: 'x',
          type: 'int',
        },
        {
          name: 'y',
          type: 'int',
        },
      ],
    },
  ],
  bytecode: '000000000000008000 OP_2DUP OP_GREATERTHANOREQUAL OP_VERIFY OP_SWAP OP_ROT OP_MUL OP_LESSTHANOREQUAL',
  source: 'contract BigInt() {\n    function proofOfBigInt(int x, int y) {\n        int maxInt64PlusOne = 9223372036854775808;\n        require(x >= maxInt64PlusOne);\n        require(x * y >= maxInt64PlusOne);\n    }\n}\n',
  debug: {
    bytecode: '090000000000000080006ea2697c7b95a1',
    sourceMap: '3:30:3:49;4:16:4:36;::::1;:8::38;5:16:5:17:0;:20::21;:16:::1;:8::42',
    logs: [],
    requires: [
      {
        ip: 3,
        line: 4,
      },
      {
        ip: 8,
        line: 5,
      },
    ],
  },
  compiler: {
    name: 'cashc',
    version: '0.11.0',
  },
  updatedAt: '2025-06-16T15:05:52.713Z',
} as const;
