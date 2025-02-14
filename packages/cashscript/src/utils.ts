import {
  cashAddressToLockingBytecode,
  decodeCashAddress,
  addressContentsToLockingBytecode,
  lockingBytecodeToCashAddress,
  binToHex,
  Transaction,
  generateSigningSerializationBch,
  utf8ToBin,
  hexToBin,
  flattenBinArray,
  LockingBytecodeType,
  encodeTransactionOutput,
  isHex,
  bigIntToCompactUint,
  NonFungibleTokenCapability,
  bigIntToVmNumber,
} from '@bitauth/libauth';
import {
  encodeInt,
  hash160,
  hash256,
  sha256,
  Op,
  Script,
  scriptToBytecode,
} from '@cashscript/utils';
import {
  Utxo,
  Output,
  Network,
  LibauthOutput,
  TokenDetails,
  AddressType,
} from './interfaces.js';
import { VERSION_SIZE, LOCKTIME_SIZE } from './constants.js';
import {
  OutputSatoshisTooSmallError,
  OutputTokenAmountTooSmallError,
  TokensToNonTokenAddressError,
  UndefinedInputError,
} from './Errors.js';

export { snakeCase } from 'change-case';

// ////////// PARAMETER VALIDATION ////////////////////////////////////////////
export function validateInput(utxo: Utxo): void {
  if (!utxo) {
    throw new UndefinedInputError();
  }
}

export function validateOutput(output: Output): void {
  if (typeof output.to !== 'string') return;

  const minimumAmount = calculateDust(output);
  if (output.amount < minimumAmount) {
    throw new OutputSatoshisTooSmallError(output.amount, BigInt(minimumAmount));
  }

  if (output.token) {
    if (!isTokenAddress(output.to)) {
      throw new TokensToNonTokenAddressError(output.to);
    }

    if (output.token.amount < 0n) {
      throw new OutputTokenAmountTooSmallError(output.token.amount);
    }
  }
}

export function calculateDust(output: Output): number {
  const outputSize = getOutputSize(output);
  // Formula used to calculate the minimum allowed output
  const dustAmount = 444 + outputSize * 3;
  return dustAmount;
}

export function getOutputSize(output: Output): number {
  const encodedOutput = encodeOutput(output);
  return encodedOutput.byteLength;
}

export function encodeOutput(output: Output): Uint8Array {
  return encodeTransactionOutput(cashScriptOutputToLibauthOutput(output));
}

export function cashScriptOutputToLibauthOutput(output: Output): LibauthOutput {
  if (output.token) {
    if (typeof output.token.category !== 'string' || !isHex(output.token.category)) {
      throw new Error(`Provided token category ${output.token?.category} is not a hex string`);
    }

    if (output.token.nft && (typeof output.token.nft.commitment !== 'string' || !isHex(output.token.nft.commitment))) {
      throw new Error(`Provided token commitment ${output.token.nft?.commitment} is not a hex string`);
    }
  }

  return {
    lockingBytecode: typeof output.to === 'string' ? addressToLockScript(output.to) : output.to,
    valueSatoshis: output.amount,
    token: output.token && {
      ...output.token,
      category: hexToBin(output.token.category),
      nft: output.token.nft && {
        ...output.token.nft,
        commitment: hexToBin(output.token.nft.commitment),
      },
    },
  };
}

export function libauthOutputToCashScriptOutput(output: LibauthOutput): Output {
  return {
    to: output.lockingBytecode,
    amount: output.valueSatoshis,
    token: output.token && {
      ...output.token,
      category: binToHex(output.token.category),
      nft: output.token.nft && {
        ...output.token.nft,
        commitment: binToHex(output.token.nft.commitment),
      },
    },
  };
}

function isTokenAddress(address: string): boolean {
  const result = decodeCashAddress(address);
  if (typeof result === 'string') throw new Error(result);
  const supportsTokens = (result.type === 'p2pkhWithTokens' || result.type === 'p2shWithTokens');
  return supportsTokens;
}

// ////////// SIZE CALCULATIONS ///////////////////////////////////////////////
export function getInputSize(inputScript: Uint8Array): number {
  const scriptSize = inputScript.byteLength;
  const varIntSize = scriptSize > 252 ? 3 : 1;
  return 32 + 4 + varIntSize + scriptSize + 4;
}

export function getTxSizeWithoutInputs(outputs: Output[]): number {
  // Transaction format:
  // Version (4 Bytes)
  // TxIn Count (1 ~ 9B)
  // For each TxIn:
  //   Outpoint (36B)
  //   Script Length (1 ~ 9B)
  //   ScriptSig(?)
  //   Sequence (4B)
  // TxOut Count (1 ~ 9B)
  // For each TxOut:
  //   Value (8B)
  //   Script Length(1 ~ 9B)*
  //   Script (?)*
  // LockTime (4B)

  let size = VERSION_SIZE + LOCKTIME_SIZE;
  size += outputs.reduce((acc, output) => acc + getOutputSize(output), 0);
  // Add tx-out count (accounting for a potential change output)
  size += bigIntToCompactUint(BigInt(outputs.length + 1)).byteLength;

  return size;
}

// ////////// BUILD OBJECTS ///////////////////////////////////////////////////
export function createInputScript(
  redeemScript: Script,
  encodedArgs: Uint8Array[],
  selector?: number,
): Uint8Array {
  // Create unlock script / redeemScriptSig (add potential selector)
  const unlockScript = [...encodedArgs].reverse();
  if (selector !== undefined) unlockScript.push(encodeInt(BigInt(selector)));

  // Create input script and compile it to bytecode
  const inputScript = [...unlockScript, scriptToBytecode(redeemScript)];
  return scriptToBytecode(inputScript);
}

export function createOpReturnOutput(
  opReturnData: string[],
): Output {
  const script = [
    Op.OP_RETURN,
    ...opReturnData.map((output: string) => toBin(output)),
  ];

  return { to: encodeNullDataScript(script), amount: 0n };
}

function toBin(output: string): Uint8Array {
  const data = output.replace(/^0x/, '');
  const encode = data === output ? utf8ToBin : hexToBin;
  return encode(data);
}

export function createSighashPreimage(
  transaction: Transaction,
  sourceOutputs: LibauthOutput[],
  inputIndex: number,
  coveredBytecode: Uint8Array,
  hashtype: number,
): Uint8Array {
  const context = { inputIndex, sourceOutputs, transaction };
  const signingSerializationType = new Uint8Array([hashtype]);

  const sighashPreimage = generateSigningSerializationBch(context, { coveredBytecode, signingSerializationType });

  return sighashPreimage;
}

export function toRegExp(reasons: string[]): RegExp {
  return new RegExp(reasons.join('|').replace(/\(/g, '\\(').replace(/\)/g, '\\)'));
}

export function scriptToAddress(
  script: Script, network: string, addressType: AddressType, tokenSupport: boolean,
): string {
  const bytecode = scriptToLockingBytecode(script, addressType);
  const prefix = getNetworkPrefix(network);

  const result = lockingBytecodeToCashAddress({ bytecode, prefix, tokenSupport });
  if (typeof result === 'string') throw new Error(result);

  return result.address;
}

export function scriptToLockingBytecode(script: Script, addressType: AddressType): Uint8Array {
  const scriptBytecode = scriptToBytecode(script);
  const scriptHash = (addressType === 'p2sh20') ? hash160(scriptBytecode) : hash256(scriptBytecode);
  const addressContents = { payload: scriptHash, type: LockingBytecodeType[addressType] };
  const lockingBytecode = addressContentsToLockingBytecode(addressContents);
  return lockingBytecode;
}

export function publicKeyToP2PKHLockingBytecode(publicKey: Uint8Array): Uint8Array {
  const pubkeyHash = hash160(publicKey);
  const addressContents = { payload: pubkeyHash, type: LockingBytecodeType.p2pkh };
  const lockingBytecode = addressContentsToLockingBytecode(addressContents);
  return lockingBytecode;
}

export function utxoComparator(a: Utxo, b: Utxo): number {
  if (a.satoshis > b.satoshis) return 1;
  if (a.satoshis < b.satoshis) return -1;
  return 0;
}

export function utxoTokenComparator(a: Utxo, b: Utxo): number {
  if (!a.token || !b.token) throw new Error('UTXO does not have token data');
  if (!a.token.category !== !b.token.category) throw new Error('UTXO token categories do not match');
  if (a.token.amount > b.token.amount) return 1;
  if (a.token.amount < b.token.amount) return -1;
  return 0;
}

/**
* Helper function to convert an address to a locking script
*
* @param address   Address to convert to locking script
*
* @returns a locking script corresponding to the passed address
*/
export function addressToLockScript(address: string): Uint8Array {
  const result = cashAddressToLockingBytecode(address);
  if (typeof result === 'string') throw new Error(result);

  return result.bytecode;
}

export function getNetworkPrefix(network: string): 'bitcoincash' | 'bchtest' | 'bchreg' {
  switch (network) {
    case Network.MAINNET:
      return 'bitcoincash';
    case Network.TESTNET4:
    case Network.TESTNET3:
    case Network.CHIPNET:
    case Network.MOCKNET:
      return 'bchtest';
    case Network.REGTEST:
      return 'bchreg';
    default:
      return 'bitcoincash';
  }
}

// ////////////////////////////////////////////////////////////////////////////
// For encoding OP_RETURN data (doesn't require BIP62.3 / MINIMALDATA)
function encodeNullDataScript(chunks: (number | Uint8Array)[]): Uint8Array {
  return flattenBinArray(
    chunks.map((chunk) => {
      if (typeof chunk === 'number') {
        return new Uint8Array([chunk]);
      }

      const pushdataOpcode = getPushDataOpcode(chunk);
      return new Uint8Array([...pushdataOpcode, ...chunk]);
    }),
  );
}

function getPushDataOpcode(data: Uint8Array): Uint8Array {
  const { byteLength } = data;

  if (byteLength === 0) return Uint8Array.from([0x4c, 0x00]);
  if (byteLength < 76) return Uint8Array.from([byteLength]);
  if (byteLength < 256) return Uint8Array.from([0x4c, byteLength]);
  throw new Error('Pushdata too large');
}

const randomInt = (): bigint => BigInt(Math.floor(Math.random() * 10000));

export const randomUtxo = (defaults?: Partial<Utxo>): Utxo => ({
  ...{
    txid: binToHex(sha256(bigIntToVmNumber(randomInt()))),
    vout: Math.floor(Math.random() * 10),
    satoshis: 100_000n + randomInt(),
  },
  ...defaults,
});

export const randomToken = (defaults?: Partial<TokenDetails>): TokenDetails => ({
  ...{
    category: binToHex(sha256(bigIntToVmNumber(randomInt()))),
    amount: 100_000n + randomInt(),
  },
  ...defaults,
});

export const randomNFT = (defaults?: Partial<TokenDetails>): TokenDetails => ({
  ...{
    category: binToHex(sha256(bigIntToVmNumber(randomInt()))),
    amount: 0n,
    nft: {
      commitment: binToHex(sha256(bigIntToVmNumber(randomInt()))).slice(0, 8),
      capability: NonFungibleTokenCapability.none,
    },
  },
  ...defaults,
});

// https://stackoverflow.com/questions/40929260/find-last-index-of-element-inside-array-by-certain-condition
export function findLastIndex<T>(array: Array<T>, predicate: (value: T, index: number, obj: T[]) => boolean): number {
  let l = array.length;
  while (l--) {
    if (predicate(array[l], l, array)) return l;
  }
  return -1;
}

// TODO: Somehow, this turns P2PKHLock into p2pkh_lock, but P2PKH_Lock into p2_pkh_lock
// export const snakeCase = (str: string): string => (
//   str
//   && str
//     .match(
//       /([A-Z]+\d*[A-Z]*(?=[A-Z][a-z])|[A-Z]?[a-z]+\d*[a-z]+|[A-Z]?[a-z]+\d*|[A-Z]+\d*|\d+)/g,
//     )!
//     .map((s) => s.toLowerCase())
//     .join('_')
// );

export const titleCase = (str: string): string => {
  if (!str) return '';
  return str
    .match(
      /[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g,
    )!
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase())
    .join(' ');
};

// JSON.stringify version that can serialize otherwise unsupported types (bigint and Uint8Array)
export const extendedStringify = (obj: any, spaces?: number): string => JSON.stringify(
  obj,
  (_, v) => {
    if (typeof v === 'bigint') {
      return `${v.toString()}`;
    }
    if (v instanceof Uint8Array) {
      return `${binToHex(v)}`;
    }
    return v;
  },
  spaces,
);

export const zip = <T, U>(a: readonly T[], b: readonly U[]): [T, U][] => (
  Array.from(Array(Math.max(b.length, a.length)), (_, i) => [a[i], b[i]])
);

export const isFungibleTokenUtxo = (utxo: Utxo): boolean => (
  utxo.token !== undefined && utxo.token.amount > 0n && utxo.token.nft === undefined
);

export const isNonTokenUtxo = (utxo: Utxo): boolean => utxo.token === undefined;
