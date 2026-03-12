import {
  Artifact, CompilerOptions, DebugInformation, Script, VmTarget, scriptToAsm,
} from '@cashscript/utils';
import { version } from '../index.js';
import { Ast } from '../ast/AST.js';
import { getPublicFunctions } from '../utils.js';

function normaliseCompilerOptions(compilerOptions: CompilerOptions): CompilerOptions {
  return Object.fromEntries(
    Object.entries(compilerOptions).filter(([key, value]) => {
      if (value === undefined) return false;
      if (key === 'target') return false;
      return true;
    }),
  );
}

function inferCompilerTarget(bytecode: string): VmTarget | undefined {
  const requiresBch2026 = [
    'OP_DEFINE',
    'OP_INVOKE',
  ].some((opcode) => bytecode.includes(opcode));

  return requiresBch2026 ? 'BCH_2026_05' : undefined;
}

export function generateArtifact(
  ast: Ast,
  script: Script,
  source: string,
  debug: DebugInformation,
  compilerOptions: CompilerOptions,
): Artifact {
  const { contract } = ast;

  const constructorInputs = contract.parameters
    .map((parameter) => ({ name: parameter.name, type: parameter.type.toString() }));

  const abi = getPublicFunctions(contract.functions, compilerOptions).map((func) => ({
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
    debug,
    compiler: {
      name: 'cashc',
      version,
      ...(compilerOptions.target !== undefined
        ? { target: compilerOptions.target }
        : inferCompilerTarget(bytecode) !== undefined
          ? { target: inferCompilerTarget(bytecode) }
          : {}),
      options: normaliseCompilerOptions(compilerOptions),
    },
    updatedAt: new Date().toISOString(),
  };
}

// strip verbose debug info from artifact for production use
export function stripArtifact(artifact: Artifact): Omit<Artifact, 'debug'> {
  delete artifact.debug;
  return artifact;
}
