import fs, { PathLike } from 'fs';

export interface AbiInput {
  name: string;
  type: string;
}

export interface AbiFunction {
  name: string;
  covenant?: boolean;
  inputs: readonly AbiInput[];
}

export interface Artifact {
  contractName: string;
  constructorInputs: readonly AbiInput[];
  abi: readonly AbiFunction[];
  bytecode: string;
  source: string;
  compiler: {
    name: string;
    version: string;
  }
  updatedAt: string;
}

export function importArtifact(artifactFile: PathLike): Artifact {
  return JSON.parse(fs.readFileSync(artifactFile, { encoding: 'utf-8' }));
}

export function exportArtifact(artifact: Artifact, targetFile: string, format: 'json' | 'ts'): void {
  const jsonString = formatArtifact(artifact, format);
  fs.writeFileSync(targetFile, jsonString);
}

export function formatArtifact(artifact: Artifact, format: 'json' | 'ts'): string {
  if (format === 'ts') {
    return `export default ${stringifyAsTs(artifact)} as const;\n`;
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
