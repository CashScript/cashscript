import { padMinimallyEncodedVmNumber, flattenBinArray, secp256k1 } from '@bitauth/libauth';
import { encodeInt, sha256 } from '@cashscript/utils';

export class PriceOracle {
  constructor(public privateKey: Uint8Array) {}

  // Encode a blockHeight and bchUsdPrice into a byte sequence of 8 bytes (4 bytes per value)
  createMessage(blockHeight: bigint, bchUsdPrice: bigint): Uint8Array {
    const encodedBlockHeight = padMinimallyEncodedVmNumber(encodeInt(blockHeight), 4);
    const encodedBchUsdPrice = padMinimallyEncodedVmNumber(encodeInt(bchUsdPrice), 4);

    return flattenBinArray([encodedBlockHeight, encodedBchUsdPrice]);
  }

  signMessage(message: Uint8Array): Uint8Array {
    const signature = secp256k1.signMessageHashSchnorr(this.privateKey, sha256(message));
    if (typeof signature === 'string') throw new Error();
    return signature;
  }
}
