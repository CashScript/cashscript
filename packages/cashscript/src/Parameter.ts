import { ECPair } from 'bitcoincashjs-lib';
import { PrimitiveType, Data } from 'cashc';
import { TypeError } from './Errors';

export type Parameter = number | boolean | string | Buffer | Sig;

export class Sig {
  constructor(public keypair: ECPair, public hashtype: number) {}
}

export function typecheckParameter(parameter: Parameter, type: PrimitiveType): void {
  switch (type) {
    case PrimitiveType.BOOL:
      if (typeof parameter === 'boolean') return;
      throw new TypeError(typeof parameter, type);
    case PrimitiveType.INT:
      if (typeof parameter === 'number') return;
      throw new TypeError(typeof parameter, type);
    case PrimitiveType.STRING:
      if (typeof parameter === 'string') return;
      throw new TypeError(typeof parameter, type);
    case PrimitiveType.SIG:
      if (typeof parameter === 'string') return;
      if (parameter instanceof Buffer) return;
      if (parameter instanceof Sig) return;
      throw new TypeError(typeof parameter, type);
    default:
      if (typeof parameter === 'string') return;
      if (parameter instanceof Buffer) return;
      throw new TypeError(typeof parameter, type);
  }
}

export function encodeParameter(parameter: Parameter, type: PrimitiveType): Buffer {
  switch (type) {
    case PrimitiveType.BOOL:
      if (typeof parameter !== 'boolean') {
        throw new TypeError(typeof parameter, type);
      }
      return Data.encodeBool(parameter);
    case PrimitiveType.INT:
      if (typeof parameter !== 'number') {
        throw new TypeError(typeof parameter, type);
      }
      return Data.encodeInt(parameter);
    case PrimitiveType.STRING:
      if (typeof parameter !== 'string') {
        throw new TypeError(typeof parameter, type);
      }
      return Data.encodeString(parameter);
    default:
      if (typeof parameter === 'string') {
        if (parameter.startsWith('0x')) {
          parameter = parameter.slice(2);
        }

        return Buffer.from(parameter, 'hex');
      }
      if (!(parameter instanceof Buffer)) throw Error();
      return parameter;
  }
}
