# CashScript Compiler (cashc)

[![Build Status](https://travis-ci.org/Bitcoin-com/cashscript.svg)](https://travis-ci.org/Bitcoin-com/cashscript)
[![Coverage Status](https://img.shields.io/codecov/c/github/Bitcoin-com/cashscript.svg)](https://codecov.io/gh/Bitcoin-com/cashscript/)
[![NPM Version](https://img.shields.io/npm/v/cashc.svg)](https://www.npmjs.com/package/cashc)
[![NPM Monthly Downloads](https://img.shields.io/npm/dm/cashc.svg)](https://www.npmjs.com/package/cashc)
[![NPM License](https://img.shields.io/npm/l/cashc.svg)](https://www.npmjs.com/package/cashc)

CashScript is a high level language enabling basic smart contract functionality on Bitcoin Cash. While these cash contracts are less powerful than Ethereum's smart contracts, CashScript was in many ways inspired by Ethereum's development ecosystem. Ethereum has always had one of the most accessible development ecosystems in terms of tooling, and with CashScript we want to bring that accessibility to Bitcoin Cash.

---

`cashc` can be used as an npm package, or as a standalone CLI tool. The npm package exposes functionality that is used to build libraries on top of `cashc`, and **should not be used for other purposes**. If you do want to build your own library on top of `cashc`, a full documentation is forthcoming, but if you want to integrate Cash Contracts into JavaScript or TypeScript projects, **you should use the [CashScript JavaScript SDK](https://www.npmjs.com/package/cashscript) instead**.

The rest of this README focuses on the standalone `cashc` CLI tool, which is used to compile Cash Contract files (`.cash`) into `.json` artifact files. These artifacts can be imported and used by any of the CashScript SDKs (the only existing SDK at the moment is the JavaScript SDK).

## Installation
You can use `npm` to install the `cashc` command line tool gloablly.
```bash
npm install -g cashc
```

## Usage
The `cashc` CLI tool can be used to compile `.cash` files to JSON artifact files.

```bash
Usage: cashc [options] [source_file]

Options:
  --output, -o  Specify a file to output the generated artifact.
                                                             [string] [required]
  --help        Show help                                              [boolean]
  --version     Show version number                                    [boolean]
```

## The CashScript Language
CashScript is a high-level language that allows you to write cash contracts in a straightforward and familiar way. It is inspired by Ethereum's Solidity, but it is not the same, and cash contracts work very differently from Ethereum's smart contracts. See the [Language Documentation](https://developer.bitcoin.com/cashscript/docs/language) for more information on the language itself.
