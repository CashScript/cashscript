import { Artifact, Script, scriptToAsm } from '@cashscript/utils';
import { version } from '../index.js';
import { Ast } from '../ast/AST.js';

export function generateArtifact(
    ast: Ast,
    script: Script,
    source: string,
    debugScript: Script,
    sourceMap: string
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
  const debugBytecode = scriptToAsm(debugScript);

  return {
    contractName: contract.name,
    constructorInputs,
    abi,
    bytecode,
    source,
    debug: {
      bytecode: debugBytecode,
      sourceMap: sourceMap,
      logs: [],
    },
    compiler: {
      name: 'cashc',
      version,
    },
    updatedAt: new Date().toISOString(),
  };
}
