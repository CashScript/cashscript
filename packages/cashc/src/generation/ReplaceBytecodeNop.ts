import { Script, Op } from './Script';
import { Data, calculateBytesize } from '../util';

export default class ReplaceBytecodeNop {
  // When cutting out preimage scriptCode, it inserts an OP_NOP
  // to signify that the Bitcoin VarInt still needs to be cut off to get to bytecode.
  // Gets the bytecode size and adds either 1 or 3 to the cut
  static replace(script: Script): Script {
    const index = script.findIndex(op => op === Op.OP_NOP);
    if (index < 0) return script;

    // Retrieve size of current cut
    script.splice(index, 1);
    let oldCut = script[index];
    if (oldCut instanceof Uint8Array) {
      oldCut = Data.decodeInt(oldCut);
    } else if (oldCut === Op.OP_0) {
      oldCut = 0;
    } else if (oldCut >= Op.OP_1 && oldCut <= Op.OP_16) {
      oldCut -= 80;
    } else {
      return script;
    }

    script[index] = Data.encodeInt(oldCut + 1);
    const bytecodeSize = calculateBytesize(script);
    if (bytecodeSize > 252) {
      script[index] = Data.encodeInt(oldCut + 3);
    }

    // Minimally encode
    return Data.asmToScript(Data.scriptToAsm(script));
  }
}
