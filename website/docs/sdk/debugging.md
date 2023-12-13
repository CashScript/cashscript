---
title: Debug tools
---

To speed up the contract development and ensure the contract quality and security, CashScript takes advantage of deep integration with libauth. It allows for local transacaction evaluation, without actual interaction with BitcoinCash network of nodes.

For a quick start, all beginners should check out the demo toolkit allowing to bootstrap the contract creation and debugging environment similar to `hardat` on Ethereum. See [`examples/testing-suite`](https://github.com/CashScript/cashscript/tree/master/examples/testing-suite) project path.

### MockNetworkProvider

`MockNetworkProvider` allows to set up the testing environment for the contract under test. It allows the developer to add inputs with well-defined parameters of an `Utxo` class, or randomized set of properties.

```ts
import { MockNetworkProvider, randomUtxo } from 'cashscript/dist/src';

const provider = new MockNetworkProvider();
provider.addUtxo(contract.address, { vout: 0, txid: "ab...", satoshis: 10000n });

provider.addUtxo(aliceAddress, randomUtxo({
  satoshis: 1000n,
  token: { ...randomNFT(), ...randomToken() },
}));
```

Note, that `MockNetworkProvider` does not evaluate the transactions, but blindly accept them to later report them back upon a user query. It does not "consume" the utxos upon transaction acceptance, developers should control utxo set themselves to ensure the proper behaviour.

### Transaction class extensions

If a CashScript transaction is being built and sent with `MockNetworkProvider` it will be evaluated with libauth and if it fails the evaluation the debug information about the failure reasons will be presented to the developer.

If it is sent with any other provider such as `ElectrumNetworkProvider` and the remote will reject failing transaction, the transaction will be evaluated in debug mode with libauth and information about the failure reasons will be presented to the developer.

If you wish to take advantage of the BitAuth IDE to debug your failing transaction in a visual way you can use `await transaction.bitauthUri()` helper function.

:::caution
It is unsafe to debug transactions on mainnet as private keys will be exposed to BitAuth IDE and transmitted over the network.
:::

### Jest testing extensions

Taking advantage of local transaction evaluation and debug source maps, it is possible to record some contract metadata such as `console.log` statements or debug messages attached to failing `require` statemets:

#### console.log

`console.log` is a special CashScript statement which allows to output some valuable information hinting at contract behaviour. Any primitive data type literals can be logged, such as integers, bools, strings, hex literals, byte types, including sigs, pubkeys, etc. In addition it supports logging the variable values.

:::tip
Logging is only available in debug evaluation of a transaction, it has no effect in production.
:::

#### require

`require` syntax got extended with optional debug messages which will appear upon debug evaluation of the transaction, when this require statement fails.

:::tip
`require` with custom error message is only available in debug evaluation of a transaction, it has no effect in production.
:::


### Example

Example contract:
```solidity
contract Example() {
  function test(int value) {
    console.log(value, "test");
    require(value == 1, "Wrong value passed");
  }
}
```

Example contract debug evaluation:
```ts
import artifact from '../artifacts/example.json' assert { type: "json" };
import { Contract, MockNetworkProvider, randomUtxo } from 'cashscript';
import 'cashscript/dist/test/JestExtensions';

const provider = new MockNetworkProvider();
const contract = new Contract(artifact, [], { provider });
provider.addUtxo(contract.address, randomUtxo());

let transaction = contract.functions.test(0n).to(contract.address, 10000n);
await (expect(transaction)).toLog(/0 test/);
await (expect(transaction)).toFailRequireWith(/Wrong value passed/);

transaction = contract.functions.test(1n).to(contract.address, 10000n);
await expect(transaction.send()).resolves.not.toThrow();
```
