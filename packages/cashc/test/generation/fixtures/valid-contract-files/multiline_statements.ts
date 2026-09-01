import { Fixture } from '../../fixture-utils.js';

export const fixtures: Fixture[] = [
  {
    artifact: {
      contractName: 'MultilineStatements',
      constructorInputs: [{ name: 'x', type: 'int' }, { name: 'y', type: 'string' }],
      abi: [{ name: 'spend', inputs: [{ name: 'a', type: 'int' }, { name: 'b', type: 'string' }] }],
      bytecode: 'OP_ROT OP_SWAP OP_2 OP_SUB OP_NUMEQUAL OP_2 OP_PICK OP_2 OP_PICK OP_EQUAL OP_BOOLAND OP_IF OP_0 OP_VERIFY OP_ELSE OP_OVER 48656c6c6f20 OP_2 OP_PICK OP_CAT OP_EQUAL OP_IF OP_DUP 576f726c64 OP_EQUALVERIFY OP_ELSE OP_1 OP_0 OP_NOT OP_NOT OP_NOT OP_NUMEQUALVERIFY OP_ENDIF OP_ENDIF OP_2DROP OP_1',
      debug: {
        bytecode: '7b7c52949c52795279879a63006967780648656c6c6f2052797e87637605576f726c64886751009191919d68686d51',
        logs: [],
        requires: [
          { ip: 15, line: 11 },
          { ip: 26, line: 14 },
          { ip: 33, line: 18 },
        ],
        sourceMap: '9:12:9:13;:17::18;:21::22;:17:::1;:12;10::10:13:0;;:17::18;;:12:::1;9;10:20:12:9:0;11::11:25;:12::27:1;12:15:19:9:0;:19:12:20;:24::32;13:10:13:11;;12:24:::1;:19;13:13:17:9:0;15:16:15:17;:21::28;14:12:16:14:1;17:15:19:9:0;18:20:18:24;:31::36;:30:::1;:29;:28;:12::38;17:15:19:9;12;8:6:20:5;',
      },
      fingerprint: 'd2aa37425c07883d3c7df823103f88a6a061d3efca1e6317b9e72e0ad4bd3611',
    },
  },
];
