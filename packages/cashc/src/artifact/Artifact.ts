import {
  Artifact, LogEntry, RequireMessage, Script, scriptToAsm, scriptToBytecode,
} from '@cashscript/utils';
import { version } from '../index.js';
import { Ast } from '../ast/AST.js';
import { binToHex } from '@bitauth/libauth';

export function generateArtifact(
  ast: Ast,
  script: Script,
  source: string,
  debug: {
    script: Script,
    sourceMap: string,
    logs: LogEntry[],
    requireMessages: RequireMessage[],
  },
): Artifact {
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
  const debugBytecode = binToHex(scriptToBytecode(debug.script));

  return {
    contractName: contract.name,
    constructorInputs,
    abi,
    bytecode,
    source,
    debug: {
      bytecode: debugBytecode,
      sourceMap: debug.sourceMap,
      logs: debug.logs,
      requireMessages: debug.requireMessages,
    },
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
