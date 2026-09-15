import {
  AuthenticationInstruction,
  AuthenticationProgramStackFrame,
  AuthenticationProgramStateCommon,
  binToHex,
  encodeAuthenticationInstructions,
  hexToBin,
} from '@bitauth/libauth';
import {
  Artifact,
  DebugEntry,
  DebugFrame,
  InlineRange,
  LogEntry,
  Op,
  RequireStatement,
  Script,
  bytecodeToScript,
  parseAndResolveInlineRanges,
  sourceMapToLocationData,
} from '@cashscript/utils';

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

export interface CallStackEntry {
  functionName?: string; // absent for the contract's own code
  sourceName: string;
  line: number;
  statement: string; // flattened to a single line for display
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

export const getActiveBytecode = (instructions: AuthenticationInstruction[]): string =>
  binToHex(encodeAuthenticationInstructions(instructions));

export const resolveFrame = (
  artifact: Artifact,
  step: AuthenticationProgramStateCommon,
): ResolvedFrame => resolveFrameByBytecode(artifact, getActiveBytecode(step.instructions));

// Only defined frames (id present) execute as standalone VM programs; an inlined callable's
// frame documents a body that only ever runs spliced into another program
const resolveFrameByBytecode = (artifact: Artifact, activeBytecode: string): ResolvedFrame => {
  const frame = (artifact.debug?.functions ?? [])
    .filter((candidate) => candidate.id !== undefined)
    .find((candidate) => candidate.bytecode === activeBytecode);

  return frame ? resolveDebugFrame(artifact, frame) : rootFrame(artifact);
};

const resolveDebugFrame = (artifact: Artifact, frame: DebugFrame): ResolvedFrame => ({
  sourceMap: frame.sourceMap,
  source: frame.source ?? artifact.source,
  sourceName: frame.sourceFile ?? `${artifact.contractName}.cash`,
  ipOffset: 0, // function bodies have no constructor-arg prefix; their ips start at 0
  requires: frame.requires,
  logs: frame.logs,
  inlineRanges: frame.inlineRanges,
  functionName: frame.name,
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
  const attributionStack = resolveInlineAttributionStack(artifact, containerFrame, entry, kind);
  return attributionStack[0];
};

// The chain of inlined callables containing the entry, from the innermost to the outermost
const resolveInlineAttributionStack = (
  artifact: Artifact,
  containerFrame: ResolvedFrame,
  entry: DebugEntry,
  kind: 'requires' | 'logs',
): InlineAttribution[] => {
  const range = parseAndResolveInlineRanges(containerFrame.inlineRanges, artifact.debug?.functions)
    .find((candidate) => entry.ip >= candidate.startIp && entry.ip <= candidate.endIp);
  if (!range) return [];

  const frameEntry = findMatchingFrameEntry(containerFrame[kind], range.frame[kind], range, entry);
  if (!frameEntry) return [];

  const frame = resolveDebugFrame(artifact, range.frame);

  // The callable may itself contain deeper inlined callables
  return [
    ...resolveInlineAttributionStack(artifact, frame, frameEntry, kind),
    { frame, entry: frameEntry },
  ];
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

export const buildCallStack = (
  artifact: Artifact,
  failingStep: AuthenticationProgramStateCommon,
  failingFrame: ResolvedFrame,
  requireStatement: RequireStatement,
  failingInstructionPointer: number,
): CallStackEntry[] => {
  // These entries represent any called inlined functions at the top of the call stack. These are handled separately,
  // because the failing debug step refers to the frameEntry below, so we manually need to handle "deeper" calls
  const inlineEntries = resolveInlineAttributionStack(artifact, failingFrame, requireStatement, 'requires')
    .map(({ frame, entry }) => toCallStackEntry(frame, entry.ip));

  // This entry is the actual VM-level failing function
  const frameEntry = toCallStackEntry(failingFrame, failingInstructionPointer);

  // These entries are the rest of the callstack, so all the intermediate (defined & inlined) functions that call
  // the VM-level failing function
  const runtimeCallers = failingStep.controlStack
    .filter(isAuthenticationProgramStackFrame)
    .reverse()
    .flatMap((controlFrame) => {
      const callerBytecode = getActiveBytecode(controlFrame.instructions);
      const callerFrame = resolveFrameByBytecode(artifact, callerBytecode);
      // The control frame stores the ip to resume at, which is one past the OP_INVOKE call site
      return expandRuntimeCaller(artifact, callerFrame, bytecodeToScript(hexToBin(callerBytecode)), controlFrame.ip - 1);
    });

  return [...inlineEntries, frameEntry, ...runtimeCallers];
};

const expandRuntimeCaller = (
  artifact: Artifact,
  frame: ResolvedFrame,
  script: Script,
  invokeIp: number,
): CallStackEntry[] => [
  ...resolveInlinedCallerHops(artifact, frame, script, invokeIp),
  toCallStackEntry(frame, invokeIp),
];

// Every defined function already gets expanded in buildCallStack, so this function exists to make sure any inlined
// callers also get added to the call stack
const resolveInlinedCallerHops = (
  artifact: Artifact,
  frame: ResolvedFrame,
  script: Script,
  invokeIp: number,
): CallStackEntry[] => {
  const inlineRange = parseAndResolveInlineRanges(frame.inlineRanges, artifact.debug?.functions)
    .find((candidate) => invokeIp >= candidate.startIp && invokeIp <= candidate.endIp);
  if (!inlineRange) return [];

  const frameScript = bytecodeToScript(hexToBin(inlineRange.frame.bytecode));
  const frameLocalIp = findMatchingFrameInvokeIp(script, frameScript, inlineRange, invokeIp);
  if (frameLocalIp === undefined) return [];

  // The invoke is expanded again within the callable, since deeper inlined callables may wrap it
  return expandRuntimeCaller(artifact, resolveDebugFrame(artifact, inlineRange.frame), frameScript, frameLocalIp);
};

// The container's n-th OP_INVOKE within the range corresponds to the n-th OP_INVOKE in the inlined
// callable's own bytecode, matching by position gives the invoke's exact frame-local ip.
const findMatchingFrameInvokeIp = (
  containerScript: Script,
  frameScript: Script,
  range: InlineRange,
  invokeIp: number,
): number | undefined => {
  const position = containerScript.slice(range.startIp, invokeIp).filter((op) => op === Op.OP_INVOKE).length;
  const frameInvokeIps = frameScript.flatMap((op, ip) => (op === Op.OP_INVOKE ? [ip] : []));
  return frameInvokeIps[position];
};

const isAuthenticationProgramStackFrame = (
  item: AuthenticationProgramStackFrame | boolean | number,
): item is AuthenticationProgramStackFrame => typeof item === 'object';

const toCallStackEntry = (frame: ResolvedFrame, instructionPointer: number): CallStackEntry => {
  const { lineNumber, statement } = getLocationDataForFrame(frame, instructionPointer);
  const flattenedStatement = statement.split('\n').map((line) => line.trim()).join(' ');

  return {
    functionName: frame.functionName,
    sourceName: frame.sourceName,
    line: lineNumber,
    statement: flattenedStatement,
  };
};

export const getLocationDataForFrame = (
  frame: ResolvedFrame,
  instructionPointer: number,
): { lineNumber: number, statement: string } => {
  const locationData = sourceMapToLocationData(frame.sourceMap);

  // We subtract the frame's ip offset (the constructor-arg prefix for the root frame, 0 for helper
  // frames) because those pushes are present in the evaluation (and thus the instruction pointer) but
  // not in the source code (and thus the location data).
  const modifiedInstructionPointer = instructionPointer - frame.ipOffset;

  const { location } = locationData[modifiedInstructionPointer];

  const failingLines = frame.source.split('\n').slice(location.start.line - 1, location.end.line);

  // Slice off the start and end of the statement's start and end lines to only return the failing part
  // Note that we first slice off the end, to avoid shifting the end column index
  failingLines[failingLines.length - 1] = failingLines[failingLines.length - 1].slice(0, location.end.column);
  failingLines[0] = failingLines[0].slice(location.start.column);

  const statement = failingLines.join('\n');
  const lineNumber = location.start.line;

  return { statement, lineNumber };
};
