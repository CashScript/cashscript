import { PrimitiveType, ArrayType, BytesType } from '@cashscript/utils';
import { SymbolTable, Symbol } from './SymbolTable.js';

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

export enum Class {
  LOCKING_BYTECODE_P2SH20 = 'LockingBytecodeP2SH20',
  LOCKING_BYTECODE_P2SH32 = 'LockingBytecodeP2SH32',
  LOCKING_BYTECODE_P2PKH = 'LockingBytecodeP2PKH',
  LOCKING_BYTECODE_NULLDATA = 'LockingBytecodeNullData',
}

export enum Modifier {
  CONSTANT = 'constant',
}

export const GLOBAL_SYMBOL_TABLE = new SymbolTable();

// Classes
GLOBAL_SYMBOL_TABLE.set(
  Symbol.class(Class.LOCKING_BYTECODE_P2SH20, new BytesType(23), [new BytesType(20)]),
);
GLOBAL_SYMBOL_TABLE.set(
  Symbol.class(Class.LOCKING_BYTECODE_P2SH32, new BytesType(35), [new BytesType(32)]),
);
GLOBAL_SYMBOL_TABLE.set(
  Symbol.class(Class.LOCKING_BYTECODE_P2PKH, new BytesType(25), [new BytesType(20)]),
);
GLOBAL_SYMBOL_TABLE.set(
  Symbol.class(Class.LOCKING_BYTECODE_NULLDATA, new BytesType(), [new ArrayType(new BytesType())]),
);

// Global functions
GLOBAL_SYMBOL_TABLE.set(
  Symbol.function(GlobalFunction.ABS, PrimitiveType.INT, [PrimitiveType.INT]),
);
GLOBAL_SYMBOL_TABLE.set(
  Symbol.function(GlobalFunction.MIN, PrimitiveType.INT, [PrimitiveType.INT, PrimitiveType.INT]),
);
GLOBAL_SYMBOL_TABLE.set(
  Symbol.function(GlobalFunction.MAX, PrimitiveType.INT, [PrimitiveType.INT, PrimitiveType.INT]),
);
GLOBAL_SYMBOL_TABLE.set(Symbol.function(
  GlobalFunction.WITHIN, PrimitiveType.BOOL,
  [PrimitiveType.INT, PrimitiveType.INT, PrimitiveType.INT],
));
GLOBAL_SYMBOL_TABLE.set(
  Symbol.function(GlobalFunction.RIPEMD160, new BytesType(20), [PrimitiveType.ANY]),
);
GLOBAL_SYMBOL_TABLE.set(
  Symbol.function(GlobalFunction.SHA1, new BytesType(20), [PrimitiveType.ANY]),
);
GLOBAL_SYMBOL_TABLE.set(
  Symbol.function(GlobalFunction.SHA256, new BytesType(32), [PrimitiveType.ANY]),
);
GLOBAL_SYMBOL_TABLE.set(
  Symbol.function(GlobalFunction.HASH160, new BytesType(20), [PrimitiveType.ANY]),
);
GLOBAL_SYMBOL_TABLE.set(
  Symbol.function(GlobalFunction.HASH256, new BytesType(32), [PrimitiveType.ANY]),
);
GLOBAL_SYMBOL_TABLE.set(Symbol.function(
  GlobalFunction.CHECKSIG, PrimitiveType.BOOL,
  [PrimitiveType.SIG, PrimitiveType.PUBKEY],
));
GLOBAL_SYMBOL_TABLE.set(Symbol.function(
  GlobalFunction.CHECKMULTISIG, PrimitiveType.BOOL,
  [new ArrayType(PrimitiveType.SIG), new ArrayType(PrimitiveType.PUBKEY)],
));
GLOBAL_SYMBOL_TABLE.set(Symbol.function(
  GlobalFunction.CHECKDATASIG, PrimitiveType.BOOL,
  [PrimitiveType.DATASIG, new BytesType(), PrimitiveType.PUBKEY],
));
