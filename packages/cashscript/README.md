# CashScript

![Build Status](https://github.com/CashScript/cashscript/actions/workflows/github-actions.yml/badge.svg)
[![Coverage Status](https://img.shields.io/codecov/c/github/Bitcoin-com/cashscript.svg)](https://codecov.io/gh/Bitcoin-com/cashscript/)
[![NPM Version](https://img.shields.io/npm/v/cashscript.svg)](https://www.npmjs.com/package/cashscript)
[![NPM Monthly Downloads](https://img.shields.io/npm/dm/cashscript.svg)](https://www.npmjs.com/package/cashscript)
[![NPM License](https://img.shields.io/npm/l/cashscript.svg)](https://www.npmjs.com/package/cashscript)

CashScript is a high-level programming language for smart contracts on Bitcoin Cash. It offers a strong abstraction layer over Bitcoin Cash' native virtual machine, Bitcoin Script. Its syntax is based on Ethereum's smart contract language Solidity, but its functionality is very different since smart contracts on Bitcoin Cash differ greatly from smart contracts on Ethereum. For a detailed comparison of them, refer to the blog post [*Smart Contracts on Ethereum, Bitcoin and Bitcoin Cash*](https://kalis.me/smart-contracts-eth-btc-bch/).

See the [GitHub repository](https://github.com/Bitcoin-com/cashscript) and the [CashScript website](https://cashscript.org) for full documentation and usage examples.

## The CashScript Language
CashScript is a high-level language that allows you to write Bitcoin Cash smart contracts in a straightforward and familiar way. Its syntax is inspired by Ethereum's Solidity language, but its functionality is different since the underlying systems have very different fundamentals. See the [language documentation](https://cashscript.org/docs/language/) for a full reference of the language.

## The CashScript SDK
The main way to interact with CashScript contracts and integrate them into applications is using the CashScript SDK. This SDK allows you to import `.json` artifact files that were compiled using the `cashc` compiler and convert them to `Contract` objects. These objects are used to create new contract instances. These instances are used to interact with the contracts using the functions that were implemented in the `.cash` file. For more information on the CashScript SDK, refer to the [SDK documentation](https://cashscript.org/docs/sdk/).

### Installation
```bash
npm install cashscript
```

### Usage
```ts
import { Contract, ... } from 'cashscript';
```

Using the CashScript SDK, you can import contract artifact files, create new instances of these contracts, and interact with these instances:

```ts
...
  // Import the P2PKH artifact
  import P2PKH from './p2pkh-artifact.json' assert { type: 'json' };

  // Instantiate a network provider for CashScript's network operations
  const provider = new ElectrumNetworkProvider('mainnet');

  // Create a new P2PKH contract with constructor arguments: { pkh: pkh }
  const contract = new Contract(P2PKH, [pkh], provider);

  // Get contract balance & output address + balance
  console.log('contract address:', contract.address);
  console.log('contract balance:', await contract.getBalance());

  // Call the spend function with the owner's signature
  // And use it to send 0. 000 100 00 BCH back to the contract's address
  const txDetails = await contract.functions
    .spend(pk, new SignatureTemplate(keypair))
    .to(contract.address, 10000)
    .send();

  console.log(txDetails);
...
```
