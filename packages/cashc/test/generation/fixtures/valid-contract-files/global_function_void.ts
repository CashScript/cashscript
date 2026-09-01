import { Fixture } from '../../fixture-utils.js';

export const fixtures: Fixture[] = [
  {
    artifact: {
      contractName: 'GlobalFunctionVoid',
      constructorInputs: [],
      abi: [{ name: 'spend', inputs: [{ name: 'x', type: 'int' }] }],
      bytecode:
        // requirePositive(x);
        'OP_DUP OP_0 OP_GREATERTHAN OP_VERIFY '
        // require(x < 100);
        + '64 OP_LESSTHAN',
      fingerprint: '0c69be9a969ec46cf4dbb0c1b6581f833ff8f2117e03eaae0548312df8b74d99',
      debug: {
        bytecode: '7600a06901649f',
        sourceMap: '7:24:7:25;:8::26:1;;;8:20:8:23:0;:8::25:1',
        logs: [],
        requires: [{ ip: 3, line: 7 }, { ip: 6, line: 8 }],
        functions: [
          {
            name: 'requirePositive',
            inputs: [{ name: 'a', type: 'int' }],
            bytecode: '00a069',
            sourceMap: '2:16:2:17;:12:::1;:4::19',
            logs: [],
            requires: [{ ip: 2, line: 2 }],
          },
        ],
        inlineRanges: '1:3:requirePositive',
      },
    },
  },
  {
    // A void global function called as a statement — no return value, and the void stack-cleanup path.
    compilerOptions: { disableInlining: true },
    artifact: {
      contractName: 'GlobalFunctionVoid',
      constructorInputs: [],
      abi: [{ name: 'spend', inputs: [{ name: 'x', type: 'int' }] }],
      bytecode:
        // OP_DEFINE requirePositive (id 0): require(a > 0)
        '00a069 OP_0 OP_DEFINE '
        // requirePositive(x); require(x < 100)
        + 'OP_DUP OP_0 OP_INVOKE 64 OP_LESSTHAN',
      debug: {
        bytecode: '0300a069008976008a01649f',
        logs: [],
        requires: [
          { ip: 8, line: 8 },
        ],
        sourceMap: '1::3:1;;::::1;7:24:7:25:0;:8::26:1;;8:20:8:23:0;:8::25:1',
        functions: [
          {
            id: 0,
            name: 'requirePositive',
            inputs: [{ name: 'a', type: 'int' }],
            bytecode: '00a069',
            sourceMap: '2:16:2:17;:12:::1;:4::19',
            logs: [],
            requires: [{ ip: 2, line: 2 }],
          },
        ],
      },
      fingerprint: '4d5e07b068e501eb26e61aab0d53214aa42590858253b1106d6074d494fde557',
    },
  },
];
