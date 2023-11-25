import { asmToScript } from '../src/index.js';
import { formatLibauthScript } from '../src/libauth.js';

it('test formatting libauth input', () => {
  const code = 'OP_3 OP_PICK OP_0 OP_NUMEQUAL OP_IF OP_5 OP_ROLL OP_5 OP_PICK OP_CHECKSIG OP_VERIFY OP_4 OP_ROLL OP_HASH160 OP_2 OP_ROLL OP_EQUAL OP_NIP OP_NIP OP_NIP OP_ELSE OP_3 OP_ROLL OP_1 OP_NUMEQUAL OP_VERIFY OP_0 OP_PICK deadbeef OP_EQUAL OP_VERIFY OP_2 OP_PICK OP_3 OP_PICK OP_NUMEQUAL OP_VERIFY OP_4 OP_PICK OP_5 OP_PICK OP_EQUAL OP_VERIFY OP_3 OP_PICK OP_4 OP_PICK OP_EQUAL OP_VERIFY OP_4 OP_ROLL OP_4 OP_PICK OP_CHECKSIG OP_VERIFY OP_3 OP_ROLL OP_HASH160 OP_1 OP_ROLL OP_EQUAL OP_VERIFY OP_1 OP_ROLL OP_CHECKLOCKTIMEVERIFY OP_DROP OP_1 OP_NIP OP_ENDIF';
  const bytecode = asmToScript(code);
  const sourceMap = '3:2:6:3;;;;;4:21:4:22;;:24::33;;:12::34;:4::36;5:20:5:29;;:12::30;:34::46;;:12;3:2:6:3:1;;;;8::16::0;;;;;9:12:9:21;;:25::35;:12;:4::37;10:12:10:19;;:23::30;;:12;:4::32;11:12:11:13;;:17::18;;:12;:4::20;12:12:12:21;;:25::34;;:12;:4::36;13:21:13:22;;:24::33;;:12::34;:4::36;14:20:14:29;;:12::30;:34::43;;:12;:4::45;15:23:15:30;;:4::32;;8:2:16:3:1;;';
  const sourceCode = `
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
}`;

  const formatted = formatLibauthScript(bytecode, sourceMap, sourceCode);
  const result = `
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
`.replace(/^\n+/, '').replace(/\n+$/, '');
  expect(formatted).toBe(result);
});
