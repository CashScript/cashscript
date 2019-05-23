import { Ast } from '../ast/AST';
import { Type } from '../ast/Type';
import { Script } from '../generation/Script';

export interface AbiParameter {
  name: string;
  type: Type;
}

export interface AbiFunction {
  name: string;
  parameters: AbiParameter[];
}

export interface DeployedContract {
  redeemScript: (number | Buffer)[];
  hex: Buffer;
  address: string;
}

export interface Abi {
  name: string;
  constructorParameters: AbiParameter[];
  functions: AbiFunction[];
  uninstantiatedScript: Script;
  networks: {
    [network: string]: DeployedContract;
  }
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
  };
}
