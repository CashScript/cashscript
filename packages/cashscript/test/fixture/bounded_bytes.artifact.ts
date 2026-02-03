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
  bytecode: 'OP_DUP OP_SIZE OP_4 OP_EQUALVERIFY OP_DROP OP_SWAP OP_4 OP_NUM2BIN OP_EQUAL',
  source: 'contract BoundedBytes() {\n    function spend(bytes4 b, int i) {\n        require(b == toPaddedBytes(i, 4));\n    }\n}\n',
  debug: {
    bytecode: '76825488757c548087',
    sourceMap: '2:19:2:27;;;;;3:35:3:36;:38::39;:21::40:1;:8::42',
    logs: [],
    requires: [
      {
        ip: 9,
        line: 3,
      },
    ],
  },
  compiler: {
    name: 'cashc',
    version: '0.13.0-next.3',
    options: {
      enforceFunctionParameterTypes: true,
    },
  },
  updatedAt: '2026-02-03T11:38:30.255Z',
} as const;
