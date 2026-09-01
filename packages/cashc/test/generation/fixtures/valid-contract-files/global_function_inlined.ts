import { Fixture } from '../../fixture-utils.js';

export const fixtures: Fixture[] = [
  {
    // A single-use global function — inlined at the call site, splicing its console.log and require
    // metadata into the contract's debug info (same-file bodies keep their own source lines).
    artifact: {
      contractName: 'GlobalFunctionInlined',
      constructorInputs: [],
      abi: [{ name: 'spend', inputs: [{ name: 'n', type: 'int' }] }],
      bytecode:
        // require(checked(n) == n), with checked(x) spliced in:
        // console.log ... require(x > 0, "positive") ... return x
        'OP_DUP OP_DUP OP_0 OP_GREATERTHAN OP_VERIFY OP_NUMEQUAL',
      debug: {
        bytecode: '767600a0699c',
        logs: [
          { ip: 1, line: 9, data: ['checking', { stackIndex: 0, type: 'int', ip: 1 }] },
        ],
        requires: [
          { ip: 4, line: 9, message: 'positive' },
          { ip: 6, line: 9 },
        ],
        // The emitted body ops (ips 1-4) and the merged require/log entries above all map to the
        // call site; the function's own lines live on its frame below, tied together by the range
        sourceMap: '9:24:9:25;:16::26:1;;;;:8::33',
        inlineRanges: '1:4:checked',
        functions: [
          {
            // The inlined function is documented as an id-less frame carrying its compiled body
            // and frame-local debug info (ips from 0)
            name: 'checked',
            inputs: [{ name: 'x', type: 'int' }],
            bytecode: '7600a069',
            sourceMap: '3:12:3:13;:16::17;:12:::1;:4::31',
            logs: [
              { ip: 0, line: 2, data: ['checking', { stackIndex: 0, type: 'int', ip: 0 }] },
            ],
            requires: [
              { ip: 3, line: 3, message: 'positive' },
            ],
          },
        ],
      },
      fingerprint: 'a19e54aee90995fe784da8e5501a95020d91aa1ccf17ac1f3c7a3e7be0813a73',
    },
  },
];
