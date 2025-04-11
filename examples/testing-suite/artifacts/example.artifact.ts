export default {
  contractName: 'Example',
  constructorInputs: [],
  abi: [
    {
      name: 'test',
      inputs: [
        {
          name: 'value',
          type: 'int',
        },
      ],
    },
  ],
  bytecode: 'OP_1 OP_NUMEQUAL',
  source: 'contract Example() {\n  function test(int value) {\n    console.log(value, \'test\');\n    require(value == 1, \'Wrong value passed\');\n  }\n}\n',
  debug: {
    bytecode: '007a519c',
    sourceMap: '4:12:4:17;;:21::22;:12:::1',
    logs: [
      {
        ip: 0,
        line: 3,
        data: [
          {
            stackIndex: 0,
            type: 'int',
            ip: 0,
          },
          'test',
        ],
      },
    ],
    requires: [
      {
        ip: 4,
        line: 4,
        message: 'Wrong value passed',
      },
    ],
  },
  compiler: {
    name: 'cashc',
    version: '0.11.0-next.3',
  },
  updatedAt: '2025-04-11T09:08:09.750Z',
} as const;
