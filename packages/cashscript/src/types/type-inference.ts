import type SignatureTemplate from '../SignatureTemplate.js';

type BytesType = Uint8Array | string;
type SignatureType = SignatureTemplate | BytesType;

type TypeMap = {
  [k: `bytes${number}`]: BytesType; // Matches any "bytes<number>" pattern
} & {
  byte: BytesType;
  bytes: BytesType;
  bool: boolean;
  int: bigint;
  string: string;
  pubkey: BytesType;
  sig: SignatureType;
  datasig: BytesType;
};

// Helper type to process a single parameter by mapping its `type` to a value in `TypeMap`.
// Example: { type: "pubkey" } -> Uint8Array
// Branches:
// - If `Param` is a known type, it maps the `type` to `TypeMap[Type]`.
// - If `Param` has an unknown `type`, it defaults to `any`.
// - If `Param` is not an object with `type`, it defaults to `any`.
type ProcessParam<Param> = Param extends { type: infer Type }
  ? Type extends keyof TypeMap
    ? TypeMap[Type]
    : any
  : any;

// Main type to recursively convert an array of parameter definitions into a tuple.
// Example: [{ type: "pubkey" }, { type: "int" }] -> [Uint8Array, bigint]
// Branches:
// - If `Params` is a tuple with a `Head` that matches `ProcessParam`, it processes the head and recurses on the `Tail`.
// - If `Params` is an empty tuple, it returns [].
// - If `Params` is not an array or tuple, it defaults to any[].
export type ParamsToTuple<Params> = Params extends readonly [infer Head, ...infer Tail]
  ? [ProcessParam<Head>, ...ParamsToTuple<Tail>]
  : Params extends readonly []
    ? []
    : any[];

// Processes a single function definition into a function mapping with parameters and return type.
// Example: { name: "transfer", inputs: [{ type: "int" }] } -> { transfer: (arg0: bigint) => ReturnType }
// Branches:
// - Branch 1: If `Function` is an object with `name` and `inputs`, it creates a function mapping.
// - Branch 2: If `Function` does not match the expected shape, it returns an empty object.
type ProcessFunction<Function, ReturnType> = Function extends { name: string; inputs: readonly any[] }
  ? {
    [functionName in Function['name']]: (...functionParameters: ParamsToTuple<Function['inputs']>) => ReturnType;
  }
  : {};

// Recursively converts an ABI into a function map with parameter typings and return type.
// Example:
// [
//   { name: "transfer", inputs: [{ type: "int" }] },
//   { name: "approve", inputs: [{ type: "address" }, { type: "int" }] }
// ] ->
// { transfer: (arg0: bigint) => ReturnType; approve: (arg0: string, arg1: bigint) => ReturnType }
// Branches:
// - Branch 1: If `Abi` is `unknown` or `any`, return a default function map with generic parameters and return type.
// - Branch 2: If `Abi` is a tuple with a `Head`, process `Head` using `ProcessFunction` and recurse on the `Tail`.
// - Branch 3: If `Abi` is an empty tuple, return an empty object.
// - Branch 4: If `Abi` is not an array or tuple, return a generic function map.
type InternalAbiToFunctionMap<Abi, ReturnType> =
  // Check if Abi is typed as `any`, in which case we return a default function map
  unknown extends Abi
    ? GenericFunctionMap<ReturnType>
    : Abi extends readonly [infer Head, ...infer Tail]
      ? ProcessFunction<Head, ReturnType> & InternalAbiToFunctionMap<Tail, ReturnType>
      : Abi extends readonly []
        ? {}
        : GenericFunctionMap<ReturnType>;

type GenericFunctionMap<ReturnType> = { [functionName: string]: (...functionParameters: any[]) => ReturnType };

// Merge intersection type
// Example: {foo: "foo"} & {bar: "bar"} -> {foo: "foo", bar: "bar"}
type Prettify<T> = { [K in keyof T]: T[K] } & {};

export type AbiToFunctionMap<T, ReturnType> = Prettify<InternalAbiToFunctionMap<T, ReturnType>>;
