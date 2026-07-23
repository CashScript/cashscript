import { AuthenticationProgramStateCommon, binToHex, encodeAuthenticationInstructions } from '@bitauth/libauth';
import { Artifact, DebugEntry, DebugFrame, LogEntry, RequireStatement, parseInlineRanges } from '@cashscript/utils';

export interface ResolvedFrame {
  sourceMap: string;
  source: string;
  sourceName: string;
  ipOffset: number;
  requires: readonly RequireStatement[];
  logs: readonly LogEntry[];
  inlineRanges?: string;
  functionName?: string;
}

export const rootFrame = (artifact: Artifact): ResolvedFrame => ({
  sourceMap: artifact.debug?.sourceMap ?? '',
  source: artifact.source,
  sourceName: `${artifact.contractName}.cash`,
  ipOffset: artifact.constructorInputs.length,
  requires: artifact.debug?.requires ?? [],
  logs: artifact.debug?.logs ?? [],
  inlineRanges: artifact.debug?.inlineRanges,
});

export const getActiveBytecode = (step: AuthenticationProgramStateCommon): string =>
  binToHex(encodeAuthenticationInstructions(step.instructions));

export const resolveFrame = (
  artifact: Artifact,
  step: AuthenticationProgramStateCommon,
): ResolvedFrame => {
  // Only defined frames (id present) execute as standalone VM functions; an inlined callable's
  // frame documents a body that only ever runs spliced into another program
  const frames = (artifact.debug?.functions ?? []).filter((candidate) => candidate.id !== undefined);
  const activeBytecode = frames.length > 0 ? getActiveBytecode(step) : undefined;
  const frame = frames.find((candidate) => candidate.bytecode === activeBytecode);

  if (!frame) return rootFrame(artifact);

  return resolveDebugFrame(artifact, frame);
};

const resolveDebugFrame = (artifact: Artifact, frame: DebugFrame): ResolvedFrame => ({
  sourceMap: frame.sourceMap,
  source: frame.source ?? artifact.source,
  sourceName: frame.sourceFile ?? `${artifact.contractName}.cash`,
  ipOffset: 0, // function bodies have no constructor-arg prefix; their ips start at 0
  requires: frame.requires,
  logs: frame.logs,
  inlineRanges: frame.inlineRanges,
  functionName: frame.sourceFile ? frame.name : undefined,
});

export interface InlineAttribution {
  frame: ResolvedFrame; // the inlined callable, resolved like any other frame
  entry: DebugEntry; // the callable's own entry (frame-local ip and line)
}

export const resolveInlineAttribution = (
  artifact: Artifact,
  containerFrame: ResolvedFrame,
  entry: DebugEntry,
  kind: 'requires' | 'logs',
): InlineAttribution | undefined => {
  const range = parseInlineRanges(containerFrame.inlineRanges ?? '')
    .find((candidate) => entry.ip >= candidate.startIp && entry.ip <= candidate.endIp);
  if (!range) return undefined;

  const inlinedFrame = artifact.debug?.functions?.find((candidate) => candidate.name === range.frameName);
  if (!inlinedFrame) return undefined;

  const frameEntry = findMatchingFrameEntry(containerFrame[kind], inlinedFrame[kind], range, entry);
  if (!frameEntry) return undefined;

  const frame = resolveDebugFrame(artifact, inlinedFrame);

  // The callable may itself contain deeper inlined callables: attribute to the innermost one
  return resolveInlineAttribution(artifact, frame, frameEntry, kind) ?? { frame, entry: frameEntry };
};

// A log merged from an inlined callable is attributed to the callable's own source
export const attributeLogEntry = (
  artifact: Artifact,
  frame: ResolvedFrame,
  logEntry: LogEntry,
): { logEntry: LogEntry, sourceName: string } => {
  const inline = resolveInlineAttribution(artifact, frame, logEntry, 'logs');
  if (!inline) return { logEntry, sourceName: frame.sourceName };

  return {
    logEntry: { ...logEntry, line: inline.entry.line },
    sourceName: inline.frame.sourceName,
  };
};

const findMatchingFrameEntry = (
  containerEntries: readonly DebugEntry[],
  frameEntries: readonly DebugEntry[],
  range: { startIp: number, endIp: number },
  entry: DebugEntry,
): DebugEntry | undefined => {
  const entriesInRange = containerEntries.filter((candidate) => (
    candidate.ip >= range.startIp && candidate.ip <= range.endIp
  ));

  const position = entriesInRange.indexOf(entry);
  if (position === -1) return undefined;
  return frameEntries[position];
};
