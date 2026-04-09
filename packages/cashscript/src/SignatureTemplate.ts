import { decodePrivateKeyWif, hexToBin, isHex, secp256k1, SigningSerializationFlag } from '@bitauth/libauth';
import { hash256, scriptToBytecode } from '@cashscript/utils';
import {
  GenerateUnlockingBytecodeOptions,
  HashType,
  SignatureAlgorithm,
  P2PKHUnlocker,
} from './interfaces.js';
import { createSighashPreimage, publicKeyToP2PKHLockingBytecode } from './utils.js';

/**
 * A signature template used to sign CashScript transactions. Wraps a private key together with
 * the desired `HashType` and `SignatureAlgorithm`, and is consumed by the `TransactionBuilder`
 * whenever a `sig` argument is required or when unlocking a P2PKH input.
 */
export default class SignatureTemplate {
  /** The raw private key bytes used for signing. */
  public privateKey: Uint8Array;

  /**
   * Create a new SignatureTemplate.
   *
   * @param signer - A 32-byte private key (Uint8Array), a WIF or hex-encoded private key string,
   *   or any object exposing a `toWIF()` method (e.g. bitcore-lib or bitcoincashjs `ECPair`).
   * @param hashtype - Sighash flags to use when signing. Defaults to `SIGHASH_ALL | SIGHASH_UTXOS`.
   * @param signatureAlgorithm - The signature algorithm to use. Defaults to
   *   `SignatureAlgorithm.SCHNORR`.
   */
  constructor(
    signer: Keypair | Uint8Array | string,
    private hashtype: HashType = HashType.SIGHASH_ALL | HashType.SIGHASH_UTXOS,
    private signatureAlgorithm: SignatureAlgorithm = SignatureAlgorithm.SCHNORR,
  ) {
    if (isKeypair(signer)) {
      const wif = signer.toWIF();
      this.privateKey = decodeWif(wif);
    } else if (typeof signer === 'string') {
      const maybeHexString = signer.startsWith('0x') ? signer.slice(2) : signer;
      if (isHex(maybeHexString)) {
        this.privateKey = hexToBin(maybeHexString);
      } else {
        this.privateKey = decodeWif(maybeHexString);
      }
    } else {
      this.privateKey = signer;
    }
  }

  /**
   * Sign the provided sighash payload and return the signature concatenated with the hashtype
   * byte, ready to be used as a transaction signature.
   *
   * @param payload - The 32-byte sighash to sign.
   * @param bchForkId - Whether to include the BCH fork id flag in the appended hashtype byte.
   *   Defaults to `true`.
   * @returns The signature bytes followed by the hashtype byte.
   */
  generateSignature(payload: Uint8Array, bchForkId?: boolean): Uint8Array {
    const signature = this.signMessageHash(payload);
    return Uint8Array.from([...signature, this.getHashType(bchForkId)]);
  }

  /**
   * Sign a raw 32-byte message hash using the template's private key and signature algorithm.
   *
   * @param payload - The 32-byte hash to sign.
   * @returns The raw signature bytes (without an appended hashtype byte).
   */
  signMessageHash(payload: Uint8Array): Uint8Array {
    const signature = this.signatureAlgorithm === SignatureAlgorithm.SCHNORR
      ? secp256k1.signMessageHashSchnorr(this.privateKey, payload) as Uint8Array
      : secp256k1.signMessageHashDER(this.privateKey, payload) as Uint8Array;

    return signature;
  }

  /**
   * Get the sighash flags used by this template.
   *
   * @param bchForkId - Whether to OR in the BCH fork id flag. Defaults to `true`.
   * @returns The combined hashtype byte.
   */
  getHashType(bchForkId: boolean = true): number {
    return bchForkId ? (this.hashtype | SigningSerializationFlag.forkId) : this.hashtype;
  }

  /**
   * @returns The signature algorithm (ECDSA or Schnorr) used by this template.
   */
  getSignatureAlgorithm(): SignatureAlgorithm {
    return this.signatureAlgorithm;
  }

  /**
   * Derive the compressed public key that corresponds to the template's private key.
   *
   * @returns The 33-byte compressed public key.
   */
  getPublicKey(): Uint8Array {
    return secp256k1.derivePublicKeyCompressed(this.privateKey) as Uint8Array;
  }

  /**
   * Build a P2PKH `Unlocker` for the address derived from this template's private key. The
   * returned unlocker can be passed directly to `TransactionBuilder.addInput`.
   *
   * @returns An unlocker that signs the corresponding P2PKH UTXO.
   */
  unlockP2PKH(): P2PKHUnlocker {
    const publicKey = this.getPublicKey();
    const prevOutScript = publicKeyToP2PKHLockingBytecode(publicKey);
    const hashtype = this.getHashType();

    return {
      generateLockingBytecode: () => prevOutScript,
      generateUnlockingBytecode: ({ transaction, sourceOutputs, inputIndex }: GenerateUnlockingBytecodeOptions) => {
        const preimage = createSighashPreimage(transaction, sourceOutputs, inputIndex, prevOutScript, hashtype);
        const sighash = hash256(preimage);
        const signature = this.generateSignature(sighash);
        const unlockingBytecode = scriptToBytecode([signature, publicKey]);
        return unlockingBytecode;
      },
      template: this,
    };
  }
}

// Works for both bitcoincash.js/bchjs ECPair and bitcore-lib-cash PrivateKey
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
