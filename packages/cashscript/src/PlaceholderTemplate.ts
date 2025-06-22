import { cashAddressToLockingBytecode } from '@bitauth/libauth';
import { P2PKHUnlocker } from './interfaces.js';
import SignatureTemplate from './SignatureTemplate.js';

export default class PlaceholderTemplate {
  public privateKey: Uint8Array;
  private lockingBytecode: Uint8Array;

  constructor(
    address?: string,
  ) {
    if (address) {
      const decodeAddressResult = cashAddressToLockingBytecode(address);
      if (typeof decodeAddressResult === 'string') {
        throw new Error(`Invalid address: ${decodeAddressResult}`);
      }
      this.lockingBytecode = decodeAddressResult.bytecode;
    }
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

  unlockP2PKH(): P2PKHUnlocker {
    const lockingBytecode = this.lockingBytecode ?? Uint8Array.from(Array(0));
    return {
      generateLockingBytecode: () => lockingBytecode,
      generateUnlockingBytecode: () => Uint8Array.from(Array(0)),
      // TODO: pass 'this' when the types allows for it
      template: new SignatureTemplate(Uint8Array.from(Array(0))),
    };
  }
}