import { range } from './data.js';
import { Script, scriptToBitAuthAsm } from './script.js';
import { parseSourceTags, sourceMapToLocationData } from './source-map.js';
import { FullLocationData, PositionHint, SingleLocationData, SourceTagEntry } from './types.js';

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

function buildInsertions(
  locationData: FullLocationData,
  sourceLines: string[],
  sourceTags?: string,
): Insertion[] {
  const tags = (sourceTags ? parseSourceTags(sourceTags) : []);

  return tags.map((tag) => {
    const annotation = deriveTagLabel(tag, locationData, sourceLines);
    const insertAfterLine = getDisplayLine(locationData[Math.max(tag.startIndex - 1, 0)]);
    return { insertAfterLine, annotation, startIndex: tag.startIndex, endIndex: tag.endIndex };
  });
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

/** Derive the annotation text (e.g. ">>> for-loop update (i = i + 1)") for a source tag. */
function deriveTagLabel(tag: SourceTagEntry, locationData: FullLocationData, sourceLines: string[]): string {
  const headerLine = getDisplayLine(locationData[tag.startIndex]);

  // Find the column span of the update expression using single-line locations in the tag range
  const singleLineLocations = range(tag.startIndex, tag.endIndex)
    .map((idx) => locationData[idx].location)
    .filter((loc) => loc.start.line === loc.end.line);

  const startCol = Math.min(...singleLineLocations.map((loc) => loc.start.column));
  const endCol = Math.max(...singleLineLocations.map((loc) => loc.end.column));
  const expression = sourceLines[headerLine - 1].substring(startCol, endCol);

  // Indentation: use first non-empty line after header
  const bodyLine = sourceLines.slice(headerLine).find((l) => l.trim().length > 0);
  const indent = bodyLine?.match(/^(\s*)/)?.[1] ?? '';

  return `${indent}>>> for-loop update (${expression})`;
}
