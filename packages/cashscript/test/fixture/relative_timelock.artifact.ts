export default {
  contractName: 'RelativeTimelock',
  constructorInputs: [
    { name: 'period', type: 'int' },
  ],
  abi: [
    { name: 'afterBlocks', inputs: [] },
    { name: 'afterDuration', inputs: [] },
    { name: 'afterPeriod', inputs: [] },
  ],
  bytecode: 'OP_OVER OP_0 OP_NUMEQUAL OP_IF OP_10 OP_CHECKSEQUENCEVERIFY OP_2DROP OP_DROP OP_1 OP_ELSE OP_OVER OP_1 OP_NUMEQUAL OP_IF a90040 OP_CHECKSEQUENCEVERIFY OP_2DROP OP_DROP OP_1 OP_ELSE OP_SWAP OP_2 OP_NUMEQUALVERIFY OP_DUP OP_16 OP_RSHIFTNUM OP_DUP 40 OP_SUB OP_MUL OP_NOT OP_VERIFY OP_CHECKSEQUENCEVERIFY OP_DROP OP_1 OP_ENDIF OP_ENDIF',
  source: 'contract RelativeTimelock(int period) {\n    function afterBlocks() {\n        require(this.age >= 10);\n    }\n\n    function afterDuration() {\n        require(this.age >= 1 days);\n    }\n\n    function afterPeriod() {\n        require(this.age >= period);\n    }\n}\n',
  fingerprint: '808c820f47d4ca3ba59fbd02d563d83088b40a888594bbf219078d4670a6c374',
  debug: {
    bytecode: '78009c635ab26d75516778519c6303a90040b26d7551677c529d76608e76014094959169b275516868',
    sourceMap: '2:4:4:5;;;;3:28:3:30;:8::32:1;2:27:4:5;;;:4;6::8::0;;;;7:28:7:34;:8::36:1;6:29:8:5;;;:4;10::12::0;;;11:8:11:36:1;;;;;;;;;;;10:27:12:5;1:0:13:1;',
    logs: [],
    requires: [
      { ip: 6, line: 3 },
      { ip: 16, line: 7 },
      { ip: 32, line: 11, message: 'this.age value must be a number of blocks between 0 and 65535 (or a BIP68-encoded relative timelock)' },
      { ip: 33, line: 11 },
    ],
  },
  compiler: {
    name: 'cashc',
    version: '0.14.0-next.6',
    options: {
      enforceFunctionParameterTypes: true,
      enforceLocktimeGuard: true,
    },
  },
  updatedAt: '2026-09-28T10:46:54.545Z',
} as const;
