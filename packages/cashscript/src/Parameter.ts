import { hexToBin } from '@bitauth/libauth';
import {
  PrimitiveType,
  Data,
  BytesType,
  parseType,
} from 'cashc';
import { TypeError } from './Errors';
import SignatureTemplate from './SignatureTemplate';

export type Parameter = number | boolean | string | Uint8Array | SignatureTemplate;

export function encodeParameter(
  parameter: Parameter,
  typeStr: string,
): Uint8Array | SignatureTemplate {
  const type = parseType(typeStr);
  if (type === PrimitiveType.BOOL) {
    if (typeof parameter !== 'boolean') {
      throw new TypeError(typeof parameter, type);
    }
    return Data.encodeBool(parameter);
  } else if (type === PrimitiveType.INT) {
    if (typeof parameter !== 'number') {
      throw new TypeError(typeof parameter, type);
    }
    return Data.encodeInt(parameter);
  } else if (type === PrimitiveType.STRING) {
    if (typeof parameter !== 'string') {
      throw new TypeError(typeof parameter, type);
    }
    return Data.encodeString(parameter);
  } else {
    if (type === PrimitiveType.SIG && parameter instanceof SignatureTemplate) return parameter;
    // Convert string to Uint8Array
    if (typeof parameter === 'string') {
      if (parameter.startsWith('0x')) {
        parameter = parameter.slice(2);
      }
      parameter = hexToBin(parameter);
    }

    if (!(parameter instanceof Uint8Array)) throw Error(); // Shouldn't happen

    // Bounded bytes types require a correctly sized parameter
    if (type instanceof BytesType && type.bound && parameter.byteLength !== type.bound) {
      throw new TypeError(`bytes${parameter.byteLength}`, type);
    }

    return parameter;
  }
}
