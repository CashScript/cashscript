---
title: Artifacts
---

Compiled contracts can be represented by so-called artifacts. These artifacts contain all information that is needed to interact with the smart contracts on-chain. Artifacts are stored in `.json` files so they can be shared and stored for later usage without having to recompile the contract.

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
```
