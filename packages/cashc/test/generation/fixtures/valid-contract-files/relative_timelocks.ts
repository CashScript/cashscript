import { Fixture } from '../../fixture-utils.js';

export const fixtures: Fixture[] = [
  {
    artifact: {
      contractName: 'RelativeTimelocks',
      constructorInputs: [{ name: 'period', type: 'int' }],
      abi: [
        { name: 'afterBlocks', inputs: [] },
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
        // function afterDuration
        + 'OP_OVER OP_1 OP_NUMEQUAL OP_IF '
        // require(this.age >= 1 days) (169 512-second units with the BIP68 type flag)
        + 'a90040 OP_CHECKSEQUENCEVERIFY '
        // Cleanup
        + 'OP_2DROP OP_DROP OP_1 OP_ELSE '
        // function afterConstantDuration
        + 'OP_OVER OP_2 OP_NUMEQUAL OP_IF '
        // require(this.age >= CLAIM_PERIOD) (18 512-second units with the BIP68 type flag)
        + '120040 OP_CHECKSEQUENCEVERIFY '
        // Cleanup
        + 'OP_2DROP OP_DROP OP_1 OP_ELSE '
        // function afterEncodedDuration
        + 'OP_OVER OP_3 OP_NUMEQUAL OP_IF '
        // require(this.age >= 4194473) (already BIP68-encoded)
        + 'a90040 OP_CHECKSEQUENCEVERIFY '
        // Cleanup
        + 'OP_2DROP OP_DROP OP_1 OP_ELSE '
        // function afterPeriod
        + 'OP_SWAP OP_4 OP_NUMEQUALVERIFY '
        // require(this.age >= period) (with a runtime check that period is a valid relative timelock)
        + 'OP_DUP OP_16 OP_RSHIFTNUM OP_DUP 40 OP_SUB OP_MUL OP_NOT OP_VERIFY OP_CHECKSEQUENCEVERIFY OP_DROP '
        // Cleanup
        + 'OP_1 OP_ENDIF OP_ENDIF OP_ENDIF OP_ENDIF',
      debug: {
        bytecode: '78009c635ab26d75516778519c6303a90040b26d75516778529c6303120040b26d75516778539c6303a90040b26d7551677c549d76608e76014094959169b2755168686868',
        sourceMap: '4:4:6:5;;;;5:28:5:30;:8::32:1;4:27:6:5;;;:4;8::10::0;;;;9:28:9:34;:8::36:1;8:29:10:5;;;:4;12::14::0;;;;13:28:13:40;:8::42:1;12:37:14:5;;;:4;16::18::0;;;;17:28:17:35;:8::37:1;16:36:18:5;;;:4;20::22::0;;;21:8:21:36:1;;;;;;;;;;;20:27:22:5;3:0:23:1;;;',
        logs: [],
        requires: [
          { ip: 6, line: 5 },
          { ip: 16, line: 9 },
          { ip: 26, line: 13 },
          { ip: 36, line: 17 },
          {
            ip: 52,
            line: 21,
            message: 'this.age value must be a number of blocks between 0 and 65535 (or a BIP68-encoded relative timelock)',
          },
          { ip: 53, line: 21 },
        ],
      },
      fingerprint: '56bce042df498dcf160c8c1695020b67db53262c78e19f612ca81a3306da8d94',
    },
  },
];
