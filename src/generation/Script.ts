export type OpOrData = Op | Buffer;
export class Op {
  // -- CONSTANTS --
  // Skipped as data pushes are handled by BITBOX
  // -- FLOW CONTROL --
  static readonly IF = new Op('IF', 99);
  static readonly NOTIF = new Op('NOTIF', 100);
  static readonly ELSE = new Op('ELSE', 103);
  static readonly ENDIF = new Op('ENDIF', 104);
  static readonly VERIFY = new Op('VERIFY', 105);
  // -- STACK --
  static readonly TOALTSTACK = new Op('TOALTSTACK', 107);
  static readonly FROMALTSTACK = new Op('FROMALTSTACK', 108);
  static readonly DROP = new Op('DROP', 117);
  static readonly NIP = new Op('NIP', 119);
  static readonly PICK = new Op('PICK', 121);
  static readonly ROLL = new Op('ROLL', 122);
  static readonly SWAP = new Op('SWAP', 124);
  // -- SPLICE --
  static readonly CAT = new Op('CAT', 126);
  static readonly SPLIT = new Op('SPLIT', 127);
  static readonly NUM2BIN = new Op('NUM2BIN', 128);
  static readonly BIN2NUM = new Op('BIN2NUM', 129);
  // -- BITWISE LOGIC --
  static readonly EQUAL = new Op('EQUAL', 135);
  static readonly EQUALVERIFY = new Op('EQUALVERIFY', 136);
  // -- ARITHMETIC --
  static readonly ADD1 = new Op('1ADD', 139);
  static readonly SUB1 = new Op('1SUB', 140);
  static readonly NEGATE = new Op('NEGATE', 143);
  static readonly ABS = new Op('ABS', 144);
  static readonly NOT = new Op('NOT', 145);
  static readonly NOTEQUAL0 = new Op('0NOTEQUAL', 146);
  static readonly ADD = new Op('ADD', 147);
  static readonly SUB = new Op('SUB', 148);
  static readonly DIV = new Op('DIV', 150);
  static readonly MOD = new Op('MOD', 151);
  static readonly BOOLAND = new Op('BOOLAND', 154);
  static readonly BOOLOR = new Op('BOOLOR', 155);
  static readonly NUMEQUAL = new Op('NUMEQUAL', 156);
  static readonly NUMEQUALVERIFY = new Op('NUMEQUALVERIFY', 157);
  static readonly NUMNOTEQUAL = new Op('NUMNOTEQUAL', 158);
  static readonly LESSTHAN = new Op('LESSTHAN', 159);
  static readonly GREATERTHAN = new Op('GREATERTHAN', 160);
  static readonly LESSTHANOREQUAL = new Op('LESSTHANOREQUAL', 161);
  static readonly GREATERTHANOREQUAL = new Op('GREATERTHANOREQUAL', 162);
  static readonly MIN = new Op('MIN', 163);
  static readonly MAX = new Op('MAX', 164);
  static readonly WITHIN = new Op('WITHIN', 165);
  // -- CRYPTO --
  static readonly RIPEMD160 = new Op('RIPEMD160', 166);
  static readonly SHA1 = new Op('SHA1', 167);
  static readonly SHA256 = new Op('SHA256', 168);
  static readonly HASH160 = new Op('HASH160', 169);
  static readonly HASH256 = new Op('HASH256', 170);
  static readonly CHECKSIG = new Op('CHECKSIG', 172);
  static readonly CHECKSIGVERIFY = new Op('CHECKSIGVERIFY', 173);
  static readonly CHECKMULTISIG = new Op('CHECKMULTISIG', 174);
  static readonly CHECKMULTISIGVERIFY = new Op('CHECKMULTISIGVERIFY', 175);
  static readonly CHECKDATASIG = new Op('CHECKDATASIG', 186);
  static readonly CHECKDATASIGVERIFY = new Op('CHECKDATASIGVERIFY', 187);
  // -- LOCKTIME --
  static readonly CHECKLOCKTIMEVERIFY = new Op('CHECKLOCKTIMEVERIFY', 177);
  static readonly CHECKSEQUENCEVERIFY = new Op('CHECKSEQUENCEVERIFY', 178);

  private constructor(public name: string, public opcode: number) {}

  toString() {
    return this.name;
  }
}
