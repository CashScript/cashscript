import { Artifact, Script, scriptToAsm } from '@cashscript/utils';
import { version } from '..';
import { Ast } from '../ast/AST';

export function generateArtifact(ast: Ast, script: Script, source: string): Artifact {
  const { contract } = ast;

  const constructorInputs = contract.parameters
    .map((parameter) => ({ name: parameter.name, type: parameter.type.toString() }));

  const abi = contract.functions.map((func) => ({
    name: func.name,
    covenant: func.preimageFields.length > 0,
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
    compiler: {
      name: 'cashc',
      version,
    },
    updatedAt: new Date().toISOString(),
  };
}
