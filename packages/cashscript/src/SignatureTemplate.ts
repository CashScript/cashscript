import { decodePrivateKeyWif, Secp256k1, SigningSerializationFlag } from '@bitauth/libauth';
import { HashType } from './interfaces';
import { sha256 } from './util';

export default class SignatureTemplate {
  private privateKey: Uint8Array;

  constructor(
    signer: Keypair | Uint8Array | string,
    private hashtype: HashType = HashType.SIGHASH_ALL,
  ) {
    if (isKeypair(signer)) {
      const wif = signer.toWIF();
      this.privateKey = decodeWif(wif);
    } else if (typeof signer === 'string') {
      this.privateKey = decodeWif(signer);
    } else {
      this.privateKey = signer;
    }
  }

  generateSignature(payload: Uint8Array, secp256k1: Secp256k1, bchForkId?: boolean): Uint8Array {
    const signature = secp256k1.signMessageHashSchnorr(this.privateKey, payload);

    return Uint8Array.from([...signature, this.getHashType(bchForkId)]);
  }

  getHashType(bchForkId: boolean = true): number {
    return bchForkId ? (this.hashtype | SigningSerializationFlag.forkId) : this.hashtype;
  }

  getPublicKey(secp256k1: Secp256k1): Uint8Array {
    return secp256k1.derivePublicKeyCompressed(this.privateKey);
  }
}

// Works for both BITBOX/bitcoincashjs ECPair and bitcore-lib-cash PrivateKey
interface Keypair {
  toWIF(): string;
}

function isKeypair(obj: any): obj is Keypair {
  return typeof obj.toWIF === 'function';
}

function decodeWif(wif: string): Uint8Array {
  const result = decodePrivateKeyWif({ hash: input => sha256(input) }, wif);

  if (typeof result === 'string') {
    throw new Error(result);
  }

  return result.privateKey;
}
