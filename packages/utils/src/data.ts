import {
  bigIntToScriptNumber,
  parseBytesAsScriptNumber,
  isScriptNumberError,
  utf8ToBin,
  binToUtf8,
} from '@bitauth/libauth';

export function encodeBool(bool: boolean): Uint8Array {
  return bool ? encodeInt(1) : encodeInt(0);
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

export function encodeInt(int: number | bigint): Uint8Array {
  return bigIntToScriptNumber(BigInt(int));
}

export function decodeInt(encodedInt: Uint8Array, maxLength?: number): number {
  const options = { maximumScriptNumberByteLength: maxLength };
  const result = parseBytesAsScriptNumber(encodedInt, options);

  if (isScriptNumberError(result)) {
    throw new Error(result);
  }

  return Number(result);
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
