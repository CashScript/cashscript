import { Fixture } from '../../fixture-utils.js';

export const fixtures: Fixture[] = [
  {
    artifact: {
      contractName: 'P2Palindrome',
      constructorInputs: [],
      abi: [
        { name: 'spend', inputs: [{ name: 'palindrome', type: 'string' }] },
      ],
      bytecode: 'OP_DUP OP_REVERSEBYTES OP_EQUAL',
      debug: {
        bytecode: '76bc87',
        logs: [],
        requires: [{ ip: 3, line: 3 }],
        sourceMap: '3:16:3:26;:::36:1;:8::52',
      },
      fingerprint: '4e9480ee14cf131a78be8da27e585e3d62c0e9cfa75d8338f2d51a67d84df0c7',
    },
  },
];
