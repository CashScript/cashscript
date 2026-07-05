export interface CompilerOptions {
  enforceFunctionParameterTypes?: boolean;
  enforceLocktimeGuard?: boolean;
  // Reschedule straight-line stack code from its dataflow DAG after bytecode optimisation,
  // so operands are computed onto the top of the stack instead of fetched from variable
  // slots with `<depth> OP_PICK/OP_ROLL`, and choose each user function's argument-arrival
  // order jointly with its schedule (see stack-rescheduling.ts). Candidates are ranked by
  // the `optimizeFor` objective; per block the compiler keeps min(original, rescheduled),
  // function bodies are differentially tested on a VM against the plain compile. Off by
  // default: rescheduled regions keep only statement-level debug info (each emitted
  // opcode maps to its block's merged source span). Single-function contracts only.
  rescheduleStacks?: boolean;
  // The optimisation objective for decisions that trade bytecode size against op-cost.
  // 'size' minimises bytecode bytes (e.g. binds a literal repeated within one function body to a
  // local, so later uses are ~2-byte stack picks instead of repeated pushes: ~-30 bytes per
  // duplicate of a 32-byte constant, ~+2 ops per execution of the binding). 'opcost' (the
  // default) minimises executed op-cost instead — right for op-bound contracts, whose unlocking
  // scripts are zero-padded to buy op budget, making byte savings free and extra ops pure cost.
  optimizeFor?: OptimizationTarget;
}

export type OptimizationTarget = 'size' | 'opcost';

export interface AbiInput {
  name: string;
  type: string;
}

export interface AbiFunction {
  name: string;
  inputs: readonly AbiInput[];
}

export interface DebugInformation {
  bytecode: string; // unlike `bytecode` property above, this is a hex-encoded binary string
  sourceMap: string; // see documentation for `generateSourceMap`
  logs: readonly LogEntry[]; // log entries generated from `console.log` statements
  requires: readonly RequireStatement[]; // messages for failing `require` statements
  sourceTags?: string; // semantic tags for opcodes (e.g. loop update/condition ranges)
  functions?: readonly DebugFrame[]; // Debug metadata for each global definition (defined frames first, then inlined ones)
  inlineRanges?: string; // runs where inlined callables' bodies were emitted (see `generateInlineRanges`)
}

export interface DebugFrame {
  id?: number; // the function's id, as used with OP_DEFINE and OP_INVOKE in the bytecode; absent for inlined callables
  name: string; // the function/constant's name
  kind?: 'constant'; // present when the VM function is the lowered form of a global constant; absent for regular functions
  inputs: readonly AbiInput[]; // the function's parameters (name and type), mirroring the ABI; for reference
  bytecode: string; // hex of the function body bytecode (exactly what OP_DEFINE stores and the VM runs)
  sourceMap: string; // frame-local source map (ips starting from 0)
  sourceTags?: string; // frame-local semantic tags for opcodes (e.g. loop update/condition ranges)
  source?: string; // full text of the defining file; absent means the function lives in the contract's own source file
  sourceFile?: string; // originating file name for imported functions; absent means the contract's file
  logs: readonly LogEntry[]; // frame-local log entries
  requires: readonly RequireStatement[]; // frame-local require statements
  inlineRanges?: string; // runs where inlined callables' bodies were emitted within this body (frame-local ips)
}

export interface InlineRange {
  startIp: number; // first ip of the emitted body (inclusive)
  endIp: number; // last ip of the emitted body (inclusive)
  frame: DebugFrame; // the inlined callable's debug frame
}

export interface LogEntry {
  ip: number; // instruction pointer
  line: number; // line in the source code
  data: readonly LogData[]; // data to be logged
}

export interface StackItem {
  // Type of the variable
  type: string;
  // Index of the variable on the stack (at the time of the specified instruction pointer)
  stackIndex: number;
  // Instruction pointer at which we can access the logged variable
  ip: number;
  // Operations to apply to the debug state at the specified instruction pointer to make sure that the variable is
  // on the correct position on the stack. This is used when we're optimising bytecode where the logged variable is
  // an intermediate result that existed in the unoptimised bytecode, but no longer exists in the optimised bytecode.
  transformations?: string;
}

export type LogData = StackItem | string;

export interface RequireStatement {
  ip: number; // instruction pointer
  line: number; // line in the source code
  message?: string; // custom message for failing `require` statement
}

// Any debug entry that lives at an instruction pointer and attributes to a source line
export type DebugEntry = RequireStatement | LogEntry;

export interface Artifact {
  contractName: string;
  constructorInputs: readonly AbiInput[];
  abi: readonly AbiFunction[];
  bytecode: string;
  source: string;
  debug?: DebugInformation;
  compiler: {
    name: string;
    version: string;
    options?: CompilerOptions;
  }
  updatedAt: string;
  fingerprint?: string; // SHA256 of the normalized bytecode pattern (BCH bytecode fingerprinting standard)
}

export function formatArtifact(artifact: Artifact, format: 'json' | 'ts'): string {
  if (format === 'ts') {
    // We remove any undefined values to make the artifact serializable
    const normalisedArtifact = JSON.parse(JSON.stringify(artifact));
    return `export default ${stringify(normalisedArtifact, 'ts')} as const;\n`;
  }

  return stringify(artifact, 'json');
}

const indent = (level: number): string => '  '.repeat(level);

// Objects with this many or more properties are always expanded onto multiple lines, to keep
// generated `.artifact.ts` files compliant with the `object-curly-newline` lint rule (minProperties: 4)
const MAX_INLINE_OBJECT_PROPERTIES = 3;

// Recursively serialises an artifact to JSON or TS. Small records that are elements of an array
// (e.g. `requires`, `constructorInputs`, `abi` inputs) are kept on a single line so list-like data
// stays compact, while standalone objects assigned to a property (e.g. `compiler.options`) keep
// their values expanded one per line.
function stringify(
  obj: any,
  format: 'json' | 'ts',
  indentationLevel: number = 1,
  isArrayElement: boolean = false,
): string {
  if (typeof obj === 'string') return formatString(obj, format);

  // Numbers, booleans and null are represented identically in JSON and TS
  if (obj === null || typeof obj === 'number' || typeof obj === 'boolean') {
    return JSON.stringify(obj);
  }

  if (Array.isArray(obj)) return formatArray(obj, format, indentationLevel, isArrayElement);

  if (typeof obj === 'object') return formatObject(obj, format, indentationLevel, isArrayElement);

  throw new Error(`Unsupported type: ${typeof obj}`);
}

function formatString(value: string, format: 'json' | 'ts'): string {
  // JSON strings use standard double-quoted escaping
  if (format === 'json') return JSON.stringify(value);

  // TS strings use single quotes instead of double quotes around string values, to match regular TS style
  return `'${JSON.stringify(value).replace(/'/g, "\\'").replace(/\\"/g, '"').slice(1, -1)}'`;
}

function formatArray(
  array: readonly any[],
  format: 'json' | 'ts',
  indentationLevel: number,
  isArrayElement: boolean,
): string {
  if (array.length === 0) return '[]';

  const items = array.map((item) => stringify(item, format, indentationLevel + 1, true));

  if (isArrayElement && canInline(array)) return `[${items.join(', ')}]`;

  const lines = items.map((item) => `${indent(indentationLevel)}${item}`).join(',\n');
  const trailingComma = format === 'ts' ? ',' : '';
  return `[\n${lines}${trailingComma}\n${indent(indentationLevel - 1)}]`;
}

function formatObject(
  obj: any,
  format: 'json' | 'ts',
  indentationLevel: number,
  isArrayElement: boolean,
): string {
  const entries = Object.entries(obj).filter(([, value]) => value !== undefined);

  if (entries.length === 0) return '{}';

  const formatKey = (key: string): string => (format === 'json' ? JSON.stringify(key) : key);
  const formatted = entries.map(
    ([key, value]) => `${formatKey(key)}: ${stringify(value, format, indentationLevel + 1)}`,
  );

  if (isArrayElement && entries.length <= MAX_INLINE_OBJECT_PROPERTIES && canInline(obj)) {
    return `{ ${formatted.join(', ')} }`;
  }

  const lines = formatted.map((entry) => `${indent(indentationLevel)}${entry}`).join(',\n');
  const trailingComma = format === 'ts' ? ',' : '';
  return `{\n${lines}${trailingComma}\n${indent(indentationLevel - 1)}}`;
}

// A container can be inlined when none of its values are themselves a non-empty object or array
function canInline(container: any): boolean {
  const values = Array.isArray(container) ? container : Object.values(container);
  return values.every((value) => (
    value === undefined || value === null || typeof value !== 'object' || Object.keys(value).length === 0
  ));
}
