import {
  ArrayType,
  BytesType,
  explicitlyCastable,
  parseType,
  PrimitiveType,
  TupleType,
} from '../src/index.js';

describe('type utilities', () => {
  describe('explicitlyCastable()', () => {
    it('cannot cast undefined values', () => {
      expect(explicitlyCastable(PrimitiveType.INT, undefined)).toEqual(false);
      expect(explicitlyCastable(undefined, PrimitiveType.STRING)).toEqual(false);
    });

    it('cannot cast tuples', () => {
      expect(explicitlyCastable(PrimitiveType.INT, new TupleType(PrimitiveType.INT)))
        .toEqual(false);
      expect(explicitlyCastable(new TupleType(PrimitiveType.INT), PrimitiveType.STRING))
        .toEqual(false);
    });

    it('cannot cast between array an non-array', () => {
      expect(explicitlyCastable(PrimitiveType.INT, new ArrayType(PrimitiveType.INT)))
        .toEqual(false);
    });

    it('cannot cast arrays if their elements cannot be cast', () => {
      expect(
        explicitlyCastable(new ArrayType(PrimitiveType.BOOL), new ArrayType(PrimitiveType.STRING)),
      ).toEqual(false);
    });

    it('can cast arrays if their elements can be cast', () => {
      expect(
        explicitlyCastable(new ArrayType(PrimitiveType.BOOL), new ArrayType(PrimitiveType.INT)),
      ).toEqual(true);
    });

    // TODO: fully test cast combinations
  });

  describe.skip('TODO: implicitlyCastable()', () => {
  });

  describe.skip('TODO: resultingType()', () => {
  });

  describe.skip('TODO: arrayType()', () => {
  });

  describe.skip('TODO: implicitlyCastableSignature()', () => {
  });

  describe('parseType()', () => {
    it('should parse primitive type strings', () => {
      expect(parseType('int')).toEqual(PrimitiveType.INT);
      expect(parseType('bool')).toEqual(PrimitiveType.BOOL);
      expect(parseType('string')).toEqual(PrimitiveType.STRING);
      expect(parseType('pubkey')).toEqual(PrimitiveType.PUBKEY);
      expect(parseType('sig')).toEqual(PrimitiveType.SIG);
      expect(parseType('datasig')).toEqual(PrimitiveType.DATASIG);
    });

    it('should parse bytes type strings', () => {
      expect(parseType('bytes')).toEqual(new BytesType());
      expect(parseType('bytes1')).toEqual(new BytesType(1));
      expect(parseType('bytes32')).toEqual(new BytesType(32));
      expect(parseType('bytes256')).toEqual(new BytesType(256));
    });
  });
});
