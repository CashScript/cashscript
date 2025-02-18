---
title: Testing Setup
---

For the ease of development, CashScript has a `MockNetwork` environment where you can create virtual UTXOs. This has the advantages of not needing any testnet balances, not having to set up smart contract UTXOs and not having network latency. Because of this the MockNetwork environment is the ideal setup to run repeated automated tests with a testing framework for increased smart contract security.

:::tip
For a quick start with a CashScript testing setup, check out the [example testing-suite](https://github.com/CashScript/cashscript/tree/next/examples/testing-suite) that demonstrates a full development and testing environment for CashScript contracts, similar to Hardhat on Ethereum.
:::

## MockNetworkProvider

The `MockNetworkProvider` is a special network provider that allows you to evaluate transactions locally without interacting with the Bitcoin Cash network. This is useful when writing automated tests for your contracts, or when debugging your contract locally. To create a new virtual UTXO use `provider.addUtxo()`.

#### Example

```ts
import { MockNetworkProvider, randomUtxo, randomToken, randomNFT } from 'cashscript';

const provider = new MockNetworkProvider();
const contractUtxo = provider.addUtxo(contract.address, { vout: 0, txid: "ab...", satoshis: 10000n });

const aliceUtxo = provider.addUtxo(aliceAddress, randomUtxo({
  satoshis: 1000n,
  token: { ...randomNFT(), ...randomToken() },
}));
```

:::note
The `MockNetworkProvider` only evaluates the transactions locally, so any UTXOs added to a transaction still count as "unspent", even after mocking a `sendTransaction` using the provider.
:::

## Automated testing

To make writing automated tests for CashScript contracts easier, we provide a Jest extension that enables easy testing of `console.log` values and `require` error messages. To use the extension, you can import it from `cashscript/jest`.

```ts
import 'cashscript/jest';
```

:::note
If you're using a different testing framework, you can test for `console.log` values by spying on the console output, and test for `require` error messages by asserting that an error is thrown with a specific error message.
:::

With local transaction evaluation and debugging, it is possible to write efficient automated tests for CashScript contracts to test specific contract behaviour and check `console.log` values and `require` error messages.

### Logging values

You can log values during debug evaluation using the `console.log` statement. Any variables or primitive values (such as ints, strings, bytes, ...) can be logged.

:::note
Logging is only available in debug evaluation of a transaction. It has no impact on the compiled bytecode or regular (non-debug) execution.
:::

```ts
describe('Example contract', () => {
  it('should log the passed parameter', async () => {
    const contract = new Contract(artifact, [], { provider });
    const contractUtxo = provider.addUtxo(contract.address, randomUtxo());

    const transaction = new TransactionBuilder({ provider })
      .addInput(contractUtxo, contract.unlock.exampleFunction(1000n))
      .addOutput({ to: contract.address, amount: 10000n })
    await expect(transaction).toLog('passed parameter: 1000');
  });
});
```

### Error messages

The `require` statement accepts an optional error message as a second argument. If the condition in the require statement is not met during debug evaluation, the error message is returned. This allows you to write automated tests that check for specific error messages.

:::note
Similar to `console.log`, the error message in a `require` statement is only available in debug evaluation of a transaction, so the error message has no impact on the compiled bytecode or regular (non-debug) execution.
:::

```ts
describe('Example contract', () => {
  const contract = new Contract(artifact, [], { provider });
  const contractUtxo = provider.addUtxo(contract.address, randomUtxo());

  it('should fail require statement when incorrect parameter is passed', async () => {
    const transaction = new TransactionBuilder({ provider })
      .addInput(contractUtxo, contract.unlock.exampleFunction(999n))
      .addOutput({ to: contract.address, amount: 10000n })
    await expect(transaction).toFailRequireWith('passed parameter is not 1000');
  });

  it('should pass require statement when correct parameter is passed', async () => {
    const transaction = new TransactionBuilder({ provider })
      .addInput(contractUtxo, contract.unlock.exampleFunction(999n))
      .addOutput({ to: contract.address, amount: 10000n })
    await expect(transaction).not.toFailRequire();
  });
});
```

## Full Example

```solidity title="Example contract"
contract Example() {
  function exampleFunction(int value) {
    console.log("passed parameter:", value);
    require(value == 1000, "passed parameter is not 1000");
  }
}
```

```ts title="Example test file"
import artifact from '../artifacts/example.json' with { type: "json" };
import { Contract, MockNetworkProvider, randomUtxo } from 'cashscript';
import 'cashscript/jest';

describe('Example contract', () => {
  const provider = new MockNetworkProvider();
  const contract = new Contract(artifact, [], { provider });
  const contractUtxo = provider.addUtxo(contract.address, randomUtxo());

  it('should log the passed parameter', async () => {
    const contract = new Contract(artifact, [], { provider });
    const transaction = new TransactionBuilder({ provider })
      .addInput(contractUtxo, contract.unlock.exampleFunction(1000n))
      .addOutput({ to: contract.address, amount: 10000n })
    await expect(transaction).toLog('passed parameter: 1000');
  });

  it('should fail require statement when incorrect parameter is passed', async () => {
    const transaction = new TransactionBuilder({ provider })
      .addInput(contractUtxo, contract.unlock.exampleFunction(999n))
      .addOutput({ to: contract.address, amount: 10000n })
    await expect(transaction).toFailRequireWith('passed parameter is not 1000');
  });

  it('should pass require statement when correct parameter is passed', async () => {
    const transaction = new TransactionBuilder({ provider })
      .addInput(contractUtxo, contract.unlock.exampleFunction(1000n))
      .addOutput({ to: contract.address, amount: 10000n })
    await expect(transaction).not.toFailRequire();
  });
});

```
