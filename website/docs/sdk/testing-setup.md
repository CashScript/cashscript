---
title: Testing Setup
---

Because of deep integration with libauth, CashScript allows for local transaction evaluation without actual interaction with any Bitcoin Cash test network. With a MockNetwork environment you can create virtual UTXOs without doing additional preparations. This has the advantages of not needing any testnet balances, not having to set up smart contract UTXOs and not having network latency. This setup allows for using a testing framework to run repeated automated tests for increased smart contract security.

For a quick start with a CashScript testing setup, you can check out [our testing-suite example](https://github.com/CashScript/cashscript/tree/next/examples/testing-suite) that demonstrates a full development and testing environment for CashScript contracts, similar to Hardhat on Ethereum.

:::caution
The CashScript debugging tools only work with the [Simple Transaction Builder](/docs/sdk/transactions). We plan to extend the debugging tools to work with the [Advanced Transaction Builder](/docs/sdk/transactions-advanced) in the future.
:::

## MockNetworkProvider

The `MockNetworkProvider` is a special network provider that allows you to evaluate transactions locally without interacting with the Bitcoin Cash network. This is useful when writing automated tests for your contracts, or when debugging your contract locally. By default, it generates some random mock UTXOs for the contract address, but you can also add your own UTXOs to the provider.

```ts
import { MockNetworkProvider, randomUtxo, randomToken, randomNFT } from 'cashscript';

const provider = new MockNetworkProvider();
provider.addUtxo(contract.address, { vout: 0, txid: "ab...", satoshis: 10000n });

provider.addUtxo(aliceAddress, randomUtxo({
  satoshis: 1000n,
  token: { ...randomNFT(), ...randomToken() },
}));
```

:::note
The `MockNetworkProvider` only evaluates the transactions locally, so any UTXOs added to a transaction still count as "unspent", even after mocking a `sendTransaction` using the provider.
:::

## Jest extension

To make writing automated tests for CashScript contracts easier, we provide a Jest extension that enables easy testing of `console.log` values and `require` error messages. To use the extension, you can import it from `cashscript/dist/test/JestExtensions`.

:::tip
If you're using a different testing framework, you can test for `console.log` values by spying on the console output, and test for `require` error messages by asserting that an error is thrown with a specific error message.
:::

## Automated testing

With local transaction evaluation and debugging, it is possible to write efficient automated tests for CashScript contracts and test specific contract behaviour and check `console.log` values and `require` error messages.

### Logging values

You can log values during debug evaluation using the `console.log` statement. Any variables or primitive values (such as ints, strings, bytes, etc) can be logged.

:::note
Logging is only available in debug evaluation of a transaction, but has no impact on the compiled bytecode or regular (non-debug) execution.
:::

### Error messages

The `require` statement accepts an optional error message as a second argument. If the condition in the require statement is not met during debug evaluation, the error message is returned. This allows you to write automated tests that check for specific error messages.

:::note
Similar to `console.log`, the error message in a `require` statement is only available in debug evaluation of a transaction, so the error message has no impact on the compiled bytecode or regular (non-debug) execution.
:::

## Example

```solidity title="Example contract"
contract Example() {
  function exampleFunction(int value) {
    console.log(value, "test");
    require(value == 1, "Wrong value passed");
  }
}
```

```ts title="Example test file"
import artifact from '../artifacts/example.json' assert { type: "json" };
import { Contract, MockNetworkProvider, randomUtxo } from 'cashscript';
import 'cashscript/dist/test/JestExtensions';

const provider = new MockNetworkProvider();
const contract = new Contract(artifact, [], { provider });
provider.addUtxo(contract.address, randomUtxo());

let transaction = contract.functions.exampleFunction(0n).to(contract.address, 10000n);
await (expect(transaction)).toLog(/0 test/);
await (expect(transaction)).toFailRequireWith(/Wrong value passed/);

transaction = contract.functions.exampleFunction(1n).to(contract.address, 10000n);
await expect(transaction.send()).resolves.not.toThrow();
```
