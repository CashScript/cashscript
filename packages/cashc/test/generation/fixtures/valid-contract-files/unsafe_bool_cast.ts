import { Fixture } from '../../fixture-utils.js';

export const fixtures: Fixture[] = [
  {
    artifact: {
      contractName: 'Test',
      constructorInputs: [{ name: 'x', type: 'int' }],
      abi: [{ name: 'test', inputs: [] }],
      bytecode: '',
      fingerprint: '4ae81572f06e1b88fd5ced7a1a000945432e83e1551e6f721ee9c00b8cc33260',
      debug: { bytecode: '', sourceMap: '', logs: [], requires: [{ ip: 1, line: 3 }] },
    },
  },
];
