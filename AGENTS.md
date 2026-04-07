# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

CashScript is a high-level language for Bitcoin Cash smart contracts, consisting of a compiler (`cashc`), a TypeScript SDK (`cashscript`), and shared utilities (`@cashscript/utils`). It compiles `.cash` contract files into Bitcoin Cash bytecode artifacts.

## Common Commands

```bash
# Install all dependencies (also runs bootstrap + build)
yarn

# Build all packages (required after code changes to propagate across packages)
yarn build

# Run all tests (uses vitest)
yarn test

# Run tests for a single package
cd packages/cashc && yarn test
cd packages/utils && yarn test

# Run a specific test by name
yarn test -t 'test name from it/describe block'

# Run a single test file directly
yarn vitest run packages/utils/test/bitauth-script.test.ts

# Lint all packages
yarn lint

# Spellcheck
yarn spellcheck

# Regenerate ANTLR parser after grammar changes (from packages/cashc)
yarn antlr

# Run cashscript tests against real chipnet instead of mocknet
TESTS_USE_CHIPNET=true yarn test
```

## Architecture

### Monorepo Structure

Yarn workspaces + Lerna with three main packages:

- **`packages/cashc`** — Compiler: `.cash` source → artifact JSON
- **`packages/cashscript`** — SDK: load artifacts, build and send transactions
- **`packages/utils`** — Shared utilities used by both compiler and SDK

### Compiler Pipeline (`cashc`)

The compilation flow in `compiler.ts`:

1. **Lexing/Parsing** — ANTLR4 grammar (`src/grammar/CashScript.g4`) → parse tree
2. **AST Building** — `AstBuilder` converts parse tree → typed AST (`src/ast/`)
3. **Semantic Analysis** — Three traversals in order:
   - `SymbolTableTraversal` — resolve identifiers and scopes
   - `TypeCheckTraversal` — type checking
   - `EnsureFinalRequireTraversal` — validate contract structure
4. **Code Generation** — `GenerateTargetTraversal` (`src/generation/`) emits bytecode opcodes, source maps, console logs, requires, and source tags
5. **Optimization** — `optimiseBytecode` (`utils/src/script.ts`) applies peephole optimizations, adjusting source maps and metadata indices
6. **Artifact Generation** — produces the final JSON artifact with bytecode, ABI, debug info

The compiler uses the **visitor pattern** throughout — AST nodes accept traversals defined in `AstVisitor`/`AstTraversal`.

### SDK (`cashscript`)

- `Contract` — loads compiled artifacts, instantiates with constructor args
- `TransactionBuilder` — builds and signs Bitcoin Cash transactions
- Network providers: `ElectrumNetworkProvider`, `MockNetworkProvider`
- `src/libauth-template/` — integrates with `@bitauth/libauth` for transaction evaluation and debugging

### Utils (`@cashscript/utils`)

Shared between compiler and SDK:
- `artifact.ts` — artifact type definitions, `DebugInformation` structure
- `script.ts` — bytecode optimization, opcode manipulation
- `source-map.ts` — source map encoding/decoding (format: `sl:sc:el:ec:h` per opcode, `;`-separated, with field inheritance compression)
- `bitauth-script.ts` — formats bytecode as human-readable BitAuth script (used in debugging)
- `types.ts` — shared types including `SourceTagKind`, `SourceTagEntry`
- `optimisations.ts` / `cashproof-optimisations.ts` — peephole optimization rules

## Code Conventions

- **ESM modules** — all packages use ES modules; file extensions required in imports (e.g., `./foo.js`)
- **Max line length**: 125 characters (strings and template literals exempt)
- **Explicit return types** on functions (expressions exempt)
- **Keep nested code to a minimum** — use helper functions to keep code DRY and readable
- Prefer writing code in a way that reads top-down, from the main entry point to the leaves.
