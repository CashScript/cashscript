# CashScript examples
This folder contains a number of example CashScript contracts to show off its functionality and usage. The `.cash` files contain example contracts, and the `.ts`/`.js` files contain example usage of the CashScript SDK with these contracts.

The "Hello World" of cash contracts is defining the P2PKH pattern inside a cash contract, which can be found under [`p2pkh.cash`](/examples/p2pkh.cash). Its usage can be found under [`p2pkh.ts`](/examples/p2pkh.ts). To showcase web usage of the CashScript SDK, the `p2pkh.cash` contract has also been integrated into a very simple React webapp under [`webapp`](/examples/webapp/).

## Running the examples
To run the examples, clone this repository and navigate to the `examples/` directory. Since the examples depend on the SDK, be sure to run `yarn` inside the `examples/` directory, which installs all required packages.

```bash
git clone git@github.com:Bitcoin-com/cashscript.git
cd cashscript/examples
yarn
```

All `.ts` files can then be executed with `ts-node`.

```bash
npm install -g ts-node
ts-node p2pkh.ts
```

All `.js` files can be executed with `node`.

```bash
node p2pkh.js
```

## Running the webapp example
The webapp example can be run from the `webapp/` folder.

```bash
yarn
yarn start
```

This will display a simple webapp that allows you to create a P2PKH contract from a specific seed phrase and use the contract to send BCH. The code can be found in [`webapp/src/App.ts`](/examples/webapp/src/App.ts). Note that the `.cash` file has to be read, and then passed into the CashScript SDK, rather than passing just the file path into the SDK.
