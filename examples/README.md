# CashScript examples
This folder contains a number of example CashScript contracts to show off its functionality and usage. The `.cash` files contain example contracts, and the `.ts`/`.js` files contain example usage of the CashScript SDK with these contracts.

The "Hello World" of cash contracts is defining the P2PKH pattern inside a cash contract, which can be found under [`p2pkh.cash`](/examples/p2pkh.cash). Its usage can be found under [`p2pkh.ts`](/examples/p2pkh.ts).

For BCH internal functions compiled via `OP_DEFINE` / `OP_INVOKE`, see [`helper-functions.cash`](/examples/helper-functions.cash) and [`helper-functions.ts`](/examples/helper-functions.ts). This example is specific to the BCH functions proposal and configures the mock provider for `BCH_2026_05`.

## Running the examples
To run the examples, clone this repository and navigate to the `examples/` directory. Since the examples depend on the SDK, be sure to run `yarn` inside the `examples/` directory, which installs all required packages.

```bash
git clone git@github.com:CashScript/cashscript.git
cd cashscript/examples
yarn
```

All `.ts` files can then be executed with `tsx`.

```bash
npm install -g tsx
tsx p2pkh.ts
```

All `.js` files can be executed with `node`.

```bash
node p2pkh.js
```
