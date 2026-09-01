import { Fixture } from '../../fixture-utils.js';

export const fixtures: Fixture[] = [
  {
    // A global constant used repeatedly — lowered to a zero-argument VM function definition with a
    // kind: 'constant' debug frame; each use compiles to an OP_INVOKE.
    artifact: {
      contractName: 'GlobalConstantShared',
      constructorInputs: [{ name: 'first', type: 'bytes32' }, { name: 'second', type: 'bytes32' }],
      abi: [{ name: 'spend', inputs: [] }],
      bytecode:
        // OP_DEFINE HASH (id 0): the 32-byte literal
        '203333333333333333333333333333333333333333333333333333333333333333 OP_0 OP_DEFINE '
        // require(first == HASH); require(second == HASH)
        + 'OP_0 OP_INVOKE OP_EQUALVERIFY OP_0 OP_INVOKE OP_EQUAL',
      debug: {
        bytecode: '212033333333333333333333333333333333333333333333333333333333333333330089008a88008a87',
        logs: [],
        requires: [
          { ip: 7, line: 5 },
          { ip: 11, line: 6 },
        ],
        sourceMap: '1::1:91;;::::1;5:25:5:29;;:8::31;6:26:6:30;;:8::32',
        functions: [
          {
            id: 0,
            name: 'HASH',
            kind: 'constant',
            inputs: [],
            bytecode: '203333333333333333333333333333333333333333333333333333333333333333',
            sourceMap: '1:24:1:90',
            logs: [],
            requires: [],
          },
        ],
      },
      fingerprint: '6a5509a2ece64c7e47b4e1185da2f8b92fc0e1f75cc818be86b783c7bf134c5e',
    },
  },
];
