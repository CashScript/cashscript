import { Script } from '../generation/Script';
import { Data } from '../util';

export default class TargetCodeOptimisation {
  static optimise(script: Script): Script {
    const optimisedScript = this.mergeOpVerify(script);
    return optimisedScript;
  }

  private static mergeOpVerify(script: Script): Script {
    let asm = Data.scriptToAsm(script);
    asm = asm.replace('OP_EQUAL OP_VERIFY', 'OP_EQUALVERIFY');
    asm = asm.replace('OP_NUMEQUAL OP_VERIFY', 'OP_NUMEQUALVERIFY');
    asm = asm.replace('OP_CHECKSIG OP_VERIFY', 'OP_CHECKSIGVERIFY');
    asm = asm.replace('OP_CHECKMULTISIG OP_VERIFY', 'OP_CHECKMULTISIGVERIFY');
    asm = asm.replace('OP_CHECKDATASIG OP_VERIFY', 'OP_CHECKDATASIGVERIFY');
    return Data.asmToScript(asm);
  }
}
