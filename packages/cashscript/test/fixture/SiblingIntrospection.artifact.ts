export default {
  contractName: 'SiblingIntrospection',
  constructorInputs: [
    {
      name: 'expectedLockingBytecode',
      type: 'bytes',
    },
  ],
  abi: [
    {
      name: 'spend',
      inputs: [],
    },
  ],
  bytecode: 'OP_INPUTINDEX OP_0 OP_NUMEQUALVERIFY OP_1 OP_OUTPUTBYTECODE OP_OVER OP_EQUALVERIFY OP_1 OP_UTXOBYTECODE OP_EQUAL',
  source: 'contract SiblingIntrospection(bytes expectedLockingBytecode) {\n    function spend() {\n        require(this.activeInputIndex == 0);\n\n        bytes outputBytecode = tx.outputs[1].lockingBytecode;\n        console.log("outputBytecode:", outputBytecode);\n        require(outputBytecode == expectedLockingBytecode, \'output bytecode should match\');\n\n        bytes inputBytecode = tx.inputs[1].lockingBytecode;\n        console.log("inputBytecode:", inputBytecode);\n        require(inputBytecode == expectedLockingBytecode, \'input bytecode should match\');\n    }\n}\n',
  debug: {
    bytecode: 'c0009d51cd788851c787',
    sourceMap: '3:16:3:37;:41::42;:8::44:1;5:42:5:43:0;:31::60:1;7:34:7:57:0;:8::91:1;9:40:9:41:0;:30::58:1;11:8:11:89',
    logs: [
      {
        ip: 6,
        line: 6,
        data: [
          'outputBytecode:',
          {
            stackIndex: 0,
            type: 'bytes',
            ip: 6,
          },
        ],
      },
      {
        ip: 10,
        line: 10,
        data: [
          'inputBytecode:',
          {
            stackIndex: 0,
            type: 'bytes',
            ip: 10,
          },
        ],
      },
    ],
    requires: [
      {
        ip: 3,
        line: 3,
      },
      {
        ip: 7,
        line: 7,
        message: 'output bytecode should match',
      },
      {
        ip: 11,
        line: 11,
        message: 'input bytecode should match',
      },
    ],
  },
  compiler: {
    name: 'cashc',
    version: '0.11.0',
  },
  updatedAt: '2025-06-16T16:07:30.092Z',
} as const;
