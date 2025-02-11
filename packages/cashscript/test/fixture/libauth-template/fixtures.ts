import { Contract, HashType, MockNetworkProvider, SignatureAlgorithm, SignatureTemplate, Transaction, randomNFT, randomToken, randomUtxo } from '../../../src/index.js';
import TransferWithTimeout from '../transfer_with_timeout.json' with { type: 'json' };
import Mecenas from '../mecenas.json' with { type: 'json' };
import P2PKH from '../p2pkh.json' with { type: 'json' };
import HoldVault from '../hodl_vault.json' with { type: 'json' };
import { aliceAddress, alicePkh, alicePriv, alicePub, bobPkh, bobPriv, bobPub, oracle, oraclePub } from '../vars.js';
import { WalletTemplate, hexToBin } from '@bitauth/libauth';

const provider = new MockNetworkProvider();

export interface Fixture {
  name: string;
  transaction: Transaction;
  template: WalletTemplate;
}

export const fixtures: Fixture[] = [
  {
    name: 'TransferWithTimeout (transfer function)',
    transaction: (() => {
      const contract = new Contract(TransferWithTimeout, [alicePub, bobPub, 100000n], { provider });
      provider.addUtxo(contract.address, randomUtxo());

      const tx = contract.functions
        .transfer(new SignatureTemplate(bobPriv))
        .to(contract.address, 10000n)
        .withoutChange();

      return tx;
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
        'transfer_with_timeout_parameters': {
          'description': 'Contract creation and function parameters',
          'name': 'transfer_with_timeout_parameters',
          'scripts': [
            'transfer_with_timeout_lock',
            'transfer_with_timeout_unlock',
          ],
          'variables': {
            'recipient_sig': {
              'description': '"recipientSig" parameter of function "transfer"',
              'name': 'recipientSig',
              'type': 'Key',
            },
            'function_index': {
              'description': 'Script function index to execute',
              'name': 'function_index',
              'type': 'WalletData',
            },
            'timeout': {
              'description': '"timeout" parameter of this contract',
              'name': 'timeout',
              'type': 'WalletData',
            },
            'recipient': {
              'description': '"recipient" parameter of this contract',
              'name': 'recipient',
              'type': 'WalletData',
            },
            'sender': {
              'description': '"sender" parameter of this contract',
              'name': 'sender',
              'type': 'WalletData',
            },
          },
        },
      },
      'scenarios': {
        'transfer_with_timeout_evaluate': {
          'name': 'transfer_with_timeout_evaluate',
          'description': 'An example evaluation where this script execution passes.',
          'data': {
            'bytecode': {
              'function_index': '0',
              'timeout': '0xa08601',
              'recipient': '0x028f1219c918234d6bb06b4782354ff0759bd73036f3c849b88020c79fe013cd38',
              'sender': '0x0373cc07b54c22da627b572a387a20ea190c9382e5e6d48c1d5b89c5cea2c4c088',
            },
            'currentBlockHeight': 2,
            'currentBlockTime': expect.any(Number),
            'keys': {
              'privateKeys': {
                'recipient_sig': '71080d8b52ec7b12adaec909ed54cd989b682ce2c35647eec219a16f5f90c528',
              },
            },
          },
          'transaction': {
            'inputs': [
              {
                'outpointIndex': expect.any(Number),
                'outpointTransactionHash': expect.stringMatching(/^[0-9a-f]{64}$/),
                'sequenceNumber': 4294967294,
                'unlockingBytecode': [
                  'slot',
                ],
              },
            ],
            'locktime': expect.any(Number),
            'outputs': [
              {
                'lockingBytecode': {},
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
      'scripts': {
        'transfer_with_timeout_unlock': {
          'passes': [
            'transfer_with_timeout_evaluate',
          ],
          'name': 'transfer_with_timeout_unlock',
          'script': '// "transfer" function parameters\n<recipient_sig.schnorr_signature.all_outputs_all_utxos> // sig\n\n// function index in contract\n<function_index> // int = <0>\n',
          'unlocks': 'transfer_with_timeout_lock',
        },
        'transfer_with_timeout_lock': {
          'lockingType': 'p2sh32',
          'name': 'transfer_with_timeout_lock',
          'script': "// \"TransferWithTimeout\" contract constructor parameters\n<timeout> // int = <0xa08601>\n<recipient> // pubkey = <0x028f1219c918234d6bb06b4782354ff0759bd73036f3c849b88020c79fe013cd38>\n<sender> // pubkey = <0x0373cc07b54c22da627b572a387a20ea190c9382e5e6d48c1d5b89c5cea2c4c088>\n\n// bytecode\n                                                /* contract TransferWithTimeout(                                             */\n                                                /*     pubkey sender,                                                        */\n                                                /*     pubkey recipient,                                                     */\n                                                /*     int timeout                                                           */\n                                                /* ) {                                                                       */\n                                                /*     // Require recipient's signature to match                             */\nOP_3 OP_PICK OP_0 OP_NUMEQUAL OP_IF             /*     function transfer(sig recipientSig) {                                 */\nOP_4 OP_ROLL OP_2 OP_ROLL OP_CHECKSIG           /*         require(checkSig(recipientSig, recipient));                       */\nOP_NIP OP_NIP OP_NIP OP_ELSE                    /*     }                                                                     */\n                                                /*                                                                           */\n                                                /*     // Require timeout time to be reached and sender's signature to match */\nOP_3 OP_ROLL OP_1 OP_NUMEQUAL OP_VERIFY         /*     function timeout(sig senderSig) {                                     */\nOP_3 OP_ROLL OP_1 OP_ROLL OP_CHECKSIG OP_VERIFY /*         require(checkSig(senderSig, sender));                             */\nOP_1 OP_ROLL OP_CHECKLOCKTIMEVERIFY OP_DROP     /*         require(tx.time >= timeout);                                      */\nOP_1 OP_NIP                                     /*     }                                                                     */\nOP_ENDIF                                        /* }                                                                         */\n                                                /*                                                                           */",
        },
      },
    },
  },
  {
    name: 'TransferWithTimeout (timeout function)',
    transaction: (() => {
      const contract = new Contract(TransferWithTimeout, [alicePub, bobPub, 100000n], { provider });
      provider.addUtxo(contract.address, randomUtxo());

      const tx = contract.functions
        .timeout(new SignatureTemplate(alicePriv))
        .to(contract.address, 10000n)
        .withoutChange();

      return tx;
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
        'transfer_with_timeout_parameters': {
          'description': 'Contract creation and function parameters',
          'name': 'transfer_with_timeout_parameters',
          'scripts': [
            'transfer_with_timeout_lock',
            'transfer_with_timeout_unlock',
          ],
          'variables': {
            'function_index': {
              'description': 'Script function index to execute',
              'name': 'function_index',
              'type': 'WalletData',
            },
            'timeout': {
              'description': '"timeout" parameter of this contract',
              'name': 'timeout',
              'type': 'WalletData',
            },
            'recipient': {
              'description': '"recipient" parameter of this contract',
              'name': 'recipient',
              'type': 'WalletData',
            },
            'sender': {
              'description': '"sender" parameter of this contract',
              'name': 'sender',
              'type': 'WalletData',
            },
            'sender_sig': {
              'description': '"senderSig" parameter of function "timeout\"',
              'name': 'senderSig',
              'type': 'Key',
            },
          },
        },
      },
      'scenarios': {
        'transfer_with_timeout_evaluate': {
          'name': 'transfer_with_timeout_evaluate',
          'description': 'An example evaluation where this script execution passes.',
          'data': {
            'bytecode': {
              'function_index': '1',
              'timeout': '0xa08601',
              'recipient': '0x028f1219c918234d6bb06b4782354ff0759bd73036f3c849b88020c79fe013cd38',
              'sender': '0x0373cc07b54c22da627b572a387a20ea190c9382e5e6d48c1d5b89c5cea2c4c088',
            },
            'currentBlockHeight': 2,
            'currentBlockTime': expect.any(Number),
            'keys': {
              'privateKeys': {
                'sender_sig': '36f8155c559f3a670586bbbf9fd52beef6f96124f5a3a39c167fc24b052d24d7',
              },
            },
          },
          'transaction': {
            'inputs': [
              {
                'outpointIndex': expect.any(Number),
                'outpointTransactionHash': expect.stringMatching(/^[0-9a-f]{64}$/),
                'sequenceNumber': 4294967294,
                'unlockingBytecode': [
                  'slot',
                ],
              },
            ],
            'locktime': expect.any(Number),
            'outputs': [
              {
                'lockingBytecode': {},
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
      'scripts': {
        'transfer_with_timeout_unlock': {
          'passes': [
            'transfer_with_timeout_evaluate',
          ],
          'name': 'transfer_with_timeout_unlock',
          'script': '// "timeout\" function parameters\n<sender_sig.schnorr_signature.all_outputs_all_utxos> // sig\n\n// function index in contract\n<function_index> // int = <1>\n',
          'unlocks': 'transfer_with_timeout_lock',
        },
        'transfer_with_timeout_lock': {
          'lockingType': 'p2sh32',
          'name': 'transfer_with_timeout_lock',
          'script': "// \"TransferWithTimeout\" contract constructor parameters\n<timeout> // int = <0xa08601>\n<recipient> // pubkey = <0x028f1219c918234d6bb06b4782354ff0759bd73036f3c849b88020c79fe013cd38>\n<sender> // pubkey = <0x0373cc07b54c22da627b572a387a20ea190c9382e5e6d48c1d5b89c5cea2c4c088>\n\n// bytecode\n                                                /* contract TransferWithTimeout(                                             */\n                                                /*     pubkey sender,                                                        */\n                                                /*     pubkey recipient,                                                     */\n                                                /*     int timeout                                                           */\n                                                /* ) {                                                                       */\n                                                /*     // Require recipient's signature to match                             */\nOP_3 OP_PICK OP_0 OP_NUMEQUAL OP_IF             /*     function transfer(sig recipientSig) {                                 */\nOP_4 OP_ROLL OP_2 OP_ROLL OP_CHECKSIG           /*         require(checkSig(recipientSig, recipient));                       */\nOP_NIP OP_NIP OP_NIP OP_ELSE                    /*     }                                                                     */\n                                                /*                                                                           */\n                                                /*     // Require timeout time to be reached and sender's signature to match */\nOP_3 OP_ROLL OP_1 OP_NUMEQUAL OP_VERIFY         /*     function timeout(sig senderSig) {                                     */\nOP_3 OP_ROLL OP_1 OP_ROLL OP_CHECKSIG OP_VERIFY /*         require(checkSig(senderSig, sender));                             */\nOP_1 OP_ROLL OP_CHECKLOCKTIMEVERIFY OP_DROP     /*         require(tx.time >= timeout);                                      */\nOP_1 OP_NIP                                     /*     }                                                                     */\nOP_ENDIF                                        /* }                                                                         */\n                                                /*                                                                           */",
        },
      },
    },
  },
  {
    name: 'Mecenas',
    transaction: (() => {
      const contract = new Contract(Mecenas, [alicePkh, bobPkh, 10_000n], { provider });
      provider.addUtxo(contract.address, randomUtxo());

      const tx = contract.functions
        .receive()
        .to(aliceAddress, 10_000n)
        .withHardcodedFee(1000n);

      return tx;
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
        'mecenas_parameters': {
          'description': 'Contract creation and function parameters',
          'name': 'mecenas_parameters',
          'scripts': [
            'mecenas_lock',
            'mecenas_unlock',
          ],
          'variables': {
            'function_index': {
              'description': 'Script function index to execute',
              'name': 'function_index',
              'type': 'WalletData',
            },
            'pledge': {
              'description': '"pledge" parameter of this contract',
              'name': 'pledge',
              'type': 'WalletData',
            },
            'funder': {
              'description': '"funder" parameter of this contract',
              'name': 'funder',
              'type': 'WalletData',
            },
            'recipient': {
              'description': '"recipient" parameter of this contract',
              'name': 'recipient',
              'type': 'WalletData',
            },
          },
        },
      },
      'scenarios': {
        'mecenas_evaluate': {
          'name': 'mecenas_evaluate',
          'description': 'An example evaluation where this script execution passes.',
          'data': {
            'bytecode': {
              'function_index': '0',
              'pledge': '0x1027',
              'funder': '0xb40a2013337edb0dfe307f0a57d5dec5bfe60dd0',
              'recipient': '0x512dbb2c8c02efbac8d92431aa0ac33f6b0bf970',
            },
            'currentBlockHeight': 2,
            'currentBlockTime': expect.any(Number),
            'keys': {
              'privateKeys': {},
            },
          },
          'transaction': {
            'inputs': [
              {
                'outpointIndex': expect.any(Number),
                'outpointTransactionHash': expect.stringMatching(/^[0-9a-f]{64}$/),
                'sequenceNumber': 4294967294,
                'unlockingBytecode': [
                  'slot',
                ],
              },
            ],
            'locktime': 133700,
            'outputs': [
              {
                'lockingBytecode': '76a914512dbb2c8c02efbac8d92431aa0ac33f6b0bf97088ac',
                'valueSatoshis': 10000,
              },
              {
                'lockingBytecode': {},
                'valueSatoshis': expect.any(Number),
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
      'scripts': {
        'mecenas_unlock': {
          'passes': [
            'mecenas_evaluate',
          ],
          'name': 'mecenas_unlock',
          'script': '// "receive" function parameters\n// none\n\n// function index in contract\n<function_index> // int = <0>\n',
          'unlocks': 'mecenas_lock',
        },
        'mecenas_lock': {
          'lockingType': 'p2sh32',
          'name': 'mecenas_lock',
          'script': "// \"Mecenas\" contract constructor parameters\n<pledge> // int = <0x1027>\n<funder> // bytes20 = <0xb40a2013337edb0dfe307f0a57d5dec5bfe60dd0>\n<recipient> // bytes20 = <0x512dbb2c8c02efbac8d92431aa0ac33f6b0bf970>\n\n// bytecode\n                                                                                         /* pragma cashscript >=0.8.0;                                                                                         */\n                                                                                         /*                                                                                                                    */\n                                                                                         /* \\/* This is an unofficial CashScript port of Licho's Mecenas contract. It is                                       */\n                                                                                         /*  * not compatible with Licho's EC plugin, but rather meant as a demonstration                                      */\n                                                                                         /*  * of covenants in CashScript.                                                                                     */\n                                                                                         /*  * The time checking has been removed so it can be tested without time requirements.                               */\n                                                                                         /*  *\\/                                                                                                               */\n                                                                                         /* contract Mecenas(bytes20 recipient, bytes20 funder, int pledge\\/*, int period *\\/) {                               */\nOP_3 OP_PICK OP_0 OP_NUMEQUAL OP_IF                                                      /*     function receive() {                                                                                           */\n                                                                                         /*         // require(tx.age >= period);                                                                              */\n                                                                                         /*                                                                                                                    */\n                                                                                         /*         // Check that the first output sends to the recipient                                                      */\nOP_0 OP_OUTPUTBYTECODE <0x76a914> OP_2 OP_ROLL OP_CAT <0x88ac> OP_CAT OP_EQUAL OP_VERIFY /*         require(tx.outputs[0].lockingBytecode == new LockingBytecodeP2PKH(recipient));                             */\n                                                                                         /*                                                                                                                    */\n<0xe803>                                                                                 /*         int minerFee = 1000;                                                                                       */\nOP_INPUTINDEX OP_UTXOVALUE                                                               /*         int currentValue = tx.inputs[this.activeInputIndex].value;                                                 */\nOP_0 OP_PICK OP_4 OP_PICK OP_SUB OP_2 OP_PICK OP_SUB                                     /*         int changeValue = currentValue - pledge - minerFee;                                                        */\n                                                                                         /*                                                                                                                    */\n                                                                                         /*         // If there is not enough left for *another* pledge after this one, we send the remainder to the recipient */\n                                                                                         /*         // Otherwise we send the remainder to the recipient and the change back to the contract                    */\nOP_0 OP_PICK OP_5 OP_PICK OP_4 OP_PICK OP_ADD OP_LESSTHANOREQUAL OP_IF                   /*         if (changeValue <= pledge + minerFee) {                                                                    */\nOP_0 OP_OUTPUTVALUE OP_2 OP_PICK OP_4 OP_PICK OP_SUB OP_NUMEQUAL OP_VERIFY               /*             require(tx.outputs[0].value == currentValue - minerFee);                                               */\nOP_ELSE                                                                                  /*         } else {                                                                                                   */\nOP_0 OP_OUTPUTVALUE OP_5 OP_PICK OP_NUMEQUAL OP_VERIFY                                   /*             require(tx.outputs[0].value == pledge);                                                                */\nOP_1 OP_OUTPUTBYTECODE OP_INPUTINDEX OP_UTXOBYTECODE OP_EQUAL OP_VERIFY                  /*             require(tx.outputs[1].lockingBytecode == tx.inputs[this.activeInputIndex].lockingBytecode);            */\nOP_1 OP_OUTPUTVALUE OP_1 OP_PICK OP_NUMEQUAL OP_VERIFY                                   /*             require(tx.outputs[1].value == changeValue);                                                           */\nOP_ENDIF                                                                                 /*         }                                                                                                          */\nOP_1 OP_NIP OP_NIP OP_NIP OP_NIP OP_NIP OP_NIP OP_ELSE                                   /*     }                                                                                                              */\n                                                                                         /*                                                                                                                    */\nOP_3 OP_ROLL OP_1 OP_NUMEQUAL OP_VERIFY                                                  /*     function reclaim(pubkey pk, sig s) {                                                                           */\nOP_3 OP_PICK OP_HASH160 OP_2 OP_ROLL OP_EQUAL OP_VERIFY                                  /*         require(hash160(pk) == funder);                                                                            */\nOP_3 OP_ROLL OP_3 OP_ROLL OP_CHECKSIG                                                    /*         require(checkSig(s, pk));                                                                                  */\nOP_NIP OP_NIP                                                                            /*     }                                                                                                              */\nOP_ENDIF                                                                                 /* }                                                                                                                  */\n                                                                                         /*                                                                                                                    */",
        },
      },
    },
  },
  {
    name: 'P2PKH (sending fungible tokens)',
    transaction: (() => {
      const contract = new Contract(P2PKH, [alicePkh], { provider });

      const regularUtxo = randomUtxo();
      const tokenUtxo = randomUtxo({ satoshis: 1000n, token: randomToken() });
      provider.addUtxo(contract.address, regularUtxo);
      provider.addUtxo(contract.address, tokenUtxo);

      const to = contract.tokenAddress;
      const amount = 1000n;

      const tx = contract.functions
        .spend(alicePub, new SignatureTemplate(alicePriv))
        .from(regularUtxo)
        .from(tokenUtxo)
        .to(to, amount, tokenUtxo.token);

      return tx;
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
        'p2_pkh_parameters': {
          'description': 'Contract creation and function parameters',
          'name': 'p2_pkh_parameters',
          'scripts': [
            'p2_pkh_lock',
            'p2_pkh_unlock',
          ],
          'variables': {
            's': {
              'description': '"s" parameter of function "spend"',
              'name': 's',
              'type': 'Key',
            },
            'pk': {
              'description': '"pk" parameter of function "spend"',
              'name': 'pk',
              'type': 'WalletData',
            },
            'pkh': {
              'description': '"pkh" parameter of this contract',
              'name': 'pkh',
              'type': 'WalletData',
            },
          },
        },
      },
      'scenarios': {
        'p2_pkh_evaluate': {
          'name': 'p2_pkh_evaluate',
          'description': 'An example evaluation where this script execution passes.',
          'data': {
            'bytecode': {
              'pk': '0x0373cc07b54c22da627b572a387a20ea190c9382e5e6d48c1d5b89c5cea2c4c088',
              'pkh': '0x512dbb2c8c02efbac8d92431aa0ac33f6b0bf970',
            },
            'currentBlockHeight': 2,
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
                'outpointTransactionHash': expect.stringMatching(/^[0-9a-f]{64}$/),
                'sequenceNumber': 4294967294,
                'unlockingBytecode': [
                  'slot',
                ],
              },
              {
                'outpointIndex': expect.any(Number),
                'outpointTransactionHash': expect.stringMatching(/^[0-9a-f]{64}$/),
                'sequenceNumber': 4294967294,
                'unlockingBytecode': {},
              },
            ],
            'locktime': 133700,
            'outputs': [
              {
                'lockingBytecode': {},
                'token': {
                  'amount': expect.stringMatching(/^[0-9]+$/),
                  'category': expect.stringMatching(/^[0-9a-f]{64}$/),
                },
                'valueSatoshis': 1000,
              },
              {
                'lockingBytecode': {},
                'valueSatoshis': expect.any(Number),
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
              'lockingBytecode': {},
              'valueSatoshis': 1000,
              'token': {
                'amount': expect.stringMatching(/^[0-9]+$/),
                'category': expect.stringMatching(/^[0-9a-f]{64}$/),
              },
            },
          ],
        },
      },
      'scripts': {
        'p2_pkh_unlock': {
          'passes': [
            'p2_pkh_evaluate',
          ],
          'name': 'p2_pkh_unlock',
          'script': '// "spend" function parameters\n<s.schnorr_signature.all_outputs_all_utxos> // sig\n<pk> // pubkey = <0x0373cc07b54c22da627b572a387a20ea190c9382e5e6d48c1d5b89c5cea2c4c088>\n',
          'unlocks': 'p2_pkh_lock',
        },
        'p2_pkh_lock': {
          'lockingType': 'p2sh32',
          'name': 'p2_pkh_lock',
          'script': '// "P2PKH" contract constructor parameters\n<pkh> // bytes20 = <0x512dbb2c8c02efbac8d92431aa0ac33f6b0bf970>\n\n// bytecode\n                                                        /* contract P2PKH(bytes20 pkh) {                                */\n                                                        /*     // Require pk to match stored pkh and signature to match */\n                                                        /*     function spend(pubkey pk, sig s) {                       */\nOP_1 OP_PICK OP_HASH160 OP_1 OP_ROLL OP_EQUAL OP_VERIFY /*         require(hash160(pk) == pkh);                         */\nOP_1 OP_ROLL OP_1 OP_ROLL OP_CHECKSIG                   /*         require(checkSig(s, pk));                            */\n                                                        /*     }                                                        */\n                                                        /* }                                                            */\n                                                        /*                                                              */',
        },
      },
    },
  },
  {
    name: 'P2PKH (hardcoded signature)',
    transaction: (() => {
      const contract = new Contract(P2PKH, [alicePkh], { provider });

      const regularUtxo = randomUtxo();
      provider.addUtxo(contract.address, regularUtxo);

      const to = contract.tokenAddress;
      const amount = 1000n;

      const hardcodedSignature = new SignatureTemplate(alicePriv).generateSignature(hexToBin('c0ffee'));
      const tx = contract.functions
        .spend(alicePub, hardcodedSignature)
        .from(regularUtxo)
        .to(to, amount);

      return tx;
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
        'p2_pkh_parameters': {
          'description': 'Contract creation and function parameters',
          'name': 'p2_pkh_parameters',
          'scripts': [
            'p2_pkh_lock',
            'p2_pkh_unlock',
          ],
          'variables': {
            's': {
              'description': '"s" parameter of function "spend"',
              'name': 's',
              'type': 'WalletData',
            },
            'pk': {
              'description': '"pk" parameter of function "spend"',
              'name': 'pk',
              'type': 'WalletData',
            },
            'pkh': {
              'description': '"pkh" parameter of this contract',
              'name': 'pkh',
              'type': 'WalletData',
            },
          },
        },
      },
      'scenarios': {
        'p2_pkh_evaluate': {
          'name': 'p2_pkh_evaluate',
          'description': 'An example evaluation where this script execution passes.',
          'data': {
            'bytecode': {
              'pk': '0x0373cc07b54c22da627b572a387a20ea190c9382e5e6d48c1d5b89c5cea2c4c088',
              'pkh': '0x512dbb2c8c02efbac8d92431aa0ac33f6b0bf970',
              's': '0x65f72c5cce773383b45032a3f9f9255814e3d53ee260056e3232cd89e91a0a84278b35daf8938d47047e7d3bd3407fe90b07dfabf4407947af6fb09730a34c0b61',
            },
            'currentBlockHeight': 2,
            'currentBlockTime': expect.any(Number),
            'keys': {
              'privateKeys': {},
            },
          },
          'transaction': {
            'inputs': [
              {
                'outpointIndex': expect.any(Number),
                'outpointTransactionHash': expect.stringMatching(/^[0-9a-f]{64}$/),
                'sequenceNumber': 4294967294,
                'unlockingBytecode': [
                  'slot',
                ],
              },
            ],
            'locktime': 133700,
            'outputs': [
              {
                'lockingBytecode': {},
                'valueSatoshis': 1000,
              },
              {
                'lockingBytecode': {},
                'valueSatoshis': expect.any(Number),
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
      'scripts': {
        'p2_pkh_unlock': {
          'passes': [
            'p2_pkh_evaluate',
          ],
          'name': 'p2_pkh_unlock',
          'script': '// "spend" function parameters\n<s> // sig = <0x65f72c5cce773383b45032a3f9f9255814e3d53ee260056e3232cd89e91a0a84278b35daf8938d47047e7d3bd3407fe90b07dfabf4407947af6fb09730a34c0b61>\n<pk> // pubkey = <0x0373cc07b54c22da627b572a387a20ea190c9382e5e6d48c1d5b89c5cea2c4c088>\n',
          'unlocks': 'p2_pkh_lock',
        },
        'p2_pkh_lock': {
          'lockingType': 'p2sh32',
          'name': 'p2_pkh_lock',
          'script': '// "P2PKH" contract constructor parameters\n<pkh> // bytes20 = <0x512dbb2c8c02efbac8d92431aa0ac33f6b0bf970>\n\n// bytecode\n                                                        /* contract P2PKH(bytes20 pkh) {                                */\n                                                        /*     // Require pk to match stored pkh and signature to match */\n                                                        /*     function spend(pubkey pk, sig s) {                       */\nOP_1 OP_PICK OP_HASH160 OP_1 OP_ROLL OP_EQUAL OP_VERIFY /*         require(hash160(pk) == pkh);                         */\nOP_1 OP_ROLL OP_1 OP_ROLL OP_CHECKSIG                   /*         require(checkSig(s, pk));                            */\n                                                        /*     }                                                        */\n                                                        /* }                                                            */\n                                                        /*                                                              */',
        },
      },
    },
  },
  {
    name: 'P2PKH (sending NFTs)',
    transaction: (() => {
      const contract = new Contract(P2PKH, [alicePkh], { provider });

      const regularUtxo = randomUtxo();
      const nftUtxo = randomUtxo({ satoshis: 1000n, token: randomNFT() });
      provider.addUtxo(contract.address, regularUtxo);
      provider.addUtxo(contract.address, nftUtxo);

      const to = contract.tokenAddress;
      const amount = 1000n;

      const tx = contract.functions
        .spend(alicePub, new SignatureTemplate(alicePriv))
        .from(regularUtxo)
        .from(nftUtxo)
        .to(to, amount, nftUtxo.token);

      return tx;
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
        'p2_pkh_parameters': {
          'description': 'Contract creation and function parameters',
          'name': 'p2_pkh_parameters',
          'scripts': [
            'p2_pkh_lock',
            'p2_pkh_unlock',
          ],
          'variables': {
            's': {
              'description': '"s" parameter of function "spend"',
              'name': 's',
              'type': 'Key',
            },
            'pk': {
              'description': '"pk" parameter of function "spend"',
              'name': 'pk',
              'type': 'WalletData',
            },
            'pkh': {
              'description': '"pkh" parameter of this contract',
              'name': 'pkh',
              'type': 'WalletData',
            },
          },
        },
      },
      'scenarios': {
        'p2_pkh_evaluate': {
          'name': 'p2_pkh_evaluate',
          'description': 'An example evaluation where this script execution passes.',
          'data': {
            'bytecode': {
              'pk': '0x0373cc07b54c22da627b572a387a20ea190c9382e5e6d48c1d5b89c5cea2c4c088',
              'pkh': '0x512dbb2c8c02efbac8d92431aa0ac33f6b0bf970',
            },
            'currentBlockHeight': 2,
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
                'outpointTransactionHash': expect.stringMatching(/^[0-9a-f]{64}$/),
                'sequenceNumber': 4294967294,
                'unlockingBytecode': [
                  'slot',
                ],
              },
              {
                'outpointIndex': expect.any(Number),
                'outpointTransactionHash': expect.stringMatching(/^[0-9a-f]{64}$/),
                'sequenceNumber': 4294967294,
                'unlockingBytecode': {},
              },
            ],
            'locktime': 133700,
            'outputs': [
              {
                'lockingBytecode': {},
                'token': {
                  'amount': '0',
                  'category': expect.stringMatching(/^[0-9a-f]{64}$/),
                  'nft': {
                    'capability': 'none',
                    'commitment': expect.stringMatching(/^[0-9a-f]{8}$/),
                  },
                },
                'valueSatoshis': 1000,
              },
              {
                'lockingBytecode': {},
                'valueSatoshis': expect.any(Number),
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
              'lockingBytecode': {},
              'valueSatoshis': 1000,
              'token': {
                'amount': '0',
                'category': expect.stringMatching(/^[0-9a-f]{64}$/),
                'nft': {
                  'capability': 'none',
                  'commitment': expect.stringMatching(/^[0-9a-f]{8}$/),
                },
              },
            },
          ],
        },
      },
      'scripts': {
        'p2_pkh_unlock': {
          'passes': [
            'p2_pkh_evaluate',
          ],
          'name': 'p2_pkh_unlock',
          'script': '// "spend" function parameters\n<s.schnorr_signature.all_outputs_all_utxos> // sig\n<pk> // pubkey = <0x0373cc07b54c22da627b572a387a20ea190c9382e5e6d48c1d5b89c5cea2c4c088>\n',
          'unlocks': 'p2_pkh_lock',
        },
        'p2_pkh_lock': {
          'lockingType': 'p2sh32',
          'name': 'p2_pkh_lock',
          'script': '// "P2PKH" contract constructor parameters\n<pkh> // bytes20 = <0x512dbb2c8c02efbac8d92431aa0ac33f6b0bf970>\n\n// bytecode\n                                                        /* contract P2PKH(bytes20 pkh) {                                */\n                                                        /*     // Require pk to match stored pkh and signature to match */\n                                                        /*     function spend(pubkey pk, sig s) {                       */\nOP_1 OP_PICK OP_HASH160 OP_1 OP_ROLL OP_EQUAL OP_VERIFY /*         require(hash160(pk) == pkh);                         */\nOP_1 OP_ROLL OP_1 OP_ROLL OP_CHECKSIG                   /*         require(checkSig(s, pk));                            */\n                                                        /*     }                                                        */\n                                                        /* }                                                            */\n                                                        /*                                                              */',
        },
      },
    },
  },
  {
    name: 'HodlVault (datasig)',
    transaction: (() => {
      const contract = new Contract(HoldVault, [alicePub, oraclePub, 99000n, 30000n], { provider });
      provider.addUtxo(contract.address, randomUtxo());

      // given
      const message = oracle.createMessage(100000n, 30000n);
      const oracleSig = oracle.signMessage(message);
      const to = contract.address;
      const amount = 10000n;

      // when
      const tx = contract.functions
        .spend(new SignatureTemplate(alicePriv), oracleSig, message)
        .to(to, amount);

      return tx;
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
        'hodl_vault_parameters': {
          'description': 'Contract creation and function parameters',
          'name': 'hodl_vault_parameters',
          'scripts': [
            'hodl_vault_lock',
            'hodl_vault_unlock',
          ],
          'variables': {
            'oracle_message': {
              'description': '"oracleMessage" parameter of function "spend"',
              'name': 'oracleMessage',
              'type': 'WalletData',
            },
            'oracle_sig': {
              'description': '"oracleSig" parameter of function "spend"',
              'name': 'oracleSig',
              'type': 'WalletData',
            },
            'owner_sig': {
              'description': '"ownerSig" parameter of function "spend"',
              'name': 'ownerSig',
              'type': 'Key',
            },
            'price_target': {
              'description': '"priceTarget" parameter of this contract',
              'name': 'priceTarget',
              'type': 'WalletData',
            },
            'min_block': {
              'description': '"minBlock" parameter of this contract',
              'name': 'minBlock',
              'type': 'WalletData',
            },
            'oracle_pk': {
              'description': '"oraclePk" parameter of this contract',
              'name': 'oraclePk',
              'type': 'WalletData',
            },
            'owner_pk': {
              'description': '"ownerPk" parameter of this contract',
              'name': 'ownerPk',
              'type': 'WalletData',
            },
          },
        },
      },
      'scenarios': {
        'hodl_vault_evaluate': {
          'name': 'hodl_vault_evaluate',
          'description': 'An example evaluation where this script execution passes.',
          'data': {
            'bytecode': {
              'oracle_message': '0xa086010030750000',
              'oracle_sig': '0x569e137142ebdb96127b727787d605e427a858e8b17dc0605092d0019e5fc9d58810ee74c8ba9f9a5605268c9913e50f780f4c3780e06aea7f50766829895b4b',
              'price_target': '0x3075',
              'min_block': '0xb88201',
              'oracle_pk': '0x028f1219c918234d6bb06b4782354ff0759bd73036f3c849b88020c79fe013cd38',
              'owner_pk': '0x0373cc07b54c22da627b572a387a20ea190c9382e5e6d48c1d5b89c5cea2c4c088',
            },
            'currentBlockHeight': 2,
            'currentBlockTime': expect.any(Number),
            'keys': {
              'privateKeys': {
                'owner_sig': '36f8155c559f3a670586bbbf9fd52beef6f96124f5a3a39c167fc24b052d24d7',
              },
            },
          },
          'transaction': {
            'inputs': [
              {
                'outpointIndex': expect.any(Number),
                'outpointTransactionHash': expect.stringMatching(/^[0-9a-f]{64}$/),
                'sequenceNumber': 4294967294,
                'unlockingBytecode': [
                  'slot',
                ],
              },
            ],
            'locktime': 133700,
            'outputs': [
              {
                'lockingBytecode': {},
                'valueSatoshis': 10000,
              },
              {
                'lockingBytecode': {},
                'valueSatoshis': expect.any(Number),
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
      'scripts': {
        'hodl_vault_unlock': {
          'passes': [
            'hodl_vault_evaluate',
          ],
          'name': 'hodl_vault_unlock',
          'script': '// "spend" function parameters\n<oracle_message> // bytes8 = <0xa086010030750000>\n<oracle_sig> // datasig = <0x569e137142ebdb96127b727787d605e427a858e8b17dc0605092d0019e5fc9d58810ee74c8ba9f9a5605268c9913e50f780f4c3780e06aea7f50766829895b4b>\n<owner_sig.schnorr_signature.all_outputs_all_utxos> // sig\n',
          'unlocks': 'hodl_vault_lock',
        },
        'hodl_vault_lock': {
          'lockingType': 'p2sh32',
          'name': 'hodl_vault_lock',
          'script': '// "HodlVault" contract constructor parameters\n<price_target> // int = <0x3075>\n<min_block> // int = <0xb88201>\n<oracle_pk> // pubkey = <0x028f1219c918234d6bb06b4782354ff0759bd73036f3c849b88020c79fe013cd38>\n<owner_pk> // pubkey = <0x0373cc07b54c22da627b572a387a20ea190c9382e5e6d48c1d5b89c5cea2c4c088>\n\n// bytecode\n                                                                 /* // This contract forces HODLing until a certain price target has been reached                                          */\n                                                                 /* // A minimum block is provided to ensure that oracle price entries from before this block are disregarded              */\n                                                                 /* // i.e. when the BCH price was $1000 in the past, an oracle entry with the old block number and price can not be used. */\n                                                                 /* // Instead, a message with a block number and price from after the minBlock needs to be passed.                        */\n                                                                 /* // This contract serves as a simple example for checkDataSig-based contracts.                                          */\n                                                                 /* contract HodlVault(                                                                                                    */\n                                                                 /*     pubkey ownerPk,                                                                                                    */\n                                                                 /*     pubkey oraclePk,                                                                                                   */\n                                                                 /*     int minBlock,                                                                                                      */\n                                                                 /*     int priceTarget                                                                                                    */\n                                                                 /* ) {                                                                                                                    */\n                                                                 /*     function spend(sig ownerSig, datasig oracleSig, bytes8 oracleMessage) {                                            */\n                                                                 /*         // message: { blockHeight, price }                                                                             */\nOP_6 OP_PICK OP_4 OP_SPLIT                                       /*         bytes4 blockHeightBin, bytes4 priceBin = oracleMessage.split(4);                                               */\nOP_1 OP_ROLL OP_BIN2NUM                                          /*         int blockHeight = int(blockHeightBin);                                                                         */\nOP_1 OP_ROLL OP_BIN2NUM                                          /*         int price = int(priceBin);                                                                                     */\n                                                                 /*                                                                                                                        */\n                                                                 /*         // Check that blockHeight is after minBlock and not in the future                                              */\nOP_1 OP_PICK OP_5 OP_ROLL OP_GREATERTHANOREQUAL OP_VERIFY        /*         require(blockHeight >= minBlock);                                                                              */\nOP_1 OP_ROLL OP_CHECKLOCKTIMEVERIFY OP_DROP                      /*         require(tx.time >= blockHeight);                                                                               */\n                                                                 /*                                                                                                                        */\n                                                                 /*         // Check that current price is at least priceTarget                                                            */\nOP_0 OP_ROLL OP_3 OP_ROLL OP_GREATERTHANOREQUAL OP_VERIFY        /*         require(price >= priceTarget);                                                                                 */\n                                                                 /*                                                                                                                        */\n                                                                 /*         // Handle necessary signature checks                                                                           */\nOP_3 OP_ROLL OP_4 OP_ROLL OP_3 OP_ROLL OP_CHECKDATASIG OP_VERIFY /*         require(checkDataSig(oracleSig, oracleMessage, oraclePk));                                                     */\nOP_1 OP_ROLL OP_1 OP_ROLL OP_CHECKSIG                            /*         require(checkSig(ownerSig, ownerPk));                                                                          */\n                                                                 /*     }                                                                                                                  */\n                                                                 /* }                                                                                                                      */\n                                                                 /*                                                                                                                        */',
        },
      },
    },
  },
  // TODO: Make it work with different hashtypes and signature algorithms
  // {
  //   name: 'P2PKH (sending NFTs)',
  //   transaction: (() => {
  //     const contract = new Contract(P2PKH, [alicePkh], { provider });
  //     provider.addUtxo(contract.address, randomUtxo());

  //     const to = contract.address;
  //     const amount = 1000n;

  //     const hashtype = HashType.SIGHASH_SINGLE | HashType.SIGHASH_ANYONECANPAY;
  //     const signatureAlgorithm = SignatureAlgorithm.ECDSA;

  //     const tx = contract.functions
  //       .spend(alicePub, new SignatureTemplate(alicePriv, hashtype, signatureAlgorithm))
  //       .to(to, amount);

  //     return tx;
  //   })(),
  //   template: {} as any,
  // },
  {
    name: 'P2PKH (with P2PKH inputs & P2SH20 address type & ECDSA signature algorithm)',
    transaction: (() => {
      const contract = new Contract(P2PKH, [alicePkh], { provider, addressType: 'p2sh20' });

      const regularUtxo = randomUtxo();
      provider.addUtxo(contract.address, regularUtxo);

      const p2pkhUtxo = randomUtxo();
      provider.addUtxo(aliceAddress, p2pkhUtxo);

      const to = contract.tokenAddress;
      const amount = 1000n;

      const tx = contract.functions
        .spend(alicePub, new SignatureTemplate(alicePriv, HashType.SIGHASH_NONE, SignatureAlgorithm.ECDSA))
        .fromP2PKH(p2pkhUtxo, new SignatureTemplate(alicePriv))
        .from(regularUtxo)
        .fromP2PKH(p2pkhUtxo, new SignatureTemplate(bobPriv, HashType.SIGHASH_ALL, SignatureAlgorithm.ECDSA))
        .to(to, amount);

      return tx;
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
        'p2_pkh_parameters': {
          'description': 'Contract creation and function parameters',
          'name': 'p2_pkh_parameters',
          'scripts': [
            'p2_pkh_lock',
            'p2_pkh_unlock',
            'p2pkh_placeholder_lock_0',
            'p2pkh_placeholder_unlock_0',
            'p2pkh_placeholder_lock_2',
            'p2pkh_placeholder_unlock_2',
          ],
          'variables': {
            's': {
              'description': '"s" parameter of function "spend"',
              'name': 's',
              'type': 'Key',
            },
            'pk': {
              'description': '"pk" parameter of function "spend"',
              'name': 'pk',
              'type': 'WalletData',
            },
            'pkh': {
              'description': '"pkh" parameter of this contract',
              'name': 'pkh',
              'type': 'WalletData',
            },
            'placeholder_key_0': {
              'description': 'placeholder_key_0',
              'name': 'placeholder_key_0',
              'type': 'Key',
            },
            'placeholder_key_2': {
              'description': 'placeholder_key_2',
              'name': 'placeholder_key_2',
              'type': 'Key',
            },
          },
        },
      },
      'scenarios': {
        'p2_pkh_evaluate': {
          'name': 'p2_pkh_evaluate',
          'description': 'An example evaluation where this script execution passes.',
          'data': {
            'bytecode': {
              'pk': '0x0373cc07b54c22da627b572a387a20ea190c9382e5e6d48c1d5b89c5cea2c4c088',
              'pkh': '0x512dbb2c8c02efbac8d92431aa0ac33f6b0bf970',
            },
            'currentBlockHeight': 2,
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
                'outpointTransactionHash': expect.stringMatching(/^[0-9a-f]{64}$/),
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
                'outpointTransactionHash': expect.stringMatching(/^[0-9a-f]{64}$/),
                'sequenceNumber': 4294967294,
                'unlockingBytecode': [
                  'slot',
                ],
              },
              {
                'outpointIndex': expect.any(Number),
                'outpointTransactionHash': expect.stringMatching(/^[0-9a-f]{64}$/),
                'sequenceNumber': 4294967294,
                'unlockingBytecode': {
                  'script': 'p2pkh_placeholder_unlock_2',
                  'overrides': {
                    'keys': {
                      'privateKeys': {
                        'placeholder_key_2': '71080d8b52ec7b12adaec909ed54cd989b682ce2c35647eec219a16f5f90c528',
                      },
                    },
                  },
                },
              },
            ],
            'locktime': 133700,
            'outputs': [
              {
                'lockingBytecode': {},
                'valueSatoshis': 1000,
              },
              {
                'lockingBytecode': {},
                'valueSatoshis': expect.any(Number),
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
              'lockingBytecode': [
                'slot',
              ],
              'valueSatoshis': expect.any(Number),
            },
            {
              'lockingBytecode': {
                'script': 'p2pkh_placeholder_lock_2',
                'overrides': {
                  'keys': {
                    'privateKeys': {
                      'placeholder_key_2': '71080d8b52ec7b12adaec909ed54cd989b682ce2c35647eec219a16f5f90c528',
                    },
                  },
                },
              },
              'valueSatoshis': expect.any(Number),
            },
          ],
        },
      },
      'scripts': {
        'p2_pkh_unlock': {
          'passes': [
            'p2_pkh_evaluate',
          ],
          'name': 'p2_pkh_unlock',
          'script': '// "spend" function parameters\n<s.ecdsa_signature.no_outputs> // sig\n<pk> // pubkey = <0x0373cc07b54c22da627b572a387a20ea190c9382e5e6d48c1d5b89c5cea2c4c088>\n',
          'unlocks': 'p2_pkh_lock',
        },
        'p2_pkh_lock': {
          'lockingType': 'p2sh20',
          'name': 'p2_pkh_lock',
          'script': '// "P2PKH" contract constructor parameters\n<pkh> // bytes20 = <0x512dbb2c8c02efbac8d92431aa0ac33f6b0bf970>\n\n// bytecode\n                                                        /* contract P2PKH(bytes20 pkh) {                                */\n                                                        /*     // Require pk to match stored pkh and signature to match */\n                                                        /*     function spend(pubkey pk, sig s) {                       */\nOP_1 OP_PICK OP_HASH160 OP_1 OP_ROLL OP_EQUAL OP_VERIFY /*         require(hash160(pk) == pkh);                         */\nOP_1 OP_ROLL OP_1 OP_ROLL OP_CHECKSIG                   /*         require(checkSig(s, pk));                            */\n                                                        /*     }                                                        */\n                                                        /* }                                                            */\n                                                        /*                                                              */',
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
        'p2pkh_placeholder_unlock_2': {
          'name': 'p2pkh_placeholder_unlock_2',
          'script': '<placeholder_key_2.ecdsa_signature.all_outputs>\n<placeholder_key_2.public_key>',
          'unlocks': 'p2pkh_placeholder_lock_2',
        },
        'p2pkh_placeholder_lock_2': {
          'lockingType': 'standard',
          'name': 'p2pkh_placeholder_lock_2',
          'script': 'OP_DUP\nOP_HASH160 <$(<placeholder_key_2.public_key> OP_HASH160\n)> OP_EQUALVERIFY\nOP_CHECKSIG',
        },
      },
    },
  },
];
