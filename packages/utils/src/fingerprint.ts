import {
  binToHex,
  decodeAuthenticationInstructions,
  encodeDataPush,
  flattenBinArray,
  isPushOperation,
} from '@bitauth/libauth';
import { encodeInt } from './data.js';
import { sha256 } from './hash.js';
import { generateContractBytecodeScript, Op, Script, scriptToBytecode } from './script.js';

// Transform locking bytecode into the normalized "pattern" form: every run of
// consecutive push instructions is replaced by a single push of the run length.
// See: https://gitlab.com/0353F40E/smart-contract-fingerprinting/
export function computeBytecodePattern(bytecode: Uint8Array): Uint8Array {
  const opcodes = decodeAuthenticationInstructions(bytecode).map((instruction) => instruction.opcode);
  const chunks = groupByPushRun(opcodes).map((run) => (
    isPushOpcode(run[0]) ? encodePushCount(run.length) : Uint8Array.from(run)
  ));
  return flattenBinArray(chunks);
}

// Split opcodes into consecutive runs that are either all pushes or all non-pushes.
function groupByPushRun(opcodes: Op[]): Op[][] {
  return opcodes.reduce<Op[][]>((opcodeRuns, opcode) => {
    const lastOpcodeRun = opcodeRuns.at(-1);

    // If there are no runs yet, start a new run with the current opcode
    if (!lastOpcodeRun) return [[opcode]];

    // If the last run is the same type of opcode as the current opcode, add the current opcode to the last run
    // Else, start a new run with the current opcode
    if (isPushOpcode(lastOpcodeRun[0]) === isPushOpcode(opcode)) {
      lastOpcodeRun.push(opcode);
    } else {
      opcodeRuns.push([opcode]);
    }

    return opcodeRuns;
  }, []);
}

// Compute the SHA256 fingerprint of the normalized bytecode pattern, returned as hex.
export function computeBytecodeFingerprint(bytecode: Uint8Array): string {
  return binToHex(sha256(computeBytecodePattern(bytecode)));
}

// Add placeholder constructor arguments to the bytecode script and compute the fingerprint.
export function computeBytecodeFingerprintWithConstructorArgs(bytecodeScript: Script, constructorArgsCount: number): string {
  const placeholderConstructorArgs = new Array(constructorArgsCount).fill(0);
  const bytecodeWithConstructorArgs = generateContractBytecodeScript(bytecodeScript, placeholderConstructorArgs);
  return computeBytecodeFingerprint(scriptToBytecode(bytecodeWithConstructorArgs));
}

// Note: libauth's isPushOperation also matches OP_RESERVED (0x50) — the spec excludes it.
export function isPushOpcode(opcode: Op): boolean {
  return isPushOperation(opcode) && opcode !== Op.OP_RESERVED;
}

// Encode a push count using the smallest possible push encoding.
// libauth's encodeDataPush minimally encodes VM Numbers in the -1..16 range as OP_N.
function encodePushCount(count: number): Uint8Array {
  return encodeDataPush(encodeInt(BigInt(count)));
}
