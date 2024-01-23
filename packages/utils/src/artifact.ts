import fs, { PathLike } from 'fs';

export interface AbiInput {
  name: string;
  type: string;
}

export interface AbiFunction {
  name: string;
  covenant?: boolean;
  inputs: AbiInput[];
}

export interface DebugInformation {
  bytecode: string; // unlike `bytecode` property above, this is a hex-encoded binary string
  sourceMap: string; // see documentation for `generateSourceMap`
  logs: LogEntry[]; // log entries generated from `console.log` statements
  requireMessages: RequireMessage[]; // messages for failing `require` statements
}

export interface LogEntry {
  ip: number; // instruction pointer
  line: number; // line in the source code
  data: Array<{ stackIndex: number, type: string } | string>; // data to be logged
}

export interface RequireMessage {
  ip: number; // instruction pointer
  line: number; // line in the source code
  message: string; // custom message for failing `require` statement
}

export interface Artifact {
  contractName: string;
  constructorInputs: AbiInput[];
  abi: AbiFunction[];
  bytecode: string;
  source: string;
  debug?: DebugInformation;
  compiler: {
    name: string;
    version: string;
  }
  updatedAt: string;
}

export function importArtifact(artifactFile: PathLike): Artifact {
  return JSON.parse(fs.readFileSync(artifactFile, { encoding: 'utf-8' }));
}

export function exportArtifact(artifact: Artifact, targetFile: string): void {
  const jsonString = JSON.stringify(artifact, null, 2);
  fs.writeFileSync(targetFile, jsonString);
}
