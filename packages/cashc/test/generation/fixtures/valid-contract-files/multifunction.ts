import { Fixture } from '../../fixture-utils.js';

export const fixtures: Fixture[] = [
  {
    artifact: {
      contractName: 'MultiFunction',
      constructorInputs: [{ name: 'sender', type: 'pubkey' }, { name: 'recipient', type: 'pubkey' }, { name: 'timeout', type: 'int' }],
      abi: [
        { name: 'transfer', inputs: [{ name: 'recipientSig', type: 'sig' }] },
        { name: 'timeout', inputs: [{ name: 'senderSig', type: 'sig' }] },
      ],
      bytecode:
        // function transfer
        'OP_3 OP_PICK OP_0 OP_NUMEQUAL OP_IF '
        // require(checkSig(recipientSig, recipient))
        + 'OP_4 OP_ROLL OP_ROT OP_CHECKSIG '
        + 'OP_NIP OP_NIP OP_NIP OP_ELSE '
        // function timeout
        + 'OP_3 OP_ROLL OP_1 OP_NUMEQUALVERIFY '
        // require(checkSig(senderSig, sender))
        + 'OP_3 OP_ROLL OP_SWAP OP_CHECKSIGVERIFY '
        // require(tx.time >= timeout)
        + 'OP_SWAP OP_CHECKLOCKTIMEVERIFY OP_2DROP OP_1 '
        + 'OP_ENDIF',
      debug: {
        bytecode: '5379009c63547a7bac77777767537a519d537a7cad7cb16d5168',
        logs: [],
        requires: [
          { ip: 12, line: 7 },
          { ip: 23, line: 11 },
          { ip: 25, line: 12 },
        ],
        sourceMap: '6:4:8:5;;;;;7:25:7:37;;:39::48;:8::51:1;6:40:8:5;;;:4;10::13::0;;;;11:25:11:34;;:36::42;:8::45:1;12:27:12:34:0;:8::36:1;10:36:13:5;;1:0:14:1',
        sourceTags: '9:11:sc',
      },
      fingerprint: '4367893ec13aecfe4624b6d5b12681b9782de30dd657d1313eed269faba937e4',
    },
  },
];
