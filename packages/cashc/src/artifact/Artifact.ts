import { Ast } from '../ast/AST';
import { Type } from '../ast/Type';
import { Script } from '../generation/Script';

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
      version: `v${process.env.npm_package_version}`,
    },
    updatedAt: new Date().toDateString(),
  };
}
