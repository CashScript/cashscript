import { Fixture } from '../../fixture-utils.js';

export const fixtures: Fixture[] = [
  {
    // Tuple destructuring into existing variables inside branches. Scoped reassignment values are
    // folded into the existing slots; a declaration value above a reassignment value is parked on
    // the altstack while the fold runs (OP_TOALTSTACK ... OP_FROMALTSTACK in reassignmentFirst).
    artifact: {
      contractName: 'TupleReassignmentBranches',
      constructorInputs: [],
      abi: [
        { name: 'declarationFirst', inputs: [{ name: 'a', type: 'int' }] },
        { name: 'reassignmentFirst', inputs: [{ name: 'a', type: 'int' }] },
      ],
      bytecode:
        // OP_DEFINE branchPair (id 0) — called from both functions, too large to inline
        '7653957857979378529693768b7c52957b94 OP_0 OP_DEFINE '
        // function declarationFirst
        + 'OP_DUP OP_0 OP_NUMEQUAL OP_IF '
        // int total = 0
        + 'OP_0 '
        // if (a > 10)
        + 'OP_2 OP_PICK OP_10 OP_GREATERTHAN OP_IF '
        // int d, total = branchPair(a) — call, then fold total's value (top) into its slot;
        // d's value stays in place (declarations-first needs no parking)
        + 'OP_2 OP_PICK OP_0 OP_INVOKE OP_ROT OP_DROP OP_SWAP '
        // require(d != 0)
        + 'OP_DUP OP_0 OP_NUMNOTEQUAL OP_VERIFY '
        // scope cleanup (drop d)
        + 'OP_DROP OP_ENDIF '
        // require(total >= 0) + cleanup
        + 'OP_0 OP_GREATERTHANOREQUAL OP_NIP OP_NIP '
        // function reassignmentFirst
        + 'OP_ELSE OP_1 OP_NUMEQUALVERIFY '
        // int total = 0
        + 'OP_0 '
        // if (a > 10)
        + 'OP_OVER OP_10 OP_GREATERTHAN OP_IF '
        // (total, int extra) = branchPair(a + 1) — call, park extra's value on the altstack,
        // fold total's value into its slot (OP_NIP), restore extra's value
        + 'OP_OVER OP_1ADD OP_0 OP_INVOKE OP_TOALTSTACK OP_NIP OP_FROMALTSTACK '
        // require(extra != 0)
        + 'OP_DUP OP_0 OP_NUMNOTEQUAL OP_VERIFY '
        // scope cleanup (drop extra)
        + 'OP_DROP OP_ENDIF '
        // require(total >= 0) + cleanup
        + 'OP_0 OP_GREATERTHANOREQUAL OP_NIP OP_ENDIF',
      debug: {
        bytecode: '127653957857979378529693768b7c52957b94008976009c630052795aa0635279008a7b757c76009e69756800a2777767519d00785aa063788b008a6b776c76009e69756800a27768',
        sourceMap: '7::10:1;;::::1;14:4:21:5:0;;;;15:20:15:21;16:12:16:13;;:16::18;:12:::1;:20:19:9:0;17:38:17:39;;:27::40:1;;:12::41;;;18:20:18:21:0;:25::26;:20:::1;:12::28;16:20:19:9;;20:25:20:26:0;:8::28:1;14:37:21:5;;:4;25::32::0;;26:20:26:21;27:12:27:13;:16::18;:12:::1;:20:30:9:0;28:44:28:45;:::49:1;:33::50;;:12::51;;;29:20:29:25:0;:29::30;:20:::1;:12::32;27:20:30:9;;31:25:31:26:0;:8::28:1;25:38:32:5;12:0:33:1',
        logs: [],
        requires: [
          { ip: 23, line: 18 },
          { ip: 28, line: 20 },
          { ip: 48, line: 29 },
          { ip: 53, line: 31 },
        ],
        sourceTags: '24:24:sc;28:29:sc;49:49:sc;53:53:sc',
        functions: [
          {
            id: 0,
            name: 'branchPair',
            inputs: [{ name: 'x', type: 'int' }],
            bytecode: '7653957857979378529693768b7c52957b94',
            sourceMap: '8:12:8:13;:16::17;:12:::1;:21::22:0;:25::26;:21:::1;:12::27;:31::32:0;:35::36;:31:::1;:12::37;9:11:9:12:0;:::16:1;:18::19:0;:22::23;:18:::1;:26::27:0;:18:::1',
            logs: [],
            requires: [],
          },
        ],
      },
      fingerprint: 'da4982948327a26f2c708b13af6977715747aa0b5c64bc00b04e3ddbc11ca67d',
    },
  },
];
