import { Fixture } from '../../fixture-utils.js';

export const fixtures: Fixture[] = [
  {
    artifact: {
      contractName: 'Test',
      constructorInputs: [],
      abi: [{ name: 'split', inputs: [] }],
      bytecode:
        // string s1 = "hello";
        '68656c6c6f '
        // string s2 = "there";
        + '7468657265 '
        // string hello, string there = (s1+s2).split(5);
        + 'OP_CAT OP_5 OP_SPLIT '
        // require(hello == there);
        + 'OP_EQUAL',
      fingerprint: '0d6e8f27e53878ab15977e6a093b90a8fd56869d924697254575b181712ce989',
      debug: {
        bytecode: '0568656c6c6f0574686572657e557f87',
        sourceMap: '3:20:3:27;4::4;5:38:5:43:1;:51::52:0;:37::53:1;6:8:6:32',
        logs: [],
        requires: [{ ip: 6, line: 6 }],
      },
    },
  },
];
