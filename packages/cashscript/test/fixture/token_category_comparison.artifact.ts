export default {
  contractName: 'Test',
  constructorInputs: [],
  abi: [
    {
      name: 'send',
      inputs: [],
    },
  ],
  bytecode: 'OP_1 OP_UTXOTOKENCATEGORY OP_0 OP_EQUAL',
  source: 'contract Test() {\n    function send() {\n        require(tx.inputs[1].tokenCategory == 0x);\n    }\n}\n',
  debug: {
    bytecode: '51ce0087',
    sourceMap: '3:26:3:27;:16::42:1;:46::48:0;:16:::1',
    logs: [],
    requires: [
      {
        ip: 4,
        line: 3,
      },
    ],
  },
  compiler: {
    name: 'cashc',
    version: '0.10.4',
  },
  updatedAt: '2024-12-03T13:57:10.582Z',
} as const;
