import { binToHex, hexToBin } from '@bitauth/libauth';
import { DebugFrame, DebugInformation } from './artifact.js';
import { range } from './data.js';
import { Op, OpOrData, Script, bytecodeToScript, scriptToBitAuthAsm } from './script.js';
import { parseSourceTags, sourceMapToLocationData } from './source-map.js';
import { FullLocationData, LocationI, PositionHint, SingleLocationData, SourceTagEntry, SourceTagKind } from './types.js';

export type LineToOpcodesMap = Record<string, Script>;
export type LineToAsmMap = Record<string, string>;

// Public utility for line-based tooling — not used by formatBitAuthScript itself, which walks the script
// in bytecode order instead (grouping by line can reorder opcodes for non-monotonic source maps)
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

// Formats the debug bytecode as BitAuth Script with the matching source code in trailing comments. The output
// is not just displayed but *executed* by the BitAuth IDE (and by the SDK's debug evaluation), so the script
// is walked in bytecode order — opcodes are grouped into output rows, never reordered. User-defined function
// bodies are rendered as nested `<...>` push groups annotated with their own frame's source code.
export function formatBitAuthScript(debug: DebugInformation, sourceCode: string): string {
  const sourceLines = sourceCode.split('\n');

  const rows = walkScript({
    script: bytecodeToScript(hexToBin(debug.bytecode)),
    sourceMap: debug.sourceMap,
    sourceTags: debug.sourceTags,
    functions: debug.functions,
    sourceLines,
    startLine: 1,
    endLine: sourceLines.length,
    asmIndent: '',
  });

  return renderRows(rows);
}

interface WalkParams {
  script: Script;
  sourceMap: string;
  sourceTags?: string;
  functions?: readonly DebugFrame[]; // function definitions only occur in the root (contract-level) script
  sourceLines: string[]; // the source document that this script's location data refers to
  startLine: number; // first source line owned by this walk (inclusive)
  endLine: number; // last source line owned by this walk (inclusive)
  asmIndent: string;
}

// Walks the script in bytecode order: first splits it into segments (function definitions, tagged opcode
// ranges, and per-source-line opcode groups), then renders those segments into rows with comment-only
// filler rows in between, so the full source code reads top-to-bottom next to the bytecode.
function walkScript(params: WalkParams): Row[] {
  return renderSegments(segmentScript(params), params);
}

// --- Script segmentation ---

type Segment =
  | { kind: 'lineGroup'; asm: string; line: number }
  | { kind: 'annotation'; asm: string; comment: string; fillThroughLine: number }
  | { kind: 'functionDefinition'; frame: DebugFrame; defineAsm: string };

function segmentScript(params: WalkParams): Segment[] {
  const { script, sourceLines } = params;
  const locationData = sourceMapToLocationData(params.sourceMap);
  const tags = parseSourceTags(params.sourceTags ?? '');
  const defineSites = findDefineSites(script, params.functions ?? []);

  const segments: Segment[] = [];
  let index = 0;

  while (index < script.length) {
    const frame = defineSites.get(index);
    const tag = findTagAt(tags, index);

    if (frame !== undefined) {
      const defineAsm = scriptToBitAuthAsm([script[index + 1], Op.OP_DEFINE]);
      segments.push({ kind: 'functionDefinition', frame, defineAsm });
      index += 3; // <function_body> <function_identifier> OP_DEFINE
    } else if (tag !== undefined) {
      segments.push(annotationSegment(script, tag, tags, locationData, sourceLines));
      index = tag.endIndex + 1;
    } else {
      const line = getDisplayLine(locationData[index]);
      const belongsToGroup = (candidate: number): boolean => (
        !defineSites.has(candidate) && findTagAt(tags, candidate) === undefined
        && getDisplayLine(locationData[candidate]) === line
      );
      const end = range(index + 1, script.length - 1).find((candidate) => !belongsToGroup(candidate)) ?? script.length;

      segments.push({ kind: 'lineGroup', asm: scriptToBitAuthAsm(script.slice(index, end)), line });
      index = end;
    }
  }

  return segments;
}

function annotationSegment(
  script: Script,
  tag: SourceTagEntry,
  tags: SourceTagEntry[],
  locationData: FullLocationData,
  sourceLines: string[],
): Segment {
  const { fillThroughLine, indent } = deriveTagAnchor(tag, tags, locationData, sourceLines);

  return {
    kind: 'annotation',
    asm: scriptToBitAuthAsm(script.slice(tag.startIndex, tag.endIndex + 1)),
    comment: `${indent}${tagDescription(tag, locationData, sourceLines)}`,
    fillThroughLine,
  };
}

// Matches every `<function_body> <function_identifier> OP_DEFINE` site to its debug frame. Frames are stored
// in the same order as the definitions are emitted, so the n-th define site belongs to `frames[n]`. We verify
// that the pushed bytes equal the frame's bytecode, so a mismatch can never render the wrong function's body.
function findDefineSites(script: Script, frames: readonly DebugFrame[]): Map<number, DebugFrame> {
  const defineSites = new Map<number, DebugFrame>();
  let frameIndex = 0;

  for (let index = 0; index + 2 < script.length && frameIndex < frames.length; index += 1) {
    if (script[index + 2] !== Op.OP_DEFINE) continue;

    const bodyPushData = elementAsPushData(script[index]);
    if (bodyPushData === undefined || binToHex(bodyPushData) !== frames[frameIndex].bytecode) continue;

    defineSites.set(index, frames[frameIndex]);
    frameIndex += 1;
    index += 2; // skip the id push and OP_DEFINE
  }

  return defineSites;
}

// The compiler minimally encodes the body push, so a single-byte 0x81 body (a lone OP_BIN2NUM) decodes back
// as the opcode OP_1NEGATE rather than as a data push
function elementAsPushData(element: OpOrData): Uint8Array | undefined {
  if (element instanceof Uint8Array) return element;
  if (element === Op.OP_1NEGATE) return Uint8Array.of(0x81);
  return undefined;
}

function findTagAt(tags: SourceTagEntry[], index: number): SourceTagEntry | undefined {
  return tags.find((tag) => index >= tag.startIndex && index <= tag.endIndex);
}

// --- Segment rendering ---

// A single output line: bytecode ASM on the left, the source code it belongs to as a trailing comment
interface Row {
  asm: string;
  comment: string;
}

interface RenderState {
  rows: Row[];
  renderedLine: number; // the last source line that has been rendered
}

type RenderContext = WalkParams & {
  skipLines: Set<number>; // source lines rendered by function sections rather than as filler
  headerLineLimit: number; // last source line above the contract's own opcodes, eligible for pre-filling
};

const BLANK_ROW: Row = { asm: '', comment: '' };

function renderSegments(segments: Segment[], params: WalkParams): Row[] {
  const context: RenderContext = {
    ...params,
    skipLines: getLocalFunctionLines(params.functions ?? []),
    headerLineLimit: deriveHeaderLineLimit(segments),
  };

  const initialState: RenderState = { rows: [], renderedLine: params.startLine - 1 };
  const finalState = segments.reduce((state, segment) => renderSegment(state, segment, context), initialState);

  return [...finalState.rows, ...fillerRows(finalState.renderedLine, params.endLine, context)];
}

function renderSegment(state: RenderState, segment: Segment, context: RenderContext): RenderState {
  if (segment.kind === 'functionDefinition') return renderFunctionDefinition(state, segment, context);

  const fillThroughLine = segment.kind === 'lineGroup' ? segment.line - 1 : segment.fillThroughLine;
  const comment = segment.kind === 'lineGroup' ? context.sourceLines[segment.line - 1] : segment.comment;
  const reachedLine = segment.kind === 'lineGroup' ? segment.line : segment.fillThroughLine;

  return {
    rows: [
      ...state.rows,
      ...fillerRows(state.renderedLine, fillThroughLine, context),
      { asm: context.asmIndent + segment.asm, comment },
    ],
    renderedLine: Math.max(state.renderedLine, Math.min(reachedLine, context.endLine)),
  };
}

function renderFunctionDefinition(
  state: RenderState,
  segment: Segment & { kind: 'functionDefinition' },
  context: RenderContext,
): RenderState {
  const { frame, defineAsm } = segment;
  const location = parseFrameLocation(frame);

  if (frame.sourceFile !== undefined) return renderImportedFunction(state, frame, location, defineAsm);

  // Functions defined above the contract get the source lines above them (pragma, imports, blank lines)
  // rendered first, so their section lands at its natural source position. Functions defined below the
  // contract render before the contract's rows regardless (bytecode order), so nothing is filled in.
  const fillThroughLine = location.start.line <= context.headerLineLimit ? location.start.line - 1 : state.renderedLine;

  return {
    rows: [
      ...state.rows,
      ...fillerRows(state.renderedLine, fillThroughLine, context),
      ...buildFunctionSection(frame, location, defineAsm, context.sourceLines),
    ],
    renderedLine: Math.max(state.renderedLine, Math.min(fillThroughLine, context.endLine)),
  };
}

function renderImportedFunction(state: RenderState, frame: DebugFrame, location: LocationI, defineAsm: string): RenderState {
  const headerRow = { asm: '', comment: `>>> function ${frame.name} (imported from ${frame.sourceFile})` };
  const sectionRows = buildFunctionSection(frame, location, defineAsm, frame.source!.split('\n'));

  // Blank rows around the section keep consecutive imported functions visually separated
  const previousRow = state.rows[state.rows.length - 1];
  const leadingBlankRows = previousRow === undefined || isBlankRow(previousRow) ? [] : [BLANK_ROW];

  return {
    rows: [...state.rows, ...leadingBlankRows, headerRow, ...sectionRows, BLANK_ROW],
    renderedLine: state.renderedLine,
  };
}

// Renders a function definition as a nested `<...>` push group (BitAuth IDE compiles a push group to the
// exact same bytes as the original body push), annotated with the function's own source code.
function buildFunctionSection(frame: DebugFrame, location: LocationI, defineAsm: string, sourceLines: string[]): Row[] {
  const bodyScript = bytecodeToScript(hexToBin(frame.bytecode));
  const { start, end } = location;

  if (end.line === start.line) {
    const asm = ['<', scriptToBitAuthAsm(bodyScript), '>', defineAsm].filter((part) => part !== '').join(' ');
    return [{ asm, comment: sourceLines[start.line - 1] }];
  }

  const bodyRows = walkScript({
    script: bodyScript,
    sourceMap: frame.sourceMap,
    sourceTags: frame.sourceTags,
    sourceLines,
    startLine: start.line + 1,
    endLine: end.line - 1,
    asmIndent: '  ',
  });

  return [
    { asm: '<', comment: sourceLines[start.line - 1] },
    ...bodyRows,
    { asm: `> ${defineAsm}`, comment: sourceLines[end.line - 1] },
  ];
}

// Comment-only rows for the source lines between the last rendered line and `throughLine`
function fillerRows(afterLine: number, throughLine: number, context: RenderContext): Row[] {
  return range(afterLine + 1, Math.min(throughLine, context.endLine))
    .filter((line) => !context.skipLines.has(line))
    .map((line) => ({ asm: '', comment: context.sourceLines[line - 1] }));
}

// The last source line above the contract's own opcodes; lines up to this limit (pragma, imports, blank
// lines) can only ever be rendered as filler
function deriveHeaderLineLimit(segments: Segment[]): number {
  const groupLines = segments.flatMap((segment) => (segment.kind === 'lineGroup' ? [segment.line] : []));
  return Math.min(...groupLines) - 1;
}

// Source lines of same-file functions are rendered by their function section, not as filler rows
function getLocalFunctionLines(frames: readonly DebugFrame[]): Set<number> {
  const lines = frames
    .filter((frame) => frame.source === undefined)
    .flatMap((frame) => {
      const { start, end } = parseFrameLocation(frame);
      return range(start.line, end.line);
    });

  return new Set(lines);
}

function parseFrameLocation(frame: DebugFrame): LocationI {
  return sourceMapToLocationData(frame.location)[0].location;
}

function isBlankRow(row: Row): boolean {
  return row.asm === '' && row.comment === '';
}

// --- Output rendering ---

function renderRows(rows: Row[]): string {
  const escapedRows = rows.map((row) => ({ asm: row.asm, comment: escapeCommentChars(row.comment) }));
  const maxAsmLength = Math.max(...escapedRows.map((row) => row.asm.length));
  const maxCommentLength = Math.max(...escapedRows.map((row) => row.comment.length));

  return escapedRows
    .map((row) => `${row.asm.padEnd(maxAsmLength)} /* ${row.comment.padEnd(maxCommentLength)} */`)
    .join('\n');
}

// --- Helpers ---

function getDisplayLine(singleLocation: SingleLocationData): number {
  const { location, positionHint } = singleLocation;
  return positionHint === PositionHint.END ? location.end.line : location.start.line;
}

function escapeCommentChars(text: string): string {
  return text.replaceAll('/*', '\\/*').replaceAll('*/', '*\\/');
}

// --- Source tag handling (annotations for compiler-injected opcodes) ---

// Where a tag's annotation row lands: the source lines rendered before it, and the indentation it gets
interface TagAnchor {
  fillThroughLine: number;
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

function deriveTagAnchor(
  tag: SourceTagEntry,
  tags: SourceTagEntry[],
  locationData: FullLocationData,
  sourceLines: string[],
): TagAnchor {
  if (PROLOGUE_KINDS.includes(tag.kind)) {
    const prologueTags = tags.filter((t) => PROLOGUE_KINDS.includes(t.kind));

    // The prologue is one contiguous opcode block at the function's start
    const lastPrologueOpcode = Math.max(...prologueTags.map((t) => t.endIndex));
    const firstBodyOpcode = lastPrologueOpcode + 1;
    const firstBodyLine = getDisplayLine(locationData[firstBodyOpcode]);

    // Filling through `firstBodyLine - 1` lands all the prologue annotations directly above the first
    // body statement, at its indentation.
    return {
      fillThroughLine: firstBodyLine - 1,
      indent: lineIndent(sourceLines, firstBodyLine),
    };
  }

  // Scope cleanup and loop-back condition tags always land right before the scope's closing brace.
  if (EPILOGUE_KINDS.includes(tag.kind)) {
    const braceLine = getDisplayLine(locationData[tag.startIndex]);
    return {
      fillThroughLine: braceLine - 1,
      indent: deriveIndent(locationData[tag.startIndex].location.start.line, sourceLines),
    };
  }

  return {
    fillThroughLine: getDisplayLine(locationData[Math.max(tag.startIndex - 1, 0)]),
    indent: deriveIndent(getDisplayLine(locationData[tag.startIndex]), sourceLines),
  };
}

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
