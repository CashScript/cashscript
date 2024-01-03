import { LineToAsmMap, LineToOpcodesMap } from '@cashscript/utils';
import { Op } from '../../src/script.js';

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
    name: 'TransferWithTimeout',
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
    sourceMap: '3:2:6:3;;;;;4:21:4:22;;:24::33;;:12::34;:4::36;5:20:5:29;;:12::30;:34::46;;:12;3:2:6:3:1;;;;8::16::0;;;;;9:12:9:21;;:25::35;:12;:4::37;10:12:10:19;;:23::30;;:12;:4::32;11:12:11:13;;:17::18;;:12;:4::20;12:12:12:21;;:25::34;;:12;:4::36;13:21:13:22;;:24::33;;:12::34;:4::36;14:20:14:29;;:12::30;:34::43;;:12;:4::45;15:23:15:30;;:4::32;;8:2:16:3:1;;',
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
      16: [Op.OP_1, Op.OP_NIP, Op.OP_ENDIF],
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
      16: 'OP_1 OP_NIP OP_ENDIF',
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
OP_1 OP_NIP OP_ENDIF                                    /*   }                                                                                  */
                                                        /* }                                                                                    */
`.replace(/^\n+/, '').replace(/\n+$/, ''),
  },
];
