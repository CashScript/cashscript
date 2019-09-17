import { Script } from '../generation/Script';
import { Data } from '../util';

export default class TargetCodeOptimisation {
  static optimise(script: Script, runs: number = 1000): Script {
    for (let i = 0; i < runs; i += 1) {
      const oldScript = script;
      script = this.replaceOps(script);

      // Break on fixed point
      if (Data.scriptToAsm(oldScript) === Data.scriptToAsm(script)) break;
    }
    return script;
  }

  private static replaceOps(script: Script): Script {
    let asm = Data.scriptToAsm(script);

    // Hardcoded arithmetic
    asm = asm.replace(/OP_NOT OP_IF/g, 'OP_NOTIF');
    asm = asm.replace(/OP_1 OP_ADD/g, 'OP_1ADD');
    asm = asm.replace(/OP_1 OP_SUB/g, 'OP_1SUB');
    asm = asm.replace(/OP_0 OP_EQUAL OP_NOT/g, 'OP_0NOTEQUAL');
    asm = asm.replace(/OP_NUMEQUAL OP_NOT/g, 'OP_NUMNOTEQUAL');
    asm = asm.replace(/OP_SHA256 OP_SHA256/g, 'OP_HASH256');
    asm = asm.replace(/OP_SHA256 OP_RIPEMD160/g, 'OP_HASH160');

    // Hardcoded stack ops
    asm = asm.replace(/OP_2 OP_PICK OP_1 OP_PICK OP_3 OP_PICK/g, 'OP_3DUP OP_SWAP');
    asm = asm.replace(/OP_2 OP_PICK OP_2 OP_PICK OP_2 OP_PICK/g, 'OP_3DUP');

    asm = asm.replace(/OP_0 OP_PICK OP_2 OP_PICK/g, 'OP_2DUP OP_SWAP');
    asm = asm.replace(/OP_1 OP_PICK OP_1 OP_PICK/g, 'OP_2DUP');
    asm = asm.replace(/OP_2 OP_PICK OP_4 OP_PICK/g, 'OP_2OVER OP_SWAP');
    asm = asm.replace(/OP_3 OP_PICK OP_3 OP_PICK/g, 'OP_2OVER');

    asm = asm.replace(/OP_2 OP_ROLL OP_3 OP_ROLL/g, 'OP_2SWAP OP_SWAP');
    asm = asm.replace(/OP_3 OP_ROLL OP_3 OP_ROLL/g, 'OP_2SWAP');
    asm = asm.replace(/OP_4 OP_ROLL OP_5 OP_ROLL/g, 'OP_2ROT OP_SWAP');
    asm = asm.replace(/OP_5 OP_ROLL OP_5 OP_ROLL/g, 'OP_2ROT');

    asm = asm.replace(/OP_0 OP_PICK/g, 'OP_DUP');
    asm = asm.replace(/OP_1 OP_PICK/g, 'OP_OVER');
    asm = asm.replace(/[ ]?OP_0 OP_ROLL[ ]?/g, ' ');
    asm = asm.replace(/OP_1 OP_ROLL/g, 'OP_SWAP');
    asm = asm.replace(/OP_2 OP_ROLL/g, 'OP_ROT');

    asm = asm.replace(/OP_DROP OP_DROP/g, 'OP_2DROP');

    // Secondary effects
    asm = asm.replace(/OP_DUP OP_SWAP/g, 'OP_DUP');
    asm = asm.replace(/[ ]?OP_SWAP OP_SWAP[ ]?/g, ' ');

    // Merge OP_VERIFY
    asm = asm.replace(/OP_EQUAL OP_VERIFY/g, 'OP_EQUALVERIFY');
    asm = asm.replace(/OP_NUMEQUAL OP_VERIFY/g, 'OP_NUMEQUALVERIFY');
    asm = asm.replace(/OP_CHECKSIG OP_VERIFY/g, 'OP_CHECKSIGVERIFY');
    asm = asm.replace(/OP_CHECKMULTISIG OP_VERIFY/g, 'OP_CHECKMULTISIGVERIFY');
    asm = asm.replace(/OP_CHECKDATASIG OP_VERIFY/g, 'OP_CHECKDATASIGVERIFY');

    return Data.asmToScript(asm);
  }
}
