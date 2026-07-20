import { hexToBin } from '@bitauth/libauth';
import { DebugFrame, DebugInformation } from './artifact.js';
import { encodeInt, range } from './data.js';
import { Op, Script, bytecodeToScript, scriptToBitAuthAsm } from './script.js';
import { parseSourceTags, sourceMapToLocationData } from './source-map.js';
import { FullLocationData, LocationI, PositionHint, SingleLocationData, SourceTagEntry, SourceTagKind } from './types.js';

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
  functions?: readonly DebugFrame[];
  sourceLines: string[];
  startLine: number;
  endLine: number;
  asmIndent: string;
}

function walkScript(params: WalkParams): Row[] {
  const segments = segmentScript(params);
  return renderSegments(segments, params);
}

interface LineGroupSegment {
  kind: 'lineGroup';
  asm: string;
  line: number;
}

interface AnnotationSegment {
  kind: 'annotation';
  asm: string;
  comment: string;
  insertAfterLine: number;
}

interface FunctionDefinitionSegment {
  kind: 'functionDefinition';
  frame: DebugFrame;
  location: LocationI;
}

type Segment = LineGroupSegment | AnnotationSegment | FunctionDefinitionSegment;

function segmentScript(params: WalkParams): Segment[] {
  const { script, sourceLines } = params;
  const locationData = sourceMapToLocationData(params.sourceMap);
  const tags = parseSourceTags(params.sourceTags ?? '');
  const frames = params.functions ?? [];

  const segments: Segment[] = [];
  let index = 0;

  while (index < script.length) {
    // Function definitions are always at the start of the script in sets of three: `<body> <id> OP_DEFINE` per frame
    if (index < frames.length * 3) {
      segments.push({ kind: 'functionDefinition', frame: frames[index / 3], location: locationData[index].location });
      index += 3;
      continue;
    }

    const tag = findTagAt(tags, index);
    if (tag) {
      segments.push(annotationSegment(script, tag, tags, locationData, sourceLines));
      index = tag.endIndex + 1;
      continue;
    }

    const endIndex = findLineGroupEnd(script, index, locationData, tags);
    segments.push({ kind: 'lineGroup', asm: scriptToBitAuthAsm(script.slice(index, endIndex)), line: getDisplayLine(locationData[index]) });
    index = endIndex;
  }

  return segments;
}

function annotationSegment(
  script: Script,
  tag: SourceTagEntry,
  tags: SourceTagEntry[],
  locationData: FullLocationData,
  sourceLines: string[],
): AnnotationSegment {
  const { insertAfterLine, indent } = deriveAnchor(tag, tags, locationData, sourceLines);

  return {
    kind: 'annotation',
    asm: scriptToBitAuthAsm(script.slice(tag.startIndex, tag.endIndex + 1)),
    comment: `${indent}${tagDescription(tag, locationData, sourceLines)}`,
    insertAfterLine,
  };
}

// A line group runs until the next opcode that belongs to a tagged range or maps to a different source line
function findLineGroupEnd(script: Script, start: number, locationData: FullLocationData, tags: SourceTagEntry[]): number {
  const line = getDisplayLine(locationData[start]);
  const nextBoundary = range(start + 1, script.length - 1).find((index) => (
    getDisplayLine(locationData[index]) !== line || findTagAt(tags, index) !== undefined
  ));

  return nextBoundary ?? script.length;
}

function findTagAt(tags: SourceTagEntry[], index: number): SourceTagEntry | undefined {
  return tags.find((tag) => index >= tag.startIndex && index <= tag.endIndex);
}

interface Row {
  asm: string;
  comment: string;
}

interface RenderState {
  rows: Row[];
  lastRenderedLine: number; // the last source line that has been rendered
}

type RenderContext = WalkParams & {
  functionSectionLines: Set<number>; // source lines rendered inside function sections, never as filler
};

const BLANK_ROW: Row = { asm: '', comment: '' };

function renderSegments(segments: Segment[], params: WalkParams): Row[] {
  const context: RenderContext = {
    ...params,
    functionSectionLines: deriveFunctionSectionLines(segments, params.sourceLines),
  };

  const initialState: RenderState = { rows: [], lastRenderedLine: params.startLine - 1 };
  const finalState = segments.reduce((state, segment) => renderSegment(state, segment, context), initialState);

  // After the last opcode, fill in the remaining source lines (e.g. the contract's closing braces)
  return [...finalState.rows, ...fillerRows(finalState.lastRenderedLine, params.endLine, context)];
}

function deriveFunctionSectionLines(segments: Segment[], sourceLines: string[]): Set<number> {
  const localFunctionSegments = segments.filter(
    (segment): segment is FunctionDefinitionSegment => segment.kind === 'functionDefinition' && segment.frame.source === undefined,
  );

  return new Set(localFunctionSegments.flatMap(({ location }) => {
    let lastLine = location.end.line;
    while (lastLine < sourceLines.length && sourceLines[lastLine].trim() === '') lastLine += 1;
    return range(location.start.line, lastLine);
  }));
}

function renderSegment(state: RenderState, segment: Segment, context: RenderContext): RenderState {
  if (segment.kind === 'functionDefinition') return renderFunctionDefinition(state, segment, context);
  if (segment.kind === 'annotation') return renderAnnotation(state, segment, context);
  return renderLineGroup(state, segment, context);
}

// The group's row renders its own source line, after filling in the opcode-less lines above it
function renderLineGroup(state: RenderState, segment: LineGroupSegment, context: RenderContext): RenderState {
  return {
    rows: [
      ...state.rows,
      ...fillerRows(state.lastRenderedLine, segment.line - 1, context),
      { asm: context.asmIndent + segment.asm, comment: context.sourceLines[segment.line - 1] },
    ],
    lastRenderedLine: advanceTo(state.lastRenderedLine, segment.line, context),
  };
}

// The `>>>` annotation row lands right after its anchor line
function renderAnnotation(state: RenderState, segment: AnnotationSegment, context: RenderContext): RenderState {
  return {
    rows: [
      ...state.rows,
      ...fillerRows(state.lastRenderedLine, segment.insertAfterLine, context),
      { asm: context.asmIndent + segment.asm, comment: segment.comment },
    ],
    lastRenderedLine: advanceTo(state.lastRenderedLine, segment.insertAfterLine, context),
  };
}

function renderFunctionDefinition(
  state: RenderState,
  segment: FunctionDefinitionSegment,
  context: RenderContext,
): RenderState {
  const { frame, location } = segment;
  const isImported = frame.sourceFile !== undefined;
  const sourceLines = isImported ? frame.source!.split('\n') : context.sourceLines;

  const headerRows = isImported
    ? [{ asm: '', comment: `>>> imported from ${frame.sourceFile}` }]
    : [];

  return {
    rows: [...state.rows, ...headerRows, ...buildFunctionSection(frame, location, sourceLines), BLANK_ROW],
    lastRenderedLine: state.lastRenderedLine,
  };
}

function buildFunctionSection(frame: DebugFrame, location: LocationI, sourceLines: string[]): Row[] {
  const bodyScript = bytecodeToScript(hexToBin(frame.bytecode));
  const defineAsm = scriptToBitAuthAsm([encodeInt(BigInt(frame.id)), Op.OP_DEFINE]);
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

function fillerRows(afterLine: number, throughLine: number, context: RenderContext): Row[] {
  return range(afterLine + 1, Math.min(throughLine, context.endLine))
    .filter((line) => !context.functionSectionLines.has(line))
    .map((line) => ({ asm: '', comment: context.sourceLines[line - 1] }));
}

function advanceTo(renderedLine: number, line: number, context: RenderContext): number {
  return Math.max(renderedLine, Math.min(line, context.endLine));
}

function renderRows(rows: Row[]): string {
  const escapedRows = rows.map((row) => ({ asm: row.asm, comment: escapeCommentChars(row.comment) }));
  const maxAsmLength = Math.max(...escapedRows.map((row) => row.asm.length));
  const maxCommentLength = Math.max(...escapedRows.map((row) => row.comment.length));

  return escapedRows
    .map((row) => `${row.asm.padEnd(maxAsmLength)} /* ${row.comment.padEnd(maxCommentLength)} */`)
    .join('\n');
}

function getDisplayLine(singleLocation: SingleLocationData): number {
  const { location, positionHint } = singleLocation;
  return positionHint === PositionHint.END ? location.end.line : location.start.line;
}

function escapeCommentChars(text: string): string {
  return text.replaceAll('/*', '\\/*').replaceAll('*/', '*\\/');
}

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

    // `insertAfterLine` of `firstBodyLine - 1` lands all the prologue annotations directly above the
    // first body statement, at its indentation.
    return {
      insertAfterLine: firstBodyLine - 1,
      indent: lineIndent(sourceLines, firstBodyLine),
    };
  }

  // Scope cleanup and loop-back condition tags always land right before the scope's closing brace.
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
