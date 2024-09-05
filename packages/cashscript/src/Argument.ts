import { hexToBin } from '@bitauth/libauth';
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
