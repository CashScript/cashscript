---
title: Contract Instantiation
---

Before interacting with a smart contract on the BCH network, the CashScript SDK needs to instantiate a `Contract` object. This is done by providing the contract's information and constructor arguments. After this instantiation, the CashScript SDK can interact with the BCH contract.

:::info
CashScript offers a TypeScript SDK, which can also be used easily in vanilla JavaScript codebases.
Because of the separation of the compiler and the SDK, CashScript contracts can be integrated into other languages in the future.
:::

## Contract class
The `Contract` class is used to represent a CashScript contract in a JavaScript object. These objects can be used to retrieve information such as the contract's address and balance. They can also be used to interact with the contract by calling the contract's functions.

### Constructor
```ts
new Contract(
  artifact: Artifact,
  constructorArgs: ConstructorArgument[],
  options? : {
    provider: NetworkProvider,
    addressType: 'p2sh20' | 'p2sh32',
  }
)
```

A CashScript contract can be instantiated by providing an `Artifact` object, a list of constructor arguments, and optionally an options object configuring `NetworkProvider` and `addressType`.

An `Artifact` object is the result of compiling a CashScript contract. See the [Language Documentation](/docs/compiler/artifacts) for more information on Artifacts. Compilation can be done using the standalone [`cashc` CLI](/docs/compiler) or programmatically with the `cashc` NPM package (see [CashScript Compiler](/docs/compiler#javascript-compilation)).

The `NetworkProvider` option is used to manage network operations for the CashScript contract. By default, a mainnet `ElectrumNetworkProvider` is used, but the network providers can be configured. See the docs on [NetworkProvider](/docs/sdk/network-provider).

The `addressType` option is used to choose between a `p2sh20` and `p2sh32` address type for the CashScript contract. By default `p2sh32` is used because it has increased cryptographic security — but it is not yet supported by all wallets.

:::caution
p2sh32 was introduced because p2sh20 is cryptographically insecure for a large subset of smart contracts. For contracts holding large sums of BCH this provides an incentive to find a hash collision and hack the contract.
:::

#### Example
```ts
import { Contract, ElectrumNetworkProvider } from 'cashscript';
import { compileFile } from 'cashc';

// Import the artifact JSON
import P2PKH from './p2pkh.json';

// Or compile a contract file
const P2PKH = compileFile(new URL('p2pkh.cash', import.meta.url));

const provider = new ElectrumNetworkProvider('chipnet');
const addressType = 'p2sh20';
const contractArguments = [alicePkh]
const options = { provider, addressType}
const contract = new Contract(P2PKH, contractArguments, options);
```

### address
```ts
contract.address: string
```

A contract's regular address (without token-support) can be retrieved through the `address` member field.

:::note
Wallets will not allow you to send CashTokens to this address. For that you must use the [tokenAddress](#tokenaddress) below. Wallets which have not upgraded might not recognize this new address type.
:::

#### Example
```ts
console.log(contract.address)
```

### tokenAddress
```ts
contract.tokenAddress: string
```

A contract's token-supporting address can be retrieved through the `tokenAddress` member field.

#### Example
```ts
console.log(contract.tokenAddress)
```

### opcount
```ts
contract.opcount: number
```

The number of opcodes in the contract's bytecode can be retrieved through the `opcount` member field. This is useful to ensure that the contract is not too big, since Bitcoin Cash smart contracts can contain a maximum of 201 opcodes.

#### Example
```ts
assert(contract.opcount <= 201)
```

### bytesize
```ts
contract.bytesize: number
```

The size of the contract's bytecode in bytes can be retrieved through the `bytesize` member field. This is useful to ensure that the contract is not too big, since Bitcoin Cash smart contracts can be 520 bytes at most.

#### Example
```ts
console.log(contract.bytesize)
```

### bytecode
```ts
contract.bytecode: string
```

Returns the contract's redeem script encoded as a hex string.

#### Example
```ts
console.log(contract.bytecode)
```

### getBalance()
```ts
async contract.getBalance(): Promise<bigint>
```

Returns the total balance of the contract in satoshis. Both confirmed and unconfirmed balance is included in this figure.

#### Example
```ts
const contractBalance = await contract.getBalance()
```

### getUtxos()
```ts
async contract.getUtxos(): Promise<Utxo[]>
```

Returns all UTXOs that can be spent by the contract. Both confirmed and unconfirmed UTXOs are included.

```ts
interface Utxo {
  txid: string;
  vout: number;
  satoshis: bigint;
  token?: TokenDetails;
}
```

#### Example
```ts
const utxos = await contract.getUtxos()
```

### Contract functions
```ts
contract.functions.<functionName>(...args: FunctionArgument[]): Transaction
```

Once a smart contract has been instantiated, you can invoke a contract function to spend from the contract with the '[Simple transaction-builder](/docs/sdk/transactions)' by calling the function name under the `functions` member field of a contract object.
To call these functions successfully, the provided parameters must match the function signature defined in the CashScript code.

These contract functions return an incomplete `Transaction` object, which needs to be completed by providing outputs of the transaction. For more information see the [Simple transaction-builder](/docs/sdk/transactions) page.

#### Example
```ts
import { alice } from './somewhere';

const tx = await contract.functions
  .transfer(new SignatureTemplate(alice))
  .to('bitcoincash:qrhea03074073ff3zv9whh0nggxc7k03ssh8jv9mkx', 10000n)
  .send()
```

### Contract unlockers

```ts
contract.unlock.<functionName>(...args: FunctionArgument[]): Unlocker
```

Once a smart contract has been instantiated, you can invoke a contract function on a smart contract UTXO to use the '[Advanced transaction-builder](/docs/sdk/transactions-advanced)' by calling the function name under the `unlock` member field of a contract object.
To call these functions successfully, the provided parameters must match the function signature defined in the CashScript code.

These contract functions return an incomplete `transactionBuilder` object, which needs to be completed by providing outputs of the transaction. For more information see the [Advanced transaction-builder](/docs/sdk/transactions-advanced) page.

```ts
import { contract, transactionBuilder } from './somewhere.js';

const contractUtxos = await contract.getUtxos();

transactionBuilder.addInput(contractUtxos[0], contract.unlock.spend());
```

## SignatureTemplate
```ts
new SignatureTemplate(signer: Keypair | Uint8Array | string, hashtype?: HashType)
```

You may notice the `SignatureTemplate` object in the [example](#example-8) above. When a contract function has a `sig` parameter, it requires a cryptographic signature over the spending transaction. But to generate this signature, the transaction needs to be built first, which is not yet the case when a contract function is first called.

So in the place of a signature, a `SignatureTemplate` can be passed, which will automatically generate the correct signature using the `signer` parameter. This signer can be any representation of a private key, including [BCHJS' `ECPair`][ecpair], [bitcore-lib-cash' `PrivateKey`][privatekey], [WIF strings][wif], or raw private key buffers. This ensures that any BCH library can be used.

The default `hashtype` is `HashType.SIGHASH_ALL | HashType.SIGHASH_UTXOS` because this is the most secure option for smart contract use cases.

```ts
export enum HashType {
  SIGHASH_ALL = 0x01,
  SIGHASH_NONE = 0x02,
  SIGHASH_SINGLE = 0x03,
  SIGHASH_UTXOS = 0x20,
  SIGHASH_ANYONECANPAY = 0x80,
}
```

:::note
If you're using "old-style" covenants (using CashScript v0.6.0 or lower), you need to configure `HashType.SIGHASH_ALL` as the `hashtype` parameter for the SignatureTemplate.
:::

#### Example
```ts
const wif = 'L4vmKsStbQaCvaKPnCzdRArZgdAxTqVx8vjMGLW5nHtWdRguiRi1';
const sig = new SignatureTemplate(wif, HashType.SIGHASH_ALL | HashType.SIGHASH_UTXOS );
```

[wif]: https://en.bitcoin.it/wiki/Wallet_import_format
[ecpair]: https://bchjs.fullstack.cash/#api-ECPair
[privatekey]: https://github.com/bitpay/bitcore/blob/master/packages/bitcore-lib-cash/docs/privatekey.md
