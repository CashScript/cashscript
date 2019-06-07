# CashScript

[![Build Status](https://travis-ci.org/Bitcoin-com/cashscript.svg)](https://travis-ci.org/Bitcoin-com/cashscript)
[![Coverage Status](https://img.shields.io/codecov/c/github/Bitcoin-com/cashscript.svg)](https://codecov.io/gh/Bitcoin-com/cashscript/)
![GitHub](https://img.shields.io/github/license/Bitcoin-com/cashscript.svg)

CashScript is a high level language enabling basic smart contract functionality on Bitcoin Cash. We love the Ethereum development ecosystem, and with CashScript we want to bring part of that workflow into the Bitcoin Cash ecosystem.

CashScript is in active development, and a `beta` release is coming soon. While CashScript is in `beta` stage, its APIs and usage is subject to change, so be sure to check the documentation.

## Installation
A `beta` npm release is coming soon™ (second week of June), which will allow the CashScript SDK to be installed through `yarn` or `npm`:

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
const { ... } = require('cashscript);
```

## The CashScript Language
CashScript is a high-level language that allows you to write cash contracts in a straightforward and familiar way. It is inspired by Ethereum's Solidity, but it is not the same, and cash contracts work very differently from Ethereum's smart contracts. See the [Language documentation](/docs/language.md) for a full reference.

## The CashScript SDK
The CashScript SDK allows you to easily integrate cash contracts written with CashScript into your JavaScript or TypeScript applications. It allows you to compile contracts, instantiate them, and use their functions as defined in the `.cash` file. See the [SDK documentation](/docs/sdk.md) for a full reference.

## Examples
If you want to see CashScript in action and check out its usage, there are several example contracts in the [`examples/`](/examples) directory. The `.cash` files contain example contracts, and the `.ts` files contain example usage of the CashScript SDK to interact with these contracts.

The "Hello World" of cash contracts is defining the P2PKH pattern inside a cash contract, which can be found under [`examples/p2pkh.cash`](/examples/p2pkh.cash). Its usage can be found under [`examples/p2pkh.ts`](/examples/p2pkh.ts) or [`examples/p2pkh-abi.ts`](/examples/p2pkh-abi.ts).

Note that not all of these examples have been tested to work, and are also still a work in progress.

### Running the examples
All `.ts` files in the [`examples/`](/examples) directory can be easily executed with `ts-node`.

```
npm install -g ts-node
ts-node examples/p2pkh.ts
```
