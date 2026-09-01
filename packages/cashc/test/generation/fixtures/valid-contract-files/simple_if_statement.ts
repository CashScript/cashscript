import { Fixture } from '../../fixture-utils.js';

export const fixtures: Fixture[] = [
  {
    artifact: {
      contractName: 'Test',
      constructorInputs: [{ name: 'x', type: 'int' }, { name: 'y', type: 'string' }],
      abi: [{ name: 'hello', inputs: [{ name: 'a', type: 'int' }, { name: 'b', type: 'string' }] }],
      bytecode:
        // if (a == x - 2) {
        'OP_ROT OP_SWAP OP_2 OP_SUB OP_NUMEQUAL OP_IF '
        // require(false);
        + 'OP_0 OP_VERIFY '
        // } else if (b == "Hello " + y)
        + 'OP_ELSE OP_OVER 48656c6c6f20 OP_2 OP_PICK OP_CAT OP_EQUAL '
        // require(y == "World");
        + 'OP_IF OP_DUP 576f726c64 OP_EQUALVERIFY '
        // else {
        + 'OP_ELSE '
        // require(true == !!!false);
        + 'OP_1 OP_0 OP_NOT OP_NOT OP_NOT OP_NUMEQUALVERIFY '
        // }
        + 'OP_ENDIF OP_ENDIF OP_2DROP OP_1',
      fingerprint: 'b3c859908dd64be7dcc8a9382cf371527c12d56973f4a291d97692d8c2215cb0',
      debug: {
        bytecode: '7b7c52949c63006967780648656c6c6f2052797e87637605576f726c64886751009191919d68686d51',
        sourceMap: '3:12:3:13;:17::18;:21::22;:17:::1;:12;:24:5:9:0;4:20:4:25;:12::27:1;5:15:9:9:0;:19:5:20;:24::32;:35::36;;:24:::1;:19;6:12:6:34:0;:20::21;:25::32;:12::34:1;7:13:9:9:0;8:20:8:24;:31::36;:30:::1;:29;:28;:12::38;7:13:9:9;5:15;2:36:10:5;',
        logs: [],
        requires: [{ ip: 9, line: 4 }, { ip: 20, line: 6 }, { ip: 27, line: 8 }],
      },
    },
  },
];
