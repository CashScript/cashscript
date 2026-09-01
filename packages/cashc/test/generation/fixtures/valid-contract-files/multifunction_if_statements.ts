import { Fixture } from '../../fixture-utils.js';

export const fixtures: Fixture[] = [
  {
    artifact: {
      contractName: 'MultiFunctionIfStatements',
      constructorInputs: [{ name: 'x', type: 'int' }, { name: 'y', type: 'int' }],
      abi: [
        { name: 'transfer', inputs: [{ name: 'a', type: 'int' }, { name: 'b', type: 'int' }] },
        { name: 'timeout', inputs: [{ name: 'b', type: 'int' }] },
      ],
      bytecode:
        // function transfer
        'OP_2 OP_PICK OP_0 OP_NUMEQUAL OP_IF '
        // int d = a + b
        + 'OP_3 OP_PICK OP_5 OP_PICK OP_ADD '
        // d = d - a
        + 'OP_DUP OP_5 OP_PICK OP_SUB '
        // if (d == x && bool(x)) {
        + 'OP_DUP OP_3 OP_PICK OP_NUMEQUAL OP_3 OP_ROLL OP_0NOTEQUAL OP_BOOLAND OP_IF '
        // int c = d + b
        + 'OP_DUP OP_6 OP_PICK OP_ADD '
        // d = a + c
        + 'OP_5 OP_PICK OP_OVER OP_ADD OP_ROT OP_DROP OP_SWAP '
        // require(c > d)
        + 'OP_2DUP OP_LESSTHAN OP_VERIFY '
        // } else {
        + 'OP_DROP OP_ELSE '
        // d = a }
        + 'OP_4 OP_PICK OP_NIP OP_ENDIF '
        // d = d + a
        + 'OP_DUP OP_5 OP_ROLL OP_ADD '
        // require(d == y)
        + 'OP_3 OP_ROLL OP_NUMEQUALVERIFY '
        + 'OP_2DROP OP_2DROP OP_1 OP_ELSE '
        // function timeout
        + 'OP_ROT OP_1 OP_NUMEQUALVERIFY '
        // int d = b
        + 'OP_2 OP_PICK '
        // d = d + 2
        + 'OP_DUP OP_2 OP_ADD '
        // if (d == x) {
        + 'OP_DUP OP_3 OP_ROLL OP_NUMEQUAL OP_IF '
        // int c = d + b
        + 'OP_DUP OP_4 OP_PICK OP_ADD '
        // d = c + d
        + 'OP_2DUP OP_ADD OP_ROT OP_DROP OP_SWAP '
        // require(c > d) }
        + 'OP_2DUP OP_LESSTHAN OP_VERIFY '
        + 'OP_DROP OP_ENDIF '
        // d = b
        + ''
        // require(d == y)
        + 'OP_2SWAP OP_NUMEQUAL '
        + 'OP_NIP OP_NIP OP_ENDIF',
      debug: {
        bytecode: '5279009c635379557993765579947653799c537a929a6376567993557978937b757c6e9f6975675479776876557a93537a9d6d6d51677b519d527976529376537a9c63765479936e937b757c6e9f697568729c777768',
        logs: [],
        requires: [
          { ip: 38, line: 8 },
          { ip: 51, line: 13 },
          { ip: 80, line: 22 },
          { ip: 85, line: 25 },
        ],
        sourceMap: '2:4:14:5;;;;;3:16:3:17;;:20::21;;:16:::1;4:12:4:13:0;:16::17;;:12:::1;5::5:13:0;:17::18;;:12:::1;:27::28:0;;:22::29:1;:12;:31:9:9:0;6:20:6:21;:24::25;;:20:::1;7:16:7:17:0;;:20::21;:16:::1;:12::22;;;8:20:8:25:0;::::1;:12::27;5:31:9:9;9:15:11::0;10:16:10:17;;:12::18:1;9:15:11:9;12:12:12:13:0;:16::17;;:12:::1;13:21:13:22:0;;:8::24:1;2:36:14:5;;;:4;16::26::0;;;17:16:17:17;;18:12:18:13;:16::17;:12:::1;19::19:13:0;:17::18;;:12:::1;:20:23:9:0;20::20:21;:24::25;;:20:::1;21:16:21:21:0;::::1;:12::22;;;22:20:22:25:0;::::1;:12::27;19:20:23:9;;24:12:25:22:0;25:8::24:1;16:28:26:5;;1:0:27:1',
        sourceTags: '37:37:sc;79:79:sc;83:84:sc',
      },
      fingerprint: 'f57b39c9be272a31d1aedd678087b7dd327095fde647570149d237fb34401469',
    },
  },
];
