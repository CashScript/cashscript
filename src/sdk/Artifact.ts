import { Ast } from '../compiler/ast/AST';
import { Type } from '../compiler/ast/Type';
import { Script } from '../compiler/generation/Script';
import * as pkg from '../../package.json';

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
  uninstantiatedScript: Script;
  source: string;
  networks: {
    [network: string]: {
      [address: string]: Script;
    };
  };
  compiler: {
    name: string;
    version: string;
  }
  updatedAt: string;
}

export function generateArtifact(ast: Ast, uninstantiatedScript: Script, source: string): Artifact {
  const { contract } = ast;
  const constructorInputs = contract.parameters.map(p => ({ name: p.name, type: p.type }));
  const abi = contract.functions.map(f => ({
    name: f.name,
    inputs: f.parameters.map(p => ({ name: p.name, type: p.type })),
  }));

  return {
    contractName: contract.name,
    constructorInputs,
    abi,
    uninstantiatedScript,
    source,
    networks: {},
    compiler: {
      name: 'cashc',
      version: `v${pkg.version}`,
    },
    updatedAt: new Date().toDateString(),
  };
}
