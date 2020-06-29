---
title: Contract Instantiation
---

Before interacting with smart contracts, they need to be instantiated. By instantiating a smart contract you tell the JavaScript SDK which smart contract you want to interact with, what its constructor parameters are, and how to interact with the contract.

## Contract class
The `Contract` class is used to compile CashScript files from source or to import existing contracts from JSON Artifact files. Using these artifacts allows you to keep the compilation of your smart contracts separate from the rest of your application. See the [Language Documentation](/docs/language/artifacts) for more information on Artifacts.

### Contract.compile()
```ts
Contract.compile(fileOrString: string, network?: string): Contract
```

The first parameter `fileOrString` can be a filename, in which case it compiles a CashScript file found at this location. Alternatively the source code can be passed in as a string instead. Optionally you can specify a network string (`'testnet'` (default) or `'mainnet'`).

Returns a `Contract` object based on the CashScript code that can be used to instantiate new contracts.

:::caution
If you're using CashScript in a browser-based environment, you can **only** pass in the source code as a string. If you store your source code in a different file, you will have to read it first (e.g. with the [Fetch API][fetch-api]).
:::

#### Example
```ts
const HodlVault = Contract.compile('./hodl_vault.cash', 'testnet');
```

### Contract.import()
```ts
Contract.import(fileOrArtifact: string | Artifact, network?: string): Contract
```

The first parameter `fileOrArtifact` can be a filename, in which case it is used to import an Artifact JSON file at this location. Alternatively the artifact can be passed in as a JSON object instead. This can be useful if you're storing the artifact objects in a database such as MongoDB. Optionally you can specify a network string (`'testnet'` (default) or `'mainnet'`).

Returns a `Contract` object based on the CashScript code that can be used to instantiate new contracts.

:::caution
If you're using CashScript in a browser-based environment, you can **only** pass in the artifact JSON object directly. If you store your artifact file in a different file, you will have to read it first (e.g. with the [Fetch API][fetch-api]) or retrieve it from a database.
:::

#### Example
```ts
const TransferWithTimeout = Contract.import('./twt-artifact.json', 'mainnet');
```

### export()
```ts
contract.export(file?: string): Artifact
```

A `Contract` object can be exported to an Artifact so that it can be stored or transferred easily, and the contract does not need to be recompiled. A `file` parameter can be passed so that the exported artifact is stored at the given location. If it is omitted the artifact object is returned, but not stored.

:::warning
If a file already exists at the given path, **it is overwritten**.
:::

:::caution
If you are using CashScript in a browser-based environment, you cannot export to a file.
:::

#### Example
```ts
const artifact = HodlVault.export();
```

### new()
```ts
contract.new(...parameters: Parameter[]): Instance
```

After creating a `Contract` object through either compiling from source or importing from artifact, new instances of this contract can be created. This is done by calling the `new()` function with the corresponding constructor parameters as expected by the smart contract.

#### Example
```ts
import { alicePK, bobPK } from './somewhere';

const TransferWithTimeout = Contract.import('./twt-artifact.json', 'mainnet');
const instance = TransferWithTimeout.new(alicePK, bobPK, 1000000);
```

### deployed()
```ts
contract.deployed(address?: string): Instance
```

The artifact JSON file also keeps track of previous instantiations, so they can be accessed more easily. If an `address` string is passed in, the SDK will attempt to retrieve that instance if it exists. If the `address` string is omitted it will return the first one it finds.

:::warning
These deployed addresses are stored in your artifact JSON. So if you want to use the `deployed()` function, make sure that you store your artifacts somewhere (and export them after new instantiations).
:::

#### Example
```ts
const instance = TransferWithTimeout.deployed();
const instance = TransferWithTimeout.deployed(
    'bitcoincash:qrhea03074073ff3zv9whh0nggxc7k03ssh8jv9mkx'
);
```

## Instance class
After instantiating a new contract or retrieving deployed instances, a new `Instance` object is returned. These instances can then be interacted with by using the functions that were specified in the smart contract code.

### address
```ts
instance.address: string
```

An instance's address can be retrieved through the `address` member field.

#### Example
```ts
console.log(instance.address)
```

### opcount
```ts
instance.opcount: number
```

The number of opcodes in the instance's bytecode can be retrieved through the `opcount` member field. This is useful to ensure that the contract is not too big, since Bitcoin Cash smart contracts can contain a maximum of 201 opcodes.

#### Example
```ts
assert(instance.opcount <= 201)
```

### bytesize
```ts
instance.bytesize: number
```

The size of the instance's bytecode in bytes can be retrieved through the `bytesize` member field. This is useful to ensure that the contract is not too big, since Bitcoin Cash smart contracts can be 520 bytes at most.

:::note
When writing covenant contracts, the de facto limit is actually closer to 400 bytes due to technical factors.
:::

#### Example
```ts
console.log(instance.bytesize)
```

### getBalance()
```ts
async instance.getBalance(): Promise<number>
```

Returns the total balance of the contract in satoshis. Both confirmed and unconfirmed balance is included in this figure.

#### Example
```ts
const contractBalance = await instance.getBalance()
```

### GetUtxos()
```ts
async instance.getUtxos(excludeUnconfirmed?: boolean): Promise<Utxo[]>
```

Returns all UTXOs that can be spent by the contract. By default this includes both confirmed and unconfirmed UTXOs, but the unconfirmed UTXOs can be excluded by specifying the `excludeUnconfirmed` parameter.

#### Example
```ts
const utxos = await instance.getUtxos(true)
```

### Contract functions
```ts
instance.functions.<functionName>(...parameters: Parameter[]): Transaction
```

The main way to use smart contracts once they have been instantiated is through the functions defined in the CashScript source code. These functions can be found by their name under `functions` member field of an instance. To call these functions, the parameters need to match ones defined in the CashScript code.

These contract functions return an incomplete `Transaction` object, which needs to be completed by providing outputs of the transaction. More information about sending transactions is found on the [*Sending Transactions*](/docs/sdk/transactions) page.

#### Example
```ts
import { alice } from './somewhere';

const tx = await instance.functions
  .transfer(new SignatureTemplate(alice))
  .to('bitcoincash:qrhea03074073ff3zv9whh0nggxc7k03ssh8jv9mkx', 10000)
  .send()
```

#### Transaction signatures
```ts
new SignatureTemplate(keypair: ECPair, hashtype?: HashType)
```

You may notice the `SignatureTemplate` object in the example above. When a contract function has a `sig` parameter, it expects a digital signature over the spending transaction. But the details of this transaction are unknown when calling a contract function. This is why there is a placeholder `SignatureTemplate` class that is made up of a keypair and an optional `hashtype`. These placeholders are automatically replaced by the correct signature using the provided keypair.

:::caution
When calling a covenant function, the first `SignatureTemplate` parameter is used to generate the required sighash preimage. This is generally fine, but you should take extra care when using non-default hashtypes.
:::

#### Example
```ts
new SignatureTemplate(keypair, HashType.SIGHASH_ALL)
```

[fetch-api]: https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API
[meep]: https://github.com/gcash/meep
[bip68]: https://github.com/bitcoin/bips/blob/master/bip-0068.mediawiki
