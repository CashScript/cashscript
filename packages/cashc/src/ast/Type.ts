import { TypeNameContext } from '../grammar/CashScriptParser';

export type Type = PrimitiveType | ArrayType | TupleType | BytesType;

export class ArrayType {
  constructor(
    public elementType: Type,
    public bound?: number,
  ) {}

  toString(): string {
    return `${this.elementType}[${this.bound || ''}]`;
  }
}

export class BytesType {
  constructor(
    public bound?: number,
  ) {}

  toString(): string {
    return `bytes${this.bound || ''}`;
  }
}

export class TupleType {
  constructor(
    public elementType?: Type,
  ) {}

  toString(): string {
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
  ANY = 'any',
}

const ExplicitlyCastableTo: { [key in PrimitiveType]: PrimitiveType[]} = {
  [PrimitiveType.INT]: [
    PrimitiveType.INT, PrimitiveType.BOOL,
  ],
  [PrimitiveType.BOOL]: [PrimitiveType.BOOL, PrimitiveType.INT],
  [PrimitiveType.STRING]: [PrimitiveType.STRING],
  [PrimitiveType.PUBKEY]: [PrimitiveType.PUBKEY],
  [PrimitiveType.SIG]: [PrimitiveType.SIG, PrimitiveType.DATASIG],
  [PrimitiveType.DATASIG]: [PrimitiveType.DATASIG],
  [PrimitiveType.ANY]: [],
};

const PrimitiveTypeMinSize: { [key in PrimitiveType]: number } = {
  [PrimitiveType.INT]: 1,
  [PrimitiveType.BOOL]: 1,
  [PrimitiveType.STRING]: 0,
  [PrimitiveType.PUBKEY]: 65,
  [PrimitiveType.SIG]: 65,
  [PrimitiveType.DATASIG]: 64,
  [PrimitiveType.ANY]: 0,
};

export function explicitlyCastable(from?: Type, to?: Type): boolean {
  if (!from || !to) return false;

  // Tuples can't be casted
  if (from instanceof TupleType || to instanceof TupleType) return false;

  // Arrays can be cast if their elements can be cast (don't think this is actually used ever)
  if (from instanceof ArrayType && to instanceof ArrayType) {
    return explicitlyCastable(from.elementType, to.elementType);
  }

  // Can't cast between Array and non-Array
  if (from instanceof ArrayType || to instanceof ArrayType) return false;

  if (to instanceof BytesType) {
    // Can't cast bool to bytes
    if (from === PrimitiveType.BOOL) return false;

    // Can freely cast to unbounded bytes
    if (!to.bound) return true;

    if (from instanceof BytesType) {
      // Can freely cast from unbounded bytes
      if (!from.bound) return true;
      // Can only cast bounded bytes to bounded bytes if `from` fits in `to`
      return from.bound <= to.bound;
    }

    // Can only cast primitive type to bounded bytes if `from` fits in `to`
    const fromSize = PrimitiveTypeMinSize[from];
    return fromSize <= to.bound;
  }

  if (from instanceof BytesType) {
    // Can cast unbounded bytes or <=4 bytes to int
    if (to === PrimitiveType.INT) return !from.bound || from.bound <= 4;
    // Can't cast bytes to bool or string
    if (to === PrimitiveType.BOOL) return false;
    if (to === PrimitiveType.STRING) return false;
    // Can cast unbounded or properly sized bytes to pubkey, sig, datasig
    if (to === PrimitiveType.PUBKEY) return !from.bound || from.bound <= 65;
    if (to === PrimitiveType.SIG) return !from.bound || from.bound <= 65;
    if (to === PrimitiveType.DATASIG) return !from.bound || from.bound <= 64;
    return true;
  }

  return ExplicitlyCastableTo[from].includes(to);
}

// export function implicitlyCastable(actual?: Type, expected?: Type): boolean {
//   if (!actual || !expected) return false;
//   if (actual instanceof TupleType || expected instanceof TupleType) return false;

//   if (actual instanceof ArrayType && expected instanceof ArrayType) {
//     return implicitlyCastable(actual.elementType, expected.elementType);
//   }

//   if (actual instanceof ArrayType || expected instanceof ArrayType) return false;

//   return ImplicitlyCastableTo[actual].includes(expected);
// }

export function implicitlyCastable(actual?: Type, expected?: Type): boolean {
  if (!actual || !expected) return false;

  // Tuples can't be casted
  if (actual instanceof TupleType || expected instanceof TupleType) return false;

  // Arrays can be cast if their elements can be cast (don't think this is actually used ever)
  if (actual instanceof ArrayType && expected instanceof ArrayType) {
    return implicitlyCastable(actual.elementType, expected.elementType);
  }

  // Can't cast between Array and non-Array
  if (actual instanceof ArrayType || expected instanceof ArrayType) return false;

  // Anything can be implicitly cast to ANY
  if (expected === PrimitiveType.ANY) return true;

  if (expected instanceof BytesType) {
    // Can't implicitly cast bool, int, string to bytes
    if (actual === PrimitiveType.BOOL) return false;
    if (actual === PrimitiveType.INT) return false;
    if (actual === PrimitiveType.STRING) return false;

    // Can freely cast to unbounded bytes
    if (!expected.bound) return true;

    if (actual instanceof BytesType) {
      // Cannot implicitly cast from unbounded bytes
      if (!actual.bound) return false;
      // Can only cast bounded bytes to bounded bytes if `actual` fits in `expxected`
      return actual.bound <= expected.bound;
    }

    // Can only cast primitive type to bounded bytes if `from` fits in `to`
    const actualSize = PrimitiveTypeMinSize[actual];
    return actualSize <= expected.bound;
  }

  // Other primitive types can only be implicitly cast to themselves
  return actual === expected;
}

export function resultingType(
  left?: Type,
  right?: Type,
): Type | undefined {
  if (implicitlyCastable(left, right)) return right;
  if (implicitlyCastable(right, left)) return left;
  return undefined;
}

export function arrayType(types: PrimitiveType[]): Type | undefined {
  if (types.length === 0) return undefined;
  let resType: Type | undefined = types[0];
  types.forEach((t) => {
    resType = resultingType(resType, t) as Type;
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

export function getTypeFromCtx(ctx: TypeNameContext): Type {
  if (ctx. text .startsWith('bytes')) {
    const bound = Number.parseInt(ctx.text.substring(5), 10) || undefined;
    return new BytesType(bound);
  }
  if (ctx.text) return getPrimitiveType(ctx.text);
  throw new Error(); // Shouldn't happen
}

export function getPrimitiveType(name: string): PrimitiveType {
  return PrimitiveType[name.toUpperCase() as keyof typeof PrimitiveType];
}

export function isPrimitive(type: Type): type is PrimitiveType {
  return !!PrimitiveType[type.toString().toUpperCase() as keyof typeof PrimitiveType];
}
