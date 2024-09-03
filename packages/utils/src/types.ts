export type Type = PrimitiveType | ArrayType | TupleType | BytesType;

export class ArrayType {
  constructor(
    public elementType: Type,
    public bound?: number,
  ) {}

  toString(): string {
    return `${this.elementType}[${this.bound ?? ''}]`;
  }
}

export class BytesType {
  constructor(
    public bound?: number,
  ) {}

  static fromString(str: string): BytesType {
    const bound = str === 'byte' ? 1 : Number.parseInt(str.substring(5), 10) || undefined;
    return new BytesType(bound);
  }

  toString(): string {
    return `bytes${this.bound ?? ''}`;
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

const ExplicitlyCastableTo: { [key in PrimitiveType]: PrimitiveType[] } = {
  [PrimitiveType.INT]: [PrimitiveType.INT, PrimitiveType.BOOL],
  [PrimitiveType.BOOL]: [PrimitiveType.BOOL, PrimitiveType.INT],
  [PrimitiveType.STRING]: [PrimitiveType.STRING],
  [PrimitiveType.PUBKEY]: [PrimitiveType.PUBKEY],
  [PrimitiveType.SIG]: [PrimitiveType.SIG],
  [PrimitiveType.DATASIG]: [PrimitiveType.DATASIG],
  [PrimitiveType.ANY]: [],
};

export function explicitlyCastable(from?: Type, to?: Type): boolean {
  if (!from || !to) return false;

  // Tuples can't be cast
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
    // Can cast int to any size bytes
    if (from === PrimitiveType.INT) return true;

    // Can freely cast to unbounded bytes
    if (!to.bound) return true;

    if (from instanceof BytesType) {
      // Can freely cast from unbounded bytes
      if (!from.bound) return true;
      // Can only cast bounded bytes to bounded bytes if bounds are equal
      return from.bound === to.bound;
    }

    // Cannot cast other primitive types directly to bounded bytes types
    return false;
  }

  if (from instanceof BytesType) {
    // Can cast unbounded bytes or <=4 bytes to int
    if (to === PrimitiveType.INT) return !from.bound || from.bound <= 8;
    // Can't cast bytes to bool or string
    if (to === PrimitiveType.BOOL) return false;
    if (to === PrimitiveType.STRING) return false;
    // Can cast any bytes to pubkey, sig, datasig
    if (to === PrimitiveType.PUBKEY) return true;
    if (to === PrimitiveType.SIG) return true;
    if (to === PrimitiveType.DATASIG) return true;
    return true;
  }

  return ExplicitlyCastableTo[from].includes(to);
}

export function implicitlyCastable(actual?: Type, expected?: Type): boolean {
  if (!actual || !expected) return false;

  // Tuples can't be cast
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
      // Can only cast bounded bytes to bounded bytes if bounds are equal
      return actual.bound === expected.bound;
    }

    // Cannot cast other primitive types directly to bounded bytes types
    return false;
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
  if (left instanceof BytesType && right instanceof BytesType) {
    return new BytesType();
  }
  return undefined;
}

export function arrayType(types: Type[]): Type | undefined {
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

export function parseType(str: string): Type {
  if (str.startsWith('byte')) return BytesType.fromString(str);
  return PrimitiveType[str.toUpperCase() as keyof typeof PrimitiveType];
}

export function isPrimitive(type: Type): type is PrimitiveType {
  return !!PrimitiveType[type.toString().toUpperCase() as keyof typeof PrimitiveType];
}

export interface LocationI {
  start: {
    line: number,
    column: number
  };
  end: {
    line: number,
    column: number
  };
}

export type SingleLocationData = {
  location: LocationI;
  positionHint?: PositionHint;
};

export type FullLocationData = Array<SingleLocationData>;

// Denotes whether an opcode belongs to the "start" or "end" of the statement it's in (defaults to "start")
// Examples:
// require(true); --> the OP_VERIFY comes after the condition (OP_TRUE), so it should get a PositionHint.END
// !true --> the OP_NOT comes after the condition (OP_TRUE), so it should get a PositionHint.END
// if (true) { ... } --> the OP_IF comes before the body, so it should get a PositionHint.START,
//                       the OP_ENDIF comes after the body, so it should get a PositionHint.END
export enum PositionHint {
  START = 0,
  END = 1,
}
