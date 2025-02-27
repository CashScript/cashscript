import { decodePrivateKeyWif, secp256k1, SigningSerializationFlag } from '@bitauth/libauth';
import { hash256, scriptToBytecode } from '@cashscript/utils';
import {
  Unlocker,
  GenerateUnlockingBytecodeOptions,
  HashType,
  SignatureAlgorithm,
} from './interfaces.js';
import { createSighashPreimage, publicKeyToP2PKHLockingBytecode } from './utils.js';

export default class SignatureTemplate {
  public privateKey: Uint8Array;

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

  // TODO: Allow signing of non-transaction messages (i.e. don't add the hashtype)
  generateSignature(payload: Uint8Array, bchForkId?: boolean): Uint8Array {
    const signature = this.signatureAlgorithm === SignatureAlgorithm.SCHNORR
      ? secp256k1.signMessageHashSchnorr(this.privateKey, payload) as Uint8Array
      : secp256k1.signMessageHashDER(this.privateKey, payload) as Uint8Array;

    return Uint8Array.from([...signature, this.getHashType(bchForkId)]);
  }

  getHashType(bchForkId: boolean = true): number {
    return bchForkId ? (this.hashtype | SigningSerializationFlag.forkId) : this.hashtype;
  }

  getSignatureAlgorithm(): SignatureAlgorithm {
    return this.signatureAlgorithm;
  }

  getPublicKey(): Uint8Array {
    return secp256k1.derivePublicKeyCompressed(this.privateKey) as Uint8Array;
  }

  unlockP2PKH(): Unlocker {
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
