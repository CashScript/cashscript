import { decodePrivateKeyWif, secp256k1, SigningSerializationFlag } from '@bitauth/libauth';
import { HashType, SignatureAlgorithm } from './interfaces.js';

export default class SignatureTemplate {
  private privateKey: Uint8Array;

  constructor(
    signer: Keypair | Uint8Array | string,
    private hashtype: HashType = HashType.SIGHASH_ALL | HashType.SIGHASH_UTXOS,
    private signatureAlgorithm: SignatureAlgorithm = SignatureAlgorithm.SCHNORR,
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

  generateSignature(payload: Uint8Array, bchForkId?: boolean): Uint8Array {
    const signature = this.signatureAlgorithm === SignatureAlgorithm.SCHNORR
      ? secp256k1.signMessageHashSchnorr(this.privateKey, payload) as Uint8Array
      : secp256k1.signMessageHashDER(this.privateKey, payload) as Uint8Array;

    return Uint8Array.from([...signature, this.getHashType(bchForkId)]);
  }

  getHashType(bchForkId: boolean = true): number {
    return bchForkId ? (this.hashtype | SigningSerializationFlag.forkId) : this.hashtype;
  }

  getPublicKey(): Uint8Array {
    return secp256k1.derivePublicKeyCompressed(this.privateKey) as Uint8Array;
  }
}

// Works for both BITBOX/bitcoincash.js ECPair and bitcore-lib-cash PrivateKey
interface Keypair {
  toWIF(): string;
}

function isKeypair(obj: any): obj is Keypair {
  return typeof obj.toWIF === 'function';
}

function decodeWif(wif: string): Uint8Array {
  const result = decodePrivateKeyWif(wif);

  if (typeof result === 'string') {
    throw new Error(result);
  }

  return result.privateKey;
}
