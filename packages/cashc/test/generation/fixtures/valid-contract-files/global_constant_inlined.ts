import { Fixture } from '../../fixture-utils.js';

export const fixtures: Fixture[] = [
  {
    // A small global constant used repeatedly — inlined as a plain literal at each use site (no
    // OP_DEFINE), with source locations mapping to the use sites rather than the declaration.
    artifact: {
      contractName: 'GlobalConstantInlined',
      constructorInputs: [{ name: 'value', type: 'int' }],
      abi: [{ name: 'spend', inputs: [] }],
      bytecode:
        // require(value + ONE + ONE == 3)
        'OP_1ADD OP_1ADD OP_3 OP_NUMEQUAL',
      debug: {
        bytecode: '8b8b539c',
        logs: [],
        requires: [
          { ip: 5, line: 5 },
        ],
        sourceMap: '5:16:5:27:1;:::33;:37::38:0;:8::40:1',
        // Both literal pushes were fused into the OP_1ADDs during optimisation; the ranges track them
        inlineRanges: '1:1:ONE;2:2:ONE',
        functions: [
          {
            // The inlined constant is documented as an id-less frame; both of its literal pushes
            // were emitted at the use sites and fused into the OP_1ADDs during optimisation
            name: 'ONE',
            kind: 'constant',
            inputs: [],
            bytecode: '51',
            sourceMap: '1:19:1:20',
            logs: [],
            requires: [],
          },
        ],
      },
      fingerprint: '0d639aa764e1dc4045e25efe7dc27bd247b3cd45dd6c3a878a83bc3015e38a59',
    },
  },
];
