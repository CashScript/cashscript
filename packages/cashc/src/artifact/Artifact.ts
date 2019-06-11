import * as pjson from 'pjson';
import { Ast } from '../ast/AST';
import { Type } from '../ast/Type';
import { Script } from '../generation/Script';
import { Data } from '../util';

export interface AbiInput {
  name: string;
  type: Type;
}

export interface AbiFunction {
  name: string;
  inputs: AbiInput[];
}

export interface Artifact {
  contractName: string;
  constructorInputs: AbiInput[];
  abi: AbiFunction[];
  bytecode: string;
  source: string;
  networks: {
    [network: string]: {
      [address: string]: string;
    };
  };
  compiler: {
    name: string;
    version: string;
  }
  updatedAt: string;
}

export function generateArtifact(ast: Ast, script: Script, source: string): Artifact {
  const { contract } = ast;
  const constructorInputs = contract.parameters.map(p => ({ name: p.name, type: p.type }));
  const abi = contract.functions.map(f => ({
    name: f.name,
    inputs: f.parameters.map(p => ({ name: p.name, type: p.type })),
  }));

  const bytecode = Data.scriptToAsm(script);

  return {
    contractName: contract.name,
    constructorInputs,
    abi,
    bytecode,
    source,
    networks: {},
    compiler: {
      name: 'cashc',
      version: `v${pjson.version}`,
    },
    updatedAt: new Date().toISOString(),
  };
}
