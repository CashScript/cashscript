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

export const GLOBAL_SYMBOL_TABLE = new SymbolTable();
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
