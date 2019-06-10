# CashScript

[![Build Status](https://travis-ci.org/Bitcoin-com/cashscript.svg)](https://travis-ci.org/Bitcoin-com/cashscript)
[![Coverage Status](https://img.shields.io/codecov/c/github/Bitcoin-com/cashscript.svg)](https://codecov.io/gh/Bitcoin-com/cashscript/)
[![NPM Version](https://img.shields.io/npm/v/cashscript.svg)](https://www.npmjs.com/package/cashscript)
[![NPM Monthly Downloads](https://img.shields.io/npm/dm/cashscript.svg)](https://www.npmjs.com/package/cashscript)
[![NPM License](https://img.shields.io/npm/l/cashscript.svg)](https://www.npmjs.com/package/cashscript)

CashScript is a high level language enabling basic smart contract functionality on Bitcoin Cash. We love the Ethereum development ecosystem, and with CashScript we want to bring part of that workflow into the Bitcoin Cash ecosystem.

**Attention:** CashScript is in active development, and is currently in a `beta` phase. While CashScript is in `beta` stage, its APIs and usage is subject to change, so be sure to check the documentation. During the `beta` phase it is possible that the library still contains bugs, so for now the CashScript SDK can only be used on the `testnet` network.

## Installation
The CashScript SDK can be installed through `yarn` or `npm`:

```bash
yarn add cashscript
```
```bash
npm install cashscript
```

From here it can be imported into your TypeScript or JavaScript projects:

```ts
import { ... } from 'cashscript';
```

```js
const { ... } = require('cashscript');
```

## The CashScript Language
CashScript is a high-level language that allows you to write Cash Contracts in a straightforward and familiar way. It is inspired by Ethereum's Solidity, but it is not the same, and cash contracts work very differently from Ethereum's smart contracts. See the [Language documentation](/docs/language.md) for a full reference of the language.

## The CashScript SDK
The CashScript SDK allows you to easily integrate cash contracts written with CashScript into your JavaScript or TypeScript applications. It allows you to compile contracts, instantiate them, and use their functions as defined in the `.cash` file. See the [SDK documentation](/docs/sdk.md) for a full reference of the SDK.

## Examples
If you want to see CashScript in action and check out its usage, there are several example contracts in the [`examples/`](/examples) directory. The `.cash` files contain example contracts, and the `.ts` files contain example usage of the CashScript SDK to interact with these contracts.

The "Hello World" of cash contracts is defining the P2PKH pattern inside a cash contract, which can be found under [`examples/p2pkh.cash`](/examples/p2pkh.cash). Its usage can be found under [`examples/p2pkh.ts`](/examples/p2pkh.ts) or [`examples/p2pkh-artifact.ts`](/examples/p2pkh-artifact.ts).

Note that not all of these examples have been tested to work, and are also still a work in progress.

### Running the examples
To run the examples, clone this repository and navigate to the `examples/` directory. Since the examples depend on the SDK, be sure to run `npm install` or `yarn` inside the `examples/` directory, which installs all required packages.

```bash
git clone git@github.com:Bitcoin-com/cashscript.git
cd cashscript/examples
yarn / npm install
```

All `.ts` files in the [`examples/`](/examples) directory can then be executed with `ts-node`.

```bash
npm install -g ts-node
ts-node p2pkh.ts
```

All `.js` files can be executed with `node`.

```bash
node p2pkh.js
```
