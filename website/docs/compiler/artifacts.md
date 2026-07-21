---
title: Artifacts
---

Compiled contracts can be represented by so-called artifacts. These artifacts contain all information that is needed to interact with the smart contracts on-chain. Artifacts are stored in `.json` (or `.ts`) files so they can be shared and stored for later usage without having to recompile the contract.

:::tip Did you know?
Artifacts allow any third-party SDKs to be developed, since these SDKs only need to import and use an artifact file, while the compilation of the contract is left to the official `cashc` compiler.
:::

## Artifact specification
```typescript
interface Artifact {
  contractName: string // Contract name
  constructorInputs: AbiInput[] // Arguments required to instantiate a contract
  abi: AbiFunction[] // functions that can be called
  bytecode: string // Compiled Script without constructor parameters added (in ASM format)
  source: string // Source code of the CashScript contract
  compiler: {
    name: string // Compiler used to compile this contract
    version: string // Compiler version used to compile this contract
    options?: CompilerOptions // Compiler options used to compile this contract
  }
  debug?: {
    bytecode: string // unlike `bytecode` property above, this is a hex-encoded binary string
    sourceMap: string // see documentation for `generateSourceMap`
    logs: LogEntry[] // log entries generated from `console.log` statements
    requires: RequireStatement[] // messages for failing `require` statements
    sourceTags?: string // semantic tags for opcodes (e.g. loop update/condition ranges)
    functions?: DebugFrame[] // debug metadata for each global definition (defined frames first, then inlined ones)
  }
  updatedAt: string // Last datetime this artifact was updated (in ISO format)
  fingerprint?: string // SHA256 of the normalized bytecode pattern (BCH bytecode fingerprinting standard)
}

interface AbiInput {
  name: string // Input name
  type: string // Input type (see language documentation)
}

interface AbiFunction {
  name: string // Function name
  inputs: AbiInput[] // Function inputs / parameters
}

interface LogEntry {
  ip: number; // instruction pointer
  line: number; // line in the source code
  data: Array<StackItem | string>; // data to be logged
}

interface StackItem {
  type: string; // Type of the variable
  stackIndex: number; // Index of the variable on the stack
  ip: number; // Instruction pointer at which we can access the logged variable
  transformations?: string; // Transformations needed to obtain the logged item
}

interface RequireStatement {
  ip: number; // instruction pointer
  line: number; // line in the source code
  message?: string; // custom message for failing `require` statement
}

// Debug metadata for a global function or constant. Shared (OP_DEFINE'd) callables execute their
// body as a standalone VM function. Inlined callables have no define site or id — their body is
// emitted at every call site and their debug entries are merged into the containing program's own —
// but they are still listed with their compiled body and source provenance to document the callable.
interface DebugFrame {
  id?: number; // the function's id, as used with OP_DEFINE / OP_INVOKE in the bytecode (absent for inlined callables)
  name: string; // the source definition's name
  kind?: 'constant'; // present when the VM function implements a global constant; absent for regular functions
  inputs: AbiInput[]; // the function's parameters (name and type)
  bytecode: string; // hex-encoded bytecode of the function body (exactly what OP_DEFINE stores)
  sourceMap: string; // source map of the function body (instruction pointers starting from 0)
  sourceTags?: string; // semantic tags for opcodes within the function body
  source?: string; // full source code of the defining file (only present for imported functions)
  sourceFile?: string; // file name the function is imported from (absent for the contract's own file)
  logs: LogEntry[]; // log entries within the function body
  requires: RequireStatement[]; // messages for failing `require` statements within the function body
}

interface CompilerOptions {
  enforceFunctionParameterTypes?: boolean; // Enforce function parameter types (default: true)
  enforceLocktimeGuard?: boolean; // Enforce the tx.locktime guard (default: true)
  disableInlining?: boolean; // Keep global definitions as OP_DEFINE/OP_INVOKE (default: false)
}
```
