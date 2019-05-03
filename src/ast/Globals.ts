import { SymbolTable, Symbol } from './SymbolTable';
import { Type } from './Type';

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
  SIGCHECK = 'sigCheck'
}

export enum TimeOp {
  CHECK_SEQUENCE = 'tx.minAge',
  CHECK_LOCKTIME = 'tx.minTime',
}

export const GLOBAL_SYMBOL_TABLE = new SymbolTable();
GLOBAL_SYMBOL_TABLE.set(new Symbol(GlobalFunction.REQUIRE, Type.VOID, [Type.BOOL]));
GLOBAL_SYMBOL_TABLE.set(new Symbol(GlobalFunction.ABS, Type.INT, [Type.INT]));
GLOBAL_SYMBOL_TABLE.set(new Symbol(GlobalFunction.MIN, Type.INT, [Type.INT, Type.INT]));
GLOBAL_SYMBOL_TABLE.set(new Symbol(GlobalFunction.MAX, Type.INT, [Type.INT, Type.INT]));
GLOBAL_SYMBOL_TABLE.set(new Symbol(GlobalFunction.WITHIN, Type.BOOL, [Type.INT, Type.INT]));
GLOBAL_SYMBOL_TABLE.set(new Symbol(GlobalFunction.RIPEMD160, Type.BYTES20, [Type.BYTES]));
GLOBAL_SYMBOL_TABLE.set(new Symbol(GlobalFunction.SHA1, Type.BYTES32, [Type.BYTES]));
GLOBAL_SYMBOL_TABLE.set(new Symbol(GlobalFunction.SHA256, Type.BYTES32, [Type.BYTES]));
GLOBAL_SYMBOL_TABLE.set(new Symbol(`${GlobalFunction.SIGCHECK}$single`, Type.VOID, [Type.SIG, Type.PUBKEY]));
// GLOBAL_SYMBOL_TABLE.set(new Symbol(`${GlobalFunction.SIGCHECK}$multi`, Type.VOID, [Type.BYTES]));
GLOBAL_SYMBOL_TABLE.set(new Symbol(`${GlobalFunction.SIGCHECK}$data`, Type.VOID, [Type.SIG, Type.BYTES, Type.PUBKEY]));
