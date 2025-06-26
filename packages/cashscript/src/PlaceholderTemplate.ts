import { cashAddressToLockingBytecode } from '@bitauth/libauth';
import { Unlocker } from './interfaces.js';
import SignatureTemplate from './SignatureTemplate.js';

export default class PlaceholderTemplate {
  public privateKey: Uint8Array;
  private lockingBytecode: Uint8Array;

  constructor(
    address: string,
  ) {
    const decodeAddressResult = cashAddressToLockingBytecode(address);
    if (typeof decodeAddressResult === 'string') {
      throw new Error(`Invalid address: ${decodeAddressResult}`);
    }
    this.lockingBytecode = decodeAddressResult.bytecode;
  }

  // TODO: should the arguments 'generateSignature' match?
  // do the other methods (getHashType, getSignatureAlgorithm) need to be implemented?

  // Currently in the walletconnect spec, only schnorr (65-byte) signatures are supported
  generateSignature(): Uint8Array {
    return Uint8Array.from(Array(65));
  }

  getPublicKey(): Uint8Array {
    return Uint8Array.from(Array(33));
  }

  unlockP2PKH(): Unlocker {
    return {
      generateLockingBytecode: () => this.lockingBytecode,
      generateUnlockingBytecode: () => Uint8Array.from(Array(0)),
    };
  }
}

export const placeholderSignature = (): Uint8Array => Uint8Array.from(Array(65));
export const placeholderPublicKey = (): Uint8Array => Uint8Array.from(Array(33));

export const placeholderP2PKHUnlocker = (userAddress: string): Unlocker => {
  const decodeAddressResult = cashAddressToLockingBytecode(userAddress);
  if (typeof decodeAddressResult === 'string') {
    throw new Error(`Invalid address: ${decodeAddressResult}`);
  }

  const lockingBytecode = decodeAddressResult.bytecode;

  return {
    generateLockingBytecode: () => lockingBytecode,
    generateUnlockingBytecode: () => Uint8Array.from(Array(0)),
  };
};
