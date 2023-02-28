import {
  cashAddressToLockingBytecode,
  decodeCashAddressFormat,
  decodeCashAddress,
  CashAddressVersionByte,
  addressContentsToLockingBytecode,
  lockingBytecodeToCashAddress,
  binToHex,
  Transaction,
  generateSigningSerializationBCH,
  utf8ToBin,
  hexToBin,
  flattenBinArray,
  LockingBytecodeType,
} from '@bitauth/libauth';
import {
  encodeInt,
  hash160,
  hash256,
  Op,
  Script,
  scriptToBytecode,
} from '@cashscript/utils';
import {
  Utxo,
  Output,
  Network,
  Recipient,
} from './interfaces.js';
import {
  P2PKH_OUTPUT_SIZE,
  P2SH20_OUTPUT_SIZE,
  P2SH32_OUTPUT_SIZE,
  VERSION_SIZE,
  LOCKTIME_SIZE,
} from './constants.js';
import {
  OutputSatoshisTooSmallError,
  TokensToNonTokenAddressError,
  Reason,
  FailedTransactionError,
  FailedRequireError,
  FailedTimeCheckError,
  FailedSigCheckError,
} from './Errors.js';

// ////////// PARAMETER VALIDATION ////////////////////////////////////////////
export function validateRecipient(recipient: Recipient): void {
  const minimumAmount = calculateDust(recipient);
  if (recipient.amount < minimumAmount) {
    throw new OutputSatoshisTooSmallError(recipient.amount, BigInt(minimumAmount));
  }

  if (recipient.token) {
    if (!isTokenAddress(recipient.to)) {
      throw new TokensToNonTokenAddressError(recipient.to);
    }
  }
}

function calculateDust(recipient: Recipient): number {
  const outputSize = getOutputSize(recipient);
  // Formala used to calculate the minimum allowed output
  const dustAmount = 444 + outputSize * 3;
  return dustAmount;
}

// TODO: Account for token data in output
function getOutputSize(recipient: Recipient): number {
  const result = decodeCashAddressFormat(recipient.to);
  if (typeof result === 'string') throw new Error(result);

  const outputSizes: Record<number, number> = {
    [CashAddressVersionByte.p2pkh]: P2PKH_OUTPUT_SIZE,
    [CashAddressVersionByte.p2pkhWithTokens]: P2PKH_OUTPUT_SIZE,
    [CashAddressVersionByte.p2sh20]: P2SH20_OUTPUT_SIZE,
    [CashAddressVersionByte.p2sh20WithTokens]: P2SH20_OUTPUT_SIZE,
    [CashAddressVersionByte.p2sh32]: P2SH32_OUTPUT_SIZE,
    [CashAddressVersionByte.p2sh32WithTokens]: P2SH32_OUTPUT_SIZE,
  };

  return outputSizes[result.version];
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

export function getPreimageSize(script: Uint8Array): number {
  const scriptSize = script.byteLength;
  const varIntSize = scriptSize > 252 ? 3 : 1;
  return 4 + 32 + 32 + 36 + varIntSize + scriptSize + 8 + 4 + 32 + 4 + 4;
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
  size += outputs.reduce((acc, output) => {
    if (typeof output.to === 'string') {
      const outputSize = getOutputSize(output as Recipient);
      return acc + outputSize;
    }

    // Size of an OP_RETURN output = byteLength + 8 (amount) + 2 (scriptSize)
    return acc + output.to.byteLength + 8 + 2;
  }, 0);
  // Add tx-out count (accounting for a potential change output)
  size += encodeInt(BigInt(outputs.length + 1)).byteLength;

  return size;
}

// ////////// BUILD OBJECTS ///////////////////////////////////////////////////
export function createInputScript(
  redeemScript: Script,
  encodedArgs: Uint8Array[],
  selector?: number,
  preimage?: Uint8Array,
): Uint8Array {
  // Create unlock script / redeemScriptSig (add potential preimage and selector)
  const unlockScript = encodedArgs.reverse();
  if (preimage !== undefined) unlockScript.push(preimage);
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
  input: Utxo,
  inputIndex: number,
  coveredBytecode: Uint8Array,
  hashtype: number,
): Uint8Array {
  const sourceOutputs = [];
  sourceOutputs[inputIndex] = { valueSatoshis: input.satoshis, lockingBytecode: Uint8Array.of() };
  const context = { inputIndex, sourceOutputs, transaction };
  const signingSerializationType = new Uint8Array([hashtype]);

  const sighashPreimage = generateSigningSerializationBCH(context, { coveredBytecode, signingSerializationType });

  return sighashPreimage;
}

export function buildError(reason: string, meepStr: string): FailedTransactionError {
  const require = [
    Reason.EVAL_FALSE, Reason.VERIFY, Reason.EQUALVERIFY, Reason.CHECKMULTISIGVERIFY,
    Reason.CHECKSIGVERIFY, Reason.CHECKDATASIGVERIFY, Reason.NUMEQUALVERIFY,
  ];
  const timeCheck = [Reason.NEGATIVE_LOCKTIME, Reason.UNSATISFIED_LOCKTIME];
  const sigCheck = [
    Reason.SIG_COUNT, Reason.PUBKEY_COUNT, Reason.SIG_HASHTYPE, Reason.SIG_DER,
    Reason.SIG_HIGH_S, Reason.SIG_NULLFAIL, Reason.SIG_BADLENGTH, Reason.SIG_NONSCHNORR,
  ];

  if (toRegExp(require).test(reason)) {
    return new FailedRequireError(reason, meepStr);
  }

  if (toRegExp(timeCheck).test(reason)) {
    return new FailedTimeCheckError(reason, meepStr);
  }

  if (toRegExp(sigCheck).test(reason)) {
    return new FailedSigCheckError(reason, meepStr);
  }

  return new FailedTransactionError(reason, meepStr);
}

function toRegExp(reasons: string[]): RegExp {
  return new RegExp(reasons.join('|').replace(/\(/g, '\\(').replace(/\)/g, '\\)'));
}

// ////////// MISC ////////////////////////////////////////////////////////////
export function meep(tx: any, utxos: Utxo[], script: Script): string {
  const scriptPubkey = binToHex(scriptToLockingBytecode(script, 'p2sh20'));
  return `meep debug --tx=${tx} --idx=0 --amt=${utxos[0].satoshis} --pkscript=${scriptPubkey}`;
}

export function scriptToAddress(script: Script, network: string, addressType: 'p2sh20' | 'p2sh32', tokenSupport: boolean): string {
  const lockingBytecode = scriptToLockingBytecode(script, addressType);
  const prefix = getNetworkPrefix(network);
  const address = lockingBytecodeToCashAddress(lockingBytecode, prefix, {tokenSupport}) as string;
  return address;
}

export function scriptToLockingBytecode(script: Script, addressType: 'p2sh20' | 'p2sh32'): Uint8Array {
  const scriptBytecode = scriptToBytecode(script);
  const scriptHash = (addressType === 'p2sh20')? hash160(scriptBytecode) : hash256(scriptBytecode);
  const addressContents = { payload: scriptHash, type: LockingBytecodeType[addressType] };
  const lockingBytecode = addressContentsToLockingBytecode(addressContents);
  return lockingBytecode;
}

export function utxoComparator(a: Utxo, b: Utxo): number {
  if (a.satoshis > b.satoshis) return 1;
  if (a.satoshis < b.satoshis) return -1;
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
  throw Error('Pushdata too large');
}
