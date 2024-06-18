---
title: Getting Started
---

## Try CashScript Online

To get started with writing CashScript smart contracts quickly, it is recommended to try out the [CashScript Playground](https://playground.cashscript.org/), a web application which lets you easily write and create contracts!

Here you will learn what a CashScript contract looks like through the `TransferWithTimeout` example contract. Then you can compile the contract and provide the contract arguments to create a smart contract address. To actually create the smart contract itself, you fund the address so that it has a UTXO on the contract address. After setting up the smart contract, you can try spending from the smart contract by invoking a contract function!

:::tip
The [CashScript Playground](https://playground.cashscript.org/) is a great way to get started without doing any JavaScript coding to set up wallets, fetch balances and invoke contract functions. This way you can focus on learning one thing at a time!
:::

## Creating a CashScript Smart Contract

With the CashScript playground there's a nice integrated editor to get started, as well as an integrated compiler to change your CashScript contract into a Contract `Artifact` behind the scenes. Now, to get started we will have to set up a CashScript editor — outside of the Playground — and learn how to work with the `cashc` compiler to create CashScript contract artifacts.

### Prerequisites

To write CashScript smart contracts locally you use a code editor. For the best developer experience, we recommend to use VS Code with the CashScript extension. This way it will automatically recognize `.cash` files and offer highlighting and autocompletion.

:::note prerequisties
- Basic familiarity with the command line
- Node.js installed
- A code editor (VS Code recommended)
:::

:::tip
To set up your CashScript developer environment, see the [Syntax Highlighting](/docs/guides/syntax-highlighting) guide.
:::

### Installing the CashScript compiler
The command line CashScript compiler `cashc` can be installed from NPM.

```bash
npm install -g cashc
```

### Writing your first smart contract

Open your code editor to start writing your first CashScript smart contract.
We can start from a basic `TransferWithTimeout` smart contract. Create a new file `TransferWithTimeout.cash`.

The `TransferWithTimeout` contract takes in 3 contract arguments and has 2 contract functions: `transfer` and `timeout`.

```solidity
pragma cashscript ^0.9.0;

contract TransferWithTimeout(pubkey sender, pubkey recipient, int timeout) {
    // Allow the recipient to claim their received money
    function transfer(sig recipientSig) {
        require(checkSig(recipientSig, recipient));
    }

    // Allow the sender to reclaim their sent money after the timeout is reached
    function timeout(sig senderSig) {
        require(checkSig(senderSig, sender));
        require(tx.time >= timeout);
    }
}
```

:::tip
There are some other examples available on the [Examples page](/docs/language/examples) that can be used to take inspiration from. Further examples of the JavaScript integration can be found on [GitHub](https://github.com/CashScript/cashscript/tree/master/examples).
:::

### Compiling your smart contract

The next step after writing your smart contract is using the command line compiler to create a contract artifact, so that it can be imported into the CashScript SDK.

```bash
cashc ./TransferWithTimeout.cash --output ./TransferWithTimeout.json
```

This will create an artifact file `TransferWithTimeout.json` from your CashScript file. It can be helpful to take a look at the generated artifact file to understand what the `cashc` compiler is generating.

## Creating a CashScript Transaction

After creating a contract artifact, we can now use the JavaScript SDK to initialise the smart contract and to invoke spending functions on the smart contract UTXOs. We'll continue with the `TransferWithTimeout` artifact generated in the previous steps.

### Installing the JavaScript SDK
The JavaScript SDK can be installed into your project with NPM. Note that CashScript is a [pure ESM package](https://gist.github.com/sindresorhus/a39789f98801d908bbc7ff3ecc99d99c).

```bash
npm install cashscript
```

### Initialising a Contract

Now to initialise a contract we will import the `ElectrumNetworkProvider` and `Contract` classes from the CashScript SDK. We also need to import the contract artifact. Lastly, we need public keys from a generated key-pair to use as arguments for contract initialisation.

```javascript
import { ElectrumNetworkProvider, Contract } from 'cashscript';
import artifact from './TransferWithTimeout.json';
import { alicePub, bobPub } from './keys.js';

// Initialise a network provider for network operations
const provider = new ElectrumNetworkProvider('chipnet');

// Instantiate a new TransferWithTimeout contract
const contractArguments = [alicePub, bobPub, 100000n];
const options = { provider };
const contract = new Contract(artifact, contractArguments, options);

// Get the contract address and info about its balance
console.log("Contract address: " + contract.address);
console.log("Contract balance: " + await contract.getBalance());
console.log("Contract UTXOs: " + await contract.getUtxos());
```

:::tip
For a code example of how to generate key-pairs with Libauth, see the [CashScript Examples' `common.ts`](https://github.com/CashScript/cashscript/blob/master/examples/common.ts) file where Alice and Bob's key-pairs are created.
:::

### Creating a Transaction

Lastly, to spend from the smart contract we've initialised, you need to make sure there is an actual contract balance on the smart contract address. In other words, we need to make sure there's at least one UTXO with the smart contract locking bytecode, so that we can spend from it!

```javascript
import { ElectrumNetworkProvider, Contract, SignatureTemplate } from 'cashscript';
import { alicePub, bobPriv, bobPub } from './keys.js';
import artifact from './TransferWithTimeout.json';

// Initialise a network provider for network operations
const provider = new ElectrumNetworkProvider('chipnet');

// Instantiate a new TransferWithTimeout contract
const contractArguments = [alicePub, bobPub, 100000n];
const options = { provider };
const contract = new Contract(artifact, contractArguments, options);

// Call the transfer function with Bob's signature
// i.e. Bob claims the money that Alice has sent him
const transferDetails = await contract.functions
  .transfer(new SignatureTemplate(bobPriv))
  .to('bitcoincash:qrhea03074073ff3zv9whh0nggxc7k03ssh8jv9mkx', 10000n)
  .send();

console.log(transferDetails);
```

Congrats 🎉! You've successfully created a transaction spending from a Bitcoin Cash smart contract! 
