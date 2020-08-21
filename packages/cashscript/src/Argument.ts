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
  const type = parseType(typeStr);
  if (type === PrimitiveType.BOOL) {
    if (typeof argument !== 'boolean') {
      throw new TypeError(typeof argument, type);
    }
    return Data.encodeBool(argument);
  } else if (type === PrimitiveType.INT) {
    if (typeof argument !== 'number') {
      throw new TypeError(typeof argument, type);
    }
    return Data.encodeInt(argument);
  } else if (type === PrimitiveType.STRING) {
    if (typeof argument !== 'string') {
      throw new TypeError(typeof argument, type);
    }
    return Data.encodeString(argument);
  } else {
    if (type === PrimitiveType.SIG && argument instanceof SignatureTemplate) return argument;
    // Convert string to Uint8Array
    if (typeof argument === 'string') {
      if (argument.startsWith('0x')) {
        argument = argument.slice(2);
      }
      argument = hexToBin(argument);
    }

    if (!(argument instanceof Uint8Array)) throw Error(); // Shouldn't happen

    // Bounded bytes types require a correctly sized argument
    if (type instanceof BytesType && type.bound && argument.byteLength !== type.bound) {
      throw new TypeError(`bytes${argument.byteLength}`, type);
    }

    return argument;
  }
}
