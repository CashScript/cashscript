import { TransactionBuilder, Contract, MockNetworkProvider, SignatureTemplate, randomNFT, randomToken, randomUtxo } from '../../../src/index.js';
import BarArtifact from '../Bar.artifact.js';
import FooArtifact from '../Foo.artifact.js';
import { aliceAddress, alicePkh, alicePriv, alicePub, aliceTokenAddress, bobPriv, bobPub } from '../vars.js';
import { WalletTemplate } from '@bitauth/libauth';

const provider = new MockNetworkProvider();

export interface Fixture {
  name: string;
  transaction: Promise<TransactionBuilder>;
  template: WalletTemplate;
}

export const fixtures: Fixture[] = [
  {
    name: 'Foo + Bar + P2PKH UTXOs',
    transaction: (async () => {
      // TODO: Foo contract is just P2PKH contract with extra log, see if we can use P2PKH contract instead
      const fooContract = new Contract(FooArtifact, [alicePkh], { provider });
      provider.addUtxo(fooContract.address, randomUtxo());

      const tokenA = randomToken({ amount: 100000000n });
      const nftB = randomNFT({
        nft: {
          capability: 'minting',
          commitment: '00',
        },
      });

      const barContract = new Contract(BarArtifact, [alicePkh], { provider });
      provider.addUtxo(barContract.address, randomUtxo());
      provider.addUtxo(barContract.address, randomUtxo());
      provider.addUtxo(barContract.address, randomUtxo());

      const aliceTemplate = new SignatureTemplate(alicePriv);
      provider.addUtxo(aliceAddress, randomUtxo());
      provider.addUtxo(aliceAddress, randomUtxo({ token: tokenA }));
      provider.addUtxo(aliceAddress, randomUtxo({ token: nftB }));

      const utxos = await provider.getUtxos(aliceAddress);
      const fooContractUtxos = await fooContract.getUtxos();
      const barContractUtxos = await barContract.getUtxos();

      return new TransactionBuilder({ provider })
        .addInputs([utxos[0], utxos[1], utxos[2]], aliceTemplate.unlockP2PKH())
        .addInput(barContractUtxos[0], barContract.unlock.funcA())
        .addInput(barContractUtxos[1], barContract.unlock.execute(alicePub, aliceTemplate))
        .addInput(fooContractUtxos[0], fooContract.unlock.execute(alicePub, aliceTemplate))
        .addInput(barContractUtxos[2], barContract.unlock.funcB())
        .addOutput({ to: fooContract.address, amount: 8000n })
        .addOutput({ to: aliceTokenAddress, amount: 800n, token: tokenA })
        .addOutput({ to: aliceTokenAddress, amount: 1000n, token: nftB })
        .addOpReturnOutput(['hello', 'world']);

    })(),
    template: {
      '$schema': 'https://ide.bitauth.com/authentication-template-v0.schema.json',
      'description': 'Imported from cashscript',
      'name': 'CashScript Generated Debugging Template',
      'supported': [
        'BCH_2023_05',
      ],
      'version': 0,
      'entities': {
        'bar_parameters': {
          'description': 'Contract creation and function parameters',
          'name': 'Bar',
          'scripts': [
            'bar_lock',
            'bar_func_b_unlock',
          ],
          'variables': {
            'pkh': {
              'description': '"pkh" parameter of this contract',
              'name': 'Pkh',
              'type': 'WalletData',
            },
            'function_index': {
              'description': 'Script function index to execute',
              'name': 'Function Index',
              'type': 'WalletData',
            },
          },
        },
        'foo_parameters': {
          'description': 'Contract creation and function parameters',
          'name': 'Foo',
          'scripts': [
            'foo_lock',
            'foo_execute_unlock',
          ],
          'variables': {
            'pk': {
              'description': '"pk" parameter of function "execute"',
              'name': 'Pk',
              'type': 'WalletData',
            },
            's': {
              'description': '"s" parameter of function "execute"',
              'name': 'S',
              'type': 'Key',
            },
            'pkh': {
              'description': '"pkh" parameter of this contract',
              'name': 'Pkh',
              'type': 'WalletData',
            },
          },
        },
        'signer_0': {
          'scripts': [
            'bar_func_a_unlock',
            'bar_lock',
            'bar_execute_unlock',
            'foo_execute_unlock',
            'foo_lock',
            'bar_func_b_unlock',
            'p2pkh_placeholder_lock_0',
            'p2pkh_placeholder_unlock_0',
          ],
          'description': 'placeholder_key_0',
          'name': 'Signer 0',
          'variables': {
            'placeholder_key_0': {
              'description': '',
              'name': 'Placeholder Key 0',
              'type': 'HdKey',
            },
          },
        },
        'signer_1': {
          'scripts': [
            'bar_func_a_unlock',
            'bar_lock',
            'bar_execute_unlock',
            'foo_execute_unlock',
            'foo_lock',
            'bar_func_b_unlock',
            'p2pkh_placeholder_lock_1',
            'p2pkh_placeholder_unlock_1',
          ],
          'description': 'placeholder_key_1',
          'name': 'Signer 1',
          'variables': {
            'placeholder_key_1': {
              'description': '',
              'name': 'Placeholder Key 1',
              'type': 'HdKey',
            },
          },
        },
        'signer_2': {
          'scripts': [
            'bar_func_a_unlock',
            'bar_lock',
            'bar_execute_unlock',
            'foo_execute_unlock',
            'foo_lock',
            'bar_func_b_unlock',
            'p2pkh_placeholder_lock_2',
            'p2pkh_placeholder_unlock_2',
          ],
          'description': 'placeholder_key_2',
          'name': 'Signer 2',
          'variables': {
            'placeholder_key_2': {
              'description': '',
              'name': 'Placeholder Key 2',
              'type': 'HdKey',
            },
          },
        },
      },
      'scripts': {
        'bar_func_a_unlock': {
          'passes': [
            'bar_func_a_evaluate',
          ],
          'name': 'funcA',
          'script': '// "funcA" function parameters\n// none\n\n// function index in contract\n<function_index> // int = <0>\n',
          'unlocks': 'bar_lock',
        },
        'bar_lock': {
          'lockingType': 'p2sh32',
          'name': 'Bar',
          'script': "// \"Bar\" contract constructor parameters\n<pkh> // bytes20 = <0x512dbb2c8c02efbac8d92431aa0ac33f6b0bf970>\n\n// bytecode\n                                                        /* pragma cashscript ^0.10.2;                             */\n                                                        /*                                                        */\n                                                        /* contract Bar(bytes20 pkh) {                            */\nOP_1 OP_PICK OP_0 OP_NUMEQUAL OP_IF                     /*     function funcA() {                                 */\nOP_2 OP_2 OP_NUMEQUAL                                   /*         require(2==2);                                 */\nOP_NIP OP_NIP OP_ELSE                                   /*     }                                                  */\n                                                        /*                                                        */\nOP_1 OP_PICK OP_1 OP_NUMEQUAL OP_IF                     /*     function funcB() {                                 */\nOP_2 OP_2 OP_NUMEQUAL                                   /*         require(2==2);                                 */\nOP_NIP OP_NIP OP_ELSE                                   /*     }                                                  */\n                                                        /*                                                        */\nOP_1 OP_ROLL OP_2 OP_NUMEQUAL OP_VERIFY                 /*     function execute(pubkey pk, sig s) {               */\n                                                        /*         console.log('Bar 'execute' function called.'); */\nOP_1 OP_PICK OP_HASH160 OP_1 OP_ROLL OP_EQUAL OP_VERIFY /*         require(hash160(pk) == pkh);                   */\nOP_1 OP_ROLL OP_1 OP_ROLL OP_CHECKSIG                   /*         require(checkSig(s, pk));                      */\n                                                        /*     }                                                  */\nOP_ENDIF OP_ENDIF                                       /* }                                                      */",
        },
        'bar_execute_unlock': {
          'passes': [
            'bar_execute_evaluate',
          ],
          'name': 'execute',
          'script': '// "execute" function parameters\n<s.schnorr_signature.all_outputs_all_utxos> // sig\n<pk> // pubkey = <0x0373cc07b54c22da627b572a387a20ea190c9382e5e6d48c1d5b89c5cea2c4c088>\n\n// function index in contract\n<function_index> // int = <2>\n',
          'unlocks': 'bar_lock',
        },
        'foo_execute_unlock': {
          'passes': [
            'foo_execute_evaluate',
          ],
          'name': 'execute',
          'script': '// "execute" function parameters\n<s.schnorr_signature.all_outputs_all_utxos> // sig\n<pk> // pubkey = <0x0373cc07b54c22da627b572a387a20ea190c9382e5e6d48c1d5b89c5cea2c4c088>\n',
          'unlocks': 'foo_lock',
        },
        'foo_lock': {
          'lockingType': 'p2sh32',
          'name': 'Foo',
          'script': "// \"Foo\" contract constructor parameters\n<pkh> // bytes20 = <0x512dbb2c8c02efbac8d92431aa0ac33f6b0bf970>\n\n// bytecode\n                                                        /* pragma cashscript ^0.10.2;                                   */\n                                                        /*                                                              */\n                                                        /* contract Foo(bytes20 pkh) {                                  */\n                                                        /*     // Require pk to match stored pkh and signature to match */\n                                                        /*     function execute(pubkey pk, sig s) {                     */\n                                                        /*         console.log('Foo 'execute' function called.');       */\nOP_1 OP_PICK OP_HASH160 OP_1 OP_ROLL OP_EQUAL OP_VERIFY /*         require(hash160(pk) == pkh);                         */\nOP_1 OP_ROLL OP_1 OP_ROLL OP_CHECKSIG                   /*         require(checkSig(s, pk));                            */\n                                                        /*     }                                                        */\n                                                        /* }                                                            */",
        },
        'bar_func_b_unlock': {
          'passes': [
            'bar_func_b_evaluate',
          ],
          'name': 'funcB',
          'script': '// "funcB" function parameters\n// none\n\n// function index in contract\n<function_index> // int = <1>\n',
          'unlocks': 'bar_lock',
        },
        'p2pkh_placeholder_unlock_0': {
          'name': 'p2pkh_placeholder_unlock_0',
          'script': '<placeholder_key_0.schnorr_signature.all_outputs_all_utxos>\n<placeholder_key_0.public_key>',
          'unlocks': 'p2pkh_placeholder_lock_0',
        },
        'p2pkh_placeholder_lock_0': {
          'lockingType': 'standard',
          'name': 'p2pkh_placeholder_lock_0',
          'script': 'OP_DUP\nOP_HASH160 <$(<placeholder_key_0.public_key> OP_HASH160\n)> OP_EQUALVERIFY\nOP_CHECKSIG',
        },
        'p2pkh_placeholder_unlock_1': {
          'name': 'p2pkh_placeholder_unlock_1',
          'script': '<placeholder_key_1.schnorr_signature.all_outputs_all_utxos>\n<placeholder_key_1.public_key>',
          'unlocks': 'p2pkh_placeholder_lock_1',
        },
        'p2pkh_placeholder_lock_1': {
          'lockingType': 'standard',
          'name': 'p2pkh_placeholder_lock_1',
          'script': 'OP_DUP\nOP_HASH160 <$(<placeholder_key_1.public_key> OP_HASH160\n)> OP_EQUALVERIFY\nOP_CHECKSIG',
        },
        'p2pkh_placeholder_unlock_2': {
          'name': 'p2pkh_placeholder_unlock_2',
          'script': '<placeholder_key_2.schnorr_signature.all_outputs_all_utxos>\n<placeholder_key_2.public_key>',
          'unlocks': 'p2pkh_placeholder_lock_2',
        },
        'p2pkh_placeholder_lock_2': {
          'lockingType': 'standard',
          'name': 'p2pkh_placeholder_lock_2',
          'script': 'OP_DUP\nOP_HASH160 <$(<placeholder_key_2.public_key> OP_HASH160\n)> OP_EQUALVERIFY\nOP_CHECKSIG',
        },
      },
      'scenarios': {
        'bar_func_a_evaluate': {
          'name': 'bar_func_a_evaluate',
          'description': 'An example evaluation where this script execution passes.',
          'data': {
            'bytecode': {
              'pkh': '0x512dbb2c8c02efbac8d92431aa0ac33f6b0bf970',
              'function_index': '0',
            },
            'currentBlockHeight': expect.any(Number),
            'currentBlockTime': expect.any(Number),
            'keys': {
              'privateKeys': {},
            },
          },
          'transaction': {
            'inputs': [
              {
                'outpointIndex': expect.any(Number),
                'outpointTransactionHash': expect.any(String),
                'sequenceNumber': 4294967294,
                'unlockingBytecode': {
                  'script': 'p2pkh_placeholder_unlock_0',
                  'overrides': {
                    'keys': {
                      'privateKeys': {
                        'placeholder_key_0': '36f8155c559f3a670586bbbf9fd52beef6f96124f5a3a39c167fc24b052d24d7',
                      },
                    },
                  },
                },
              },
              {
                'outpointIndex': expect.any(Number),
                'outpointTransactionHash': expect.any(String),
                'sequenceNumber': 4294967294,
                'unlockingBytecode': {
                  'script': 'p2pkh_placeholder_unlock_1',
                  'overrides': {
                    'keys': {
                      'privateKeys': {
                        'placeholder_key_1': '36f8155c559f3a670586bbbf9fd52beef6f96124f5a3a39c167fc24b052d24d7',
                      },
                    },
                  },
                },
              },
              {
                'outpointIndex': expect.any(Number),
                'outpointTransactionHash': expect.any(String),
                'sequenceNumber': 4294967294,
                'unlockingBytecode': {
                  'script': 'p2pkh_placeholder_unlock_2',
                  'overrides': {
                    'keys': {
                      'privateKeys': {
                        'placeholder_key_2': '36f8155c559f3a670586bbbf9fd52beef6f96124f5a3a39c167fc24b052d24d7',
                      },
                    },
                  },
                },
              },
              {
                'outpointIndex': expect.any(Number),
                'outpointTransactionHash': expect.any(String),
                'sequenceNumber': 4294967294,
                'unlockingBytecode': [
                  'slot',
                ],
              },
              {
                'outpointIndex': expect.any(Number),
                'outpointTransactionHash': expect.any(String),
                'sequenceNumber': 4294967294,
                'unlockingBytecode': {},
              },
              {
                'outpointIndex': expect.any(Number),
                'outpointTransactionHash': expect.any(String),
                'sequenceNumber': 4294967294,
                'unlockingBytecode': {},
              },
              {
                'outpointIndex': expect.any(Number),
                'outpointTransactionHash': expect.any(String),
                'sequenceNumber': 4294967294,
                'unlockingBytecode': {},
              },
            ],
            'locktime': expect.any(Number),
            'outputs': [
              {
                'lockingBytecode': {
                  'script': 'foo_lock',
                },
                'valueSatoshis': 8000,
              },
              {
                'lockingBytecode': '76a914512dbb2c8c02efbac8d92431aa0ac33f6b0bf97088ac',
                'token': {
                  'amount': '100000000',
                  'category': expect.any(String),
                },
                'valueSatoshis': 800,
              },
              {
                'lockingBytecode': '76a914512dbb2c8c02efbac8d92431aa0ac33f6b0bf97088ac',
                'token': {
                  'amount': '0',
                  'category': expect.any(String),
                  'nft': {
                    'capability': 'minting',
                    'commitment': '00',
                  },
                },
                'valueSatoshis': 1000,
              },
              {
                'lockingBytecode': '6a0568656c6c6f05776f726c64',
                'valueSatoshis': 0,
              },
            ],
            'version': 2,
          },
          'sourceOutputs': [
            {
              'lockingBytecode': {
                'script': 'p2pkh_placeholder_lock_0',
                'overrides': {
                  'keys': {
                    'privateKeys': {
                      'placeholder_key_0': '36f8155c559f3a670586bbbf9fd52beef6f96124f5a3a39c167fc24b052d24d7',
                    },
                  },
                },
              },
              'valueSatoshis': expect.any(Number),
            },
            {
              'lockingBytecode': {
                'script': 'p2pkh_placeholder_lock_1',
                'overrides': {
                  'keys': {
                    'privateKeys': {
                      'placeholder_key_1': '36f8155c559f3a670586bbbf9fd52beef6f96124f5a3a39c167fc24b052d24d7',
                    },
                  },
                },
              },
              'valueSatoshis': expect.any(Number),
            },
            {
              'lockingBytecode': {
                'script': 'p2pkh_placeholder_lock_2',
                'overrides': {
                  'keys': {
                    'privateKeys': {
                      'placeholder_key_2': '36f8155c559f3a670586bbbf9fd52beef6f96124f5a3a39c167fc24b052d24d7',
                    },
                  },
                },
              },
              'valueSatoshis': expect.any(Number),
            },
            {
              'lockingBytecode': [
                'slot',
              ],
              'valueSatoshis': expect.any(Number),
            },
            {
              'lockingBytecode': {
                'script': 'bar_lock',
              },
              'valueSatoshis': expect.any(Number),
            },
            {
              'lockingBytecode': {
                'script': 'foo_lock',
              },
              'valueSatoshis': expect.any(Number),
            },
            {
              'lockingBytecode': {
                'script': 'bar_lock',
              },
              'valueSatoshis': expect.any(Number),
            },
          ],
        },
        'bar_execute_evaluate': {
          'name': 'bar_execute_evaluate',
          'description': 'An example evaluation where this script execution passes.',
          'data': {
            'bytecode': {
              'pk': '0x0373cc07b54c22da627b572a387a20ea190c9382e5e6d48c1d5b89c5cea2c4c088',
              'pkh': '0x512dbb2c8c02efbac8d92431aa0ac33f6b0bf970',
              'function_index': '2',
            },
            'currentBlockHeight': expect.any(Number),
            'currentBlockTime': expect.any(Number),
            'keys': {
              'privateKeys': {
                's': '36f8155c559f3a670586bbbf9fd52beef6f96124f5a3a39c167fc24b052d24d7',
              },
            },
          },
          'transaction': {
            'inputs': [
              {
                'outpointIndex': expect.any(Number),
                'outpointTransactionHash': expect.any(String),
                'sequenceNumber': 4294967294,
                'unlockingBytecode': {
                  'script': 'p2pkh_placeholder_unlock_0',
                  'overrides': {
                    'keys': {
                      'privateKeys': {
                        'placeholder_key_0': '36f8155c559f3a670586bbbf9fd52beef6f96124f5a3a39c167fc24b052d24d7',
                      },
                    },
                  },
                },
              },
              {
                'outpointIndex': expect.any(Number),
                'outpointTransactionHash': expect.any(String),
                'sequenceNumber': 4294967294,
                'unlockingBytecode': {
                  'script': 'p2pkh_placeholder_unlock_1',
                  'overrides': {
                    'keys': {
                      'privateKeys': {
                        'placeholder_key_1': '36f8155c559f3a670586bbbf9fd52beef6f96124f5a3a39c167fc24b052d24d7',
                      },
                    },
                  },
                },
              },
              {
                'outpointIndex': expect.any(Number),
                'outpointTransactionHash': expect.any(String),
                'sequenceNumber': 4294967294,
                'unlockingBytecode': {
                  'script': 'p2pkh_placeholder_unlock_2',
                  'overrides': {
                    'keys': {
                      'privateKeys': {
                        'placeholder_key_2': '36f8155c559f3a670586bbbf9fd52beef6f96124f5a3a39c167fc24b052d24d7',
                      },
                    },
                  },
                },
              },
              {
                'outpointIndex': expect.any(Number),
                'outpointTransactionHash': expect.any(String),
                'sequenceNumber': 4294967294,
                'unlockingBytecode': {},
              },
              {
                'outpointIndex': expect.any(Number),
                'outpointTransactionHash': expect.any(String),
                'sequenceNumber': 4294967294,
                'unlockingBytecode': [
                  'slot',
                ],
              },
              {
                'outpointIndex': expect.any(Number),
                'outpointTransactionHash': expect.any(String),
                'sequenceNumber': 4294967294,
                'unlockingBytecode': {},
              },
              {
                'outpointIndex': expect.any(Number),
                'outpointTransactionHash': expect.any(String),
                'sequenceNumber': 4294967294,
                'unlockingBytecode': {},
              },
            ],
            'locktime': 0,
            'outputs': [
              {
                'lockingBytecode': {
                  'script': 'foo_lock',
                },
                'valueSatoshis': 8000,
              },
              {
                'lockingBytecode': '76a914512dbb2c8c02efbac8d92431aa0ac33f6b0bf97088ac',
                'token': {
                  'amount': '100000000',
                  'category': expect.any(String),
                },
                'valueSatoshis': 800,
              },
              {
                'lockingBytecode': '76a914512dbb2c8c02efbac8d92431aa0ac33f6b0bf97088ac',
                'token': {
                  'amount': '0',
                  'category': expect.any(String),
                  'nft': {
                    'capability': 'minting',
                    'commitment': '00',
                  },
                },
                'valueSatoshis': 1000,
              },
              {
                'lockingBytecode': '6a0568656c6c6f05776f726c64',
                'valueSatoshis': 0,
              },
            ],
            'version': 2,
          },
          'sourceOutputs': [
            {
              'lockingBytecode': {
                'script': 'p2pkh_placeholder_lock_0',
                'overrides': {
                  'keys': {
                    'privateKeys': {
                      'placeholder_key_0': '36f8155c559f3a670586bbbf9fd52beef6f96124f5a3a39c167fc24b052d24d7',
                    },
                  },
                },
              },
              'valueSatoshis': expect.any(Number),
            },
            {
              'lockingBytecode': {
                'script': 'p2pkh_placeholder_lock_1',
                'overrides': {
                  'keys': {
                    'privateKeys': {
                      'placeholder_key_1': '36f8155c559f3a670586bbbf9fd52beef6f96124f5a3a39c167fc24b052d24d7',
                    },
                  },
                },
              },
              'valueSatoshis': expect.any(Number),
            },
            {
              'lockingBytecode': {
                'script': 'p2pkh_placeholder_lock_2',
                'overrides': {
                  'keys': {
                    'privateKeys': {
                      'placeholder_key_2': '36f8155c559f3a670586bbbf9fd52beef6f96124f5a3a39c167fc24b052d24d7',
                    },
                  },
                },
              },
              'valueSatoshis': expect.any(Number),
            },
            {
              'lockingBytecode': {
                'script': 'bar_lock',
              },
              'valueSatoshis': expect.any(Number),
            },
            {
              'lockingBytecode': [
                'slot',
              ],
              'valueSatoshis': expect.any(Number),
            },
            {
              'lockingBytecode': {
                'script': 'foo_lock',
              },
              'valueSatoshis': expect.any(Number),
            },
            {
              'lockingBytecode': {
                'script': 'bar_lock',
              },
              'valueSatoshis': expect.any(Number),
            },
          ],
        },
        'foo_execute_evaluate': {
          'name': 'foo_execute_evaluate',
          'description': 'An example evaluation where this script execution passes.',
          'data': {
            'bytecode': {
              'pk': '0x0373cc07b54c22da627b572a387a20ea190c9382e5e6d48c1d5b89c5cea2c4c088',
              'pkh': '0x512dbb2c8c02efbac8d92431aa0ac33f6b0bf970',
            },
            'currentBlockHeight': expect.any(Number),
            'currentBlockTime': expect.any(Number),
            'keys': {
              'privateKeys': {
                's': '36f8155c559f3a670586bbbf9fd52beef6f96124f5a3a39c167fc24b052d24d7',
              },
            },
          },
          'transaction': {
            'inputs': [
              {
                'outpointIndex': expect.any(Number),
                'outpointTransactionHash': expect.any(String),
                'sequenceNumber': 4294967294,
                'unlockingBytecode': {
                  'script': 'p2pkh_placeholder_unlock_0',
                  'overrides': {
                    'keys': {
                      'privateKeys': {
                        'placeholder_key_0': '36f8155c559f3a670586bbbf9fd52beef6f96124f5a3a39c167fc24b052d24d7',
                      },
                    },
                  },
                },
              },
              {
                'outpointIndex': expect.any(Number),
                'outpointTransactionHash': expect.any(String),
                'sequenceNumber': 4294967294,
                'unlockingBytecode': {
                  'script': 'p2pkh_placeholder_unlock_1',
                  'overrides': {
                    'keys': {
                      'privateKeys': {
                        'placeholder_key_1': '36f8155c559f3a670586bbbf9fd52beef6f96124f5a3a39c167fc24b052d24d7',
                      },
                    },
                  },
                },
              },
              {
                'outpointIndex': expect.any(Number),
                'outpointTransactionHash': expect.any(String),
                'sequenceNumber': 4294967294,
                'unlockingBytecode': {
                  'script': 'p2pkh_placeholder_unlock_2',
                  'overrides': {
                    'keys': {
                      'privateKeys': {
                        'placeholder_key_2': '36f8155c559f3a670586bbbf9fd52beef6f96124f5a3a39c167fc24b052d24d7',
                      },
                    },
                  },
                },
              },
              {
                'outpointIndex': expect.any(Number),
                'outpointTransactionHash': expect.any(String),
                'sequenceNumber': 4294967294,
                'unlockingBytecode': {},
              },
              {
                'outpointIndex': expect.any(Number),
                'outpointTransactionHash': expect.any(String),
                'sequenceNumber': 4294967294,
                'unlockingBytecode': {},
              },
              {
                'outpointIndex': expect.any(Number),
                'outpointTransactionHash': expect.any(String),
                'sequenceNumber': 4294967294,
                'unlockingBytecode': [
                  'slot',
                ],
              },
              {
                'outpointIndex': expect.any(Number),
                'outpointTransactionHash': expect.any(String),
                'sequenceNumber': 4294967294,
                'unlockingBytecode': {},
              },
            ],
            'locktime': 0,
            'outputs': [
              {
                'lockingBytecode': {
                  'script': 'foo_lock',
                },
                'valueSatoshis': 8000,
              },
              {
                'lockingBytecode': '76a914512dbb2c8c02efbac8d92431aa0ac33f6b0bf97088ac',
                'token': {
                  'amount': '100000000',
                  'category': expect.any(String),
                },
                'valueSatoshis': 800,
              },
              {
                'lockingBytecode': '76a914512dbb2c8c02efbac8d92431aa0ac33f6b0bf97088ac',
                'token': {
                  'amount': '0',
                  'category': expect.any(String),
                  'nft': {
                    'capability': 'minting',
                    'commitment': '00',
                  },
                },
                'valueSatoshis': 1000,
              },
              {
                'lockingBytecode': '6a0568656c6c6f05776f726c64',
                'valueSatoshis': 0,
              },
            ],
            'version': 2,
          },
          'sourceOutputs': [
            {
              'lockingBytecode': {
                'script': 'p2pkh_placeholder_lock_0',
                'overrides': {
                  'keys': {
                    'privateKeys': {
                      'placeholder_key_0': '36f8155c559f3a670586bbbf9fd52beef6f96124f5a3a39c167fc24b052d24d7',
                    },
                  },
                },
              },
              'valueSatoshis': expect.any(Number),
            },
            {
              'lockingBytecode': {
                'script': 'p2pkh_placeholder_lock_1',
                'overrides': {
                  'keys': {
                    'privateKeys': {
                      'placeholder_key_1': '36f8155c559f3a670586bbbf9fd52beef6f96124f5a3a39c167fc24b052d24d7',
                    },
                  },
                },
              },
              'valueSatoshis': expect.any(Number),
            },
            {
              'lockingBytecode': {
                'script': 'p2pkh_placeholder_lock_2',
                'overrides': {
                  'keys': {
                    'privateKeys': {
                      'placeholder_key_2': '36f8155c559f3a670586bbbf9fd52beef6f96124f5a3a39c167fc24b052d24d7',
                    },
                  },
                },
              },
              'valueSatoshis': expect.any(Number),
            },
            {
              'lockingBytecode': {
                'script': 'bar_lock',
              },
              'valueSatoshis': expect.any(Number),
            },
            {
              'lockingBytecode': {
                'script': 'bar_lock',
              },
              'valueSatoshis': expect.any(Number),
            },
            {
              'lockingBytecode': [
                'slot',
              ],
              'valueSatoshis': expect.any(Number),
            },
            {
              'lockingBytecode': {
                'script': 'bar_lock',
              },
              'valueSatoshis': expect.any(Number),
            },
          ],
        },
        'bar_func_b_evaluate': {
          'name': 'bar_func_b_evaluate',
          'description': 'An example evaluation where this script execution passes.',
          'data': {
            'bytecode': {
              'pkh': '0x512dbb2c8c02efbac8d92431aa0ac33f6b0bf970',
              'function_index': '1',
            },
            'currentBlockHeight': expect.any(Number),
            'currentBlockTime': expect.any(Number),
            'keys': {
              'privateKeys': {},
            },
          },
          'transaction': {
            'inputs': [
              {
                'outpointIndex': expect.any(Number),
                'outpointTransactionHash': expect.any(String),
                'sequenceNumber': 4294967294,
                'unlockingBytecode': {
                  'script': 'p2pkh_placeholder_unlock_0',
                  'overrides': {
                    'keys': {
                      'privateKeys': {
                        'placeholder_key_0': '36f8155c559f3a670586bbbf9fd52beef6f96124f5a3a39c167fc24b052d24d7',
                      },
                    },
                  },
                },
              },
              {
                'outpointIndex': expect.any(Number),
                'outpointTransactionHash': expect.any(String),
                'sequenceNumber': 4294967294,
                'unlockingBytecode': {
                  'script': 'p2pkh_placeholder_unlock_1',
                  'overrides': {
                    'keys': {
                      'privateKeys': {
                        'placeholder_key_1': '36f8155c559f3a670586bbbf9fd52beef6f96124f5a3a39c167fc24b052d24d7',
                      },
                    },
                  },
                },
              },
              {
                'outpointIndex': expect.any(Number),
                'outpointTransactionHash': expect.any(String),
                'sequenceNumber': 4294967294,
                'unlockingBytecode': {
                  'script': 'p2pkh_placeholder_unlock_2',
                  'overrides': {
                    'keys': {
                      'privateKeys': {
                        'placeholder_key_2': '36f8155c559f3a670586bbbf9fd52beef6f96124f5a3a39c167fc24b052d24d7',
                      },
                    },
                  },
                },
              },
              {
                'outpointIndex': expect.any(Number),
                'outpointTransactionHash': expect.any(String),
                'sequenceNumber': 4294967294,
                'unlockingBytecode': {},
              },
              {
                'outpointIndex': expect.any(Number),
                'outpointTransactionHash': expect.any(String),
                'sequenceNumber': 4294967294,
                'unlockingBytecode': {},
              },
              {
                'outpointIndex': expect.any(Number),
                'outpointTransactionHash': expect.any(String),
                'sequenceNumber': 4294967294,
                'unlockingBytecode': {},
              },
              {
                'outpointIndex': expect.any(Number),
                'outpointTransactionHash': expect.any(String),
                'sequenceNumber': 4294967294,
                'unlockingBytecode': [
                  'slot',
                ],
              },
            ],
            'locktime': 0,
            'outputs': [
              {
                'lockingBytecode': {
                  'script': 'foo_lock',
                },
                'valueSatoshis': 8000,
              },
              {
                'lockingBytecode': '76a914512dbb2c8c02efbac8d92431aa0ac33f6b0bf97088ac',
                'token': {
                  'amount': '100000000',
                  'category': expect.any(String),
                },
                'valueSatoshis': 800,
              },
              {
                'lockingBytecode': '76a914512dbb2c8c02efbac8d92431aa0ac33f6b0bf97088ac',
                'token': {
                  'amount': '0',
                  'category': expect.any(String),
                  'nft': {
                    'capability': 'minting',
                    'commitment': '00',
                  },
                },
                'valueSatoshis': 1000,
              },
              {
                'lockingBytecode': '6a0568656c6c6f05776f726c64',
                'valueSatoshis': 0,
              },
            ],
            'version': 2,
          },
          'sourceOutputs': [
            {
              'lockingBytecode': {
                'script': 'p2pkh_placeholder_lock_0',
                'overrides': {
                  'keys': {
                    'privateKeys': {
                      'placeholder_key_0': '36f8155c559f3a670586bbbf9fd52beef6f96124f5a3a39c167fc24b052d24d7',
                    },
                  },
                },
              },
              'valueSatoshis': expect.any(Number),
            },
            {
              'lockingBytecode': {
                'script': 'p2pkh_placeholder_lock_1',
                'overrides': {
                  'keys': {
                    'privateKeys': {
                      'placeholder_key_1': '36f8155c559f3a670586bbbf9fd52beef6f96124f5a3a39c167fc24b052d24d7',
                    },
                  },
                },
              },
              'valueSatoshis': expect.any(Number),
            },
            {
              'lockingBytecode': {
                'script': 'p2pkh_placeholder_lock_2',
                'overrides': {
                  'keys': {
                    'privateKeys': {
                      'placeholder_key_2': '36f8155c559f3a670586bbbf9fd52beef6f96124f5a3a39c167fc24b052d24d7',
                    },
                  },
                },
              },
              'valueSatoshis': expect.any(Number),
            },
            {
              'lockingBytecode': {
                'script': 'bar_lock',
              },
              'valueSatoshis': expect.any(Number),
            },
            {
              'lockingBytecode': {
                'script': 'bar_lock',
              },
              'valueSatoshis': expect.any(Number),
            },
            {
              'lockingBytecode': {
                'script': 'foo_lock',
              },
              'valueSatoshis': expect.any(Number),
            },
            {
              'lockingBytecode': [
                'slot',
              ],
              'valueSatoshis': expect.any(Number),
            },
          ],
        },
      },
    },
  },
  {
    name: 'Simple 1 contract input & 1 contract output',
    transaction: (async () => {
      const contract = new Contract(BarArtifact, [alicePkh], { provider });
      provider.addUtxo(contract.address, randomUtxo());

      const contractUtxos = await contract.getUtxos();

      return new TransactionBuilder({ provider })
        .addInput(
          contractUtxos[0],
          contract.unlock.funcA(),
        )
        .addOutput({ to: contract.address, amount: 10_000n });
    })(),
    template: {
      '$schema': 'https://ide.bitauth.com/authentication-template-v0.schema.json',
      'description': 'Imported from cashscript',
      'name': 'CashScript Generated Debugging Template',
      'supported': [
        'BCH_2023_05',
      ],
      'version': 0,
      'entities': {
        'bar_parameters': {
          'description': 'Contract creation and function parameters',
          'name': 'Bar',
          'scripts': [
            'bar_lock',
            'bar_func_a_unlock',
          ],
          'variables': {
            'pkh': {
              'description': '"pkh" parameter of this contract',
              'name': 'Pkh',
              'type': 'WalletData',
            },
            'function_index': {
              'description': 'Script function index to execute',
              'name': 'Function Index',
              'type': 'WalletData',
            },
          },
        },
      },
      'scripts': {
        'bar_func_a_unlock': {
          'passes': [
            'bar_func_a_evaluate',
          ],
          'name': 'funcA',
          'script': '// "funcA" function parameters\n// none\n\n// function index in contract\n<function_index> // int = <0>\n',
          'unlocks': 'bar_lock',
        },
        'bar_lock': {
          'lockingType': 'p2sh32',
          'name': 'Bar',
          'script': "// \"Bar\" contract constructor parameters\n<pkh> // bytes20 = <0x512dbb2c8c02efbac8d92431aa0ac33f6b0bf970>\n\n// bytecode\n                                                        /* pragma cashscript ^0.10.2;                             */\n                                                        /*                                                        */\n                                                        /* contract Bar(bytes20 pkh) {                            */\nOP_1 OP_PICK OP_0 OP_NUMEQUAL OP_IF                     /*     function funcA() {                                 */\nOP_2 OP_2 OP_NUMEQUAL                                   /*         require(2==2);                                 */\nOP_NIP OP_NIP OP_ELSE                                   /*     }                                                  */\n                                                        /*                                                        */\nOP_1 OP_PICK OP_1 OP_NUMEQUAL OP_IF                     /*     function funcB() {                                 */\nOP_2 OP_2 OP_NUMEQUAL                                   /*         require(2==2);                                 */\nOP_NIP OP_NIP OP_ELSE                                   /*     }                                                  */\n                                                        /*                                                        */\nOP_1 OP_ROLL OP_2 OP_NUMEQUAL OP_VERIFY                 /*     function execute(pubkey pk, sig s) {               */\n                                                        /*         console.log('Bar 'execute' function called.'); */\nOP_1 OP_PICK OP_HASH160 OP_1 OP_ROLL OP_EQUAL OP_VERIFY /*         require(hash160(pk) == pkh);                   */\nOP_1 OP_ROLL OP_1 OP_ROLL OP_CHECKSIG                   /*         require(checkSig(s, pk));                      */\n                                                        /*     }                                                  */\nOP_ENDIF OP_ENDIF                                       /* }                                                      */",
        },
      },
      'scenarios': {
        'bar_func_a_evaluate': {
          'name': 'bar_func_a_evaluate',
          'description': 'An example evaluation where this script execution passes.',
          'data': {
            'bytecode': {
              'pkh': '0x512dbb2c8c02efbac8d92431aa0ac33f6b0bf970',
              'function_index': '0',
            },
            'currentBlockHeight': expect.any(Number),
            'currentBlockTime': expect.any(Number),
            'keys': {
              'privateKeys': {},
            },
          },
          'transaction': {
            'inputs': [
              {
                'outpointIndex': expect.any(Number),
                'outpointTransactionHash': expect.any(String),
                'sequenceNumber': 4294967294,
                'unlockingBytecode': [
                  'slot',
                ],
              },
            ],
            'locktime': 0,
            'outputs': [
              {
                'lockingBytecode': {
                  'script': 'bar_lock',
                },
                'valueSatoshis': 10000,
              },
            ],
            'version': 2,
          },
          'sourceOutputs': [
            {
              'lockingBytecode': [
                'slot',
              ],
              'valueSatoshis': expect.any(Number),
            },
          ],
        },
      },
    },
  },
  {
    // TODO: Duplicate input scenarios with the same function call have the same name
    name: 'Duplicate function calls',
    transaction: (async () => {
      const barContract = new Contract(BarArtifact, [alicePkh], { provider });
      provider.addUtxo(barContract.address, randomUtxo());
      provider.addUtxo(barContract.address, randomUtxo());

      const barContractUtxos = await barContract.getUtxos();

      const aliceTemplate = new SignatureTemplate(alicePriv);
      const bobTemplate = new SignatureTemplate(bobPriv);

      return new TransactionBuilder({ provider })
        .addInput(barContractUtxos[0], barContract.unlock.execute(alicePub, aliceTemplate))
        .addInput(barContractUtxos[1], barContract.unlock.execute(bobPub, bobTemplate))
        .addOutput({ to: barContract.address, amount: 20_000n });
    })(),
    template: {
      '$schema': 'https://ide.bitauth.com/authentication-template-v0.schema.json',
      'description': 'Imported from cashscript',
      'name': 'CashScript Generated Debugging Template',
      'supported': [
        'BCH_2023_05',
      ],
      'version': 0,
      'entities': {
        'bar_parameters': {
          'description': 'Contract creation and function parameters',
          'name': 'Bar',
          'scripts': [
            'bar_lock',
            'bar_execute_unlock',
          ],
          'variables': {
            'pk': {
              'description': '"pk" parameter of function "execute"',
              'name': 'Pk',
              'type': 'WalletData',
            },
            's': {
              'description': '"s" parameter of function "execute"',
              'name': 'S',
              'type': 'Key',
            },
            'pkh': {
              'description': '"pkh" parameter of this contract',
              'name': 'Pkh',
              'type': 'WalletData',
            },
            'function_index': {
              'description': 'Script function index to execute',
              'name': 'Function Index',
              'type': 'WalletData',
            },
          },
        },
      },
      'scripts': {
        'bar_execute_unlock': {
          'passes': [
            'bar_execute_evaluate1',
          ],
          'name': 'execute',
          'script': '// "execute" function parameters\n<s.schnorr_signature.all_outputs_all_utxos> // sig\n<pk> // pubkey = <0x028f1219c918234d6bb06b4782354ff0759bd73036f3c849b88020c79fe013cd38>\n\n// function index in contract\n<function_index> // int = <2>\n',
          'unlocks': 'bar_lock',
        },
        'bar_lock': {
          'lockingType': 'p2sh32',
          'name': 'Bar',
          'script': "// \"Bar\" contract constructor parameters\n<pkh> // bytes20 = <0x512dbb2c8c02efbac8d92431aa0ac33f6b0bf970>\n\n// bytecode\n                                                        /* pragma cashscript ^0.10.2;                             */\n                                                        /*                                                        */\n                                                        /* contract Bar(bytes20 pkh) {                            */\nOP_1 OP_PICK OP_0 OP_NUMEQUAL OP_IF                     /*     function funcA() {                                 */\nOP_2 OP_2 OP_NUMEQUAL                                   /*         require(2==2);                                 */\nOP_NIP OP_NIP OP_ELSE                                   /*     }                                                  */\n                                                        /*                                                        */\nOP_1 OP_PICK OP_1 OP_NUMEQUAL OP_IF                     /*     function funcB() {                                 */\nOP_2 OP_2 OP_NUMEQUAL                                   /*         require(2==2);                                 */\nOP_NIP OP_NIP OP_ELSE                                   /*     }                                                  */\n                                                        /*                                                        */\nOP_1 OP_ROLL OP_2 OP_NUMEQUAL OP_VERIFY                 /*     function execute(pubkey pk, sig s) {               */\n                                                        /*         console.log('Bar 'execute' function called.'); */\nOP_1 OP_PICK OP_HASH160 OP_1 OP_ROLL OP_EQUAL OP_VERIFY /*         require(hash160(pk) == pkh);                   */\nOP_1 OP_ROLL OP_1 OP_ROLL OP_CHECKSIG                   /*         require(checkSig(s, pk));                      */\n                                                        /*     }                                                  */\nOP_ENDIF OP_ENDIF                                       /* }                                                      */",
        },
      },
      'scenarios': {
        'bar_execute_evaluate': {
          'name': 'bar_execute_evaluate',
          'description': 'An example evaluation where this script execution passes.',
          'data': {
            'bytecode': {
              'pk': '0x0373cc07b54c22da627b572a387a20ea190c9382e5e6d48c1d5b89c5cea2c4c088',
              'pkh': '0x512dbb2c8c02efbac8d92431aa0ac33f6b0bf970',
              'function_index': '2',
            },
            'currentBlockHeight': expect.any(Number),
            'currentBlockTime': expect.any(Number),
            'keys': {
              'privateKeys': {
                's': '36f8155c559f3a670586bbbf9fd52beef6f96124f5a3a39c167fc24b052d24d7',
              },
            },
          },
          'transaction': {
            'inputs': [
              {
                'outpointIndex': expect.any(Number),
                'outpointTransactionHash': expect.any(String),
                'sequenceNumber': 4294967294,
                'unlockingBytecode': [
                  'slot',
                ],
              },
              {
                'outpointIndex': expect.any(Number),
                'outpointTransactionHash': expect.any(String),
                'sequenceNumber': 4294967294,
                'unlockingBytecode': {},
              },
            ],
            'locktime': 0,
            'outputs': [
              {
                'lockingBytecode': {
                  'script': 'bar_lock',
                },
                'valueSatoshis': 20000,
              },
            ],
            'version': 2,
          },
          'sourceOutputs': [
            {
              'lockingBytecode': [
                'slot',
              ],
              'valueSatoshis': expect.any(Number),
            },
            {
              'lockingBytecode': {
                'script': 'bar_lock',
              },
              'valueSatoshis': expect.any(Number),
            },
          ],
        },
        'bar_execute_evaluate1': {
          'name': 'bar_execute_evaluate',
          'description': 'An example evaluation where this script execution passes.',
          'data': {
            'bytecode': {
              'pk': '0x028f1219c918234d6bb06b4782354ff0759bd73036f3c849b88020c79fe013cd38',
              'pkh': '0x512dbb2c8c02efbac8d92431aa0ac33f6b0bf970',
              'function_index': '2',
            },
            'currentBlockHeight': expect.any(Number),
            'currentBlockTime': expect.any(Number),
            'keys': {
              'privateKeys': {
                's': '71080d8b52ec7b12adaec909ed54cd989b682ce2c35647eec219a16f5f90c528',
              },
            },
          },
          'transaction': {
            'inputs': [
              {
                'outpointIndex': expect.any(Number),
                'outpointTransactionHash': expect.any(String),
                'sequenceNumber': 4294967294,
                'unlockingBytecode': {},
              },
              {
                'outpointIndex': expect.any(Number),
                'outpointTransactionHash': expect.any(String),
                'sequenceNumber': 4294967294,
                'unlockingBytecode': [
                  'slot',
                ],
              },
            ],
            'locktime': 0,
            'outputs': [
              {
                'lockingBytecode': {
                  'script': 'bar_lock',
                },
                'valueSatoshis': 20000,
              },
            ],
            'version': 2,
          },
          'sourceOutputs': [
            {
              'lockingBytecode': {
                'script': 'bar_lock',
              },
              'valueSatoshis': expect.any(Number),
            },
            {
              'lockingBytecode': [
                'slot',
              ],
              'valueSatoshis': expect.any(Number),
            },
          ],
        },
      },
    },
  },
];
