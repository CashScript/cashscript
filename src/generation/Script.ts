export type OpOrData = Opcode | Buffer;
export abstract class Opcode {
  name: string;
  opcode: number;

  toString() {
    return this.name;
  }
}

// TODO: Probably want to replace this whole thing with something out of a library like bitbox

// -- CONSTANTS --
// Skipped as data pushes are handled by BITBOX

// -- FLOW CONTROL --
export class If extends Opcode {
  name: 'IF';
  opcode: 99;
}

export class NotIf extends Opcode {
  name: 'NOTIF';
  opcode: 100;
}

export class Else extends Opcode {
  name: 'ELSE';
  opcode: 103;
}

export class EndIf extends Opcode {
  name: 'ENDIF';
  opcode: 104;
}

export class Verify extends Opcode {
  name: 'VERIFY';
  opcode: 105;
}

// -- STACK --
export class ToAltStack extends Opcode {
  name: 'TOALTSTACK';
  opcode: 107;
}

export class FromAltStack extends Opcode {
  name: 'FROMALTSTACK';
  opcode: 106;
}

export class Drop extends Opcode {
  name: 'DROP';
  opcode: 117;
}

export class Nip extends Opcode {
  name: 'NIP';
  opcode: 119;
}

export class Pick extends Opcode {
  name: 'PICK';
  opcode: 121;
}

export class Roll extends Opcode {
  name: 'ROLL';
  opcode: 122;
}

export class Swap extends Opcode {
  name: 'SWAP';
  opcode: 124;
}

// -- SPLICE --
export class Cat extends Opcode {
  name: 'CAT';
  opcode: 126;
}

export class Split extends Opcode {
  name: 'PICK';
  opcode: 127;
}

export class Num2Bin extends Opcode {
  name: 'NUM2BIN';
  opcode: 128;
}

export class Bin2Num extends Opcode {
  name: 'BIN2NUM';
  opcode: 129;
}

// -- BITWISE LOGIC --
export class Equal extends Opcode {
  name: 'EQUAL';
  opcode: 135;
}

export class EqualVerify extends Opcode {
  name: 'EQUALVERIFY';
  opcode: 136;
}

// -- ARITHMETIC --
export class Add1 extends Opcode {
  name: '1ADD';
  opcode: 139;
}

export class Sub1 extends Opcode {
  name: '1SUB';
  opcode: 140;
}

export class Negate extends Opcode {
  name: 'NEGATE';
  opcode: 143;
}

export class Abs extends Opcode {
  name: 'ABS';
  opcode: 144;
}

export class Not extends Opcode {
  name: 'NOT';
  opcode: 145;
}

export class NotEqual0 extends Opcode {
  name: '0NOTEQUAL';
  opcode: 146;
}

export class Add extends Opcode {
  name: 'ADD';
  opcode: 147;
}

export class Sub extends Opcode {
  name: 'SUB';
  opcode: 148;
}

export class Div extends Opcode {
  name: 'DIV';
  opcode: 150;
}

export class Mod extends Opcode {
  name: 'MOD';
  opcode: 151;
}

export class BoolAnd extends Opcode {
  name: 'BOOLAND';
  opcode: 154;
}

export class BoolOr extends Opcode {
  name: 'BOOLOR';
  opcode: 145;
}

export class NumEqual extends Opcode {
  name: 'NUMEQUAL';
  opcode: 156;
}

export class NumEqualVerify extends Opcode {
  name: 'NUMEQUALVERIFY';
  opcode: 157;
}

export class NumNotEqual extends Opcode {
  name: 'NUMNOTEQUAL';
  opcode: 158;
}

export class LessThan extends Opcode {
  name: 'LESSTHAN';
  opcode: 159;
}

export class GreaterThan extends Opcode {
  name: 'GREATERTHAN';
  opcode: 160;
}

export class LessThanOrEqual extends Opcode {
  name: 'LESSTHANOREQUAL';
  opcode: 161;
}

export class GreaterThanOrEqual extends Opcode {
  name: 'GREATERTHANOREQUAL';
  opcode: 162;
}

export class Min extends Opcode {
  name: 'MIN';
  opcode: 163;
}

export class Max extends Opcode {
  name: 'MAX';
  opcode: 164;
}

export class Within extends Opcode {
  name: 'WITHIN';
  opcode: 165;
}

// -- CRYPTO --

export class Ripemd160 extends Opcode {
  name: 'RIPEMD160';
  opcode: 166;
}

export class Sha1 extends Opcode {
  name: 'SHA1';
  opcode: 167;
}

export class Sha256 extends Opcode {
  name: 'SHA256';
  opcode: 168;
}

export class Hash160 extends Opcode {
  name: 'HASH160';
  opcode: 169;
}

export class Hash256 extends Opcode {
  name: 'HASH256';
  opcode: 170;
}

export class CheckSig extends Opcode {
  name: 'CHECKSIG';
  opcode: 172;
}

export class CheckSigVerify extends Opcode {
  name: 'CHECKSIGVERIFY';
  opcode: 173;
}

export class CheckMultiSig extends Opcode {
  name: 'CHECKMULTISIG';
  opcode: 174;
}

export class CheckMultiSigVerify extends Opcode {
  name: 'CHECKMULTISIGVERIFY';
  opcode: 175;
}

export class CheckDataSig extends Opcode {
  name: 'CHECKDATASIG';
  opcode: 186;
}

export class CheckDataSigVerify extends Opcode {
  name: 'CHECKDATASIGVERIFY';
  opcode: 187;
}

// -- LOCKTIME --
export class CheckLockTimeVerify extends Opcode {
  name: 'CHECKLOCKTIMEVERIFY';
  opcode: 177;
}

export class CheckSequenceVerify extends Opcode {
  name: 'CHECKSEQUENCEVERIFY';
  opcode: 178;
}
