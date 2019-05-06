import { TypeNameContext } from '../grammar/CashScriptParser';

export enum Type {
  INT = 'int',
  BOOL = 'bool',
  STRING = 'string',
  // ADDRESS = 'address',
  PUBKEY = 'pubkey',
  SIG = 'sig',
  BYTES = 'bytes',
  BYTES20 = 'bytes20',
  BYTES32 = 'bytes32',
  VOID = 'void',
  ANY = 'any',
}

const ExplicitlyCastableTo: { [key in Type]: Type[]} = {
  [Type.INT]: [Type.INT, Type.BYTES, Type.BYTES32, Type.BOOL],
  [Type.BOOL]: [Type.BOOL, Type.INT],
  [Type.STRING]: [Type.STRING, Type.BYTES],
  [Type.PUBKEY]: [Type.PUBKEY, Type.BYTES],
  [Type.SIG]: [Type.SIG, Type.BYTES],
  [Type.BYTES]: [Type.BYTES, Type.SIG, Type.PUBKEY, Type.STRING], // Could support downcasting
  [Type.BYTES20]: [Type.BYTES20, Type.BYTES32, Type.BYTES],
  [Type.BYTES32]: [Type.BYTES32, Type.BYTES],
  [Type.VOID]: [],
  [Type.ANY]: [],
};

export function explicitlyCastable(castable?: Type, castType?: Type): boolean {
  if (!castable || !castType) return false;
  if (!(ExplicitlyCastableTo[castable].includes(castType))) return false;
  return true;
}

export function compatibleType(actual?: Type, expected?: Type): boolean {
  if (!actual || !expected) return false;
  if (expected === Type.ANY) return true;
  if (expected === Type.BYTES) return isBytes(actual);
  return expected === actual;
}

export function compatibleSignature(actual: Type[], expected: Type[]): boolean {
  if (expected.length !== actual.length) return false;
  return expected.every((t, i) => compatibleType(actual[i], t));
}

export function isBytes(type?: Type): boolean {
  return !!type && [Type.BYTES, Type.BYTES20, Type.BYTES32].includes(type);
}

export function getTypeFromCtx(ctx: TypeNameContext): Type {
  return getType(ctx.text || ctx.Bytes().text);
}

export function getType(name: string): Type {
  return Type[name.toUpperCase() as keyof typeof Type];
}
