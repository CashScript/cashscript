import { binToHex, hexToBin } from '@bitauth/libauth';
import {
  AbiFunction,
  Artifact,
  BytesType,
  encodeBool,
  encodeInt,
  encodeString,
  parseType,
  PrimitiveType,
} from '@cashscript/utils';
import { TypeError } from './Errors.js';
import SignatureTemplate from './SignatureTemplate.js';

export type ConstructorArgument = bigint | boolean | string | Uint8Array;
export type FunctionArgument = ConstructorArgument | SignatureTemplate;

export type EncodedConstructorArgument = Uint8Array;
export type EncodedFunctionArgument = Uint8Array | SignatureTemplate;

export type EncodeFunction = (arg: FunctionArgument, typeStr: string) => EncodedFunctionArgument;

export function encodeFunctionArgument(argument: FunctionArgument, typeStr: string): EncodedFunctionArgument {
  let type = parseType(typeStr);

  if (type === PrimitiveType.BOOL) {
    if (typeof argument !== 'boolean') {
      throw new TypeError(typeof argument, type);
    }
    return encodeBool(argument);
  }

  if (type === PrimitiveType.INT) {
    if (typeof argument !== 'bigint') {
      throw new TypeError(typeof argument, type);
    }
    return encodeInt(argument);
  }

  if (type === PrimitiveType.STRING) {
    if (typeof argument !== 'string') {
      throw new TypeError(typeof argument, type);
    }
    return encodeString(argument);
  }

  if (type === PrimitiveType.SIG && argument instanceof SignatureTemplate) return argument;

  // Convert hex string to Uint8Array
  if (typeof argument === 'string') {
    if (argument.startsWith('0x')) {
      argument = argument.slice(2);
    }

    argument = hexToBin(argument);
  }

  if (!(argument instanceof Uint8Array)) {
    throw Error(`Value for type ${type} should be a Uint8Array or hex string`);
  }

  // Redefine SIG as a bytes65 so it is included in the size checks below
  // Note that ONLY Schnorr signatures are accepted
  if (type === PrimitiveType.SIG && argument.byteLength !== 0) {
    type = new BytesType(65);
  }

  // Redefine DATASIG as a bytes64 so it is included in the size checks below
  // Note that ONLY Schnorr signatures are accepted
  if (type === PrimitiveType.DATASIG && argument.byteLength !== 0) {
    type = new BytesType(64);
  }

  // Bounded bytes types require a correctly sized argument
  if (type instanceof BytesType && type.bound && argument.byteLength !== type.bound) {
    throw new TypeError(`bytes${argument.byteLength}`, type);
  }

  return argument;
}

export const encodeConstructorArguments = (
  artifact: Artifact,
  constructorArgs: ConstructorArgument[],
  encodeFunction: EncodeFunction = encodeFunctionArgument,
): Uint8Array[] => {
  // Check there's no signature templates in the constructor
  if (constructorArgs.some((arg) => arg instanceof SignatureTemplate)) {
    throw new Error('Cannot use signatures in constructor');
  }

  const encodedArgs = constructorArgs
    .map((arg, i) => encodeFunction(arg, artifact.constructorInputs[i].type));

  return encodedArgs as Uint8Array[];
};

export const encodeFunctionArguments = (
  abiFunction: AbiFunction,
  functionArgs: FunctionArgument[],
  encodeFunction: EncodeFunction = encodeFunctionArgument,
): EncodedFunctionArgument[] => {
  const encodedArgs = functionArgs.map((arg, i) => encodeFunction(arg, abiFunction.inputs[i].type));

  return encodedArgs;
};

// This function replaces placeholders in the artifact bytecode with the encoded values of the provided parameters.
// A placeholder is a string in the format `<parameterName>` which is present in `bytecode` property.
// Signature templates are not supported in the bytecode replacement.
export const replaceArtifactPlaceholders = <T extends Artifact>(artifact: T, parameters: Record<string, FunctionArgument>): T => {
  // first, collect known ABI types
  const argumentTypes = [...artifact.constructorInputs, ...Object.values(artifact.abi).map(f => f.inputs).flat()].reduce((acc, input) => {
    acc[input.name] = input.type;
    return acc;
  }, {} as Record<string, string>);

  // then, replace placeholders in bytecode with known ABI types with a fallback to derived type or to bytes otherwise
  Object.entries(parameters).forEach(([key, value]) => {
    const primitiveType = argumentTypes[key] ?? getPrimitiveType(value) ?? PrimitiveType.ANY;
    if (primitiveType === PrimitiveType.SIG && value instanceof SignatureTemplate) {
      throw new Error(`Cannot use signature templates in bytecode replacement for artifact ${artifact.contractName}`);
    }

    artifact.bytecode = artifact.bytecode.replaceAll(`<${key}>`, binToHex(encodeFunctionArgument(value, argumentTypes[key] ?? getPrimitiveType(value) ?? PrimitiveType.ANY) as Uint8Array));
  });

  if (artifact.bytecode.includes('<')) {
    throw new Error(`Not all placeholders in artifact ${artifact.contractName} were replaced. Remaining placeholders: ${artifact.bytecode.match(/<[^>]+>/g)?.join(', ')}`);
  }

  return artifact;
};

const getPrimitiveType = (value: bigint | string | boolean | Uint8Array | SignatureTemplate): PrimitiveType | undefined => {
  if (typeof value === 'boolean') return PrimitiveType.BOOL;
  if (typeof value === 'bigint') return PrimitiveType.INT;
  if (typeof value === 'string') {
    if (value.startsWith('0x')) {
      return PrimitiveType.ANY;
    }
    return PrimitiveType.STRING;
  }
  if (value instanceof Uint8Array) {
    if (value.byteLength === 65) return PrimitiveType.SIG;
    if (value.byteLength === 64) return PrimitiveType.DATASIG;
    return PrimitiveType.ANY;
  }
  if (value instanceof SignatureTemplate) return PrimitiveType.SIG;
  return undefined;
}