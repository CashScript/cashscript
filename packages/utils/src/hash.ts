// TODO: Replace with libauth
import hash from 'hash.js';

export function sha512(payload: Uint8Array): Uint8Array {
  return Uint8Array.from(hash.sha512().update(payload).digest());
}

export function sha256(payload: Uint8Array): Uint8Array {
  return Uint8Array.from(hash.sha256().update(payload).digest());
}

export function ripemd160(payload: Uint8Array): Uint8Array {
  return Uint8Array.from(hash.ripemd160().update(payload).digest());
}

export function hash160(payload: Uint8Array): Uint8Array {
  return ripemd160(sha256(payload));
}

export function hash256(payload: Uint8Array): Uint8Array {
  return sha256(sha256(payload));
}
