import { TypeNameContext } from '../grammar/CashScriptParser';

export type Type = PrimitiveType | ArrayType | TupleType;

export class ArrayType {
  constructor(
    public elementType: PrimitiveType,
  ) {}

  toString() {
    return `${this.elementType}[]`;
  }
}

export class TupleType {
  constructor(
    public elementType?: PrimitiveType,
  ) {}

  toString() {
    return `(${this.elementType}, ${this.elementType})`;
  }
}

export enum PrimitiveType {
  INT = 'int',
  BOOL = 'bool',
  STRING = 'string',
  // ADDRESS = 'address',
  PUBKEY = 'pubkey',
  SIG = 'sig',
  DATASIG = 'datasig',
  BYTES = 'bytes',
  BYTES20 = 'bytes20',
  BYTES32 = 'bytes32',
  ANY = 'any',
}

const ExplicitlyCastableTo: { [key in PrimitiveType]: PrimitiveType[]} = {
  [PrimitiveType.INT]: [
    PrimitiveType.INT, PrimitiveType.BYTES, PrimitiveType.BYTES20,
    PrimitiveType.BYTES32, PrimitiveType.BOOL,
  ],
  [PrimitiveType.BOOL]: [PrimitiveType.BOOL, PrimitiveType.INT],
  [PrimitiveType.STRING]: [PrimitiveType.STRING, PrimitiveType.BYTES],
  [PrimitiveType.PUBKEY]: [PrimitiveType.PUBKEY, PrimitiveType.BYTES],
  [PrimitiveType.SIG]: [PrimitiveType.SIG, PrimitiveType.DATASIG, PrimitiveType.BYTES],
  [PrimitiveType.DATASIG]: [PrimitiveType.DATASIG, PrimitiveType.SIG, PrimitiveType.BYTES],
  [PrimitiveType.BYTES]: [
    PrimitiveType.BYTES, PrimitiveType.BYTES20, PrimitiveType.BYTES32,
    PrimitiveType.SIG, PrimitiveType.PUBKEY, PrimitiveType.INT,
  ], // Could support downcasting
  [PrimitiveType.BYTES20]: [PrimitiveType.BYTES20, PrimitiveType.BYTES32, PrimitiveType.BYTES],
  [PrimitiveType.BYTES32]: [PrimitiveType.BYTES32, PrimitiveType.BYTES],
  [PrimitiveType.ANY]: [],
};

const ImplicitlyCastableTo: { [key in PrimitiveType]: PrimitiveType[]} = {
  [PrimitiveType.INT]: [PrimitiveType.INT, PrimitiveType.ANY],
  [PrimitiveType.BOOL]: [PrimitiveType.BOOL, PrimitiveType.ANY],
  [PrimitiveType.STRING]: [PrimitiveType.STRING, PrimitiveType.ANY],
  [PrimitiveType.PUBKEY]: [PrimitiveType.PUBKEY, PrimitiveType.BYTES, PrimitiveType.ANY],
  [PrimitiveType.SIG]: [PrimitiveType.SIG, PrimitiveType.BYTES, PrimitiveType.ANY],
  [PrimitiveType.DATASIG]: [PrimitiveType.DATASIG, PrimitiveType.BYTES, PrimitiveType.ANY],
  [PrimitiveType.BYTES]: [PrimitiveType.BYTES, PrimitiveType.ANY], // Could support downcasting
  [PrimitiveType.BYTES20]: [
    PrimitiveType.BYTES20, PrimitiveType.BYTES32, PrimitiveType.BYTES, PrimitiveType.ANY,
  ],
  [PrimitiveType.BYTES32]: [PrimitiveType.BYTES32, PrimitiveType.BYTES, PrimitiveType.ANY],
  [PrimitiveType.ANY]: [],
};

export function explicitlyCastable(from?: Type, to?: Type): boolean {
  if (!from || !to) return false;
  if (from instanceof TupleType || to instanceof TupleType) return false;

  if (from instanceof ArrayType && to instanceof ArrayType) {
    return explicitlyCastable(from.elementType, to.elementType);
  }

  if (from instanceof ArrayType || to instanceof ArrayType) return false;

  return ExplicitlyCastableTo[from].includes(to);
}

export function implicitlyCastable(actual?: Type, expected?: Type): boolean {
  if (!actual || !expected) return false;
  if (actual instanceof TupleType || expected instanceof TupleType) return false;

  if (actual instanceof ArrayType && expected instanceof ArrayType) {
    return implicitlyCastable(actual.elementType, expected.elementType);
  }

  if (actual instanceof ArrayType || expected instanceof ArrayType) return false;

  return ImplicitlyCastableTo[actual].includes(expected);
}

export function resultingType(
  left?: Type,
  right?: Type,
): Type | undefined {
  if (implicitlyCastable(left, right)) return right;
  if (implicitlyCastable(right, left)) return left;
  return undefined;
}

export function arrayType(types: PrimitiveType[]): PrimitiveType | undefined {
  if (types.length === 0) return undefined;
  let resType: PrimitiveType | undefined = types[0];
  types.forEach((t) => {
    resType = resultingType(resType, t) as PrimitiveType;
  });
  return resType;
}

export function implicitlyCastableSignature(
  actual: Type[],
  expected: Type[],
): boolean {
  if (actual.length !== expected.length) return false;
  return expected.every((t, i) => implicitlyCastable(actual[i], t));
}

export function isBytes(type?: PrimitiveType): boolean {
  if (!type) return false;
  return [PrimitiveType.BYTES, PrimitiveType.BYTES20, PrimitiveType.BYTES32].includes(type);
}

export function getPrimitiveTypeFromCtx(ctx: TypeNameContext): PrimitiveType {
  return getPrimitiveType(ctx.text || ctx.Bytes().text);
}

export function getPrimitiveType(name: string): PrimitiveType {
  return PrimitiveType[name.toUpperCase() as keyof typeof PrimitiveType];
}

export function isPrimitive(type: Type): type is PrimitiveType {
  return !!PrimitiveType[type.toString().toUpperCase() as keyof typeof PrimitiveType];
}
