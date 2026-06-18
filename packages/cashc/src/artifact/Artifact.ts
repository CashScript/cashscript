import {
  Artifact, CompilerOptions, DebugInformation, Script, scriptToAsm,
} from '@cashscript/utils';
import { version } from '../index.js';
import { Ast } from '../ast/AST.js';

export function generateArtifact(
  ast: Ast,
  script: Script,
  source: string,
  debug: DebugInformation,
  compilerOptions: CompilerOptions,
  fingerprint: string,
): Artifact {
  const { contract } = ast;

  const constructorInputs = contract.parameters
    .map((parameter) => ({ name: parameter.name, type: parameter.type.toString() }));

  // User-defined (value-returning) functions are internal helpers compiled to OP_DEFINE/OP_INVOKE;
  // they are not spending paths and so are excluded from the ABI.
  const abi = contract.functions
    .filter((func) => !func.isUserFunction)
    .map((func) => ({
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
    fingerprint,
    debug,
    compiler: {
      name: 'cashc',
      version,
      options: compilerOptions,
    },
    updatedAt: new Date().toISOString(),
  };
}

// strip verbose debug info from artifact for production use
export function stripArtifact(artifact: Artifact): Omit<Artifact, 'debug'> {
  delete artifact.debug;
  return artifact;
}
