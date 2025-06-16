export default {
  contractName: 'BoundedBytes',
  constructorInputs: [],
  abi: [
    {
      name: 'spend',
      inputs: [
        {
          name: 'b',
          type: 'bytes4',
        },
        {
          name: 'i',
          type: 'int',
        },
      ],
    },
  ],
  bytecode: 'OP_SWAP OP_4 OP_NUM2BIN OP_EQUAL',
  source: 'contract BoundedBytes() {\n    function spend(bytes4 b, int i) {\n        require(b == bytes4(i));\n    }\n}\n',
  debug: {
    bytecode: '7c548087',
    sourceMap: '3:28:3:29;:21::30:1;;:8::32',
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
    version: '0.11.0-next.4',
  },
  updatedAt: '2025-06-16T15:05:56.281Z',
} as const;
