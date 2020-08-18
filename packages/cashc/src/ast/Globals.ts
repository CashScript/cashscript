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
  OUTPUT_P2SH = 'OutputP2SH',
  OUTPUT_P2PKH = 'OutputP2PKH',
  OUTPUT_NULLDATA = 'OutputNullData'
}

export enum PreimageField {
  VERSION = 'tx.version', // bytes4
  HASHPREVOUTS = 'tx.hashPrevouts', // bytes32
  HASHSEQUENCE = 'tx.hashSequence', // bytes32
  OUTPOINT = 'tx.outpoint', // bytes36
  BYTECODE = 'tx.bytecode', // bytes
  VALUE = 'tx.value', // bytes8
  SEQUENCE = 'tx.sequence', // bytes4
  HASHOUTPUTS = 'tx.hashOutputs', // bytes32
  LOCKTIME = 'tx.locktime', // bytes4
  HASHTYPE = 'tx.hashtype', // bytes4
}

export const GLOBAL_SYMBOL_TABLE = new SymbolTable();

// Preimage fields
GLOBAL_SYMBOL_TABLE.set(Symbol.global(PreimageField.VERSION, new BytesType(4)));
GLOBAL_SYMBOL_TABLE.set(Symbol.global(PreimageField.HASHPREVOUTS, new BytesType(32)));
GLOBAL_SYMBOL_TABLE.set(Symbol.global(PreimageField.HASHSEQUENCE, new BytesType(32)));
GLOBAL_SYMBOL_TABLE.set(Symbol.global(PreimageField.OUTPOINT, new BytesType(36)));
GLOBAL_SYMBOL_TABLE.set(Symbol.global(PreimageField.BYTECODE, new BytesType()));
GLOBAL_SYMBOL_TABLE.set(Symbol.global(PreimageField.VALUE, new BytesType(8)));
GLOBAL_SYMBOL_TABLE.set(Symbol.global(PreimageField.SEQUENCE, new BytesType(4)));
GLOBAL_SYMBOL_TABLE.set(Symbol.global(PreimageField.HASHOUTPUTS, new BytesType(32)));
GLOBAL_SYMBOL_TABLE.set(Symbol.global(PreimageField.LOCKTIME, new BytesType(4)));
GLOBAL_SYMBOL_TABLE.set(Symbol.global(PreimageField.HASHTYPE, new BytesType(4)));

// Classes
GLOBAL_SYMBOL_TABLE.set(
  Symbol.class(Class.OUTPUT_P2SH, new BytesType(32), [new BytesType(8), new BytesType(20)]),
);
GLOBAL_SYMBOL_TABLE.set(
  Symbol.class(Class.OUTPUT_P2PKH, new BytesType(34), [new BytesType(8), new BytesType(20)]),
);
GLOBAL_SYMBOL_TABLE.set(
  Symbol.class(Class.OUTPUT_NULLDATA, new BytesType(), [new ArrayType(new BytesType())]),
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
