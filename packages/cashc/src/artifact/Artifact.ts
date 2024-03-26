import {
  Artifact, DebugInformation, Script, scriptToAsm,
} from '@cashscript/utils';
import { version } from '../index.js';
import { Ast } from '../ast/AST.js';

export function generateArtifact(ast: Ast, script: Script, source: string, debug: DebugInformation): Artifact {
  const { contract } = ast;

  const constructorInputs = contract.parameters
    .map((parameter) => ({ name: parameter.name, type: parameter.type.toString() }));

  const abi = contract.functions.map((func) => ({
    name: func.name,
    inputs: func.parameters.map((parameter) => ({
      name: parameter.name,
      type: parameter.type.toString(),
    })),
  }));

  const bytecode = scriptToAsm(script);

  return {
    contractName: contract.name,
    constructorInputs,
    abi,
    bytecode,
    source,
    debug,
    compiler: {
      name: 'cashc',
      version,
    },
    updatedAt: new Date().toISOString(),
  };
}

// strip verbose debug info from artifact for production use
export function stripArtifact(artifact: Artifact): Omit<Artifact, 'debug'> {
  delete artifact.debug;
  return artifact;
}
