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

```bash
Usage: cashc [options] [source_file]

Options:
  -V, --version        Output the version number.
  -o, --output <path>  Specify a file to output the generated artifact.
  -h, --hex            Compile the contract to hex format rather than a full artifact.
  -A, --asm            Compile the contract to ASM format rather than a full artifact.
  -c, --opcount        Display the number of opcodes in the compiled bytecode.
  -s, --size           Display the size in bytes of the compiled bytecode.
  -?, --help           Display help
```
