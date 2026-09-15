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
import { optimisationReplacements } from './optimisations.js';
import { range } from './data.js';
import { FullLocationData, PositionHint, SingleLocationData, SourceTagEntry, SourceTagKind } from './types.js';
import { InlineRange, LogEntry, RequireStatement } from './artifact.js';

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

export interface OptimiseBytecodeResult {
  script: Script;
  locationData: FullLocationData;
  logs: LogEntry[];
  requires: RequireStatement[];
  sourceTags: SourceTagEntry[];
  inlineRanges: InlineRange[];
}

export function optimiseBytecode(
  script: Script,
  locationData: FullLocationData,
  logs: LogEntry[],
  requires: RequireStatement[],
  sourceTags: SourceTagEntry[],
  inlineRanges: InlineRange[],
  constructorParamLength: number,
  runs: number = 1000,
): OptimiseBytecodeResult {
  for (let i = 0; i < runs; i += 1) {
    const result = replaceOps(
      script, locationData, logs, requires, sourceTags, inlineRanges, constructorParamLength, optimisationReplacements,
    );

    // Break on fixed point
    if (!result.changed) break;

    ({ script, locationData, logs, requires, sourceTags, inlineRanges } = result);
  }

  return {
    script, locationData, logs, requires, sourceTags: reconcileScopeCleanupTags(script, sourceTags), inlineRanges,
  };
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

interface ReplaceOpsResult extends OptimiseBytecodeResult {
  changed: boolean;
}

function replaceOps(
  script: Script,
  locationData: FullLocationData,
  logs: LogEntry[],
  requires: RequireStatement[],
  sourceTags: SourceTagEntry[],
  inlineRanges: InlineRange[],
  constructorParamLength: number,
  optimisations: [string, string][],
): ReplaceOpsResult {
  const originalAsm = scriptToAsm(script);
  let asm = originalAsm;
  const newLocationData = [...locationData];
  let newLogs = [...logs];
  let newRequires = [...requires];
  let newSourceTags = [...sourceTags];
  let newInlineRanges = [...inlineRanges];

  optimisations.forEach(([pattern, replacement]) => {
    const patternTokens = pattern.split(/\s+/);
    const patternLength = patternTokens.length;
    const replacementLength = replacement === '' ? 0 : replacement.split(/\s+/).length;
    const lengthDiff = patternLength - replacementLength;

    // (?=\s|$) requires the pattern to end at a token boundary (no partial matches) without consuming the separator
    const regex = new RegExp(`${pattern}(?=\\s|$)`, 'g');

    // Most rules match nothing on any given script, and must leave the ASM untouched.
    const matches = [...asm.matchAll(regex)];
    if (matches.length === 0) return;

    // Make a mapping *once* that maps the character offset of every opcode/token to its script index
    const scriptIndexAtCharacterOffset = new Map<number, number>();
    asm.split(' ').reduce((characterOffset, token, scriptIndex) => {
      scriptIndexAtCharacterOffset.set(characterOffset, scriptIndex);
      return characterOffset + token.length + 1;
    }, 0);

    // Process the matches right to left: replacing a pattern only shifts the metadata positions
    // that come after it, so the indices of the remaining (earlier) matches stay valid as-is.
    for (const match of matches.reverse()) {
      const scriptIndex = scriptIndexAtCharacterOffset.get(match.index)!;

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

      // Positions after the replaced pattern shift back by the length difference; positions inside
      // the replaced pattern clamp to the pattern's start. (Positions inside a pattern are impossible
      // for the current set of optimisations, but the clamp future-proofs the code.)
      const adjustPosition = (position: number, patternStart: number): number => (
        position >= patternStart ? Math.max(patternStart, position - lengthDiff) : position
      );

      newRequires = newRequires.map((require) => ({
        ...require,
        ip: adjustPosition(require.ip, scriptIp),
      }));

      newLogs = newLogs.map((log) => {
        return {
          ip: adjustPosition(log.ip, scriptIp),
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

      // Source tags use raw script indices (no constructor offset), so they adjust against scriptIndex
      newSourceTags = newSourceTags.map((tag) => ({
        ...tag,
        startIndex: adjustPosition(tag.startIndex, scriptIndex),
        endIndex: adjustPosition(tag.endIndex, scriptIndex),
      }));

      // Inline ranges use ip coordinates (like requires), so both bounds adjust against scriptIp
      newInlineRanges = newInlineRanges.map((inlineRange) => ({
        ...inlineRange,
        startIp: adjustPosition(inlineRange.startIp, scriptIp),
        endIp: adjustPosition(inlineRange.endIp, scriptIp),
      }));

    }

    asm = asm.replace(regex, replacement).replace(/\s+/g, ' ').trim();
  });

  return {
    script: asmToScript(asm),
    changed: asm !== originalAsm,
    locationData: newLocationData,
    logs: newLogs,
    requires: newRequires,
    sourceTags: newSourceTags,
    inlineRanges: newInlineRanges,
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
