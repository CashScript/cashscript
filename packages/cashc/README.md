# CashScript

[![Build Status](https://travis-ci.org/Bitcoin-com/cashscript.svg)](https://travis-ci.org/Bitcoin-com/cashscript)
[![Coverage Status](https://img.shields.io/codecov/c/github/Bitcoin-com/cashscript.svg)](https://codecov.io/gh/Bitcoin-com/cashscript/)
[![NPM Version](https://img.shields.io/npm/v/cashscript.svg)](https://www.npmjs.com/package/cashscript)
[![NPM Monthly Downloads](https://img.shields.io/npm/dm/cashscript.svg)](https://www.npmjs.com/package/cashscript)
[![NPM License](https://img.shields.io/npm/l/cashscript.svg)](https://www.npmjs.com/package/cashscript)

CashScript is a high-level programming language for smart contracts on Bitcoin Cash. It offers a strong abstraction layer over Bitcoin Cash' native virtual machine, Bitcoin Script. Its syntax is based on Ethereum's smart contract language Solidity, but its functionality is very different since smart contracts on Bitcoin Cash differ greatly from smart contracts on Ethereum. For a detailed comparison of them, refer to the blog post [*Smart Contracts on Ethereum, Bitcoin and Bitcoin Cash*](https://kalis.me/smart-contracts-eth-btc-bch/).

See the [GitHub repository](https://github.com/Bitcoin-com/cashscript) and the [CashScript website](https://cashscript.org) for full documentation and usage examples.

## The CashScript Language
CashScript is a high-level language that allows you to write Bitcoin Cash smart contracts in a straightforward and familiar way. Its syntax is inspired by Ethereum's Solidity language, but its functionality is different since the underlying systems have very different fundamentals. See the [language documentation](https://cashscript.org/docs/language/) for a full reference of the language.

## The CashScript Compiler
CashScript features a compiler as a standalone command line tool, called `cashc`. It can be installed through npm and used to compile `.cash` files into `.json` artifact files. These artifact files can be imported into the CashScript JavaScript SDK (or other SDKs in the future). The `cashc` NPM package can also be imported inside JavaScript files to compile `.cash` files without using the command line tool.

### Installation
```bash
npm install -g cashc
```

### Usage
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
