import { Fixture } from '../../fixture-utils.js';

export const fixtures: Fixture[] = [
  {
    artifact: {
      contractName: 'SimulatingState',
      constructorInputs: [
        { name: 'recipient', type: 'bytes20' },
        { name: 'funder', type: 'bytes20' },
        { name: 'pledgePerBlock', type: 'int' },
        { name: 'initialBlock', type: 'bytes8' },
      ],
      abi: [
        { name: 'receive', inputs: [] },
        { name: 'reclaim', inputs: [{ name: 'pk', type: 'pubkey' }, { name: 's', type: 'sig' }] },
      ],
      bytecode:
        // function receive() {
        'OP_4 OP_PICK OP_0 OP_NUMEQUAL OP_IF '
        // bytes25 recipientLockingBytecode = new LockingBytecodeP2PKH(recipient);
        + '76a914 OP_SWAP OP_CAT 88ac OP_CAT '
        // require(tx.outputs[0].lockingBytecode == recipientLockingBytecode);
        + 'OP_0 OP_OUTPUTBYTECODE OP_EQUALVERIFY '
        // int initial = int(initialBlock);
        + 'OP_ROT OP_BIN2NUM '
        // require(tx.time >= initial);
        + 'OP_DUP OP_CHECKLOCKTIMEVERIFY OP_DROP '
        // int passedBlocks = tx.locktime - initial;
        + 'OP_TXLOCKTIME OP_SWAP OP_SUB '
        // int pledge = passedBlocks * pledgePerBlock;
        + 'OP_ROT OP_MUL '
        // int minerFee = 1000;
        + 'e803 '
        // int currentValue = tx.inputs[this.activeInputIndex].value;
        + 'OP_INPUTINDEX OP_UTXOVALUE '
        // int changeValue = currentValue - pledge - minerFee;
        + 'OP_DUP OP_3 OP_PICK OP_SUB OP_2 OP_PICK OP_SUB '
        // if (changeValue <= pledge + minerFee) {
        + 'OP_DUP OP_4 OP_PICK OP_4 OP_PICK OP_ADD OP_LESSTHANOREQUAL OP_IF '
        // require(tx.outputs[0].value == currentValue - minerFee);
        + 'OP_0 OP_OUTPUTVALUE OP_2OVER OP_SWAP OP_SUB OP_NUMEQUALVERIFY '
        // } else {
        + 'OP_ELSE '
        // require(tx.outputs[0].value == pledge);
        + 'OP_0 OP_OUTPUTVALUE OP_4 OP_PICK OP_NUMEQUALVERIFY '
        // require(tx.outputs[1].value == changeValue);
        + 'OP_1 OP_OUTPUTVALUE OP_OVER OP_NUMEQUALVERIFY '
        // bytes newContract = 0x08 + toPaddedBytes(tx.locktime, 8) + this.activeBytecode.split(9)...
        + 'OP_8 OP_TXLOCKTIME OP_8 OP_NUM2BIN OP_CAT OP_ACTIVEBYTECODE OP_9 OP_SPLIT OP_NIP OP_CAT '
        // bytes23 newContractLock = new LockingBytecodeP2SH20(hash160(newContract));
        + 'a914 OP_OVER OP_HASH160 OP_CAT 87 OP_CAT '
        // require(tx.outputs[1].lockingBytecode == newContractLock);
        + 'OP_1 OP_OUTPUTBYTECODE OP_OVER OP_EQUALVERIFY '
        // Cleanup
        + 'OP_2DROP '
        // }
        + 'OP_ENDIF OP_2DROP OP_2DROP OP_2DROP OP_1 OP_ELSE '
        // function reclaim(pubkey pk, sig s) {
        + 'OP_4 OP_ROLL OP_1 OP_NUMEQUALVERIFY '
        // require(hash160(pk) == funder);
        + 'OP_4 OP_PICK OP_HASH160 OP_ROT OP_EQUALVERIFY '
        // require(checkSig(s, pk));
        + 'OP_4 OP_ROLL OP_4 OP_ROLL OP_CHECKSIG '
        // Cleanup
        + 'OP_NIP OP_NIP OP_NIP '
        // }
        + 'OP_ENDIF',
      fingerprint: 'b9b8bcda69ec19cdbdf4a9f9fadcc2834ed3302298c5b3c2086b55fc95db983d',
      debug: {
        bytecode: '5479009c630376a9147c7e0288ac7e00cd887b8176b175c57c947b9502e803c0c676537994527994765479547993a16300cc707c949d6700cc54799d51cc789d58c558807ec1597f777e02a91478a97e01877e51cd78886d686d6d6d5167547a519d5479a97b88547a547aac77777768',
        sourceMap: '7:4:46:5;;;;;9:43:9:78;:68::77;:43::78:1;;;10:27:10:28:0;:16::45:1;:8::75;13:26:13:38:0;:22::39:1;14:27:14:34:0;:8::36:1;;17:27:17:38:0;:41::48;:27:::1;18:36:18:50:0;:21:::1;21:23:21:27:0;22:37:22:58;:27::65:1;23:26:23:38:0;:41::47;;:26:::1;:50::58:0;;:26:::1;28:12:28:23:0;:27::33;;:36::44;;:27:::1;:12;:46:30:9:0;29:31:29:32;:20::39:1;:43::66:0;;::::1;:12::68;30:15:45:9:0;32:31:32:32;:20::39:1;:43::49:0;;:12::51:1;33:31:33:32:0;:20::39:1;:43::54:0;:12::56:1;39:32:39:36:0;:53::64;:66::67;:39::68:1;:32;:71::90:0;:97::98;:71::99:1;:::102;:32;43:38:43:85:0;:72::83;:64::84:1;:38::85;;;44:31:44:32:0;:20::49:1;:53::68:0;:12::70:1;30:15:45:9;;7:23:46:5;;;;:4;48::51::0;;;;49:24:49:26;;:16::27:1;:31::37:0;:8::39:1;50:25:50:26:0;;:28::30;;:8::33:1;48:39:51:5;;;1:0:52:1',
        logs: [],
        requires: [
          { ip: 16, line: 10 },
          { ip: 20, line: 14 },
          { ip: 50, line: 29 },
          { ip: 56, line: 32 },
          { ip: 60, line: 33 },
          { ip: 80, line: 44 },
          { ip: 96, line: 49 },
          { ip: 102, line: 50 },
        ],
        sourceTags: '77:77:sc;98:100:sc',
      },
    },
  },
];
