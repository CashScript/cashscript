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
    optimisations.forEach((optimisation) => {
      asm = asm.replace(new RegExp(optimisation[0], 'g'), optimisation[1]);
    });

    // Add optimisations that are not compatible with CashProof
    // CashProof can't prove OP_IF without parameters
    asm = asm.replace(/OP_NOT OP_IF/g, 'OP_NOTIF');
    // CashProof can't prove OP_CHECKMULTISIG without specifying N
    asm = asm.replace(/OP_CHECKMULTISIG OP_VERIFY/g, 'OP_CHECKMULTISIGVERIFY');
    // CashProof can't prove bitwise operators
    asm = asm.replace(/OP_SWAP OP_AND/g, 'OP_AND');
    asm = asm.replace(/OP_SWAP OP_OR/g, 'OP_OR');
    asm = asm.replace(/OP_SWAP OP_XOR/g, 'OP_XOR');
    asm = asm.replace(/OP_DUP OP_AND/g, '');
    asm = asm.replace(/OP_DUP OP_OR/g, '');

    // Remove any double spaces as a result of opcode removal
    asm = asm.replace(/\s+/g, ' ').trim();

    return Data.asmToScript(asm);
  }
}
