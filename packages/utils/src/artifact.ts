import fs from 'fs';

export interface AbiInput {
  name: string;
  type: string;
}

export interface AbiFunction {
  name: string;
  covenant: boolean;
  inputs: AbiInput[];
}

export interface Artifact {
  contractName: string;
  constructorInputs: AbiInput[];
  abi: AbiFunction[];
  bytecode: string;
  source: string;
  compiler: {
    name: string;
    version: string;
  }
  updatedAt: string;
}

export function importArtifact(artifactFile: string): Artifact {
  return JSON.parse(fs.readFileSync(artifactFile, { encoding: 'utf-8' }));
}

export function exportArtifact(artifact: Artifact, targetFile: string): void {
  const jsonString = JSON.stringify(artifact, null, 2);
  fs.writeFileSync(targetFile, jsonString);
}
