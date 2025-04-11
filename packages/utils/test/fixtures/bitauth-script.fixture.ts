/* eslint-disable max-len */
import { LineToAsmMap, LineToOpcodesMap } from '@cashscript/utils';
import { Op } from '../../src/script.js';
import { hexToBin } from '@bitauth/libauth';

export interface Fixture {
  name: string;
  sourceCode: string;
  asmBytecode: string;
  sourceMap: string;
  expectedLineToOpcodeMap: LineToOpcodesMap;
  expectedLineToAsmMap: LineToAsmMap;
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
    require(senderPkh == 0xdeadbeef);
    require(timeout == timeout);
    require(s == s);
    require(signingPk == signingPk);
    require(checkSig(s, signingPk));
    require(hash160(signingPk) == senderPkh);
    require(tx.time >= timeout);
  }
}`,
    asmBytecode: 'OP_3 OP_PICK OP_0 OP_NUMEQUAL OP_IF OP_5 OP_ROLL OP_5 OP_PICK OP_CHECKSIG OP_VERIFY OP_4 OP_ROLL OP_HASH160 OP_2 OP_ROLL OP_EQUAL OP_NIP OP_NIP OP_NIP OP_ELSE OP_3 OP_ROLL OP_1 OP_NUMEQUAL OP_VERIFY OP_0 OP_PICK deadbeef OP_EQUAL OP_VERIFY OP_2 OP_PICK OP_3 OP_PICK OP_NUMEQUAL OP_VERIFY OP_4 OP_PICK OP_5 OP_PICK OP_EQUAL OP_VERIFY OP_3 OP_PICK OP_4 OP_PICK OP_EQUAL OP_VERIFY OP_4 OP_ROLL OP_4 OP_PICK OP_CHECKSIG OP_VERIFY OP_3 OP_ROLL OP_HASH160 OP_1 OP_ROLL OP_EQUAL OP_VERIFY OP_1 OP_ROLL OP_CHECKLOCKTIMEVERIFY OP_DROP OP_1 OP_NIP OP_ENDIF',
    sourceMap: '3:2:6:3;;;;;4:21:4:22;;:24::33;;:12::34:1;:4::36;5:20:5:29:0;;:12::30:1;:34::46:0;;:12:::1;3:2:6:3;;;;8::16::0;;;;;9:12:9:21;;:25::35;:12:::1;:4::37;10:12:10:19:0;;:23::30;;:12:::1;:4::32;11:12:11:13:0;;:17::18;;:12:::1;:4::20;12:12:12:21:0;;:25::34;;:12:::1;:4::36;13:21:13:22:0;;:24::33;;:12::34:1;:4::36;14:20:14:29:0;;:12::30:1;:34::43:0;;:12:::1;:4::45;15:23:15:30:0;;:4::32:1;;8:2:16:3;;2:0:17:1',
    expectedLineToOpcodeMap: {
      3: [Op.OP_3, Op.OP_PICK, new Uint8Array([]), Op.OP_NUMEQUAL, Op.OP_IF],
      4: [Op.OP_5, Op.OP_ROLL, Op.OP_5, Op.OP_PICK, Op.OP_CHECKSIG, Op.OP_VERIFY],
      5: [Op.OP_4, Op.OP_ROLL, Op.OP_HASH160, Op.OP_2, Op.OP_ROLL, Op.OP_EQUAL],
      6: [Op.OP_NIP, Op.OP_NIP, Op.OP_NIP, Op.OP_ELSE],
      8: [Op.OP_3, Op.OP_ROLL, Op.OP_1, Op.OP_NUMEQUAL, Op.OP_VERIFY],
      9: [new Uint8Array([]), Op.OP_PICK, new Uint8Array([0xde, 0xad, 0xbe, 0xef]), Op.OP_EQUAL, Op.OP_VERIFY],
      10: [Op.OP_2, Op.OP_PICK, Op.OP_3, Op.OP_PICK, Op.OP_NUMEQUAL, Op.OP_VERIFY],
      11: [Op.OP_4, Op.OP_PICK, Op.OP_5, Op.OP_PICK, Op.OP_EQUAL, Op.OP_VERIFY],
      12: [Op.OP_3, Op.OP_PICK, Op.OP_4, Op.OP_PICK, Op.OP_EQUAL, Op.OP_VERIFY],
      13: [Op.OP_4, Op.OP_ROLL, Op.OP_4, Op.OP_PICK, Op.OP_CHECKSIG, Op.OP_VERIFY],
      14: [Op.OP_3, Op.OP_ROLL, Op.OP_HASH160, Op.OP_1, Op.OP_ROLL, Op.OP_EQUAL, Op.OP_VERIFY],
      15: [Op.OP_1, Op.OP_ROLL, Op.OP_CHECKLOCKTIMEVERIFY, Op.OP_DROP],
      16: [Op.OP_1, Op.OP_NIP],
      17: [Op.OP_ENDIF],
    },
    expectedLineToAsmMap: {
      3: 'OP_3 OP_PICK OP_0 OP_NUMEQUAL OP_IF',
      4: 'OP_5 OP_ROLL OP_5 OP_PICK OP_CHECKSIG OP_VERIFY',
      5: 'OP_4 OP_ROLL OP_HASH160 OP_2 OP_ROLL OP_EQUAL',
      6: 'OP_NIP OP_NIP OP_NIP OP_ELSE',
      8: 'OP_3 OP_ROLL OP_1 OP_NUMEQUAL OP_VERIFY',
      9: 'OP_0 OP_PICK <0xdeadbeef> OP_EQUAL OP_VERIFY',
      10: 'OP_2 OP_PICK OP_3 OP_PICK OP_NUMEQUAL OP_VERIFY',
      11: 'OP_4 OP_PICK OP_5 OP_PICK OP_EQUAL OP_VERIFY',
      12: 'OP_3 OP_PICK OP_4 OP_PICK OP_EQUAL OP_VERIFY',
      13: 'OP_4 OP_ROLL OP_4 OP_PICK OP_CHECKSIG OP_VERIFY',
      14: 'OP_3 OP_ROLL OP_HASH160 OP_1 OP_ROLL OP_EQUAL OP_VERIFY',
      15: 'OP_1 OP_ROLL OP_CHECKLOCKTIMEVERIFY OP_DROP',
      16: 'OP_1 OP_NIP',
      17: 'OP_ENDIF',
    },
    expectedBitAuthScript: `
                                                        /*                                                                                      */
                                                        /* contract TransferWithTimeout(bytes20 senderPkh, bytes20 recipientPkh, int timeout) { */
OP_3 OP_PICK OP_0 OP_NUMEQUAL OP_IF                     /*   function transfer(pubkey signingPk, sig s) {                                       */
OP_5 OP_ROLL OP_5 OP_PICK OP_CHECKSIG OP_VERIFY         /*     require(checkSig(s, signingPk));                                                 */
OP_4 OP_ROLL OP_HASH160 OP_2 OP_ROLL OP_EQUAL           /*     require(hash160(signingPk) == recipientPkh);                                     */
OP_NIP OP_NIP OP_NIP OP_ELSE                            /*   }                                                                                  */
                                                        /*                                                                                      */
OP_3 OP_ROLL OP_1 OP_NUMEQUAL OP_VERIFY                 /*   function timeout(pubkey signingPk, sig s) {                                        */
OP_0 OP_PICK <0xdeadbeef> OP_EQUAL OP_VERIFY            /*     require(senderPkh == 0xdeadbeef);                                                */
OP_2 OP_PICK OP_3 OP_PICK OP_NUMEQUAL OP_VERIFY         /*     require(timeout == timeout);                                                     */
OP_4 OP_PICK OP_5 OP_PICK OP_EQUAL OP_VERIFY            /*     require(s == s);                                                                 */
OP_3 OP_PICK OP_4 OP_PICK OP_EQUAL OP_VERIFY            /*     require(signingPk == signingPk);                                                 */
OP_4 OP_ROLL OP_4 OP_PICK OP_CHECKSIG OP_VERIFY         /*     require(checkSig(s, signingPk));                                                 */
OP_3 OP_ROLL OP_HASH160 OP_1 OP_ROLL OP_EQUAL OP_VERIFY /*     require(hash160(signingPk) == senderPkh);                                        */
OP_1 OP_ROLL OP_CHECKLOCKTIMEVERIFY OP_DROP             /*     require(tx.time >= timeout);                                                     */
OP_1 OP_NIP                                             /*   }                                                                                  */
OP_ENDIF                                                /* }                                                                                    */
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
    asmBytecode: 'OP_3 OP_PICK OP_0 OP_NUMEQUAL OP_IF OP_0 OP_OUTPUTBYTECODE 76a914 OP_2 OP_ROLL OP_CAT 88ac OP_CAT OP_EQUAL OP_VERIFY e803 OP_INPUTINDEX OP_UTXOVALUE OP_0 OP_PICK OP_4 OP_PICK OP_SUB OP_2 OP_PICK OP_SUB OP_0 OP_PICK OP_5 OP_PICK OP_4 OP_PICK OP_ADD OP_LESSTHANOREQUAL OP_IF OP_0 OP_OUTPUTVALUE OP_2 OP_PICK OP_4 OP_PICK OP_SUB OP_NUMEQUAL OP_VERIFY OP_ELSE OP_0 OP_OUTPUTVALUE OP_5 OP_PICK OP_NUMEQUAL OP_VERIFY OP_1 OP_OUTPUTBYTECODE OP_INPUTINDEX OP_UTXOBYTECODE OP_EQUAL OP_VERIFY OP_1 OP_OUTPUTVALUE OP_1 OP_PICK OP_NUMEQUAL OP_VERIFY OP_ENDIF OP_1 OP_NIP OP_NIP OP_NIP OP_NIP OP_NIP OP_NIP OP_ELSE OP_3 OP_ROLL OP_1 OP_NUMEQUAL OP_VERIFY OP_3 OP_PICK OP_HASH160 OP_2 OP_ROLL OP_EQUAL OP_VERIFY OP_3 OP_ROLL OP_3 OP_ROLL OP_CHECKSIG OP_NIP OP_NIP OP_ENDIF',
    sourceMap: '9:4:28:5;;;;;13:27:13:28;:16::45:1;:49::84:0;:74::83;;:49::84:1;;;:16;:8::86;15:23:15:27:0;16:37:16:58;:27::65:1;17:26:17:38:0;;:41::47;;:26:::1;:50::58:0;;:26:::1;21:12:21:23:0;;:27::33;;:36::44;;:27:::1;:12;:46:23:9:0;22:31:22:32;:20::39:1;:43::55:0;;:58::66;;:43:::1;:20;:12::68;23:15:27:9:0;24:31:24:32;:20::39:1;:43::49:0;;:20:::1;:12::51;25:31:25:32:0;:20::49:1;:63::84:0;:53::101:1;:20;:12::103;26:31:26:32:0;:20::39:1;:43::54:0;;:20:::1;:12::56;23:15:27:9;9:4:28:5;;;;;;;;30::33::0;;;;;31:24:31:26;;:16::27:1;:31::37:0;;:16:::1;:8::39;32:25:32:26:0;;:28::30;;:16::31:1;30:4:33:5;;8:0:34:1',
    expectedLineToOpcodeMap: {
      9: [Op.OP_3, Op.OP_PICK, new Uint8Array([]), Op.OP_NUMEQUAL, Op.OP_IF],
      13: [new Uint8Array([]), Op.OP_OUTPUTBYTECODE, hexToBin('76a914'), Op.OP_2, Op.OP_ROLL, Op.OP_CAT, hexToBin('88ac'), Op.OP_CAT, Op.OP_EQUAL, Op.OP_VERIFY],
      15: [hexToBin('e803')],
      16: [Op.OP_INPUTINDEX, Op.OP_UTXOVALUE],
      17: [new Uint8Array([]), Op.OP_PICK, Op.OP_4, Op.OP_PICK, Op.OP_SUB, Op.OP_2, Op.OP_PICK, Op.OP_SUB],
      21: [new Uint8Array([]), Op.OP_PICK, Op.OP_5, Op.OP_PICK, Op.OP_4, Op.OP_PICK, Op.OP_ADD, Op.OP_LESSTHANOREQUAL, Op.OP_IF],
      22: [new Uint8Array([]), Op.OP_OUTPUTVALUE, Op.OP_2, Op.OP_PICK, Op.OP_4, Op.OP_PICK, Op.OP_SUB, Op.OP_NUMEQUAL, Op.OP_VERIFY],
      23: [Op.OP_ELSE],
      24: [new Uint8Array([]), Op.OP_OUTPUTVALUE, Op.OP_5, Op.OP_PICK, Op.OP_NUMEQUAL, Op.OP_VERIFY],
      25: [Op.OP_1, Op.OP_OUTPUTBYTECODE, Op.OP_INPUTINDEX, Op.OP_UTXOBYTECODE, Op.OP_EQUAL, Op.OP_VERIFY],
      26: [Op.OP_1, Op.OP_OUTPUTVALUE, Op.OP_1, Op.OP_PICK, Op.OP_NUMEQUAL, Op.OP_VERIFY],
      27: [Op.OP_ENDIF],
      28: [Op.OP_1, Op.OP_NIP, Op.OP_NIP, Op.OP_NIP, Op.OP_NIP, Op.OP_NIP, Op.OP_NIP, Op.OP_ELSE],
      30: [Op.OP_3, Op.OP_ROLL, Op.OP_1, Op.OP_NUMEQUAL, Op.OP_VERIFY],
      31: [Op.OP_3, Op.OP_PICK, Op.OP_HASH160, Op.OP_2, Op.OP_ROLL, Op.OP_EQUAL, Op.OP_VERIFY],
      32: [Op.OP_3, Op.OP_ROLL, Op.OP_3, Op.OP_ROLL, Op.OP_CHECKSIG],
      33: [Op.OP_NIP, Op.OP_NIP],
      34: [Op.OP_ENDIF],
    },
    expectedLineToAsmMap: {
      9: 'OP_3 OP_PICK OP_0 OP_NUMEQUAL OP_IF',
      13: 'OP_0 OP_OUTPUTBYTECODE <0x76a914> OP_2 OP_ROLL OP_CAT <0x88ac> OP_CAT OP_EQUAL OP_VERIFY',
      15: '<0xe803>',
      16: 'OP_INPUTINDEX OP_UTXOVALUE',
      17: 'OP_0 OP_PICK OP_4 OP_PICK OP_SUB OP_2 OP_PICK OP_SUB',
      21: 'OP_0 OP_PICK OP_5 OP_PICK OP_4 OP_PICK OP_ADD OP_LESSTHANOREQUAL OP_IF',
      22: 'OP_0 OP_OUTPUTVALUE OP_2 OP_PICK OP_4 OP_PICK OP_SUB OP_NUMEQUAL OP_VERIFY',
      23: 'OP_ELSE',
      24: 'OP_0 OP_OUTPUTVALUE OP_5 OP_PICK OP_NUMEQUAL OP_VERIFY',
      25: 'OP_1 OP_OUTPUTBYTECODE OP_INPUTINDEX OP_UTXOBYTECODE OP_EQUAL OP_VERIFY',
      26: 'OP_1 OP_OUTPUTVALUE OP_1 OP_PICK OP_NUMEQUAL OP_VERIFY',
      27: 'OP_ENDIF',
      28: 'OP_1 OP_NIP OP_NIP OP_NIP OP_NIP OP_NIP OP_NIP OP_ELSE',
      30: 'OP_3 OP_ROLL OP_1 OP_NUMEQUAL OP_VERIFY',
      31: 'OP_3 OP_PICK OP_HASH160 OP_2 OP_ROLL OP_EQUAL OP_VERIFY',
      32: 'OP_3 OP_ROLL OP_3 OP_ROLL OP_CHECKSIG',
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
OP_3 OP_PICK OP_0 OP_NUMEQUAL OP_IF                                                      /*     function receive() {                                                                                           */
                                                                                         /*         // require(this.age >= period);                                                                            */
                                                                                         /*                                                                                                                    */
                                                                                         /*         // Check that the first output sends to the recipient                                                      */
OP_0 OP_OUTPUTBYTECODE <0x76a914> OP_2 OP_ROLL OP_CAT <0x88ac> OP_CAT OP_EQUAL OP_VERIFY /*         require(tx.outputs[0].lockingBytecode == new LockingBytecodeP2PKH(recipient));                             */
                                                                                         /*                                                                                                                    */
<0xe803>                                                                                 /*         int minerFee = 1000;                                                                                       */
OP_INPUTINDEX OP_UTXOVALUE                                                               /*         int currentValue = tx.inputs[this.activeInputIndex].value;                                                 */
OP_0 OP_PICK OP_4 OP_PICK OP_SUB OP_2 OP_PICK OP_SUB                                     /*         int changeValue = currentValue - pledge - minerFee;                                                        */
                                                                                         /*                                                                                                                    */
                                                                                         /*         // If there is not enough left for *another* pledge after this one, we send the remainder to the recipient */
                                                                                         /*         // Otherwise we send the remainder to the recipient and the change back to the contract                    */
OP_0 OP_PICK OP_5 OP_PICK OP_4 OP_PICK OP_ADD OP_LESSTHANOREQUAL OP_IF                   /*         if (changeValue <= pledge + minerFee) {                                                                    */
OP_0 OP_OUTPUTVALUE OP_2 OP_PICK OP_4 OP_PICK OP_SUB OP_NUMEQUAL OP_VERIFY               /*             require(tx.outputs[0].value == currentValue - minerFee);                                               */
OP_ELSE                                                                                  /*         } else {                                                                                                   */
OP_0 OP_OUTPUTVALUE OP_5 OP_PICK OP_NUMEQUAL OP_VERIFY                                   /*             require(tx.outputs[0].value == pledge);                                                                */
OP_1 OP_OUTPUTBYTECODE OP_INPUTINDEX OP_UTXOBYTECODE OP_EQUAL OP_VERIFY                  /*             require(tx.outputs[1].lockingBytecode == tx.inputs[this.activeInputIndex].lockingBytecode);            */
OP_1 OP_OUTPUTVALUE OP_1 OP_PICK OP_NUMEQUAL OP_VERIFY                                   /*             require(tx.outputs[1].value == changeValue);                                                           */
OP_ENDIF                                                                                 /*         }                                                                                                          */
OP_1 OP_NIP OP_NIP OP_NIP OP_NIP OP_NIP OP_NIP OP_ELSE                                   /*     }                                                                                                              */
                                                                                         /*                                                                                                                    */
OP_3 OP_ROLL OP_1 OP_NUMEQUAL OP_VERIFY                                                  /*     function reclaim(pubkey pk, sig s) {                                                                           */
OP_3 OP_PICK OP_HASH160 OP_2 OP_ROLL OP_EQUAL OP_VERIFY                                  /*         require(hash160(pk) == funder);                                                                            */
OP_3 OP_ROLL OP_3 OP_ROLL OP_CHECKSIG                                                    /*         require(checkSig(s, pk));                                                                                  */
OP_NIP OP_NIP                                                                            /*     }                                                                                                              */
OP_ENDIF                                                                                 /* }                                                                                                                  */
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
    function spend(sig ownerSig, datasig oracleSig, bytes8 oracleMessage) {
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
    asmBytecode: 'OP_6 OP_PICK OP_4 OP_SPLIT OP_1 OP_ROLL OP_BIN2NUM OP_1 OP_ROLL OP_BIN2NUM OP_1 OP_PICK OP_5 OP_ROLL OP_GREATERTHANOREQUAL OP_VERIFY OP_1 OP_ROLL OP_CHECKLOCKTIMEVERIFY OP_DROP OP_0 OP_ROLL OP_3 OP_ROLL OP_GREATERTHANOREQUAL OP_VERIFY OP_3 OP_ROLL OP_4 OP_ROLL OP_3 OP_ROLL OP_CHECKDATASIG OP_VERIFY OP_1 OP_ROLL OP_1 OP_ROLL OP_CHECKSIG',
    sourceMap: '14:49:14:62;;:69::70;:49::71:1;15:30:15:44:0;;:26::45:1;16:24:16:32:0;;:20::33:1;19:16:19:27:0;;:31::39;;:16:::1;:8::41;20:27:20:38:0;;:8::40:1;;23:16:23:21:0;;:25::36;;:16:::1;:8::38;26:29:26::0;;:40::53;;:55::63;;:16::64:1;:8::66;27:25:27:33:0;;:35::42;;:16::43:1',
    expectedLineToOpcodeMap: {
      14: [Op.OP_6, Op.OP_PICK, Op.OP_4, Op.OP_SPLIT],
      15: [Op.OP_1, Op.OP_ROLL, Op.OP_BIN2NUM],
      16: [Op.OP_1, Op.OP_ROLL, Op.OP_BIN2NUM],
      19: [Op.OP_1, Op.OP_PICK, Op.OP_5, Op.OP_ROLL, Op.OP_GREATERTHANOREQUAL, Op.OP_VERIFY],
      20: [Op.OP_1, Op.OP_ROLL, Op.OP_CHECKLOCKTIMEVERIFY, Op.OP_DROP],
      23: [new Uint8Array([]), Op.OP_ROLL, Op.OP_3, Op.OP_ROLL, Op.OP_GREATERTHANOREQUAL, Op.OP_VERIFY],
      26: [Op.OP_3, Op.OP_ROLL, Op.OP_4, Op.OP_ROLL, Op.OP_3, Op.OP_ROLL, Op.OP_CHECKDATASIG, Op.OP_VERIFY],
      27: [Op.OP_1, Op.OP_ROLL, Op.OP_1, Op.OP_ROLL, Op.OP_CHECKSIG],
    },
    expectedLineToAsmMap: {
      14: 'OP_6 OP_PICK OP_4 OP_SPLIT',
      15: 'OP_1 OP_ROLL OP_BIN2NUM',
      16: 'OP_1 OP_ROLL OP_BIN2NUM',
      19: 'OP_1 OP_PICK OP_5 OP_ROLL OP_GREATERTHANOREQUAL OP_VERIFY',
      20: 'OP_1 OP_ROLL OP_CHECKLOCKTIMEVERIFY OP_DROP',
      23: 'OP_0 OP_ROLL OP_3 OP_ROLL OP_GREATERTHANOREQUAL OP_VERIFY',
      26: 'OP_3 OP_ROLL OP_4 OP_ROLL OP_3 OP_ROLL OP_CHECKDATASIG OP_VERIFY',
      27: 'OP_1 OP_ROLL OP_1 OP_ROLL OP_CHECKSIG',
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
                                                                 /*     function spend(sig ownerSig, datasig oracleSig, bytes8 oracleMessage) {                                            */
                                                                 /*         // message: { blockHeight, price }                                                                             */
OP_6 OP_PICK OP_4 OP_SPLIT                                       /*         bytes4 blockHeightBin, bytes4 priceBin = oracleMessage.split(4);                                               */
OP_1 OP_ROLL OP_BIN2NUM                                          /*         int blockHeight = int(blockHeightBin);                                                                         */
OP_1 OP_ROLL OP_BIN2NUM                                          /*         int price = int(priceBin);                                                                                     */
                                                                 /*                                                                                                                        */
                                                                 /*         // Check that blockHeight is after minBlock and not in the future                                              */
OP_1 OP_PICK OP_5 OP_ROLL OP_GREATERTHANOREQUAL OP_VERIFY        /*         require(blockHeight >= minBlock);                                                                              */
OP_1 OP_ROLL OP_CHECKLOCKTIMEVERIFY OP_DROP                      /*         require(tx.time >= blockHeight);                                                                               */
                                                                 /*                                                                                                                        */
                                                                 /*         // Check that current price is at least priceTarget                                                            */
OP_0 OP_ROLL OP_3 OP_ROLL OP_GREATERTHANOREQUAL OP_VERIFY        /*         require(price >= priceTarget);                                                                                 */
                                                                 /*                                                                                                                        */
                                                                 /*         // Handle necessary signature checks                                                                           */
OP_3 OP_ROLL OP_4 OP_ROLL OP_3 OP_ROLL OP_CHECKDATASIG OP_VERIFY /*         require(checkDataSig(oracleSig, oracleMessage, oraclePk));                                                     */
OP_1 OP_ROLL OP_1 OP_ROLL OP_CHECKSIG                            /*         require(checkSig(ownerSig, ownerPk));                                                                          */
                                                                 /*     }                                                                                                                  */
                                                                 /* }                                                                                                                      */
`.replace(/^\n+/, '').replace(/\n+$/, ''),
  },
];
