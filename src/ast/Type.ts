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
  [Type.BYTES]: [Type.BYTES, Type.SIG, Type.PUBKEY], // Could support downcasting
  [Type.BYTES20]: [Type.BYTES20, Type.BYTES32, Type.BYTES],
  [Type.BYTES32]: [Type.BYTES32, Type.BYTES],
  [Type.VOID]: [],
  [Type.ANY]: [],
};

const ImplicitlyCastableTo: { [key in Type]: Type[]} = {
  [Type.INT]: [Type.INT, Type.ANY],
  [Type.BOOL]: [Type.BOOL, Type.ANY],
  [Type.STRING]: [Type.STRING, Type.ANY],
  [Type.PUBKEY]: [Type.PUBKEY, Type.BYTES, Type.ANY],
  [Type.SIG]: [Type.SIG, Type.BYTES, Type.ANY],
  [Type.BYTES]: [Type.BYTES, Type.ANY], // Could support downcasting
  [Type.BYTES20]: [Type.BYTES20, Type.BYTES32, Type.BYTES, Type.ANY],
  [Type.BYTES32]: [Type.BYTES32, Type.BYTES, Type.ANY],
  [Type.VOID]: [],
  [Type.ANY]: [],
};

export function explicitlyCastable(castable?: Type, castType?: Type): boolean {
  if (!castable || !castType) return false;
  return ExplicitlyCastableTo[castable].includes(castType);
}

export function implicitlyCastable(actual?: Type, expected?: Type): boolean {
  if (!actual || !expected) return false;
  return ImplicitlyCastableTo[actual].includes(expected);
}

export function resultingType(left?: Type, right?: Type): Type | undefined {
  if (implicitlyCastable(left, right)) return right;
  if (implicitlyCastable(right, left)) return left;
  return undefined;
}

export function implicitlyCastableSignature(actual: Type[], expected: Type[]): boolean {
  if (actual.length !== expected.length) return false;
  return expected.every((t, i) => implicitlyCastable(actual[i], t));
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
