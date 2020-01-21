import { Script } from '../generation/Script';
import OptimisationsEquivFile from './Optimisations';
import { Data } from '../util';

export default class TargetCodeOptimisation {
  static optimise(script: Script, runs: number = 1000): Script {
    const optimisations = OptimisationsEquivFile
      // Split by line and filter all line comments (#)
      .split('\n')
      .map(equiv => equiv.trim())
      .filter(equiv => !equiv.startsWith('#'))
      // Join back the lines, and split on semicolon
      .join('')
      .split(';')
      // Parse all optimisations in .equiv file
      .map(equiv => equiv.trim())
      .map(equiv => equiv.split('<=>').map(part => part.trim()))
      .filter(equiv => equiv.length === 2);

    for (let i = 0; i < runs; i += 1) {
      const oldScript = script;
      script = this.replaceOps(script, optimisations);

      // Break on fixed point
      if (Data.scriptToAsm(oldScript) === Data.scriptToAsm(script)) break;
    }
    return script;
  }

  private static replaceOps(script: Script, optimisations: string[][]): Script {
    let asm = Data.scriptToAsm(script);

    // Apply all optimisations in the .equiv file
    optimisations.forEach((optim) => {
      asm = asm.replace(new RegExp(optim[0], 'g'), optim[1]);
    });

    // Add optimisations that are not compatible with CashProof
    // CashProof can't prove OP_IF without parameters
    asm = asm.replace(/OP_NOT OP_IF/g, 'OP_NOTIF');
    // CashProof can't prove OP_CHECKMULTISIG without specifying N
    asm = asm.replace(/OP_CHECKMULTISIG OP_VERIFY/g, 'OP_CHECKMULTISIGVERIFY');

    // Remove any double spaces as a result of opcode removal
    asm = asm.replace(/\s+/g, ' ').trim();

    return Data.asmToScript(asm);
  }
}
