import { Fixture } from '../../fixture-utils.js';

export const fixtures: Fixture[] = [
  {
    artifact: {
      contractName: 'Test',
      constructorInputs: [],
      abi: [{ name: 'hello', inputs: [{ name: 'a', type: 'int' }, { name: 'b', type: 'int' }] }],
      bytecode:
        // if (a == b - 2 minutes) {
        'OP_2DUP OP_SWAP 78 OP_SUB OP_NUMEQUAL OP_IF '
        // require(false);
        + 'OP_0 OP_VERIFY '
        // } else if (b == 2 weeks)
        + 'OP_ELSE OP_OVER 007512 OP_NUMEQUAL '
        // require(a == 20 seconds);
        + 'OP_IF OP_DUP 14 OP_NUMEQUALVERIFY '
        // else {
        + 'OP_ELSE '
        // require(true == !!!false);
        + 'OP_1 OP_0 OP_NOT OP_NOT OP_NOT OP_NUMEQUALVERIFY '
        // }
        + 'OP_ENDIF OP_ENDIF OP_2DROP OP_1',
      fingerprint: '3e2c04970e538e423ce77e999ec3d3fe25e286141f4a57aa6ce77c0d1719ccc9',
      debug: {
        bytecode: '6e7c0178949c6300696778030075129c637601149d6751009191919d68686d51',
        sourceMap: '3:12:3:18;;:21::30;:17:::1;:12;:32:5:9:0;4:20:4:25;:12::27:1;5:15:9:9:0;:19:5:20;:24::31;:19:::1;6:12:6:37:0;:20::21;:25::35;:12::37:1;7:13:9:9:0;8:20:8:24;:31::36;:30:::1;:29;:28;:12::38;7:13:9:9;5:15;2:33:10:5;',
        logs: [],
        requires: [{ ip: 7, line: 4 }, { ip: 15, line: 6 }, { ip: 22, line: 8 }],
      },
    },
  },
];
