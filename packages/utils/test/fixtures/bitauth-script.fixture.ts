/* eslint-disable max-len */

export interface Fixture {
  name: string;
  sourceCode: string;
  asmBytecode: string;
  sourceMap: string;
  sourceTags?: string;
  expectedLineToAsmMap: Record<string, string>;
  expectedBitAuthScript: string;
}

export const fixtures: Fixture[] = [
  {
    name: 'TransferWithTimeout (Modified with random extra statements)',
    sourceCode: `
contract TransferWithTimeout(bytes20 senderPkh, bytes20 recipientPkh, int timeout) {
  function transfer(pubkey signingPk, sig s) {
    require(checkSig(s, signingPk));
    require(hash160(signingPk) == recipientPkh);
  }

  function timeout(pubkey signingPk, sig s) {
    require(senderPkh == 0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef);
    require(timeout == timeout);
    require(s == s);
    require(signingPk == signingPk);
    require(checkSig(s, signingPk));
    require(hash160(signingPk) == senderPkh);
    require(tx.time >= timeout);
  }
}`,
    asmBytecode: 'OP_3 OP_PICK OP_0 OP_NUMEQUAL OP_IF OP_5 OP_ROLL OP_5 OP_PICK OP_CHECKSIGVERIFY OP_4 OP_ROLL OP_HASH160 OP_ROT OP_EQUAL OP_NIP OP_NIP OP_NIP OP_ELSE OP_3 OP_ROLL OP_1 OP_NUMEQUALVERIFY OP_DUP deadbeefdeadbeefdeadbeefdeadbeefdeadbeef OP_EQUALVERIFY OP_2 OP_PICK OP_3 OP_PICK OP_NUMEQUALVERIFY OP_4 OP_PICK OP_5 OP_PICK OP_EQUALVERIFY OP_3 OP_PICK OP_4 OP_PICK OP_EQUALVERIFY OP_4 OP_ROLL OP_4 OP_PICK OP_CHECKSIGVERIFY OP_3 OP_ROLL OP_HASH160 OP_EQUALVERIFY OP_SWAP OP_CHECKLOCKTIMEVERIFY OP_2DROP OP_1 OP_ENDIF',
    sourceMap: '3:2:6:3;;;;;4:21:4:22;;:24::33;;:4::36:1;5:20:5:29:0;;:12::30:1;:34::46:0;:4::48:1;3:45:6:3;;;:2;8::16::0;;;;9:12:9:21;:25::67;:4::69:1;10:12:10:19:0;;:23::30;;:4::32:1;11:12:11:13:0;;:17::18;;:4::20:1;12:12:12:21:0;;:25::34;;:4::36:1;13:21:13:22:0;;:24::33;;:4::36:1;14:20:14:29:0;;:12::30:1;:4::45;15:23:15:30:0;:4::32:1;8:44:16:3;;2:0:17:1',
    expectedLineToAsmMap: {
      3: 'OP_3 OP_PICK OP_0 OP_NUMEQUAL OP_IF',
      4: 'OP_5 OP_ROLL OP_5 OP_PICK OP_CHECKSIGVERIFY',
      5: 'OP_4 OP_ROLL OP_HASH160 OP_ROT OP_EQUAL',
      6: 'OP_NIP OP_NIP OP_NIP OP_ELSE',
      8: 'OP_3 OP_ROLL OP_1 OP_NUMEQUALVERIFY',
      9: 'OP_DUP <0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef> OP_EQUALVERIFY',
      10: 'OP_2 OP_PICK OP_3 OP_PICK OP_NUMEQUALVERIFY',
      11: 'OP_4 OP_PICK OP_5 OP_PICK OP_EQUALVERIFY',
      12: 'OP_3 OP_PICK OP_4 OP_PICK OP_EQUALVERIFY',
      13: 'OP_4 OP_ROLL OP_4 OP_PICK OP_CHECKSIGVERIFY',
      14: 'OP_3 OP_ROLL OP_HASH160 OP_EQUALVERIFY',
      15: 'OP_SWAP OP_CHECKLOCKTIMEVERIFY',
      16: 'OP_2DROP OP_1',
      17: 'OP_ENDIF',
    },
    expectedBitAuthScript: `
                                                                   /*                                                                                      */
                                                                   /* contract TransferWithTimeout(bytes20 senderPkh, bytes20 recipientPkh, int timeout) { */
OP_3 OP_PICK OP_0 OP_NUMEQUAL OP_IF                                /*   function transfer(pubkey signingPk, sig s) {                                       */
OP_5 OP_ROLL OP_5 OP_PICK OP_CHECKSIGVERIFY                        /*     require(checkSig(s, signingPk));                                                 */
OP_4 OP_ROLL OP_HASH160 OP_ROT OP_EQUAL                            /*     require(hash160(signingPk) == recipientPkh);                                     */
OP_NIP OP_NIP OP_NIP OP_ELSE                                       /*   }                                                                                  */
                                                                   /*                                                                                      */
OP_3 OP_ROLL OP_1 OP_NUMEQUALVERIFY                                /*   function timeout(pubkey signingPk, sig s) {                                        */
OP_DUP <0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef> OP_EQUALVERIFY /*     require(senderPkh == 0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef);                */
OP_2 OP_PICK OP_3 OP_PICK OP_NUMEQUALVERIFY                        /*     require(timeout == timeout);                                                     */
OP_4 OP_PICK OP_5 OP_PICK OP_EQUALVERIFY                           /*     require(s == s);                                                                 */
OP_3 OP_PICK OP_4 OP_PICK OP_EQUALVERIFY                           /*     require(signingPk == signingPk);                                                 */
OP_4 OP_ROLL OP_4 OP_PICK OP_CHECKSIGVERIFY                        /*     require(checkSig(s, signingPk));                                                 */
OP_3 OP_ROLL OP_HASH160 OP_EQUALVERIFY                             /*     require(hash160(signingPk) == senderPkh);                                        */
OP_SWAP OP_CHECKLOCKTIMEVERIFY                                     /*     require(tx.time >= timeout);                                                     */
OP_2DROP OP_1                                                      /*   }                                                                                  */
OP_ENDIF                                                           /* }                                                                                    */
`.replace(/^\n+/, '').replace(/\n+$/, ''),
  },
  {
    name: 'Mecenas',
    sourceCode: `
pragma cashscript >=0.8.0;

/* This is an unofficial CashScript port of Licho's Mecenas contract. It is
 * not compatible with Licho's EC plugin, but rather meant as a demonstration
 * of covenants in CashScript.
 * The time checking has been removed so it can be tested without time requirements.
 */
contract Mecenas(bytes20 recipient, bytes20 funder, int pledge/*, int period */) {
    function receive() {
        // require(this.age >= period);

        // Check that the first output sends to the recipient
        require(tx.outputs[0].lockingBytecode == new LockingBytecodeP2PKH(recipient));

        int minerFee = 1000;
        int currentValue = tx.inputs[this.activeInputIndex].value;
        int changeValue = currentValue - pledge - minerFee;

        // If there is not enough left for *another* pledge after this one, we send the remainder to the recipient
        // Otherwise we send the remainder to the recipient and the change back to the contract
        if (changeValue <= pledge + minerFee) {
            require(tx.outputs[0].value == currentValue - minerFee);
        } else {
            require(tx.outputs[0].value == pledge);
            require(tx.outputs[1].lockingBytecode == tx.inputs[this.activeInputIndex].lockingBytecode);
            require(tx.outputs[1].value == changeValue);
        }
    }

    function reclaim(pubkey pk, sig s) {
        require(hash160(pk) == funder);
        require(checkSig(s, pk));
    }
}`.replace(/^\n+/, '').replace(/\n+$/, ''),
    asmBytecode: 'OP_3 OP_PICK OP_0 OP_NUMEQUAL OP_IF OP_0 OP_OUTPUTBYTECODE 76a914 OP_ROT OP_CAT 88ac OP_CAT OP_EQUALVERIFY e803 OP_INPUTINDEX OP_UTXOVALUE OP_DUP OP_4 OP_PICK OP_SUB OP_2 OP_PICK OP_SUB OP_DUP OP_5 OP_PICK OP_4 OP_PICK OP_ADD OP_LESSTHANOREQUAL OP_IF OP_0 OP_OUTPUTVALUE OP_2OVER OP_SWAP OP_SUB OP_NUMEQUALVERIFY OP_ELSE OP_0 OP_OUTPUTVALUE OP_5 OP_PICK OP_NUMEQUALVERIFY OP_1 OP_OUTPUTBYTECODE OP_INPUTINDEX OP_UTXOBYTECODE OP_EQUALVERIFY OP_1 OP_OUTPUTVALUE OP_OVER OP_NUMEQUALVERIFY OP_ENDIF OP_2DROP OP_2DROP OP_2DROP OP_1 OP_ELSE OP_3 OP_ROLL OP_1 OP_NUMEQUALVERIFY OP_3 OP_PICK OP_HASH160 OP_ROT OP_EQUALVERIFY OP_2SWAP OP_CHECKSIG OP_NIP OP_NIP OP_ENDIF',
    sourceMap: '9:4:28:5;;;;;13:27:13:28;:16::45:1;:49::84:0;:74::83;:49::84:1;;;:8::86;15:23:15:27:0;16:37:16:58;:27::65:1;17:26:17:38:0;:41::47;;:26:::1;:50::58:0;;:26:::1;21:12:21:23:0;:27::33;;:36::44;;:27:::1;:12;:46:23:9:0;22:31:22:32;:20::39:1;:43::66:0;;::::1;:12::68;23:15:27:9:0;24:31:24:32;:20::39:1;:43::49:0;;:12::51:1;25:31:25:32:0;:20::49:1;:63::84:0;:53::101:1;:12::103;26:31:26:32:0;:20::39:1;:43::54:0;:12::56:1;23:15:27:9;9:23:28:5;;;;:4;30::33::0;;;;31:24:31:26;;:16::27:1;:31::37:0;:8::39:1;32:25:32:30:0;:8::33:1;30:39:33:5;;8:0:34:1',
    expectedLineToAsmMap: {
      9: 'OP_3 OP_PICK OP_0 OP_NUMEQUAL OP_IF',
      13: 'OP_0 OP_OUTPUTBYTECODE <0x76a914> OP_ROT OP_CAT <0x88ac> OP_CAT OP_EQUALVERIFY',
      15: '<0xe803>',
      16: 'OP_INPUTINDEX OP_UTXOVALUE',
      17: 'OP_DUP OP_4 OP_PICK OP_SUB OP_2 OP_PICK OP_SUB',
      21: 'OP_DUP OP_5 OP_PICK OP_4 OP_PICK OP_ADD OP_LESSTHANOREQUAL OP_IF',
      22: 'OP_0 OP_OUTPUTVALUE OP_2OVER OP_SWAP OP_SUB OP_NUMEQUALVERIFY',
      23: 'OP_ELSE',
      24: 'OP_0 OP_OUTPUTVALUE OP_5 OP_PICK OP_NUMEQUALVERIFY',
      25: 'OP_1 OP_OUTPUTBYTECODE OP_INPUTINDEX OP_UTXOBYTECODE OP_EQUALVERIFY',
      26: 'OP_1 OP_OUTPUTVALUE OP_OVER OP_NUMEQUALVERIFY',
      27: 'OP_ENDIF',
      28: 'OP_2DROP OP_2DROP OP_2DROP OP_1 OP_ELSE',
      30: 'OP_3 OP_ROLL OP_1 OP_NUMEQUALVERIFY',
      31: 'OP_3 OP_PICK OP_HASH160 OP_ROT OP_EQUALVERIFY',
      32: 'OP_2SWAP OP_CHECKSIG',
      33: 'OP_NIP OP_NIP',
      34: 'OP_ENDIF',
    },
    expectedBitAuthScript: `
                                                                               /* pragma cashscript >=0.8.0;                                                                                         */
                                                                               /*                                                                                                                    */
                                                                               /* \\/* This is an unofficial CashScript port of Licho's Mecenas contract. It is                                       */
                                                                               /*  * not compatible with Licho's EC plugin, but rather meant as a demonstration                                      */
                                                                               /*  * of covenants in CashScript.                                                                                     */
                                                                               /*  * The time checking has been removed so it can be tested without time requirements.                               */
                                                                               /*  *\\/                                                                                                               */
                                                                               /* contract Mecenas(bytes20 recipient, bytes20 funder, int pledge\\/*, int period *\\/) {                               */
OP_3 OP_PICK OP_0 OP_NUMEQUAL OP_IF                                            /*     function receive() {                                                                                           */
                                                                               /*         // require(this.age >= period);                                                                            */
                                                                               /*                                                                                                                    */
                                                                               /*         // Check that the first output sends to the recipient                                                      */
OP_0 OP_OUTPUTBYTECODE <0x76a914> OP_ROT OP_CAT <0x88ac> OP_CAT OP_EQUALVERIFY /*         require(tx.outputs[0].lockingBytecode == new LockingBytecodeP2PKH(recipient));                             */
                                                                               /*                                                                                                                    */
<0xe803>                                                                       /*         int minerFee = 1000;                                                                                       */
OP_INPUTINDEX OP_UTXOVALUE                                                     /*         int currentValue = tx.inputs[this.activeInputIndex].value;                                                 */
OP_DUP OP_4 OP_PICK OP_SUB OP_2 OP_PICK OP_SUB                                 /*         int changeValue = currentValue - pledge - minerFee;                                                        */
                                                                               /*                                                                                                                    */
                                                                               /*         // If there is not enough left for *another* pledge after this one, we send the remainder to the recipient */
                                                                               /*         // Otherwise we send the remainder to the recipient and the change back to the contract                    */
OP_DUP OP_5 OP_PICK OP_4 OP_PICK OP_ADD OP_LESSTHANOREQUAL OP_IF               /*         if (changeValue <= pledge + minerFee) {                                                                    */
OP_0 OP_OUTPUTVALUE OP_2OVER OP_SWAP OP_SUB OP_NUMEQUALVERIFY                  /*             require(tx.outputs[0].value == currentValue - minerFee);                                               */
OP_ELSE                                                                        /*         } else {                                                                                                   */
OP_0 OP_OUTPUTVALUE OP_5 OP_PICK OP_NUMEQUALVERIFY                             /*             require(tx.outputs[0].value == pledge);                                                                */
OP_1 OP_OUTPUTBYTECODE OP_INPUTINDEX OP_UTXOBYTECODE OP_EQUALVERIFY            /*             require(tx.outputs[1].lockingBytecode == tx.inputs[this.activeInputIndex].lockingBytecode);            */
OP_1 OP_OUTPUTVALUE OP_OVER OP_NUMEQUALVERIFY                                  /*             require(tx.outputs[1].value == changeValue);                                                           */
OP_ENDIF                                                                       /*         }                                                                                                          */
OP_2DROP OP_2DROP OP_2DROP OP_1 OP_ELSE                                        /*     }                                                                                                              */
                                                                               /*                                                                                                                    */
OP_3 OP_ROLL OP_1 OP_NUMEQUALVERIFY                                            /*     function reclaim(pubkey pk, sig s) {                                                                           */
OP_3 OP_PICK OP_HASH160 OP_ROT OP_EQUALVERIFY                                  /*         require(hash160(pk) == funder);                                                                            */
OP_2SWAP OP_CHECKSIG                                                           /*         require(checkSig(s, pk));                                                                                  */
OP_NIP OP_NIP                                                                  /*     }                                                                                                              */
OP_ENDIF                                                                       /* }                                                                                                                  */
`.replace(/^\n+/, '').replace(/\n+$/, ''),
  },
  {
    name: 'HodlVault',
    sourceCode: `
// This contract forces HODLing until a certain price target has been reached
// A minimum block is provided to ensure that oracle price entries from before this block are disregarded
// i.e. when the BCH price was $1000 in the past, an oracle entry with the old block number and price can not be used.
// Instead, a message with a block number and price from after the minBlock needs to be passed.
// This contract serves as a simple example for checkDataSig-based contracts.
contract HodlVault(
    pubkey ownerPk,
    pubkey oraclePk,
    int minBlock,
    int priceTarget
) {
    function spend(
        sig ownerSig,
        datasig oracleSig,
        bytes8 oracleMessage
    ) {
        // message: { blockHeight, price }
        bytes4 blockHeightBin, bytes4 priceBin = oracleMessage.split(4);
        int blockHeight = int(blockHeightBin);
        int price = int(priceBin);

        // Check that blockHeight is after minBlock and not in the future
        require(blockHeight >= minBlock);
        require(tx.time >= blockHeight);

        // Check that current price is at least priceTarget
        require(price >= priceTarget);

        // Handle necessary signature checks
        require(checkDataSig(oracleSig, oracleMessage, oraclePk));
        require(checkSig(ownerSig, ownerPk));
    }
}
`.replace(/^\n+/, '').replace(/\n+$/, ''),
    asmBytecode: 'OP_6 OP_ROLL OP_SIZE OP_8 OP_EQUALVERIFY OP_DUP OP_4 OP_SPLIT OP_SWAP OP_BIN2NUM OP_SWAP OP_BIN2NUM OP_OVER OP_6 OP_ROLL OP_GREATERTHANOREQUAL OP_VERIFY OP_SWAP OP_CHECKLOCKTIMEVERIFY OP_DROP OP_4 OP_ROLL OP_GREATERTHANOREQUAL OP_VERIFY OP_4 OP_ROLL OP_SWAP OP_3 OP_ROLL OP_CHECKDATASIGVERIFY OP_CHECKSIG',
    sourceMap: '15:8:15:28;;;;;18:49:18:62;:69::70;:49::71:1;19:30:19:44:0;:26::45:1;20:24:20:32:0;:20::33:1;23:16:23:27:0;:31::39;;:16:::1;:8::41;24:27:24:38:0;:8::40:1;;27:25:27:36:0;;:16:::1;:8::38;30:29:30::0;;:40::53;:55::63;;:8::66:1;31::31:45',
    sourceTags: '0:4:pv',
    expectedLineToAsmMap: {
      15: 'OP_6 OP_ROLL OP_SIZE OP_8 OP_EQUALVERIFY',
      18: 'OP_DUP OP_4 OP_SPLIT',
      19: 'OP_SWAP OP_BIN2NUM',
      20: 'OP_SWAP OP_BIN2NUM',
      23: 'OP_OVER OP_6 OP_ROLL OP_GREATERTHANOREQUAL OP_VERIFY',
      24: 'OP_SWAP OP_CHECKLOCKTIMEVERIFY OP_DROP',
      27: 'OP_4 OP_ROLL OP_GREATERTHANOREQUAL OP_VERIFY',
      30: 'OP_4 OP_ROLL OP_SWAP OP_3 OP_ROLL OP_CHECKDATASIGVERIFY',
      31: 'OP_CHECKSIG',
    },
    expectedBitAuthScript: `
                                                        /* // This contract forces HODLing until a certain price target has been reached                                          */
                                                        /* // A minimum block is provided to ensure that oracle price entries from before this block are disregarded              */
                                                        /* // i.e. when the BCH price was $1000 in the past, an oracle entry with the old block number and price can not be used. */
                                                        /* // Instead, a message with a block number and price from after the minBlock needs to be passed.                        */
                                                        /* // This contract serves as a simple example for checkDataSig-based contracts.                                          */
                                                        /* contract HodlVault(                                                                                                    */
                                                        /*     pubkey ownerPk,                                                                                                    */
                                                        /*     pubkey oraclePk,                                                                                                   */
                                                        /*     int minBlock,                                                                                                      */
                                                        /*     int priceTarget                                                                                                    */
                                                        /* ) {                                                                                                                    */
                                                        /*     function spend(                                                                                                    */
                                                        /*         sig ownerSig,                                                                                                  */
                                                        /*         datasig oracleSig,                                                                                             */
                                                        /*         bytes8 oracleMessage                                                                                           */
                                                        /*     ) {                                                                                                                */
                                                        /*         // message: { blockHeight, price }                                                                             */
OP_6 OP_ROLL OP_SIZE OP_8 OP_EQUALVERIFY                /*         >>> parameter type check (bytes8 oracleMessage)                                                                */
OP_DUP OP_4 OP_SPLIT                                    /*         bytes4 blockHeightBin, bytes4 priceBin = oracleMessage.split(4);                                               */
OP_SWAP OP_BIN2NUM                                      /*         int blockHeight = int(blockHeightBin);                                                                         */
OP_SWAP OP_BIN2NUM                                      /*         int price = int(priceBin);                                                                                     */
                                                        /*                                                                                                                        */
                                                        /*         // Check that blockHeight is after minBlock and not in the future                                              */
OP_OVER OP_6 OP_ROLL OP_GREATERTHANOREQUAL OP_VERIFY    /*         require(blockHeight >= minBlock);                                                                              */
OP_SWAP OP_CHECKLOCKTIMEVERIFY OP_DROP                  /*         require(tx.time >= blockHeight);                                                                               */
                                                        /*                                                                                                                        */
                                                        /*         // Check that current price is at least priceTarget                                                            */
OP_4 OP_ROLL OP_GREATERTHANOREQUAL OP_VERIFY            /*         require(price >= priceTarget);                                                                                 */
                                                        /*                                                                                                                        */
                                                        /*         // Handle necessary signature checks                                                                           */
OP_4 OP_ROLL OP_SWAP OP_3 OP_ROLL OP_CHECKDATASIGVERIFY /*         require(checkDataSig(oracleSig, oracleMessage, oraclePk));                                                     */
OP_CHECKSIG                                             /*         require(checkSig(ownerSig, ownerPk));                                                                          */
                                                        /*     }                                                                                                                  */
                                                        /* }                                                                                                                      */
`.replace(/^\n+/, '').replace(/\n+$/, ''),
  },
  {
    name: 'for_while_nested.cash',
    sourceCode: `
contract ForWhileNested() {
    function spend() {
        int sum = 0;

        for (int i = 0; i < 2; i = i + 1) {
            int j = 0;

            while (j < 2) {
                sum = sum + i + j;
                j = j + 1;
                console.log("sum:", sum, "i:", i, "j:", j);
            }
        }

        require(sum == 4);
    }
}
`.replace(/^\n+/, '').replace(/\n+$/, ''),
    asmBytecode: 'OP_0 OP_0 OP_BEGIN OP_DUP OP_2 OP_LESSTHAN OP_DUP OP_TOALTSTACK OP_IF OP_0 OP_BEGIN OP_DUP OP_2 OP_LESSTHAN OP_DUP OP_TOALTSTACK OP_IF OP_2 OP_PICK OP_2 OP_PICK OP_ADD OP_OVER OP_ADD OP_3 OP_ROLL OP_DROP OP_SWAP OP_TOALTSTACK OP_SWAP OP_FROMALTSTACK OP_DUP OP_1ADD OP_NIP OP_ENDIF OP_FROMALTSTACK OP_NOT OP_UNTIL OP_OVER OP_1ADD OP_ROT OP_DROP OP_NIP OP_ENDIF OP_FROMALTSTACK OP_NOT OP_UNTIL OP_DROP OP_4 OP_NUMEQUAL',
    sourceMap: '3:18:3:19;5:21:5:22;:8:13:9;:24:5:25;:28::29;:24:::1;;;:42:13:9:0;6:20:6:21;8:12:12:13;:19:8:20;:23::24;:19:::1;;;:26:12:13:0;9:22:9:25;;:28::29;;:22:::1;:32::33:0;:22:::1;:16::34;;;;;;;10:20:10:21:0;:::25:1;:16::26;8:26:12:13;;:12;;5:35:5:36:0;:::40:1;:31;;::13:9;:42;;:8;;;15:23:15:24:0;:8::26:1',
    sourceTags: '38:42:fu',
    expectedLineToAsmMap: {
      3: 'OP_0',
      5: 'OP_0 OP_BEGIN OP_DUP OP_2 OP_LESSTHAN OP_DUP OP_TOALTSTACK OP_IF OP_OVER OP_1ADD OP_ROT OP_DROP',
      6: 'OP_0',
      8: 'OP_BEGIN OP_DUP OP_2 OP_LESSTHAN OP_DUP OP_TOALTSTACK OP_IF',
      9: 'OP_2 OP_PICK OP_2 OP_PICK OP_ADD OP_OVER OP_ADD OP_3 OP_ROLL OP_DROP OP_SWAP OP_TOALTSTACK OP_SWAP OP_FROMALTSTACK',
      10: 'OP_DUP OP_1ADD OP_NIP',
      12: 'OP_ENDIF OP_FROMALTSTACK OP_NOT OP_UNTIL',
      13: 'OP_NIP OP_ENDIF OP_FROMALTSTACK OP_NOT OP_UNTIL OP_DROP',
      15: 'OP_4 OP_NUMEQUAL',
    },
    expectedBitAuthScript: `
                                                                                                                   /* contract ForWhileNested() {                                 */
                                                                                                                   /*     function spend() {                                      */
OP_0                                                                                                               /*         int sum = 0;                                        */
                                                                                                                   /*                                                             */
OP_0 OP_BEGIN OP_DUP OP_2 OP_LESSTHAN OP_DUP OP_TOALTSTACK OP_IF                                                   /*         for (int i = 0; i < 2; i = i + 1) {                 */
OP_0                                                                                                               /*             int j = 0;                                      */
                                                                                                                   /*                                                             */
OP_BEGIN OP_DUP OP_2 OP_LESSTHAN OP_DUP OP_TOALTSTACK OP_IF                                                        /*             while (j < 2) {                                 */
OP_2 OP_PICK OP_2 OP_PICK OP_ADD OP_OVER OP_ADD OP_3 OP_ROLL OP_DROP OP_SWAP OP_TOALTSTACK OP_SWAP OP_FROMALTSTACK /*                 sum = sum + i + j;                          */
OP_DUP OP_1ADD OP_NIP                                                                                              /*                 j = j + 1;                                  */
                                                                                                                   /*                 console.log("sum:", sum, "i:", i, "j:", j); */
OP_ENDIF OP_FROMALTSTACK OP_NOT OP_UNTIL                                                                           /*             }                                               */
OP_OVER OP_1ADD OP_ROT OP_DROP OP_NIP                                                                              /*             >>> for-loop update (i = i + 1)                 */
OP_ENDIF OP_FROMALTSTACK OP_NOT OP_UNTIL OP_DROP                                                                   /*         }                                                   */
                                                                                                                   /*                                                             */
OP_4 OP_NUMEQUAL                                                                                                   /*         require(sum == 4);                                  */
                                                                                                                   /*     }                                                       */
                                                                                                                   /* }                                                           */
`.replace(/^\n+/, '').replace(/\n+$/, ''),
  },
  {
    name: 'NestedForWithDoWhile (nested for-loops + do-while)',
    sourceCode: `contract NestedForWithDoWhile() {
    function spend() {
        int total = 0;

        for (int i = 0; i < 3; i =
            i + 1) {
            for (int j = 0; j < 2; j = j + 1) {
                total = total + i + j;
            }
        }

        int count = 0;
        do {
            count = count + 1;
        } while (count < 3);

        require(total + count == 12);
    }
}`,
    asmBytecode: 'OP_0 OP_0 OP_BEGIN OP_DUP OP_3 OP_LESSTHAN OP_DUP OP_TOALTSTACK OP_IF OP_0 OP_BEGIN OP_DUP OP_2 OP_LESSTHAN OP_DUP OP_TOALTSTACK OP_IF OP_2 OP_PICK OP_2 OP_PICK OP_ADD OP_OVER OP_ADD OP_3 OP_ROLL OP_DROP OP_SWAP OP_TOALTSTACK OP_SWAP OP_FROMALTSTACK OP_DUP OP_1ADD OP_NIP OP_ENDIF OP_FROMALTSTACK OP_NOT OP_UNTIL OP_DROP OP_DUP OP_1ADD OP_NIP OP_ENDIF OP_FROMALTSTACK OP_NOT OP_UNTIL OP_DROP OP_0 OP_BEGIN OP_DUP OP_1ADD OP_NIP OP_DUP OP_3 OP_GREATERTHANOREQUAL OP_UNTIL OP_ADD OP_12 OP_NUMEQUAL',
    sourceMap: '3:20:3:21;5:21:5:22;:8:10:9;:24:5:25;:28::29;:24:::1;;;6:19:10:9:0;7:25:7:26;:12:9:13;:28:7:29;:32::33;:28:::1;;;:46:9:13:0;8:24:8:29;;:32::33;;:24:::1;:36::37:0;:24:::1;:16::38;;;;;;;7:39:7:40:0;:::44:1;:35;:46:9:13;;:12;;;6::6::0;:::17:1;5:31;6:19:10:9;;5:8;;;12:20:12:21:0;13:8:15:28;14:20:14:25;:::29:1;:12::30;15:17:15:22:0;:25::26;13:8::28:1;;17:16:17:29;:33::35:0;:8::37:1',
    sourceTags: '31:33:fu;39:41:fu',
    expectedLineToAsmMap: {
      3: 'OP_0',
      5: 'OP_0 OP_BEGIN OP_DUP OP_3 OP_LESSTHAN OP_DUP OP_TOALTSTACK',
      6: 'OP_IF OP_DUP OP_1ADD OP_NIP',
      7: 'OP_0 OP_BEGIN OP_DUP OP_2 OP_LESSTHAN OP_DUP OP_TOALTSTACK OP_IF OP_DUP OP_1ADD OP_NIP',
      8: 'OP_2 OP_PICK OP_2 OP_PICK OP_ADD OP_OVER OP_ADD OP_3 OP_ROLL OP_DROP OP_SWAP OP_TOALTSTACK OP_SWAP OP_FROMALTSTACK',
      9: 'OP_ENDIF OP_FROMALTSTACK OP_NOT OP_UNTIL OP_DROP',
      10: 'OP_ENDIF OP_FROMALTSTACK OP_NOT OP_UNTIL OP_DROP',
      12: 'OP_0',
      13: 'OP_BEGIN',
      14: 'OP_DUP OP_1ADD OP_NIP',
      15: 'OP_DUP OP_3 OP_GREATERTHANOREQUAL OP_UNTIL',
      17: 'OP_ADD OP_12 OP_NUMEQUAL',
    },
    expectedBitAuthScript: `
                                                                                                                   /* contract NestedForWithDoWhile() {               */
                                                                                                                   /*     function spend() {                          */
OP_0                                                                                                               /*         int total = 0;                          */
                                                                                                                   /*                                                 */
OP_0 OP_BEGIN OP_DUP OP_3 OP_LESSTHAN OP_DUP OP_TOALTSTACK                                                         /*         for (int i = 0; i < 3; i =              */
OP_IF                                                                                                              /*             i + 1) {                            */
OP_0 OP_BEGIN OP_DUP OP_2 OP_LESSTHAN OP_DUP OP_TOALTSTACK OP_IF                                                   /*             for (int j = 0; j < 2; j = j + 1) { */
OP_2 OP_PICK OP_2 OP_PICK OP_ADD OP_OVER OP_ADD OP_3 OP_ROLL OP_DROP OP_SWAP OP_TOALTSTACK OP_SWAP OP_FROMALTSTACK /*                 total = total + i + j;          */
OP_DUP OP_1ADD OP_NIP                                                                                              /*                 >>> for-loop update (j = j + 1) */
OP_ENDIF OP_FROMALTSTACK OP_NOT OP_UNTIL OP_DROP                                                                   /*             }                                   */
OP_DUP OP_1ADD OP_NIP                                                                                              /*             >>> for-loop update (i + 1)         */
OP_ENDIF OP_FROMALTSTACK OP_NOT OP_UNTIL OP_DROP                                                                   /*         }                                       */
                                                                                                                   /*                                                 */
OP_0                                                                                                               /*         int count = 0;                          */
OP_BEGIN                                                                                                           /*         do {                                    */
OP_DUP OP_1ADD OP_NIP                                                                                              /*             count = count + 1;                  */
OP_DUP OP_3 OP_GREATERTHANOREQUAL OP_UNTIL                                                                         /*         } while (count < 3);                    */
                                                                                                                   /*                                                 */
OP_ADD OP_12 OP_NUMEQUAL                                                                                           /*         require(total + count == 12);           */
                                                                                                                   /*     }                                           */
                                                                                                                   /* }                                               */
`.replace(/^\n+/, '').replace(/\n+$/, ''),
  },
  {
    name: 'ParameterCheck (parameter type check)',
    sourceCode: `contract ParameterCheck() {
    function spend(
        bytes8 tag,
    ) {
        require(tag.length == 8);
    }
}`,
    asmBytecode: 'OP_SIZE OP_8 OP_EQUALVERIFY OP_SIZE OP_NIP OP_8 OP_NUMEQUAL',
    sourceMap: '3:8:3:18;;;5:16:5:26:1;;:30::31:0;:8::33:1',
    sourceTags: '0:2:pv',
    expectedLineToAsmMap: {
      3: 'OP_SIZE OP_8 OP_EQUALVERIFY',
      5: 'OP_SIZE OP_NIP OP_8 OP_NUMEQUAL',
    },
    expectedBitAuthScript: `
                                /* contract ParameterCheck() {                   */
                                /*     function spend(                           */
                                /*         bytes8 tag,                           */
                                /*     ) {                                       */
OP_SIZE OP_8 OP_EQUALVERIFY     /*         >>> parameter type check (bytes8 tag) */
OP_SIZE OP_NIP OP_8 OP_NUMEQUAL /*         require(tag.length == 8);             */
                                /*     }                                         */
                                /* }                                             */
`.replace(/^\n+/, '').replace(/\n+$/, ''),
  },
  {
    name: 'OnlyLocktimeGuard (injected locktime guard)',
    sourceCode: `contract LocktimeGuard() {
    function spend() {
        require(tx.locktime >= 1);
    }
}`,
    asmBytecode: 'OP_TXLOCKTIME OP_CHECKLOCKTIMEVERIFY OP_DROP OP_TXLOCKTIME OP_1 OP_GREATERTHANOREQUAL',
    sourceMap: '2:21:2:21;::::1;;3:16:3:27:0;:31::32;:8::34:1',
    sourceTags: '0:2:lg',
    expectedLineToAsmMap: {
      2: 'OP_TXLOCKTIME OP_CHECKLOCKTIMEVERIFY OP_DROP',
      3: 'OP_TXLOCKTIME OP_1 OP_GREATERTHANOREQUAL',
    },
    expectedBitAuthScript: `
                                             /* contract LocktimeGuard() {                    */
                                             /*     function spend() {                        */
OP_TXLOCKTIME OP_CHECKLOCKTIMEVERIFY OP_DROP /*         >>> tx.locktime guard (auto-injected) */
OP_TXLOCKTIME OP_1 OP_GREATERTHANOREQUAL     /*         require(tx.locktime >= 1);            */
                                             /*     }                                         */
                                             /* }                                             */
`.replace(/^\n+/, '').replace(/\n+$/, ''),
  },
  {
    name: 'ParameterLocktimeGuard (parameter type check + injected locktime guard)',
    sourceCode: `contract ParameterLocktimeGuard() {
    function spend(bytes8 tag) {
        require(tag.length == 8);
        require(tx.locktime >= 1);
    }
}`,
    asmBytecode: 'OP_SIZE OP_8 OP_EQUALVERIFY OP_TXLOCKTIME OP_CHECKLOCKTIMEVERIFY OP_DROP OP_SIZE OP_NIP OP_8 OP_NUMEQUALVERIFY OP_TXLOCKTIME OP_1 OP_GREATERTHANOREQUAL',
    sourceMap: '2:19:2:29;;;:31::31;::::1;;3:16:3:26;;:30::31:0;:8::33:1;4:16:4:27:0;:31::32;:8::34:1',
    sourceTags: '0:2:pv;3:5:lg',
    expectedLineToAsmMap: {
      2: 'OP_SIZE OP_8 OP_EQUALVERIFY OP_TXLOCKTIME OP_CHECKLOCKTIMEVERIFY OP_DROP',
      3: 'OP_SIZE OP_NIP OP_8 OP_NUMEQUALVERIFY',
      4: 'OP_TXLOCKTIME OP_1 OP_GREATERTHANOREQUAL',
    },
    expectedBitAuthScript: `
                                             /* contract ParameterLocktimeGuard() {           */
                                             /*     function spend(bytes8 tag) {              */
OP_SIZE OP_8 OP_EQUALVERIFY                  /*         >>> parameter type check (bytes8 tag) */
OP_TXLOCKTIME OP_CHECKLOCKTIMEVERIFY OP_DROP /*         >>> tx.locktime guard (auto-injected) */
OP_SIZE OP_NIP OP_8 OP_NUMEQUALVERIFY        /*         require(tag.length == 8);             */
OP_TXLOCKTIME OP_1 OP_GREATERTHANOREQUAL     /*         require(tx.locktime >= 1);            */
                                             /*     }                                         */
                                             /* }                                             */
`.replace(/^\n+/, '').replace(/\n+$/, ''),
  },
];
