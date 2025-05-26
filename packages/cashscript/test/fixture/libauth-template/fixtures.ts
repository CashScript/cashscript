import { Contract, HashType, MockNetworkProvider, SignatureAlgorithm, SignatureTemplate, TransactionBuilder, randomNFT, randomToken, randomUtxo } from '../../../src/index.js';
import TransferWithTimeout from '../transfer_with_timeout.artifact.js';
import Mecenas from '../mecenas.artifact.js';
import P2PKH from '../p2pkh.artifact.js';
import HoldVault from '../hodl_vault.artifact.js';
import { aliceAddress, alicePkh, alicePriv, alicePub, bobPkh, bobPriv, bobPub, oracle, oraclePub } from '../vars.js';
import { WalletTemplate, hexToBin } from '@bitauth/libauth';

const provider = new MockNetworkProvider();

export interface Fixture {
  name: string;
  transaction: TransactionBuilder;
  template: WalletTemplate;
}

export const fixtures: Fixture[] = [
  {
    name: 'TransferWithTimeout (transfer function)',
    transaction: (() => {
      const contract = new Contract(TransferWithTimeout, [alicePub, bobPub, 100000n], { provider });
      const contractUtxo = randomUtxo();
      provider.addUtxo(contract.address, contractUtxo);

      const tx = new TransactionBuilder({ provider })
        .addInput(contractUtxo, contract.unlock.transfer(new SignatureTemplate(bobPriv)))
        .addOutput({ to: contract.address, amount: 10000n });

      return tx;
    })(),
    template: {
      '$schema': 'https://ide.bitauth.com/authentication-template-v0.schema.json',
      'description': 'Imported from cashscript',
      'name': 'CashScript Generated Debugging Template',
      'supported': [
        'BCH_2025_05',
      ],
      'version': 0,
      'entities': {
        'TransferWithTimeout_input0_parameters': {
          'description': 'Contract creation and function parameters',
          'name': 'TransferWithTimeout (input #0)',
          'scripts': [
            'TransferWithTimeout_3f567c4556a3b1fe2d6dd250ee07a939c54f22ce4cb87fb0581800063eaca0b1_lock',
            'TransferWithTimeout_transfer_input0_unlock',
          ],
          'variables': {
            'recipientSig': {
              'description': '"recipientSig" parameter of function "transfer"',
              'name': 'recipientSig',
              'type': 'Key',
            },
            'sender': {
              'description': '"sender" parameter of this contract',
              'name': 'sender',
              'type': 'WalletData',
            },
            'recipient': {
              'description': '"recipient" parameter of this contract',
              'name': 'recipient',
              'type': 'WalletData',
            },
            'timeout': {
              'description': '"timeout" parameter of this contract',
              'name': 'timeout',
              'type': 'WalletData',
            },
            'function_index': {
              'description': 'Script function index to execute',
              'name': 'function_index',
              'type': 'WalletData',
            },
          },
        },
      },
      'scripts': {
        'TransferWithTimeout_transfer_input0_unlock': {
          'passes': [
            'TransferWithTimeout_transfer_input0_evaluate',
          ],
          'name': 'transfer (input #0)',
          'script': '// "transfer" function parameters\n<recipientSig.schnorr_signature.all_outputs_all_utxos> // sig\n\n// function index in contract\n<function_index> // int = <0>\n',
          'unlocks': 'TransferWithTimeout_3f567c4556a3b1fe2d6dd250ee07a939c54f22ce4cb87fb0581800063eaca0b1_lock',
        },
        'TransferWithTimeout_3f567c4556a3b1fe2d6dd250ee07a939c54f22ce4cb87fb0581800063eaca0b1_lock': {
          'lockingType': 'p2sh32',
          'name': 'TransferWithTimeout',
          'script': "// \"TransferWithTimeout\" contract constructor parameters\n<timeout> // int = <0xa08601>\n<recipient> // pubkey = <0x028f1219c918234d6bb06b4782354ff0759bd73036f3c849b88020c79fe013cd38>\n<sender> // pubkey = <0x0373cc07b54c22da627b572a387a20ea190c9382e5e6d48c1d5b89c5cea2c4c088>\n\n// bytecode\n                                       /* contract TransferWithTimeout(                                             */\n                                       /*     pubkey sender,                                                        */\n                                       /*     pubkey recipient,                                                     */\n                                       /*     int timeout                                                           */\n                                       /* ) {                                                                       */\n                                       /*     // Require recipient's signature to match                             */\nOP_3 OP_PICK OP_0 OP_NUMEQUAL OP_IF    /*     function transfer(sig recipientSig) {                                 */\nOP_4 OP_ROLL OP_ROT OP_CHECKSIG        /*         require(checkSig(recipientSig, recipient));                       */\nOP_NIP OP_NIP OP_NIP OP_ELSE           /*     }                                                                     */\n                                       /*                                                                           */\n                                       /*     // Require timeout time to be reached and sender's signature to match */\nOP_3 OP_ROLL OP_1 OP_NUMEQUALVERIFY    /*     function timeout(sig senderSig) {                                     */\nOP_3 OP_ROLL OP_SWAP OP_CHECKSIGVERIFY /*         require(checkSig(senderSig, sender));                             */\nOP_SWAP OP_CHECKLOCKTIMEVERIFY         /*         require(tx.time >= timeout);                                      */\nOP_2DROP OP_1                          /*     }                                                                     */\nOP_ENDIF                               /* }                                                                         */\n                                       /*                                                                           */",
        },
      },
      'scenarios': {
        'TransferWithTimeout_transfer_input0_evaluate': {
          'name': 'Evaluate TransferWithTimeout transfer (input #0)',
          'description': 'An example evaluation where this script execution passes.',
          'data': {
            'bytecode': {
              'sender': '0x0373cc07b54c22da627b572a387a20ea190c9382e5e6d48c1d5b89c5cea2c4c088',
              'recipient': '0x028f1219c918234d6bb06b4782354ff0759bd73036f3c849b88020c79fe013cd38',
              'timeout': '0xa08601',
              'function_index': '0',
            },
            'currentBlockHeight': expect.any(Number),
            'currentBlockTime': expect.any(Number),
            'keys': {
              'privateKeys': {
                'recipientSig': '71080d8b52ec7b12adaec909ed54cd989b682ce2c35647eec219a16f5f90c528',
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
                'lockingBytecode': {
                  'script': 'TransferWithTimeout_3f567c4556a3b1fe2d6dd250ee07a939c54f22ce4cb87fb0581800063eaca0b1_lock',
                  'overrides': {
                    'bytecode': {
                      'sender': '0x0373cc07b54c22da627b572a387a20ea190c9382e5e6d48c1d5b89c5cea2c4c088',
                      'recipient': '0x028f1219c918234d6bb06b4782354ff0759bd73036f3c849b88020c79fe013cd38',
                      'timeout': '0xa08601',
                    },
                  },
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
    name: 'TransferWithTimeout (timeout function)',
    transaction: (() => {
      const contract = new Contract(TransferWithTimeout, [alicePub, bobPub, 100000n], { provider });
      const contractUtxo = randomUtxo();
      provider.addUtxo(contract.address, contractUtxo);

      const tx = new TransactionBuilder({ provider })
        .addInput(contractUtxo, contract.unlock.timeout(new SignatureTemplate(alicePriv)))
        .addOutput({ to: contract.address, amount: 10000n })
        .setLocktime(133700);

      return tx;
    })(),
    template: {
      '$schema': 'https://ide.bitauth.com/authentication-template-v0.schema.json',
      'description': 'Imported from cashscript',
      'name': 'CashScript Generated Debugging Template',
      'supported': [
        'BCH_2025_05',
      ],
      'version': 0,
      'entities': {
        'TransferWithTimeout_input0_parameters': {
          'description': 'Contract creation and function parameters',
          'name': 'TransferWithTimeout (input #0)',
          'scripts': [
            'TransferWithTimeout_3f567c4556a3b1fe2d6dd250ee07a939c54f22ce4cb87fb0581800063eaca0b1_lock',
            'TransferWithTimeout_timeout_input0_unlock',
          ],
          'variables': {
            'senderSig': {
              'description': '"senderSig" parameter of function "timeout"',
              'name': 'senderSig',
              'type': 'Key',
            },
            'sender': {
              'description': '"sender" parameter of this contract',
              'name': 'sender',
              'type': 'WalletData',
            },
            'recipient': {
              'description': '"recipient" parameter of this contract',
              'name': 'recipient',
              'type': 'WalletData',
            },
            'timeout': {
              'description': '"timeout" parameter of this contract',
              'name': 'timeout',
              'type': 'WalletData',
            },
            'function_index': {
              'description': 'Script function index to execute',
              'name': 'function_index',
              'type': 'WalletData',
            },
          },
        },
      },
      'scripts': {
        'TransferWithTimeout_timeout_input0_unlock': {
          'passes': [
            'TransferWithTimeout_timeout_input0_evaluate',
          ],
          'name': 'timeout (input #0)',
          'script': '// "timeout" function parameters\n<senderSig.schnorr_signature.all_outputs_all_utxos> // sig\n\n// function index in contract\n<function_index> // int = <1>\n',
          'unlocks': 'TransferWithTimeout_3f567c4556a3b1fe2d6dd250ee07a939c54f22ce4cb87fb0581800063eaca0b1_lock',
        },
        'TransferWithTimeout_3f567c4556a3b1fe2d6dd250ee07a939c54f22ce4cb87fb0581800063eaca0b1_lock': {
          'lockingType': 'p2sh32',
          'name': 'TransferWithTimeout',
          'script': "// \"TransferWithTimeout\" contract constructor parameters\n<timeout> // int = <0xa08601>\n<recipient> // pubkey = <0x028f1219c918234d6bb06b4782354ff0759bd73036f3c849b88020c79fe013cd38>\n<sender> // pubkey = <0x0373cc07b54c22da627b572a387a20ea190c9382e5e6d48c1d5b89c5cea2c4c088>\n\n// bytecode\n                                       /* contract TransferWithTimeout(                                             */\n                                       /*     pubkey sender,                                                        */\n                                       /*     pubkey recipient,                                                     */\n                                       /*     int timeout                                                           */\n                                       /* ) {                                                                       */\n                                       /*     // Require recipient's signature to match                             */\nOP_3 OP_PICK OP_0 OP_NUMEQUAL OP_IF    /*     function transfer(sig recipientSig) {                                 */\nOP_4 OP_ROLL OP_ROT OP_CHECKSIG        /*         require(checkSig(recipientSig, recipient));                       */\nOP_NIP OP_NIP OP_NIP OP_ELSE           /*     }                                                                     */\n                                       /*                                                                           */\n                                       /*     // Require timeout time to be reached and sender's signature to match */\nOP_3 OP_ROLL OP_1 OP_NUMEQUALVERIFY    /*     function timeout(sig senderSig) {                                     */\nOP_3 OP_ROLL OP_SWAP OP_CHECKSIGVERIFY /*         require(checkSig(senderSig, sender));                             */\nOP_SWAP OP_CHECKLOCKTIMEVERIFY         /*         require(tx.time >= timeout);                                      */\nOP_2DROP OP_1                          /*     }                                                                     */\nOP_ENDIF                               /* }                                                                         */\n                                       /*                                                                           */",
        },
      },
      'scenarios': {
        'TransferWithTimeout_timeout_input0_evaluate': {
          'name': 'Evaluate TransferWithTimeout timeout (input #0)',
          'description': 'An example evaluation where this script execution passes.',
          'data': {
            'bytecode': {
              'sender': '0x0373cc07b54c22da627b572a387a20ea190c9382e5e6d48c1d5b89c5cea2c4c088',
              'recipient': '0x028f1219c918234d6bb06b4782354ff0759bd73036f3c849b88020c79fe013cd38',
              'timeout': '0xa08601',
              'function_index': '1',
            },
            'currentBlockHeight': expect.any(Number),
            'currentBlockTime': expect.any(Number),
            'keys': {
              'privateKeys': {
                'senderSig': '36f8155c559f3a670586bbbf9fd52beef6f96124f5a3a39c167fc24b052d24d7',
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
                'lockingBytecode': {
                  'script': 'TransferWithTimeout_3f567c4556a3b1fe2d6dd250ee07a939c54f22ce4cb87fb0581800063eaca0b1_lock',
                  'overrides': {
                    'bytecode': {
                      'sender': '0x0373cc07b54c22da627b572a387a20ea190c9382e5e6d48c1d5b89c5cea2c4c088',
                      'recipient': '0x028f1219c918234d6bb06b4782354ff0759bd73036f3c849b88020c79fe013cd38',
                      'timeout': '0xa08601',
                    },
                  },
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
    name: 'Mecenas',
    transaction: (() => {
      const contract = new Contract(Mecenas, [alicePkh, bobPkh, 10_000n], { provider });
      const contractUtxo = randomUtxo();
      provider.addUtxo(contract.address, contractUtxo);

      const hardcodedFee = 1000n;
      const changeAmount = contractUtxo.satoshis - 10_000n - hardcodedFee;

      const tx = new TransactionBuilder({ provider })
        .addInput(contractUtxo, contract.unlock.receive())
        .addOutput({ to: aliceAddress, amount: 10_000n })
        .addOutput({ to: contract.address, amount: changeAmount })
        .setLocktime(133700);

      return tx;
    })(),
    template: {
      '$schema': 'https://ide.bitauth.com/authentication-template-v0.schema.json',
      'description': 'Imported from cashscript',
      'name': 'CashScript Generated Debugging Template',
      'supported': [
        'BCH_2025_05',
      ],
      'version': 0,
      'entities': {
        'Mecenas_input0_parameters': {
          'description': 'Contract creation and function parameters',
          'name': 'Mecenas (input #0)',
          'scripts': [
            'Mecenas_9c6c87b192226fa02ed3834607a94a6ea040acc59df983c49a648406c695816b_lock',
            'Mecenas_receive_input0_unlock',
          ],
          'variables': {
            'recipient': {
              'description': '"recipient" parameter of this contract',
              'name': 'recipient',
              'type': 'WalletData',
            },
            'funder': {
              'description': '"funder" parameter of this contract',
              'name': 'funder',
              'type': 'WalletData',
            },
            'pledge': {
              'description': '"pledge" parameter of this contract',
              'name': 'pledge',
              'type': 'WalletData',
            },
            'function_index': {
              'description': 'Script function index to execute',
              'name': 'function_index',
              'type': 'WalletData',
            },
          },
        },
      },
      'scripts': {
        'Mecenas_receive_input0_unlock': {
          'passes': [
            'Mecenas_receive_input0_evaluate',
          ],
          'name': 'receive (input #0)',
          'script': '// "receive" function parameters\n// none\n\n// function index in contract\n<function_index> // int = <0>\n',
          'unlocks': 'Mecenas_9c6c87b192226fa02ed3834607a94a6ea040acc59df983c49a648406c695816b_lock',
        },
        'Mecenas_9c6c87b192226fa02ed3834607a94a6ea040acc59df983c49a648406c695816b_lock': {
          'lockingType': 'p2sh32',
          'name': 'Mecenas',
          'script': "// \"Mecenas\" contract constructor parameters\n<pledge> // int = <0x1027>\n<funder> // bytes20 = <0xb40a2013337edb0dfe307f0a57d5dec5bfe60dd0>\n<recipient> // bytes20 = <0x512dbb2c8c02efbac8d92431aa0ac33f6b0bf970>\n\n// bytecode\n                                                                               /* pragma cashscript >=0.8.0;                                                                                         */\n                                                                               /*                                                                                                                    */\n                                                                               /* \\/* This is an unofficial CashScript port of Licho's Mecenas contract. It is                                       */\n                                                                               /*  * not compatible with Licho's EC plugin, but rather meant as a demonstration                                      */\n                                                                               /*  * of covenants in CashScript.                                                                                     */\n                                                                               /*  * The time checking has been removed so it can be tested without time requirements.                               */\n                                                                               /*  *\\/                                                                                                               */\n                                                                               /* contract Mecenas(bytes20 recipient, bytes20 funder, int pledge\\/*, int period *\\/) {                               */\nOP_3 OP_PICK OP_0 OP_NUMEQUAL OP_IF                                            /*     function receive() {                                                                                           */\n                                                                               /*         // require(this.age >= period);                                                                            */\n                                                                               /*                                                                                                                    */\n                                                                               /*         // Check that the first output sends to the recipient                                                      */\nOP_0 OP_OUTPUTBYTECODE <0x76a914> OP_ROT OP_CAT <0x88ac> OP_CAT OP_EQUALVERIFY /*         require(tx.outputs[0].lockingBytecode == new LockingBytecodeP2PKH(recipient));                             */\n                                                                               /*                                                                                                                    */\n<0xe803>                                                                       /*         int minerFee = 1000;                                                                                       */\nOP_INPUTINDEX OP_UTXOVALUE                                                     /*         int currentValue = tx.inputs[this.activeInputIndex].value;                                                 */\nOP_DUP OP_4 OP_PICK OP_SUB OP_2 OP_PICK OP_SUB                                 /*         int changeValue = currentValue - pledge - minerFee;                                                        */\n                                                                               /*                                                                                                                    */\n                                                                               /*         // If there is not enough left for *another* pledge after this one, we send the remainder to the recipient */\n                                                                               /*         // Otherwise we send the remainder to the recipient and the change back to the contract                    */\nOP_DUP OP_5 OP_PICK OP_4 OP_PICK OP_ADD OP_LESSTHANOREQUAL OP_IF               /*         if (changeValue <= pledge + minerFee) {                                                                    */\nOP_0 OP_OUTPUTVALUE OP_2OVER OP_SWAP OP_SUB OP_NUMEQUALVERIFY                  /*             require(tx.outputs[0].value == currentValue - minerFee);                                               */\nOP_ELSE                                                                        /*         } else {                                                                                                   */\nOP_0 OP_OUTPUTVALUE OP_5 OP_PICK OP_NUMEQUALVERIFY                             /*             require(tx.outputs[0].value == pledge);                                                                */\nOP_1 OP_OUTPUTBYTECODE OP_INPUTINDEX OP_UTXOBYTECODE OP_EQUALVERIFY            /*             require(tx.outputs[1].lockingBytecode == tx.inputs[this.activeInputIndex].lockingBytecode);            */\nOP_1 OP_OUTPUTVALUE OP_OVER OP_NUMEQUALVERIFY                                  /*             require(tx.outputs[1].value == changeValue);                                                           */\nOP_ENDIF                                                                       /*         }                                                                                                          */\nOP_2DROP OP_2DROP OP_2DROP OP_1 OP_ELSE                                        /*     }                                                                                                              */\n                                                                               /*                                                                                                                    */\nOP_3 OP_ROLL OP_1 OP_NUMEQUALVERIFY                                            /*     function reclaim(pubkey pk, sig s) {                                                                           */\nOP_3 OP_PICK OP_HASH160 OP_ROT OP_EQUALVERIFY                                  /*         require(hash160(pk) == funder);                                                                            */\nOP_2SWAP OP_CHECKSIG                                                           /*         require(checkSig(s, pk));                                                                                  */\nOP_NIP OP_NIP                                                                  /*     }                                                                                                              */\nOP_ENDIF                                                                       /* }                                                                                                                  */\n                                                                               /*                                                                                                                    */",
        },
      },
      'scenarios': {
        'Mecenas_receive_input0_evaluate': {
          'name': 'Evaluate Mecenas receive (input #0)',
          'description': 'An example evaluation where this script execution passes.',
          'data': {
            'bytecode': {
              'recipient': '0x512dbb2c8c02efbac8d92431aa0ac33f6b0bf970',
              'funder': '0xb40a2013337edb0dfe307f0a57d5dec5bfe60dd0',
              'pledge': '0x1027',
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
                'lockingBytecode': {
                  'script': 'Mecenas_9c6c87b192226fa02ed3834607a94a6ea040acc59df983c49a648406c695816b_lock',
                  'overrides': {
                    'bytecode': {
                      'recipient': '0x512dbb2c8c02efbac8d92431aa0ac33f6b0bf970',
                      'funder': '0xb40a2013337edb0dfe307f0a57d5dec5bfe60dd0',
                      'pledge': '0x1027',
                    },
                  },
                },
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

      const tx = new TransactionBuilder({ provider })
        .addInputs([regularUtxo, tokenUtxo], contract.unlock.spend(alicePub, new SignatureTemplate(alicePriv)))
        .addOutput({ to, amount, token: tokenUtxo.token });

      return tx;
    })(),
    template: {
      '$schema': 'https://ide.bitauth.com/authentication-template-v0.schema.json',
      'description': 'Imported from cashscript',
      'name': 'CashScript Generated Debugging Template',
      'supported': [
        'BCH_2025_05',
      ],
      'version': 0,
      'entities': {
        'P2PKH_input0_parameters': {
          'description': 'Contract creation and function parameters',
          'name': 'P2PKH (input #0)',
          'scripts': [
            'P2PKH_34d9ffce86b4d136ca74e9db6f6433d3548966a6be064052e728a4c1d16aa3a5_lock',
            'P2PKH_spend_input0_unlock',
          ],
          'variables': {
            'pk': {
              'description': '"pk" parameter of function "spend"',
              'name': 'pk',
              'type': 'WalletData',
            },
            's': {
              'description': '"s" parameter of function "spend"',
              'name': 's',
              'type': 'Key',
            },
            'pkh': {
              'description': '"pkh" parameter of this contract',
              'name': 'pkh',
              'type': 'WalletData',
            },
          },
        },
        'P2PKH_input1_parameters': {
          'description': 'Contract creation and function parameters',
          'name': 'P2PKH (input #1)',
          'scripts': [
            'P2PKH_34d9ffce86b4d136ca74e9db6f6433d3548966a6be064052e728a4c1d16aa3a5_lock',
            'P2PKH_spend_input1_unlock',
          ],
          'variables': {
            'pk': {
              'description': '"pk" parameter of function "spend"',
              'name': 'pk',
              'type': 'WalletData',
            },
            's': {
              'description': '"s" parameter of function "spend"',
              'name': 's',
              'type': 'Key',
            },
            'pkh': {
              'description': '"pkh" parameter of this contract',
              'name': 'pkh',
              'type': 'WalletData',
            },
          },
        },
      },
      'scripts': {
        'P2PKH_spend_input0_unlock': {
          'passes': [
            'P2PKH_spend_input0_evaluate',
          ],
          'name': 'spend (input #0)',
          'script': '// "spend" function parameters\n<s.schnorr_signature.all_outputs_all_utxos> // sig\n<pk> // pubkey = <0x0373cc07b54c22da627b572a387a20ea190c9382e5e6d48c1d5b89c5cea2c4c088>\n',
          'unlocks': 'P2PKH_34d9ffce86b4d136ca74e9db6f6433d3548966a6be064052e728a4c1d16aa3a5_lock',
        },
        'P2PKH_34d9ffce86b4d136ca74e9db6f6433d3548966a6be064052e728a4c1d16aa3a5_lock': {
          'lockingType': 'p2sh32',
          'name': 'P2PKH',
          'script': '// "P2PKH" contract constructor parameters\n<pkh> // bytes20 = <0x512dbb2c8c02efbac8d92431aa0ac33f6b0bf970>\n\n// bytecode\n                                  /* contract P2PKH(bytes20 pkh) {                                */\n                                  /*     // Require pk to match stored pkh and signature to match */\n                                  /*     function spend(pubkey pk, sig s) {                       */\nOP_OVER OP_HASH160 OP_EQUALVERIFY /*         require(hash160(pk) == pkh);                         */\nOP_CHECKSIG                       /*         require(checkSig(s, pk));                            */\n                                  /*     }                                                        */\n                                  /* }                                                            */\n                                  /*                                                              */',
        },
        'P2PKH_spend_input1_unlock': {
          'passes': [
            'P2PKH_spend_input1_evaluate',
          ],
          'name': 'spend (input #1)',
          'script': '// "spend" function parameters\n<s.schnorr_signature.all_outputs_all_utxos> // sig\n<pk> // pubkey = <0x0373cc07b54c22da627b572a387a20ea190c9382e5e6d48c1d5b89c5cea2c4c088>\n',
          'unlocks': 'P2PKH_34d9ffce86b4d136ca74e9db6f6433d3548966a6be064052e728a4c1d16aa3a5_lock',
        },
      },
      'scenarios': {
        'P2PKH_spend_input0_evaluate': {
          'name': 'Evaluate P2PKH spend (input #0)',
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
                  'overrides': {
                    'bytecode': {
                      'pk': '0x0373cc07b54c22da627b572a387a20ea190c9382e5e6d48c1d5b89c5cea2c4c088',
                      'pkh': '0x512dbb2c8c02efbac8d92431aa0ac33f6b0bf970',
                    },
                    'keys': {
                      'privateKeys': {
                        's': '36f8155c559f3a670586bbbf9fd52beef6f96124f5a3a39c167fc24b052d24d7',
                      },
                    },
                  },
                  'script': 'P2PKH_spend_input1_unlock',
                },
              },
            ],
            'locktime': expect.any(Number),
            'outputs': [
              {
                'lockingBytecode': {
                  'script': 'P2PKH_34d9ffce86b4d136ca74e9db6f6433d3548966a6be064052e728a4c1d16aa3a5_lock',
                  'overrides': {
                    'bytecode': {
                      'pkh': '0x512dbb2c8c02efbac8d92431aa0ac33f6b0bf970',
                    },
                  },
                },
                'token': {
                  'amount': expect.stringMatching(/^[0-9]+$/),
                  'category': expect.stringMatching(/^[0-9a-f]{64}$/),
                },
                'valueSatoshis': 1000,
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
                'script': 'P2PKH_34d9ffce86b4d136ca74e9db6f6433d3548966a6be064052e728a4c1d16aa3a5_lock',
                'overrides': {
                  'bytecode': {
                    'pkh': '0x512dbb2c8c02efbac8d92431aa0ac33f6b0bf970',
                  },
                },
              },
              'valueSatoshis': 1000,
              'token': {
                'amount': expect.stringMatching(/^[0-9]+$/),
                'category': expect.stringMatching(/^[0-9a-f]{64}$/),
              },
            },
          ],
        },
        'P2PKH_spend_input1_evaluate': {
          'name': 'Evaluate P2PKH spend (input #1)',
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
                'outpointTransactionHash': expect.stringMatching(/^[0-9a-f]{64}$/),
                'sequenceNumber': 4294967294,
                'unlockingBytecode': {
                  'overrides': {
                    'bytecode': {
                      'pk': '0x0373cc07b54c22da627b572a387a20ea190c9382e5e6d48c1d5b89c5cea2c4c088',
                      'pkh': '0x512dbb2c8c02efbac8d92431aa0ac33f6b0bf970',
                    },
                    'keys': {
                      'privateKeys': {
                        's': '36f8155c559f3a670586bbbf9fd52beef6f96124f5a3a39c167fc24b052d24d7',
                      },
                    },
                  },
                  'script': 'P2PKH_spend_input0_unlock',
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
            ],
            'locktime': 0,
            'outputs': [
              {
                'lockingBytecode': {
                  'script': 'P2PKH_34d9ffce86b4d136ca74e9db6f6433d3548966a6be064052e728a4c1d16aa3a5_lock',
                  'overrides': {
                    'bytecode': {
                      'pkh': '0x512dbb2c8c02efbac8d92431aa0ac33f6b0bf970',
                    },
                  },
                },
                'token': {
                  'amount': expect.stringMatching(/^[0-9]+$/),
                  'category': expect.stringMatching(/^[0-9a-f]{64}$/),
                },
                'valueSatoshis': 1000,
              },
            ],
            'version': 2,
          },
          'sourceOutputs': [
            {
              'lockingBytecode': {
                'script': 'P2PKH_34d9ffce86b4d136ca74e9db6f6433d3548966a6be064052e728a4c1d16aa3a5_lock',
                'overrides': {
                  'bytecode': {
                    'pkh': '0x512dbb2c8c02efbac8d92431aa0ac33f6b0bf970',
                  },
                },
              },
              'valueSatoshis': expect.any(Number),
            },
            {
              'lockingBytecode': [
                'slot',
              ],
              'valueSatoshis': 1000,
              'token': {
                'amount': expect.stringMatching(/^[0-9]+$/),
                'category': expect.stringMatching(/^[0-9a-f]{64}$/),
              },
            },
          ],
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
      const tx = new TransactionBuilder({ provider })
        .addInput(regularUtxo, contract.unlock.spend(alicePub, hardcodedSignature))
        .addOutput({ to, amount });

      return tx;
    })(),
    template: {
      '$schema': 'https://ide.bitauth.com/authentication-template-v0.schema.json',
      'description': 'Imported from cashscript',
      'name': 'CashScript Generated Debugging Template',
      'supported': [
        'BCH_2025_05',
      ],
      'version': 0,
      'entities': {
        'P2PKH_input0_parameters': {
          'description': 'Contract creation and function parameters',
          'name': 'P2PKH (input #0)',
          'scripts': [
            'P2PKH_34d9ffce86b4d136ca74e9db6f6433d3548966a6be064052e728a4c1d16aa3a5_lock',
            'P2PKH_spend_input0_unlock',
          ],
          'variables': {
            'pk': {
              'description': '"pk" parameter of function "spend"',
              'name': 'pk',
              'type': 'WalletData',
            },
            's': {
              'description': '"s" parameter of function "spend"',
              'name': 's',
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
      'scripts': {
        'P2PKH_spend_input0_unlock': {
          'passes': [
            'P2PKH_spend_input0_evaluate',
          ],
          'name': 'spend (input #0)',
          'script': '// "spend" function parameters\n<s> // sig = <0x65f72c5cce773383b45032a3f9f9255814e3d53ee260056e3232cd89e91a0a84278b35daf8938d47047e7d3bd3407fe90b07dfabf4407947af6fb09730a34c0b61>\n<pk> // pubkey = <0x0373cc07b54c22da627b572a387a20ea190c9382e5e6d48c1d5b89c5cea2c4c088>\n',
          'unlocks': 'P2PKH_34d9ffce86b4d136ca74e9db6f6433d3548966a6be064052e728a4c1d16aa3a5_lock',
        },
        'P2PKH_34d9ffce86b4d136ca74e9db6f6433d3548966a6be064052e728a4c1d16aa3a5_lock': {
          'lockingType': 'p2sh32',
          'name': 'P2PKH',
          'script': '// "P2PKH" contract constructor parameters\n<pkh> // bytes20 = <0x512dbb2c8c02efbac8d92431aa0ac33f6b0bf970>\n\n// bytecode\n                                  /* contract P2PKH(bytes20 pkh) {                                */\n                                  /*     // Require pk to match stored pkh and signature to match */\n                                  /*     function spend(pubkey pk, sig s) {                       */\nOP_OVER OP_HASH160 OP_EQUALVERIFY /*         require(hash160(pk) == pkh);                         */\nOP_CHECKSIG                       /*         require(checkSig(s, pk));                            */\n                                  /*     }                                                        */\n                                  /* }                                                            */\n                                  /*                                                              */',
        },
      },
      'scenarios': {
        'P2PKH_spend_input0_evaluate': {
          'name': 'Evaluate P2PKH spend (input #0)',
          'description': 'An example evaluation where this script execution passes.',
          'data': {
            'bytecode': {
              'pk': '0x0373cc07b54c22da627b572a387a20ea190c9382e5e6d48c1d5b89c5cea2c4c088',
              's': '0x65f72c5cce773383b45032a3f9f9255814e3d53ee260056e3232cd89e91a0a84278b35daf8938d47047e7d3bd3407fe90b07dfabf4407947af6fb09730a34c0b61',
              'pkh': '0x512dbb2c8c02efbac8d92431aa0ac33f6b0bf970',
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
                'outpointTransactionHash': expect.stringMatching(/^[0-9a-f]{64}$/),
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
                  'script': 'P2PKH_34d9ffce86b4d136ca74e9db6f6433d3548966a6be064052e728a4c1d16aa3a5_lock',
                  'overrides': {
                    'bytecode': {
                      'pkh': '0x512dbb2c8c02efbac8d92431aa0ac33f6b0bf970',
                    },
                  },
                },
                'valueSatoshis': 1000,
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
    name: 'P2PKH (sending NFTs)',
    transaction: (() => {
      const contract = new Contract(P2PKH, [alicePkh], { provider });

      const regularUtxo = randomUtxo();
      const nftUtxo = randomUtxo({ satoshis: 1000n, token: randomNFT() });
      provider.addUtxo(contract.address, regularUtxo);
      provider.addUtxo(contract.address, nftUtxo);

      const to = contract.tokenAddress;
      const amount = 1000n;

      const tx = new TransactionBuilder({ provider })
        .addInputs([regularUtxo, nftUtxo], contract.unlock.spend(alicePub, new SignatureTemplate(alicePriv)))
        .addOutput({ to, amount, token: nftUtxo.token });

      return tx;
    })(),
    template: {
      '$schema': 'https://ide.bitauth.com/authentication-template-v0.schema.json',
      'description': 'Imported from cashscript',
      'name': 'CashScript Generated Debugging Template',
      'supported': [
        'BCH_2025_05',
      ],
      'version': 0,
      'entities': {
        'P2PKH_input0_parameters': {
          'description': 'Contract creation and function parameters',
          'name': 'P2PKH (input #0)',
          'scripts': [
            'P2PKH_34d9ffce86b4d136ca74e9db6f6433d3548966a6be064052e728a4c1d16aa3a5_lock',
            'P2PKH_spend_input0_unlock',
          ],
          'variables': {
            'pk': {
              'description': '"pk" parameter of function "spend"',
              'name': 'pk',
              'type': 'WalletData',
            },
            's': {
              'description': '"s" parameter of function "spend"',
              'name': 's',
              'type': 'Key',
            },
            'pkh': {
              'description': '"pkh" parameter of this contract',
              'name': 'pkh',
              'type': 'WalletData',
            },
          },
        },
        'P2PKH_input1_parameters': {
          'description': 'Contract creation and function parameters',
          'name': 'P2PKH (input #1)',
          'scripts': [
            'P2PKH_34d9ffce86b4d136ca74e9db6f6433d3548966a6be064052e728a4c1d16aa3a5_lock',
            'P2PKH_spend_input1_unlock',
          ],
          'variables': {
            'pk': {
              'description': '"pk" parameter of function "spend"',
              'name': 'pk',
              'type': 'WalletData',
            },
            's': {
              'description': '"s" parameter of function "spend"',
              'name': 's',
              'type': 'Key',
            },
            'pkh': {
              'description': '"pkh" parameter of this contract',
              'name': 'pkh',
              'type': 'WalletData',
            },
          },
        },
      },
      'scripts': {
        'P2PKH_spend_input0_unlock': {
          'passes': [
            'P2PKH_spend_input0_evaluate',
          ],
          'name': 'spend (input #0)',
          'script': '// "spend" function parameters\n<s.schnorr_signature.all_outputs_all_utxos> // sig\n<pk> // pubkey = <0x0373cc07b54c22da627b572a387a20ea190c9382e5e6d48c1d5b89c5cea2c4c088>\n',
          'unlocks': 'P2PKH_34d9ffce86b4d136ca74e9db6f6433d3548966a6be064052e728a4c1d16aa3a5_lock',
        },
        'P2PKH_34d9ffce86b4d136ca74e9db6f6433d3548966a6be064052e728a4c1d16aa3a5_lock': {
          'lockingType': 'p2sh32',
          'name': 'P2PKH',
          'script': '// "P2PKH" contract constructor parameters\n<pkh> // bytes20 = <0x512dbb2c8c02efbac8d92431aa0ac33f6b0bf970>\n\n// bytecode\n                                  /* contract P2PKH(bytes20 pkh) {                                */\n                                  /*     // Require pk to match stored pkh and signature to match */\n                                  /*     function spend(pubkey pk, sig s) {                       */\nOP_OVER OP_HASH160 OP_EQUALVERIFY /*         require(hash160(pk) == pkh);                         */\nOP_CHECKSIG                       /*         require(checkSig(s, pk));                            */\n                                  /*     }                                                        */\n                                  /* }                                                            */\n                                  /*                                                              */',
        },
        'P2PKH_spend_input1_unlock': {
          'passes': [
            'P2PKH_spend_input1_evaluate',
          ],
          'name': 'spend (input #1)',
          'script': '// "spend" function parameters\n<s.schnorr_signature.all_outputs_all_utxos> // sig\n<pk> // pubkey = <0x0373cc07b54c22da627b572a387a20ea190c9382e5e6d48c1d5b89c5cea2c4c088>\n',
          'unlocks': 'P2PKH_34d9ffce86b4d136ca74e9db6f6433d3548966a6be064052e728a4c1d16aa3a5_lock',
        },
      },
      'scenarios': {
        'P2PKH_spend_input0_evaluate': {
          'name': 'Evaluate P2PKH spend (input #0)',
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
                  'overrides': {
                    'bytecode': {
                      'pk': '0x0373cc07b54c22da627b572a387a20ea190c9382e5e6d48c1d5b89c5cea2c4c088',
                      'pkh': '0x512dbb2c8c02efbac8d92431aa0ac33f6b0bf970',
                    },
                    'keys': {
                      'privateKeys': {
                        's': '36f8155c559f3a670586bbbf9fd52beef6f96124f5a3a39c167fc24b052d24d7',
                      },
                    },
                  },
                  'script': 'P2PKH_spend_input1_unlock',
                },
              },
            ],
            'locktime': 0,
            'outputs': [
              {
                'lockingBytecode': {
                  'script': 'P2PKH_34d9ffce86b4d136ca74e9db6f6433d3548966a6be064052e728a4c1d16aa3a5_lock',
                  'overrides': {
                    'bytecode': {
                      'pkh': '0x512dbb2c8c02efbac8d92431aa0ac33f6b0bf970',
                    },
                  },
                },
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
                'script': 'P2PKH_34d9ffce86b4d136ca74e9db6f6433d3548966a6be064052e728a4c1d16aa3a5_lock',
                'overrides': {
                  'bytecode': {
                    'pkh': '0x512dbb2c8c02efbac8d92431aa0ac33f6b0bf970',
                  },
                },
              },
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
        'P2PKH_spend_input1_evaluate': {
          'name': 'Evaluate P2PKH spend (input #1)',
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
                'outpointTransactionHash': expect.stringMatching(/^[0-9a-f]{64}$/),
                'sequenceNumber': 4294967294,
                'unlockingBytecode': {
                  'overrides': {
                    'bytecode': {
                      'pk': '0x0373cc07b54c22da627b572a387a20ea190c9382e5e6d48c1d5b89c5cea2c4c088',
                      'pkh': '0x512dbb2c8c02efbac8d92431aa0ac33f6b0bf970',
                    },
                    'keys': {
                      'privateKeys': {
                        's': '36f8155c559f3a670586bbbf9fd52beef6f96124f5a3a39c167fc24b052d24d7',
                      },
                    },
                  },
                  'script': 'P2PKH_spend_input0_unlock',
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
            ],
            'locktime': 0,
            'outputs': [
              {
                'lockingBytecode': {
                  'script': 'P2PKH_34d9ffce86b4d136ca74e9db6f6433d3548966a6be064052e728a4c1d16aa3a5_lock',
                  'overrides': {
                    'bytecode': {
                      'pkh': '0x512dbb2c8c02efbac8d92431aa0ac33f6b0bf970',
                    },
                  },
                },
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
            ],
            'version': 2,
          },
          'sourceOutputs': [
            {
              'lockingBytecode': {
                'script': 'P2PKH_34d9ffce86b4d136ca74e9db6f6433d3548966a6be064052e728a4c1d16aa3a5_lock',
                'overrides': {
                  'bytecode': {
                    'pkh': '0x512dbb2c8c02efbac8d92431aa0ac33f6b0bf970',
                  },
                },
              },
              'valueSatoshis': expect.any(Number),
            },
            {
              'lockingBytecode': [
                'slot',
              ],
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
    },
  },
  {
    name: 'HodlVault (datasig)',
    transaction: (() => {
      const contract = new Contract(HoldVault, [alicePub, oraclePub, 99000n, 30000n], { provider });
      const contractUtxo = randomUtxo();
      provider.addUtxo(contract.address, contractUtxo);

      // given
      const message = oracle.createMessage(100000n, 30000n);
      const oracleSig = oracle.signMessage(message);
      const to = contract.address;
      const amount = 10000n;
      const aliceTemplate = new SignatureTemplate(alicePriv);

      // when
      const tx = new TransactionBuilder({ provider })
        .addInput(contractUtxo, contract.unlock.spend(aliceTemplate, oracleSig, message))
        .addOutput({ to, amount })
        .setLocktime(133700);

      return tx;
    })(),
    template: {
      '$schema': 'https://ide.bitauth.com/authentication-template-v0.schema.json',
      'description': 'Imported from cashscript',
      'name': 'CashScript Generated Debugging Template',
      'supported': [
        'BCH_2025_05',
      ],
      'version': 0,
      'entities': {
        'HodlVault_input0_parameters': {
          'description': 'Contract creation and function parameters',
          'name': 'HodlVault (input #0)',
          'scripts': [
            'HodlVault_2b9369ac73606fc710cb756d82807e45e283bbf2a642df014bfce7a1c749c5e0_lock',
            'HodlVault_spend_input0_unlock',
          ],
          'variables': {
            'ownerSig': {
              'description': '"ownerSig" parameter of function "spend"',
              'name': 'ownerSig',
              'type': 'Key',
            },
            'oracleSig': {
              'description': '"oracleSig" parameter of function "spend"',
              'name': 'oracleSig',
              'type': 'WalletData',
            },
            'oracleMessage': {
              'description': '"oracleMessage" parameter of function "spend"',
              'name': 'oracleMessage',
              'type': 'WalletData',
            },
            'ownerPk': {
              'description': '"ownerPk" parameter of this contract',
              'name': 'ownerPk',
              'type': 'WalletData',
            },
            'oraclePk': {
              'description': '"oraclePk" parameter of this contract',
              'name': 'oraclePk',
              'type': 'WalletData',
            },
            'minBlock': {
              'description': '"minBlock" parameter of this contract',
              'name': 'minBlock',
              'type': 'WalletData',
            },
            'priceTarget': {
              'description': '"priceTarget" parameter of this contract',
              'name': 'priceTarget',
              'type': 'WalletData',
            },
          },
        },
      },
      'scripts': {
        'HodlVault_spend_input0_unlock': {
          'passes': [
            'HodlVault_spend_input0_evaluate',
          ],
          'name': 'spend (input #0)',
          'script': '// "spend" function parameters\n<oracleMessage> // bytes8 = <0xa086010030750000>\n<oracleSig> // datasig = <0x569e137142ebdb96127b727787d605e427a858e8b17dc0605092d0019e5fc9d58810ee74c8ba9f9a5605268c9913e50f780f4c3780e06aea7f50766829895b4b>\n<ownerSig.schnorr_signature.all_outputs_all_utxos> // sig\n',
          'unlocks': 'HodlVault_2b9369ac73606fc710cb756d82807e45e283bbf2a642df014bfce7a1c749c5e0_lock',
        },
        'HodlVault_2b9369ac73606fc710cb756d82807e45e283bbf2a642df014bfce7a1c749c5e0_lock': {
          'lockingType': 'p2sh32',
          'name': 'HodlVault',
          'script': '// "HodlVault" contract constructor parameters\n<priceTarget> // int = <0x3075>\n<minBlock> // int = <0xb88201>\n<oraclePk> // pubkey = <0x028f1219c918234d6bb06b4782354ff0759bd73036f3c849b88020c79fe013cd38>\n<ownerPk> // pubkey = <0x0373cc07b54c22da627b572a387a20ea190c9382e5e6d48c1d5b89c5cea2c4c088>\n\n// bytecode\n                                                             /* // This contract forces HODLing until a certain price target has been reached                                          */\n                                                             /* // A minimum block is provided to ensure that oracle price entries from before this block are disregarded              */\n                                                             /* // i.e. when the BCH price was $1000 in the past, an oracle entry with the old block number and price can not be used. */\n                                                             /* // Instead, a message with a block number and price from after the minBlock needs to be passed.                        */\n                                                             /* // This contract serves as a simple example for checkDataSig-based contracts.                                          */\n                                                             /* contract HodlVault(                                                                                                    */\n                                                             /*     pubkey ownerPk,                                                                                                    */\n                                                             /*     pubkey oraclePk,                                                                                                   */\n                                                             /*     int minBlock,                                                                                                      */\n                                                             /*     int priceTarget                                                                                                    */\n                                                             /* ) {                                                                                                                    */\n                                                             /*     function spend(sig ownerSig, datasig oracleSig, bytes8 oracleMessage) {                                            */\n                                                             /*         // message: { blockHeight, price }                                                                             */\nOP_6 OP_PICK OP_4 OP_SPLIT                                   /*         bytes4 blockHeightBin, bytes4 priceBin = oracleMessage.split(4);                                               */\nOP_SWAP OP_BIN2NUM                                           /*         int blockHeight = int(blockHeightBin);                                                                         */\nOP_SWAP OP_BIN2NUM                                           /*         int price = int(priceBin);                                                                                     */\n                                                             /*                                                                                                                        */\n                                                             /*         // Check that blockHeight is after minBlock and not in the future                                              */\nOP_OVER OP_5 OP_ROLL OP_GREATERTHANOREQUAL OP_VERIFY         /*         require(blockHeight >= minBlock);                                                                              */\nOP_SWAP OP_CHECKLOCKTIMEVERIFY OP_DROP                       /*         require(tx.time >= blockHeight);                                                                               */\n                                                             /*                                                                                                                        */\n                                                             /*         // Check that current price is at least priceTarget                                                            */\nOP_3 OP_ROLL OP_GREATERTHANOREQUAL OP_VERIFY                 /*         require(price >= priceTarget);                                                                                 */\n                                                             /*                                                                                                                        */\n                                                             /*         // Handle necessary signature checks                                                                           */\nOP_3 OP_ROLL OP_4 OP_ROLL OP_3 OP_ROLL OP_CHECKDATASIGVERIFY /*         require(checkDataSig(oracleSig, oracleMessage, oraclePk));                                                     */\nOP_CHECKSIG                                                  /*         require(checkSig(ownerSig, ownerPk));                                                                          */\n                                                             /*     }                                                                                                                  */\n                                                             /* }                                                                                                                      */\n                                                             /*                                                                                                                        */',
        },
      },
      'scenarios': {
        'HodlVault_spend_input0_evaluate': {
          'name': 'Evaluate HodlVault spend (input #0)',
          'description': 'An example evaluation where this script execution passes.',
          'data': {
            'bytecode': {
              'oracleSig': '0x569e137142ebdb96127b727787d605e427a858e8b17dc0605092d0019e5fc9d58810ee74c8ba9f9a5605268c9913e50f780f4c3780e06aea7f50766829895b4b',
              'oracleMessage': '0xa086010030750000',
              'ownerPk': '0x0373cc07b54c22da627b572a387a20ea190c9382e5e6d48c1d5b89c5cea2c4c088',
              'oraclePk': '0x028f1219c918234d6bb06b4782354ff0759bd73036f3c849b88020c79fe013cd38',
              'minBlock': '0xb88201',
              'priceTarget': '0x3075',
            },
            'currentBlockHeight': expect.any(Number),
            'currentBlockTime': expect.any(Number),
            'keys': {
              'privateKeys': {
                'ownerSig': '36f8155c559f3a670586bbbf9fd52beef6f96124f5a3a39c167fc24b052d24d7',
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
                'lockingBytecode': {
                  'script': 'HodlVault_2b9369ac73606fc710cb756d82807e45e283bbf2a642df014bfce7a1c749c5e0_lock',
                  'overrides': {
                    'bytecode': {
                      'ownerPk': '0x0373cc07b54c22da627b572a387a20ea190c9382e5e6d48c1d5b89c5cea2c4c088',
                      'oraclePk': '0x028f1219c918234d6bb06b4782354ff0759bd73036f3c849b88020c79fe013cd38',
                      'minBlock': '0xb88201',
                      'priceTarget': '0x3075',
                    },
                  },
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
      const contractUtxo = randomUtxo();
      provider.addUtxo(contract.address, contractUtxo);

      const p2pkhUtxo = randomUtxo();
      provider.addUtxo(aliceAddress, p2pkhUtxo);

      const to = contract.tokenAddress;
      const amount = 1000n;

      const aliceDefaultTemplate = new SignatureTemplate(alicePriv);
      const aliceCustomTemplate = new SignatureTemplate(alicePriv, HashType.SIGHASH_NONE, SignatureAlgorithm.ECDSA);
      const bobCustomTemplate = new SignatureTemplate(bobPriv, HashType.SIGHASH_ALL, SignatureAlgorithm.ECDSA);

      const tx = new TransactionBuilder({ provider })
        .addInput(p2pkhUtxo, aliceDefaultTemplate.unlockP2PKH())
        .addInput(contractUtxo, contract.unlock.spend(alicePub, aliceCustomTemplate))
        .addInput(p2pkhUtxo, bobCustomTemplate.unlockP2PKH())
        .addOutput({ to, amount });

      return tx;
    })(),
    template: {
      '$schema': 'https://ide.bitauth.com/authentication-template-v0.schema.json',
      'description': 'Imported from cashscript',
      'name': 'CashScript Generated Debugging Template',
      'supported': [
        'BCH_2025_05',
      ],
      'version': 0,
      'entities': {
        'P2PKH_input1_parameters': {
          'description': 'Contract creation and function parameters',
          'name': 'P2PKH (input #1)',
          'scripts': [
            'P2PKH_eae136efb95be487872bfe03984fc1eb80b23361_lock',
            'P2PKH_spend_input1_unlock',
          ],
          'variables': {
            'pk': {
              'description': '"pk" parameter of function "spend"',
              'name': 'pk',
              'type': 'WalletData',
            },
            's': {
              'description': '"s" parameter of function "spend"',
              'name': 's',
              'type': 'Key',
            },
            'pkh': {
              'description': '"pkh" parameter of this contract',
              'name': 'pkh',
              'type': 'WalletData',
            },
          },
        },
        'signer_0': {
          'scripts': [
            'p2pkh_placeholder_lock_0',
            'p2pkh_placeholder_unlock_0',
          ],
          'description': 'placeholder_key_0',
          'name': 'P2PKH Signer (input #0)',
          'variables': {
            'placeholder_key_0': {
              'description': '',
              'name': 'P2PKH Placeholder Key (input #0)',
              'type': 'Key',
            },
          },
        },
        'signer_2': {
          'scripts': [
            'p2pkh_placeholder_lock_2',
            'p2pkh_placeholder_unlock_2',
          ],
          'description': 'placeholder_key_2',
          'name': 'P2PKH Signer (input #2)',
          'variables': {
            'placeholder_key_2': {
              'description': '',
              'name': 'P2PKH Placeholder Key (input #2)',
              'type': 'Key',
            },
          },
        },
      },
      'scripts': {
        'P2PKH_spend_input1_unlock': {
          'passes': [
            'P2PKH_spend_input1_evaluate',
          ],
          'name': 'spend (input #1)',
          'script': '// "spend" function parameters\n<s.ecdsa_signature.no_outputs> // sig\n<pk> // pubkey = <0x0373cc07b54c22da627b572a387a20ea190c9382e5e6d48c1d5b89c5cea2c4c088>\n',
          'unlocks': 'P2PKH_eae136efb95be487872bfe03984fc1eb80b23361_lock',
        },
        'P2PKH_eae136efb95be487872bfe03984fc1eb80b23361_lock': {
          'lockingType': 'p2sh20',
          'name': 'P2PKH',
          'script': '// "P2PKH" contract constructor parameters\n<pkh> // bytes20 = <0x512dbb2c8c02efbac8d92431aa0ac33f6b0bf970>\n\n// bytecode\n                                  /* contract P2PKH(bytes20 pkh) {                                */\n                                  /*     // Require pk to match stored pkh and signature to match */\n                                  /*     function spend(pubkey pk, sig s) {                       */\nOP_OVER OP_HASH160 OP_EQUALVERIFY /*         require(hash160(pk) == pkh);                         */\nOP_CHECKSIG                       /*         require(checkSig(s, pk));                            */\n                                  /*     }                                                        */\n                                  /* }                                                            */\n                                  /*                                                              */',
        },
        'p2pkh_placeholder_unlock_0': {
          'name': 'P2PKH Unlock (input #0)',
          'script': '<placeholder_key_0.schnorr_signature.all_outputs_all_utxos>\n<placeholder_key_0.public_key>',
          'unlocks': 'p2pkh_placeholder_lock_0',
        },
        'p2pkh_placeholder_lock_0': {
          'lockingType': 'standard',
          'name': 'P2PKH Lock (input #0)',
          'script': 'OP_DUP\nOP_HASH160 <$(<placeholder_key_0.public_key> OP_HASH160\n)> OP_EQUALVERIFY\nOP_CHECKSIG',
        },
        'p2pkh_placeholder_unlock_2': {
          'name': 'P2PKH Unlock (input #2)',
          'script': '<placeholder_key_2.ecdsa_signature.all_outputs>\n<placeholder_key_2.public_key>',
          'unlocks': 'p2pkh_placeholder_lock_2',
        },
        'p2pkh_placeholder_lock_2': {
          'lockingType': 'standard',
          'name': 'P2PKH Lock (input #2)',
          'script': 'OP_DUP\nOP_HASH160 <$(<placeholder_key_2.public_key> OP_HASH160\n)> OP_EQUALVERIFY\nOP_CHECKSIG',
        },
      },
      'scenarios': {
        'P2PKH_spend_input1_evaluate': {
          'name': 'Evaluate P2PKH spend (input #1)',
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
            'locktime': 0,
            'outputs': [
              {
                'lockingBytecode': {
                  'script': 'P2PKH_eae136efb95be487872bfe03984fc1eb80b23361_lock',
                  'overrides': {
                    'bytecode': {
                      'pkh': '0x512dbb2c8c02efbac8d92431aa0ac33f6b0bf970',
                    },
                  },
                },
                'valueSatoshis': 1000,
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
    },
  },
];
