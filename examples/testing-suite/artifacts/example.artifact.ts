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
  source: 'contract Example() {\n  function test(int value) {\n    console.log(value, "test");\n    require(value == 1, "Wrong value passed");\n  }\n}\n',
  debug: {
    bytecode: '519c',
    sourceMap: '4:21:4:22;:4::46:1',
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
        ip: 2,
        line: 4,
        message: 'Wrong value passed',
      },
    ],
  },
  compiler: {
    name: 'cashc',
    version: '0.13.0-next.2',
  },
  updatedAt: '2026-01-13T10:40:29.996Z',
} as const;
