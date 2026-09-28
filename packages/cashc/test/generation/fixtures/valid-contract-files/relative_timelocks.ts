import { Fixture } from '../../fixture-utils.js';

export const fixtures: Fixture[] = [
  {
    artifact: {
      contractName: 'RelativeTimelocks',
      constructorInputs: [{ name: 'period', type: 'int' }],
      abi: [
        { name: 'afterBlocks', inputs: [] },
        { name: 'afterConstantBlocks', inputs: [] },
        { name: 'afterDuration', inputs: [] },
        { name: 'afterConstantDuration', inputs: [] },
        { name: 'afterEncodedDuration', inputs: [] },
        { name: 'afterPeriod', inputs: [] },
      ],
      bytecode:
        // function afterBlocks
        'OP_OVER OP_0 OP_NUMEQUAL OP_IF '
        // require(this.age >= 10) (a number of blocks)
        + 'OP_10 OP_CHECKSEQUENCEVERIFY '
        // Cleanup
        + 'OP_2DROP OP_DROP OP_1 OP_ELSE '
        // function afterConstantBlocks
        + 'OP_OVER OP_1 OP_NUMEQUAL OP_IF '
        // require(this.age >= CLAIM_BLOCKS) (a number of blocks, validated at compile time like a literal)
        + '9000 OP_CHECKSEQUENCEVERIFY '
        // Cleanup
        + 'OP_2DROP OP_DROP OP_1 OP_ELSE '
        // function afterDuration
        + 'OP_OVER OP_2 OP_NUMEQUAL OP_IF '
        // require(this.age >= 1 days) (169 512-second units with the BIP68 type flag)
        + 'a90040 OP_CHECKSEQUENCEVERIFY '
        // Cleanup
        + 'OP_2DROP OP_DROP OP_1 OP_ELSE '
        // function afterConstantDuration
        + 'OP_OVER OP_3 OP_NUMEQUAL OP_IF '
        // require(this.age >= CLAIM_PERIOD) (18 512-second units with the BIP68 type flag)
        + '120040 OP_CHECKSEQUENCEVERIFY '
        // Cleanup
        + 'OP_2DROP OP_DROP OP_1 OP_ELSE '
        // function afterEncodedDuration
        + 'OP_OVER OP_4 OP_NUMEQUAL OP_IF '
        // require(this.age >= 4194473) (already BIP68-encoded)
        + 'a90040 OP_CHECKSEQUENCEVERIFY '
        // Cleanup
        + 'OP_2DROP OP_DROP OP_1 OP_ELSE '
        // function afterPeriod
        + 'OP_SWAP OP_5 OP_NUMEQUALVERIFY '
        // require(this.age >= period) (with a runtime check that period is a valid relative timelock)
        + 'OP_DUP OP_16 OP_RSHIFTNUM OP_DUP 40 OP_SUB OP_MUL OP_NOT OP_VERIFY OP_CHECKSEQUENCEVERIFY OP_DROP '
        // Cleanup
        + 'OP_1 OP_ENDIF OP_ENDIF OP_ENDIF OP_ENDIF OP_ENDIF',
      debug: {
        bytecode: '78009c635ab26d75516778519c63029000b26d75516778529c6303a90040b26d75516778539c6303120040b26d75516778549c6303a90040b26d7551677c559d76608e76014094959169b275516868686868',
        sourceMap: '5:4:7:5;;;;6:28:6:30;:8::32:1;5:27:7:5;;;:4;9::11::0;;;;10:28:10:40;:8::42:1;9:35:11:5;;;:4;13::15::0;;;;14:28:14:34;:8::36:1;13:29:15:5;;;:4;17::19::0;;;;18:28:18:40;:8::42:1;17:37:19:5;;;:4;21::23::0;;;;22:28:22:35;:8::37:1;21:36:23:5;;;:4;25::27::0;;;26:8:26:36:1;;;;;;;;;;;25:27:27:5;4:0:28:1;;;;',
        logs: [],
        requires: [
          { ip: 6, line: 6 },
          { ip: 16, line: 10 },
          { ip: 26, line: 14 },
          { ip: 36, line: 18 },
          { ip: 46, line: 22 },
          {
            ip: 62,
            line: 26,
            message: 'this.age value must be a number of blocks between 0 and 65535 (or a BIP68-encoded relative timelock)',
          },
          { ip: 63, line: 26 },
        ],
      },
      fingerprint: '53d6e0a49ed257d0f05c3a1da17cfec4aa6e9cd951186cdcee3bfa055dc7ca7b',
    },
  },
];
