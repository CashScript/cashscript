import { hexToBin } from '@bitauth/libauth';
import {
  PrimitiveType,
  Data,
  BytesType,
  parseType,
} from 'cashc';
import { TypeError } from './Errors';
import SignatureTemplate from './SignatureTemplate';

export type Argument = number | boolean | string | Uint8Array | SignatureTemplate;

export function encodeArgument(
  argument: Argument,
  typeStr: string,
): Uint8Array | SignatureTemplate {
  let type = parseType(typeStr);

  if (type === PrimitiveType.BOOL) {
    if (typeof argument !== 'boolean') {
      throw new TypeError(typeof argument, type);
    }
    return Data.encodeBool(argument);
  }

  if (type === PrimitiveType.INT) {
    if (typeof argument !== 'number') {
      throw new TypeError(typeof argument, type);
    }
    return Data.encodeInt(argument);
  }

  if (type === PrimitiveType.STRING) {
    if (typeof argument !== 'string') {
      throw new TypeError(typeof argument, type);
    }
    return Data.encodeString(argument);
  }

  if (type === PrimitiveType.SIG && argument instanceof SignatureTemplate) return argument;

  // Convert hex string to Uint8Array
  if (typeof argument === 'string') {
    if (argument.startsWith('0x')) {
      argument = argument.slice(2);
    }

    argument = hexToBin(argument);
  }

  if (!(argument instanceof Uint8Array)) {
    throw Error(`Value for type ${type} should be a Uint8Array or hex string`);
  }

  // Redefine SIG as a bytes65 so it is included in the size checks below
  // Note that ONLY Schnorr signatures are accepted
  if (type === PrimitiveType.SIG) {
    type = new BytesType(65);
  }

  // TODO: Set DATASIG to 64 bytes (enforcing Schnorr) in a new MINOR version upgrade
  // (backwards incompatible)
  // if (type === PrimitiveType.DATASIG) {
  //   type = new BytesType(64);
  // }

  // Bounded bytes types require a correctly sized argument
  if (type instanceof BytesType && type.bound && argument.byteLength !== type.bound) {
    throw new TypeError(`bytes${argument.byteLength}`, type);
  }

  return argument;
}
