
export const generateWcTransactionObjectFixture = {
  'broadcast': true,
  'userPrompt': 'Example Contract transaction',
  'transaction': {
    'inputs': [
      {
        'outpointIndex': expect.any(Number),
        'outpointTransactionHash': expect.any(String),
        'sequenceNumber': 4294967294,
        'unlockingBytecode': '<Uint8Array: 0x410000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000210000000000000000000000000000000000000000000000000000000000000000001914203f4c0ece860a6072d4504a21a0c5c3376d1ce478a988ac>',
      },
      {
        'outpointIndex': expect.any(Number),
        'outpointTransactionHash': expect.any(String),
        'sequenceNumber': 4294967294,
        'unlockingBytecode': '<Uint8Array: 0x>',
      },
    ],
    'locktime': 0,
    'outputs': [
      {
        'lockingBytecode': '<Uint8Array: 0x76a914b40a2013337edb0dfe307f0a57d5dec5bfe60dd088ac>',
        'valueSatoshis': '<bigint: 100000n>',
      },
    ],
    'version': 2,
  },
  'sourceOutputs': [
    {
      'lockingBytecode': '<Uint8Array: 0xaa20f119b7beee5ce91141cbffb5d4272589fe948537893447364e218b69b699d21887>',
      'valueSatoshis': expect.any(String),
      'outpointIndex': expect.any(Number),
      'outpointTransactionHash': expect.any(String),
      'sequenceNumber': 4294967294,
      'unlockingBytecode': '<Uint8Array: 0x410000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000210000000000000000000000000000000000000000000000000000000000000000001914203f4c0ece860a6072d4504a21a0c5c3376d1ce478a988ac>',
      'contract': {
        'abiFunction': {
          'name': 'spend',
          'inputs': [
            {
              'name': 'pk',
              'type': 'pubkey',
            },
            {
              'name': 's',
              'type': 'sig',
            },
          ],
        },
        'redeemScript': '<Uint8Array: 0x14203f4c0ece860a6072d4504a21a0c5c3376d1ce478a988ac>',
        'artifact': {
          'contractName': 'P2PKH',
          'constructorInputs': [
            {
              'name': 'pkh',
              'type': 'bytes20',
            },
          ],
          'abi': [
            {
              'name': 'spend',
              'inputs': [
                {
                  'name': 'pk',
                  'type': 'pubkey',
                },
                {
                  'name': 's',
                  'type': 'sig',
                },
              ],
            },
          ],
          'bytecode': 'OP_OVER OP_HASH160 OP_EQUALVERIFY OP_CHECKSIG',
          'source': 'contract P2PKH(bytes20 pkh) {\n    // Require pk to match stored pkh and signature to match\n    function spend(pubkey pk, sig s) {\n        require(hash160(pk) == pkh);\n        require(checkSig(s, pk));\n    }\n}\n',
          'debug': {
            'bytecode': '78a988ac',
            'sourceMap': '4:24:4:26;:16::27:1;:8::36;5::5:33',
            'logs': [],
            'requires': [
              {
                'ip': 3,
                'line': 4,
              },
              {
                'ip': 5,
                'line': 5,
              },
            ],
          },
          'compiler': {
            'name': 'cashc',
            'version': '0.11.0',
          },
          'updatedAt': expect.any(String),
        },
      },
    },
    {
      'lockingBytecode': '<Uint8Array: 0x76a914b40a2013337edb0dfe307f0a57d5dec5bfe60dd088ac>',
      'valueSatoshis': expect.any(String),
      'outpointIndex': expect.any(Number),
      'outpointTransactionHash': expect.any(String),
      'sequenceNumber': 4294967294,
      'unlockingBytecode': '<Uint8Array: 0x>',
    },
  ],
}
;