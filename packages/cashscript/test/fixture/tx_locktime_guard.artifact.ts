export default {
  contractName: 'LocktimeGuard',
  constructorInputs: [],
  abi: [
    { name: 'send', inputs: [] },
  ],
  bytecode: 'OP_TXLOCKTIME OP_CHECKLOCKTIMEVERIFY OP_DROP OP_TXLOCKTIME OP_1 OP_GREATERTHANOREQUAL',
  source: 'pragma cashscript ^0.13.0;\n\ncontract LocktimeGuard() {\n    function send() {\n        require(tx.locktime >= 1);\n    }\n}\n',
  fingerprint: 'a3d1694d60dde564f2b2196099adbc82b6198017c035223a58c368a12e865826',
  debug: {
    bytecode: 'c5b175c551a2',
    sourceMap: '4:20:4:20;::::1;;5:16:5:27:0;:31::32;:8::34:1',
    logs: [],
    requires: [
      { ip: 1, line: 4, message: 'Using tx.locktime requires a non-final sequence number on the spending input' },
      { ip: 6, line: 5 },
    ],
    sourceTags: '0:2:lg',
  },
  compiler: {
    name: 'cashc',
    version: '0.13.0',
    options: {
      enforceFunctionParameterTypes: true,
      enforceLocktimeGuard: true,
    },
  },
  updatedAt: '2026-05-19T10:21:15.336Z',
} as const;
