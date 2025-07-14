// A 2 of 3 multisig contract compatible with ElectronCash multisig wallets
export default {
  contractName: 'Multisig_2of3',
  constructorInputs: [],
  abi: [
    {
      name: 'spend',
      inputs: [
        {
          name: 'signatureA',
          type: 'sig',
        },
        {
          name: 'signatureB',
          type: 'sig',
        },
        {
          name: 'checkBits',
          type: 'int',
        },
      ],
    },
  ],
  bytecode: 'OP_2 <pubkeyC> <pubkeyB> <pubkeyA> OP_3 OP_CHECKMULTISIG',
  source: '',
  compiler: {
    name: 'cashc',
    version: '0.11.0',
  },
  updatedAt: '2025-06-12T06:27:28.123Z',
} as const;
