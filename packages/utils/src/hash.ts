import { sha256 as sha256Lib, ripemd160 as ripemd160Lib, sha512 as sha512Lib } from '@bitauth/libauth';

export function sha512(payload: Uint8Array): Uint8Array {
  return sha512Lib.hash(payload);
}

export function sha256(payload: Uint8Array): Uint8Array {
  return sha256Lib.hash(payload);
}

export function ripemd160(payload: Uint8Array): Uint8Array {
  return ripemd160Lib.hash(payload);
}

export function hash160(payload: Uint8Array): Uint8Array {
  return ripemd160(sha256(payload));
}

export function hash256(payload: Uint8Array): Uint8Array {
  return sha256(sha256(payload));
}
