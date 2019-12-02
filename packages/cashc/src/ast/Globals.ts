import { SymbolTable, Symbol } from './SymbolTable';
import { PrimitiveType, ArrayType, BytesType } from './Type';

export const NumberUnit: { [index:string] : number } = {
  SATOSHIS: 1,
  SATS: 1,
  FINNEY: 10,
  BITS: 100,
  BITCOIN: 100000000,
  SECONDS: 1,
  MINUTES: 60,
  HOURS: 3600,
  DAYS: 86400,
  WEEKS: 604800,
};


export enum GlobalFunction {
  REQUIRE = 'require',
  ABS = 'abs',
  MIN = 'min',
  MAX = 'max',
  WITHIN = 'within',
  RIPEMD160 = 'ripemd160',
  SHA1 = 'sha1',
  SHA256 = 'sha256',
  HASH160 = 'hash160',
  HASH256 = 'hash256',
  CHECKSIG = 'checkSig',
  CHECKMULTISIG = 'checkMultiSig',
  CHECKDATASIG = 'checkDataSig',
}

export enum TimeOp {
  CHECK_SEQUENCE = 'tx.age',
  CHECK_LOCKTIME = 'tx.time',
}

export enum PreimageField {
  VERSION = 'tx.version', // bytes4
  HASHPREVOUTS = 'tx.hashPrevouts', // bytes32
  HASHSEQUENCE = 'tx.hashSequence', // bytes32
  OUTPOINT = 'tx.outpoint', // bytes36
  SCRIPTCODE = 'tx.scriptCode', // bytes
  VALUE = 'tx.value', // bytes8
  SEQUENCE = 'tx.sequence', // bytes4
  HASHOUTPUTS = 'tx.hashOutputs', // bytes32
  LOCKTIME = 'tx.locktime', // bytes4
  HASHTYPE = 'tx.hashtype', // bytes4
  FULL = 'tx.preimage' // full preimage
}

export const GLOBAL_SYMBOL_TABLE = new SymbolTable();
// Preimage fields
GLOBAL_SYMBOL_TABLE.set(new Symbol(PreimageField.VERSION, new BytesType(4)));
GLOBAL_SYMBOL_TABLE.set(new Symbol(PreimageField.HASHOUTPUTS, new BytesType(32)));
GLOBAL_SYMBOL_TABLE.set(new Symbol(PreimageField.HASHSEQUENCE, new BytesType(32)));
GLOBAL_SYMBOL_TABLE.set(new Symbol(PreimageField.OUTPOINT, new BytesType(36)));
GLOBAL_SYMBOL_TABLE.set(new Symbol(PreimageField.SCRIPTCODE, new BytesType()));
GLOBAL_SYMBOL_TABLE.set(new Symbol(PreimageField.VALUE, new BytesType(8)));
GLOBAL_SYMBOL_TABLE.set(new Symbol(PreimageField.SEQUENCE, new BytesType(4)));
GLOBAL_SYMBOL_TABLE.set(new Symbol(PreimageField.HASHOUTPUTS, new BytesType(32)));
GLOBAL_SYMBOL_TABLE.set(new Symbol(PreimageField.LOCKTIME, new BytesType(4)));
GLOBAL_SYMBOL_TABLE.set(new Symbol(PreimageField.HASHTYPE, new BytesType(4)));
GLOBAL_SYMBOL_TABLE.set(new Symbol(PreimageField.FULL, new BytesType()));

// Global functions
GLOBAL_SYMBOL_TABLE.set(new Symbol(
  GlobalFunction.ABS, PrimitiveType.INT, undefined,
  [PrimitiveType.INT],
));
GLOBAL_SYMBOL_TABLE.set(new Symbol(
  GlobalFunction.MIN, PrimitiveType.INT, undefined,
  [PrimitiveType.INT, PrimitiveType.INT],
));
GLOBAL_SYMBOL_TABLE.set(new Symbol(
  GlobalFunction.MAX, PrimitiveType.INT, undefined,
  [PrimitiveType.INT, PrimitiveType.INT],
));
GLOBAL_SYMBOL_TABLE.set(new Symbol(
  GlobalFunction.WITHIN, PrimitiveType.BOOL, undefined,
  [PrimitiveType.INT, PrimitiveType.INT, PrimitiveType.INT],
));
GLOBAL_SYMBOL_TABLE.set(new Symbol(
  GlobalFunction.RIPEMD160, new BytesType(20), undefined,
  [PrimitiveType.ANY],
));
GLOBAL_SYMBOL_TABLE.set(new Symbol(
  GlobalFunction.SHA1, new BytesType(32), undefined,
  [PrimitiveType.ANY],
));
GLOBAL_SYMBOL_TABLE.set(new Symbol(
  GlobalFunction.SHA256, new BytesType(32), undefined,
  [PrimitiveType.ANY],
));
GLOBAL_SYMBOL_TABLE.set(new Symbol(
  GlobalFunction.HASH160, new BytesType(20), undefined,
  [PrimitiveType.ANY],
));
GLOBAL_SYMBOL_TABLE.set(new Symbol(
  GlobalFunction.HASH256, new BytesType(32), undefined,
  [PrimitiveType.ANY],
));
GLOBAL_SYMBOL_TABLE.set(new Symbol(
  GlobalFunction.CHECKSIG, PrimitiveType.BOOL, undefined,
  [PrimitiveType.SIG, PrimitiveType.PUBKEY],
));
GLOBAL_SYMBOL_TABLE.set(new Symbol(
  GlobalFunction.CHECKMULTISIG, PrimitiveType.BOOL, undefined,
  [new ArrayType(PrimitiveType.SIG), new ArrayType(PrimitiveType.PUBKEY)],
));
GLOBAL_SYMBOL_TABLE.set(new Symbol(
  GlobalFunction.CHECKDATASIG, PrimitiveType.BOOL, undefined,
  [PrimitiveType.DATASIG, new BytesType(), PrimitiveType.PUBKEY],
));
