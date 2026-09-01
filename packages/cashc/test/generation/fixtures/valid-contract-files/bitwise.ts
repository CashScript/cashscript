import { Fixture } from '../../fixture-utils.js';

export const fixtures: Fixture[] = [
  {
    artifact: {
      contractName: 'Test',
      constructorInputs: [{ name: 'x', type: 'bytes8' }, { name: 'y', type: 'bytes8' }],
      abi: [{ name: 'hello', inputs: [] }],
      bytecode:
        // require((x | y) == y);
        'OP_OVER OP_OR OP_EQUAL',
      fingerprint: '323eed626e96a40e7bad6fe48fe17304f30b8ca11760d9c10fdf8dfcffc819cc',
      debug: { bytecode: '788587', sourceMap: '3:21:3:22;:17:::1;:8::30', logs: [], requires: [{ ip: 5, line: 3 }] },
    },
  },
];
