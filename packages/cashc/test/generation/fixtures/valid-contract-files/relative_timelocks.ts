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
        // require(this.age >= CLAIM_BLOCKS) (1008 blocks: a ratio of two durations is a number, validated like a literal)
        + 'f003 OP_CHECKSEQUENCEVERIFY '
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
        bytecode: '78009c635ab26d75516778519c6302f003b26d75516778529c6303a90040b26d75516778539c6303120040b26d75516778549c6303a90040b26d7551677c559d76608e76014094959169b275516868686868',
        sourceMap: '6:4:8:5;;;;7:28:7:30;:8::32:1;6:27:8:5;;;:4;10::12::0;;;;11:28:11:40;:8::42:1;10:35:12:5;;;:4;14::16::0;;;;15:28:15:34;:8::36:1;14:29:16:5;;;:4;18::20::0;;;;19:28:19:40;:8::42:1;18:37:20:5;;;:4;22::24::0;;;;23:28:23:35;:8::37:1;22:36:24:5;;;:4;26::28::0;;;27:8:27:36:1;;;;;;;;;;;26:27:28:5;5:0:29:1;;;;',
        logs: [],
        requires: [
          { ip: 6, line: 7 },
          { ip: 16, line: 11 },
          { ip: 26, line: 15 },
          { ip: 36, line: 19 },
          { ip: 46, line: 23 },
          {
            ip: 62,
            line: 27,
            message: 'this.age value must be a number of blocks between 0 and 65535 (or a BIP68-encoded relative timelock)',
          },
          { ip: 63, line: 27 },
        ],
      },
      fingerprint: '53d6e0a49ed257d0f05c3a1da17cfec4aa6e9cd951186cdcee3bfa055dc7ca7b',
    },
  },
];
