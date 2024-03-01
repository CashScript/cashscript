import { Contract, MockNetworkProvider, SignatureTemplate, Transaction, randomNFT, randomToken, randomUtxo } from '../../../src/index.js';
import TransferWithTimeout from '../transfer_with_timeout.json' assert { type: 'json' };
import Mecenas from '../mecenas.json' assert { type: 'json' };
import P2PKH from '../p2pkh.json' assert { type: 'json' };
import { aliceAddress, alicePkh, alicePriv, alicePub, bobPkh, bobPriv, bobPub } from '../vars.js';
import { WalletTemplate } from '@bitauth/libauth';

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
      'name': 'TransferWithTimeout',
      'supported': [
        'BCH_SPEC',
      ],
      'version': 0,
      'entities': {
        'parameters': {
          'description': 'Contract creation and function parameters',
          'name': 'parameters',
          'scripts': [
            'lock',
            'unlock_lock',
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
        'evaluate_function': {
          'name': 'Evaluate',
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
        'unlock_lock': {
          'passes': [
            'evaluate_function',
          ],
          'name': 'unlock',
          'script': '// "transfer" function parameters\n<recipient_sig.schnorr_signature.all_outputs> // sig\n\n// function index in contract\n<function_index> // int = <0>\n',
          'unlocks': 'lock',
        },
        'lock': {
          'lockingType': 'p2sh20',
          'name': 'lock',
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
      'name': 'TransferWithTimeout',
      'supported': [
        'BCH_SPEC',
      ],
      'version': 0,
      'entities': {
        'parameters': {
          'description': 'Contract creation and function parameters',
          'name': 'parameters',
          'scripts': [
            'lock',
            'unlock_lock',
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
        'evaluate_function': {
          'name': 'Evaluate',
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
        'unlock_lock': {
          'passes': [
            'evaluate_function',
          ],
          'name': 'unlock',
          'script': '// "timeout\" function parameters\n<sender_sig.schnorr_signature.all_outputs> // sig\n\n// function index in contract\n<function_index> // int = <1>\n',
          'unlocks': 'lock',
        },
        'lock': {
          'lockingType': 'p2sh20',
          'name': 'lock',
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
      'name': 'Mecenas',
      'supported': [
        'BCH_SPEC',
      ],
      'version': 0,
      'entities': {
        'parameters': {
          'description': 'Contract creation and function parameters',
          'name': 'parameters',
          'scripts': [
            'lock',
            'unlock_lock',
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
        'evaluate_function': {
          'name': 'Evaluate',
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
        'unlock_lock': {
          'passes': [
            'evaluate_function',
          ],
          'name': 'unlock',
          'script': '// "receive" function parameters\n// none\n\n// function index in contract\n<function_index> // int = <0>\n',
          'unlocks': 'lock',
        },
        'lock': {
          'lockingType': 'p2sh20',
          'name': 'lock',
          'script': "// \"Mecenas\" contract constructor parameters\n<pledge> // int = <0x1027>\n<funder> // bytes20 = <0xb40a2013337edb0dfe307f0a57d5dec5bfe60dd0>\n<recipient> // bytes20 = <0x512dbb2c8c02efbac8d92431aa0ac33f6b0bf970>\n\n// bytecode\n                                                                                         /* pragma cashscript >=0.8.0;                                                                                         */\n                                                                                         /*                                                                                                                    */\n                                                                                         /* /* This is an unofficial CashScript port of Licho's Mecenas contract. It is                                        */\n                                                                                         /*  * not compatible with Licho's EC plugin, but rather meant as a demonstration                                      */\n                                                                                         /*  * of covenants in CashScript.                                                                                     */\n                                                                                         /*  * The time checking has been removed so it can be tested without time requirements.                               */\n                                                                                         /*  */                                                                                                                */\n                                                                                         /* contract Mecenas(bytes20 recipient, bytes20 funder, int pledge/*, int period */) {                                 */\nOP_3 OP_PICK OP_0 OP_NUMEQUAL OP_IF                                                      /*     function receive() {                                                                                           */\n                                                                                         /*         // require(tx.age >= period);                                                                              */\n                                                                                         /*                                                                                                                    */\n                                                                                         /*         // Check that the first output sends to the recipient                                                      */\nOP_0 OP_OUTPUTBYTECODE <0x76a914> OP_2 OP_ROLL OP_CAT <0x88ac> OP_CAT OP_EQUAL OP_VERIFY /*         require(tx.outputs[0].lockingBytecode == new LockingBytecodeP2PKH(recipient));                             */\n                                                                                         /*                                                                                                                    */\n<0xe803>                                                                                 /*         int minerFee = 1000;                                                                                       */\nOP_INPUTINDEX OP_UTXOVALUE                                                               /*         int currentValue = tx.inputs[this.activeInputIndex].value;                                                 */\nOP_0 OP_PICK OP_4 OP_PICK OP_SUB OP_2 OP_PICK OP_SUB                                     /*         int changeValue = currentValue - pledge - minerFee;                                                        */\n                                                                                         /*                                                                                                                    */\n                                                                                         /*         // If there is not enough left for *another* pledge after this one, we send the remainder to the recipient */\n                                                                                         /*         // Otherwise we send the remainder to the recipient and the change back to the contract                    */\nOP_0 OP_PICK OP_5 OP_PICK OP_4 OP_PICK OP_ADD OP_LESSTHANOREQUAL OP_IF                   /*         if (changeValue <= pledge + minerFee) {                                                                    */\nOP_0 OP_OUTPUTVALUE OP_2 OP_PICK OP_4 OP_PICK OP_SUB OP_NUMEQUAL OP_VERIFY               /*             require(tx.outputs[0].value == currentValue - minerFee);                                               */\n                                                                                         /*         } else {                                                                                                   */\nOP_0 OP_OUTPUTVALUE OP_5 OP_PICK OP_NUMEQUAL OP_VERIFY                                   /*             require(tx.outputs[0].value == pledge);                                                                */\nOP_1 OP_OUTPUTBYTECODE OP_INPUTINDEX OP_UTXOBYTECODE OP_EQUAL OP_VERIFY                  /*             require(tx.outputs[1].lockingBytecode == tx.inputs[this.activeInputIndex].lockingBytecode);            */\nOP_1 OP_OUTPUTVALUE OP_1 OP_PICK OP_NUMEQUAL OP_VERIFY                                   /*             require(tx.outputs[1].value == changeValue);                                                           */\nOP_ELSE OP_ENDIF                                                                         /*         }                                                                                                          */\nOP_1 OP_NIP OP_NIP OP_NIP OP_NIP OP_NIP OP_NIP OP_ELSE                                   /*     }                                                                                                              */\n                                                                                         /*                                                                                                                    */\nOP_3 OP_ROLL OP_1 OP_NUMEQUAL OP_VERIFY                                                  /*     function reclaim(pubkey pk, sig s) {                                                                           */\nOP_3 OP_PICK OP_HASH160 OP_2 OP_ROLL OP_EQUAL OP_VERIFY                                  /*         require(hash160(pk) == funder);                                                                            */\nOP_3 OP_ROLL OP_3 OP_ROLL OP_CHECKSIG                                                    /*         require(checkSig(s, pk));                                                                                  */\nOP_NIP OP_NIP                                                                            /*     }                                                                                                              */\nOP_ENDIF                                                                                 /* }                                                                                                                  */\n                                                                                         /*                                                                                                                    */",
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
      'name': 'P2PKH',
      'supported': [
        'BCH_SPEC',
      ],
      'version': 0,
      'entities': {
        'parameters': {
          'description': 'Contract creation and function parameters',
          'name': 'parameters',
          'scripts': [
            'lock',
            'unlock_lock',
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
            'function_index': {
              'description': 'Script function index to execute',
              'name': 'function_index',
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
        'evaluate_function': {
          'name': 'Evaluate',
          'description': 'An example evaluation where this script execution passes.',
          'data': {
            'bytecode': {
              'pk': '0x0373cc07b54c22da627b572a387a20ea190c9382e5e6d48c1d5b89c5cea2c4c088',
              'function_index': '0',
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
        'unlock_lock': {
          'passes': [
            'evaluate_function',
          ],
          'name': 'unlock',
          'script': '// "spend" function parameters\n<s.schnorr_signature.all_outputs> // sig\n<pk> // pubkey = <0x0373cc07b54c22da627b572a387a20ea190c9382e5e6d48c1d5b89c5cea2c4c088>\n',
          'unlocks': 'lock',
        },
        'lock': {
          'lockingType': 'p2sh20',
          'name': 'lock',
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
      'name': 'P2PKH',
      'supported': [
        'BCH_SPEC',
      ],
      'version': 0,
      'entities': {
        'parameters': {
          'description': 'Contract creation and function parameters',
          'name': 'parameters',
          'scripts': [
            'lock',
            'unlock_lock',
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
            'function_index': {
              'description': 'Script function index to execute',
              'name': 'function_index',
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
        'evaluate_function': {
          'name': 'Evaluate',
          'description': 'An example evaluation where this script execution passes.',
          'data': {
            'bytecode': {
              'pk': '0x0373cc07b54c22da627b572a387a20ea190c9382e5e6d48c1d5b89c5cea2c4c088',
              'function_index': '0',
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
        'unlock_lock': {
          'passes': [
            'evaluate_function',
          ],
          'name': 'unlock',
          'script': '// "spend" function parameters\n<s.schnorr_signature.all_outputs> // sig\n<pk> // pubkey = <0x0373cc07b54c22da627b572a387a20ea190c9382e5e6d48c1d5b89c5cea2c4c088>\n',
          'unlocks': 'lock',
        },
        'lock': {
          'lockingType': 'p2sh20',
          'name': 'lock',
          'script': '// "P2PKH" contract constructor parameters\n<pkh> // bytes20 = <0x512dbb2c8c02efbac8d92431aa0ac33f6b0bf970>\n\n// bytecode\n                                                        /* contract P2PKH(bytes20 pkh) {                                */\n                                                        /*     // Require pk to match stored pkh and signature to match */\n                                                        /*     function spend(pubkey pk, sig s) {                       */\nOP_1 OP_PICK OP_HASH160 OP_1 OP_ROLL OP_EQUAL OP_VERIFY /*         require(hash160(pk) == pkh);                         */\nOP_1 OP_ROLL OP_1 OP_ROLL OP_CHECKSIG                   /*         require(checkSig(s, pk));                            */\n                                                        /*     }                                                        */\n                                                        /* }                                                            */\n                                                        /*                                                              */',
        },
      },
    },
  },
  // TODO: Add fixture with datasig arguments
  // TODO: Add fixture with different signing types (other than all_outputs)
];
