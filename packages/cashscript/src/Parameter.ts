import { ECPair } from 'bitcoincashjs-lib';
import {
  PrimitiveType,
  Data,
  BytesType,
  parseType,
} from 'cashc';
import { TypeError } from './Errors';
import { HashType } from './interfaces';

export type Parameter = number | boolean | string | Buffer | Sig;

export class Sig {
  constructor(
    public keypair: ECPair,
    public hashtype: HashType = HashType.SIGHASH_ALL,
  ) {}
}

export function encodeParameter(parameter: Parameter, typeStr: string): Buffer | Sig {
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
    if (type === PrimitiveType.SIG && parameter instanceof Sig) return parameter;
    // Convert string to Buffer
    if (typeof parameter === 'string') {
      if (parameter.startsWith('0x')) {
        parameter = parameter.slice(2);
      }
      parameter = Buffer.from(parameter, 'hex');
    }

    if (!(parameter instanceof Buffer)) throw Error(); // Shouldn't happen

    // Bounded bytes types require a correctly sized parameter
    if (type instanceof BytesType && type.bound && parameter.byteLength !== type.bound) {
      throw new TypeError(`bytes${parameter.byteLength}`, type);
    }

    return parameter;
  }
}
