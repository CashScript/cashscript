import { version } from '..';
import { Ast } from '../ast/AST';
import { Script } from '../generation/Script';
import { Data } from '../util';

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

  const bytecode = Data.scriptToAsm(script);

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
