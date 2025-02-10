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
  source: 'contract BigInt() {\r\n    function proofOfBigInt(int x, int y) {\r\n        int maxInt64PlusOne = 9223372036854775808;\r\n        require(x >= maxInt64PlusOne);\r\n        require(x * y >= maxInt64PlusOne);\r\n    }\r\n}\r\n',
  debug: {
    bytecode: '0900000000000000800051795179a269517a527a95517aa2',
    sourceMap: '3:30:3:49;4:16:4:17;;:21::36;;:16:::1;:8::38;5:16:5:17:0;;:20::21;;:16:::1;:25::40:0;;:16:::1',
    logs: [],
    requires: [
      {
        ip: 6,
        line: 4,
      },
      {
        ip: 15,
        line: 5,
      },
    ],
  },
  compiler: {
    name: 'cashc',
    version: '0.10.5',
  },
  updatedAt: '2025-02-10T07:12:49.834Z',
} as const;
