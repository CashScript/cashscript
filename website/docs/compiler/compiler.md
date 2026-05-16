---
title: Compiler
---

The CashScript compiler is called `cashc` and is used to compile CashScript `.cash` contract files into `.json` (or `.ts`) artifact files.
These artifact files can be used to instantiate a CashScript contract with the help of the CashScript SDK. For more information on this artifact format refer to [Artifacts](/docs/compiler/artifacts).

:::info
Because of the separation of the compiler and the SDK, CashScript contracts can be integrated into other programming languages in the future.
:::

## Command Line Interface

The `cashc` command line interface is used to compile CashScript `.cash` files into `.json` (or `.ts`) artifact files.

### Installation
You can use `npm` to install the `cashc` command line tool globally.

```bash
npm install -g cashc
```

### CLI Usage
The `cashc` CLI tool can be used to compile `.cash` files to JSON (or `.ts`) artifact files.

```bash
Usage: cashc [options] <source_file>

Arguments:
  source_file                                  The source file to compile.

Options:
  -V, --version                                Output the version number.
  -o, --output <path>                          Specify a file to output the generated artifact.
  -h, --hex                                    Compile the contract to hex format rather than a full artifact.
  -A, --asm                                    Compile the contract to ASM format rather than a full artifact.
  -c, --opcount                                Display the number of opcodes in the compiled bytecode.
  -s, --size                                   Display the size in bytes of the compiled bytecode.
  -S, --skip-enforce-function-parameter-types  Do not enforce function parameter types.
  -L, --skip-enforce-locktime-guard            Do not inject a tx.time guard when tx.locktime is used.
  -f, --format <format>                        Specify the format of the output. (choices: "json", "ts", default: "json")
  -?, --help                                   Display help
```

:::tip
To have the best TypeScript integration, we recommend generating the artifact in the `.ts` format and importing it into your TypeScript project from that `.ts` file.
:::

#### Example
```bash
cashc ./Contract.cash --output ./artifact.ts --format ts
```

```bash
cashc ./Contract.cash --size --opcount
```

:::info
The size outputs of the `cashc` compiler are based on the bytecode without constructor arguments. This means they are always an underestimate, as the contract hasn't been initialized with contract arguments.
:::

## JavaScript Compilation
Generally CashScript contracts are compiled to an Artifact JSON file using the CLI compiler. As an alternative to this, CashScript contracts can be compiled from within JavaScript apps using the `cashc` package. This package exports two compilation functions.

```bash
npm install cashc
```

### compileFile()
```ts
compileFile(sourceFile: PathLike, compilerOptions?: CompilerOptions): Artifact
```

Compiles a CashScript contract from a source file. This compile method is handy when using Node.js with the contract source file available but you are doing quick compilations (for example for contract size comparisons) and you don't need the contract artifact file to be generated.

:::note
`compileFile()` only works from a Node.js context because it uses the file-system so it's not available in browser setting.
:::

#### Example
```ts
const P2PKH = compileFile(new URL('p2pkh.cash', import.meta.url));
```

### compileString()
```ts
compileString(sourceCode: string, compilerOptions?: CompilerOptions): Artifact
```

Compiles a CashScript contract from a source code string. This compile method is handy in a browser compilation setting like the [CashScript Playground](https://playground.cashscript.org/) where testing contracts can be quickly compiled and discarded. The method is also useful if no source file is locally available (e.g. the source code is retrieved with a REST API).

```ts
const baseUrl = 'https://raw.githubusercontent.com/CashScript/cashscript'
const result = await fetch(`${baseUrl}/master/examples/p2pkh.cash`);
const source = await result.text();

const P2PKH = compileString(source);
```

### Compiler Options
```ts
interface CompilerOptions {
  enforceFunctionParameterTypes?: boolean;
}
```

The `enforceFunctionParameterTypes` option is used to enforce function parameter types, such as byte length of `bytes20` or `bytes32` types and `bool` values. By default, it is set to `true`.

If set to `false`, the compiler will not enforce function parameter types. This means that it is possible for `bytes20` values to have a different length at runtime than the expected 20 bytes. Or that `bool` values are not actually booleans, but integers.

This option is useful if you are certain that passing in incorrect function parameter types will not cause runtime vulnerabilities, and you want to save on the extra opcodes that are added to the script to enforce the types.
