import { Fixture } from '../../fixture-utils.js';

export const fixtures: Fixture[] = [
  {
    artifact: {
      contractName: 'BytesTypeNarrowing',
      constructorInputs: [],
      abi: [
        { name: 'requireNarrowing', inputs: [{ name: 'data', type: 'bytes' }] },
        { name: 'ifNarrowing', inputs: [{ name: 'data', type: 'bytes' }, { name: 'x', type: 'int' }] },
        { name: 'reversedComparison', inputs: [{ name: 'data', type: 'bytes' }] },
        { name: 'ifNarrowingAnd', inputs: [{ name: 'data', type: 'bytes' }, { name: 'x', type: 'int' }] },
        {
          name: 'requireNarrowingMultiple',
          inputs: [{ name: 'data1', type: 'bytes' }, { name: 'data2', type: 'bytes' }],
        },
        {
          name: 'ifNarrowingMultiple',
          inputs: [{ name: 'data1', type: 'bytes' }, { name: 'data2', type: 'bytes' }, { name: 'x', type: 'int' }],
        },
      ],
      bytecode:
        // function requireNarrowing(bytes data) {
        'OP_DUP OP_0 OP_NUMEQUAL OP_IF '
        // require(data.length == 20);
        + 'OP_OVER OP_SIZE OP_NIP 14 OP_NUMEQUALVERIFY '
        // bytes20 narrowed = data;
        + 'OP_OVER '
        // require(narrowed == data);
        + 'OP_2 OP_PICK OP_EQUALVERIFY '
        // require(new LockingBytecodeP2SH20(data).length > 20);
        + 'a914 OP_ROT OP_CAT 87 OP_CAT OP_SIZE OP_NIP 14 OP_GREATERTHAN '
        // Cleanup
        + 'OP_NIP '
        // }
        + 'OP_ELSE '
        // function ifNarrowing(bytes data, int x) {
        + 'OP_DUP OP_1 OP_NUMEQUAL OP_IF '
        // if (data.length == 20) {
        + 'OP_OVER OP_SIZE OP_NIP 14 OP_NUMEQUAL OP_IF '
        // bytes20 narrowed = data;
        + 'OP_OVER '
        // require(narrowed == data);
        + 'OP_DUP OP_3 OP_PICK OP_EQUALVERIFY '
        // Cleanup
        + 'OP_DROP '
        // }
        + 'OP_ENDIF '
        // require(x > 0);
        + 'OP_ROT OP_0 OP_GREATERTHAN '
        // Cleanup
        + 'OP_NIP OP_NIP '
        // }
        + 'OP_ELSE '
        // function reversedComparison(bytes data) {
        + 'OP_DUP OP_2 OP_NUMEQUAL OP_IF '
        // require(20 == data.length);
        + '14 OP_2 OP_PICK OP_SIZE OP_NIP OP_NUMEQUALVERIFY '
        // bytes20 narrowed = data;
        + 'OP_OVER '
        // require(narrowed == data);
        + 'OP_ROT OP_EQUAL '
        // Cleanup
        + 'OP_NIP '
        // }
        + 'OP_ELSE '
        // function ifNarrowingAnd(bytes data, int x) {
        + 'OP_DUP OP_3 OP_NUMEQUAL OP_IF '
        // if (data.length == 20 && x > 0) {
        + 'OP_OVER OP_SIZE OP_NIP 14 OP_NUMEQUAL OP_3 OP_PICK OP_0 OP_GREATERTHAN OP_BOOLAND OP_IF '
        // bytes20 narrowed = data;
        + 'OP_OVER '
        // require(narrowed == data);
        + 'OP_DUP OP_3 OP_PICK OP_EQUALVERIFY '
        // Cleanup
        + 'OP_DROP '
        // }
        + 'OP_ENDIF '
        // require(x > 0);
        + 'OP_ROT OP_0 OP_GREATERTHAN '
        // Cleanup
        + 'OP_NIP OP_NIP '
        // }
        + 'OP_ELSE '
        // function requireNarrowingMultiple(bytes data1, bytes data2) {
        + 'OP_DUP OP_4 OP_NUMEQUAL OP_IF '
        // require(data1.length == 20 && data2.length == 10);
        + 'OP_OVER OP_SIZE OP_NIP 14 OP_NUMEQUAL OP_3 OP_PICK OP_SIZE OP_NIP OP_10 OP_NUMEQUAL OP_BOOLAND OP_VERIFY '
        // bytes20 narrowed1 = data1;
        + 'OP_OVER '
        // bytes10 narrowed2 = data2;
        + 'OP_3 OP_PICK '
        // require(narrowed1 == data1);
        + 'OP_SWAP OP_3 OP_PICK OP_EQUALVERIFY '
        // require(narrowed2 == data2);
        + 'OP_3 OP_ROLL OP_EQUALVERIFY '
        // require(new LockingBytecodeP2SH20(data1).length > 20);
        + 'a914 OP_ROT OP_CAT 87 OP_CAT OP_SIZE OP_NIP 14 OP_GREATERTHAN '
        // Cleanup
        + 'OP_NIP '
        // }
        + 'OP_ELSE '
        // function ifNarrowingMultiple(bytes data1, bytes data2, int x) {
        + 'OP_5 OP_NUMEQUALVERIFY '
        // if (data1.length == 20 && data2.length == 10) {
        + 'OP_DUP OP_SIZE OP_NIP 14 OP_NUMEQUAL OP_2 OP_PICK OP_SIZE OP_NIP OP_10 OP_NUMEQUAL OP_BOOLAND OP_IF '
        // bytes20 narrowed1 = data1;
        + 'OP_DUP '
        // bytes10 narrowed2 = data2;
        + 'OP_3DUP '
        // require(narrowed1 == data1);
        + 'OP_EQUALVERIFY '
        // require(narrowed2 == data2);
        + 'OP_DUP OP_4 OP_PICK OP_EQUALVERIFY '
        // Cleanup
        + 'OP_2DROP '
        // }
        + 'OP_ENDIF '
        // require(x > 0);
        + 'OP_ROT OP_0 OP_GREATERTHAN '
        // Cleanup
        + 'OP_NIP OP_NIP '
        // }
        + 'OP_ENDIF OP_ENDIF OP_ENDIF OP_ENDIF OP_ENDIF',
      fingerprint: '6ce346c2b481330bafc5f23000655b8f033cd71635e01987a431885433b9de30',
      debug: {
        bytecode: '76009c6378827701149d7852798802a9147b7e01877e82770114a0776776519c6378827701149c63787653798875687b00a077776776529c630114527982779d787b87776776539c6378827701149c537900a09a63787653798875687b00a077776776549c6378827701149c537982775a9c9a697853797c537988537a8802a9147b7e01877e82770114a07767559d76827701149c527982775a9c9a63766f88765479886d687b00a077776868686868',
        sourceMap: '2:4:7:5;;;;3:16:3:20;:::27:1;;:31::33:0;:8::35:1;4:27:4:31:0;5:28:5:32;;:8::34:1;6:16:6:47:0;:42::46;:16::47:1;;;:::54;;:57::59:0;:8::61:1;2:42:7:5;:4;9::15::0;;;;10:12:10:16;:::23:1;;:27::29:0;:12:::1;:31:13:9:0;11::11:35;12:20:12:28;:32::36;;:12::38:1;10:31:13:9;;14:16:14:17:0;:20::21;:8::23:1;9:44:15:5;;:4;17::21::0;;;;18:16:18:18;:22::26;;:::33:1;;:8::35;19:27:19:31:0;20:28:20:32;:8::34:1;17:44:21:5;:4;23::29::0;;;;24:12:24:16;:::23:1;;:27::29:0;:12:::1;:33::34:0;;:37::38;:33:::1;:12;:40:27:9:0;25:31:25:35;26:20:26:28;:32::36;;:12::38:1;24:40:27:9;;28:16:28:17:0;:20::21;:8::23:1;23:47:29:5;;:4;31::38::0;;;;32:16:32:21;:::28:1;;:32::34:0;:16:::1;:38::43:0;;:::50:1;;:54::56:0;:38:::1;:16;:8::58;33:28:33:33:0;34::34;;35:16:35:25;:29::34;;:8::36:1;36:29:36:34:0;;:8::36:1;37:16:37:48:0;:42::47;:16::48:1;;;:::55;;:58::60:0;:8::62:1;31:64:38:5;:4;40::48::0;;41:12:41:17;:::24:1;;:28::30:0;:12:::1;:34::39:0;;:::46:1;;:50::52:0;:34:::1;:12;:54:46:9:0;42:32:42:37;43::44:38;:::40:1;45:20:45:29:0;:33::38;;:12::40:1;41:54:46:9;;47:16:47:17:0;:20::21;:8::23:1;40:66:48:5;;1:0:49:1;;;;',
        logs: [],
        requires: [
          { ip: 8, line: 3 },
          { ip: 12, line: 5 },
          { ip: 22, line: 6 },
          { ip: 38, line: 12 },
          { ip: 44, line: 14 },
          { ip: 56, line: 18 },
          { ip: 60, line: 20 },
          { ip: 81, line: 26 },
          { ip: 87, line: 28 },
          { ip: 106, line: 32 },
          { ip: 113, line: 35 },
          { ip: 116, line: 36 },
          { ip: 126, line: 37 },
          { ip: 145, line: 44 },
          { ip: 149, line: 45 },
          { ip: 155, line: 47 },
        ],
        sourceTags: '22:22:sc;39:39:sc;44:45:sc;60:60:sc;82:82:sc;87:88:sc;126:126:sc;150:150:sc;155:156:sc',
      },
    },
  },
];
