export default {
  contractName: 'TransferWithTimeout',
  constructorInputs: [
    {
      name: 'sender',
      type: 'pubkey',
    },
    {
      name: 'recipient',
      type: 'pubkey',
    },
    {
      name: 'timeout',
      type: 'int',
    },
  ],
  abi: [
    {
      name: 'transfer',
      inputs: [
        {
          name: 'recipientSig',
          type: 'sig',
        },
      ],
    },
    {
      name: 'timeout',
      inputs: [
        {
          name: 'senderSig',
          type: 'sig',
        },
      ],
    },
  ],
  bytecode: 'OP_3 OP_PICK OP_0 OP_NUMEQUAL OP_IF OP_4 OP_ROLL OP_ROT OP_CHECKSIG OP_NIP OP_NIP OP_NIP OP_ELSE OP_3 OP_ROLL OP_1 OP_NUMEQUALVERIFY OP_3 OP_ROLL OP_SWAP OP_CHECKSIGVERIFY OP_SWAP OP_CHECKLOCKTIMEVERIFY OP_2DROP OP_1 OP_ENDIF',
  source: 'pragma cashscript ^0.13.0;\n\ncontract TransferWithTimeout(\n    pubkey sender,\n    pubkey recipient,\n    int timeout\n) {\n    // Require recipient\'s signature to match\n    function transfer(sig recipientSig) {\n        require(checkSig(recipientSig, recipient));\n    }\n\n    // Require timeout time to be reached and sender\'s signature to match\n    function timeout(sig senderSig) {\n        require(checkSig(senderSig, sender));\n        require(tx.time >= timeout);\n    }\n}\n',
  debug: {
    bytecode: '5379009c63547a7bac77777767537a519d537a7cad7cb16d5168',
    sourceMap: '9:4:11:5;;;;;10:25:10:37;;:39::48;:8::51:1;9:4:11:5;;;;14::17::0;;;;15:25:15:34;;:36::42;:8::45:1;16:27:16:34:0;:8::36:1;14:4:17:5;;3:0:18:1',
    logs: [],
    requires: [
      {
        ip: 12,
        line: 10,
      },
      {
        ip: 23,
        line: 15,
      },
      {
        ip: 25,
        line: 16,
      },
    ],
  },
  compiler: {
    name: 'cashc',
    version: '0.13.0-next.2',
  },
  updatedAt: '2026-01-13T10:40:30.007Z',
} as const;
