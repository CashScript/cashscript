export default {
  contractName: 'P2Palindrome',
  constructorInputs: [],
  abi: [
    {
      name: 'spend',
      inputs: [
        {
          name: 'palindrome',
          type: 'string',
        },
      ],
    },
  ],
  bytecode: 'OP_DUP OP_REVERSEBYTES OP_EQUAL',
  source: 'contract P2Palindrome() {\n    function spend(string palindrome) {\n        require(palindrome.reverse() == palindrome);\n    }\n}\n',
  debug: {
    bytecode: '76bc87',
    sourceMap: '3:16:3:26;:::36:1;:8::52',
    logs: [],
    requires: [
      {
        ip: 3,
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
  updatedAt: '2026-02-03T11:06:40.327Z',
} as const;
