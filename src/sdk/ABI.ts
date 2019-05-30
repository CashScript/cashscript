import { Ast } from '../compiler/ast/AST';
import { Type } from '../compiler/ast/Type';
import { Script } from '../compiler/generation/Script';

export interface AbiParameter {
  name: string;
  type: Type;
}

export interface AbiFunction {
  name: string;
  parameters: AbiParameter[];
}

export interface Abi {
  name: string;
  constructorParameters: AbiParameter[];
  functions: AbiFunction[];
  uninstantiatedScript: Script;
  networks: {
    [network: string]: {
      [address: string]: Script;
    };
  };
  compilerVersion: string;
}

export function generateAbi(ast: Ast, script: Script): Abi {
  const { contract } = ast;
  const parameters = contract.parameters.map(p => ({ name: p.name, type: p.type }));
  const functions = contract.functions.map(f => ({
    name: f.name,
    parameters: f.parameters.map(p => ({ name: p.name, type: p.type })),
  }));

  return {
    name: contract.name,
    constructorParameters: parameters,
    functions,
    uninstantiatedScript: script,
    networks: {},
    compilerVersion: 'v0.1.0-alpha.0',
  };
}
