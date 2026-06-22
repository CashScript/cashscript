import {
  encodeDataPush,
  hexToBin,
  disassembleBytecodeBch,
  flattenBinArray,
  encodeAuthenticationInstructions,
  decodeAuthenticationInstructions,
  OpcodesBch,
  AuthenticationInstruction,
} from '@bitauth/libauth';
import OptimisationsEquivFile from './cashproof-optimisations.js';
import { optimisationReplacements } from './optimisations.js';
import { range } from './data.js';
import { FullLocationData, PositionHint, SingleLocationData, SourceTagEntry, SourceTagKind } from './types.js';
import { LogEntry, RequireStatement } from './artifact.js';

export const Op = OpcodesBch;
export type Op = number;
export type OpOrData = Op | Uint8Array;
export type Script = OpOrData[];

export function scriptToAsm(script: Script): string {
  return bytecodeToAsm(scriptToBytecode(script));
}

export function scriptToBitAuthAsm(script: Script): string {
  return bytecodeToBitAuthAsm(scriptToBytecode(script));
}

export function asmToScript(asm: string): Script {
  return bytecodeToScript(asmToBytecode(asm));
}

// asmToBytecode also works for BitAuth ASM
export function bitAuthAsmToScript(asm: string): Script {
  return asmToScript(asm);
}

export function scriptToBytecode(script: Script): Uint8Array {
  // Convert the script elements to AuthenticationInstructions
  const instructions = script.map((opOrData) => {
    if (typeof opOrData === 'number') {
      return { opcode: opOrData };
    }

    return decodeAuthenticationInstructions(encodeDataPush(opOrData))[0];
  });

  // Convert the AuthenticationInstructions to bytecode
  return encodeAuthenticationInstructions(instructions);
}

export function bytecodeToScript(bytecode: Uint8Array): Script {
  // Convert the bytecode to AuthenticationInstructions
  const instructions = decodeAuthenticationInstructions(bytecode);

  // Convert the AuthenticationInstructions to script elements
  const script = instructions.map((instruction) => (
    'data' in instruction ? instruction.data : instruction.opcode
  ));

  return script;
}

export function asmToBytecode(asm: string): Uint8Array {
  // Remove any duplicate whitespace
  asm = asm.replace(/\s+/g, ' ').trim();

  if (asm === '') return new Uint8Array();

  // Convert the ASM tokens to AuthenticationInstructions
  const instructions = asm.split(' ').map((token) => {
    // Even though the OpcodesBch type allows for { [key: number]: string }, we know that the keys are always the opcodes
    // so we can safely cast to the AuthenticationInstruction type
    if (token.startsWith('OP_')) {
      return { opcode: Op[token as keyof typeof Op] } as AuthenticationInstruction;
    }

    const data = token.replace(/<|>/g, '').replace(/^0x/, '');

    return decodeAuthenticationInstructions(encodeDataPush(hexToBin(data)))[0];
  });

  // Convert the AuthenticationInstructions to bytecode
  return encodeAuthenticationInstructions(instructions);
}

export function bytecodeToAsm(bytecode: Uint8Array): string {
  // Convert the bytecode to libauth's ASM format
  let asm = disassembleBytecodeBch(bytecode);

  // COnvert libauth's ASM format to BITBOX's
  asm = asm.replace(/OP_PUSHBYTES_[^\s]+/g, '');
  asm = asm.replace(/OP_PUSHDATA[^\s]+ [^\s]+/g, '');
  asm = asm.replace(/(^|\s)0x/g, ' ');

  // Remove any duplicate whitespace
  asm = asm.replace(/\s+/g, ' ').trim();

  return asm;
}

// TODO: If we decide to change the ASM / artifact format, we can remove this function and merge it with bytecodeToAsm
export function bytecodeToBitAuthAsm(bytecode: Uint8Array): string {
  // Convert the bytecode to libauth's ASM format
  let asm = disassembleBytecodeBch(bytecode);

  // COnvert libauth's ASM format to BitAuth Script ASM
  asm = asm.replace(/OP_PUSHBYTES_[^\s]+/g, '');
  asm = asm.replace(/OP_PUSHDATA[^\s]+ [^\s]+/g, '');
  asm = asm.replace(/(^|\s)(0x\w*)/g, ' \<$2\>');

  // Remove any duplicate whitespace
  asm = asm.replace(/\s+/g, ' ').trim();

  return asm;
}

export function countOpcodes(script: Script): number {
  return script
    .filter((opOrData) => typeof opOrData === 'number')
    .filter((op) => (op as number) > Op.OP_16)
    .length;
}

export function calculateBytesize(script: Script): number {
  return scriptToBytecode(script).byteLength;
}

// For encoding OP_RETURN data (doesn't require BIP62.3 / MINIMALDATA)
export function encodeNullDataScript(chunks: OpOrData[]): Uint8Array {
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

export function generateContractBytecodeScript(baseScript: Script, encodedConstructorArgs: Script): Script {
  return [...encodedConstructorArgs.slice().reverse(), ...baseScript];
}

interface OptimiseBytecodeResult {
  script: Script;
  locationData: FullLocationData;
  logs: LogEntry[];
  requires: RequireStatement[];
  sourceTags: SourceTagEntry[];
}

// Pre-parse the ASM-string optimisation patterns into opcode-number sequences once, so the
// optimiser can match directly against the Script array instead of stringifying it to ASM and
// regex-scanning a growing string on every match. The old approach recovered each match's script
// index with [...processedAsm.matchAll(/\s+/g)].length over the growing prefix, making replaceOps
// O(asm-length) per match — quadratic in script size and pathological for large, constant-heavy
// contracts (e.g. the BN254 pairing chunks that bake dozens of 32-40 byte field constants).
interface ParsedOptimisation {
  pattern: Op[];
  replacement: Op[];
  // The original pattern split into tokens, kept only for the console.log transformation bookkeeping.
  patternTokens: string[];
}

function parseOpcodeTokens(asm: string): Op[] {
  const trimmed = asm.trim();
  if (trimmed === '') return [];
  return trimmed.split(/\s+/).map((token) => Op[token as keyof typeof Op] as Op);
}

const parsedOptimisations: ParsedOptimisation[] = optimisationReplacements.map(([pattern, replacement]) => ({
  pattern: parseOpcodeTokens(pattern),
  replacement: parseOpcodeTokens(replacement),
  patternTokens: pattern.trim() === '' ? [] : pattern.trim().split(/\s+/),
}));

// Structural equality on Script arrays: opcodes by value, data pushes by byte content. Replaces the
// previous fixed-point check that compared scriptToAsm(old) === scriptToAsm(new) (a full stringify
// of both scripts every pass).
function scriptsEqual(a: Script, b: Script): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i += 1) {
    const x = a[i];
    const y = b[i];
    if (typeof x === 'number' || typeof y === 'number') {
      if (x !== y) return false;
    } else {
      if (x.length !== y.length) return false;
      for (let k = 0; k < x.length; k += 1) {
        if (x[k] !== y[k]) return false;
      }
    }
  }
  return true;
}

// The opcode a script element represents for matching purposes. Opcodes are stored as numbers, but
// small integer pushes are stored as data (encodeInt(0n) -> empty, 1n -> [1], -1n -> [0x81]); under
// minimal-push encoding these disassemble to OP_0 / OP_1..OP_16 / OP_1NEGATE, which the optimisation
// patterns reference. We derive that opcode exactly as scriptToBytecode/disassembly would: a data
// element whose minimal push is a single byte IS that opcode. Anything else (a genuine multi-byte
// data push) returns -1, which never equals a real opcode.
function elementOpcode(element: OpOrData): number {
  if (typeof element === 'number') return element;
  if (element.length >= 2) return -1;
  const push = encodeDataPush(element);
  return push.length === 1 ? push[0] : -1;
}

// Does the optimisation pattern (a pure opcode sequence) match the script starting at `index`?
function patternMatchesAt(script: Script, index: number, pattern: Op[]): boolean {
  for (let j = 0; j < pattern.length; j += 1) {
    if (elementOpcode(script[index + j]) !== pattern[j]) return false;
  }
  return true;
}

export function optimiseBytecode(
  script: Script,
  locationData: FullLocationData,
  logs: LogEntry[],
  requires: RequireStatement[],
  sourceTags: SourceTagEntry[],
  constructorParamLength: number,
  runs: number = 1000,
): OptimiseBytecodeResult {
  for (let i = 0; i < runs; i += 1) {
    const oldScript = script;
    const {
      script: newScript,
      locationData: newLocationData,
      logs: newLogs,
      requires: newRequires,
      sourceTags: newSourceTags,
    } = replaceOps(script, locationData, logs, requires, sourceTags, constructorParamLength, parsedOptimisations);

    // Break on fixed point
    if (scriptsEqual(oldScript, newScript)) break;

    script = newScript;
    locationData = newLocationData;
    logs = newLogs;
    requires = newRequires;
    sourceTags = newSourceTags;
  }

  return { script, locationData, logs, requires, sourceTags: reconcileScopeCleanupTags(script, sourceTags) };
}

const SCOPE_CLEANUP_OPCODES = [Op.OP_DROP, Op.OP_NIP, Op.OP_2DROP];

// Make sure that scope cleanup tags are only displayed if they did not merge with other tags or drift
// due to compiler optimisations.
function reconcileScopeCleanupTags(script: Script, sourceTags: SourceTagEntry[]): SourceTagEntry[] {
  const otherTags = sourceTags.filter((tag) => tag.kind !== SourceTagKind.SCOPE_CLEANUP);

  return sourceTags.filter((tag) => {
    if (tag.kind !== SourceTagKind.SCOPE_CLEANUP) return true;

    const isOnlyCleanupOpcodes = range(tag.startIndex, tag.endIndex)
      .every((index) => SCOPE_CLEANUP_OPCODES.includes(script[index] as Op));
    if (!isOnlyCleanupOpcodes) return false;

    const overlapsOtherTag = otherTags
      .some((other) => tag.startIndex <= other.endIndex && other.startIndex <= tag.endIndex);
    return !overlapsOtherTag;
  });
}

export function optimiseBytecodeOld(script: Script, runs: number = 1000): Script {
  const optimisations = OptimisationsEquivFile
    // Split by line and filter all line comments (#)
    .split('\n')
    .map((equiv) => equiv.trim())
    .filter((equiv) => !equiv.startsWith('#'))
    // Join back the lines, and split on semicolon
    .join('')
    .split(';')
    // Parse all optimisations in .equiv file
    .map((equiv) => equiv.trim())
    .map((equiv) => equiv.split('<=>').map((part) => part.trim()))
    .filter((equiv) => equiv.length === 2);

  for (let i = 0; i < runs; i += 1) {
    const oldScript = script;
    script = replaceOpsOld(script, optimisations);

    // Break on fixed point
    if (scriptToAsm(oldScript) === scriptToAsm(script)) break;
  }

  return script;
}

function replaceOpsOld(script: Script, optimisations: string[][]): Script {
  let asm = scriptToAsm(script);

  // Apply all optimisations in the cashproof file
  optimisations.forEach(([pattern, replacement]) => {
    asm = asm.replace(new RegExp(pattern, 'g'), replacement);
  });

  // Add optimisations that are not compatible with CashProof
  // CashProof can't prove OP_IF without parameters
  asm = asm.replace(/OP_NOT OP_IF/g, 'OP_NOTIF');
  // CashProof can't prove OP_CHECKMULTISIG without specifying N
  asm = asm.replace(/OP_CHECKMULTISIG OP_VERIFY/g, 'OP_CHECKMULTISIGVERIFY');
  // CashProof can't prove bitwise operators
  asm = asm.replace(/OP_SWAP OP_AND/g, 'OP_AND');
  asm = asm.replace(/OP_SWAP OP_OR/g, 'OP_OR');
  asm = asm.replace(/OP_SWAP OP_XOR/g, 'OP_XOR');
  asm = asm.replace(/OP_DUP OP_AND/g, '');
  asm = asm.replace(/OP_DUP OP_OR/g, '');

  // Remove any double spaces as a result of opcode removal
  asm = asm.replace(/\s+/g, ' ').trim();

  return asmToScript(asm);
}

interface ReplaceOpsResult {
  script: Script;
  locationData: FullLocationData;
  logs: LogEntry[];
  requires: RequireStatement[];
  sourceTags: SourceTagEntry[];
}

function replaceOps(
  script: Script,
  locationData: FullLocationData,
  logs: LogEntry[],
  requires: RequireStatement[],
  sourceTags: SourceTagEntry[],
  constructorParamLength: number,
  optimisations: ParsedOptimisation[],
): ReplaceOpsResult {
  const newScript: Script = [...script];
  let newLocationData = [...locationData];
  let newLogs = [...logs];
  let newRequires = [...requires];
  let newSourceTags = [...sourceTags];

  optimisations.forEach(({ pattern, replacement, patternTokens }) => {
    const patternLength = pattern.length;
    if (patternLength === 0) return;
    const replacementLength = replacement.length;
    const lengthDiff = patternLength - replacementLength;

    // Scan the script array left-to-right. On a match we splice in the replacement and continue
    // AFTER it (the replacement is not re-examined within this pass), matching the previous
    // string-based behaviour exactly while avoiding any ASM stringification.
    let scriptIndex = 0;
    while (scriptIndex <= newScript.length - patternLength) {
      if (!patternMatchesAt(newScript, scriptIndex, pattern)) {
        scriptIndex += 1;
        continue;
      }

      // Splice the matched pattern out of the script array, inserting the replacement opcodes.
      newScript.splice(scriptIndex, patternLength, ...replacement);

      // We get the locationData entries for every opcode in the pattern
      const patternLocations = newLocationData.slice(scriptIndex, scriptIndex + patternLength);

      // We get the lowest start location and highest end location of the pattern
      const lowestStart = getLowestStartLocation(patternLocations);
      const highestEnd = getHighestEndLocation(patternLocations);

      // Initially we set the position hint to END if any of the pattern locations have a position hint of END
      // It turned out that this was not the correct approach in the case of OP_NOT OP_IF => OP_NOTIF,
      // because OP_IF and OP_NOTIF are START opcodes, and OP_NOT is an END opcode.
      // After reviewing the entire list of optimisations, we set the position hint to the last location's position hint
      // which we believe to be the correct approach, but it is hard to reason about.
      // We've also consulted with AI (o3-max) to help us reason about this, and it seems to be the correct approach.
      const positionHint = patternLocations.at(-1)?.positionHint ?? PositionHint.START;

      // We merge the lowest start and highest end locations into a single location data entry
      const mergedLocation = {
        location: {
          start: lowestStart.location.start,
          end: highestEnd.location.end,
        },
        positionHint,
      };

      // We replace the pattern locations with the merged location
      // (note that every opcode in the replacement has the same location)
      const replacementLocations = new Array<SingleLocationData>(replacementLength).fill(mergedLocation);
      newLocationData.splice(scriptIndex, patternLength, ...replacementLocations);

      // The IP of an opcode in the script is its index within the script + the constructor parameters, because
      // the constructor parameters still have to get added to the front of the script when a new Contract is created.
      const scriptIp = scriptIndex + constructorParamLength;

      newRequires = newRequires.map((require) => {
        // We calculate the new ip of the require by subtracting the length diff between the matched pattern and replacement
        const newCalculatedRequireIp = require.ip - lengthDiff;

        return {
          ...require,
          // If the require is within the pattern, we want to make sure that the new ip is at least the scriptIp
          // Note that this is impossible for the current set of optimisations, but future proofs the code
          ip: require.ip >= scriptIp ? Math.max(scriptIp, newCalculatedRequireIp) : require.ip,
        };
      });

      newLogs = newLogs.map((log) => {
        // We calculate the new ip of the log by subtracting the length diff between the matched pattern and replacement
        const newCalculatedLogIp = log.ip - lengthDiff;

        return {
          // If the log is within the pattern, we want to make sure that the new ip is at least the scriptIp
          ip: log.ip >= scriptIp ? Math.max(scriptIp, newCalculatedLogIp) : log.ip,
          line: log.line,
          data: log.data.map((data) => {
            if (typeof data === 'string') return data;

            // If the log is completely before the pattern, we don't need to change anything
            if (data.ip <= scriptIp) return data;

            // If the log is completely after the pattern, we just need to offset the ip by the length diff
            if (data.ip >= scriptIp + patternLength) {
              const newCalculatedDataIp = data.ip - lengthDiff;
              return { ...data, ip: newCalculatedDataIp };
            }

            const addedTransformationsCount = data.ip - scriptIp;
            const addedTransformations = patternTokens.slice(0, addedTransformationsCount).join(' ');
            const newTransformations = data.transformations ? `${addedTransformations} ${data.transformations}` : addedTransformations;

            return {
              ...data,
              ip: scriptIp,
              transformations: newTransformations,
            };
          }),
        };
      });

      // Source tags use raw script indices (no constructor offset), so we adjust using scriptIndex directly
      newSourceTags = newSourceTags.map((tag) => ({
        ...tag,
        startIndex: tag.startIndex >= scriptIndex ? Math.max(scriptIndex, tag.startIndex - lengthDiff) : tag.startIndex,
        endIndex: tag.endIndex >= scriptIndex ? Math.max(scriptIndex, tag.endIndex - lengthDiff) : tag.endIndex,
      }));

      // Continue scanning after the inserted replacement (it is not re-examined within this pass).
      scriptIndex += replacementLength;
    }
  });

  return {
    script: newScript,
    locationData: newLocationData,
    logs: newLogs,
    requires: newRequires,
    sourceTags: newSourceTags,
  };
}

const getHighestEndLocation = (locations: SingleLocationData[]): SingleLocationData => {
  return locations.reduce((highest, current) => {
    if (current.location.end.line > highest.location.end.line) {
      return current;
    }

    if (highest.location.end.line === current.location.end.line) {
      if (current.location.end.column > highest.location.end.column) {
        return current;
      }
    }

    return highest;
  }, locations[0]);
};

const getLowestStartLocation = (locations: SingleLocationData[]): SingleLocationData => {
  return locations.reduce((lowest, current) => {
    if (current.location.start.line < lowest.location.start.line) {
      return current;
    }

    if (lowest.location.start.line === current.location.start.line) {
      if (current.location.start.column < lowest.location.start.column) {
        return current;
      }
    }

    return lowest;
  }, locations[0]);
};

