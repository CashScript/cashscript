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
    sourceMap: '3:16:3:26;:::36:1;:::50',
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
    version: '0.11.0-next.4',
  },
  updatedAt: '2025-05-11T10:02:27.355Z',
} as const;
