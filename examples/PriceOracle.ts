import { padMinimallyEncodedVmNumber, flattenBinArray } from '@bitauth/libauth';
import { encodeInt, sha256 } from '@cashscript/utils';
import { SignatureAlgorithm, SignatureTemplate } from 'cashscript';

export class PriceOracle {
  constructor(public privateKey: Uint8Array) { }

  // Encode a blockHeight and bchUsdPrice into a byte sequence of 8 bytes (4 bytes per value)
  createMessage(blockHeight: bigint, bchUsdPrice: bigint): Uint8Array {
    const encodedBlockHeight = padMinimallyEncodedVmNumber(encodeInt(blockHeight), 4);
    const encodedBchUsdPrice = padMinimallyEncodedVmNumber(encodeInt(bchUsdPrice), 4);

    return flattenBinArray([encodedBlockHeight, encodedBchUsdPrice]);
  }

  signMessage(message: Uint8Array, signatureAlgorithm: SignatureAlgorithm = SignatureAlgorithm.SCHNORR): Uint8Array {
    const signatureTemplate = new SignatureTemplate(this.privateKey, undefined, signatureAlgorithm);
    return signatureTemplate.signMessageHash(sha256(message));
  }
}
