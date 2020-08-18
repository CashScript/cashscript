import { Script, Data, Op } from 'cashc';
import {
  cashAddressToLockingBytecode,
  AddressType,
  addressContentsToLockingBytecode,
  lockingBytecodeToCashAddress,
  binToHex,
  createTransactionContextCommon,
  bigIntToBinUint64LE,
  Transaction,
  generateSigningSerializationBCH,
} from '@bitauth/libauth';
import hash from 'hash.js';
import { Utxo, Output, Network } from './interfaces';
import { P2PKH_OUTPUT_SIZE, VERSION_SIZE, LOCKTIME_SIZE } from './constants';
import {
  Reason,
  FailedTransactionError,
  FailedRequireError,
  FailedTimeCheckError,
  FailedSigCheckError,
} from './Errors';

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
      return acc + P2PKH_OUTPUT_SIZE;
    } else {
      // Size of an OP_RETURN output = byteLength + 8 (amount) + 2 (scriptSize)
      return acc + output.to.byteLength + 8 + 2;
    }
  }, 0);
  // Add tx-out count (accounting for a potential change output)
  size += Data.encodeInt(outputs.length + 1).byteLength;

  return size;
}

export function countOpcodes(script: Script): number {
  return script
    .filter(opOrData => typeof opOrData === 'number')
    .filter(op => op > Op.OP_16)
    .length;
}

export function calculateBytesize(script: Script): number {
  return Data.scriptToBytecode(script).byteLength;
}

// ////////// BUILD OBJECTS ///////////////////////////////////////////////////
export function createInputScript(
  redeemScript: Script,
  encodedParameters: Buffer[],
  selector?: number,
  preimage?: Uint8Array,
): Buffer {
  // Create unlock script / redeemScriptSig (add potential preimage and selector)
  const unlockScript = encodedParameters.reverse();
  if (preimage !== undefined) unlockScript.push(Buffer.from(preimage));
  if (selector !== undefined) unlockScript.push(Data.encodeInt(selector));

  // Create input script and compile it to bytecode
  const inputScript = [...unlockScript, Buffer.from(Data.scriptToBytecode(redeemScript))];
  return Buffer.from(Data.scriptToBytecode(inputScript));
}

export function createOpReturnOutput(
  opReturnData: string[],
): Output {
  const script = [
    Op.OP_RETURN,
    ...opReturnData.map((output: string) => toBuffer(output)),
  ];

  return { to: encodeNullDataScript(script), amount: 0 };
}

function toBuffer(output: string): Buffer {
  const data = output.replace(/^0x/, '');
  const format = data === output ? 'utf8' : 'hex';
  return Buffer.from(data, format);
}

export function createSighashPreimage(
  transaction: Transaction,
  input: { satoshis: number },
  inputIndex: number,
  coveredBytecode: Uint8Array,
  hashtype: number,
): Uint8Array {
  const state = createTransactionContextCommon({
    inputIndex,
    sourceOutput: { satoshis: bigIntToBinUint64LE(BigInt(input.satoshis)) },
    spendingTransaction: transaction,
  });

  const sighashPreimage = generateSigningSerializationBCH({
    correspondingOutput: state.correspondingOutput,
    coveredBytecode,
    forkId: new Uint8Array([0, 0, 0]),
    locktime: state.locktime,
    outpointIndex: state.outpointIndex,
    outpointTransactionHash: state.outpointTransactionHash,
    outputValue: state.outputValue,
    sequenceNumber: state.sequenceNumber,
    sha256: { hash: sha256 },
    signingSerializationType: new Uint8Array([hashtype]),
    transactionOutpoints: state.transactionOutpoints,
    transactionOutputs: state.transactionOutputs,
    transactionSequenceNumbers: state.transactionSequenceNumbers,
    version: 2,
  });

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
  } else if (toRegExp(timeCheck).test(reason)) {
    return new FailedTimeCheckError(reason, meepStr);
  } else if (toRegExp(sigCheck).test(reason)) {
    return new FailedSigCheckError(reason, meepStr);
  } else {
    return new FailedTransactionError(reason, meepStr);
  }
}

function toRegExp(reasons: string[]): RegExp {
  return new RegExp(reasons.join('|').replace(/\(/g, '\\(').replace(/\)/g, '\\)'));
}

// ////////// HASH FUNCTIONS //////////////////////////////////////////////////
export function sha256(payload: Uint8Array): Uint8Array {
  return Uint8Array.from(hash.sha256().update(payload).digest());
  // const hashFunction = await instantiateSha256();
  // return hashFunction.hash(payload);
}

export function ripemd160(payload: Uint8Array): Uint8Array {
  return Uint8Array.from(hash.ripemd160().update(payload).digest());
  // const hashFunction = await instantiateRipemd160();
  // return hashFunction.hash(payload);
}

export function hash160(payload: Uint8Array): Uint8Array {
  return ripemd160(sha256(payload));
}

// ////////// MISC ////////////////////////////////////////////////////////////
export function meep(tx: any, utxos: Utxo[], script: Script): string {
  const scriptPubkey = binToHex(scriptToLockingBytecode(script));
  return `meep debug --tx=${tx} --idx=0 --amt=${utxos[0].satoshis} --pkscript=${scriptPubkey}`;
}

export function scriptToAddress(script: Script, network: string): string {
  const lockingBytecode = scriptToLockingBytecode(script);
  const prefix = getNetworkPrefix(network);
  const address = lockingBytecodeToCashAddress(lockingBytecode, prefix) as string;
  return address;
}

export function scriptToLockingBytecode(script: Script): Uint8Array {
  const scriptHash = hash160(Data.scriptToBytecode(script));
  const addressContents = { payload: scriptHash, type: AddressType.p2sh };
  const lockingBytecode = addressContentsToLockingBytecode(addressContents);
  return lockingBytecode;
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

export function getNetworkPrefix(network: string): 'bitcoincash' | 'bchtest' {
  return network === Network.MAINNET ? 'bitcoincash' : 'bchtest';
}

// ////////////////////////////////////////////////////////////////////////////
// For encoding OP_RETURN data (doesn't require BIP62.3)
// These functions are a mash-up between those found in these libs:
// - https://github.com/simpleledger/slpjs/blob/master/lib/utils.ts
// - https://github.com/Bitcoin-com/bitcoincashjs-lib/blob/master/src/script.js

function encodeNullDataScript(chunks: (number | Buffer)[]): Buffer {
  const bufferSize = chunks.reduce((acc: number, chunk: number | Buffer) => {
    if (Buffer.isBuffer(chunk)) {
      const pushdataOpcode = getPushDataOpcode(chunk);
      return acc + chunk.length + pushdataOpcode.length;
    }
    return acc + 1;
  }, 0);

  const buffer = Buffer.allocUnsafe(bufferSize);
  let offset = 0;

  chunks.forEach((chunk: number | Buffer) => {
    if (Buffer.isBuffer(chunk)) {
      const pushdataOpcode = getPushDataOpcode(chunk);
      pushdataOpcode.copy(buffer, offset);
      offset += pushdataOpcode.length;

      chunk.copy(buffer, offset);
      offset += chunk.length;
    } else {
      buffer.writeUInt8(chunk, offset);
      offset += 1;
    }
  });

  return buffer;
}

function getPushDataOpcode(data: Buffer): Buffer {
  const { length } = data;

  if (length === 0) return Buffer.from([0x4c, 0x00]);
  if (length < 76) return Buffer.from([length]);
  if (length < 256) return Buffer.from([0x4c, length]);
  throw Error('Pushdata too large');
}
// ////////////////////////////////////////////////////////////////////////////
