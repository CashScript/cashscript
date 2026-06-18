import { range } from './data.js';
import { Script, scriptToBitAuthAsm } from './script.js';
import { parseSourceTags, sourceMapToLocationData } from './source-map.js';
import { FullLocationData, PositionHint, SingleLocationData, SourceTagEntry, SourceTagKind } from './types.js';

export type LineToOpcodesMap = Record<string, Script>;
export type LineToAsmMap = Record<string, string>;

export function buildLineToOpcodesMap(
  bytecode: Script,
  sourceMapOrLocationData: string | FullLocationData,
): LineToOpcodesMap {
  const locationData = typeof sourceMapOrLocationData === 'string' ? sourceMapToLocationData(sourceMapOrLocationData) : sourceMapOrLocationData;

  return locationData.reduce<LineToOpcodesMap>((lineToOpcodeMap, singleLocation, index) => {
    const opcode = bytecode[index];
    const line = getDisplayLine(singleLocation);

    return {
      ...lineToOpcodeMap,
      [line]: [...(lineToOpcodeMap[line] || []), opcode],
    };
  }, {});
}

export function buildLineToAsmMap(bytecode: Script, sourceMapOrLocationData: string | FullLocationData): LineToAsmMap {
  const lineToOpcodesMap = buildLineToOpcodesMap(bytecode, sourceMapOrLocationData);

  return Object.fromEntries(
    Object.entries(lineToOpcodesMap).map(([lineNumber, opcodeList]) => [lineNumber, scriptToBitAuthAsm(opcodeList)]),
  );
}

export function formatBitAuthScript(bytecode: Script, sourceMap: string, sourceCode: string, sourceTags?: string): string {
  const locationData = sourceMapToLocationData(sourceMap);
  const sourceLines = sourceCode.split('\n');

  // Splice synthetic annotation lines (e.g. for-loop updates) into source and remap opcode lines
  const insertions = buildInsertions(locationData, sourceLines, sourceTags);
  const splicedSourceLines = spliceSyntheticSourceLines(sourceLines, insertions);
  const splicedLocationData = updateLocationData(locationData, insertions);

  // Group opcodes by display line and convert to ASM
  const lineToAsm = buildLineToAsmMap(bytecode, splicedLocationData);

  // Format output
  const escapedLines = splicedSourceLines.map(escapeCommentChars);
  const maxAsmLen = Math.max(...escapedLines.map((_, i) => (lineToAsm[i + 1] || '').length));
  const maxSrcLen = Math.max(...escapedLines.map((l) => l.length));

  return escapedLines.map((src, i) => {
    const asm = lineToAsm[i + 1] || '';
    return `${asm.padEnd(maxAsmLen)} /* ${src.padEnd(maxSrcLen)} */`;
  }).join('\n');
}

// --- Helpers ---

function getDisplayLine(singleLocation: SingleLocationData): number {
  const { location, positionHint } = singleLocation;
  return positionHint === PositionHint.END ? location.end.line : location.start.line;
}

function escapeCommentChars(text: string): string {
  return text.replaceAll('/*', '\\/*').replaceAll('*/', '*\\/');
}

// --- Source tag handling (for-loop update annotations) ---

interface Insertion {
  insertAfterLine: number;
  annotation: string;
  startIndex: number;
  endIndex: number;
}

// Where a synthetic annotation line is spliced, and the indentation it's rendered with.
interface Anchor {
  insertAfterLine: number;
  indent: string;
}

// Compiler-injected prologue checks: emitted before the function body but executing at its top.
const PROLOGUE_KINDS = [
  SourceTagKind.LOCKTIME_GUARD,
  SourceTagKind.PARAMETER_VALIDATION,
];

// Compiler-injected epilogue checks: emitted after the function/loop body
const EPILOGUE_KINDS = [
  SourceTagKind.SCOPE_CLEANUP,
  SourceTagKind.LOOP_CONDITION,
];

function buildInsertions(
  locationData: FullLocationData,
  sourceLines: string[],
  sourceTags?: string,
): Insertion[] {
  const tags = (sourceTags ? parseSourceTags(sourceTags) : []);

  return tags.map((tag) => {
    const { insertAfterLine, indent } = deriveAnchor(tag, tags, locationData, sourceLines);
    const annotation = `${indent}${tagDescription(tag, locationData, sourceLines)}`;
    return { insertAfterLine, annotation, startIndex: tag.startIndex, endIndex: tag.endIndex };
  });
}

function deriveAnchor(
  tag: SourceTagEntry,
  tags: SourceTagEntry[],
  locationData: FullLocationData,
  sourceLines: string[],
): Anchor {
  if (PROLOGUE_KINDS.includes(tag.kind)) {
    const prologueTags = tags.filter((t) => PROLOGUE_KINDS.includes(t.kind));

    // The prologue is one contiguous opcode block at the function's start
    const lastPrologueOpcode = Math.max(...prologueTags.map((t) => t.endIndex));
    const firstBodyOpcode = lastPrologueOpcode + 1;
    const firstBodyLine = getDisplayLine(locationData[firstBodyOpcode]);

    return {
      // `insertAfterLine` splices *after* a line, so `firstBodyLine - 1` lands all the prologue
      // annotations directly above the first body statement, at its indentation.
      insertAfterLine: firstBodyLine - 1,
      indent: lineIndent(sourceLines, firstBodyLine),
    };
  }

  // Scope cleanup and loop-back condition tags always get inserted right before the scope's closing brace.
  if (EPILOGUE_KINDS.includes(tag.kind)) {
    const braceLine = getDisplayLine(locationData[tag.startIndex]);
    return {
      insertAfterLine: braceLine - 1,
      indent: deriveIndent(locationData[tag.startIndex].location.start.line, sourceLines),
    };
  }

  return {
    insertAfterLine: getDisplayLine(locationData[Math.max(tag.startIndex - 1, 0)]),
    indent: deriveIndent(getDisplayLine(locationData[tag.startIndex]), sourceLines),
  };
}

function spliceSyntheticSourceLines(sourceLines: string[], insertions: Insertion[]): string[] {
  return insertions.reduceRight(
    (lines, ins) => [...lines.slice(0, ins.insertAfterLine), ins.annotation, ...lines.slice(ins.insertAfterLine)],
    sourceLines,
  );
}

function updateLocationData(locationData: FullLocationData, insertions: Insertion[]): FullLocationData {
  return insertions.reduceRight((location, insertion) => {
    return location.map((entry, opcodeIndex) => {
      const currentLineNumber = getDisplayLine(location[opcodeIndex]);
      const updatedLineNumber = getUpdatedLineNumber(currentLineNumber, insertion, opcodeIndex);
      if (updatedLineNumber === currentLineNumber) return entry;

      return {
        location: {
          start: { line: updatedLineNumber, column: 0 },
          end: { line: updatedLineNumber, column: 0 },
        },
        positionHint: PositionHint.START,
      };
    });
  }, locationData);
}

const getUpdatedLineNumber = (currentLineNumber: number, insertion: Insertion, opcodeIndex: number): number => {
  const newLineNumber = insertion.insertAfterLine + 1;
  const inTagRange = opcodeIndex >= insertion.startIndex && opcodeIndex <= insertion.endIndex;

  if (inTagRange) return newLineNumber;
  if (currentLineNumber > insertion.insertAfterLine) return currentLineNumber + 1;
  return currentLineNumber;
};

// e.g. ">>> for-loop update (i = i + 1)"
function tagDescription(tag: SourceTagEntry, locationData: FullLocationData, sourceLines: string[]): string {
  switch (tag.kind) {
    case SourceTagKind.LOCKTIME_GUARD:
      return '>>> tx.locktime guard (auto-injected)';
    case SourceTagKind.PARAMETER_VALIDATION: {
      const parameter = deriveSourceText(tag, locationData, sourceLines);
      return `>>> parameter type check${parameter ? ` (${parameter})` : ''}`;
    }
    case SourceTagKind.SCOPE_CLEANUP:
      return '>>> scope cleanup';
    case SourceTagKind.LOOP_CONDITION:
      return '>>> loop condition check';
    case SourceTagKind.FOR_UPDATE:
    default:
      return `>>> for-loop update (${deriveSourceText(tag, locationData, sourceLines)})`;
  }
}

function deriveIndent(headerLine: number, sourceLines: string[]): string {
  const bodyLine = sourceLines.slice(headerLine).find((l) => l.trim().length > 0);
  return bodyLine?.match(/^(\s*)/)?.[1] ?? '';
}

function lineIndent(sourceLines: string[], line: number): string {
  return sourceLines[line - 1]?.match(/^(\s*)/)?.[1] ?? '';
}

function deriveSourceText(tag: SourceTagEntry, locationData: FullLocationData, sourceLines: string[]): string {
  const headerLine = getDisplayLine(locationData[tag.startIndex]);
  const singleLineLocations = range(tag.startIndex, tag.endIndex)
    .map((idx) => locationData[idx].location)
    .filter((loc) => loc.start.line === loc.end.line && loc.start.column !== loc.end.column);

  if (singleLineLocations.length === 0) return '';

  const startCol = Math.min(...singleLineLocations.map((loc) => loc.start.column));
  const endCol = Math.max(...singleLineLocations.map((loc) => loc.end.column));
  return sourceLines[headerLine - 1].substring(startCol, endCol).trim();
}
