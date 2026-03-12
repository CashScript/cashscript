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
  abi: AbiFunction[] // Public functions that can be called from the SDK
  bytecode: string // Compiled Script without constructor parameters added (in ASM format)
  source: string // Source code of the CashScript contract
  compiler: {
    name: string // Compiler used to compile this contract
    version: string // Compiler version used to compile this contract
    target?: string // Optional VM target required by this artifact (e.g. BCH_2026_05)
    options?: CompilerOptions // Compiler options used to compile this contract
  }
  debug?: {
    bytecode: string // unlike `bytecode` property above, this is a hex-encoded binary string
    sourceMap: string // see documentation for `generateSourceMap`
    logs: LogEntry[] // log entries generated from `console.log` statements
    requires: RequireStatement[] // messages for failing `require` statements
  }
  updatedAt: string // Last datetime this artifact was updated (in ISO format)
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

interface CompilerOptions {
  enforceFunctionParameterTypes?: boolean; // Enforce function parameter types (default: true)
  internalFunctionPrefix?: string; // Optional custom prefix used to mark helper functions as internal
  target?: 'BCH_2023_05' | 'BCH_2025_05' | 'BCH_2026_05' | 'BCH_SPEC'; // Optional explicit VM target override recorded in the artifact metadata
}
```

:::note
By default, functions whose names end with `_` are excluded from the artifact ABI. They can still be called by other CashScript functions, but they are not exposed as public SDK entrypoints.
:::

:::note
Artifacts using BCH function opcodes record `compiler.target: 'BCH_2026_05'`. SDK integrations can use this to validate that their runtime/debug environment matches the contract's required VM semantics.
:::
