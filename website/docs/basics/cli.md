---
title: Command Line Interface
---

The `cashc` command line interface is used to compile CashScript `.cash` files into `.json` artifact files. These artifacts can be imported and used by the JavaScript SDK or other libraries / applications that use CashScript. For more information on this artifact format refer to [Artifacts](/docs/language/artifacts).

## Installation
You can use `npm` to install the `cashc` command line tool globally.

```bash
npm install -g cashc
```

## Usage
The `cashc` CLI tool can be used to compile `.cash` files to JSON artifact files.

```
Usage: cashc [options] [source_file]

Options:
  --output, -o   Specify a file to output the generated artifact.       [string]
  --hex, -h      Compile the contract to hex format rather than a full artifact
                                                                       [boolean]
  --asm, -A      Compile the contract to ASM format rather than a full artifact
                                                                       [boolean]
  --opcount, -c  Display the number of opcodes in the compiled bytecode[boolean]
  --size, -s     Display the size in bytes of the compiled bytecode    [boolean]
  --args, -a     List of constructor arguments to pass into the contract. Can
                 only be used in combination with either the --hex or --asm
                 flags. When compiling to a JSON artifact, contract
                 instantiation should be done through the CashScript SDK. Note
                 that NO type checking is performed by the cashc CLI, so it is
                 safer to use the CashScript SDK.                        [array]
  --help         Show help                                             [boolean]
  --version      Show version number                                   [boolean]
```
