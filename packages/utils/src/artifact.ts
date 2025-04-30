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
  }
  updatedAt: string;
}

export function formatArtifact(artifact: Artifact, format: 'json' | 'ts'): string {
  if (format === 'ts') {
    // We remove any undefined values to make the artifact serializable using stringifyAsTs
    const normalisedArtifact = JSON.parse(JSON.stringify(artifact));
    return `export default ${stringifyAsTs(normalisedArtifact)} as const;\n`;
  }

  return JSON.stringify(artifact, null, 2);
}

const indent = (level: number): string => '  '.repeat(level);

function stringifyAsTs(obj: any, indentationLevel: number = 1): string {
  // For strings, we use JSON.stringify, but we convert double quotes to single quotes
  if (typeof obj === 'string') {
    return JSON.stringify(obj).replace(/'/g, "\\'").replace(/"/g, "'");
  }

  // Numbers and booleans are just converted to strings
  if (typeof obj === 'number' || typeof obj === 'boolean') {
    return JSON.stringify(obj);
  }

  // Arrays are recursively formatted with indentation
  if (Array.isArray(obj)) {
    if (obj.length === 0) return '[]';
    const formattedItems = obj.map((item) => `${indent(indentationLevel)}${stringifyAsTs(item, indentationLevel + 1)}`);
    return `[\n${formattedItems.join(',\n')},\n${indent(indentationLevel - 1)}]`;
  }

  // Objects are recursively formatted with indentation
  if (typeof obj === 'object') {
    const entries = Object.entries(obj);

    if (entries.length === 0) return '{}';

    const formattedEntries = entries.map(([key, value]) => (
      `${indent(indentationLevel)}${key}: ${stringifyAsTs(value, indentationLevel + 1)}`
    ));
    return `{\n${formattedEntries.join(',\n')},\n${indent(indentationLevel - 1)}}`;
  }

  throw new Error(`Unsupported type: ${typeof obj}`);
}
