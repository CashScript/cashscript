import {
  Artifact, CompilerOptions, DebugInformation, Script, VmTarget, scriptToAsm,
} from '@cashscript/utils';
import { version } from '../index.js';
import { Ast } from '../ast/AST.js';
import { UnsupportedTargetError } from '../Errors.js';
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

function resolveCompilerTarget(bytecode: string, compilerOptions: CompilerOptions): VmTarget | undefined {
  const inferredTarget = inferCompilerTarget(bytecode);

  if (
    inferredTarget === 'BCH_2026_05'
    && compilerOptions.target !== undefined
    && compilerOptions.target !== 'BCH_2026_05'
    && compilerOptions.target !== 'BCH_SPEC'
  ) {
    throw new UnsupportedTargetError(compilerOptions.target, inferredTarget);
  }

  return compilerOptions.target ?? inferredTarget;
}

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

  const abi = getPublicFunctions(contract.functions).map((func) => ({
    name: func.name,
    inputs: func.parameters.map((parameter) => ({
      name: parameter.name,
      type: parameter.type.toString(),
    })),
  }));

  const bytecode = scriptToAsm(script);
  const compilerTarget = resolveCompilerTarget(bytecode, compilerOptions);

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
      ...(compilerTarget !== undefined ? { target: compilerTarget } : {}),
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
