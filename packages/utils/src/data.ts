import {
  bigIntToVmNumber,
  utf8ToBin,
  binToUtf8,
  vmNumberToBigInt,
  isVmNumberError,
} from '@bitauth/libauth';

export function encodeBool(bool: boolean): Uint8Array {
  return bool ? encodeInt(1n) : encodeInt(0n);
}

export function decodeBool(encodedBool: Uint8Array): boolean {
  // Any encoding of 0 is false, else true
  for (let i = 0; i < encodedBool.byteLength; i += 1) {
    if (encodedBool[i] !== 0) {
      // Can be negative zero
      if (i === encodedBool.byteLength - 1 && encodedBool[i] === 0x80) return false;
      return true;
    }
  }
  return false;
}

export function encodeInt(int: bigint): Uint8Array {
  return bigIntToVmNumber(int);
}

export function decodeInt(encodedInt: Uint8Array): bigint {
  const result = vmNumberToBigInt(encodedInt);

  if (isVmNumberError(result)) {
    throw new Error(result);
  }

  return result;
}

export function encodeString(str: string): Uint8Array {
  return utf8ToBin(str);
}

export function decodeString(encodedString: Uint8Array): string {
  return binToUtf8(encodedString);
}

export function placeholder(size: number): Uint8Array {
  return new Uint8Array(size).fill(0);
}
