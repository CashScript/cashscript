# The CashScript SDK
## Contract
The `Contract` class allows you to compile CashScript files into `Contract` objects, from which these contracts can be instantiated and interacted with. These `Contract` objects can also be imported from a JSON Artifact file, and exported to one, which allows you to store and transfer the contract definition in JSON format, so you don't need to recompile the contract every time you use it. For more information on Artifacts, see the [Language Documentation](/docs/language.md).

### Creating a Contract object
Before instantiating a contract, first you need to create a new `Contract` object. This can be done by compiling a CashScript file, or by importing an Artifact file that was exported previously.

##### `Contract.fromCashFile(fn: string, network?: string): Contract`
Compiles the CashScript file found at the path specified by argument `fn`. Optionally specify a network string (`'testnet'` or `'mainnet'`) to connect with. Returns a `Contract` object that can be further used to instantiate new instances of this contract.

```ts
const P2PKH: Contract = Contract.fromCashFile(path.join(__dirname, 'p2pkh.cash'), 'testnet');
```

##### `Contract.fromArtifact(fn: string, network?: string): Contract`
Imports an Artifact file that was compiled previously. This file is found at the path specified by argument `fn`. Optionally specify a network string (`'testnet'` or `'mainnet'`) to connect with. Returns a `Contract` object that can be further used to instantiate new instances of this contract.

```ts
const P2PKH: Contract = Contract.fromArtifact(path.join(__dirname, 'p2pkh.cash'), 'testnet');
```

### Exporting a contract
A `Contract` object can be exported to an Artifact file to be imported at a later moment, so it can be stored or transfered more easily, and can be used without recompilation. If the object is exported after one or more new contracts have been instantiated, their details will be stored in the file as well so they can be easily accessed later on.

##### `contract.export(fn: string): void`
Writes the contract's details to an Artifact file found at the location specified by argument `fn`, so it can be retrieved later. If the file does not exist yet, it is created. If the file already exists, **it is overwritten**.

```ts
P2PKH.export(path.join(__dirname, 'p2pkh.json'));
```

### Instantiating a contract
After creating a `Contract` object through compilation or import, this contract can be instantiated. If any contracts were instantiated before and this information was stored, these instances can also be accessed.

##### `contract.new(...parameters: Parameter[]): Instance`
This function is derived by looking at the contract parameters specified inside the contract's CashScript file, and to call it the parameters need to match those specified in contract code.

```ts
const instance: Instance = P2PKH.new(pkh);
```

##### `contract.deployed(at?: string): Instance`
Looks up the address specified by argument `at` and returns the instance that belongs to the address if it exists. If `at` is omitted it returns the first instance that it finds.

```ts
const instance: Instance = P2PKH.deployed();
const instance: Instance = P2PKH.deployed('bchtest:ppzllwzk775qk86zfskzyzae7pa9h4dvzcfezpsdkl');
```

## Instance
After instantiating a new contract or retrieving a previously deployed one, this instance can be interacted with using the functions implemented in the `.cash` file.

##### `instance.address`
An instance's address can be retrieved through the `address` member field.

```ts
console.log(instance.address);
```

##### `async instance.getBalance(): Promise<number>`
Returns the total balance of the contract in satoshis. This incudes confirmed and unconfirmed balance.

```ts
const contractBalance: number = await instance.getBalance();
```

##### `instance.functions.<functionName>(...parameters: Parameter[]): Transaction`
All contract functions defined in your CashScript file can be found by their name under the `functions` member field of an instance. To call them, the parameters need to match the ones defined in your CashScript file.

```ts
const tx = await instance.functions.spend(pk, new Sig(keypair, 0x01))
  .send(instance.address, 10000);
```

**A note on transaction signatures:**

Some cash contract functions require a signature parameter, which needs to be a valid transaction signature for the current transaction. The current transaction details are unknown at the time of calling a contract function. This is why we have a separate `Sig` class made up of a keypair and hashtype, that represents a placeholder for these signatures. These placeholders are automatically replaced by the correct signature during the transaction building phase.

##### `new Sig(keypair: ECPair, hashtype: number)`
Creates a placeholder for a transaction signature of the current transaction. During the transaction building phase this placeholder is replaced by the actual signature.

```ts
new Sig(keypair, 0x01);
```

## Transaction
Calling any of the contract functions on a contract instance results in a `Transaction` object, which can be sent by specifying a recipient and amount to send, or a list of these pairs. The `send` functiion calls can also be replaced by `meep` function calls to output the debug command to debug the transaction using [meep](https://github.com/gcash/meep).

##### `async transaction.send(to: string, amount: number): Promise<TxnDetailsResult>`
Sends a transaction for an amount denoted in satoshis by argument `amount` to an address specified by argument `to`. This sends the transaction to the `rest.bitcoin.com` servers to be included in the Bitcoin Cash blockchain. Returns the raw `TxnDetailsResult` object as returned by `rest.bitcoin.com`.

```ts
const tx = await instance.functions.spend(pk, new Sig(keypair, 0x01))
  .send(instance.address, 10000);
```

##### `async transaction.send({ to: string, amount: number }[]): Promise<TxnDetailsResult>`
Sends a transaction with multiple outputs to multiple address-amount pairs specified by the list of `{ to: string, amount: number }` objects. This sends the transaction to the `rest.bitcoin.com` servers to be included in the Bitcoin Cash blockchain. Returns the raw `TxnDetailsResult` object as returned by `rest.bitcoin.com`.

```ts
const tx = await instance.functions.spend(pk, new Sig(keypair, 0x01)).send([
  { to: instance.address, amount: 10000 },
  { to: instance.address, amount: 20000 },
]);
```

##### `async transaction.meep(to: string, amount: number): Promise<void>`
Prints the `meep` command that can be used to debug the transaction resulting from using the `send` function.

```ts
await instance.functions.spend(pk, new Sig(keypair, 0x01))
  .meep(instance.address, 10000);
```

##### `async transaction.meep({ to: string, amount: number }[]): Promise<void>`
Prints the `meep` command that can be used to debug the transaction resulting from using the `send` function.

```ts
await instance.functions.spend(pk, new Sig(keypair, 0x01)).meep([
  { to: instance.address, amount: 10000 },
  { to: instance.address, amount: 20000 },
]);
```

## Examples
For example real world uses of these functions and cash contracts check out the [examples folder](/examples/). This folder contains several example contracts as `.cash` files, and example SDK usage in the `.ts` files.
